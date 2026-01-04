/**
 * Pattern Service - Analisa padrões nas velas do Aviator
 *
 * Implementa a lógica "Smart Risk" definida pelo usuário:
 * 1. Foco no histórico PÓS-ROSA.
 * 2. Bloqueio Rígido: 3 velas azuis após a rosa = PARA TUDO até a próxima rosa.
 * 3. Caça-Rosa: Previsão baseada em intervalos anteriores.
 */

import { calculateAverage, calculateMedian, calculateStandardDeviation } from '@src/content/lib/utils';
import type { AnalyzerConfig, DetectedPattern, GameState, PatternAnalysis, RiskLevel } from '@src/content/types';
import { DEFAULT_CONFIG } from '@src/content/types';

export class PatternService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public analyze(gameState: GameState): PatternAnalysis {
    // Garantir ordem: values[0] é o MAIS RECENTE
    const values = [...gameState.history].map(c => c.value);

    if (values.length < 5) {
      return this.getDefaultAnalysis();
    }

    console.log(`[Pattern Service] Analisando ${values.length} velas.`);

    // 1. Métricas Básicas
    const avgMultiplier = calculateAverage(values) || 0.0;
    const minMultiplier = values.length > 0 ? Math.min(...values) : 0.0;
    const maxMultiplier = values.length > 0 ? Math.max(...values) : 0.0;
    const volatility = calculateStandardDeviation(values) || 0.0;

    // 2. Métricas de ROSA e STREAK
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const pinkDistance = lastPinkIndex === -1 ? values.length : lastPinkIndex;
    
    // Streak: Quantas da mesma cor seguidas no início?
    // Positivo = Roxa/Rosa, Negativo = Azul
    const streak = this.calculateStreak(values);

    const recentCandles = values.slice(0, 10);
    const payingCount = recentCandles.filter(v => v >= 2.0).length;
    const winRate = values.length > 0 ? (payingCount / recentCandles.length) * 100 : 0;

    // Avg & Median Post Pink (Media e Mediana das roxas DEPOIS da ultima rosa)
    let avgPostPink = 0;
    let medianPostPink = 0;
    const postPinkSlice = lastPinkIndex === -1 ? values : values.slice(0, lastPinkIndex);
    const postPinkPurples = postPinkSlice.filter(v => v >= 2.0);
    
    if (postPinkPurples.length > 0) {
      avgPostPink = calculateAverage(postPinkPurples) || 0;
      medianPostPink = calculateMedian(postPinkPurples) || 0;
    }

    // 3. Detectar Padrões (incluindo o Bloqueio de Rosa)
    const patterns = this.detectPatterns(values, lastPinkIndex);

    // 4. Calcular Risco (Com OVERRIDE do Bloqueio)
    const { riskLevel, confidence } = this.calculateRisk(values, patterns, volatility, streak, pinkDistance);

    // 5. Recomendação
    const recommendation = this.generateRecommendation(riskLevel, patterns);

