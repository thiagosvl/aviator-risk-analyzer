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

export function useBankrollLogic(
    gameState: GameState, 
    analysis: AnalysisData,
    betConfig: { bet2x: number, bet10x: number } = { bet2x: 100.00, bet10x: 50.00 }
) {
    const [balance, setBalance] = useState(1000.00);
    const [history, setHistory] = useState<BetResult[]>([]);
    
    // Stores the bet that was "placed" at the start of the current flight
    // We also store the 'startCrash' (last known crash when we placed the bet)
    // to verify if the crash we see later is actually new.
    const pendingBetRef = useRef<{ action: string, target: number, amount: number, startCrash: number | null } | null>(null);
    const wasFlyingRef = useRef(false);

    // Monitor Flying State
    useEffect(() => {
        // Flying Started (False -> True)
        if (gameState.isFlying && !wasFlyingRef.current) {
            const action = analysis.recommendation.action;
            const lastKnownCrash = gameState.lastCrash || 0;
            
            console.log('[Bankroll] Round Started. Rec:', action, 'LastCrash:', lastKnownCrash);

            if (action === 'PLAY_2X') {
                pendingBetRef.current = { action, target: 2.00, amount: betConfig.bet2x, startCrash: lastKnownCrash };
            } else if (action === 'PLAY_10X') {
                pendingBetRef.current = { action, target: 10.00, amount: betConfig.bet10x, startCrash: lastKnownCrash };
            } else {
                pendingBetRef.current = null; // WAIT or STOP
            }
        }
        
        // Flight Ended (True -> False) -> CRASH
        if (!gameState.isFlying && wasFlyingRef.current) {
            // Resolve Bet
            const crashValue = gameState.lastCrash || 0;
            const bet = pendingBetRef.current;
            
            console.log('[Bankroll] Round Ended. Crash:', crashValue, 'Bet:', bet);
            
            if (bet) {
                // Determine Win/Loss
                const win = crashValue >= bet.target;
                
                // Profit Calculation:
                const profit = win ? (bet.amount * bet.target) - bet.amount : -bet.amount;
                const newBalance = balance + profit;
                
                const result: BetResult = {
                    roundId: Date.now(),
                    action: bet.action,
                    crashPoint: crashValue,
                    profit: parseFloat(profit.toFixed(2)),
                    balanceAfter: parseFloat(newBalance.toFixed(2)),
                    timestamp: new Date().toLocaleTimeString()
                };

                setBalance(prev => parseFloat((prev + profit).toFixed(2)));
                setHistory(prev => [result, ...prev].slice(0, 50)); 
            }
            
            // Reset pending
            pendingBetRef.current = null;
        }

        wasFlyingRef.current = gameState.isFlying;
    }, [gameState.isFlying, gameState.lastCrash, analysis, betConfig]); 

    const stats: BankrollStats = {
        greens: history.filter(h => h.profit > 0).length,
        reds: history.filter(h => h.profit < 0).length,
        totalProfit: parseFloat(history.reduce((acc, h) => acc + h.profit, 0).toFixed(2))
    };

    return { balance, setBalance, history, stats };
}
