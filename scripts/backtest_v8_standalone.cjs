
const fs = require('fs');
const path = require('path');

// CONFIG
const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const EXIT_TARGET = 10.0;
const STAKE = 10.0;
const MEMORY_SIZE = 60; // Size of history buffer used for context analysis in report

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
            return { action: 'WAIT', reason: 'DESERT' };
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
            // Check if this pink broke a desert
            // Look for previous pink
            const nextPinkIndexRel = values.slice(pinkIndex + 1).findIndex(v => v >= 10.0);
            
            if (nextPinkIndexRel !== -1) {
                const actualNextPinkIndex = pinkIndex + 1 + nextPinkIndexRel;
                const gap = actualNextPinkIndex - pinkIndex - 1;
                
                if (gap >= 12) {
                    return 'RECOVERY';
                }
            } else {
                // If no previous pink in window, check if window is long enough to be desert
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

// === SIMULATION LOGIC ===

function runSimulation(filename, values) {
    const history = []; 
    let bankroll = 0;
    let minBankroll = 0;
    let wins = 0;
    let losses = 0;
    let bets = 0;
    const profitHistory = [0];

    // Stats specific to this run (for internal logic state)
    let wasInDesert = false;
    let desertBreakIndex = -1;
    
    // We iterate through values chronologically. 
    // values[0] is the FIRST candle of the file.
    
    for (let i = 0; i < values.length; i++) {
        const currentResult = values[i];
        
        // 1. Analyze BEFORE knowing current result
        const analysis = StrategyLogic.analyze(history); // history[0] is the most recent
        const decision = analysis.recommendationPink;
        
        // 2. Play Decision
        if (decision.action === 'PLAY_10X') {
            bets++;
            if (currentResult >= EXIT_TARGET) {
                wins++;
                const profit = (STAKE * EXIT_TARGET) - STAKE;
                bankroll += profit;
            } else {
                losses++;
                bankroll -= STAKE;
            }
        }

        // 3. Update Global Market Stats (knowing current result)
        globalMarketStats.totalVelas++;
        if (currentResult < 2.0) globalMarketStats.blue++;
        else if (currentResult < 10.0) globalMarketStats.purple++;
        else globalMarketStats.pink++;

        // 4. Update Global Phase Stats
        // analysis.phase told us what phase we WERE in coming into this candle
        const p = analysis.phase.toLowerCase(); 
        if (globalPhaseStats[p]) {
            globalPhaseStats[p].total++;
            if (currentResult >= 10.0) globalPhaseStats[p].pinks++;
        } else {
            // Should be covered, but mapped 'CLUSTER' to 'NORMAL' effectively in V8 logic? 
            // V8 returns NORMAL, DESERT, RECOVERY. 
            if (p === 'cluster') { // Just in case
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
            // Broke Desert
            globalRecoveryStats.desertBreaks++;
            desertBreakIndex = i;
            wasInDesert = false;
        }
        
        if (desertBreakIndex !== -1 && i > desertBreakIndex) {
            if (i <= desertBreakIndex + 10) {
                if (currentResult >= 10.0) {
                    globalRecoveryStats.secondPinkIn10++;
                    desertBreakIndex = -1; // Counted, reset
                }
            } else {
                // Passed 10 candles
                 if (analysis.phase === 'DESERT') { // Simplified check: if we are BACK in desert logic
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

    let maxDrawdown = 0;
    let peak = 0;
    for (const val of profitHistory) {
      if (val > peak) peak = val;
      const dd = peak - val;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    const assertiveness = bets > 0 ? (wins / bets) * 100 : 0;

    return {
        totalGames: values.length,
        bets,
        wins,
        losses,
        profit: bankroll,
        maxDrawdown,
        assertiveness
    };
}

// === MAIN ===

function main() {
    console.log('🚀 STARTING ENHANCED BACKTEST V8+ (CJS)...');
    
    if (!fs.existsSync(GRAFOS_DIR)) {
        console.error('Directory not found:', GRAFOS_DIR);
        return;
    }

    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt'));
    let globalStats = {
        totalGames: 0,
        bets: 0,
        wins: 0,
        losses: 0,
        profit: 0,
        maxDrawdown: 0
    };

    const lines = [];
    const log = (msg) => { console.log(msg); lines.push(msg); };

    log('================================================================');
    log(' RELATÓRIO DE BACKTEST (DETALHADO) - SNIPER V8+');
    log(` Data: ${new Date().toLocaleString('pt-BR')}`);
    log('================================================================');
    log(` Arquivos Analisados: ${files.length}`);
    log('----------------------------------------------------------------');
    log(`| ${'GRAFO'.padEnd(15)} | ${'BETS'.padEnd(6)} | ${'WINS'.padEnd(6)} | ${'ASSERT%'.padEnd(8)} | ${'LUCRO'.padEnd(10)} |`);
    log('----------------------------------------------------------------');
    
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

        const icon = stats.profit >= 0 ? '✅' : '❌';
        log(`| ${file.padEnd(15)} | ${String(stats.bets).padEnd(6)} | ${String(stats.wins).padEnd(6)} | ${stats.assertiveness.toFixed(2).padEnd(8)} | R$ ${stats.profit.toFixed(2).padEnd(7)} ${icon}|`);
    }

    const globalAssertiveness = globalStats.bets > 0 ? (globalStats.wins / globalStats.bets) * 100 : 0;
    const totalInvested = globalStats.bets * STAKE;
    const roi = totalInvested > 0 ? (globalStats.profit / totalInvested) * 100 : 0;

    log('================================================================');
    log(' RESUMO GLOBAL');
    log('================================================================');
    log(` Total de Velas:     ${globalStats.totalGames}`);
    log(` Total de Apostas:   ${globalStats.bets}`);
    log(` Total de Greens:    ${globalStats.wins}`);
    log(` Assertividade:      ${globalAssertiveness.toFixed(2)}%`);
    log(` Lucro Líquido:      R$ ${globalStats.profit.toFixed(2)}`);
    log(` ROI Global:         ${roi.toFixed(2)}% 🚀`);
    log(` Drawdown Máximo:    R$ ${globalStats.maxDrawdown.toFixed(2)}`);
    log('----------------------------------------------------------------');
    
    // DETALHES DE MERCADO E PADRÕES
    
    // Market Caps
    const pctBlue = (globalMarketStats.blue / globalMarketStats.totalVelas) * 100;
    const pctPurple = (globalMarketStats.purple / globalMarketStats.totalVelas) * 100;
    const pctPink = (globalMarketStats.pink / globalMarketStats.totalVelas) * 100;

    log(' 📊 DISTRIBUIÇÃO DO MERCADO:');
    log(`    🔵 Azuis  (< 2x):    ${globalMarketStats.blue.toString().padEnd(5)} (${pctBlue.toFixed(2)}%)`);
    log(`    🟣 Roxas  (2x-10x):  ${globalMarketStats.purple.toString().padEnd(5)} (${pctPurple.toFixed(2)}%)`);
    log(`    🌸 Rosas  (>= 10x):  ${globalMarketStats.pink.toString().padEnd(5)} (${pctPink.toFixed(2)}%)`);
    log('----------------------------------------------------------------');

    // Stats por Fase
    const rateNormal = globalPhaseStats.normal.total > 0 ? (globalPhaseStats.normal.pinks / globalPhaseStats.normal.total * 100) : 0;
    const rateDesert = globalPhaseStats.desert.total > 0 ? (globalPhaseStats.desert.pinks / globalPhaseStats.desert.total * 100) : 0;
    const rateRecovery = globalPhaseStats.recovery.total > 0 ? (globalPhaseStats.recovery.pinks / globalPhaseStats.recovery.total * 100) : 0;

    log(' 📍 ROSAS POR FASE (Onde estão as rosas?):');
    log(`    ⚖️  NORMAL:      ${globalPhaseStats.normal.pinks}/${globalPhaseStats.normal.total} velas (${rateNormal.toFixed(2)}% rosa)`);
    log(`    🌵 DESERTO:      ${globalPhaseStats.desert.pinks}/${globalPhaseStats.desert.total} velas (${rateDesert.toFixed(2)}% rosa)`);
    log(`    🔥 RECOVERY:     ${globalPhaseStats.recovery.pinks}/${globalPhaseStats.recovery.total} velas (${rateRecovery.toFixed(2)}% rosa)`);
    log('----------------------------------------------------------------');

    // Contexto
    const pctAfterBlue = globalPinkContext.total > 0 ? (globalPinkContext.afterBlue / globalPinkContext.total * 100) : 0;
    const pctAfterPurple = globalPinkContext.total > 0 ? (globalPinkContext.afterPurple / globalPinkContext.total * 100) : 0;
    const pctAfterPink = globalPinkContext.total > 0 ? (globalPinkContext.afterPink / globalPinkContext.total * 100) : 0;

    log(' 📌 CONTEXTO DAS ROSAS (O que vem antes?):');
    log(`    Após AZUL (<2x):     ${globalPinkContext.afterBlue.toString().padEnd(4)} (${pctAfterBlue.toFixed(1)}%)`);
    log(`    Após ROXO (2-10x):   ${globalPinkContext.afterPurple.toString().padEnd(4)} (${pctAfterPurple.toFixed(1)}%)`);
    log(`    Após ROSA (>=10x):   ${globalPinkContext.afterPink.toString().padEnd(4)} (${pctAfterPink.toFixed(1)}%) - Sticky Pinks`);
    log('----------------------------------------------------------------');

    // Recuperação
    const pctSecondPink = globalRecoveryStats.desertBreaks > 0 ? (globalRecoveryStats.secondPinkIn10 / globalRecoveryStats.desertBreaks * 100) : 0;

    log(' 🌵 RECUPERAÇÃO PÓS-DESERTO:');
    log(`    Quebras de Deserto:        ${globalRecoveryStats.desertBreaks}`);
    log(`    2ª Rosa em até 10 velas:   ${globalRecoveryStats.secondPinkIn10} (${pctSecondPink.toFixed(1)}%)`);
    log('================================================================');

    const outputPath = path.join(__dirname, 'RELATORIO_V8_ANTIGRAVITY.txt');
    fs.writeFileSync(outputPath, lines.join('\n'));
    console.log(`\n📄 Relatório salvo em: ${outputPath}`);
}

main();
