import { AnalysisData } from '@src/bridge/messageTypes';
import { GameState } from '@src/content/types';
import { useEffect, useState } from 'react';

export interface BetResult {
  roundId: number;
  action: string;
  crashPoint: number;
  profit: number;
  balanceAfter: number;
  timestamp: string;
}

export interface BankrollStats {
  greens: number;
  reds: number;
  totalProfit: number;
}

// Deprecated function removed


// Rewriting for proper logic with a Ref to hold state between renders
import { useRef } from 'react';

export function useBankrollLogic(
    gameState: GameState, 
    analysis: AnalysisData,
    betConfig: { bet2x: number, bet10x: number } = { bet2x: 100.00, bet10x: 50.00 }
) {
    const [balance, setBalance] = useState(1000.00);
    const [history, setHistory] = useState<BetResult[]>([]);
    
    // We store the "Planned Bets" for the UPCOMING round here.
    // This is updated continuously by the analysis.
    const plannedBetsRef = useRef<{ 
        bet2x: { action: string, target: number, amount: number } | null,
        betPink: { action: string, target: number, amount: number } | null
    }>({ bet2x: null, betPink: null });
    
    // We track the timestamp of the last processed candle to avoid double-counting
    const lastProcessedTimeRef = useRef<number>(0);
    const isInitializedRef = useRef<boolean>(false);

    // CACHE: Stores the planned bets indexed by the 'basis' timestamp (the latest candle timestamp when the bet was made).
    // This robustness prevents the "Race Condition" where the Analysis updates to 'WAIT' (for the next round)
    // before the Bankroll has a chance to resolve the current round's bet.
    const betsCacheRef = useRef<Record<number, { bet2x: any, betPink: any }>>({});

    // 1. CONTINUOUSLY UPDATE PLANNED BETS BASED ON ANALYSIS
    useEffect(() => {
        // We need the timestamp of the "basis" candle (the one we are looking at to decide).
        // If history is empty, use 0.
        const currentBasisTimestamp = gameState.history.length > 0 ? gameState.history[0].timestamp : 0;
        
        const rec2x = analysis.recommendation2x || { action: 'WAIT' };
        const recPink = analysis.recommendationPink || { action: 'WAIT' };
        
        // Default to null (no bet)
        const newPlan = { bet2x: null, betPink: null } as any;

        if (rec2x.action === 'PLAY_2X') {
            newPlan.bet2x = { action: 'PLAY_2X', target: 2.00, amount: betConfig.bet2x };
        }
        
        if (recPink.action === 'PLAY_10X') {
            newPlan.betPink = { action: 'PLAY_10X', target: 10.00, amount: betConfig.bet10x };
        }

        // Only write to cache if we actually have a bet to place. 
        // If we are WAITING, we don't overwrite a potential existing PLAY for this timestamp 
        // (though usually analysis is stable).
        // actually if analysis flips PLAY -> WAIT -> PLAY for the same timestamp, we want the latest.
        // But if it flips PLAY -> WAIT, does it mean we cancel?
        // In Aviator, once you bet (which we simulate), you can't really cancel easily if the plane starts.
        // But here we are purely strategy-based. Let's assume the LATEST decision for a timestamp is the valid one.
        
        // FIX: Always update the cache. If we change mind to "WAIT" (null), we should removed the "PLAY".
        // This solves "Strategy said WAIT but Bankroll Played" bug.
        betsCacheRef.current[currentBasisTimestamp] = newPlan;
        
        // We also explicitly expose the current planned bet for the UI (optional, but good for debugging)
        plannedBetsRef.current = newPlan;
        
    }, [analysis, betConfig, gameState.history]);


    // 2. DETECT NEW ROUND (HISTORY UPDATE) AND RESOLVE
    useEffect(() => {
        const latestCandle = gameState.history[0];
        
        if (!latestCandle) return;

        // Initialization: Sync to current latest to ignore past history
        if (!isInitializedRef.current) {
            lastProcessedTimeRef.current = latestCandle.timestamp;
            isInitializedRef.current = true;
            return;
        }

        // Check if this is a NEW candle
        if (latestCandle.timestamp > lastProcessedTimeRef.current) {
            
            const crashValue = latestCandle.value;
            
            // RESOLUTION LOGIC:
            // The bet for this new candle would have been stored under the timestamp of the *previous* candle.
            // i.e., "I saw Candle A, so I bet on Candle B".
            // So we look for betsCache[Candle_A.timestamp].
            
            let betToResolve = { bet2x: null, betPink: null };
            
            // We need to find the previous candle. 
            // Since we just unshifted 'latestCandle' into history[0], the previous one is history[1].
            const previousCandle = gameState.history.length > 1 ? gameState.history[1] : null;

            if (previousCandle) {
                const cached = betsCacheRef.current[previousCandle.timestamp];
                if (cached) {
                    betToResolve = cached;
                    // Cleanup old cache to prevent memory leak
                    delete betsCacheRef.current[previousCandle.timestamp]; 
                }
            } else {
                // Should not happen if history is maintained correctly, but strictly:
                // If this is the *second* candle ever seen?
                // Fallback to plannedBetsRef if cache fails (legacy behavior)
                // betToResolve = plannedBetsRef.current;
            }

            // Clean older keys just in case
            const keys = Object.keys(betsCacheRef.current).map(Number);
            if (keys.length > 10) {
                keys.slice(0, keys.length - 10).forEach(k => delete betsCacheRef.current[k]);
            }

            console.log(`[Bankroll] 🎯 NEW ROUND DETECTED: ${crashValue}x. Resolving bets...`, betToResolve);

            const activeBets = [betToResolve.bet2x, betToResolve.betPink].filter(Boolean);

            if (activeBets.length > 0) {
                let totalRoundProfit = 0;
                const results: BetResult[] = [];

                activeBets.forEach((bet: any) => {
                    if (!bet) return;

                    const win = crashValue >= bet.target;
                    const profit = win ? (bet.amount * bet.target) - bet.amount : -bet.amount;
                    totalRoundProfit += profit;

                    results.push({
                        roundId: latestCandle.timestamp + Math.random(),
                        action: bet.action, // 'PLAY_2X' or 'PLAY_10X'
                        crashPoint: crashValue,
                        profit: parseFloat(profit.toFixed(2)),
                        balanceAfter: 0, 
                        timestamp: new Date().toLocaleTimeString()
                    });
                    
                    console.log(`   > Bet ${bet.action}: ${win ? 'WIN' : 'LOSS'} (${profit > 0 ? '+' : ''}${profit})`);
                });

                setBalance(prev => {
                    const next = parseFloat((prev + totalRoundProfit).toFixed(2));
                    results.forEach(r => r.balanceAfter = next);
                    return next;
                });

                setHistory(prev => [...results, ...prev].slice(0, 50)); 
            } else {
                 console.log(`   > No active bets for this round.`);
            }

            // Mark as processed
            lastProcessedTimeRef.current = latestCandle.timestamp;
        }
    }, [gameState.history]);

    // Helper to calculate granular stats
    const calculateStats = (filterAction: string) => {
        const relevantHistory = history.filter(h => h.action === filterAction);
        const attempts = relevantHistory.length;
        const wins = relevantHistory.filter(h => h.profit > 0).length;
        const profit = relevantHistory.reduce((acc, h) => acc + h.profit, 0);
        return {
            attempts,
            wins,
            losses: attempts - wins,
            profit: parseFloat(profit.toFixed(2)),
            winRate: attempts > 0 ? Math.round((wins / attempts) * 100) : 0
        };
    };

    const stats = {
        totalProfit: parseFloat(history.reduce((acc, h) => acc + h.profit, 0).toFixed(2)),
        stats2x: calculateStats('PLAY_2X'),
        statsPink: calculateStats('PLAY_10X')
    };

    return { balance, setBalance, history, stats };
}