    return {
      riskLevel,
      confidence,
      recommendation,
      volatility,
      avgMultiplier,
      minMultiplier,
      maxMultiplier,
      streak,
      pinkDistance,
      avgPostPink,
      medianPostPink,
      winRate,
      lastCandles: values.slice(0, 10),
      patterns,
    };
  }

  private calculateStreak(values: number[]): number {
    if (values.length === 0) return 0;
    const firstIsBlue = values[0] < 2.0;
    let count = 0;

    for (const v of values) {
      const isBlue = v < 2.0;
      if (isBlue === firstIsBlue) {
        count++;
      } else {
        break;
      }
    }

    return firstIsBlue ? -count : count;
  }

  private detectPatterns(values: number[], lastPinkIndex: number): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // --- 1. BLOQUEIO PÓS-ROSA (Regra Suprema) ---
    // Regra: Se após a última rosa houver uma sequência de 3 azuis, BLOQUEIA.
    if (lastPinkIndex !== -1) {
      const postPinkCandles = values.slice(0, lastPinkIndex); // Velas DEPOIS da rosa (mais recentes)
      
      // Procurar sequência de 3 azuis no histórico pós-rosa
      // Se houve 3 azuis LOGO DEPOIS da rosa, ou NO MEIO, bloqueia?
      // Comentário do user: "já quebrou +3 vezes, então eu nao jogarei... até vir outra rosa"
      // Logo, se houver QUALQUER trinca de azuis no período pós-rosa, o bloqueio persiste.
      
      let hasBlueTrio = false;
      let currentBlueRun = 0;
      
      // Varrendo do mais antigo (perto da rosa) para o mais recente
      for (let i = postPinkCandles.length - 1; i >= 0; i--) {
        if (postPinkCandles[i] < 2.0) {
          currentBlueRun++;
          if (currentBlueRun >= 3) {
            hasBlueTrio = true;
            // Não paramos o loop, pois queremos saber se o bloqueio 'passou'?
            // O user diz: "não jogaremos mais ATÉ a proxima rosa".
            // Então uma vez quebrado, *fica quebrado*.
            break; 
          }
        } else {
          currentBlueRun = 0;
        }
      }

      if (hasBlueTrio) {
         patterns.push({
           type: 'PINK_LOCK',
           description: '🚫 BLOQUEIO ATIVO: Ocorreram 3 quebras (azuis) após a última Rosa. Aguarde a próxima Rosa.',
           severity: 'danger',
           confidence: 100
         });
      }
    }

    // --- 2. PREVISÃO DE ROSA (Pattern Matching) ---
    // Em vez de média, procuramos REPETIÇÃO de intervalos históricos.
    // Quanto mais recente o padrão, maior o peso.
    
    const pinkIndices = values
      .map((v, i) => (v >= 10.0 ? i : -1))
      .filter(i => i !== -1);
    
    // Precisamos de pelo menos 2 rosas para ter UM intervalo anterior
    if (pinkIndices.length >= 2) {
      const currentDistance = pinkIndices[0]; // Distância atual desde a última rosa
      
      // Calcular intervalos históricos
      // Ex: Pinks em [10, 25, 30]
      // Int 1 (Recente): 25 - 10 = 15
      // Int 2 (Antigo): 30 - 25 = 5
      const intervals: number[] = [];
      for (let i = 0; i < pinkIndices.length - 1; i++) {
        intervals.push(pinkIndices[i+1] - pinkIndices[i]); // Distância entre rosa[i] e rosa[i+1]
      }
      
      // Verificar se o momento atual bate com algum intervalo histórico
      // Prioridade: Recente > Antigo
      
      for (let i = 0; i < intervals.length; i++) {
        const targetInterval = intervals[i];
        const diff = currentDistance - targetInterval;
        
        // Janela de +/- 1
        if (Math.abs(diff) <= 1) {
          let type = '🥈 POSSÍVEL';
          let confidence = 40;
          let weight = 'silver';
          
          if (i === 0) {
            type = '💎 FORTE'; // Repetição do último
            confidence = 90;
            weight = 'diamond';
          } else if (i <= 2) {
            type = '🥇 MÉDIO'; // Repetição recente
            confidence = 70;
            weight = 'gold';
          }
          
          let subMsg = '';
          if (diff === -1) subMsg = '(1 antes)';
          else if (diff === 0) subMsg = '(no alvo)';
          else if (diff === 1) subMsg = '(1 depois)';

          patterns.push({
            type: 'PINK_PREDICTION',
            description: `🌸 ${type}: Padrão de ${targetInterval} casas se repetindo. Momento: ${currentDistance} ${subMsg}`,
            severity: 'info',
            confidence
          });
          
          // Se achou um padrão forte (Top 3), para de procurar para não poluir
          if (i <= 2) break;
        }
      }
    }

    // --- 3. Outros Padrões Comuns ---
    
    // Sequência de Azuis (Alerta Imediato se não houver bloqueio ainda)
    const streak = this.calculateStreak(values);
    if (streak <= -2) { // 2 ou mais azuis
       patterns.push({
         type: 'LOW_SEQUENCE',
         description: `${Math.abs(streak)} velas azuis seguidas. Cuidado.`,
         severity: streak <= -3 ? 'danger' : 'warning',
         confidence: 90
       });
    }

    // Sequência de Roxas (Surfando)
    if (streak >= 2) {
      patterns.push({
        type: 'HIGH_SEQUENCE',
        description: `Surfando: ${streak} velas pagadoras seguidas!`,
        severity: 'info',
        confidence: 80
      });
    }

    return patterns;
  }

  private calculateRisk(
    values: number[], 
    patterns: DetectedPattern[], 
    volatility: number,
    streak: number,
    pinkDistance: number
  ): { riskLevel: RiskLevel; confidence: number } {
    
    // 1. CHEQUE DE BLOQUEIO (CRITICAL MODO)
    const isLocked = patterns.some(p => p.type === 'PINK_LOCK');
    if (isLocked) {
      return { riskLevel: 'critical', confidence: 100 };
    }

    // 2. Pontuação Base
    let score = 50; // Começa neutro

    // STREAK ATUAL
    if (streak <= -3) {
      score -= 40; 
    } else if (streak === -2) {
      score -= 20; 
    } else if (streak === -1) {
      score += 0; 
    } else if (streak >= 2) {
      score += 20; 
    } else if (streak >= 4) {
      score += 30; 
    }

    // NOTA: Removido bônus de Pink Prediction. A previsão de rosa é separada do risco de vela roxa.

    // WIN RATE Recente (Últimas 5)
    const last5 = values.slice(0, 5);
    const bluesInLast5 = last5.filter(v => v < 2.0).length;
    
    if (bluesInLast5 <= 1) {
      score += 15; // Mercado pagador
    } else if (bluesInLast5 >= 3) {
      score -= 15; // Mercado recolhendo (mas se não formou trinca, ainda joga-se com cuidado)
    }

    // CLAMP SCORE 0-100
    score = Math.max(0, Math.min(100, score));

    // Mapear para Níveis
    let riskLevel: RiskLevel = 'medium';
    if (score >= 80) riskLevel = 'low'; // Excelente (Invertido: Low Risk = High Score)
    else if (score >= 50) riskLevel = 'medium'; // Ok
    else riskLevel = 'high'; // Perigoso

    // Se streak for -2, força no mínimo HIGH risk (Cuidado)
    if (streak <= -2) {
      riskLevel = 'high'; 
    }

    // Confiança baseada na consistência dos dados (Ex: volatilidade baixa = +confiança)
    const confidence = Math.max(0, Math.min(100, 100 - (volatility * 2)));

    return { riskLevel, confidence: Math.round(confidence) };
  }

  private generateRecommendation(riskLevel: RiskLevel, patterns: DetectedPattern[]): string {
    const isLocked = patterns.some(p => p.type === 'PINK_LOCK');
    const pinkOpportunity = patterns.find(p => p.type === 'PINK_PREDICTION');

    if (isLocked) {
      return '⛔ BLOQUEADO: Aguarde a próxima Rosa.';
    }

    if (pinkOpportunity) {
      return '🌸 ALERTA: Possível Rosa Próxima! Jogue buscando proteção.';
    }

    if (riskLevel === 'low') return '✅ JOGUE: Mercado pagador.';
    if (riskLevel === 'medium') return '⚠️ JOGUE COM CAUTELA: Proteja no 2x.';
    if (riskLevel === 'high') return '⛔ AGUARDE: Risco alto de correção.';
    return '⛔ NÃO JOGUE.';
  }

  private getDefaultAnalysis(): PatternAnalysis {
    return {
      riskLevel: 'low',
      confidence: 0,
      recommendation: 'Aguardando dados...',
      volatility: 0,
      avgMultiplier: 0,
      minMultiplier: 0,
      maxMultiplier: 0,
      streak: 0,
      pinkDistance: 0,
      avgPostPink: 0,
      medianPostPink: 0,
      winRate: 0,
      lastCandles: [],
      patterns: []
    };
  }

  public updateConfig(config: Partial<AnalyzerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const patternService = new PatternService();
