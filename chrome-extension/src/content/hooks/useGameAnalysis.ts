/**
 * Hook useGameAnalysis - Gerencia o estado e a lógica de análise em tempo real
 */

import { domAnalyzer } from '@src/content/services/domAnalyzer';
import { patternService } from '@src/content/services/patternService';
import { AnalyzerConfig, GameState, PatternAnalysis } from '@src/content/types';
import { useCallback, useEffect, useState } from 'react';

export interface UseGameAnalysisReturn {
  gameState: GameState;
  analysis: PatternAnalysis;
  isAnalyzing: boolean;
  error: string | null;
  startAnalysis: () => void;
  stopAnalysis: () => void;
  updateConfig: (config: Partial<AnalyzerConfig>) => void;
}

export function useGameAnalysis(
  config?: Partial<AnalyzerConfig>
): UseGameAnalysisReturn {
  const [gameState, setGameState] = useState<GameState>({
    currentMultiplier: 1.0,
    isFlying: false,
    lastCrash: null,
    history: [],
  });

  const [analysis, setAnalysis] = useState<PatternAnalysis>({
    riskLevel: 'low',
    confidence: 0,
    recommendation: 'Aguardando início da análise...',
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

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  /**
   * Executa uma iteração de análise
   */
  const runAnalysis = useCallback(() => {
    try {
      // Extrair dados do DOM
      const newGameState = domAnalyzer.extractGameData();
      setGameState(newGameState);

      // Analisar padrões
      const newAnalysis = patternService.analyze(newGameState);
      setAnalysis(newAnalysis);

      // Limpar erro se houver
      if (error) setError(null);
    } catch (err) {
      console.error('[useGameAnalysis] Erro na análise:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [error]);

  /**
   * Inicia a análise em tempo real
   */
  const startAnalysis = useCallback(() => {
    if (isAnalyzing) return;

    console.log('[useGameAnalysis] Iniciando análise...');
    setIsAnalyzing(true);

    // Executar primeira análise imediatamente
    runAnalysis();

    // Configurar intervalo
    const updateInterval = config?.updateInterval || 500;
    const id = setInterval(runAnalysis, updateInterval);
    setIntervalId(id);
  }, [isAnalyzing, runAnalysis, config?.updateInterval]);

  /**
   * Para a análise
   */
  const stopAnalysis = useCallback(() => {
    console.log('[useGameAnalysis] Parando análise...');
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setIsAnalyzing(false);
  }, [intervalId]);

  /**
   * Atualiza a configuração do analisador
   */
  const updateConfig = useCallback((newConfig: Partial<AnalyzerConfig>) => {
    patternService.updateConfig(newConfig);
    
    // Se estiver analisando, reiniciar com nova configuração
    if (isAnalyzing) {
      stopAnalysis();
      setTimeout(startAnalysis, 100);
    }
  }, [isAnalyzing, startAnalysis, stopAnalysis]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    gameState,
    analysis,
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis,
    updateConfig,
  };
}
