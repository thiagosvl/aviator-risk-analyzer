
const fs = require('fs');
const path = require('path');

// CONFIG
const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const EXIT_TARGET = 10.0;
const STAKE = 50.0; 
const MEMORY_SIZE = 25; 

// SESSION LIMITS (Strategy A)
const STOP_WIN = 500.0;
const STOP_LOSS = -500.0;

// MONTE CARLO CONFIG
const SIMULATIONS = 1000;
const BANKROLL_SCENARIOS = [1000, 3000, 5000];

// === STRATEGY LOGIC (Simplified for Speed) ===
class StrategyLogic {
    static analyze(values) {
        const lastPinkIndex = values.findIndex(v => v >= 10.0);
        const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;
        const phase = this.calculatePhaseV8(values, candlesSinceLastPink);
        const recPink = this.decideActionSniperV8(values, candlesSinceLastPink, phase);
        return recPink;
    }

    static decideActionSniperV8(values, candlesSinceLastPink, phase) {
        if (values.length === 0) return { action: 'WAIT' };
        if (phase === 'DESERT') return { action: 'WAIT' };
        if (phase === 'RECOVERY') return { action: 'PLAY_10X' };

        const lastValue = values[0];
        if (lastValue < 2.0) return { action: 'PLAY_10X' };
        if (lastValue >= 2.0 && lastValue <= 3.5) return { action: 'PLAY_10X' };
        if (lastValue >= 10.0) return { action: 'PLAY_10X' };

        return { action: 'WAIT' };
    }

    static calculatePhaseV8(values, candlesSinceLastPink) {
        if (candlesSinceLastPink >= 12) return 'DESERT';
        const pinkIndex = candlesSinceLastPink;
        if (pinkIndex <= 2) {
            const nextPinkIndexRel = values.slice(pinkIndex + 1).findIndex(v => v >= 10.0);
            if (nextPinkIndexRel !== -1) {
                const actualNextPinkIndex = pinkIndex + 1 + nextPinkIndexRel;
                if (actualNextPinkIndex - pinkIndex - 1 >= 12) return 'RECOVERY';
            } else {
                if (values.length > pinkIndex + 1 + 12) return 'RECOVERY';
            }
        }
        return 'NORMAL';
    }
}

// === SINGLE SESSION SIMULATOR ===
function simulateSession(multipliers) {
    const history = [];
    let sessionProfit = 0;
    
    for (const result of multipliers) {
        // Session Limits Check
        if (sessionProfit >= STOP_WIN) break; // Stop Win
        if (sessionProfit <= STOP_LOSS) break; // Stop Loss

        if (history.length < MEMORY_SIZE) {
            history.unshift(result);
            continue;
        }

        const decision = StrategyLogic.analyze(history);
        
        if (decision.action === 'PLAY_10X') {
            if (result >= EXIT_TARGET) {
                sessionProfit += (STAKE * EXIT_TARGET) - STAKE;
            } else {
                sessionProfit -= STAKE;
            }
        }
        history.unshift(result);
    }
    return sessionProfit;
}

// === MONTE CARLO ENGINE ===
function runMonteCarlo(sessionPnLs, startBankroll) {
    let bankruptcies = 0;
    let successfulSims = 0;
    let totalDrawdowns = [];
    
    for (let i = 0; i < SIMULATIONS; i++) {
        // Shuffle
        const shuffled = [...sessionPnLs].sort(() => Math.random() - 0.5);
        
        let currentBankroll = startBankroll;
        let peakBankroll = startBankroll;
        let maxDD = 0;
        let isRuined = false;

        for (const pnl of shuffled) {
            currentBankroll += pnl;
            
            if (currentBankroll > peakBankroll) peakBankroll = currentBankroll;
            const dd = peakBankroll - currentBankroll;
            if (dd > maxDD) maxDD = dd;

            if (currentBankroll <= 0) {
                isRuined = true;
                break;
            }
        }

        if (isRuined) {
            bankruptcies++;
        } else {
            successfulSims++;
            totalDrawdowns.push(maxDD);
        }
    }

    const avgMaxDD = totalDrawdowns.reduce((a, b) => a + b, 0) / totalDrawdowns.length;
    const sortedDD = totalDrawdowns.sort((a, b) => b - a);
    const worstCaseDD = sortedDD[0] || 0;
    const percentile95DD = sortedDD[Math.floor(sortedDD.length * 0.05)] || 0; // Top 5% worst drawdowns

    return {
        ruinProbability: (bankruptcies / SIMULATIONS) * 100,
        avgMaxDD,
        worstCaseDD,
        percentile95DD
    };
}

// === STRESS TEST (WORST FIRST) ===
function runStressTest(sessionPnLs, startBankroll) {
    // Sort Ascending (Negatives first)
    const sorted = [...sessionPnLs].sort((a, b) => a - b);
    
    let currentBankroll = startBankroll;
    let peakBankroll = startBankroll;
    let maxDD = 0;
    let survived = true;
    let stepsUntilRuin = 0;

    for (let i = 0; i < sorted.length; i++) {
        currentBankroll += sorted[i];
        
        if (currentBankroll > peakBankroll) peakBankroll = currentBankroll;
        const dd = peakBankroll - currentBankroll;
        if (dd > maxDD) maxDD = dd;

        if (currentBankroll <= 0) {
            survived = false;
            stepsUntilRuin = i + 1;
            break;
        }
    }

    return { survived, finalBalance: currentBankroll, maxDD, stepsUntilRuin };
}

