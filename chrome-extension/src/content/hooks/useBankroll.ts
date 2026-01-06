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
    betConfig: { bet2x: number, bet10x: number } = { bet2x: 100.00, bet10x: 50.00 },
    initialBalance: number = 3000.00
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
        // Only restore if session is active, otherwise default initialBalance
        return (saved && sessionStorage.getItem(SESSION_ACTIVE_KEY)) ? parseFloat(saved) : initialBalance;
    });

    const [history, setHistory] = useState<BetResult[]>(() => {
        const saved = localStorage.getItem(HISTORY_KEY);
        return (saved && sessionStorage.getItem(SESSION_ACTIVE_KEY)) ? JSON.parse(saved) : [];
    });

    const [emergencyBrake, setEmergencyBrake] = useState(false);
    
    // 2. SESSION LIFECYCLE MANAGEMENT
    useEffect(() => {
        // Detect F5/Reload vs Tab Switch
        const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const isReload = navEntry && navEntry.type === 'reload';
        
        // Check if this is a "continue"
        const isContinuing = sessionStorage.getItem(SESSION_ACTIVE_KEY);

        if (!isContinuing || isReload) {
            console.log(isReload ? '[Bankroll] 🔄 Page Reload Detected (F5). Wiping Session.' : '[Bankroll] 🚀 New Session Started.');
            
            // Fresh Start: Clear Storage
            localStorage.removeItem(HISTORY_KEY);
            localStorage.removeItem(BALANCE_KEY);
            localStorage.removeItem('consecutive_losses');
            
            // Mark session as active for future tab switches
            sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
            
            setHistory([]);
            setBalance(initialBalance); // User reset request
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
        bet2x: { action: string, target: number, amount: number, prediction?: number, phase?: string } | null,
        betPink: { action: string, target: number, amount: number, prediction?: number, phase?: string } | null,
        createdAt?: number;
    }>({ bet2x: null, betPink: null, createdAt: 0 });
    
    // We track the timestamp of the last processed candle to avoid double-counting
    const lastProcessedTimeRef = useRef<number>(0);
    const isInitializedRef = useRef<boolean>(false);
    const startupGraceRef = useRef<boolean>(true); // NEW: Prevent phantom bets on start

    // Reset grace period after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            startupGraceRef.current = false;
            console.log('[Bankroll] 🛡️ Startup Grace Period ended.');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // CACHE: Stores the planned bets indexed by the 'basis' timestamp (the latest candle timestamp when the bet was made).
    // This robustness prevents the "Race Condition" where the Analysis updates to 'WAIT' (for the next round)
    // before the Bankroll has a chance to resolve the current round's bet.
    const betsCacheRef = useRef<Record<number, { bet2x: any, betPink: any }>>({});

    // 3. PERSISTENT STATE TRACKING (To fix Race Conditions/Missed Bets)
    // Simplified: Just use the current recommendation.
    // The complex cache logic was causing crashes/freezes.
    
    // 4. PERSISTENT STATE TRACKING (Race Condition Fix verified)
    // PROBLEM: When a new candle arrives, Analysis might update to 'WAIT' (for next round)
    // BEFORE this hook processes the result. This overwrites the 'PLAY' signal.
    // SOLUTION: "Latch" the bet. Once set to PLAY, it stays PLAY until we resolve it.
    
    // 1. UPDATE PLANNED BETS (LATCH PATTERN)
    useEffect(() => {
        // SAFETY: If we are in Cool Down (Emergency Brake), we ignore all signals.
        // The release logic happens in the OTHER useEffect (Round Resolution).
        // This prevents "Phantom Bets" from being queued while we are technically paused.
        if (emergencyBrake || !isInitializedRef.current || startupGraceRef.current) {
             return; 
        }

        const rec2x = analysis.recommendation2x || { action: 'WAIT' };
        const recPink = analysis.recommendationPink || { action: 'WAIT' };
        
        // We do NOT reset to null here. We only WRITE if it's a PLAY signal.
        // Clearing happens ONLY after resolution (in the other useEffect).
        
        if (rec2x.action === 'PLAY_2X') {
            plannedBetsRef.current.bet2x = { 
                action: 'PLAY_2X', 
                target: 2.00, 
                amount: betConfig.bet2x 
            };
            plannedBetsRef.current.createdAt = Date.now();
        }
        
         if (recPink.action === 'PLAY_10X') {
             const losses = parseInt(localStorage.getItem('consecutive_losses') || '0');
             const totalProfit = history.reduce((acc, h) => acc + h.profit, 0);
             
             // Re-evaluating safeguards here to be sure
             if (losses < 3 && totalProfit > -300) {
                  const absStake = (analysis as any).absStake !== undefined ? (analysis as any).absStake : 1.0;
                  plannedBetsRef.current.betPink = { 
                     action: 'PLAY_10X', 
                     target: 10.00, 
                     amount: betConfig.bet10x * absStake,
                     prediction: (analysis as any).prediction?.value,
                     phase: (analysis as any).phase,
                 };
                 plannedBetsRef.current.createdAt = Date.now();
             }
         }
        
        // Note: If analysis says WAIT, we do NOTHING. We keep the "armed" bet 
        // until the round actually happens.
        
    }, [analysis, betConfig, history, emergencyBrake]);


    // 2. DETECT NEW ROUND AND RESOLVE
    useEffect(() => {
        const latestCandle = gameState.history[0];
        if (!latestCandle) return;

        // Initialization
        // Initialization
        if (!isInitializedRef.current) {
            // Check if we restored history from storage
            if (history.length > 0) {
                 console.log('[Bankroll] 🔄 Restored Session: Syncing simulation clock.');
            } else {
                 console.log('[Bankroll] 🔰 New/Empty Session: Setting verified start point.');
                 setHistory([]); 
            }
            
            lastProcessedTimeRef.current = latestCandle.timestamp;
            isInitializedRef.current = true;
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
            
            // SMART COOL DOWN RELEASE LOGIC (V9.5)
            // Se estamos em Cool Down (Geladeira), ignoramos tudo até o mercado provar força com uma Rosa.
            const currentLosses = parseInt(localStorage.getItem('consecutive_losses') || '0');
            const isCoolDown = currentLosses >= 3;

            if (isCoolDown) {
                 // Sair da Geladeira? (Apenas Rosa >= 10.0x libera)
                 if (crashValue >= 10.0) {
                     console.log(`[Bankroll] 🌸 SMART COOL DOWN RELEASE: Rosa ${crashValue}x detectada. Retomando operações.`);
                     localStorage.setItem('consecutive_losses', '0');
                     setEmergencyBrake(false); 
                 } else {
                     console.log(`[Bankroll] ❄️ Cool Down Soberano: Em pausa até sair uma Rosa. Última vela: ${crashValue}x`);
                 }
                 // Quando em Cool Down, BLOQUEAMOS o processamento de qualquer aposta que pudesse estar latente.
                 plannedBetsRef.current = { bet2x: null, betPink: null, createdAt: 0 };
            } 
            else {
                // RESOLUÇÃO DE APOSTAS NORMAL
                const planned = plannedBetsRef.current;
                
                // STALE CHECK: Se o plano foi feito há mais de 400 segundos (uma rodada muito longa ou desconexão), ignorar.
                // A maioria das rodadas dura < 60s. 400s cobre até velas de 4000x, mas evita "time travel" de horas atrás.
                // Mas atenção: Se o jogo ficou parado, o Date.now avançou.
                const isStale = (Date.now() - (planned.createdAt || 0)) > 400000;
                
                if (isStale && (planned.bet2x || planned.betPink)) {
                    console.warn('[Bankroll] ⚠️ Stale Bet Plan Discarded (Expired). Created > 400s ago.');
                }
                
                const activeBets = !isStale ? [planned.bet2x, planned.betPink].filter(Boolean) : [];

                if (activeBets.length > 0) {
                    let totalRoundProfit = 0;
                    const results: BetResult[] = [];
                    let hasLossThisRound = false;

                    activeBets.forEach((bet: any) => {
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

                    // Atualizar consecutivas: Se deu RED em qualquer aposta, incrementa. Se deu WIN total, reseta.
                    if (hasLossThisRound) {
                         const newLosses = parseInt(localStorage.getItem('consecutive_losses') || '0') + 1;
                         localStorage.setItem('consecutive_losses', newLosses.toString());
                    } else {
                         localStorage.setItem('consecutive_losses', '0');
                    }
                }
            }
            
            // CRITICAL: Clear the latch after resolution
            plannedBetsRef.current = { bet2x: null, betPink: null, createdAt: 0 };
            
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

    return { balance, setBalance, history, stats, clearSession, isCoolDown: emergencyBrake };
}
