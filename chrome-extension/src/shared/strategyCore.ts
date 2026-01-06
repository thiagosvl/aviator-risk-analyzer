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

    // 4. DETECTAR PADRÕES & HARD BLOCKS (Auxiliar)
    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);

    // 5. ESTATÍSTICAS DE MERCADO (Janela de 60 velas)
    const marketStats = this.calculateMarketStats(values, 60);

    // 6. IDENTIFICAR FASE (V8 Logic)
    const phase = this.calculatePhaseV8(values, candlesSinceLastPink);

    // 7. GERAR RECOMENDAÇÕES (V8 SNIPER)
    const recPink = this.decideActionSniperV8(values, candlesSinceLastPink, phase);
    
    // V8: A estratégia 2x é redundante ou segue o fluxo principal.
    // Para compatibilidade, retornamos WAIT ou replicamos a decisão principal se quisermos double-bet.
    // Por enquanto, mantemos WAIT na recomendação 2x específica para focar na Pink/10x.
    const rec2x: Recommendation = {
      action: 'WAIT',
      reason: 'Estratégia 2x unificada com Sniper V8 (Ver recPink)',
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
      phase, // Retorna NORMAL, DESERT ou RECOVERY (Mapped to valid types if needed)
      volatilityScore: 0,
      prediction: undefined
    };
  }

  /**
   * V8 SNIPER STRATEGY (UNIFIED)
   * Lógica unificada para decisão de entrada.
   */
  private static decideActionSniperV8(
    values: number[], 
    candlesSinceLastPink: number,
    phase: 'CLUSTER' | 'DESERT' | 'NORMAL' | 'RECOVERY' // Adicionado RECOVERY internamente, cast para output se precisar
  ): Recommendation {
    if (values.length === 0) return { action: 'WAIT', reason: 'Aguardando dados...', riskLevel: 'LOW', confidence: 0 };
    
    // 1. PROTEÇÃO DE DESERTO (Prioridade Absoluta)
    // Se estamos em DESERTO, bloqueia tudo.
    if (phase === 'DESERT') {
      return { 
        action: 'WAIT', 
        reason: `🌵 FASE DESERTO: ${candlesSinceLastPink} velas sem rosa. Bloqueio de segurança.`, 
        riskLevel: 'HIGH', 
        confidence: 0,
        estimatedTarget: 10.0
      };
    }

    // 2. RECUPERAÇÃO PÓS-DESERTO (Agressividade Controlada)
    // Se estamos em RECOVERY, jogamos para buscar o repique
    if (phase === 'RECOVERY') {
      // Calcula qual rodada da recuperação estamos (1, 2 ou 3)
      // Logica: candlesSinceLastPink é o numero de velas desde a rosa que quebrou.
      // Se candlesSinceLastPink == 0 (a rosa foi a ultima), na proxima rodada é a #1.
      // Espera... analyze roda NO FINAL da rodada ou INICIO?
      // Roda com o historico fechado. Se candlesSinceLastPink == 0, a ultima foi rosa. Vamos apostar na proxima.
      const recoveryRound = candlesSinceLastPink + 1; // 1, 2 ou 3
      return {
        action: 'PLAY_10X',
        reason: `🔥 RECUPERAÇÃO PÓS-DESERTO (Tentativa ${recoveryRound}/3). Alta probabilidade de repique.`,
        riskLevel: 'MEDIUM',
        confidence: 90 - (candlesSinceLastPink * 10), // 90, 80, 70
        estimatedTarget: 10.0
      };
    }

    // 3. GATILHOS DE ENTRADA (SNIPER)
    // Se não é Deserto nem Recuperação, estamos em NORMAL. Validamos gatilhos.
    const lastValue = values[0];
    
    // GATILHO 1: AZUL (< 2.0x)
    if (lastValue < 2.0) {
      return {
        action: 'PLAY_10X',
        reason: `🎯 SNIPER V8: Gatilho AZUL detectado (${lastValue.toFixed(2)}x).`,
        riskLevel: 'MEDIUM',
        confidence: 85,
        estimatedTarget: 10.0
      };
    }

    // GATILHO 2: ROXA BAIXA (2.0x - 3.5x)
    if (lastValue >= 2.0 && lastValue <= 3.5) {
      return {
        action: 'PLAY_10X',
        reason: `🎯 SNIPER V8: Gatilho ROXA BAIXA detectado (${lastValue.toFixed(2)}x). Aquecimento.`,
        riskLevel: 'MEDIUM',
        confidence: 80,
        estimatedTarget: 10.0
      };
    }

    // GATILHO 3: ROSA COLADA (Sticky Pink >= 10.0x)
    // Nota: Se estamos aqui, candlesSinceLastPink == 0.
    if (lastValue >= 10.0) {
      return {
        action: 'PLAY_10X',
        reason: `🎯 SNIPER V8: Gatilho ROSA COLADA detectado (${lastValue.toFixed(2)}x).`,
        riskLevel: 'MEDIUM', // Médio risco pois rosa atrai rosa, mas as vezes quebra
        confidence: 75,
        estimatedTarget: 10.0
      };
    }

    // SEM GATILHO
    return {
      action: 'WAIT',
      reason: `⏳ Aguardando gatilho V8 (Azul, Roxa Baixa ou Rosa). Última: ${lastValue.toFixed(2)}x`,
      riskLevel: 'LOW',
      confidence: 0,
      estimatedTarget: 10.0
    };
  }

  /**
   * V8: Identifica fase simplificada (Normal, Deserto, Recovery)
   */
  private static calculatePhaseV8(values: number[], candlesSinceLastPink: number): 'CLUSTER' | 'DESERT' | 'NORMAL' | 'RECOVERY' {
    // DESERT: 12+ velas sem rosa (Ajuste V8: Reduzido de 15 para 12)
    if (candlesSinceLastPink >= 12) return 'DESERT';

    // RECOVERY CHECK
    // Precisamos ver se a última rosa (index = candlesSinceLastPink) QUEBROU um deserto.
    // Ex: values = [2.0, 1.5, 120.0 (Pink), 1.0, 1.0, 1.0 ... 15x ...]
    // values[candlesSinceLastPink] é a rosa.
    // Olhamos para o intervalo ANTERIOR a ela.
    
    // Indice da rosa que estamos analisando
    const pinkIndex = candlesSinceLastPink; 
    
    // Se a rosa está "muito longe" (ex: > 2), já saiu da janela de recovery (3 rodadas).
    // RecoveryWindow = 0 (acabou de dar rosa), 1 (1 vela depois), 2 (2 velas depois).
    if (pinkIndex <= 2) {
      // Buscar a rosa ANTES dessa (a penúltima rosa do array todo)
      const nextPinkIndexRel = values.slice(pinkIndex + 1).findIndex(v => v >= 10.0);
      
      if (nextPinkIndexRel !== -1) {
        const actualNextPinkIndex = pinkIndex + 1 + nextPinkIndexRel;
        const gap = actualNextPinkIndex - pinkIndex - 1; // Velas ENTRE as rosas

        // Se o gap foi >= 12, então a rosa atual (pinkIndex) foi um "Deserter Breaker"
        if (gap >= 12) {
          return 'RECOVERY';
        }
      } else {
        // Se não achou outra rosa no histórico imediato (slice), assume que é deserto se o slice for longo o suficiente
        // Caso de borda: histórico curto. Mas assumimos histórico >= 60.
        // Se slice length > 12 e não tem rosa, então veio de deserto.
        if (values.length > pinkIndex + 1 + 12) {
             return 'RECOVERY';
        }
      }
    }

    // Se não é Deserto nem Recovery, é Normal.
    // Mantemos 'NORMAL' para compatibilidade.
    return 'NORMAL';
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

  private static check3ConsecutiveBluesAfterPink(values: number[]): boolean {
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    if (lastPinkIndex === -1) return false;
    const afterPink = values.slice(0, lastPinkIndex);
    if (afterPink.length < 3) return false;
    return afterPink[0] < 2.0 && afterPink[1] < 2.0 && afterPink[2] < 2.0;
  }

  private static check3ConsecutiveBluesInWindow(v: number[], windowSize: number): boolean {
    const window = v.slice(0, windowSize);
    for (let i = 0; i < window.length - 2; i++) {
      if (window[i] < 2.0 && window[i + 1] < 2.0 && window[i + 2] < 2.0) {
        return true;
      }
    }
    return false;
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
