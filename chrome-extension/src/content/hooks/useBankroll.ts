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
  prediction?: number;
  phase?: string;
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
    // PERSISTENCE LOGIC (Smart Session)
    // We want to persist across tab switches (component unmount)
    // BUT reset on actual page reloads or new sessions (F5).
    
    // Key used to track if this tab instance is "fresh" or "resuming"
    const SESSION_ACTIVE_KEY = 'aviator_analyzer_session_active';
    const BALANCE_KEY = 'aviator_analyzer_balance';
    const HISTORY_KEY = 'aviator_analyzer_history';

    // 1. INITIALIZE STATE (Lazy Init)
    const [balance, setBalance] = useState(() => {
        const saved = localStorage.getItem(BALANCE_KEY);
        // Only restore if session is active, otherwise default 1000
        return (saved && sessionStorage.getItem(SESSION_ACTIVE_KEY)) ? parseFloat(saved) : 1000.00;
    });

    const [history, setHistory] = useState<BetResult[]>(() => {
        const saved = localStorage.getItem(HISTORY_KEY);
        return (saved && sessionStorage.getItem(SESSION_ACTIVE_KEY)) ? JSON.parse(saved) : [];
    });

    const [emergencyBrake, setEmergencyBrake] = useState(false);
    
    // 2. SESSION LIFECYCLE MANAGEMENT
    useEffect(() => {
        // Check if this is a "continue" or "start"
        const isContinuing = sessionStorage.getItem(SESSION_ACTIVE_KEY);

        if (!isContinuing) {
            console.log('[Bankroll] 🚀 New Session Started (Cleaning old data)');
            // Fresh Start: Clear Storage
            localStorage.removeItem(HISTORY_KEY);
            localStorage.removeItem(BALANCE_KEY);
            localStorage.removeItem('consecutive_losses');
            
            // Mark session as active for future tab switches
            sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
            
            setHistory([]);
            setBalance(1000.00);
            setEmergencyBrake(false);
        } else {
             console.log('[Bankroll] 🔄 Resuming Session (Restoring from Storage)');
        }
    }, []);

    // 3. PERSIST ON CHANGE
    useEffect(() => {
        localStorage.setItem(BALANCE_KEY, balance.toString());
    }, [balance]);

    useEffect(() => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }, [history]);


    // 4. AUTO-RESET (Only if game truly disappears for long, optional)
    /* 
       REMOVED: This was causing issues on tab switch where `gameState` comes empty initially.
       We will trust the user to manually reset if needed, or rely on the logic above.
    */

    // Monitor Brake (Reset logic handled in resolveRound)
    useEffect(() => {
        const losses = parseInt(localStorage.getItem('consecutive_losses') || '0');
        setEmergencyBrake(losses >= 3);
    }, [history]);
    
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

    // 3. PERSISTENT STATE TRACKING (To fix Race Conditions/Missed Bets)
    // Simplified: Just use the current recommendation.
    // The complex cache logic was causing crashes/freezes.
    
    // 1. UPDATE PLANNED BETS DIRECTLY FROM ANALYSIS
    useEffect(() => {
        const rec2x = analysis.recommendation2x || { action: 'WAIT' };
        const recPink = analysis.recommendationPink || { action: 'WAIT' };
        
        const newPlan = { bet2x: null, betPink: null } as any;

        if (rec2x.action === 'PLAY_2X') {
            newPlan.bet2x = { action: 'PLAY_2X', target: 2.00, amount: betConfig.bet2x };
        }
        
        if (recPink.action === 'PLAY_10X') {
            const losses = parseInt(localStorage.getItem('consecutive_losses') || '0');
            const totalProfit = history.reduce((acc, h) => acc + h.profit, 0);
            
            if (losses < 3 && totalProfit > -300) {
                 newPlan.betPink = { 
                    action: 'PLAY_10X', 
                    target: 10.00, 
                    amount: betConfig.bet10x,
                    prediction: analysis.prediction?.value,
                    phase: analysis.phase,
                };
            }
        }
        
        plannedBetsRef.current = newPlan;
    }, [analysis, betConfig, history]); // history added for profit check


    // 2. DETECT NEW ROUND AND RESOLVE
    useEffect(() => {
        const latestCandle = gameState.history[0];
        if (!latestCandle) return;

        // Initialization
        if (!isInitializedRef.current) {
            console.log('[Bankroll] 🔰 Initializing Session... Clearing old data.');
            lastProcessedTimeRef.current = latestCandle.timestamp;
            isInitializedRef.current = true;
            setHistory([]); 
            return;
        }

        // New Candle Logic
        if (latestCandle.timestamp > lastProcessedTimeRef.current) {
            const crashValue = latestCandle.value;
            console.log(`[Bankroll] 🆕 NEW ROUND: ${crashValue}x`);
            
            // RESOLUTION: Use the Plan that was active BEFORE this candle appeared.
            // In this simplified version, we just check what the logic says NOW (simulated delay).
            // Ideally we need what was planned 'during the previous flight'.
            // But for now, let's rely on the Analysis 'WAIT' state updating *after* the candle lands?
            // Actually, Analysis usually updates instantly.
            // This is why we needed the cache. 
            // BUT: If the cache crashes, nothing works.
            // Hybrid Fix: Store the "bet intent" when triggered and consume it here.
            
            const planned = plannedBetsRef.current;
            const activeBets = [planned.bet2x, planned.betPink].filter(Boolean);

            if (activeBets.length > 0) {
                let totalRoundProfit = 0;
                const results: BetResult[] = [];
                let hasLossThisRound = false;

                activeBets.forEach((bet: any) => {
                     // Check if this bet was meant for THIS round?
                     // In V8 logic, we bet "on the next round".
                     const win = crashValue >= bet.target;
                     const profit = win ? (bet.amount * bet.target) - bet.amount : -bet.amount;
                     totalRoundProfit += profit;
                     if (!win) hasLossThisRound = true;

                     results.push({
                        roundId: latestCandle.timestamp + Math.random(),
                        action: bet.action,
                        crashPoint: crashValue,
                        profit: parseFloat(profit.toFixed(2)),
                        balanceAfter: 0, 
                        timestamp: new Date().toLocaleTimeString(),
                        prediction: bet.prediction,
                        phase: bet.phase
                    });
                });

                setBalance(prev => {
                    const next = parseFloat((prev + totalRoundProfit).toFixed(2));
                    results.forEach(r => r.balanceAfter = next);
                    return next;
                });
                
                setHistory(prev => [...results, ...prev].slice(0, 50));

                if (hasLossThisRound) {
                     const newLosses = parseInt(localStorage.getItem('consecutive_losses') || '0') + 1;
                     localStorage.setItem('consecutive_losses', newLosses.toString());
                } else {
                     localStorage.setItem('consecutive_losses', '0');
                }
            }
            
            lastProcessedTimeRef.current = latestCandle.timestamp;
        }
    }, [gameState.history]); // Removed other deps to avoid loops

    // Helper to calculate stats
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

    const clearSession = () => {
        console.log('[Bankroll] 🧹 Manual Session Clear');
        setHistory([]);
    };

    return { balance, setBalance, history, stats, clearSession };
}
