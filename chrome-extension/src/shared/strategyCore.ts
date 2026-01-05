export interface Recommendation {
  action: 'PLAY_2X' | 'PLAY_10X' | 'WAIT' | 'STOP' | 'STOP_WIN' | 'STOP_LOSS';
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  ruleChecklist?: Record<string, boolean>; // Ex: { "Densidade OK": true, "Trava Pós-Rosa": false }
  estimatedTarget?: number; // Sugestão de saída (ex: 2.50)
}

export interface PatternData {
  type: 'DIAMOND' | 'GOLD' | 'SILVER';
  interval: number;
  confidence: number;
  candlesUntilMatch: number;
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

    // 2. CONVERSION RATE & BLUE DOMINANCE (V3.6: Window set to 30)
    const purpleConversionRate = this.calculateConversionRate(values, windowSize);
    const isBlueDominant = blueDensityPercent > 60; 

    // 3. STREAK & PINK DISTANCE
    const streak = this.calculateStreak(values);
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

    // 4. DETECTAR PADRÕES & REGRAS (V3.6: Independência Total)
    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);
    const doubleBlueStats = this.calculateDoubleBlueStats(values, 25);
    const isMooningMarket = (values.slice(0, 20).filter(v => v >= 2.0).length / 20) * 100 >= 45 || doubleBlueStats === 0; 
    
    const isPostPinkLock = candlesSinceLastPink < 3; 

    const isStopLoss = streak <= -2;
    const isXadrez = this.checkXadrez(values);
    const isPurpleStreakValid = streak >= 2 && purpleConversionRate >= 55;

    // 5. CALCULAR ALVO DINÂMICO (V4.1)
    const estimatedTarget = this.calculateEstimatedTarget(values, candlesSinceLastPink);

    // 6. GERAR RECOMENDAÇÕES (V3.6: Cada estratégia recebe seu estado de lock)
    const rec2x = this.decideAction2x(streak, isPostPinkLock, isStopLoss, isPurpleStreakValid, volatilityDensity, values, isBlueDominant, isXadrez, purpleConversionRate, estimatedTarget);
    
    // V3.9: Contar rosas na janela de 25
    const pinkCount25 = values.slice(0, 25).filter(v => v >= 10.0).length;
    const recPink = this.decideActionPink(pinkPattern, isPostPinkLock, candlesSinceLastPink, pinkCount25);

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

  private static decideAction2x(
    streak: number,
    isPostPink: boolean,
    isStopLoss: boolean,
    isValidStreak: boolean,
    density: 'LOW' | 'MEDIUM' | 'HIGH',
    values: number[],
    isBlueDominant: boolean,
    isXadrez: boolean,
    purpleConversionRate: number,
    estimatedTarget: number
  ): Recommendation {
      const checklist: Record<string, boolean> = {
          "Mercado Aberto (Blue < 60%)": !isBlueDominant,
          "Fora da Trava Pós-Rosa": !isPostPink,
          "Sem Stop Loss": !isStopLoss,
          "Padrão Confirmado": (isXadrez && streak === -1) || streak >= 3 || (streak >= 2 && isValidStreak)
      };

      if (isBlueDominant) {
          return { action: 'WAIT', reason: 'Dominância Azul (>60%). Risco alto.', riskLevel: 'HIGH', confidence: 90, ruleChecklist: checklist, estimatedTarget };
      }
      if (isPostPink) {
          // V3.10: Bypass contextual para 2x em mercados excelentes
          const canBypass2x = density !== 'LOW' && purpleConversionRate >= 60 && streak >= 3;
          if (!canBypass2x) {
              return { action: 'WAIT', reason: `Aguardando correção pós-rosa.`, riskLevel: 'CRITICAL', confidence: 100, ruleChecklist: checklist, estimatedTarget };
          }
          // Se bypass, continua análise normal (mercado excelente)
      }
      // V3.10: Padrão Xadrez removido (33% acerto em produção)
      if (isStopLoss) {
         return { action: 'STOP', reason: 'Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas.', riskLevel: 'HIGH', confidence: 90, ruleChecklist: checklist };
      }
      
      const deepDowntrend = this.checkDeepDowntrend(values);
      if (streak === 1) {
          return { action: 'WAIT', reason: deepDowntrend ? 'Recuperação Lenta (3 Reds Recentes).' : 'Aguardando 2ª vela roxa.', riskLevel: 'LOW', confidence: 50, ruleChecklist: checklist, estimatedTarget };
      }
      if (streak === 2 && !deepDowntrend) {
          return { action: 'WAIT', reason: 'Aguardando 3ª vela roxa.', riskLevel: 'LOW', confidence: 60, ruleChecklist: checklist, estimatedTarget };
      }
      if (streak >= 3 || (streak >= 2 && isValidStreak)) {
          return { action: 'PLAY_2X', reason: 'Surfando Sequência Confirmada.', riskLevel: 'LOW', confidence: 85, ruleChecklist: checklist, estimatedTarget };
      }
      return { action: 'WAIT', reason: 'Buscando sinal claro.', riskLevel: 'LOW', confidence: 10, ruleChecklist: checklist, estimatedTarget };
  }

  private static decideActionPink(pattern: PatternData | null, isPostPink: boolean, candlesSincePink: number, pinkCount25: number): Recommendation {
      // V3.10: Relaxa regra se houver padrão confirmado
      const hasConfirmedPattern = pattern !== null && pattern.confidence >= 70;
      const minPinkCount = hasConfirmedPattern ? 1 : 2;
      
      const isShortPattern = pattern !== null && pattern.interval <= 5;
      // Convertemos para boolean estrito para evitar o erro de tipagem no checklist
      const canBypassLock = !!(isPostPink && isShortPattern && pattern && pattern.confidence >= 70);
      
      const checklist: Record<string, boolean> = {
          "Frequência (2 Pinks em 25)": pinkCount25 >= minPinkCount,
          "Trava Pós-Rosa": (!isPostPink || canBypassLock),
          "Padrão Sniper Identificado": hasConfirmedPattern,
          "Dentro da Zona de Tiro": (pattern !== null && Math.abs(pattern.candlesUntilMatch) <= 1)
      };

      // V3.10: Aceita 1 rosa se houver padrão confirmado
      if (pinkCount25 < minPinkCount) {
          return { action: 'WAIT', reason: `Aguardando ${minPinkCount === 1 ? '1' : '2'}ª Rosa na janela (Ative: ${pinkCount25}/${minPinkCount}).`, riskLevel: 'HIGH', confidence: 0, ruleChecklist: checklist };
      }

      if (isPostPink && !canBypassLock) {
          return { action: 'WAIT', reason: `Trava Pós-Rosa (${candlesSincePink}/3).`, riskLevel: 'CRITICAL', confidence: 100, ruleChecklist: checklist };
      }

      if (pattern && pattern.confidence >= 70 && Math.abs(pattern.candlesUntilMatch) <= 1 && pattern.interval >= 3) {
          const windowText = pattern.candlesUntilMatch === 0 ? "EXATO" : "ZONA +/- 1";
          const bypassText = canBypassLock ? " (Bypass Sniper V3.10)" : "";
          return { action: 'PLAY_10X', reason: `🌸 Alvo V3.10: Intervalo ${pattern.interval}${bypassText} (${windowText})`, riskLevel: 'MEDIUM', confidence: pattern.confidence, ruleChecklist: checklist };
      }
      return { action: 'WAIT', reason: 'Buscando padrão confirmado...', riskLevel: 'LOW', confidence: 0, ruleChecklist: checklist };
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

  private static detectPinkPattern(v: number[], lastIdx: number, density: string): PatternData | null {
    if (lastIdx === -1) return null;
    const indices = v.slice(0, 50).map((val, i) => (val >= 10.0 ? i : -1)).filter(i => i !== -1);
    if (indices.length < 2) return null;
    
    const intervals: number[] = [];
    for (let i = 0; i < indices.length - 1; i++) intervals.push(indices[i+1] - indices[i]);
    
    const freq = new Map<number, number>();
    intervals.forEach(int => freq.set(int, (freq.get(int) || 0) + 1));
    
    // V3.10: Intervalos 3-5 exigem 3+ ocorrências (mais restritivo)
    const confirmed = Array.from(freq.entries()).filter(([int, count]) => {
        if (int < 3) return count >= 4; // Intervalos 1-2: 4+ ocorrências
        if (int >= 3 && int <= 5) return count >= 3; // Intervalos 3-5: 3+ ocorrências (NOVO)
        return count >= 2; // Intervalos 6+: 2+ ocorrências
    });
    
    // V3.4: Prioriza intervalos recentes e consistentes
    for (const [int, count] of confirmed.sort((a, b) => b[1] - a[1])) {
        const diff = Math.abs(lastIdx - int);
        // Só entramos se o intervalo detectado for compatível com a distância atual
        if (diff <= 1) {
            return {
              type: int >= 15 ? 'DIAMOND' : int >= 8 ? 'GOLD' : 'SILVER',
              interval: int,
              confidence: Math.min(95, 50 + (count * 12)),
              candlesUntilMatch: int - lastIdx
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
    // V3.8: Padrão 🔵 🟣 🔵 🟣 🔵 (5 velas alternadas)
    const p = v.slice(0, 5).map(val => val < 2.0);
    return (p[0] !== p[1] && p[1] !== p[2] && p[2] !== p[3] && p[3] !== p[4]);
  }

  private static calculateEstimatedTarget(values: number[], candlesSincePink: number): number {
    // Pegamos as velas desde o último rosa, mas garantimos um mínimo de 10 para ter estatística
    const analysisWindowSize = Math.max(candlesSincePink, 10);
    const window = values.slice(0, Math.min(analysisWindowSize, 25));
    const purples = window.filter(v => v >= 2.0 && v < 10.0);

    if (purples.length < 2) return 2.00; // Padrão de segurança

    // Mapear frequências por "casas" decimais (2.0, 2.5, 3.0, 4.0 etc)
    // Para ser conservador, vamos arredondar para baixo em passos de 0.5
    const buckets = purples.map(v => Math.floor(v * 2) / 2);
    const freqMap = new Map<number, number>();
    buckets.forEach(b => freqMap.set(b, (freqMap.get(b) || 0) + 1));

    // Encontrar o balanço entre frequência e valor alto
    // Queremos o maior valor que tenha pelo menos 40% de ocorrência entre os roxos
    const sortedBuckets = Array.from(freqMap.keys()).sort((a, b) => b - a);
    
    for (const bucket of sortedBuckets) {
        let countAbove = 0;
        purples.forEach(v => { if (v >= bucket) countAbove++; });
        
        const probability = countAbove / purples.length;
        if (probability >= 0.6) { // 60% de chance histórica de atingir esse valor
            return Math.min(4.0, bucket); // Capamos em 4.0 para manter o 2x como "defesa/médio"
        }
    }

    return 2.00;
  }
}