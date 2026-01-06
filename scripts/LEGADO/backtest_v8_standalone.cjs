
const fs = require('fs');
const path = require('path');

// CONFIG
const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const TRACE_DIR = path.join(__dirname, '../ANALISE_V8_DETALHADA');
const EXIT_TARGET = 10.0;
const STAKE = 50.0; 
const INITIAL_BANKROLL = 1000.0;
const MEMORY_SIZE = 25; 

// SESSION LIMITS
const STOP_WIN = 500.0;
const STOP_LOSS = -500.0;

// Ensure Trace Dir Exists
if (!fs.existsSync(TRACE_DIR)) {
    fs.mkdirSync(TRACE_DIR, { recursive: true });
}

// === STRATEGY LOGIC (Ported from StrategyCore.ts) ===

class StrategyLogic {
    static analyze(values) {
        // Basic stats needed for V8
        const lastPinkIndex = values.findIndex(v => v >= 10.0);
        const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;
        
        // Phase
        const phase = this.calculatePhaseV8(values, candlesSinceLastPink);
        
        // Decision
        const recPink = this.decideActionSniperV8(values, candlesSinceLastPink, phase);
        
        return {
            recommendationPink: recPink,
            phase,
            candlesSinceLastPink
        };
    }

    static decideActionSniperV8(values, candlesSinceLastPink, phase) {
        if (values.length === 0) return { action: 'WAIT' };
        
        // 1. DESERT PROTECTION
        if (phase === 'DESERT') {
            return { action: 'WAIT', reason: `DESERT (${candlesSinceLastPink} velas sem rosa)` };
        }

        // 2. RECOVERY
        if (phase === 'RECOVERY') {
            const recoveryRound = candlesSinceLastPink + 1;
            return {
                action: 'PLAY_10X',
                reason: `RECOVERY (${recoveryRound}/3)`
            };
        }

        // 3. TRIGGERS
        const lastValue = values[0];
        
        // CHECK: Blue
        if (lastValue < 2.0) {
            return { action: 'PLAY_10X', reason: 'TRIGGER: BLUE' };
        }

        // CHECK: Low Purple
        if (lastValue >= 2.0 && lastValue <= 3.5) {
            return { action: 'PLAY_10X', reason: 'TRIGGER: LOW PURPLE' };
        }

        // CHECK: Sticky Pink
        if (lastValue >= 10.0) {
            return { action: 'PLAY_10X', reason: 'TRIGGER: STICKY PINK' };
        }

        // NO TRIGGER
        return { action: 'WAIT', reason: 'NO TRIGGER' };
    }

    static calculatePhaseV8(values, candlesSinceLastPink) {
        if (candlesSinceLastPink >= 12) return 'DESERT';

        const pinkIndex = candlesSinceLastPink;
        
        if (pinkIndex <= 2) {
            const nextPinkIndexRel = values.slice(pinkIndex + 1).findIndex(v => v >= 10.0);
            
            if (nextPinkIndexRel !== -1) {
                const actualNextPinkIndex = pinkIndex + 1 + nextPinkIndexRel;
                const gap = actualNextPinkIndex - pinkIndex - 1;
                
                if (gap >= 12) {
                    return 'RECOVERY';
                }
            } else {
                if (values.length > pinkIndex + 1 + 12) {
                    return 'RECOVERY';
                }
            }
        }
        
        return 'NORMAL';
    }
}

// === REPORTING STATS CONTAINERS ===

let globalMarketStats = { totalVelas: 0, blue: 0, purple: 0, pink: 0 };
let globalPhaseStats = {
    normal: { pinks: 0, total: 0 },
    desert: { pinks: 0, total: 0 },
    recovery: { pinks: 0, total: 0 }
};
let globalPinkContext = {
    afterBlue: 0,
    afterPurple: 0,
    afterPink: 0,
    total: 0
};
let globalRecoveryStats = {
    desertBreaks: 0,
    secondPinkIn10: 0,
    backToDesertIn10: 0
};
let globalSessionStats = {
    stopWin: 0,
    stopLoss: 0,
    endOfGraph: 0
};

// === SIMULATION LOGIC ===

