#!/usr/bin/env tsx
/**
 * GERADOR DE CENÁRIOS DE TESTE - AVIATOR ANALYZER
 * 
 * Gera gráficos aleatórios e analisa com as Regras V3.
 * Formato visual idêntico aos prints enviados pelo usuário.
 * 
 * Uso:
 *   npx tsx TESTES/generate_test_scenarios.ts [quantidade]
 * 
 * Exemplos:
 *   npx tsx TESTES/generate_test_scenarios.ts 1    # 1 cenário
 *   npx tsx TESTES/generate_test_scenarios.ts 10   # 10 cenários
 *   npx tsx TESTES/generate_test_scenarios.ts      # 30 cenários (padrão)
 */

// Importar configuração
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.join(__dirname, 'test_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Mock Interfaces
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

const DEFAULT_CONFIG: AnalyzerConfig = {
    bet2x: config.bankroll.bet2x,
    bet10x: config.bankroll.bet10x
};

// --- PATTERN SERVICE (Cópia do patternService.ts) ---
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

    const checkDoubleBlue = this.calculateDoubleBlueStats(values, 25);
    const isDoubleBlueSafe = checkDoubleBlue <= 1;
    
    let isPostPinkLock = candlesSinceLastPink < 3; 
    let lockReason = `Trava Pós-Rosa (${candlesSinceLastPink}/3). Aguarde correção.`;
    if (isPostPinkLock && isDoubleBlueSafe) {
        isPostPinkLock = false; 
    }

    const isStopLoss = streak <= -2;
    const isPurpleStreakValid = streak >= 2 && purpleConversionRate >= 60;

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
      if (pinkPattern && pinkPattern.confidence >= 75 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
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

// --- GERAÇÃO DE VALORES ---
function generateRoundValue(): number {
    const r = Math.random();
    const houseEdge = config.generation.houseEdge;
    const value = (1 - houseEdge) / (1 - r);
    return Math.max(1.00, parseFloat(value.toFixed(2)));
}

function getColorCode(val: number): string {
    if (val >= 10.0) return '\x1b[95m'; // Magenta (Rosa)
    if (val >= 2.0) return '\x1b[35m';  // Purple (Roxa)
    return '\x1b[34m';                   // Blue (Azul)
}

const RESET = '\x1b[0m';

// --- GERAÇÃO DE CENÁRIOS ---
const numScenarios = parseInt(process.argv[2] || '30');
const service = new PatternService();

console.log(`# 🎰 TESTE DE CENÁRIOS - AVIATOR ANALYZER V3\n`);
console.log(`**Data:** ${new Date().toLocaleDateString('pt-BR')}`);
console.log(`**Versão:** V3 (Padrões Confirmados)`);
console.log(`**Cenários:** ${numScenarios}`);
console.log(`**Banca Inicial:** R$ ${config.bankroll.initial.toFixed(2)}`);
console.log(`**Apostas:** 2x = R$ ${config.bankroll.bet2x.toFixed(2)} | 10x = R$ ${config.bankroll.bet10x.toFixed(2)}\n`);
console.log(`---\n`);

const allResults: any[] = [];

for (let s = 1; s <= numScenarios; s++) {
    const allCandles = Array.from({ length: config.simulation.totalRounds }, () => generateRoundValue());
    
    let balance = config.bankroll.initial;
    const historyBuffer = allCandles.slice(0, config.simulation.initialRounds);
    const liveCandles = allCandles.slice(config.simulation.initialRounds);
    
    console.log(`## 📊 Cenário ${s}\n`);
    
    // Gráfico Visual (formato idêntico aos prints)
    console.log(`**Gráfico Completo (60 rodadas):**\n`);
    console.log('```');
    const graphLine = allCandles.map(v => `${v.toFixed(2)}x`).join(' ');
    console.log(graphLine);
    console.log('```\n');
    
    // Estatísticas do Gráfico
    const blues = allCandles.filter(v => v < 2.0).length;
    const purples = allCandles.filter(v => v >= 2.0 && v < 10.0).length;
    const pinks = allCandles.filter(v => v >= 10.0).length;
    
    console.log(`**Composição:**`);
    console.log(`- 🔵 Azuis (<2x): ${blues} (${((blues/60)*100).toFixed(1)}%)`);
    console.log(`- 🟣 Roxas (2-9.99x): ${purples} (${((purples/60)*100).toFixed(1)}%)`);
    console.log(`- 🌸 Rosas (≥10x): ${pinks} (${((pinks/60)*100).toFixed(1)}%)\n`);
    
    // Simulação
    let currentHistory = [...historyBuffer];
    
    let totalPlays = 0;
    let wins = 0;
    let losses = 0;
    let plays2x = 0;
    let playsPink = 0;
    let wins2x = 0;
    let winsPink = 0;
    
    const playLog: string[] = [];
    
    for (let i = 0; i < liveCandles.length; i++) {
        const roundNumber = config.simulation.initialRounds + i + 1;
        const nextResult = liveCandles[i];
        
        const analysisHistory = [...currentHistory].reverse().map(v => ({ value: v }));
        const gameState: GameState = { history: analysisHistory, isGameRunning: false };
        
        const analysis = service.analyze(gameState);
        
        let profit = 0;
        let played = false;
        let result2x = '';
        let resultPink = '';
        
        // Estratégia 2x
        if (analysis.recommendation2x.action === 'PLAY_2X') {
            played = true;
            plays2x++;
            totalPlays++;
            
            if (nextResult >= 2.00) {
                profit += config.bankroll.bet2x;
                wins++;
                wins2x++;
                result2x = '✅ +' + config.bankroll.bet2x;
            } else {
                profit -= config.bankroll.bet2x;
                losses++;
                result2x = '❌ -' + config.bankroll.bet2x;
            }
        }
        
        // Estratégia 10x
        if (analysis.recommendationPink.action === 'PLAY_10X') {
            played = true;
            playsPink++;
            if (analysis.recommendation2x.action !== 'PLAY_2X') totalPlays++; // Só conta se não jogou 2x também
            
            if (nextResult >= 10.00) {
                const winAmount = config.bankroll.bet10x * 9; // 10x - aposta
                profit += winAmount;
                wins++;
                winsPink++;
                resultPink = '✅ +' + winAmount;
            } else {
                profit -= config.bankroll.bet10x;
                losses++;
                resultPink = '❌ -' + config.bankroll.bet10x;
            }
        }
        
        balance += profit;
        currentHistory.push(nextResult);
        
        // Log apenas se jogou
        if (played) {
            const color = getColorCode(nextResult);
            playLog.push(`**Rodada ${roundNumber}:** ${color}${nextResult.toFixed(2)}x${RESET} | 2x: ${result2x || '⏳'} | 10x: ${resultPink || '⏳'} | Saldo: R$ ${balance.toFixed(2)}`);
        }
    }
    
    // Resultados
    const finalProfit = balance - config.bankroll.initial;
    const roi = (finalProfit / config.bankroll.initial) * 100;
    const winRate = totalPlays > 0 ? (wins / totalPlays) * 100 : 0;
    const winRate2x = plays2x > 0 ? (wins2x / plays2x) * 100 : 0;
    const winRatePink = playsPink > 0 ? (winsPink / playsPink) * 100 : 0;
    
    console.log(`**Jogadas Realizadas (${totalPlays} total):**\n`);
    if (playLog.length > 0) {
        playLog.forEach(log => console.log(log));
    } else {
        console.log('_Nenhuma jogada realizada (sem padrões confirmados)_');
    }
    console.log('');
    
    console.log(`**Resultado Final:**\n`);
    console.log(`| Métrica | Valor |`);
    console.log(`|---------|-------|`);
    console.log(`| **Total de Jogadas** | ${totalPlays} |`);
    console.log(`| **Greens** | ${wins} ✅ |`);
    console.log(`| **Reds** | ${losses} ❌ |`);
    console.log(`| **Taxa de Acerto** | ${winRate.toFixed(1)}% |`);
    console.log(`| **Jogadas 2x** | ${plays2x} (${winRate2x.toFixed(1)}% acerto) |`);
    console.log(`| **Jogadas 10x** | ${playsPink} (${winRatePink.toFixed(1)}% acerto) |`);
    console.log(`| **Banca Final** | R$ ${balance.toFixed(2)} |`);
    console.log(`| **Lucro/Prejuízo** | ${finalProfit >= 0 ? '+' : ''}R$ ${finalProfit.toFixed(2)} |`);
    console.log(`| **ROI** | ${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% |\n`);
    
    console.log(`---\n`);
    
    allResults.push({
        scenario: s,
        totalPlays,
        wins,
        losses,
        winRate,
        plays2x,
        playsPink,
        winRate2x,
        winRatePink,
        finalBalance: balance,
        profit: finalProfit,
        roi
    });
}

// Consolidado
if (numScenarios > 1) {
    console.log(`## 📊 CONSOLIDADO (${numScenarios} Cenários)\n`);
    
    const avgPlays = allResults.reduce((sum, r) => sum + r.totalPlays, 0) / numScenarios;
    const avgWinRate = allResults.reduce((sum, r) => sum + r.winRate, 0) / numScenarios;
    const avgROI = allResults.reduce((sum, r) => sum + r.roi, 0) / numScenarios;
    const avgProfit = allResults.reduce((sum, r) => sum + r.profit, 0) / numScenarios;
    const totalWins = allResults.reduce((sum, r) => sum + r.wins, 0);
    const totalLosses = allResults.reduce((sum, r) => sum + r.losses, 0);
    
    console.log(`| Métrica | Valor |`);
    console.log(`|---------|-------|`);
    console.log(`| **Média de Jogadas/Cenário** | ${avgPlays.toFixed(1)} |`);
    console.log(`| **Taxa de Acerto Média** | ${avgWinRate.toFixed(1)}% |`);
    console.log(`| **ROI Médio** | ${avgROI >= 0 ? '+' : ''}${avgROI.toFixed(1)}% |`);
    console.log(`| **Lucro Médio/Cenário** | ${avgProfit >= 0 ? '+' : ''}R$ ${avgProfit.toFixed(2)} |`);
    console.log(`| **Total Greens** | ${totalWins} ✅ |`);
    console.log(`| **Total Reds** | ${totalLosses} ❌ |\n`);
    
    console.log(`**Interpretação:**\n`);
    if (avgROI > 10) {
        console.log(`✅ **Excelente!** ROI médio acima de 10%. Regras V3 estão funcionando bem.`);
    } else if (avgROI > 0) {
        console.log(`✅ **Positivo!** ROI médio positivo. Regras V3 estão lucrativas.`);
    } else if (avgROI > -10) {
        console.log(`⚠️ **Neutro.** ROI próximo de zero. Regras V3 protegem banca mas não lucram muito.`);
    } else {
        console.log(`❌ **Negativo.** ROI médio abaixo de -10%. Regras V3 precisam ajustes.`);
    }
    
    console.log('');
}

console.log(`---\n`);
console.log(`**Gerado em:** ${new Date().toLocaleString('pt-BR')}`);
console.log(`**Configuração:** TESTES/test_config.json`);
console.log(`**Documentação:** TESTES/MODELO_DE_TESTES.md`);
