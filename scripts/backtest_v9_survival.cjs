const fs = require('fs');
const path = require('path');

// CONFIG
const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const TRACE_DIR = path.join(__dirname, '../ANALISE_SURVIVAL_V9');
const EXIT_TARGET = 10.0;
const BASE_STAKE = 50.0; 
const INITIAL_BANKROLL = 1000.0;
const MEMORY_SIZE = 50; 

// SESSION LIMITS
const STOP_WIN = 500.0;
const STOP_LOSS = -500.0;

// Ensure Trace Dir Exists
if (!fs.existsSync(TRACE_DIR)) {
    fs.mkdirSync(TRACE_DIR, { recursive: true });
}

// === STRATEGY V9 LOGIC (Mirrors StrategyCore.ts) ===

class StrategyV9 {
    static analyze(values) {
        // 1. STATS
        const lastPinkIndex = values.findIndex(v => v >= 10.0);
        const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

        // 2. REGIME & PHASE
        const { regime, phase, absStake } = this.calculateRegimeAndPhaseV9(values, candlesSinceLastPink);

        // 3. DECISION
        const recommendation = this.decideActionV9(values, candlesSinceLastPink, regime, phase);

        return {
            recommendation,
            regime,
            phase,
            absStake,
            candlesSinceLastPink
        };
    }

    static calculateRegimeAndPhaseV9(values, candlesSinceLastPink) {
        // 1. HOSTILE (DESERT)
        if (candlesSinceLastPink >= 12) {
            return { regime: 'HOSTILE', phase: 'DESERT', absStake: 0.0 };
        }

        // 2. UNCERTAINTY (BLUE FLOOD)
        const shortWindow = values.slice(0, 20);
        const blueCount = shortWindow.filter(v => v < 2.0).length;
        const recentPain = values.slice(0, 3).filter(v => v < 2.0).length >= 2;

        if (blueCount >= 12 || recentPain) {
            return { regime: 'UNCERTAINTY', phase: 'NORMAL', absStake: 0.5 };
        }

        // 3. EXPANSION (Default + Recovery Logic)
        // Recovery Logic from V8 (Simplified for JS Backtest)
        let phase = 'NORMAL';
        if (candlesSinceLastPink <= 2) {
             const prevPinkIndex = values.slice(candlesSinceLastPink + 1).findIndex(v => v >= 10.0);
             if (prevPinkIndex !== -1) {
                 const gap = prevPinkIndex; // distance between pinks
                 if (gap >= 12) phase = 'RECOVERY';
             } else if (values.length > 20) {
                 // First pink in a long time?
                 phase = 'RECOVERY';
             }
        }

        const isRecovery = phase === 'RECOVERY';

        return { 
            regime: 'EXPANSION', 
            phase, 
            absStake: isRecovery ? 1.5 : 1.0 // BOOST: 150% in Recovery
        };
    }

    static decideActionV9(values, candlesSinceLastPink, regime, phase) {
        if (values.length === 0) return { action: 'WAIT', reason: 'No Data' };

        // LAYER 1: REGIME FILTER
        if (regime === 'HOSTILE') {
            return { action: 'WAIT', reason: `HOSTILE (${candlesSinceLastPink} dry)` };
        }

        const lastValue = values[0];

        // LAYER 2: OPPORTUNITY
        // A. RECOVERY
        if (phase === 'RECOVERY') {
             return { action: 'PLAY_10X', reason: 'RECOVERY' };
        }

        // B. SNIPER TRIGGERS
        if (lastValue < 2.0) return { action: 'PLAY_10X', reason: 'TRIGGER: BLUE' };
        if (lastValue >= 2.0 && lastValue <= 3.5) return { action: 'PLAY_10X', reason: 'TRIGGER: LOW PURPLE' };
        if (lastValue >= 10.0) return { action: 'PLAY_10X', reason: 'TRIGGER: STICKY PINK' };

        return { action: 'WAIT', reason: 'WAITING' };
    }
}

// ... (Previous Logic)

// ... (StrategyV9 Logic remains the same)

// === REPORTING STATS CONTAINERS ===

