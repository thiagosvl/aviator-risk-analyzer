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
    // Initialize with 0, but we will sync it to the current latest on first effect run.
    const lastProcessedTimeRef = useRef<number>(0);
    const isInitializedRef = useRef<boolean>(false);

    // 1. CONTINUOUSLY UPDATE PLANNED BETS BASED ON ANALYSIS
    useEffect(() => {
        const rec2x = analysis.recommendation2x || { action: 'WAIT' };
        const recPink = analysis.recommendationPink || { action: 'WAIT' };
        
        const newPlan = { bet2x: null, betPink: null } as any;

        if (rec2x.action === 'PLAY_2X') {
            newPlan.bet2x = { action: 'PLAY_2X', target: 2.00, amount: betConfig.bet2x };
        }
        
        if (recPink.action === 'PLAY_10X') {
            newPlan.betPink = { action: 'PLAY_10X', target: 10.00, amount: betConfig.bet10x };
        }

        plannedBetsRef.current = newPlan;
    }, [analysis, betConfig]);


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
            const bets = plannedBetsRef.current;
            
            console.log(`[Bankroll] 🎯 NEW ROUND DETECTED: ${crashValue}x. Resolving bets...`, bets);

            const activeBets = [bets.bet2x, bets.betPink].filter(Boolean);

            if (activeBets.length > 0) {
                let totalRoundProfit = 0;
                const results: BetResult[] = [];

                activeBets.forEach((bet) => {
                    if (!bet) return;

                    const win = crashValue >= bet.target;
                    const profit = win ? (bet.amount * bet.target) - bet.amount : -bet.amount;
                    totalRoundProfit += profit;

                    results.push({
                        roundId: latestCandle.timestamp + Math.random(),
                        action: bet.action,
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

    const stats: BankrollStats = {
        greens: history.filter(h => h.profit > 0).length,
        reds: history.filter(h => h.profit < 0).length,
        totalProfit: parseFloat(history.reduce((acc, h) => acc + h.profit, 0).toFixed(2))
    };

    return { balance, setBalance, history, stats };
}
