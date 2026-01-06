import { AnalysisData, GameData } from '@src/bridge/messageTypes';
import { bridge } from '@src/content/services/BridgeService';
import { useEffect, useState } from 'react';

export const useOverseer = () => {
  const initialGameState = {
    currentMultiplier: 0,
    isFlying: false,
    history: [],
    lastCrash: 0,
  };

  const initialAnalysis: AnalysisData = {
    recommendation2x: { action: 'WAIT', reason: 'Inicializando...', riskLevel: 'LOW', confidence: 0 },
    recommendationPink: { action: 'WAIT', reason: 'Inicializando...', riskLevel: 'LOW', confidence: 0 },
    pinkPattern: undefined,
    purpleStreak: 0,
    conversionRate: 0,
    volatilityDensity: 'LOW',
    volatilityScore: 0, // Adicionado
    phase: 'NORMAL', // Adicionado
    candlesSinceLastPink: 0,
    marketStats: { bluePercent: 0, purplePercent: 0, pinkPercent: 0 }
  };

  const [gameState, setGameState] = useState<GameData>(initialGameState);
  const [analysis, setAnalysis] = useState<AnalysisData>(initialAnalysis);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let lastUpdate = Date.now();

    // Reset total function
    const resetAll = () => {
        console.log('[Overseer] 🧹 Resetting all states due to navigation/disconnect');
        setGameState(initialGameState);
        setAnalysis(initialAnalysis);
        setIsConnected(false);
    };

    // Listen for updates from the spy
    const unsubscribe = bridge.on<{ gameState: GameData; analysis: AnalysisData }>('GAME_UPDATE', (payload) => {
      console.log(`[Aviator Analyzer] Overseer: UPDATE RECEBIDO! Histórico: ${payload.gameState.history.length}`);
      lastUpdate = Date.now();
      setIsConnected(true);
      setGameState(payload.gameState);
      setAnalysis(payload.analysis);
    });

    // HEARTBEAT MONITOR: Se ficar 60s sem sinal, reseta. (Aumentado para evitar reset ao trocar aba)
    const heartbeatInterval = setInterval(() => {
        if (Date.now() - lastUpdate > 60000 && isConnected) {
            resetAll();
        }
    }, 1000);

    // URL CHANGE MONITOR (SPA)
    window.addEventListener('popstate', resetAll);
    
    // Patch history.pushState if needed (some SPAs use it without popstate)
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
        resetAll();
        return originalPushState.apply(this, args);
    };

    return () => {
      unsubscribe();
      clearInterval(heartbeatInterval);
      window.removeEventListener('popstate', resetAll);
      window.history.pushState = originalPushState;
    };
  }, [isConnected]);

  return {
    gameState,
    analysis,
    isConnected
  };
};