let globalStats = {
    totalGames: 0, 
    bets: 0, 
    wins: 0, 
    profit: 0,
    maxDrawdown: 0,
    stopWin: 0,
    stopLoss: 0,
    endOfGraph: 0,
    regimeStats: {
        EXPANSION: { bets: 0, wins: 0, totalPinks: 0, caughtPinks: 0 },
        UNCERTAINTY: { bets: 0, wins: 0, totalPinks: 0, caughtPinks: 0 },
        HOSTILE: { bets: 0, wins: 0, totalPinks: 0, caughtPinks: 0 }
    },
    triggers: {
        'BLUE': { bets: 0, wins: 0 },
        'LOW PURPLE': { bets: 0, wins: 0 },
        'STICKY PINK': { bets: 0, wins: 0 },
        'RECOVERY': { bets: 0, wins: 0 }
    },
    recovery: {
        desertBreaks: 0, // Number of times a desert was broken by a pink
        successfulRecoveries: 0 // Number of times we caught a pink in recovery phase
    }
};

// === SIMULATION LOGIC ===

function runSimulation(filename, values) {
    const history = []; 
    let bankroll = INITIAL_BANKROLL;
    let minBankroll = INITIAL_BANKROLL;
    let wins = 0;
    let losses = 0;
    let bets = 0;
    let consecutiveLosses = 0; // For Cool Down
    let inCoolDown = false;
    const profitHistory = [bankroll];

    // Trace Content
    let traceOutput = [];
    traceOutput.push(`================================================================`);
    traceOutput.push(` ANÁLISE SURVIVAL V9: ${filename}`);
    traceOutput.push(` Data: ${new Date().toLocaleString()}`);
    traceOutput.push(`================================================================`);
    traceOutput.push(` ROUND | INPUT | REGIME     | STAKE | AÇÃO       | MOTIVO                    | RESULTADO | SALDO   | CD`);
    traceOutput.push(`----------------------------------------------------------------`);

    let stopReason = 'END_OF_GRAPH';
    let wasInDesert = false;
    
    for (let i = 0; i < values.length; i++) {
        const roundNum = i + 1;
        const crashValue = values[i];
        
        // CHECK STOP LIMITS
        const currentProfit = bankroll - INITIAL_BANKROLL;
        if (currentProfit >= STOP_WIN) {
            stopReason = 'STOP_WIN';
            traceOutput.push(`\n🛑 META BATIDA (STOP WIN): +R$ ${currentProfit.toFixed(2)}`);
            break; 
        }
        if (currentProfit <= STOP_LOSS) { 
            stopReason = 'STOP_LOSS'; 
            traceOutput.push(`\n🛑 LIMITE DE PERDA (STOP LOSS): R$ ${currentProfit.toFixed(2)}`);
            break; 
        }

        let actionStr = 'WAIT';
        let reasonStr = '-';
        let resultStr = '-';
        let stakeStr = '0%';
        let regimeStr = 'INIT';
        let coolDownStr = inCoolDown ? 'ON' : '-';

        // HISTORY FILL
        if (history.length < MEMORY_SIZE) {
             traceOutput.push(` ${String(roundNum).padEnd(5)} | ${crashValue.toFixed(2).padEnd(5)} | ${'BUILD'.padEnd(10)} | ${stakeStr.padEnd(5)} | ${'SKIP'.padEnd(10)} | ${'Building Memory'.padEnd(25)} | ${resultStr.padEnd(9)} | R$ ${bankroll.toFixed(0)} | ${coolDownStr}`);
             history.unshift(crashValue);
             continue; 
        }

        // --- 1. COOL DOWN CHECK (BEFORE ANALYSIS) ---
        if (inCoolDown) {
            // RELEASE CONDITION: Pink > 10x
            regimeStr = 'COOL_DOWN';
            if (crashValue >= 10.0) {
                inCoolDown = false;
                consecutiveLosses = 0;
                coolDownStr = 'RELEASE';
                traceOutput.push(`   >>> 🟢 COOL DOWN LIBERADO POR ROSA (${crashValue.toFixed(2)}x) <<<`);
            } else {
                actionStr = 'BLOCKED';
                reasonStr = 'Cool Down Active';
                resultStr = 'CD-WAIT';
            }
        } 
        else {
            // --- 2. ANALYZE ---
            const analysis = StrategyV9.analyze(history);
            regimeStr = analysis.regime.substring(0, 10);
            
            // TRACK PINKS PER REGIME
             if (globalStats.regimeStats[analysis.regime]) {
                 if (crashValue >= 10.0) globalStats.regimeStats[analysis.regime].totalPinks++;
             }

            // RECOVERY TRACKING (Desert Break)
            if (analysis.regime === 'HOSTILE') wasInDesert = true;
            else if (wasInDesert && crashValue >= 10.0) {
                globalStats.recovery.desertBreaks++;
                wasInDesert = false;
            }

            // --- 3. DECIDE ---
            if (analysis.recommendation.action === 'PLAY_10X') {
                const stakeAmt = BASE_STAKE * analysis.absStake;
                stakeStr = `${analysis.absStake * 100}%`;
                reasonStr = analysis.recommendation.reason.replace('TRIGGER: ', '');
                
                if (stakeAmt > 0) {
                    actionStr = 'PLAY 10x';
                    bets++;
                    
                    // Track Regime Stats
                    if (globalStats.regimeStats[analysis.regime]) globalStats.regimeStats[analysis.regime].bets++;

                    // Track Trigger Stats
                    const triggerKey = reasonStr.includes('RECOVERY') ? 'RECOVERY' :
                                       reasonStr.includes('BLUE') ? 'BLUE' :
                                       reasonStr.includes('PURPLE') ? 'LOW PURPLE' :
                                       reasonStr.includes('STICKY') ? 'STICKY PINK' : 'OTHER';

                    if (globalStats.triggers[triggerKey]) globalStats.triggers[triggerKey].bets++;

                    // RESOLVE
                    if (crashValue >= EXIT_TARGET) {
                        const profit = (stakeAmt * EXIT_TARGET) - stakeAmt;
                        bankroll += profit;
                        wins++;
                        resultStr = `WIN +${profit.toFixed(0)}`;
                        consecutiveLosses = 0;
                        
                        // Regime Win
                        if (globalStats.regimeStats[analysis.regime]) {
                            globalStats.regimeStats[analysis.regime].wins++;
                            globalStats.regimeStats[analysis.regime].caughtPinks++;
                        }
                        // Trigger Win
                        if (globalStats.triggers[triggerKey]) globalStats.triggers[triggerKey].wins++;

                    } else {
                        bankroll -= stakeAmt;
                        losses++;
                        resultStr = `LOSS -${stakeAmt.toFixed(0)}`;
                        consecutiveLosses++;
                    }
                } else {
                    actionStr = 'SKIP (0$)';
                }
            } else {
                reasonStr = analysis.recommendation.reason;
            }
            
            // --- 4. TRIGGER COOL DOWN? ---
            if (consecutiveLosses >= 3) {
                inCoolDown = true;
                coolDownStr = 'ACTIVATED';
            }
        }

        // Trace Line
        traceOutput.push(` ${String(roundNum).padEnd(5)} | ${crashValue.toFixed(2).padEnd(5)} | ${regimeStr.padEnd(10)} | ${stakeStr.padEnd(5)} | ${actionStr.padEnd(10)} | ${reasonStr.padEnd(25)} | ${resultStr.padEnd(9)} | R$ ${bankroll.toFixed(0)} | ${coolDownStr}`);

        // Update History
        history.unshift(crashValue);
        
        // Drawdown
        profitHistory.push(bankroll);
        if (bankroll < minBankroll) minBankroll = bankroll;
    }

    // Stats Compilation
    if (stopReason === 'STOP_WIN') globalStats.stopWin++;
    else if (stopReason === 'STOP_LOSS') globalStats.stopLoss++;
    else globalStats.endOfGraph++;

    let maxDD = 0;
    let peak = -Infinity;
    for (const v of profitHistory) {
      if (v > peak) peak = v;
      if (peak - v > maxDD) maxDD = peak - v;
    }

    const assertiveness = bets > 0 ? (wins / bets) * 100 : 0;
    const profit = bankroll - INITIAL_BANKROLL;

    // === FINALIZE TRACE FILE ===
    traceOutput.push(`----------------------------------------------------------------`);
    traceOutput.push(` RESUMO DO GRAFO:`);
    traceOutput.push(` Status: ${stopReason}`);
    traceOutput.push(` Jogadas: ${bets} | Wins: ${wins} | Assertividade: ${assertiveness.toFixed(2)}%`);
    traceOutput.push(` Saldo Inicial: R$ ${INITIAL_BANKROLL.toFixed(2)} | Final: R$ ${bankroll.toFixed(2)}`);
    traceOutput.push(` Lucro Líquido: R$ ${profit.toFixed(2)}`);
    traceOutput.push(` Drawdown Máx:  R$ ${maxDD.toFixed(2)}`);
    traceOutput.push(`================================================================`);

    // Save Trace
    const tracePath = path.join(TRACE_DIR, `${filename}_survival_v9.txt`);
    fs.writeFileSync(tracePath, traceOutput.join('\n'));

    return {
        bets, wins, losses, 
        profit: bankroll - INITIAL_BANKROLL,
        maxDrawdown: maxDD,
        stopReason,
        assertiveness: bets > 0 ? (wins/bets)*100 : 0
    };
}