function runSimulation(filename, values) {
    const history = []; 
    let bankroll = INITIAL_BANKROLL;
    let minBankroll = INITIAL_BANKROLL;
    let wins = 0;
    let losses = 0;
    let bets = 0;
    const profitHistory = [bankroll];

    // Trace Content
    let traceOutput = [];
    traceOutput.push(`================================================================`);
    traceOutput.push(` ANÁLISE DETALHADA: ${filename}`);
    traceOutput.push(` Data: ${new Date().toLocaleString()}`);
    traceOutput.push(`================================================================`);
    traceOutput.push(` ROUND | INPUT | AÇÃO       | MOTIVO                        | RESULTADO | SALDO`);
    traceOutput.push(`----------------------------------------------------------------`);

    let wasInDesert = false;
    let desertBreakIndex = -1;
    let stopReason = 'END_OF_GRAPH';
    
    // Iterate through values chronologically.
    for (let i = 0; i < values.length; i++) {
        const roundNum = i + 1;
        const currentResult = values[i];
        
        // CHECK STOP LIMITS BEFORE ROUND
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

        // --- TRACE LOGIC ---
        let actionStr = 'SKIP';
        let reasonStr = 'Building Memory';
        let resultStr = '-';
        let balanceStr = bankroll.toFixed(2);

        if (history.length < MEMORY_SIZE) {
             traceOutput.push(` ${String(roundNum).padEnd(5)} | ${currentResult.toFixed(2).padEnd(5)} | ${actionStr.padEnd(10)} | ${reasonStr.padEnd(29)} | ${resultStr.padEnd(9)} | R$ ${balanceStr}`);
             history.unshift(currentResult);
             continue; 
        }

        // 1. Analyze BEFORE knowing current result
        const analysis = StrategyLogic.analyze(history);
        const decision = analysis.recommendationPink;
        
        actionStr = decision.action === 'PLAY_10X' ? 'PLAY 10x' : 'WAIT';
        reasonStr = decision.reason.replace('TARGET: ', '');
        if (reasonStr.length > 29) reasonStr = reasonStr.substring(0, 26) + '...';

        // 2. Play Decision
        if (decision.action === 'PLAY_10X') {
            bets++;
            if (currentResult >= EXIT_TARGET) {
                wins++;
                const profit = (STAKE * EXIT_TARGET) - STAKE;
                bankroll += profit;
                resultStr = `WIN (+${profit})`;
            } else {
                losses++;
                bankroll -= STAKE;
                resultStr = `LOSS (-${STAKE})`;
            }
        } else {
             resultStr = '-';
        }

        // Trace Line
        balanceStr = bankroll.toFixed(2);
        traceOutput.push(` ${String(roundNum).padEnd(5)} | ${currentResult.toFixed(2).padEnd(5)} | ${actionStr.padEnd(10)} | ${reasonStr.padEnd(29)} | ${resultStr.padEnd(9)} | R$ ${balanceStr}`);

        // 3. Update Global Market Stats 
        globalMarketStats.totalVelas++;
        if (currentResult < 2.0) globalMarketStats.blue++;
        else if (currentResult < 10.0) globalMarketStats.purple++;
        else globalMarketStats.pink++;

        // 4. Update Global Phase Stats
        const p = analysis.phase.toLowerCase(); 
        if (globalPhaseStats[p]) {
            globalPhaseStats[p].total++;
            if (currentResult >= 10.0) globalPhaseStats[p].pinks++;
        } else {
            if (p === 'cluster') { 
                 globalPhaseStats.normal.total++;
                 if (currentResult >= 10.0) globalPhaseStats.normal.pinks++;
            }
        }

        // 5. Update Pink Context
        if (currentResult >= 10.0) {
            globalPinkContext.total++;
            const prevValue = history.length > 0 ? history[0] : null;
            if (prevValue !== null) {
                if (prevValue < 2.0) globalPinkContext.afterBlue++;
                else if (prevValue < 10.0) globalPinkContext.afterPurple++;
                else globalPinkContext.afterPink++;
            }
        }

        // 6. Update Recovery Stats
        if (analysis.phase === 'DESERT') {
            wasInDesert = true;
        } else if (wasInDesert && currentResult >= 10.0) {
            globalRecoveryStats.desertBreaks++;
            desertBreakIndex = i;
            wasInDesert = false;
        }
        
        if (desertBreakIndex !== -1 && i > desertBreakIndex) {
            if (i <= desertBreakIndex + 10) {
                if (currentResult >= 10.0) {
                    globalRecoveryStats.secondPinkIn10++;
                    desertBreakIndex = -1; 
                }
            } else {
                 if (analysis.phase === 'DESERT') { 
                     globalRecoveryStats.backToDesertIn10++;
                 }
                 desertBreakIndex = -1;
            }
        }

        // 7. Update History
        history.unshift(currentResult);
        
        // 8. Drawdown Tracking
        profitHistory.push(bankroll);
        if (bankroll < minBankroll) minBankroll = bankroll;
    }

    if (stopReason === 'STOP_WIN') globalSessionStats.stopWin++;
    else if (stopReason === 'STOP_LOSS') globalSessionStats.stopLoss++;
    else globalSessionStats.endOfGraph++;

    let maxDrawdown = 0;
    let peak = -Infinity;
    for (const val of profitHistory) {
      if (val > peak) peak = val;
      const dd = peak - val;
      if (dd > maxDrawdown) maxDrawdown = dd;
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
    traceOutput.push(` Drawdown Máx:  R$ ${maxDrawdown.toFixed(2)}`);
    traceOutput.push(`================================================================`);

    const tracePath = path.join(TRACE_DIR, `${filename}_analise.txt`);
    fs.writeFileSync(tracePath, traceOutput.join('\n'));

    return {
        totalGames: values.length,
        bets,
        wins,
        losses,
        profit,
        maxDrawdown,
        assertiveness,
        stopReason
    };
}

// === MAIN ===

function main() {
    console.log('🚀 STARTING ENHANCED BACKTEST V8+ (Session Limits)...');
    
    if (!fs.existsSync(GRAFOS_DIR)) {
        console.error('Directory not found:', GRAFOS_DIR);
        return;
    }

    const files = fs.readdirSync(GRAFOS_DIR)
        .filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));

    let globalStats = {
        totalGames: 0,
        bets: 0,
        wins: 0,
        losses: 0,
        profit: 0,
        maxDrawdown: 0
    };

    const fileResults = [];

    console.log(`Analyzing ${files.length} graphs with Limits (Win: +${STOP_WIN}, Loss: ${STOP_LOSS})...`);

    for (const file of files) {
        const filePath = path.join(GRAFOS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const multipliers = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));

        const stats = runSimulation(file, multipliers);

        globalStats.totalGames += stats.totalGames;
        globalStats.bets += stats.bets;
        globalStats.wins += stats.wins;
        globalStats.losses += stats.losses;
        globalStats.profit += stats.profit;
        if (stats.maxDrawdown > globalStats.maxDrawdown) globalStats.maxDrawdown = stats.maxDrawdown;

        let icon = '➖';
        if (stats.stopReason === 'STOP_WIN') icon = '✅ 🏆';
        else if (stats.stopReason === 'STOP_LOSS') icon = '❌ 💀';
        
        fileResults.push(`| ${file.padEnd(15)} | ${String(stats.bets).padEnd(6)} | ${String(stats.wins).padEnd(6)} | ${stats.assertiveness.toFixed(2).padEnd(8)} | R$ ${stats.profit.toFixed(2).padEnd(9)} ${icon}|`);
    }

    const globalAssertiveness = globalStats.bets > 0 ? (globalStats.wins / globalStats.bets) * 100 : 0;
    const totalInvested = globalStats.bets * STAKE;
    const roi = totalInvested > 0 ? (globalStats.profit / totalInvested) * 100 : 0;

    const lines = [];
    const log = (msg) => { lines.push(msg); };

    log('================================================================');
    log(' RELATÓRIO DE BACKTEST - SNIPER V8+ (GESTÃO ATIVA)');
    log(` Data: ${new Date().toLocaleString('pt-BR')}`);
    log('================================================================');
    log(' CONFIGURAÇÃO DE SESSÃO:');
    log(` Stop Win:  +R$ ${STOP_WIN.toFixed(2)}`);
    log(` Stop Loss: -R$ ${Math.abs(STOP_LOSS).toFixed(2)}`);
    log('================================================================');
    
    log(' RESUMO GLOBAL');
    log('================================================================');
    log(` Total de Velas:     ${globalStats.totalGames}`);
    log(` Total de Apostas:   ${globalStats.bets}`);
    log(` Total de Greens:    ${globalStats.wins}`);
    log(` Assertividade:      ${globalAssertiveness.toFixed(2)}%`);
    log(` Lucro Líquido:      R$ ${globalStats.profit.toFixed(2)}`);
    log(` ROI Global:         ${roi.toFixed(2)}%`);
    log(` Drawdown Máximo:    R$ ${globalStats.maxDrawdown.toFixed(2)}`);
    log('----------------------------------------------------------------');
    log(' SESSÕES (GRAFOS):');
    log(` 🏆 Stop Win:       ${globalSessionStats.stopWin} (${(globalSessionStats.stopWin/files.length*100).toFixed(1)}%)`);
    log(` 💀 Stop Loss:      ${globalSessionStats.stopLoss} (${(globalSessionStats.stopLoss/files.length*100).toFixed(1)}%)`);
    log(` ➖ Encerramento:   ${globalSessionStats.endOfGraph} (${(globalSessionStats.endOfGraph/files.length*100).toFixed(1)}%)`);
    log('----------------------------------------------------------------');

    // Stats por Fase
    const rateNormal = globalPhaseStats.normal.total > 0 ? (globalPhaseStats.normal.pinks / globalPhaseStats.normal.total * 100) : 0;
    const rateDesert = globalPhaseStats.desert.total > 0 ? (globalPhaseStats.desert.pinks / globalPhaseStats.desert.total * 100) : 0;
    const rateRecovery = globalPhaseStats.recovery.total > 0 ? (globalPhaseStats.recovery.pinks / globalPhaseStats.recovery.total * 100) : 0;

    log(' 📍 ROSAS POR FASE (Global):');
    log(`    ⚖️  NORMAL:      ${globalPhaseStats.normal.pinks}/${globalPhaseStats.normal.total} (${rateNormal.toFixed(2)}%)`);
    log(`    🌵 DESERTO:      ${globalPhaseStats.desert.pinks}/${globalPhaseStats.desert.total} (${rateDesert.toFixed(2)}%)`);
    log(`    🔥 RECOVERY:     ${globalPhaseStats.recovery.pinks}/${globalPhaseStats.recovery.total} (${rateRecovery.toFixed(2)}%)`);
    log('----------------------------------------------------------------');

    // Recuperação
    const pctSecondPink = globalRecoveryStats.desertBreaks > 0 ? (globalRecoveryStats.secondPinkIn10 / globalRecoveryStats.desertBreaks * 100) : 0;

    log(' 🌵 RECUPERAÇÃO PÓS-DESERTO:');
    log(`    Quebras: ${globalRecoveryStats.desertBreaks} | 2ª Rosa: ${globalRecoveryStats.secondPinkIn10} (${pctSecondPink.toFixed(1)}%)`);
    log('================================================================\n');

    log(' DESEMPENHO POR SESSÃO (GRAFO):');
    log('----------------------------------------------------------------');
    log(`| ${'GRAFO'.padEnd(15)} | ${'BETS'.padEnd(6)} | ${'WINS'.padEnd(6)} | ${'ASSERT%'.padEnd(8)} | ${'LUCRO'.padEnd(12)} |`);
    log('----------------------------------------------------------------');
    
    fileResults.forEach(r => log(r));
    
    log('----------------------------------------------------------------');
    log(`\n Análise detalhada salva em: ${TRACE_DIR}`);

    const outputPath = path.join(__dirname, 'RELATORIO_V8_ANTIGRAVITY.txt');
    fs.writeFileSync(outputPath, lines.join('\n'));
    console.log(`\n📄 Relatório Global salvo em: ${outputPath}`);
}

main();
