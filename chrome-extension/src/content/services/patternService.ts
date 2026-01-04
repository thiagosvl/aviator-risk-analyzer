/**
 * Pattern Service - Definitive Rules V2
 * 
 * Implementa a lógica consolidada das estratégias Roxa (2x) e Rosa (10x).
 * Inclui:
 * - Detector de Densidade de Volatilidade
 * - Retomada Rigorosa (Pink ou 2 Roxas)
 * - Trava Pós-Rosa (3 velas)
 * - Padrões Rosa Hierårquicos (Diamante/Ouro/Prata)
 */

import { AnalysisData, PatternData, Recommendation } from '@src/bridge/messageTypes';
import type { AnalyzerConfig, GameState } from '@src/content/types';
import { DEFAULT_CONFIG } from '@src/content/types';

export class PatternService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public analyze(gameState: GameState): AnalysisData {
    const history = [...gameState.history]; // 0 is most recent
    const values = history.map(c => c.value);

    // Default states
    if (values.length < 5) {
      return this.getDefaultAnalysis();
    }

    // 1. DENSIDADE (Volatility Density)
    // Regra: > 10% de rosas nas últimas 25-50 velas = Alta Densidade (Mercado Excepcional)
    const densityCheckWindow = Math.min(values.length, 50);
    const recentValues = values.slice(0, densityCheckWindow);
    const pinkCount = recentValues.filter(v => v >= 10.0).length;
    const pinkDensityPercent = (pinkCount / densityCheckWindow) * 100;

    let volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    // Se tiver menos de 5 velas, mantemos LOW por segurança, mas o usuário pediu para calcular com o que tem.
    // Vou manter apenas um sanity check mínimo de 3 velas.
    if (densityCheckWindow >= 3) {
        if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
        else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';
    }

    // 2. CONVERSION RATE (Taxa de Conversão de Roxas)
    // Regra: Quantas roxas viraram sequência (2+)?
    const purpleConversionRate = this.calculateConversionRate(values, 25);

    // 3. STREAK & PINK DISTANCE
    const streak = this.calculateStreak(values);
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

    // 4. DETECTAR PADRÕES & REGRAS
    const patterns: PatternData[] = [];
    
