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

    // 4.2 Trava Pós-Rosa (Critical Rules)
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
      volatilityDensity
    );

    return {
      recommendation,
      pinkPattern: pinkPattern || undefined,
      purpleStreak: streak > 0 ? streak : 0,
      conversionRate: Math.round(purpleConversionRate),
      volatilityDensity,
      candlesSinceLastPink
    };
  }

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

    return opportunities === 0 ? 0 : (conversions / opportunities) * 100;
  }

  private detectPinkPattern(values: number[], lastPinkIndex: number, density: string): PatternData | null {
    if (lastPinkIndex === -1) return null;
    
    const pinkIndices = values
      .map((v, i) => (v >= 10.0 ? i : -1))
      .filter(i => i !== -1);
      
    if (pinkIndices.length < 2) return null;

    const currentDistance = lastPinkIndex;
    const intervals: number[] = [];
    
    for (let i = 0; i < pinkIndices.length - 1; i++) {
      intervals.push(pinkIndices[i+1] - pinkIndices[i]); 
    }

    // Check matches
    for (let i = 0; i < intervals.length; i++) {
      const target = intervals[i];
      const diff = Math.abs(currentDistance - target);
      
      if (diff <= 1) {
        // Hierarchy
        let type: 'DIAMOND' | 'GOLD' | 'SILVER' = 'SILVER';
        let conf = 60;
        
        if (i === 0) { type = 'DIAMOND'; conf = 90; } // Last interval repeated
        else if (i <= 2) { type = 'GOLD'; conf = 75; } // Recent interval

        const ptNames = { 'DIAMOND': 'Alta Freq.', 'GOLD': 'Média Freq.', 'SILVER': 'Baixa Freq.' };

        return {
          type,
          interval: target,
          confidence: conf,
          candlesUntilMatch: target - currentDistance, // Negative means passed, 0 means now
          displayName: ptNames[type] // Adding custom prop for display if needed, but we'll use it in reason
        };
      }
    }
    
    // Look ahead prediction (Are we close?)
    // Find closest interval greater than current
    const nextTarget = intervals.find(int => int >= currentDistance);
    if (nextTarget) {
         if (nextTarget - currentDistance <= 3) {
             return {
                 type: 'SILVER',
                 interval: nextTarget,
                 confidence: 40,
                 candlesUntilMatch: nextTarget - currentDistance,
                 displayName: 'Baixa Freq.'
             };
         }
    }

    return null;
  }

  private decideAction(
    streak: number,
    sincePink: number,
    isLock: boolean,
    isStopLoss: boolean,
    isValidStreak: boolean,
    pinkPattern: PatternData & { displayName?: string } | null,
    density: 'LOW' | 'MEDIUM' | 'HIGH'
  ): Recommendation {

    // 1. PRIORIDADE MAXIMA: STOP LOSS DIÁRIO OU EMOCIONAL (Não temos acesso à banca aqui, então ignora)

    // 2. PADRÃO ROSA (Independência)
    // Se tiver padrão rosa forte, ignora travas leves
    if (pinkPattern && pinkPattern.confidence >= 75 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
       return {
         action: 'PLAY_10X',
         reason: `Padrão ${pinkPattern.displayName || pinkPattern.type} Detectado!`,
         riskLevel: 'LOW', // Risco baixo porque o payout é alto vs custo
         confidence: pinkPattern.confidence
       };
    }

    // 3. TRAVA PÓS-ROSA
    if (isLock) {
       return {
         action: 'WAIT',
         reason: `Trava Pós-Rosa (${sincePink}/3). Aguarde correção.`,
         riskLevel: 'CRITICAL',
         confidence: 100
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
         confidence: 90
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
                confidence: 60
            };
        }
        
        return {
             action: 'WAIT',
             reason: 'Retomada: Aguardando 2ª vela roxa para confirmar.',
             riskLevel: 'MEDIUM',
             confidence: 80
        };
    }

    // 6. JOGO EM SEQUENCIA
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

  private getDefaultAnalysis(): AnalysisData {
    return {
      recommendation: { action: 'WAIT', reason: 'Coletando dados...', riskLevel: 'LOW', confidence: 0 },
      purpleStreak: 0,
      conversionRate: 0,
      volatilityDensity: 'LOW',
      candlesSinceLastPink: 0,
      pinkPattern: undefined
    };
  }

  public updateConfig(config: Partial<AnalyzerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const patternService = new PatternService();
