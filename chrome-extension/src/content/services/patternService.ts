/**
 * Pattern Service - Analisa padrões nas velas do Aviator
 * 
 * Este módulo implementa a lógica de detecção de padrões e cálculo de risco.
 * Você pode adicionar suas próprias análises e padrões aqui.
 */

import {
  CandleData,
  GameState,
  PatternAnalysis,
  DetectedPattern,
  RiskLevel,
  AnalyzerConfig,
  DEFAULT_CONFIG,
  PatternType,
} from '@src/content/types';
import {
  calculateAverage,
  calculateMedian,
  calculateStandardDeviation,
} from '@src/content/lib/utils';

export class PatternService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analisa o estado do jogo e retorna uma análise completa
   */
  public analyze(gameState: GameState): PatternAnalysis {
    const values = gameState.history.map(c => c.value);
    
    // Se não há histórico suficiente, retornar análise padrão
    if (values.length < 5) {
      return this.getDefaultAnalysis();
    }

    // Calcular métricas estatísticas
    const average = calculateAverage(values);
    const median = calculateMedian(values);
    const volatility = calculateStandardDeviation(values);

    // Detectar padrões
    const patterns = this.detectPatterns(values);

    // Calcular nível de risco
    const { riskLevel, confidence } = this.calculateRisk(values, patterns, volatility);

    // Gerar recomendação
    const recommendation = this.generateRecommendation(riskLevel, patterns);

    // Pegar últimas velas para exibição
    const lastCandles = values.slice(-10);

    return {
      riskLevel,
      confidence,
      recommendation,
      volatility,
      average,
      median,
      lastCandles,
      patterns,
    };
  }

  /**
   * Detecta padrões específicos no histórico
   */
  private detectPatterns(values: number[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const { thresholds, enabledPatterns } = this.config;

    // Padrão: Sequência de velas baixas
    if (enabledPatterns.includes('LOW_SEQUENCE')) {
      const lowSequence = this.detectLowSequence(values, thresholds.lowCandle);
      if (lowSequence) patterns.push(lowSequence);
    }

    // Padrão: Sequência de velas altas
    if (enabledPatterns.includes('HIGH_SEQUENCE')) {
      const highSequence = this.detectHighSequence(values, thresholds.highCandle);
      if (highSequence) patterns.push(highSequence);
    }

    // Padrão: Alta volatilidade
    if (enabledPatterns.includes('HIGH_VOLATILITY')) {
      const highVol = this.detectHighVolatility(values, thresholds.highVolatility);
      if (highVol) patterns.push(highVol);
    }

    // Padrão: Tendência de descida
    if (enabledPatterns.includes('TREND_DOWN')) {
      const trendDown = this.detectTrendDown(values);
      if (trendDown) patterns.push(trendDown);
    }

    // Padrão: Cluster de valores baixos
    if (enabledPatterns.includes('CLUSTER_LOW')) {
      const clusterLow = this.detectClusterLow(values, thresholds.lowCandle);
      if (clusterLow) patterns.push(clusterLow);
    }

    return patterns;
  }

  /**
   * Detecta sequência de velas baixas consecutivas
   */
  private detectLowSequence(values: number[], threshold: number): DetectedPattern | null {
    const recent = values.slice(-5);
    const lowCount = recent.filter(v => v < threshold).length;

    if (lowCount >= 3) {
      return {
        type: 'LOW_SEQUENCE',
        description: `${lowCount} velas baixas (< ${threshold}x) nas últimas 5 rodadas`,
        severity: 'warning',
        confidence: (lowCount / 5) * 100,
      };
    }

    return null;
  }

  /**
   * Detecta sequência de velas altas consecutivas
   */
  private detectHighSequence(values: number[], threshold: number): DetectedPattern | null {
    const recent = values.slice(-5);
    const highCount = recent.filter(v => v > threshold).length;

    if (highCount >= 2) {
      return {
        type: 'HIGH_SEQUENCE',
        description: `${highCount} velas altas (> ${threshold}x) nas últimas 5 rodadas`,
        severity: 'info',
        confidence: (highCount / 5) * 100,
      };
    }

    return null;
  }

  /**
   * Detecta alta volatilidade
   */
  private detectHighVolatility(values: number[], threshold: number): DetectedPattern | null {
    const stdDev = calculateStandardDeviation(values);

    if (stdDev > threshold) {
      return {
        type: 'HIGH_VOLATILITY',
        description: `Alta volatilidade detectada (σ = ${stdDev.toFixed(2)})`,
        severity: 'danger',
        confidence: Math.min((stdDev / threshold) * 50, 100),
      };
    }

    return null;
  }

  /**
   * Detecta tendência de descida
   */
  private detectTrendDown(values: number[]): DetectedPattern | null {
    const recent = values.slice(-5);
    
    if (recent.length < 5) return null;

    // Verificar se há tendência de queda
    let decreasingCount = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] < recent[i - 1]) {
        decreasingCount++;
      }
    }

    if (decreasingCount >= 3) {
      return {
        type: 'TREND_DOWN',
        description: 'Tendência de queda detectada nas últimas rodadas',
        severity: 'warning',
        confidence: (decreasingCount / 4) * 100,
      };
    }

    return null;
  }

  /**
   * Detecta cluster de valores baixos
   */
  private detectClusterLow(values: number[], threshold: number): DetectedPattern | null {
    const recent = values.slice(-10);
    const lowCount = recent.filter(v => v < threshold).length;
    const percentage = (lowCount / recent.length) * 100;

    if (percentage >= 60) {
      return {
        type: 'CLUSTER_LOW',
        description: `${percentage.toFixed(0)}% das últimas velas são baixas`,
        severity: 'warning',
        confidence: percentage,
      };
    }

    return null;
  }

  /**
   * Calcula o nível de risco baseado nas análises
   */
  private calculateRisk(
    values: number[],
    patterns: DetectedPattern[],
    volatility: number
  ): { riskLevel: RiskLevel; confidence: number } {
    // Sistema de pontuação
    let riskScore = 0;
    let totalConfidence = 0;

    // Adicionar pontos baseado nos padrões detectados
    patterns.forEach(pattern => {
      if (pattern.severity === 'danger') {
        riskScore += 30;
      } else if (pattern.severity === 'warning') {
        riskScore += 20;
      } else {
        riskScore += 10;
      }
      
      totalConfidence += pattern.confidence;
    });

    // Adicionar pontos baseado na volatilidade
    if (volatility > this.config.thresholds.highVolatility) {
      riskScore += 25;
    }

    // Calcular confiança média
    const confidence = patterns.length > 0 
      ? Math.min(totalConfidence / patterns.length, 100)
      : 50;

    // Determinar nível de risco
    let riskLevel: RiskLevel;
    if (riskScore >= 60) {
      riskLevel = 'MUITO_ALTO';
    } else if (riskScore >= 40) {
      riskLevel = 'ALTO';
    } else if (riskScore >= 20) {
      riskLevel = 'MEDIO';
    } else {
      riskLevel = 'BAIXO';
    }

    return { riskLevel, confidence: Math.round(confidence) };
  }

  /**
   * Gera recomendação textual baseada na análise
   */
  private generateRecommendation(riskLevel: RiskLevel, patterns: DetectedPattern[]): string {
    const recommendations: Record<RiskLevel, string> = {
      MUITO_ALTO: '🚫 NÃO JOGUE - Risco muito alto detectado!',
      ALTO: '⚠️ EVITE JOGAR - Condições desfavoráveis',
      MEDIO: '⚡ ATENÇÃO - Jogue com cautela',
      BAIXO: '✅ Condições normais - Jogue com responsabilidade',
    };

    let recommendation = recommendations[riskLevel];

    // Adicionar detalhes dos padrões mais críticos
    const criticalPatterns = patterns.filter(p => p.severity === 'danger' || p.severity === 'warning');
    
    if (criticalPatterns.length > 0) {
      recommendation += '\n\n' + criticalPatterns.map(p => `• ${p.description}`).join('\n');
    }

    return recommendation;
  }

  /**
   * Retorna análise padrão quando não há dados suficientes
   */
  private getDefaultAnalysis(): PatternAnalysis {
    return {
      riskLevel: 'BAIXO',
      confidence: 0,
      recommendation: 'Aguardando dados suficientes para análise...',
      volatility: 0,
      average: 0,
      median: 0,
      lastCandles: [],
      patterns: [],
    };
  }

  /**
   * Atualiza a configuração do analisador
   */
  public updateConfig(config: Partial<AnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Exportar instância singleton
export const patternService = new PatternService();
