
// Mock Interfaces to match src/bridge/messageTypes
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
    bet2x: 100,
    bet10x: 50
};

// --- MOCKED/COPIED PATTERN SERVICE ---
class PatternService {
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

  private decideAction2x(
    streak: number,
    sincePink: number,
    isLock: boolean,
    isStopLoss: boolean,
    isValidStreak: boolean,
    density: 'LOW' | 'MEDIUM' | 'HIGH',
    lockReason: string,
    values: number[]
  ): Recommendation {
      if (isLock) {
         return {
           action: Math.abs(sincePink) >= 3 ?  'PLAY_2X' : 'WAIT', // Sanity check if lock overridden
           // Actually WAIT is correct if lock is TRUE. If overridden, isLock is passed as false.
           // However, if logic is passed as true, return WAIT.
           // But wait, if override happened, caller passes FALSE.
           reason: lockReason,
           riskLevel: 'CRITICAL',
           confidence: 100
         };
         // Fix: If isLock is true, return WAIT.
         return { action: 'WAIT', reason: lockReason, riskLevel: 'CRITICAL', confidence: 100 };
      }
  
      if (isStopLoss) {
         return {
           action: 'STOP',
           reason: 'Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas.',
           riskLevel: 'HIGH',
           confidence: 90
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
    
    // UPDATED LOGIC: SLICE 25
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
                // @ts-ignore
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
}

// --- SIMULATION SCRIPT ---

function generateRoundValue(): number {
    // Basic Crash Probability (Inverse distribution with house edge)
    // P(x >= M) = 0.99 / M (Approx house edge 1%)
    // But we need random sample.
    // U = random(0, 1)
    // Value = 0.99 / (1 - U)
    // However, standard crash stops at 1.00x if U is low. Value cannot be < 1.00.
    // Let's use simple logic:
    // r = random(0, 100)
    // if r < 1 (instant crash), val = 1.00
    // else val = 0.99 * (100 / (100 - r))? No, standard is E = 0.96 / (1-U) sometimes.
    
    // Let's use a standard approximation for simulation:
    // 50% chance < 2.00x
    // ~10-12% chance >= 10.00x
    
    // Let's use U[0,1)
    const r = Math.random();
    // House Edge 4% (RTP 96%)
    const houseEdge = 0.04;
    const value = (1 - houseEdge) / (1 - r);
    
    return Math.max(1.00, parseFloat(value.toFixed(2)));
}

function getEmoji(val: number): string {
    if (val >= 10.0) return '🌸';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

const service = new PatternService();
const scenarios = [];

for (let s = 1; s <= 30; s++) {
    // Generate 60 candles
    const allCandles = Array.from({ length: 60 }, () => generateRoundValue());
    
    let balance = 1000;
    const historyBuffer = allCandles.slice(0, 25);
    const liveCandles = allCandles.slice(25);
    
    let scenarioLog = `### Cenário ${s}\n\n`;
    scenarioLog += `**Banca Inicial:** R$ ${balance.toFixed(2)}\n\n`;
    
    // Header for Visuals
    let visuals = "";
    
    // We simulate step by step
    // We need to maintain a "current history" that grows
    let currentHistory = [...historyBuffer]; // oldest to newest
    // Wait, PatternService expects history[0] to be MOST RECENT.
    // So if currentHistory = [C1..C25], we need to reverse it for analyze(): analyze([C25, C24 ... C1])
    
    let stepLog = "| Rodada | Vela | Decisão 2x | Resultado 2x | Decisão 10x | Resultado 10x | Saldo |\n|---|---|---|---|---|---|---|\n";

    for (let i = 0; i < liveCandles.length; i++) {
        const nextResult = liveCandles[i];
        
        // Analyze BEFORE seeing nextResult
        // Prepare history for analyzer (Reverse of chronological)
        const analysisHistory = [...currentHistory].reverse().map(v => ({ value: v }));
        const gameState: GameState = { history: analysisHistory, isGameRunning: false };
        
        const analysis = service.analyze(gameState);
        
        let profit = 0;
        let action2x = analysis.recommendation2x.action;
        let actionPink = analysis.recommendationPink.action;
        
        let res2x = "-";
        let resPink = "-";
        
        // SIMULATE BETS
        if (action2x === 'PLAY_2X' || action2x === 'PLAY_10X') { // Warning: PLAY_10X implies we might cover 2x? 
            // In Analyzer Logic, they are independent.
            // If rec2x says PLAY, we bet 100.
            if (action2x === 'PLAY_2X') {
                if (nextResult >= 2.00) {
                    profit += 100;
                    res2x = "✅ +100";
                } else {
                    profit -= 100;
                    res2x = "❌ -100";
                }
            }
        }
        
        if (actionPink === 'PLAY_10X') {
             if (nextResult >= 10.00) {
                 profit += 450; // Win 500 total - 50 bet = 450 profit
                 resPink = "✅ +450";
             } else {
                 profit -= 50;
                 resPink = "❌ -50";
             }
        }
        
        balance += profit;
        
        // Update History
        currentHistory.push(nextResult);
        
        stepLog += `| ${i+26} | ${getEmoji(nextResult)} ${nextResult.toFixed(2)}x | ${analysis.recommendation2x.action === 'WAIT' ? '⏳' : '🚀'} | ${res2x} | ${analysis.recommendationPink.action === 'WAIT' ? '⏳' : '🎯'} | ${resPink} | R$ ${balance.toFixed(2)} |\n`;
    }
    
    // Visual Line (Last 20 only or full?) User asked for emojis of the scenario.
    // Let's show all 60 in rows of 20
    let visualRow = "";
    allCandles.forEach((v, idx) => {
        visualRow += getEmoji(v) + " ";
        if ((idx + 1) % 20 === 0) visualRow += "\n";
    });
    
    scenarioLog += "**Histórico Visual:**\n" + visualRow + "\n\n";
    scenarioLog += "**Simulação Passo a Passo (Rodadas 26-60):**\n" + stepLog + "\n";
    scenarioLog += `**Saldo Final:** R$ ${balance.toFixed(2)}\n`;
    scenarioLog += `\n> **Feedback/Ajuste:** [_________________________________]\n`;
    
    scenarios.push(scenarioLog);
}

console.log("# 🎰 SIMULAÇÃO DE 30 CENÁRIOS (LÓGICA V3)\n\n" + scenarios.join("\n---\n\n"));
