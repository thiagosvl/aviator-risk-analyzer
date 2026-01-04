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

export function useBankroll(gameState: GameState, analysis: AnalysisData) {
  const [balance, setBalance] = useState(100.00); // Default start
  const [betHistory, setBetHistory] = useState<BetResult[]>([]);
  const [currentBet, setCurrentBet] = useState<{ action: string, target: number } | null>(null);
  const [lastProcessedCrash, setLastProcessedCrash] = useState<number | null>(null);

  // Stats
  const stats: BankrollStats = {
    greens: betHistory.filter(b => b.profit > 0).length,
    reds: betHistory.filter(b => b.profit < 0).length,
    totalProfit: betHistory.reduce((acc, b) => acc + b.profit, 0)
  };

  useEffect(() => {
    // 1. Detect Start of Round (Waiting -> Flying)
    // Actually, checking "recommendation" during 'Waiting' is safer.
    // If we are 'Waiting' and recommendation is PLAY, we prepare the bet.
    
    if (!gameState.isFlying && analysis.recommendation.action.includes('PLAY')) {
        const target = analysis.recommendation.action === 'PLAY_10X' ? 10.0 : 2.0;
        // Don't set state in a loop, but we can store "Intention"
        // Better: When Flying Starts, if we had an intention, we lock it.
    }

    // Simplified Logic: Monitor transitions
    // We rely on "gameState.isFlying" changing from true to false to resolve.
    // But we need to know what the recommendation WAS when the flight started.
    // This is tricky with React checks.
    
    // Alternative: Just check if we processed this specific history item (latest crash)
    const latestCrash = gameState.history[0];
    if (!latestCrash) return;

    // If this is a new crash we haven't processed
    if (latestCrash.timestamp !== lastProcessedCrash) {
        // Resolve logic
        // We look at the recommendation *right now*? No, that's for next round.
        // We should have saved the recommendation from BEFORE the crash.
        // But since this is a simple simulator, let's assume the user followed the LAST VALID recommendation they saw.
        
        // However, technically, when crash happens, the 'analysis' might already be updating for the next round? 
        // No, analysis runs on 'gameState'. If gameState just updated with new crash, analysis analyzes that crash for the NEXT prediction.
        
        // This means we lost the "Previous Prediction". 
        // We need a ref to store "Pending Bet".
    }
  }, [gameState.lastCrash]); // Trigger only on new crash?? No, trigger on flying change.

  return {
    balance,
    setBalance,
    history: betHistory,
    stats
  };
}

// Rewriting for proper logic with a Ref to hold state between renders
import { useRef } from 'react';

export function useBankrollLogic(gameState: GameState, analysis: AnalysisData) {
    const [balance, setBalance] = useState(100.00);
    const [history, setHistory] = useState<BetResult[]>([]);
    
    const lastRoundRef = useRef<number>(0);
    const pendingBetRef = useRef<{ action: string, target: number } | null>(null);
    const wasFlyingRef = useRef(false);

    // Monitor Flying State
    useEffect(() => {
        // Flying Started (False -> True)
        if (gameState.isFlying && !wasFlyingRef.current) {
            // Lock in the bet based on current recommendation
            const action = analysis.recommendation.action;
            if (action === 'PLAY_2X') {
                pendingBetRef.current = { action, target: 2.00 };
            } else if (action === 'PLAY_10X') {
                pendingBetRef.current = { action, target: 10.00 };
            } else {
                pendingBetRef.current = null; // WAIT or STOP
            }
        }
        
        // Flight Ended (True -> False) -> CRASH
        if (!gameState.isFlying && wasFlyingRef.current) {
            // Resolve Bet
            const crashValue = gameState.lastCrash || 0;
            const bet = pendingBetRef.current;
            
            // Check if we haven't already processed this "timestamp" implicitly
            // (Using ref ensures we only do this on the transition edge)
            
            if (bet) {
                // Determine Win/Loss
                const win = crashValue >= bet.target;
                const profit = win ? (bet.target * 1.00) - 1.00 : -1.00; // Unity bet of 1.00
                
                const newBalance = balance + profit;
                
                const result: BetResult = {
                    roundId: Date.now(), // timestamp ID
                    action: bet.action,
                    crashPoint: crashValue,
                    profit: parseFloat(profit.toFixed(2)),
                    balanceAfter: parseFloat(newBalance.toFixed(2)),
                    timestamp: new Date().toLocaleTimeString()
                };

                setBalance(prev => parseFloat((prev + profit).toFixed(2)));
                setHistory(prev => [result, ...prev].slice(0, 50)); // Keep last 50
            }
            
            // Reset pending
            pendingBetRef.current = null;
        }

        wasFlyingRef.current = gameState.isFlying;
    }, [gameState.isFlying]); // Dependency ensures we run on state changes

    const stats: BankrollStats = {
        greens: history.filter(h => h.profit > 0).length,
        reds: history.filter(h => h.profit < 0).length,
        totalProfit: parseFloat(history.reduce((acc, h) => acc + h.profit, 0).toFixed(2))
    };

    return { balance, setBalance, history, stats };
}
