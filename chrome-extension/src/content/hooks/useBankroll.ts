import { AnalysisData } from '@src/bridge/messageTypes';
import { GameState } from '@src/content/types';
import { useEffect, useState } from 'react';
import { StrategyCore } from '../../shared/strategyCore'; // Fixed Import

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
    // Persistence Keys
    const BALANCE_KEY = 'aviator_analyzer_balance';
    const HISTORY_KEY = 'aviator_analyzer_history';

    const [balance, setBalance] = useState(1000.00); // Sempre inicia em 1000, sem persistência
    
    // NOVO: Garantir reset absoluto de TUDO exceto balanço no mount
    useEffect(() => {
        const sessionId = Math.random().toString(36).substring(7);
        console.log(`[Bankroll] 🚀 New Session ID: ${sessionId} (Resetting statistics)`);
        
        // Limpeza agressiva
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem('consecutive_losses');
        localStorage.removeItem(BALANCE_KEY); // NOVO: Limpar balance também
        sessionStorage.clear(); // Apenas por precaução extrema
        
        // Resetar histórico local também caso ele tenha sido preenchido indevidamente no init
        setHistory([]);
        setEmergencyBrake(false);
    }, []);

    const [history, setHistory] = useState<BetResult[]>([]);
    const [emergencyBrake, setEmergencyBrake] = useState(false);

    // AUTO-RESET: Se o jogo sumir (histórico vazio), limpamos a simulação para o próximo round
    useEffect(() => {
        if (gameState.history.length === 0 && history.length > 0) {
            console.log('[Bankroll] 🔰 No game detected. Resetting simulation history & balance.');
            setHistory([]);
            setBalance(1000.00); // FIX: Reset balance to 1000 on game reset
        }
    }, [gameState.history.length]);

    // Auto-save balance only
    useEffect(() => {
        localStorage.setItem(BALANCE_KEY, balance.toString());
    }, [balance]);

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
    // We store the last valid "PLAY" signal seen, regardless of timestamp sync.
    // KEY CHANGE: We store the TIMESTAMP of the candle that triggered the signal.
    const lastValidPinkRecRef = useRef<{ action: string, target: number, prediction?: number, phase?: any, triggerTimestamp: number } | null>(null);

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
            // --- EMERGENCY PROTECTIONS ---
            const losses = parseInt(localStorage.getItem('consecutive_losses') || '0');
            const totalProfit = history.reduce((acc, h) => acc + h.profit, 0);
            const isStopLoss = totalProfit <= -300; // Hardcoded safety check
            
            if (losses >= 3) {
                 console.warn('[Bankroll] Signal Blocked by Emergency Brake (3 reds)');
                 // DONT CLEAR REF! We want to know there WAS a signal but it was blocked.
            } else if (isStopLoss) {
                 console.warn('[Bankroll] Signal Blocked by Stop Loss');
            } else {
                const betData = { 
                    action: 'PLAY_10X', 
                    target: 10.00, 
                    amount: betConfig.bet10x,
                    prediction: analysis.prediction?.value,
                    phase: analysis.phase,
                    triggerTimestamp: currentBasisTimestamp // TIMESTAMP BINDING
                };
                newPlan.betPink = betData;
                
                // FORCE: Update the persistent reference "I want to play next round based on THIS candle"
                // capturing the intent even if cache key mismatches later
                if (!lastValidPinkRecRef.current || lastValidPinkRecRef.current.triggerTimestamp !== currentBasisTimestamp) {
                    console.log(`[Bankroll] 💡 SIGNAL REGISTERED for Trigger Candle TS: ${currentBasisTimestamp}`);
                    lastValidPinkRecRef.current = betData;
                }
            }
        } 
        // DO NOT CLEAR ON WAIT! 
        // If signal becomes WAIT, it means the *new* state doesn't have a signal.
        // It does NOT invalidate the signal generated by the *previous* state (triggerTimestamp).
        // Let the Resolve Logic consume/clear it.

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
            console.log('[Bankroll] 🔰 Initializing Session... Clearing old data.');
            lastProcessedTimeRef.current = latestCandle.timestamp;
            isInitializedRef.current = true;
            
            // Força a limpeza absoluta no primeiro sinal de vida do jogo
            setHistory([]);
            localStorage.removeItem(HISTORY_KEY);
            localStorage.removeItem('consecutive_losses');
            return;
        }

        // Check if this is a NEW candle
        if (latestCandle.timestamp > lastProcessedTimeRef.current) {
            
            console.log(`[Bankroll] 🆕 NEW ROUND DETECTED: ${latestCandle.value}x (TS: ${latestCandle.timestamp})`);
            
            const crashValue = latestCandle.value;
            
            // RESOLUTION LOGIC:
            // i.e., "I saw Candle A, so I bet on Candle B".
            // So we look for betsCache[Candle_A.timestamp].
            
            let betToResolve: { bet2x: any, betPink: any } = { bet2x: null, betPink: null }; // Fixed Type
            
            // We need to find the previous candle. 
            // Since we just unshifted 'latestCandle' into history[0], the previous one is history[1].
            const previousCandle = gameState.history.length > 1 ? gameState.history[1] : null;

            if (previousCandle) {
                console.log(`[Bankroll] 🔍 Resolving Bet for Trigger: ${previousCandle.value}x (TS: ${previousCandle.timestamp})`);
                
                const cached = betsCacheRef.current[previousCandle.timestamp];
                if (cached) {
                    betToResolve = cached;
                    // Cleanup old cache to prevent memory leak
                    delete betsCacheRef.current[previousCandle.timestamp]; 
                } else {
                    // FALLBACK 1: FORCE PLAY FROM UI SIGNAL (The "Eye Witness" Check)
                    // If the UI was showing "PLAY" (stored in lastValidPinkRecRef) FOR THIS TRIGGER TIMESTAMP
                    const forcedSignal = lastValidPinkRecRef.current;
                    
                    if (forcedSignal && Math.abs(forcedSignal.triggerTimestamp - previousCandle.timestamp) < 100) { // fuzzy match 100ms
                        betToResolve.betPink = forcedSignal;
                        console.warn(`[Bankroll] ⚡ FORCE RESOLVE: Used UI Signal for Trigger TS ${previousCandle.timestamp}`);
                        // Reset the signal as we just used it
                        lastValidPinkRecRef.current = null;
                    } 
                    else {
                        if (forcedSignal) {
                             console.warn(`[Bankroll] ❌ MISSED SIGNAL MATCH: Stored TS ${forcedSignal.triggerTimestamp} vs Needed ${previousCandle.timestamp}`);
                        }
                        
                        // FALLBACK 2: CHECK OLDER CACHE (Safety Net)
                        const checkBack = gameState.history.slice(1, 4); 
                        for (const pastCandle of checkBack) {
                            if (betsCacheRef.current[pastCandle.timestamp]) {
                                 betToResolve = betsCacheRef.current[pastCandle.timestamp];
                                 console.warn(`[Bankroll] ⚠️ Recovered bet from DEEP CACHE for candle ${pastCandle.value}x`);
                                 delete betsCacheRef.current[pastCandle.timestamp];
                                 break;
                            }
                        }

                        // FALLBACK 3: PERFECT SIMULATION (Last Resort)
                        if (!betToResolve.betPink && !betToResolve.bet2x) {
                            const historicView = gameState.history.slice(1).map(c => c.value);
                            if (historicView.length >= 5) {
                                const reAnalysis = StrategyCore.analyze(historicView);
                                if (reAnalysis.recommendationPink.action === 'PLAY_10X') {
                                     const losses = parseInt(localStorage.getItem('consecutive_losses') || '0');
                                     if (losses < 3) {
                                         betToResolve.betPink = {
                                            action: 'PLAY_10X',
                                            target: 10.00,
                                            amount: betConfig.bet10x,
                                            prediction: reAnalysis.prediction?.value,
                                            phase: reAnalysis.phase
                                         };
                                         console.warn(`[Bankroll] ⚠️ Cache Miss! RECOVERED bet via Perfect Simulation for candle ${previousCandle.value}x`);
                                     }
                                }
                            }
                        }
                    }
                }
            } else {
                 console.warn('[Bankroll] No previous candle found to resolve against?');
            }

            // Clean older keys just in case
            const keys = Object.keys(betsCacheRef.current).map(Number);
            if (keys.length > 10) {
                keys.slice(0, keys.length - 10).forEach(k => delete betsCacheRef.current[k]);
            }

            if (betToResolve.betPink || betToResolve.bet2x) {
                 console.log(`[Bankroll] 🎲 Resolving Round: ${crashValue}x`);
            }

            const activeBets = [betToResolve.bet2x, betToResolve.betPink].filter(Boolean);

            if (activeBets.length > 0) {
                let totalRoundProfit = 0;
                const results: BetResult[] = [];
                let hasLossThisRound = false;

                activeBets.forEach((bet: any) => {
                    if (!bet) return;

                    const win = crashValue >= bet.target;
                    const profit = win ? (bet.amount * bet.target) - bet.amount : -bet.amount;
                    totalRoundProfit += profit;
                    
                    if (!win) hasLossThisRound = true;

                    results.push({
                        roundId: latestCandle.timestamp + Math.random(),
                        action: bet.action, // 'PLAY_2X' or 'PLAY_10X'
                        crashPoint: crashValue,
                        profit: parseFloat(profit.toFixed(2)),
                        balanceAfter: 0, 
                        timestamp: new Date().toLocaleTimeString(),
                        prediction: bet.prediction,
                        phase: bet.phase
                    });
                    
                    console.log(`   > ${win ? '🟢 WIN ' : '🔴 LOSS'} ${bet.action} | Profit: ${profit > 0 ? '+' : ''}${profit.toFixed(2)}`);
                });

                setBalance(prev => {
                    const next = parseFloat((prev + totalRoundProfit).toFixed(2));
                    results.forEach(r => r.balanceAfter = next);
                    return next;
                });

                setHistory(prev => [...results, ...prev].slice(0, 50)); 
                
                // Track Consecutive Losses for Emergency Brake
                if (hasLossThisRound) {
                    const savedLosses = parseInt(localStorage.getItem('consecutive_losses') || '0');
                    const newLosses = savedLosses + 1;
                    localStorage.setItem('consecutive_losses', newLosses.toString());
                    
                    if (newLosses >= 3) {
                        console.warn('[Bankroll] 🛑 EMERGENCY BRAKE: 3 consecutive losses! Stopping...');
                    }
                } else {
                    // Reset on any win
                    localStorage.setItem('consecutive_losses', '0');
                }
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

    const clearSession = () => {
        console.log('[Bankroll] 🧹 Manual Session Clear');
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem('consecutive_losses');
    };

    return { balance, setBalance, history, stats, clearSession };
}
