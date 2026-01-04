/**
 * Pattern Service - Definitive Rules V3
 *
 * Implementa a lógica consolidada das estratégias Roxa (2x) e Rosa (10x).
 *
 * CORREÇÕES V3:
 * - Filtro de padrões confirmados (≥2 ocorrências)
 * - Priorização por frequência (padrão mais forte primeiro)
 * - Confiança baseada em frequência estatística
 * - Hierarquia baseada em frequência, não posição
 *
 * Inclui:
 * - Detector de Densidade de Volatilidade
 * - Retomada Rigorosa (Pink ou 2 Roxas)
 * - Trava Pós-Rosa (3 velas) - Apenas para Roxa
 * - Padrões Rosa Hierárquicos (Diamante/Ouro/Prata)
 * - Independência total entre Roxa e Rosa
 */

import { DEFAULT_CONFIG } from '@src/content/types';
import type { AnalysisData, PatternData, Recommendation } from '@src/bridge/messageTypes';
import type { AnalyzerConfig, GameState } from '@src/content/types';

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
    if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
    else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';

    // 2. CONVERSION RATE (Taxa de Conversão de Roxas)
    // Regra: Quantas roxas viraram sequência (2+)?
    const purpleConversionRate = this.calculateConversionRate(values, 25);

    // 3. STREAK & PINK DISTANCE
    const streak = this.calculateStreak(values);
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

    // 4. DETECTAR PADRÕES & REGRAS
    const patterns: PatternData[] = [];

    // 4.1 Padrão Rosa (Intervalos) - V3 CORRIGIDO
    const pinkPattern = this.detectPinkPatternV3(values, lastPinkIndex);
    if (pinkPattern) patterns.push(pinkPattern);

    // 4.2 Trava Pós-Rosa (Critical Rules) - Apenas para Roxa
    const isPostPinkLock = candlesSinceLastPink < 3;

    // 4.3 Stop Loss Check (2 Azuis seguidas)
    // streak <= -2 significa 2 ou mais azuis
    const isStopLoss = streak <= -2;

    // 4.4 Sequência Roxa (Validation)
    // Se streak >= 1 (tem roxa), validamos se vale entrar na próxima
    const isPurpleStreakValid = streak >= 1 && purpleConversionRate >= 50;

    // 5. GERAR RECOMENDAÇÃO (Decision Matrix)
    const recommendation = this.decideAction(
      streak,
      candlesSinceLastPink,
      isPostPinkLock,
      isStopLoss,
      isPurpleStreakValid,
      pinkPattern,
      volatilityDensity,
    );

    return {
      recommendation,
      pinkPattern: pinkPattern || undefined,
      purpleStreak: streak > 0 ? streak : 0,
      conversionRate: Math.round(purpleConversionRate),
      volatilityDensity,
      candlesSinceLastPink,
    };
  }

  private calculateStreak(values: number[]): number {
    if (values.length === 0) return 0;
    const firstIsBlue = values[0] < 2.0;
    let count = 0;
    for (const v of values) {
      if (v < 2.0 === firstIsBlue) count++;
      else break;
    }
    return firstIsBlue ? -count : count;
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
      const next = slice[i - 1]; // Vela que veio depois dela

      if (current >= 2.0 && current < 10.0) {
        // Roxa (excluindo rosa pra focar na mecânica 2x)
        opportunities++;
        if (next >= 2.0) {
          conversions++;
        }
      }
    }

    return opportunities === 0 ? 0 : (conversions / opportunities) * 100;
  }

  /**
   * V3 CORRIGIDO: Detecta padrões Rosa com filtro de confirmação
   *
   * Mudanças:
   * - Só aceita intervalos com ≥2 ocorrências (padrão confirmado)
   * - Prioriza padrão mais frequente
   * - Confiança baseada em frequência (50% + 15% por ocorrência)
   * - Hierarquia baseada em frequência (DIAMOND ≥3x, GOLD ≥2x)
   * - Adiciona campo 'occurrences' ao retorno
   */
  private detectPinkPatternV3(values: number[], lastPinkIndex: number): PatternData | null {
    if (lastPinkIndex === -1) return null;

    const pinkIndices = values.map((v, i) => (v >= 10.0 ? i : -1)).filter(i => i !== -1);

    // V3: Precisa de pelo menos 3 rosas para ter 2 intervalos
    if (pinkIndices.length < 3) return null;

    const currentDistance = lastPinkIndex;
    const intervals: number[] = [];

    // Calcular todos os intervalos
    for (let i = 0; i < pinkIndices.length - 1; i++) {
      intervals.push(pinkIndices[i + 1] - pinkIndices[i]);
    }

    // V3 NOVO: Contar frequência de cada intervalo
    const intervalFrequency = new Map<number, number>();
    intervals.forEach(interval => {
      intervalFrequency.set(interval, (intervalFrequency.get(interval) || 0) + 1);
    });

    // V3 NOVO: Filtrar apenas intervalos confirmados (count ≥ 2)
    const confirmedIntervals = Array.from(intervalFrequency.entries())
      .filter(([, count]) => count >= 2)
      .map(([interval, count]) => ({ interval, count }))
      .sort((a, b) => b.count - a.count); // Ordenar por frequência (maior primeiro)

    // V3 NOVO: Se não há padrões confirmados, não joga
    if (confirmedIntervals.length === 0) {
      // DEBUG: Log para análise
      console.log('[PatternService V3] Nenhum padrão confirmado detectado', {
        intervals,
        frequency: Object.fromEntries(intervalFrequency),
        pinkCount: pinkIndices.length,
      });
      return null;
    }

    // V3 NOVO: Verificar se algum padrão confirmado dá match com ±1
    for (const { interval, count } of confirmedIntervals) {
      const diff = Math.abs(currentDistance - interval);

      if (diff <= 1) {
        // Dentro do range ±1
        // V3: Calcular confiança baseada em frequência
        let confidence = 50 + count * 15; // Base 50% + 15% por ocorrência
        confidence = Math.min(confidence, 95); // Máximo 95%

        // V3: Determinar tipo baseado em frequência
        let type: 'DIAMOND' | 'GOLD' | 'SILVER' = 'SILVER';
        if (count >= 3) type = 'DIAMOND';
        else if (count >= 2) type = 'GOLD';

        // DEBUG: Log para análise
        console.log('[PatternService V3] Padrão confirmado detectado!', {
          interval,
          count,
          confidence,
          type,
          currentDistance,
          diff,
        });

        return {
          type,
          interval,
          confidence,
          candlesUntilMatch: interval - currentDistance,
          occurrences: count, // V3 NOVO: Adicionar contagem
        };
      }
    }

    // V3 NOVO: Look ahead apenas para padrões confirmados
    const nextTarget = confirmedIntervals.find(({ interval }) => interval >= currentDistance);
    if (nextTarget && nextTarget.interval - currentDistance <= 3) {
      const confidence = 50 + nextTarget.count * 10;

      console.log('[PatternService V3] Padrão confirmado próximo', {
        interval: nextTarget.interval,
        count: nextTarget.count,
        confidence,
        candlesUntil: nextTarget.interval - currentDistance,
      });

      return {
        type: 'GOLD',
        interval: nextTarget.interval,
        confidence,
        candlesUntilMatch: nextTarget.interval - currentDistance,
        occurrences: nextTarget.count,
      };
    }

    // DEBUG: Log quando não encontra match
    console.log('[PatternService V3] Padrões confirmados existem, mas nenhum dá match', {
      confirmedIntervals,
      currentDistance,
    });

    return null;
  }

  private decideAction(
    streak: number,
    sincePink: number,
    isLock: boolean,
    isStopLoss: boolean,
    isValidStreak: boolean,
    pinkPattern: PatternData | null,
    density: 'LOW' | 'MEDIUM' | 'HIGH',
  ): Recommendation {
    // 1. PRIORIDADE MAXIMA: STOP LOSS DIÁRIO OU EMOCIONAL (Não temos acesso à banca aqui, então ignora)

    // 2. PADRÃO ROSA (Independência)
    // V3: Rosa ignora trava da Roxa (são independentes)
    // Se tiver padrão rosa CONFIRMADO (≥2 ocorrências), joga
    if (pinkPattern && pinkPattern.confidence >= 65 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
      // V3: Confiança mínima 65% (equivale a 2 ocorrências: 50 + 15)
      return {
        action: 'PLAY_10X',
        reason: `Padrão ${pinkPattern.type} Detectado! (${pinkPattern.occurrences}x confirmado)`,
        riskLevel: 'LOW', // Risco baixo porque o payout é alto vs custo
        confidence: pinkPattern.confidence,
      };
    }

    // 3. TRAVA PÓS-ROSA (Apenas para Roxa)
    if (isLock) {
      return {
        action: 'WAIT',
        reason: `Trava Pós-Rosa (${sincePink}/3). Aguarde correção.`,
        riskLevel: 'CRITICAL',
        confidence: 100,
      };
    }

    // 4. STOP LOSS (2 Azuis)
    if (isStopLoss) {
      // Regra de RETOMADA: Só sai do Stop se:
      // A) Vier uma Rosa (ja tratamos acima se tiver padrao, se nao, espera aparecer)
      // B) Vierem 2 Roxas consecutivas (validando a virada)

      // Aqui estamos analisando ANTES da vela acontecer ou DEPOIS?
      // Estamos analisando o estado ATUAL para a PROXIMA vela.
      // Se streak é -2, a ultima foi azul. Proxima? WAIT.

      return {
        action: 'STOP',
        reason: 'Stop Loss Ativo (2 Azuis). Aguarde 2 Roxas ou 1 Rosa.',
        riskLevel: 'HIGH',
        confidence: 90,
      };
    }

    // 5. RETOMADA RIGOROSA CHECK
    // Se estavamos em stop (o streak anterior era ruim), precisamos de confirmacao.
    // Se streak atual é 1 (veio uma roxa), mas antes era -2... a gente espera a segunda?
    // Sim. Regra: "Aguarde 2 roxas consecutivas".
    // Entao se streak == 1, WAIT. Se streak == 2, PLAY.
    if (streak === 1) {
      // Exceção: Se densidade for ALTA, podemos arriscar na primeira?
      // Relatório diz: "Outliers relaxam filtros".
      if (density === 'HIGH') {
        return {
          action: 'PLAY_2X',
          reason: 'Retomada Agressiva (Alta Densidade).',
          riskLevel: 'MEDIUM',
          confidence: 60,
        };
      }

      return {
        action: 'WAIT',
        reason: 'Retomada: Aguardando 2ª vela roxa para confirmar.',
        riskLevel: 'MEDIUM',
        confidence: 80,
      };
    }

    // 6. JOGO EM SEQUENCIA
    if (streak >= 2) {
      if (isValidStreak) {
        return {
          action: 'PLAY_2X',
          reason: 'Surfando Sequência (Conversão > 50%).',
          riskLevel: 'LOW',
          confidence: 85,
        };
      } else {
        return {
          action: 'WAIT',
          reason: 'Sequência Suspeita (Conversão Baixa).',
          riskLevel: 'MEDIUM',
          confidence: 50,
        };
      }
    }

    // Default: Wait
    return {
      action: 'WAIT',
      reason: 'Aguardando oportunidade clara.',
      riskLevel: 'MEDIUM',
      confidence: 50,
    };
  }

  private getDefaultAnalysis(): AnalysisData {
    return {
      recommendation: { action: 'WAIT', reason: 'Coletando dados...', riskLevel: 'LOW', confidence: 0 },
      purpleStreak: 0,
      conversionRate: 0,
      volatilityDensity: 'LOW',
      candlesSinceLastPink: 0,
      pinkPattern: undefined,
    };
  }

  public updateConfig(config: Partial<AnalyzerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const patternService = new PatternService();
