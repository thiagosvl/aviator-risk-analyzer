import { AnalysisData } from '@src/bridge/messageTypes';
import { AnalyzerConfig, DEFAULT_CONFIG } from '@src/content/types';
import { StrategyCore } from '../../shared/strategyCore';

export class PatternService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public analyze(gameState: { history?: Array<{ value?: number } | number> }): AnalysisData {
    // Extrair valores do histórico
    const values = gameState.history?.map((c) => (typeof c === 'number' ? c : c.value || 0)) || [];
    
    if (!values || values.length === 0) {
      return this.getEmptyAnalysis();
    }

    const result = StrategyCore.analyze(values);

    return {
      recommendation2x: result.recommendation2x,
      recommendationPink: result.recommendationPink,
      pinkPattern: result.pinkPattern ? {
        ...result.pinkPattern,
        displayName: this.getPatternDisplayName(result.pinkPattern.type)
      } : undefined,
      purpleStreak: result.purpleStreak,
      conversionRate: result.conversionRate,
      volatilityDensity: result.volatilityDensity,
      candlesSinceLastPink: result.candlesSinceLastPink
    };
  }

  public updateConfig(config: Partial<AnalyzerConfig>) {
    this.config = { ...this.config, ...config };
  }

  private getPatternDisplayName(type: string): string {
    switch (type) {
      case 'DIAMOND': return 'Diamante (Raro)';
      case 'GOLD': return 'Ouro (Frequente)';
      case 'SILVER': return 'Prata (Comum)';
      default: return 'Desconhecido';
    }
  }

  private getEmptyAnalysis(): AnalysisData {
    return {
      recommendation2x: { action: 'WAIT', reason: 'Aguardando dados...', riskLevel: 'LOW', confidence: 0 },
      recommendationPink: { action: 'WAIT', reason: 'Aguardando dados...', riskLevel: 'LOW', confidence: 0 },
      purpleStreak: 0,
      conversionRate: 0,
      volatilityDensity: 'LOW',
      candlesSinceLastPink: 0
    };
  }
}

// Singleton instance
export const patternService = new PatternService();