// === MAIN ===
function main() {
    console.log('🎲 STARTING RISK ANALYSIS (V8 + SESSION SYSTEM)...');
    
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    const sessionPnLs = [];

    // 1. GENERATE BASELINE PnL
    const logFile = path.join(__dirname, 'debug_risk.log');
    fs.writeFileSync(logFile, 'DEBUG START\n');
    const logDisk = (msg) => fs.appendFileSync(logFile, msg + '\n');

    logDisk(`Processing ${files.length} sessions...`);
    
    for (const file of files) {
        logDisk(`Reading file: ${file}`);
        try {
            const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
            const multipliers = content.split('\n').map(parseFloat).filter(n => !isNaN(n));
            logDisk(`  Parsed ${multipliers.length} multipliers`);
            const pnl = simulateSession(multipliers);
            logDisk(`  PnL: ${pnl}`);
            sessionPnLs.push({ file, pnl });
        } catch (e) {
            logDisk(`  ERROR processing ${file}: ${e.message}`);
        }
    }
    logDisk('DEBUG: Finished processing sessions.');

    const pnls = sessionPnLs.map(s => s.pnl);
    logDisk(`Calculating stats for ${pnls.length} PnLs...`);

    const positiveSessions = pnls.filter(p => p > 0).length;
    const negativeSessions = pnls.filter(p => p < 0).length;
    const bestSession = Math.max(...pnls);
    const worstSession = Math.min(...pnls);

    // 2. REPORT GENERATION
    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log('# RELATÓRIO DE RISCO AVANÇADO - SNIPER V8+');
    log(`Data: ${new Date().toLocaleString()}\n`);
    
    log('## 1. ANÁLISE DE ROBUSTEZ (BASELINE)');
    log('Comportamento dos 30 grafos com Stop Win (+500) / Loss (-500):');
    log(`- Sessões Positivas: ${positiveSessions} (${((positiveSessions/files.length)*100).toFixed(1)}%)`);
    log(`- Sessões Negativas: ${negativeSessions} (${((negativeSessions/files.length)*100).toFixed(1)}%)`);
    log(`- Melhor Sessão: R$ ${bestSession.toFixed(2)}`);
    log(`- Pior Sessão:   R$ ${worstSession.toFixed(2)}`);
    const avg = pnls.reduce((a,b)=>a+b,0)/files.length;
    log(`- Média por Sessão: R$ ${avg.toFixed(2)}\n`);

    logDisk('Starting Monte Carlo...');
    log('## 2. SIMULAÇÃO DE MONTE CARLO (1.000 iterações)');
    log('Embaralhando a ordem dos dias aleatoriamente:');
    log('| Banca Inicial | Risco de Ruína | Drawdown Médio | Drawdown 95% (Pessimista) |');
    log('|---------------|----------------|----------------|---------------------------|');

    for (const bank of BANKROLL_SCENARIOS) {
        logDisk(`Monte Carlo for Bankroll: ${bank}`);
        const result = runMonteCarlo(pnls, bank);
        log(`| R$ ${bank.toString().padEnd(5)}      | ${result.ruinProbability.toFixed(2)}%          | R$ ${result.avgMaxDD.toFixed(0).padEnd(6)}      | R$ ${result.percentile95DD.toFixed(0).padEnd(10)}            |`);
    }
    log('*Risco de Ruína: chance de quebrar a banca em 30 seções.*');
    log('*Drawdown 95%: Em 95% dos casos, o drawdown não passa disso.*\n');

    logDisk('Starting Stress Test...');
    log('## 3. STRESS TEST (CRASH TEST)');
    log('Cenário do APOCALIPSE: Os piores dias acontecem todos no início.');
    
    for (const bank of BANKROLL_SCENARIOS) {
        const stress = runStressTest(pnls, bank);
        const emoji = stress.survived ? '✅' : '💀';
        const msg = stress.survived 
            ? `Sobreviveu! Saldo Final: R$ ${stress.finalBalance.toFixed(2)} (DD Máx: R$ ${stress.maxDD.toFixed(0)})` 
            : `Quebrou na sessão ${stress.stepsUntilRuin}.`;
        log(`- Banca R$ ${bank}: ${emoji} ${msg}`);
    }

    log('\n## 4. CONCLUSÃO TÉCNICA');
    const scenario3k = runMonteCarlo(pnls, 3000);
    if (scenario3k.ruinProbability < 1) {
        log('✅ **ESTRATÉGIA ROBUSTA PARA BANCA DE R$ 3.000+**');
        log('O risco de ruína é virtualmente zero se respeitar rigorosamente os stops.');
    } else {
        log('⚠️ **RISCO MODERADO/ALTO**');
        log('Existe chance real de quebra. Aumentar banca ou reduzir stake recomendada.');
    }

    logDisk('Writing Report File...');
    fs.writeFileSync(path.join(__dirname, 'RELATORIO_RISCO_V8.txt'), report.join('\n'));
    console.log('\n📄 Relatório salvo em scripts/RELATORIO_RISCO_V8.txt');
    logDisk('Done.');
}

try {
    console.log('DEBUG: Calling main()');
    main();
} catch (error) {
    console.error('CRITICAL ERROR MESSAGE:', error.message);
    console.error('CRITICAL ERROR STACK:', error.stack);
}
