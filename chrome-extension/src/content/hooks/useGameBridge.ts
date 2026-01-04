import { BridgeMessageType, bridgeService } from '@src/content/services/BridgeService';
import { AnalyzerConfig, GameState, PatternAnalysis } from '@src/content/types';
import { useEffect, useState } from 'react';

export function useGameBridge() {
  const [gameState, setGameState] = useState<GameState>({
    currentMultiplier: 1.0,
    isFlying: false,
    lastCrash: null,
    history: [],
  });

  const [analysis, setAnalysis] = useState<PatternAnalysis>({
    riskLevel: 'low',
    confidence: 0,
    recommendation: 'Aguardando dados do jogo...',
    volatility: 0,
    avgMultiplier: 0,
    minMultiplier: 0,
    maxMultiplier: 0,
    streak: 0,
    pinkDistance: 0,
    avgPostPink: 0,
    medianPostPink: 0,
    winRate: 0,
    lastCandles: [],
    patterns: [],
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = bridgeService.onMessage((message) => {
      if (message.type === BridgeMessageType.GAME_UPDATE) {
        const payload = message.payload;
        if (payload.gameState) setGameState(payload.gameState);
        if (payload.analysis) setAnalysis(payload.analysis);
        setIsConnected(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Stub functions to match interface
  const startAnalysis = () => {};
  const stopAnalysis = () => {};
  const updateConfig = (config: Partial<AnalyzerConfig>) => {};

  return {
    gameState,
    analysis,
    isAnalyzing: isConnected,
    error: isConnected ? null : 'Aguardando conexão com o iframe...',
    startAnalysis,
    stopAnalysis,
    updateConfig,
  };
}