function main() {
    console.log('🚀 BACKTEST SURVIVAL V9 [DETAILED REPORT MODE]...');
    
    if (!fs.existsSync(GRAFOS_DIR)) {
        console.error('Directory not found:', GRAFOS_DIR);
        return;
    }

    const files = fs.readdirSync(GRAFOS_DIR)
        .filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));

    console.log(`Analyzing ${files.length} graphs...`);
    
    const fileResults = [];

    for (const file of files) {
        const filePath = path.join(GRAFOS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const multipliers = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));

        const stats = runSimulation(file, multipliers);

        globalStats.totalGames++;
        globalStats.bets += stats.bets;
        globalStats.wins += stats.wins;
        globalStats.profit += stats.profit;
        if (stats.maxDrawdown > globalStats.maxDrawdown) globalStats.maxDrawdown = stats.maxDrawdown;

        let icon = '➖';
        if (stats.stopReason === 'STOP_WIN') icon = '✅';
        else if (stats.stopReason === 'STOP_LOSS') icon = '💀';
        
        fileResults.push(`| ${file.padEnd(15)} | ${String(stats.bets).padEnd(4)} | ${String(stats.wins).padEnd(4)} | ${(stats.profit).toFixed(2).padEnd(9)} | ${icon} |`);
    }

    // Report Console Output
    const roi = (globalStats.profit / (globalStats.bets * BASE_STAKE)) * 100;
    const assert = (globalStats.wins / globalStats.bets) * 100;

    const reportLines = [];
    const log = (msg) => { console.log(msg); reportLines.push(msg); };

    log('\n================================================================');
    log(' RELATÓRIO DE PERFORMANCE V9 - SURVIVAL & RECOVERY');
    log(` Data: ${new Date().toLocaleString('pt-BR')}`);
    log('================================================================');
    log(` 💰 PROFIT LÍQUIDO:   R$ ${globalStats.profit.toFixed(2)}`);
    log(` 📉 MAX DRAWDOWN:     R$ ${globalStats.maxDrawdown.toFixed(2)}`);
    log(` 📊 ASSERTIVIDADE:    ${assert.toFixed(2)}% (${globalStats.wins}/${globalStats.bets})`);
    log('----------------------------------------------------------------');
    log(' 🏆 SESSÕES:');
    log(`    ✅ STOP WIN:      ${globalStats.stopWin}`);
    log(`    💀 STOP LOSS:     ${globalStats.stopLoss}`);
    log(`    ➖ NEUTRO:        ${globalStats.endOfGraph}`);
    log('----------------------------------------------------------------');
    log(' 📍 PERFORMANCE POR REGIME (Assertividade | Pinks Capturados):');
    
    const printRegime = (name) => {
        const s = globalStats.regimeStats[name];
        const assert = s.bets > 0 ? (s.wins/s.bets*100).toFixed(1) : '0.0';
        const capture = s.totalPinks > 0 ? (s.caughtPinks/s.totalPinks*100).toFixed(1) : '0.0';
        log(`    ${name.padEnd(12)}: ${assert}% (${s.wins}/${s.bets}) | Capture: ${capture}% (${s.caughtPinks}/${s.totalPinks})`);
    };
    
    printRegime('EXPANSION');
    printRegime('UNCERTAINTY');
    printRegime('HOSTILE');
    
    log('----------------------------------------------------------------');
    log(' 🔫 DETALHE DOS GATILHOS (Winrate):');
    for (const [key, val] of Object.entries(globalStats.triggers)) {
        if (val.bets > 0) {
            log(`    ${key.padEnd(15)}: ${(val.wins/val.bets*100).toFixed(1)}% (${val.wins}/${val.bets})`);
        }
    }
    log('----------------------------------------------------------------');
    log(' 🌵 RECUPERAÇÃO PÓS-DESERTO:');
    log(`    Quebras de Deserto Detectadas: ${globalStats.recovery.desertBreaks}`);
    // Rec wins are already in triggers
    log('================================================================');
    log(' DETALHE POR GRAFO:');
    
    fileResults.forEach(r => log(r));
    
    // Save Global Report
    const reportPath = path.join(__dirname, 'RELATORIO_SURVIVAL_V9.txt');
    fs.writeFileSync(reportPath, reportLines.join('\n'));
}

main();
