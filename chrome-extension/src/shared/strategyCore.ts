import { getActiveWeights, ScoreBreakdown } from './strategyWeights';

export interface Recommendation {
  action: 'PLAY_2X' | 'PLAY_10X' | 'WAIT' | 'STOP' | 'STOP_WIN' | 'STOP_LOSS';
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  ruleChecklist?: Record<string, boolean>;
  estimatedTarget?: number;
  scoreBreakdown?: ScoreBreakdown; // V4.0: Detalhamento do score
}

export interface PatternData {
  type: 'DIAMOND' | 'GOLD' | 'SILVER';
  interval: number;
  confidence: number;
  candlesUntilMatch: number;
  occurrences: number; // V4.0: Quantas vezes o intervalo apareceu
}

export interface AnalysisResult {
  recommendation2x: Recommendation;
  recommendationPink: Recommendation;
  pinkPattern?: PatternData;
  purpleStreak: number;
  conversionRate: number;
  volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  candlesSinceLastPink: number;
}

export class StrategyCore {
  
  public static analyze(values: number[]): AnalysisResult {
    // 1. DENSIDADES (V3.7: Janela unificada de 25 velas)
    const windowSize = 25;
    const slice = values.slice(0, windowSize);
    const pinkDensityPercent = (slice.filter(v => v >= 10.0).length / windowSize) * 100;
    const blueDensityPercent = (slice.filter(v => v < 2.0).length / windowSize) * 100;
    
    let volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (slice.length >= 3) {
        if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
        else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';
    }

    // 2. CONVERSION RATE
    const purpleConversionRate = this.calculateConversionRate(values, windowSize); 

    // 3. STREAK & PINK DISTANCE
    const streak = this.calculateStreak(values);
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

    // 4. DETECTAR PADRÕES
    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);
    const isXadrez = this.checkXadrez(values);
    const deepDowntrend = this.checkDeepDowntrend(values);

    // 5. VERIFICAR HARD BLOCKS (V4.0: Bloqueios absolutos)
    const has3BluesAfterPink = this.check3ConsecutiveBluesAfterPink(values);
    const isStopLoss = streak <= -2;

    // 6. CALCULAR ALVO DINÂMICO
    const estimatedTarget = this.calculateEstimatedTarget(values, candlesSinceLastPink);

    // 7. GERAR RECOMENDAÇÕES (V4.0: Sistema de Pontuação)
    const rec2x = this.decideAction2xV4(
      values,
      streak,
      purpleConversionRate,
      blueDensityPercent,
      candlesSinceLastPink,
      volatilityDensity,
      isXadrez,
      deepDowntrend,
      has3BluesAfterPink,
      isStopLoss,
      estimatedTarget
    );
    
    const pinkCount25 = values.slice(0, 25).filter(v => v >= 10.0).length;
    const recPink = this.decideActionPinkV4(
      pinkPattern,
      candlesSinceLastPink,
      pinkCount25,
      has3BluesAfterPink
    );

