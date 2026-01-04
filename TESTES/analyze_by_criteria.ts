#!/usr/bin/env tsx
/**
 * ANÁLISE DETALHADA POR CRITÉRIO - AVIATOR ANALYZER V3
 * 
 * Gera relatório mostrando:
 * - Cada jogada (green/red)
 * - Critério usado (motivo da entrada)
 * - Taxa de acerto por critério
 * - Identificação de critérios bons/ruins
 * 
 * Uso:
 *   npx tsx TESTES/analyze_by_criteria.ts [quantidade]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.join(__dirname, 'test_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Interfaces
interface Recommendation {
    action: 'WAIT' | 'PLAY_2X' | 'PLAY_10X' | 'STOP' | 'STOP_LOSS';
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
}

interface PatternData {
    type: 'DIAMOND' | 'GOLD' | 'SILVER';
    interval: number;
    confidence: number;
    candlesUntilMatch: number;
    occurrences?: number;
    displayName?: string;
}

interface AnalysisData {
    recommendation2x: Recommendation;
    recommendationPink: Recommendation;
    pinkPattern?: PatternData;
    purpleStreak: number;
    conversionRate: number;
    volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH';
    candlesSinceLastPink: number;
}

interface GameState {
    history: { value: number }[];
    isGameRunning: boolean;
}

interface AnalyzerConfig {
    bet2x: number;
    bet10x: number;
}

interface PlayRecord {
    round: number;
    strategy: '2x' | '10x';
    criterion: string;
    confidence: number;
    result: number;
    success: boolean;
    profit: number;
}

const DEFAULT_CONFIG: AnalyzerConfig = {
    bet2x: config.bankroll.bet2x,
    bet10x: config.bankroll.bet10x
};

// Pattern Service (igual ao generate_test_scenarios.ts)
class PatternService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public analyze(gameState: GameState): AnalysisData {
    const history = [...gameState.history];
    const values = history.map(c => c.value);

    if (values.length < 5) {
      return this.getDefaultAnalysis();
    }

    const densityCheckWindow = Math.min(values.length, 50);
    const recentValues = values.slice(0, densityCheckWindow);
    const pinkCount = recentValues.filter(v => v >= 10.0).length;
    const pinkDensityPercent = (pinkCount / densityCheckWindow) * 100;

    let volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (densityCheckWindow >= 3) {
        if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
        else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';
    }

    const purpleConversionRate = this.calculateConversionRate(values, 25);
    const streak = this.calculateStreak(values);
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

    const patterns: PatternData[] = [];
    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);
    if (pinkPattern) patterns.push(pinkPattern);

    const doubleBlueStats = this.calculateDoubleBlueStats(values, 25);
    const isDoubleBlueSafe = doubleBlueStats <= 1;
    
    let isPostPinkLock = candlesSinceLastPink < 3; 
    let lockReason = `Trava Pós-Rosa (${candlesSinceLastPink}/3). Aguarde correção.`;
    if (isPostPinkLock && isDoubleBlueSafe) {
        isPostPinkLock = false;
    }

    const isStopLoss = streak <= -2;
    const isPurpleStreakValid = streak >= 1 && purpleConversionRate >= 50;

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

  private decideAction2x(streak: number, candlesSinceLastPink: number, isPostPinkLock: boolean, isStopLoss: boolean, isValidStreak: boolean, density: string, lockReason: string, values: number[]): Recommendation {
      if (isStopLoss) {
          return {
              action: 'STOP_LOSS',
              reason: 'Stop Loss: 2 Reds Seguidos. Pare!',
              riskLevel: 'CRITICAL',
              confidence: 100
          };
      }
  
      if (isPostPinkLock) {
          return {
              action: 'WAIT',
              reason: lockReason,
              riskLevel: 'MEDIUM',
              confidence: 70
          };
      }
  
      const deepDowntrend = this.checkDeepDowntrend(values);
  
      if (streak === 1) {
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
  
      return {
          action: 'WAIT',
          reason: 'Aguardando oportunidade clara.',
          riskLevel: 'MEDIUM',
          confidence: 50
      };
  }

  private decideActionPink(pinkPattern: PatternData & { displayName?: string, occurrences?: number } | null): Recommendation {
      if (pinkPattern && pinkPattern.confidence >= 65 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
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
    const slice = values.slice(0, lookback);
    let opportunities = 0;
    let conversions = 0;

    for (let i = 1; i < slice.length; i++) {
        const current = slice[i];
        const next = slice[i-1];

        if (current >= 2.0 && current < 10.0) {
            opportunities++;
            if (next >= 2.0) {
                conversions++;
            }
        }
    }

    if (opportunities < 2) return 0;
    return (conversions / opportunities) * 100;
  }

  private detectPinkPattern(values: number[], lastPinkIndex: number, density: string): PatternData | null {
    if (lastPinkIndex === -1) return null;
    
    const pinkIndices = values
      .slice(0, 25)
      .map((v, i) => (v >= 10.0 ? i : -1))
      .filter(i => i !== -1);
      
    if (pinkIndices.length < 3) return null;

    const currentDistance = lastPinkIndex;
    const intervals: number[] = [];
    
    for (let i = 0; i < pinkIndices.length - 1; i++) {
      intervals.push(pinkIndices[i+1] - pinkIndices[i]);
    }

    const frequencyMap = new Map<number, number>();
    intervals.forEach(int => frequencyMap.set(int, (frequencyMap.get(int) || 0) + 1));

    const confirmedIntervals = Array.from(frequencyMap.entries())
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1]);

    if (confirmedIntervals.length === 0) return null;

    for (const [interval, count] of confirmedIntervals) {
        const diff = Math.abs(currentDistance - interval);
        
        if (diff <= 1) {
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
                occurrences: count,
                displayName: `${count}x Confirmado`
            };
        }
    }
    
    const nextTarget = confirmedIntervals.find(([int]) => int >= currentDistance);
    if (nextTarget) {
         const [interval, count] = nextTarget;
         if (interval - currentDistance <= 3) {
             return {
                 type: count >= 2 ? 'GOLD' : 'SILVER',
                 interval: interval,
                 confidence: 50 + (count * 10),
                 candlesUntilMatch: interval - currentDistance,
                 occurrences: count,
                 displayName: `${count}x Previsto`
             };
         }
    }

    return null;
  }

  private checkDeepDowntrend(values: number[]): boolean {
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
}

// Geração de valores
function generateRoundValue(): number {
    const r = Math.random();
    const houseEdge = config.generation.houseEdge;
    const value = (1 - houseEdge) / (1 - r);
    return Math.max(1.00, parseFloat(value.toFixed(2)));
}

// Main
const numScenarios = parseInt(process.argv[2] || '30');
const service = new PatternService();

const allPlays: PlayRecord[] = [];

console.log(`# 🔍 ANÁLISE DETALHADA POR CRITÉRIO\n`);
console.log(`**Data:** ${new Date().toLocaleDateString('pt-BR')}`);
console.log(`**Cenários:** ${numScenarios}`);
console.log(`**Objetivo:** Identificar quais critérios estão funcionando bem ou mal\n`);
console.log(`---\n`);

for (let s = 1; s <= numScenarios; s++) {
    const allCandles = Array.from({ length: config.simulation.totalRounds }, () => generateRoundValue());
    
    const historyBuffer = allCandles.slice(0, config.simulation.initialRounds);
    const liveCandles = allCandles.slice(config.simulation.initialRounds);
    
    let currentHistory = [...historyBuffer];
    
    for (let i = 0; i < liveCandles.length; i++) {
        const roundNumber = config.simulation.initialRounds + i + 1;
        const nextResult = liveCandles[i];
        
        const analysisHistory = [...currentHistory].reverse().map(v => ({ value: v }));
        const gameState: GameState = { history: analysisHistory, isGameRunning: false };
        
        const analysis = service.analyze(gameState);
        
        // Estratégia 2x
        if (analysis.recommendation2x.action === 'PLAY_2X') {
            const success = nextResult >= 2.00;
            const profit = success ? config.bankroll.bet2x : -config.bankroll.bet2x;
            
            allPlays.push({
                round: roundNumber,
                strategy: '2x',
                criterion: analysis.recommendation2x.reason,
                confidence: analysis.recommendation2x.confidence,
                result: nextResult,
                success,
                profit
            });
        }
        
        // Estratégia 10x
        if (analysis.recommendationPink.action === 'PLAY_10X') {
            const success = nextResult >= 10.00;
            const profit = success ? (config.bankroll.bet10x * 9) : -config.bankroll.bet10x;
            
            allPlays.push({
                round: roundNumber,
                strategy: '10x',
                criterion: analysis.recommendationPink.reason,
                confidence: analysis.recommendationPink.confidence,
                result: nextResult,
                success,
                profit
            });
        }
        
        currentHistory.push(nextResult);
    }
}

// Análise por critério
console.log(`## 📊 RESUMO GERAL\n`);
console.log(`**Total de Jogadas:** ${allPlays.length}`);
console.log(`**Greens:** ${allPlays.filter(p => p.success).length} ✅`);
console.log(`**Reds:** ${allPlays.filter(p => !p.success).length} ❌`);
console.log(`**Taxa de Acerto Geral:** ${((allPlays.filter(p => p.success).length / allPlays.length) * 100).toFixed(1)}%\n`);

console.log(`---\n`);

// Análise por estratégia
console.log(`## 🎯 ANÁLISE POR ESTRATÉGIA\n`);

const plays2x = allPlays.filter(p => p.strategy === '2x');
const plays10x = allPlays.filter(p => p.strategy === '10x');

console.log(`### Estratégia 2x (Roxa)\n`);
console.log(`**Total de Jogadas:** ${plays2x.length}`);
console.log(`**Greens:** ${plays2x.filter(p => p.success).length} ✅`);
console.log(`**Reds:** ${plays2x.filter(p => !p.success).length} ❌`);
console.log(`**Taxa de Acerto:** ${plays2x.length > 0 ? ((plays2x.filter(p => p.success).length / plays2x.length) * 100).toFixed(1) : 0}%`);
console.log(`**Lucro Total:** R$ ${plays2x.reduce((sum, p) => sum + p.profit, 0).toFixed(2)}\n`);

console.log(`### Estratégia 10x (Rosa)\n`);
console.log(`**Total de Jogadas:** ${plays10x.length}`);
console.log(`**Greens:** ${plays10x.filter(p => p.success).length} ✅`);
console.log(`**Reds:** ${plays10x.filter(p => !p.success).length} ❌`);
console.log(`**Taxa de Acerto:** ${plays10x.length > 0 ? ((plays10x.filter(p => p.success).length / plays10x.length) * 100).toFixed(1) : 0}%`);
console.log(`**Lucro Total:** R$ ${plays10x.reduce((sum, p) => sum + p.profit, 0).toFixed(2)}\n`);

console.log(`---\n`);

// Análise por critério
console.log(`## 🔍 ANÁLISE DETALHADA POR CRITÉRIO\n`);

const criteriaMap = new Map<string, PlayRecord[]>();
allPlays.forEach(play => {
    const key = `${play.strategy}|${play.criterion}`;
    if (!criteriaMap.has(key)) {
        criteriaMap.set(key, []);
    }
    criteriaMap.get(key)!.push(play);
});

const criteriaStats = Array.from(criteriaMap.entries()).map(([key, plays]) => {
    const [strategy, criterion] = key.split('|');
    const greens = plays.filter(p => p.success).length;
    const reds = plays.length - greens;
    const winRate = (greens / plays.length) * 100;
    const totalProfit = plays.reduce((sum, p) => sum + p.profit, 0);
    const avgConfidence = plays.reduce((sum, p) => sum + p.confidence, 0) / plays.length;
    
    return {
        strategy,
        criterion,
        total: plays.length,
        greens,
        reds,
        winRate,
        totalProfit,
        avgConfidence,
        plays
    };
}).sort((a, b) => b.total - a.total);

// Tabela de critérios
console.log(`### Resumo por Critério\n`);
console.log(`| Estratégia | Critério | Jogadas | Greens | Reds | Taxa Acerto | Lucro | Conf. Média | Avaliação |`);
console.log(`|------------|----------|---------|--------|------|-------------|-------|-------------|-----------|`);

criteriaStats.forEach(stat => {
    let evaluation = '';
    if (stat.winRate >= 60) evaluation = '✅ Excelente';
    else if (stat.winRate >= 50) evaluation = '✅ Bom';
    else if (stat.winRate >= 40) evaluation = '⚠️ Razoável';
    else evaluation = '❌ Ruim';
    
    console.log(`| ${stat.strategy} | ${stat.criterion} | ${stat.total} | ${stat.greens} | ${stat.reds} | ${stat.winRate.toFixed(1)}% | R$ ${stat.totalProfit.toFixed(2)} | ${stat.avgConfidence.toFixed(0)}% | ${evaluation} |`);
});

console.log(`\n---\n`);

// Detalhamento de cada critério
console.log(`## 📋 DETALHAMENTO POR CRITÉRIO\n`);

criteriaStats.forEach((stat, index) => {
    console.log(`### ${index + 1}. ${stat.strategy} - ${stat.criterion}\n`);
    console.log(`**Estatísticas:**`);
    console.log(`- Total de Jogadas: ${stat.total}`);
    console.log(`- Greens: ${stat.greens} ✅ (${stat.winRate.toFixed(1)}%)`);
    console.log(`- Reds: ${stat.reds} ❌ (${(100 - stat.winRate).toFixed(1)}%)`);
    console.log(`- Lucro Total: R$ ${stat.totalProfit.toFixed(2)}`);
    console.log(`- Lucro Médio/Jogada: R$ ${(stat.totalProfit / stat.total).toFixed(2)}`);
    console.log(`- Confiança Média: ${stat.avgConfidence.toFixed(0)}%\n`);
    
    // Avaliação
    let evaluation = '';
    let recommendation = '';
    
    if (stat.winRate >= 60) {
        evaluation = '✅ **EXCELENTE**';
        recommendation = 'Manter critério. Está funcionando muito bem!';
    } else if (stat.winRate >= 50) {
        evaluation = '✅ **BOM**';
        recommendation = 'Manter critério. Está funcionando bem.';
    } else if (stat.winRate >= 40) {
        evaluation = '⚠️ **RAZOÁVEL**';
        recommendation = 'Considerar ajustes. Taxa de acerto está no limite.';
    } else {
        evaluation = '❌ **RUIM**';
        recommendation = 'URGENTE: Ajustar ou remover critério. Taxa de acerto muito baixa!';
    }
    
    console.log(`**Avaliação:** ${evaluation}\n`);
    console.log(`**Recomendação:** ${recommendation}\n`);
    
    // Amostra de jogadas (primeiras 5)
    console.log(`**Amostra de Jogadas:**\n`);
    stat.plays.slice(0, 5).forEach(play => {
        const icon = play.success ? '✅' : '❌';
        console.log(`- Rodada ${play.round}: ${play.result.toFixed(2)}x ${icon} (${play.success ? '+' : ''}R$ ${play.profit.toFixed(2)})`);
    });
    
    if (stat.plays.length > 5) {
        console.log(`- ... (mais ${stat.plays.length - 5} jogadas)`);
    }
    
    console.log(`\n---\n`);
});

// Recomendações finais
console.log(`## 🎯 RECOMENDAÇÕES FINAIS\n`);

const excellentCriteria = criteriaStats.filter(s => s.winRate >= 60);
const goodCriteria = criteriaStats.filter(s => s.winRate >= 50 && s.winRate < 60);
const reasonableCriteria = criteriaStats.filter(s => s.winRate >= 40 && s.winRate < 50);
const badCriteria = criteriaStats.filter(s => s.winRate < 40);

console.log(`### ✅ Critérios Excelentes (≥60% acerto)\n`);
if (excellentCriteria.length > 0) {
    excellentCriteria.forEach(c => {
        console.log(`- **${c.strategy} - ${c.criterion}** (${c.winRate.toFixed(1)}% acerto, ${c.total} jogadas)`);
    });
    console.log(`\n**Ação:** Manter esses critérios! Estão funcionando muito bem.\n`);
} else {
    console.log(`_Nenhum critério com taxa ≥60%_\n`);
}

console.log(`### ✅ Critérios Bons (50-59% acerto)\n`);
if (goodCriteria.length > 0) {
    goodCriteria.forEach(c => {
        console.log(`- **${c.strategy} - ${c.criterion}** (${c.winRate.toFixed(1)}% acerto, ${c.total} jogadas)`);
    });
    console.log(`\n**Ação:** Manter esses critérios. Estão funcionando bem.\n`);
} else {
    console.log(`_Nenhum critério nessa faixa_\n`);
}

console.log(`### ⚠️ Critérios Razoáveis (40-49% acerto)\n`);
if (reasonableCriteria.length > 0) {
    reasonableCriteria.forEach(c => {
        console.log(`- **${c.strategy} - ${c.criterion}** (${c.winRate.toFixed(1)}% acerto, ${c.total} jogadas)`);
    });
    console.log(`\n**Ação:** Considerar ajustes. Taxa de acerto está no limite.\n`);
} else {
    console.log(`_Nenhum critério nessa faixa_\n`);
}

console.log(`### ❌ Critérios Ruins (<40% acerto)\n`);
if (badCriteria.length > 0) {
    badCriteria.forEach(c => {
        console.log(`- **${c.strategy} - ${c.criterion}** (${c.winRate.toFixed(1)}% acerto, ${c.total} jogadas)`);
    });
    console.log(`\n**Ação:** URGENTE! Ajustar ou remover esses critérios.\n`);
    
    console.log(`**Sugestões de ajuste:**\n`);
    badCriteria.forEach(c => {
        if (c.criterion.includes('Surfando Sequência')) {
            console.log(`- **${c.criterion}:** Aumentar conversão mínima de 50% para 60-70%`);
        } else if (c.criterion.includes('Padrão Intervalo')) {
            console.log(`- **${c.criterion}:** Aumentar confiança mínima de 65% para 70-75%`);
        } else if (c.criterion.includes('confirmados')) {
            console.log(`- **${c.criterion}:** Exigir ≥3 ocorrências ao invés de ≥2`);
        } else {
            console.log(`- **${c.criterion}:** Revisar lógica ou remover critério`);
        }
    });
} else {
    console.log(`_Nenhum critério com taxa <40%_ ✅\n`);
}

console.log(`\n---\n`);
console.log(`**Gerado em:** ${new Date().toLocaleString('pt-BR')}`);
console.log(`**Arquivo:** TESTES/analyze_by_criteria.ts`);