    // 4.1 Padrão Rosa (Intervalos)
    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);
    if (pinkPattern) patterns.push(pinkPattern);

    // 4.2 Trava Pós-Rosa (Critical Rules) e EXCEÇÃO
    // Regra Original: Pula 3 velas após rosa.
    // Exceção (User V3): Se nas últimas 25, "double blue" (2 reds seguidos) ocorreu 1 ou menos vezes,
    // significa que o mercado está pagando bem (corrigindo pouco). Nesse caso, IGNORA a trava.
    const doubleBlueStats = this.calculateDoubleBlueStats(values, 25);
    const isDoubleBlueSafe = doubleBlueStats <= 1; // 0 ou 1 ocorrência
    
    let isPostPinkLock = candlesSinceLastPink < 3; 

    // APLICANDO A EXCEÇÃO:
    let lockReason = `Trava Pós-Rosa (${candlesSinceLastPink}/3). Aguarde correção.`;
    if (isPostPinkLock && isDoubleBlueSafe) {
        isPostPinkLock = false; // Override lock
        // Log ou reason poderia indicar isso, mas no fluxo normal ele vai cair nas outras regras (sequence ou wait)
    }

    // 4.3 Stop Loss Check (2 Azuis seguidas)
    // streak <= -2 significa 2 ou mais azuis
    const isStopLoss = streak <= -2;

    // 4.4 Sequência Roxa (Validation)
    // Se streak >= 1 (tem roxa), validamos se vale entrar na próxima
    const isPurpleStreakValid = streak >= 1 && purpleConversionRate >= 50;

    // 5. GERAR RECOMENDAÇÕES INDEPENDENTES
    const rec2x = this.decideAction2x(streak, candlesSinceLastPink, isPostPinkLock, isStopLoss, isPurpleStreakValid, volatilityDensity, lockReason, values);
    const recPink = this.decideActionPink(pinkPattern);

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

  private decideAction2x(
    streak: number,
    sincePink: number,
    isLock: boolean,
    isStopLoss: boolean,
    isValidStreak: boolean,
    density: 'LOW' | 'MEDIUM' | 'HIGH',
    lockReason: string,
    values: number[] // Pass values to check history
  ): Recommendation {
      // 1. TRAVA PÓS-ROSA
      if (isLock) {
         return {
           action: 'WAIT',
           reason: lockReason,
           riskLevel: 'CRITICAL',
           confidence: 100
         };
      }
  
      // 2. STOP LOSS (2 Azuis)
      if (isStopLoss) {
         // Regra de RETOMADA
         return {
           action: 'STOP',
           reason: 'Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas.',
           riskLevel: 'HIGH',
           confidence: 90
         };
      }
  
      // 3. RETOMADA RIGOROSA CHECK
      // Check for recent Deep Downtrend (3+ Blues)
      // Logic: If we had a bad run recently, we need stronger confirmation.
      const deepDowntrend = this.checkDeepDowntrend(values);
       
      if (streak === 1) {
          // Standard Retomada (Wait for 2nd)
          return {
               action: 'WAIT',
               reason: deepDowntrend 
                  ? 'Recuperação Lenta (3 Reds Recentes). Aguarde 3 Roxas.' 
                  : 'Aguardando 2ª vela roxa para confirmar.',
               riskLevel: 'MEDIUM',
               confidence: 80
          };
      }
      
      if (streak === 2 && deepDowntrend) {
           return {
               action: 'WAIT',
               reason: 'Recuperação Lenta (3 Reds Recentes). Aguarde 3 Roxas.',
               riskLevel: 'MEDIUM',
               confidence: 85
           };
      }
  
      // 4. JOGO EM SEQUENCIA
      if (streak >= 2) {
         if (isValidStreak) {
             return {
                 action: 'PLAY_2X',
                 reason: 'Surfando Sequência (Conversão > 50%).',
                 riskLevel: 'LOW',
                 confidence: 85
             };
         } else {
             return {
                 action: 'WAIT',
                 reason: 'Sequência Suspeita (Conversão Baixa).',
                 riskLevel: 'MEDIUM',
                 confidence: 50
             };
         }
      }
  
      // Default: Wait
      return {
          action: 'WAIT',
          reason: 'Aguardando oportunidade clara.',
          riskLevel: 'MEDIUM',
          confidence: 50
      };
  }

  private decideActionPink(pinkPattern: PatternData & { displayName?: string, occurrences?: number } | null): Recommendation {
      if (pinkPattern && pinkPattern.confidence >= 60 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
          const typeMap: Record<string, string> = { 'DIAMOND': '💎', 'GOLD': '🥇', 'SILVER': '🥈' };
          const icon = typeMap[pinkPattern.type] || '';
          
          return {
            action: 'PLAY_10X',
            reason: `${icon} Padrão Intervalo ${pinkPattern.interval} (${pinkPattern.occurrences}x confirmados)`,
            riskLevel: 'LOW',
            confidence: pinkPattern.confidence
          };
       }

       return {
           action: 'WAIT',
           reason: 'Buscando padrão confirmado...',
           riskLevel: 'LOW',
           confidence: 0
       };
  }

  // Helper getters
  private calculateStreak(values: number[]): number {
    if (values.length === 0) return 0;
    const firstIsBlue = values[0] < 2.0;
    let count = 0;
    for (const v of values) {
      if ((v < 2.0) === firstIsBlue) count++;
      else break;
    }
    return firstIsBlue ? -count : count;
  }

  private calculateDoubleBlueStats(values: number[], lookback: number): number {
      // Conta quantas vezes ocorreu "Double Blue" (2 velas < 2.00x seguidas) na janela
      const slice = values.slice(0, lookback);
      let count = 0;
      for (let i = 0; i < slice.length - 1; i++) {
          if (slice[i] < 2.0 && slice[i+1] < 2.0) {
              count++;
          }
      }
      return count;
  }

  private calculateConversionRate(values: number[], lookback: number): number {
    // Conta quantas vezes uma roxa (que não era parte de uma seq maior já contada) 
    // teve outra roxa na sequência.
    // Simplificação: De todas as velas roxas na janela, quantas têm uma roxa DEPOIS delas (no passado)?
    // Não, a lógica é: Dado que saiu uma roxa, qual a chance da PRÓXIMA ser roxa?
    
    const slice = values.slice(0, lookback);
    let opportunities = 0;
    let conversions = 0;

    // Iteramos do mais recente para o antigo (excluindo o índice 0 pois não sabemos o futuro dele, 
    // a menos que estejamos calculando estatística passada. Para estatística 'realizada', ignoramos a atual
    // se ela for a recém saída. Mas ok olhar histórico fechado.)
    
    for (let i = 1; i < slice.length; i++) {
        const current = slice[i]; // Vela anterior no tempo
        const next = slice[i-1];  // Vela que veio depois dela

        if (current >= 2.0 && current < 10.0) { // Roxa (excluindo rosa pra focar na mecânica 2x)
            opportunities++;
            if (next >= 2.0) {
                conversions++;
            }
        }
    }

    // Requiere amostragem mínima para não dar 100% ou 0% aleatório
    if (opportunities < 2) return 0;

    return (conversions / opportunities) * 100;
  }

  private detectPinkPattern(values: number[], lastPinkIndex: number, density: string): PatternData | null {
    if (lastPinkIndex === -1) return null;
    
    const pinkIndices = values
      .slice(0, 25) // User Request: STRICT Momentum (Last 25 candles only). 
      // If no pattern here, we don't play.
      .map((v, i) => (v >= 10.0 ? i : -1))
      .filter(i => i !== -1);
      
    if (pinkIndices.length < 3) return null; // Need at least 2 intervals (3 pinks)

    const currentDistance = lastPinkIndex;
    const intervals: number[] = [];
    
    for (let i = 0; i < pinkIndices.length - 1; i++) {
      intervals.push(pinkIndices[i+1] - pinkIndices[i]); 
    }

    // New V3 Logic: Frequency Analysis
    const frequencyMap = new Map<number, number>();
    intervals.forEach(int => frequencyMap.set(int, (frequencyMap.get(int) || 0) + 1));

    // Filter Confirmed Intervals (>= 2 occurrences)
    const confirmedIntervals = Array.from(frequencyMap.entries())
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1]); // Sort by frequency desc

    if (confirmedIntervals.length === 0) return null;

    // Check matches against confirmed intervals
    for (const [interval, count] of confirmedIntervals) {
        const diff = Math.abs(currentDistance - interval);
        
        if (diff <= 1) {
            // Confidence calculation V3
            let confidence = 50 + (count * 15);
            confidence = Math.min(confidence, 95);

            let type: 'DIAMOND' | 'GOLD' | 'SILVER' = 'SILVER';
            if (count >= 3) type = 'DIAMOND';
            else if (count >= 2) type = 'GOLD';

            return {
                type,
                interval,
                confidence,
                candlesUntilMatch: interval - currentDistance,
                // @ts-ignore - Adding custom property not in original interface for internal display logic
                occurrences: count, 
                displayName: `${count}x Confirmado`
            };
        }
    }
    
    // Look ahead prediction for confirmed patterns only
    const nextTarget = confirmedIntervals.find(([int]) => int >= currentDistance);
    if (nextTarget) {
         const [interval, count] = nextTarget;
         if (interval - currentDistance <= 3) {
             return {
                 type: count >= 2 ? 'GOLD' : 'SILVER',
                 interval: interval,
                 confidence: 50 + (count * 10), // Lower confidence for prediction
                 candlesUntilMatch: interval - currentDistance,
                 // @ts-ignore
                 occurrences: count,
                 displayName: `${count}x Previsto`
             };
         }
    }

    return null;
  }

  private getDefaultAnalysis(): AnalysisData {
    return {
      recommendation2x: { action: 'WAIT', reason: 'Coletando dados...', riskLevel: 'LOW', confidence: 0 },
      recommendationPink: { action: 'WAIT', reason: 'Buscando padrão...', riskLevel: 'LOW', confidence: 0 },
      purpleStreak: 0,
      conversionRate: 0,
      volatilityDensity: 'LOW',
      candlesSinceLastPink: 0,
      pinkPattern: undefined
    };
  }

  // Implementation inside helper using values
  private checkDeepDowntrend(values: number[]): boolean {
      // Check last 10 candles for a sequence of 3+ blues
      let blueStreak = 0;
      for (let i = 0; i < Math.min(values.length, 10); i++) {
          if (values[i] < 2.0) {
              blueStreak++;
              if (blueStreak >= 3) return true;
          } else {
              blueStreak = 0;
          }
      }
      return false;
  }
}

export const patternService = new PatternService();