    return {
      recommendation2x: rec2x,
      recommendationPink: recPink,
      pinkPattern: pinkPattern || undefined,
      purpleStreak: streak > 0 ? streak : 0,
      conversionRate: Math.round(purpleConversionRate),
      volatilityDensity,
      candlesSinceLastPink
    };
  }

  /**
   * V4.0: DECISÃO ROXA COM SISTEMA DE PONTUAÇÃO
   */
  private static decideAction2xV4(
    values: number[],
    streak: number,
    convRate: number,
    bluePercent: number,
    pinkDistance: number,
    volatility: 'LOW' | 'MEDIUM' | 'HIGH',
    isXadrez: boolean,
    deepDowntrend: boolean,
    has3BluesAfterPink: boolean,
    isStopLoss: boolean,
    estimatedTarget: number
  ): Recommendation {
    const weights = getActiveWeights().roxa;
    
    // HARD BLOCKS (sempre bloqueiam, independente do score)
    if (has3BluesAfterPink) {
      return {
        action: 'WAIT',
        reason: '🚫 Mercado quebrado (3+ blues consecutivos após rosa)',
        riskLevel: 'CRITICAL',
        confidence: 0,
        estimatedTarget
      };
    }
    
    if (isStopLoss) {
      return {
        action: 'STOP',
        reason: '🛑 Stop Loss ativo (2 reds seguidos). Aguarde 2 roxas.',
        riskLevel: 'HIGH',
        confidence: 0,
        estimatedTarget
      };
    }

    // CALCULAR SCORE
    const scoreBreakdown: ScoreBreakdown = {
      streak: 0,
      conversionRate: 0,
      blueDensity: 0,
      pinkDistance: 0,
      volatility: 0,
      pattern: 0,
      downtrend: 0,
      total: 0,
      details: []
    };

    // 1. STREAK
    if (streak >= 4) {
      scoreBreakdown.streak = weights.streak_4_plus;
      scoreBreakdown.details.push(`Streak ≥4: +${weights.streak_4_plus}`);
    } else if (streak === 3) {
      scoreBreakdown.streak = weights.streak_3;
      scoreBreakdown.details.push(`Streak=3: +${weights.streak_3}`);
    } else if (streak === 2) {
      scoreBreakdown.streak = weights.streak_2;
      scoreBreakdown.details.push(`Streak=2: +${weights.streak_2}`);
    } else if (streak === 1) {
      scoreBreakdown.streak = weights.streak_1;
      scoreBreakdown.details.push(`Streak=1: +${weights.streak_1}`);
    }

    // 2. CONVERSION RATE
    if (convRate >= 60) {
      scoreBreakdown.conversionRate = weights.conv_60_plus;
      scoreBreakdown.details.push(`Conv ≥60%: +${weights.conv_60_plus}`);
    } else if (convRate >= 50) {
      scoreBreakdown.conversionRate = weights.conv_50_59;
      scoreBreakdown.details.push(`Conv 50-59%: +${weights.conv_50_59}`);
    } else if (convRate >= 40) {
      scoreBreakdown.conversionRate = weights.conv_40_49;
      scoreBreakdown.details.push(`Conv 40-49%: +${weights.conv_40_49}`);
    } else {
      scoreBreakdown.conversionRate = weights.conv_under_40;
      scoreBreakdown.details.push(`Conv <40%: ${weights.conv_under_40}`);
    }

    // 3. BLUE DENSITY
    if (bluePercent < 40) {
      scoreBreakdown.blueDensity = weights.blue_under_40;
      scoreBreakdown.details.push(`Blue <40%: +${weights.blue_under_40}`);
    } else if (bluePercent < 50) {
      scoreBreakdown.blueDensity = weights.blue_40_50;
      scoreBreakdown.details.push(`Blue 40-50%: +${weights.blue_40_50}`);
    } else if (bluePercent <= 60) {
      scoreBreakdown.blueDensity = weights.blue_50_60;
      scoreBreakdown.details.push(`Blue 50-60%: ${weights.blue_50_60}`);
    } else {
      scoreBreakdown.blueDensity = weights.blue_over_60;
      scoreBreakdown.details.push(`Blue >60%: ${weights.blue_over_60}`);
    }

    // 4. PINK DISTANCE
    if (pinkDistance >= 5) {
      scoreBreakdown.pinkDistance = weights.pink_5_plus;
      scoreBreakdown.details.push(`Dist ≥5: +${weights.pink_5_plus}`);
    } else if (pinkDistance >= 3) {
      scoreBreakdown.pinkDistance = weights.pink_3_4;
      scoreBreakdown.details.push(`Dist 3-4: +${weights.pink_3_4}`);
    } else {
      scoreBreakdown.pinkDistance = weights.pink_under_3;
      scoreBreakdown.details.push(`Dist <3: ${weights.pink_under_3}`);
    }

    // 5. VOLATILITY
    if (volatility === 'MEDIUM') {
      scoreBreakdown.volatility = weights.volatility_medium;
      scoreBreakdown.details.push(`Vol MEDIUM: +${weights.volatility_medium}`);
    } else if (volatility === 'HIGH') {
      scoreBreakdown.volatility = weights.volatility_high;
      scoreBreakdown.details.push(`Vol HIGH: +${weights.volatility_high}`);
    } else {
      scoreBreakdown.volatility = weights.volatility_low;
      scoreBreakdown.details.push(`Vol LOW: ${weights.volatility_low}`);
    }

    // 6. PATTERNS
    if (isXadrez) {
      scoreBreakdown.pattern = weights.xadrez_detected;
      scoreBreakdown.details.push(`Xadrez: +${weights.xadrez_detected}`);
    }

    // 7. DOWNTREND
    if (deepDowntrend) {
      scoreBreakdown.downtrend = weights.deep_downtrend;
      scoreBreakdown.details.push(`Deep Downtrend: ${weights.deep_downtrend}`);
    }

    // TOTAL
    scoreBreakdown.total = 
      scoreBreakdown.streak +
      scoreBreakdown.conversionRate +
      scoreBreakdown.blueDensity +
      scoreBreakdown.pinkDistance +
      scoreBreakdown.volatility +
      scoreBreakdown.pattern +
      scoreBreakdown.downtrend;

    // DECISÃO BASEADA EM THRESHOLD
    const threshold = weights.threshold;
    
    if (scoreBreakdown.total >= threshold) {
      return {
        action: 'PLAY_2X',
        reason: `✅ Score: ${scoreBreakdown.total} (Threshold: ${threshold})`,
        riskLevel: 'LOW',
        confidence: Math.min(95, scoreBreakdown.total),
        estimatedTarget,
        scoreBreakdown
      };
    } else if (scoreBreakdown.total >= threshold - 10) {
      return {
        action: 'WAIT',
        reason: `⚠️ Score: ${scoreBreakdown.total} (Zona cinza - aguarde)`,
        riskLevel: 'MEDIUM',
        confidence: scoreBreakdown.total,
        estimatedTarget,
        scoreBreakdown
      };
    } else {
      return {
        action: 'WAIT',
        reason: `❌ Score: ${scoreBreakdown.total} (Baixa confiança)`,
        riskLevel: 'LOW',
        confidence: Math.max(0, scoreBreakdown.total),
        estimatedTarget,
        scoreBreakdown
      };
    }
  }

  /**
   * V4.0: DECISÃO ROSA COM SISTEMA DE PONTUAÇÃO
   */
  private static decideActionPinkV4(
    pattern: PatternData | null,
    pinkDistance: number,
    pinkCount25: number,
    has3BluesAfterPink: boolean
  ): Recommendation {
    const weights = getActiveWeights().rosa;
    
    // HARD BLOCKS
    if (has3BluesAfterPink) {
      return {
        action: 'WAIT',
        reason: '🚫 Mercado quebrado (3+ blues após rosa)',
        riskLevel: 'CRITICAL',
        confidence: 0
      };
    }
    
    if (pinkCount25 === 0) {
      return {
        action: 'WAIT',
        reason: '❌ Sem rosas na janela de 25',
        riskLevel: 'HIGH',
        confidence: 0
      };
    }

    // CALCULAR SCORE
    const scoreBreakdown: ScoreBreakdown = {
      streak: 0,
      conversionRate: 0,
      blueDensity: 0,
      pinkDistance: 0,
      volatility: 0,
      pattern: 0,
      downtrend: 0,
      total: 0,
      details: []
    };

    // 1. PATTERN
    if (pattern) {
      const occ = pattern.occurrences;
      if (occ >= 4) {
        scoreBreakdown.pattern = weights.pattern_4_plus_occurrences;
        scoreBreakdown.details.push(`Padrão ${occ}x: +${weights.pattern_4_plus_occurrences}`);
      } else if (occ === 3) {
        scoreBreakdown.pattern = weights.pattern_3_occurrences;
        scoreBreakdown.details.push(`Padrão 3x: +${weights.pattern_3_occurrences}`);
      } else {
        scoreBreakdown.pattern = weights.pattern_2_occurrences;
        scoreBreakdown.details.push(`Padrão 2x: +${weights.pattern_2_occurrences}`);
      }
      
      // ZONE
      const diff = Math.abs(pattern.candlesUntilMatch);
      if (diff === 0) {
        scoreBreakdown.streak = weights.zone_exact;
        scoreBreakdown.details.push(`Zona exata: +${weights.zone_exact}`);
      } else if (diff === 1) {
        scoreBreakdown.streak = weights.zone_near;
        scoreBreakdown.details.push(`Zona ±1: +${weights.zone_near}`);
      } else {
        scoreBreakdown.streak = weights.zone_far;
        scoreBreakdown.details.push(`Zona distante: ${weights.zone_far}`);
      }
      
      // INTERVAL
      const int = pattern.interval;
      if (int >= 3 && int <= 5) {
        scoreBreakdown.volatility = weights.interval_3_5;
        scoreBreakdown.details.push(`Intervalo 3-5: +${weights.interval_3_5}`);
      } else if (int >= 6 && int <= 10) {
        scoreBreakdown.volatility = weights.interval_6_10;
        scoreBreakdown.details.push(`Intervalo 6-10: +${weights.interval_6_10}`);
      } else {
        scoreBreakdown.volatility = weights.interval_over_10;
        scoreBreakdown.details.push(`Intervalo >10: +${weights.interval_over_10}`);
      }
      
      // CONFIDENCE
      const conf = pattern.confidence;
      if (conf >= 80) {
        scoreBreakdown.downtrend = weights.confidence_80_plus;
        scoreBreakdown.details.push(`Conf ≥80%: +${weights.confidence_80_plus}`);
      } else if (conf >= 70) {
        scoreBreakdown.downtrend = weights.confidence_70_79;
        scoreBreakdown.details.push(`Conf 70-79%: +${weights.confidence_70_79}`);
      } else {
        scoreBreakdown.downtrend = weights.confidence_under_70;
        scoreBreakdown.details.push(`Conf <70%: ${weights.confidence_under_70}`);
      }
    } else {
      scoreBreakdown.pattern = weights.no_pattern;
      scoreBreakdown.details.push(`Sem padrão: ${weights.no_pattern}`);
    }

    // 2. FREQUENCY
    if (pinkCount25 >= 3) {
      scoreBreakdown.conversionRate = weights.freq_3_plus;
      scoreBreakdown.details.push(`Freq ≥3: +${weights.freq_3_plus}`);
    } else if (pinkCount25 === 2) {
      scoreBreakdown.conversionRate = weights.freq_2;
      scoreBreakdown.details.push(`Freq 2: +${weights.freq_2}`);
    } else if (pinkCount25 === 1) {
      scoreBreakdown.conversionRate = weights.freq_1;
      scoreBreakdown.details.push(`Freq 1: ${weights.freq_1}`);
    }

    // 3. PINK DISTANCE
    if (pinkDistance >= 5) {
      scoreBreakdown.pinkDistance = weights.pink_5_plus;
      scoreBreakdown.details.push(`Dist ≥5: +${weights.pink_5_plus}`);
    } else if (pinkDistance >= 3) {
      scoreBreakdown.pinkDistance = weights.pink_3_4;
      scoreBreakdown.details.push(`Dist 3-4: +${weights.pink_3_4}`);
    } else {
      scoreBreakdown.pinkDistance = weights.pink_under_3;
      scoreBreakdown.details.push(`Dist <3: ${weights.pink_under_3}`);
    }

    // TOTAL
    scoreBreakdown.total = 
      scoreBreakdown.pattern +
      scoreBreakdown.streak +
      scoreBreakdown.conversionRate +
      scoreBreakdown.pinkDistance +
      scoreBreakdown.volatility +
      scoreBreakdown.downtrend;

    // DECISÃO
    const threshold = weights.threshold;
    
    if (scoreBreakdown.total >= threshold) {
      return {
        action: 'PLAY_10X',
        reason: `🌸 Score: ${scoreBreakdown.total} (Threshold: ${threshold})`,
        riskLevel: 'MEDIUM',
        confidence: Math.min(95, scoreBreakdown.total),
        scoreBreakdown
      };
    } else {
      return {
        action: 'WAIT',
        reason: `❌ Score: ${scoreBreakdown.total} (Threshold: ${threshold})`,
        riskLevel: 'LOW',
        confidence: Math.max(0, scoreBreakdown.total),
        scoreBreakdown
      };
    }
  }

  /**
   * V4.0: DETECTA 3 BLUES CONSECUTIVOS APÓS ÚLTIMO ROSA
   */
  private static check3ConsecutiveBluesAfterPink(values: number[]): boolean {
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    if (lastPinkIndex === -1) return false;
    
    // Pega as 3 velas após o rosa
    const afterPink = values.slice(0, lastPinkIndex);
    if (afterPink.length < 3) return false;
    
    // Verifica se as 3 primeiras são blues
    return afterPink[0] < 2.0 && afterPink[1] < 2.0 && afterPink[2] < 2.0;
  }

  private static calculateStreak(v: number[]) {
    if (v.length === 0) return 0;
    const firstIsBlue = v[0] < 2.0;
    let count = 0;
    for (const val of v) {
      if ((val < 2.0) === firstIsBlue) count++;
      else break;
    }
    return firstIsBlue ? -count : count;
  }

  private static calculateDoubleBlueStats(v: number[], lb: number) {
    const slice = v.slice(0, lb);
    let count = 0;
    for (let i = 0; i < slice.length - 1; i++) if (slice[i] < 2.0 && slice[i+1] < 2.0) count++;
    return count;
  }

  private static calculateConversionRate(v: number[], lb: number) {
    const slice = v.slice(0, lb);
    let opps = 0, convs = 0;
    for (let i = 1; i < slice.length; i++) {
        if (slice[i] >= 2.0 && slice[i] < 10.0) {
            opps++;
            if (slice[i-1] >= 2.0) convs++;
        }
    }
    return opps < 2 ? 0 : (convs / opps) * 100;
  }

  private static detectPinkPattern(v: number[], lastIdx: number, _density: string): PatternData | null {
    if (lastIdx === -1) return null;
    
    // V4.0: Busca em até 60 velas para melhor detecção
    const indices = v.slice(0, 60).map((val, i) => (val >= 10.0 ? i : -1)).filter(i => i !== -1);
    if (indices.length < 2) return null;
    
    const intervals: number[] = [];
    for (let i = 0; i < indices.length - 1; i++) intervals.push(indices[i] - indices[i+1]);
    
    const freq = new Map<number, number>();
    intervals.forEach(int => freq.set(int, (freq.get(int) || 0) + 1));
    
    // V3.10: Intervalos 3-5 exigem 3+ ocorrências
    const confirmed = Array.from(freq.entries()).filter(([int, count]) => {
        if (int < 3) return count >= 4;
        if (int >= 3 && int <= 5) return count >= 3;
        return count >= 2;
    });
    
    // Prioriza intervalos com mais ocorrências
    for (const [int, count] of confirmed.sort((a, b) => b[1] - a[1])) {
        const diff = Math.abs(lastIdx - int);
        if (diff <= 1) {
            return {
              type: int >= 15 ? 'DIAMOND' : int >= 8 ? 'GOLD' : 'SILVER',
              interval: int,
              confidence: Math.min(95, 50 + (count * 12)),
              candlesUntilMatch: int - lastIdx,
              occurrences: count
            };
        }
    }
    return null;
  }

  private static checkDeepDowntrend(v: number[]) {
    let sc = 0;
    for (let i = 0; i < Math.min(v.length, 10); i++) {
        if (v[i] < 2.0) { sc++; if (sc >= 3) return true; }
        else sc = 0;
    }
    return false;
  }

  private static checkXadrez(v: number[]): boolean {
    if (v.length < 5) return false;
    const p = v.slice(0, 5).map(val => val < 2.0);
    return (p[0] !== p[1] && p[1] !== p[2] && p[2] !== p[3] && p[3] !== p[4]);
  }

  private static calculateEstimatedTarget(values: number[], candlesSincePink: number): number {
    const analysisWindowSize = Math.max(candlesSincePink, 10);
    const window = values.slice(0, Math.min(analysisWindowSize, 25));
    const purples = window.filter(v => v >= 2.0 && v < 10.0);

    if (purples.length < 2) return 2.00;

    const buckets = purples.map(v => Math.floor(v * 2) / 2);
    const freqMap = new Map<number, number>();
    buckets.forEach(b => freqMap.set(b, (freqMap.get(b) || 0) + 1));

    const sortedBuckets = Array.from(freqMap.keys()).sort((a, b) => b - a);
    const threshold = purples.length * 0.4;

    for (const bucket of sortedBuckets) {
      if ((freqMap.get(bucket) || 0) >= threshold) {
        return Math.max(2.0, bucket);
      }
    }

    const avg = purples.reduce((sum, v) => sum + v, 0) / purples.length;
    return Math.max(2.0, Math.floor(avg * 2) / 2);
  }
}
