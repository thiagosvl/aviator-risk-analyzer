
import fs from 'fs';
import path from 'path';

// COPIED FROM StrategyCore.ts to avoid import issues in this environment
class StrategyCore {
  static analyze(values) {
    const windowSize = 25;
    const slice = values.slice(0, windowSize);
    const pinkDensityPercent = (slice.filter(v => v >= 10.0).length / windowSize) * 100;
    const blueDensityPercent = (slice.filter(v => v < 2.0).length / windowSize) * 100;
    
    let volatilityDensity = 'LOW';
    if (slice.length >= 3) {
        if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
        else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';
    }

    const purpleConversionRate = this.calculateConversionRate(values, windowSize);
    const isBlueDominant = blueDensityPercent > 60; 

    const streak = this.calculateStreak(values);
    const lastPinkIndex = values.findIndex(v => v >= 10.0);
    const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

    const pinkPattern = this.detectPinkPattern(values, lastPinkIndex, volatilityDensity);
    const isPostPinkLock = candlesSinceLastPink < 3; 

    const isStopLoss = streak <= -2;
    const isXadrez = this.checkXadrez(values);
    const isPurpleStreakValid = streak >= 2 && purpleConversionRate >= 55;

    const pinkCount25 = values.slice(0, 25).filter(v => v >= 10.0).length;

    const rec2x = this.decideAction2x(streak, isPostPinkLock, isStopLoss, isPurpleStreakValid, volatilityDensity, values, isBlueDominant, isXadrez);
    const recPink = this.decideActionPink(pinkPattern, isPostPinkLock, candlesSinceLastPink, pinkCount25);

    return { recommendation2x: rec2x, recommendationPink: recPink };
  }

  static decideAction2x(streak, isPostPink, isStopLoss, isValidStreak, density, values, isBlueDominant, isXadrez) {
      if (isBlueDominant) return { action: 'WAIT', reason: 'Dominância Azul (>60%). Risco alto.' };
      if (isPostPink) return { action: 'WAIT', reason: `Aguardando correção pós-rosa.` };
      if (isXadrez && streak === -1) return { action: 'PLAY_2X', reason: 'Padrão Xadrez Detectado.' };
      if (isStopLoss) return { action: 'STOP', reason: 'Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas.' };
      if (streak === 1) return { action: 'WAIT', reason: 'Aguardando 2ª vela roxa.' };
      if (streak === 2) return { action: 'WAIT', reason: 'Aguardando 3ª vela roxa.' };
      if (streak >= 3 || (streak >= 2 && isValidStreak)) return { action: 'PLAY_2X', reason: 'Surfando Sequência Confirmada.' };
      return { action: 'WAIT', reason: 'Buscando sinal claro.' };
  }

  static decideActionPink(pattern, isPostPink, candlesSincePink, pinkCount25) {
      if (pinkCount25 < 2) return { action: 'WAIT', reason: `Aguardando 2ª Rosa na janela (Ative: ${pinkCount25}/2).` };
      const isShortPattern = pattern && pattern.interval <= 5;
      const canBypassLock = isPostPink && isShortPattern && pattern.confidence >= 70;
      if (isPostPink && !canBypassLock) return { action: 'WAIT', reason: `Trava Pós-Rosa (${candlesSincePink}/3).` };
      if (pattern && pattern.confidence >= 70 && Math.abs(pattern.candlesUntilMatch) <= 1 && pattern.interval >= 3) {
          return { action: 'PLAY_10X', reason: `🌸 Alvo V3.9: Intervalo ${pattern.interval} (${pattern.candlesUntilMatch === 0 ? "EXATO" : "ZONA +/- 1"})` };
      }
      return { action: 'WAIT', reason: 'Buscando padrão confirmado...' };
  }

  static calculateStreak(v) {
    if (v.length === 0) return 0;
    const firstIsBlue = v[0] < 2.0;
    let count = 0;
    for (const val of v) {
      if ((val < 2.0) === firstIsBlue) count++;
      else break;
    }
    return firstIsBlue ? -count : count;
  }

  static calculateConversionRate(v, lb) {
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

  static detectPinkPattern(v, lastIdx, density) {
    if (lastIdx === -1) return null;
    const indices = v.slice(0, 50).map((val, i) => (val >= 10.0 ? i : -1)).filter(i => i !== -1);
    if (indices.length < 2) return null;
    const intervals = [];
    for (let i = 0; i < indices.length - 1; i++) intervals.push(indices[i+1] - indices[i]);
    const freq = new Map();
    intervals.forEach(int => freq.set(int, (freq.get(int) || 0) + 1));
    const confirmed = Array.from(freq.entries()).filter(([int, count]) => (int < 3 ? count >= 4 : count >= 2));
    for (const [int, count] of confirmed.sort((a, b) => b[1] - a[1])) {
        const diff = Math.abs(lastIdx - int);
        if (diff <= 1) return { interval: int, confidence: Math.min(95, 50 + (count * 12)), candlesUntilMatch: int - lastIdx };
    }
    return null;
  }

  static checkXadrez(v) {
    if (v.length < 5) return false;
    const p = v.slice(0, 5).map(val => val < 2.0);
    return (p[0] !== p[1] && p[1] !== p[2] && p[2] !== p[3] && p[3] !== p[4]);
  }
}

const CENARIOS_DIR = './CENARIOS_GERADOS';

function iconToValue(icon) {
    if (icon === '🌸') return 10.0;
    if (icon === '🟣') return 2.0;
    if (icon === '🔵') return 1.0;
    return 1.0;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const scenarios = content.split(/### Cenário \d+/);
    const header = scenarios.shift();
    const scenarioHeaderMatches = content.match(/### Cenário (\d+)/g);
    
    let updatedContent = header || '';
    
    scenarios.forEach((scenario, index) => {
        const historyMatch = scenario.match(/\*\*Histórico \(Recent -> Old\):\*\* (.*)/);
        if (!historyMatch) {
            updatedContent += (scenarioHeaderMatches ? scenarioHeaderMatches[index] : '') + scenario;
            return;
        }

        const historyIcons = historyMatch[1].trim().split(/\s+/);
        const historyValues = historyIcons.map(iconToValue);
        
        const result = StrategyCore.analyze(historyValues);
        
        let updatedScenario = scenario;
        const rec2x = result.recommendation2x;
        const action2x = rec2x.action === 'PLAY_2X' ? '✅ ENTRAR' : rec2x.action === 'STOP' ? '🛑 STOP' : '⏳ AGUARDAR';
        
        updatedScenario = updatedScenario.replace(
            /\| \*\*Roxa \(2x\)\*\* \| .* \| .* \|/,
            `| **Roxa (2x)** | ${action2x} | ${rec2x.reason} |`
        );
        
        const recPink = result.recommendationPink;
        const actionPink = recPink.action === 'PLAY_10X' ? '🌸 ENTRAR' : recPink.action === 'STOP' ? '🛑 STOP' : '⏳ AGUARDAR';
        
        updatedScenario = updatedScenario.replace(
            /\| \*\*Rosa \(10x\)\*\* \| .* \| .* \|/,
            `| **Rosa (10x)** | ${actionPink} | ${recPink.reason} |`
        );
        
        updatedContent += (scenarioHeaderMatches ? scenarioHeaderMatches[index] : '') + updatedScenario;
    });

    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${path.basename(filePath)}`);
}

const files = fs.readdirSync(CENARIOS_DIR).filter(f => f.endsWith('.md'));
files.forEach(file => processFile(path.join(CENARIOS_DIR, file)));
