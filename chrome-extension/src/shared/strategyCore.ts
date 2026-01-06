import { ScoreBreakdown } from './strategyWeights';

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

export interface PinkIntervalAnalysis {
  intervalMap: Record<number, number>;
  lastPattern: number | null;
  topIntervals: Array<{ interval: number; count: number }>;
  patternClustering?: {
    interval: number;
    occurrences: number[];
    avgDistance: number;
  }[];
}

export interface AnalysisResult {
  recommendation2x: Recommendation;
  recommendationPink: Recommendation;
  pinkPattern?: PatternData;
  purpleStreak: number;
  conversionRate: number;
  volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  candlesSinceLastPink: number;
  marketStats?: {
    bluePercent: number;
    purplePercent: number;
    pinkPercent: number;
  };
  pinkIntervals?: PinkIntervalAnalysis;
  phase: 'CLUSTER' | 'DESERT' | 'NORMAL' | 'RECOVERY';
  
  // V9 NEW FIELDS
  regime: 'EXPANSION' | 'UNCERTAINTY' | 'HOSTILE'; 
  absStake: number; // 1.0 = 100%, 0.5 = 50%, 0.0 = 0%
  regimeStats?: {
    recentBlueCount: number; // in last 20
    isHostile: boolean;
  };
  
  volatilityScore: number;
  prediction?: {
    category: 'BAIXA' | 'MÉDIA' | 'ALTA';
    value: number;
    confidence: number;
  };
}

export class StrategyCore {
  
  public static analyze(values: number[]): AnalysisResult {
    // 1. DENSIDADES (Janela de 25 velas)
    const windowSize = 25;
    const slice = values.slice(0, windowSize);
    const pinkDensityPercent = (slice.filter(v => v >= 10.0).length / windowSize) * 100;
    
    let volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (slice.length >= 3) {
        if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
        else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';
    }

    // 2. CONVERSION RATE & STREAK
    const purpleConversionRate = this.calculateConversionRate(values, windowSize); 
    const streak = this.calculateStreak(values);
    
    // 3. INDEX & INTERVALS
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;
    const pinkIntervals = this.analyzePinkIntervals(values);
    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);

    // 4. ESTATÍSTICAS DE MERCADO (Janela de 60 velas)
    const marketStats = this.calculateMarketStats(values, 60);

    // 5. REGIME & PHASE DETECTION (V9 LOGIC)
    const { regime, phase, absStake, regimeStats } = this.calculateRegimeAndPhaseV9(values, candlesSinceLastPink);

    // 6. GERAR RECOMENDAÇÕES (V9 SURVIVAL)
    // Passamos o regime para dentro da decisão para ajustar confidence/reason
    const recPink = this.decideActionV9(values, candlesSinceLastPink, regime, phase);
    
    const rec2x: Recommendation = {
      action: 'WAIT',
      reason: 'V9: Foco total em Rosa. 2x desativado para maximizar Sobrevivência.',
      riskLevel: 'LOW',
      confidence: 0
    };

