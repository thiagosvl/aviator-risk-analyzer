import { AnalysisData, GameData } from '@src/bridge/messageTypes';
import { bridge } from '@src/content/services/BridgeService';
import { useEffect, useState } from 'react';

export const useOverseer = () => {
  const [gameState, setGameState] = useState<GameData>({
    currentMultiplier: 0,
    isFlying: false,
    history: [],
    lastCrash: 0,
  });

  const [analysis, setAnalysis] = useState<AnalysisData>({
    recommendation2x: { action: 'WAIT', reason: 'Inicializando...', riskLevel: 'LOW', confidence: 0 },
    recommendationPink: { action: 'WAIT', reason: 'Inicializando...', riskLevel: 'LOW', confidence: 0 },
    pinkPattern: undefined,
    purpleStreak: 0,
    conversionRate: 0,
    volatilityDensity: 'LOW',
    candlesSinceLastPink: 0
  });

  useEffect(() => {
    // Listen for updates from the spy
    bridge.on<{ gameState: GameData; analysis: AnalysisData }>('GAME_UPDATE', (payload) => {
      setGameState(payload.gameState);
      setAnalysis(payload.analysis);
    });
  }, []);

  return {
    gameState,
    analysis,
    isConnected: true // Could implement connection status
  };
};
