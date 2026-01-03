/**
 * Pattern Service - Analisa padrões nas velas do Aviator
 *
 * Este módulo implementa a lógica de detecção de padrões e cálculo de risco.
 * Foco: Análise baseada no histórico COMPLETO disponível (até 60 velas).
 */

import { calculateAverage, calculateStandardDeviation } from '@src/content/lib/utils';
import { DEFAULT_CONFIG } from '@src/content/types';
import type { GameState, PatternAnalysis, DetectedPattern, RiskLevel, AnalyzerConfig } from '@src/content/types';

export class PatternService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analisa o estado do jogo e retorna uma análise completa
   * Usa TODO o histórico disponível para gerar recomendações precisas
   */
  public analyze(gameState: GameState): PatternAnalysis {
    const values = gameState.history.map(c => c.value);

    // Se não há histórico suficiente, retornar análise padrão
    if (values.length < 5) {
      return this.getDefaultAnalysis();
    }

    console.log(`[Pattern Service] Analisando ${values.length} velas do histórico completo`);

    // Calcular métricas estatísticas
    const avgMultiplier = calculateAverage(values);
    const minMultiplier = Math.min(...values);
    const maxMultiplier = Math.max(...values);
    const volatility = calculateStandardDeviation(values);

    // Detectar padrões
    const patterns = this.detectPatterns(values);

    // Calcular nível de risco baseado no histórico completo
    const { riskLevel, confidence } = this.calculateRisk(values, patterns, volatility);

    // Gerar recomendação
    const recommendation = this.generateRecommendation(riskLevel, patterns);

    // Pegar últimas velas para exibição
    const lastCandles = values.slice(0, 10); // Primeiras 10 (mais recentes)

    console.log(`[Pattern Service] Risco: ${riskLevel}, Confiança: ${confidence}%`);
    console.log(`[Pattern Service] Padrões detectados: ${patterns.length}`);

    return {
      riskLevel,
      confidence,
      recommendation,
      volatility,
      avgMultiplier,
      minMultiplier,
      maxMultiplier,
      lastCandles,
      patterns,
    };
  }

  /**
   * Detecta padrões específicos no histórico COMPLETO
   */
  private detectPatterns(values: number[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const { thresholds, enabledPatterns } = this.config;

    console.log(`[Pattern Service] Detectando padrões em ${values.length} velas...`);

    // Padrão: Sequência de velas baixas (últimas 5)
    if (enabledPatterns.includes('LOW_SEQUENCE')) {
      const lowSequence = this.detectLowSequence(values, thresholds.lowCandle);
      if (lowSequence) patterns.push(lowSequence);
    }

    // Padrão: Sequência de velas altas (últimas 5)
    if (enabledPatterns.includes('HIGH_SEQUENCE')) {
      const highSequence = this.detectHighSequence(values, thresholds.highCandle);
      if (highSequence) patterns.push(highSequence);
    }

    // Padrão: Alta volatilidade (histórico completo)
    if (enabledPatterns.includes('HIGH_VOLATILITY')) {
      const highVol = this.detectHighVolatility(values, thresholds.highVolatility);
      if (highVol) patterns.push(highVol);
    }

    // Padrão: Tendência de descida (últimas 10)
    if (enabledPatterns.includes('TREND_DOWN')) {
      const trendDown = this.detectTrendDown(values);
      if (trendDown) patterns.push(trendDown);
    }

    // Padrão: Cluster de valores baixos (últimas 20)
    if (enabledPatterns.includes('CLUSTER_LOW')) {
      const clusterLow = this.detectClusterLow(values, thresholds.lowCandle);
      if (clusterLow) patterns.push(clusterLow);
    }

    // Padrão: Muitas velas abaixo de 2x (indicador de risco)
    const veryLowPattern = this.detectVeryLowPattern(values);
    if (veryLowPattern) patterns.push(veryLowPattern);

    // Padrão: Alternância extrema (alta volatilidade recente)
    const alternatingPattern = this.detectAlternatingPattern(values);
    if (alternatingPattern) patterns.push(alternatingPattern);

    return patterns;
  }

  /**
   * Detecta sequência de velas baixas consecutivas (últimas 5)
   */
  private detectLowSequence(values: number[], threshold: number): DetectedPattern | null {
    const recent = values.slice(0, 5); // Primeiras 5 (mais recentes)
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
   * Detecta sequência de velas altas consecutivas (últimas 5)
   */
  private detectHighSequence(values: number[], threshold: number): DetectedPattern | null {
    const recent = values.slice(0, 5); // Primeiras 5 (mais recentes)
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
   * Detecta alta volatilidade no histórico completo
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
   * Detecta tendência de descida (últimas 10 velas)
   */
  private detectTrendDown(values: number[]): DetectedPattern | null {
    const recent = values.slice(0, 10); // Primeiras 10 (mais recentes)

    if (recent.length < 5) return null;

    // Verificar se há tendência de queda
    let decreasingCount = 0;
    for (let i = 1; i < Math.min(recent.length, 5); i++) {
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
   * Detecta cluster de valores baixos (últimas 20 velas)
   */
  private detectClusterLow(values: number[], threshold: number): DetectedPattern | null {
    const recent = values.slice(0, 20); // Primeiras 20 (mais recentes)
    const lowCount = recent.filter(v => v < threshold).length;
    const percentage = (lowCount / recent.length) * 100;

    if (percentage >= 50) {
      return {
        type: 'CLUSTER_LOW',
        description: `${percentage.toFixed(0)}% das últimas 20 velas são baixas`,
        severity: 'warning',
        confidence: percentage,
      };
    }

    return null;
  }

  /**
   * Detecta muitas velas muito baixas (< 2x) - indicador de alto risco
   */
  private detectVeryLowPattern(values: number[]): DetectedPattern | null {
    const recent = values.slice(0, 10); // Primeiras 10 (mais recentes)
    const veryLowCount = recent.filter(v => v < 2.0).length;

    if (veryLowCount >= 5) {
      return {
        type: 'CLUSTER_LOW',
        description: `${veryLowCount} velas abaixo de 2.0x nas últimas 10 rodadas`,
        severity: 'danger',
        confidence: (veryLowCount / 10) * 100,
      };
    }

    return null;
  }

  /**
   * Detecta alternância extrema entre valores altos e baixos
   */
  private detectAlternatingPattern(values: number[]): DetectedPattern | null {
    const recent = values.slice(0, 8); // Primeiras 8 (mais recentes)

    if (recent.length < 6) return null;

    let alternations = 0;
    for (let i = 1; i < recent.length; i++) {
      const diff = Math.abs(recent[i] - recent[i - 1]);
      if (diff > 3.0) {
        alternations++;
      }
    }

    if (alternations >= 4) {
      return {
        type: 'ALTERNATING',
        description: 'Alternância extrema entre valores altos e baixos',
        severity: 'warning',
        confidence: (alternations / (recent.length - 1)) * 100,
      };
    }

    return null;
  }

  /**
   * Calcula o nível de risco baseado no histórico COMPLETO
   * Lógica melhorada para recomendação JOGUE/NÃO JOGUE
   */
  private calculateRisk(
    values: number[],
    patterns: DetectedPattern[],
    volatility: number,
  ): { riskLevel: RiskLevel; confidence: number } {
    // Sistema de pontuação baseado em múltiplos fatores
    let riskScore = 0;
    let totalConfidence = 0;

    console.log('[Pattern Service] Calculando risco...');

    // 1. Análise dos padrões detectados
    patterns.forEach(pattern => {
      console.log(`[Pattern Service] Padrão: ${pattern.type} (${pattern.severity})`);

      if (pattern.severity === 'danger') {
        riskScore += 30;
      } else if (pattern.severity === 'warning') {
        riskScore += 15;
      } else {
        riskScore += 5;
      }

      totalConfidence += pattern.confidence;
    });

    // 2. Análise da volatilidade
    if (volatility > this.config.thresholds.highVolatility) {
      riskScore += 20;
      console.log(`[Pattern Service] Alta volatilidade: +20 pontos (σ = ${volatility.toFixed(2)})`);
    }

    // 3. Análise das últimas 5 velas (mais recentes)
    const last5 = values.slice(0, 5);
    const avgLast5 = calculateAverage(last5);
    if (avgLast5 < 2.0) {
      riskScore += 25;
      console.log(`[Pattern Service] Média baixa nas últimas 5: +25 pontos (${avgLast5.toFixed(2)}x)`);
    }

    // 4. Análise de sequências perigosas
    const veryLowInLast10 = values.slice(0, 10).filter(v => v < 1.5).length;
    if (veryLowInLast10 >= 6) {
      riskScore += 30;
      console.log(`[Pattern Service] Muitas velas muito baixas: +30 pontos (${veryLowInLast10}/10)`);
    }

    // 5. Análise da média geral do histórico
    const avgAll = calculateAverage(values);
    if (avgAll < 2.5) {
      riskScore += 15;
      console.log(`[Pattern Service] Média geral baixa: +15 pontos (${avgAll.toFixed(2)}x)`);
    }

    console.log(`[Pattern Service] Pontuação total de risco: ${riskScore}`);

    // Calcular confiança média
    const confidence = patterns.length > 0 ? Math.min(totalConfidence / patterns.length, 100) : 60;

    // Determinar nível de risco
    let riskLevel: RiskLevel;
    if (riskScore >= 70) {
      riskLevel = 'critical'; // NÃO JOGUE
    } else if (riskScore >= 45) {
      riskLevel = 'high'; // NÃO JOGUE
    } else if (riskScore >= 25) {
      riskLevel = 'medium'; // CUIDADO
    } else {
      riskLevel = 'low'; // JOGUE
    }

    return { riskLevel, confidence: Math.round(confidence) };
  }

  /**
   * Gera recomendação textual baseada na análise
   */
  private generateRecommendation(riskLevel: RiskLevel, patterns: DetectedPattern[]): string {
    const recommendations: Record<RiskLevel, string> = {
      critical: '🚫 NÃO JOGUE - Risco crítico detectado!',
      high: '⚠️ NÃO JOGUE - Condições muito desfavoráveis',
      medium: '⚡ CUIDADO - Jogue com cautela extrema',
      low: '✅ JOGUE - Condições favoráveis',
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
      riskLevel: 'low',
      confidence: 0,
      recommendation: 'Aguardando dados suficientes para análise...',
      volatility: 0,
      avgMultiplier: 0,
      minMultiplier: 0,
      maxMultiplier: 0,
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