    return {
      recommendation2x: rec2x,
      recommendationPink: recPink,
      pinkPattern: pinkPattern || undefined,
      purpleStreak: streak > 0 ? streak : 0,
      conversionRate: Math.round(purpleConversionRate),
      volatilityDensity,
      candlesSinceLastPink,
      marketStats,
      pinkIntervals,
      phase,
      
      // V9 Fields
      regime,
      absStake,
      regimeStats,
      
      volatilityScore: 0,
      prediction: undefined
    };
  }

  /**
   * V9 REGIME DETECTION
   * Determina o estado do mar: Liso (Expansão), Agitado (Incerteza) ou Tempestade (Hostil).
   */
  private static calculateRegimeAndPhaseV9(values: number[], candlesSinceLastPink: number) {
      // 1. DETECT HOSTILE (DESERT)
      // Regra Antiga: 12 velas sem rosa.
      if (candlesSinceLastPink >= 12) {
          return { 
              regime: 'HOSTILE' as const, 
              phase: 'DESERT' as const, 
              absStake: 0.0, // STOP TOTAL
              regimeStats: { recentBlueCount: 0, isHostile: true }
          };
      }

      // 2. DETECT UNCERTAINTY (BLUE FLOOD)
      // Regra V9: Se nas últimas 20 velas, tivermos mais que 12 Blues (<2.0x) OU 2 Blues nas últimas 3.
      // E estamos "longe" de rosa (ex: > 4 velas), para evitar confundir "Correction" com "Bad Market".
      const shortWindow = values.slice(0, 20);
      const blueCount = shortWindow.filter(v => v < 2.0).length;
      
      // Filtro de "Short Term Pain" (2 blues nos ultimos 3)
      const recentPain = values.slice(0, 3).filter(v => v < 2.0).length >= 2;

      if (blueCount >= 12 || recentPain) {
           return {
               regime: 'UNCERTAINTY' as const,
               phase: 'NORMAL' as const,
               absStake: 0.5, // ABS ACTIVATED (50% Stake)
               regimeStats: { recentBlueCount: blueCount, isHostile: false }
           };
      }

      // 3. EXPANSION (GREEN LIGHT)
      // V8 Logic integrated: Recovery post-Desert
      // Simplified Logic: If candlesSinceLastPink is low, but we have a "gap" context in history?
      
      // Let's rely on the Phase Logic being passed IN or calculated here.
      // Ideally we calculate Phase first? 
      // V8 Logic for Phase:
      let phase: 'CLUSTER' | 'DESERT' | 'NORMAL' | 'RECOVERY' = 'NORMAL';
      
      // ... (Existing Phase Calculation or Simplification)
      // Since we need to match "Recovery" specifically:
      // We check if we just exited a desert.
      
      // Actually, we can reuse the existing 'phase' if it was calculated before? 
      // The current flow calls this method to Return phase.
      
      // RECOVERY DETECTION (V8 Logic)
      if (candlesSinceLastPink <= 2) {
          const prevPinkIndex = values.slice(candlesSinceLastPink + 1).findIndex(v => v >= 10.0);
           if (prevPinkIndex !== -1) {
             const gap = prevPinkIndex;
             if (gap >= 12) phase = 'RECOVERY';
           }
      }

      const isRecovery = phase === 'RECOVERY';

      return {
          regime: 'EXPANSION' as const,
          phase,
          absStake: isRecovery ? 1.5 : 1.0, // BOOST: 150% in Recovery, 100% in Normal
          regimeStats: { recentBlueCount: blueCount, isHostile: false }
      };
  }

  /**
   * V9 DECISION ENGINE
   */
  private static decideActionV9(
    values: number[], 
    candlesSinceLastPink: number,
    regime: 'EXPANSION' | 'UNCERTAINTY' | 'HOSTILE',
    phase: 'CLUSTER' | 'DESERT' | 'NORMAL' | 'RECOVERY'
  ): Recommendation {
    if (values.length === 0) return { action: 'WAIT', reason: 'Aguardando dados...', riskLevel: 'LOW', confidence: 0 };
    
    // --- LAYER 1: REGIME FILTER ---
    if (regime === 'HOSTILE') {
      return { 
        action: 'WAIT', 
        reason: `🔴 REGIME HOSTIL: ${candlesSinceLastPink} velas sem rosa. Proteção total.`, 
        riskLevel: 'HIGH', 
        confidence: 0,
        estimatedTarget: 10.0
      };
    }

    const lastValue = values[0];
    const baseAdvice = { action: 'WAIT', reason: 'Aguardando oportunidade.', riskLevel: 'LOW', confidence: 0 } as Recommendation;

    // --- LAYER 2: OPPORTUNITY SCANNERS ---

    // A. RECOVERY (Alta prioridade)
    if (phase === 'RECOVERY') {
       const recoveryRound = candlesSinceLastPink + 1;
       return {
         action: 'PLAY_10X',
         reason: `🔥 RECOVERY (${recoveryRound}/3). Pós-Deserto.`,
         riskLevel: 'MEDIUM',
         confidence: 90 - (candlesSinceLastPink * 10),
         estimatedTarget: 10.0
       };
    }

    // B. GATILHOS SNIPER (V8 -> V9)
    // Gatilho 1: Azul (<2.0)
    if (lastValue < 2.0) {
        return {
            action: 'PLAY_10X',
            reason: `🎯 V9 GATILHO: Azul (${lastValue.toFixed(2)}x).`,
            riskLevel: 'MEDIUM',
            confidence: 85,
            estimatedTarget: 10.0
        };
    }
    
    // Gatilho 2: Roxa Baixa (2.0 - 3.5)
    if (lastValue >= 2.0 && lastValue <= 3.5) {
        return {
            action: 'PLAY_10X',
            reason: `🎯 V9 GATILHO: Roxa Baixa (${lastValue.toFixed(2)}x).`,
            riskLevel: 'MEDIUM',
            confidence: 80,
            estimatedTarget: 10.0
        };
    }

    // Gatilho 3: Sticky Pink (>=10.0) -> Reentrada
    if (lastValue >= 10.0) {
        return {
            action: 'PLAY_10X',
            reason: `🎯 V9 GATILHO: Rosa Colada (${lastValue.toFixed(2)}x).`,
            riskLevel: 'MEDIUM',
            confidence: 75,
            estimatedTarget: 10.0
        };
    }

    return baseAdvice; // Wait default
  }

  // --- MÉTODOS AUXILIARES (Mantidos) ---

  private static calculateMarketStats(values: number[], window: number) {
    const slice = values.slice(0, window);
    if (slice.length === 0) return { bluePercent: 0, purplePercent: 0, pinkPercent: 0 };

    const blue = slice.filter(v => v < 2.0).length;
    const pink = slice.filter(v => v >= 10.0).length;
    const purple = slice.length - blue - pink;

    return {
      bluePercent: Math.round((blue / slice.length) * 100),
      purplePercent: Math.round((purple / slice.length) * 100),
      pinkPercent: Math.round((pink / slice.length) * 100),
      counts: {
        blue,
        purple,
        pink,
        total: slice.length
      }
    };
  }

  private static analyzePinkIntervals(values: number[]): PinkIntervalAnalysis {
    const pinkIndices: number[] = [];
    for (let i = 0; i < values.length; i++) {
        if (values[i] >= 10.0) pinkIndices.push(i);
    }
    
    if (pinkIndices.length < 2) {
        return { intervalMap: {}, lastPattern: null, topIntervals: [] };
    }
    
    const intervals: number[] = [];
    for (let i = 0; i < pinkIndices.length - 1; i++) {
        const interval = (pinkIndices[i + 1] - pinkIndices[i]) - 1;
        if (interval >= 0) intervals.push(interval);
    }
    
    const intervalMap: Record<number, number> = {};
    intervals.forEach(interval => {
        intervalMap[interval] = (intervalMap[interval] || 0) + 1;
    });
    
    const lastPattern = intervals.length > 0 ? intervals[0] : null;
    
    const topIntervals = Object.entries(intervalMap)
        .map(([interval, count]) => ({ interval: parseInt(interval), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    return { intervalMap, lastPattern, topIntervals };
  }

  // ... (Outros helpers não usados na V9 podem ser removidos ou mantidos por segurança)
  
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
    const indices = v.slice(0, 60).map((val, i) => (val >= 10.0 ? i : -1)).filter(i => i !== -1);
    if (indices.length < 2) return null;
    
    const intervals: number[] = [];
    for (let i = 0; i < indices.length - 1; i++) intervals.push(indices[i+1] - indices[i]);
    
    const freq = new Map<number, number>();
    intervals.forEach(int => freq.set(int, (freq.get(int) || 0) + 1));
    
    const confirmed = Array.from(freq.entries()).filter(([int, count]) => {
        if (int < 3) return count >= 3;
        if (int >= 3 && int <= 5) return count >= 2;
        return count >= 1;
    });
    
    for (const [int, count] of confirmed.sort((a, b) => b[1] - a[1])) {
        const diff = Math.abs(lastIdx - int);
        const maxDiff = int >= 12 ? 2 : 1;
        if (diff <= maxDiff) {
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
    return 10.0; // V8: Target fixo
  }
}
