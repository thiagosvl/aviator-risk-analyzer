const fs = require('fs');
const path = require('path');

// CONFIG
if (process.argv.length < 3) {
    console.error("❌ ERRO: Informe a pasta raiz (ex: node script.js DEZ_26)");
    process.exit(1);
}

const ROOT_ARG = process.argv[2];
const ROOT_PATH = path.join(__dirname, '..', ROOT_ARG);
const FOLDER_NAME = path.basename(ROOT_PATH); // Extracts 'DEZ_26' from 'DATASETS/DEZ_26'

const GRAFOS_DIR = path.join(ROOT_PATH, 'GRAFOS_TXT');
const TRACE_DIR = path.join(ROOT_PATH, 'RELATORIOS_GRAFOS_TXT');
const REPORT_FILE = path.join(ROOT_PATH, `RELATORIO_${FOLDER_NAME}.txt`);

// Ensure Output Dir Exists
if (!fs.existsSync(TRACE_DIR)) {
    fs.mkdirSync(TRACE_DIR, { recursive: true });
} else {
    // Clean old reports
    fs.readdirSync(TRACE_DIR).forEach(f => fs.unlinkSync(path.join(TRACE_DIR, f)));
}

const EXIT_TARGET = 10.0;
const BASE_STAKE = 50.0; 
const INITIAL_BANKROLL = 3000.0;
const MEMORY_SIZE = 25; 

// SESSION LIMITS
const STOP_WIN = 500.0;
const STOP_LOSS = -500.0;

// ... (Rest of Config)

// === STRATEGY V9 LOGIC (Mirrors StrategyCore.ts) ===

class StrategyV9 {
    static HIGH_PURPLE_THRESHOLD = 8.0;
    static DESERT_THRESHOLD = 8;
    static SNIPER_SAFE_WINDOW = 6; // V9.5: Stop firing if approaching desert

    static analyze(values) {
        // ... (Same as before)
        const lastPinkIndex = values.findIndex(v => v >= 10.0);
        const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;
        const { regime, phase, absStake } = this.calculateRegimeAndPhaseV9(values, candlesSinceLastPink);
        const recommendation = this.decideActionV9(values, candlesSinceLastPink, regime, phase);
        
        return { recommendation, regime, phase, absStake, candlesSinceLastPink };
    }
    
    // ... (calculateRegimeAndPhaseV9 remains mostly same, Desert is 8)
    static calculateRegimeAndPhaseV9(values, candlesSinceLastPink) {
        if (candlesSinceLastPink >= this.DESERT_THRESHOLD) {
            return { regime: 'HOSTILE', phase: 'DESERT', absStake: 0.0 };
        }

        const shortWindow = values.slice(0, 20);
        const blueCount = shortWindow.filter(v => v < 2.0).length;
        const recentPain = values.slice(0, 3).filter(v => v < 2.0).length >= 2;

        if (blueCount >= 12 || recentPain) {
            return { regime: 'UNCERTAINTY', phase: 'NORMAL', absStake: 0.5 };
        }

        // Logic for Recovery/Expansion
         let phase = 'NORMAL';
         if (candlesSinceLastPink >= 0 && candlesSinceLastPink <= 2) {
             // ... Recovery logic
             const remaining = values.slice(candlesSinceLastPink + 1);
             const prevPinkIndex = remaining.findIndex(v => v >= 10.0);
             if (prevPinkIndex !== -1 && prevPinkIndex >= this.DESERT_THRESHOLD) {
                 phase = 'RECOVERY';
             }
         }

        return { 
            regime: 'EXPANSION', 
            phase, 
            absStake: phase === 'RECOVERY' ? 1.5 : 1.0 
        };
    }

    static decideActionV9(values, candlesSinceLastPink, regime, phase) {
        if (values.length === 0) return { action: 'WAIT', reason: 'No Data' };
        
        // --- LAYER 1: REGIME FILTER ---
        // HOSTILE starts at 11 now
        if (candlesSinceLastPink >= 11) {
            return { action: 'WAIT', reason: `🌵 PROTEÇÃO: Deserto Profundo (${candlesSinceLastPink} velas)` };
        }

        const lastValue = values[0];
        const round = candlesSinceLastPink + 1; 

        // C1: COLADA (Neutral) -> Stake 50% or Wait
        if (round === 1) {
             return {
                action: 'PLAY_10X',
                reason: phase === 'RECOVERY' ? `🔥 RECOVERY (C1)` : `⚖️ COLADA (C1)`,
                stakeMultiplier: phase === 'RECOVERY' ? 1.0 : 0.5
             };
        }

        // C2: TRAP -> SKIP
        if (round === 2) {
            return { action: 'WAIT', reason: `💀 TRAP ZONE (C2)`, stakeMultiplier: 0 };
        }

        // C3, C4, C5: SNIPER ZONE -> BET FORTE
        if (round >= 3 && round <= 5) {
            if (lastValue >= 8.0 && lastValue < 10.0) {
                 return { action: 'WAIT', reason: `✋ HESITAÇÃO (C${round})`, stakeMultiplier: 0 };
            }
            return { action: 'PLAY_10X', reason: `🏆 SNIPER ZONE (C${round})`, stakeMultiplier: 1.0 };
        }

        // C6, C7: DEATH VALLEY -> SKIP
        if (round >= 6 && round <= 7) {
            return { action: 'WAIT', reason: `🚧 PERIGO (C${round})`, stakeMultiplier: 0 };
        }

        // C8, C9, C10: DESERT BREAK -> BET
        if (round >= 8 && round <= 10) {
            return { action: 'PLAY_10X', reason: `🐫 DESERT BREAK (C${round})`, stakeMultiplier: 1.0 };
        }

        return { action: 'WAIT', reason: `⏳ WAIT`, stakeMultiplier: 0 };
    }
}

// === HELPERS ===
function getEmoji(val) {
    if (val >= 10.0) return '🌸';
    if (val >= 8.0) return '⛔';
    if (val >= 2.0) return '🟣';
    return '🔵';
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
    endOfGraphPositive: 0,
    endOfGraphNegative: 0,
    endOfGraphNeutral: 0,
    regimeStats: {
        EXPANSION: { bets: 0, wins: 0, totalPinks: 0, caughtPinks: 0 },
        UNCERTAINTY: { bets: 0, wins: 0, totalPinks: 0, caughtPinks: 0 },
        HOSTILE: { bets: 0, wins: 0, totalPinks: 0, caughtPinks: 0 }
    },
    triggers: {
        'RECOVERY': { bets: 0, wins: 0, profit: 0 },
        'COLADA (C1)': { bets: 0, wins: 0, profit: 0 },
        'SNIPER ZONE (C3-C5)': { bets: 0, wins: 0, profit: 0 },
        'DESERT BREAK (C8-C10)': { bets: 0, wins: 0, profit: 0 },
        'OTHER': { bets: 0, wins: 0, profit: 0 }
    },
    recovery: {
        desertBreaks: 0, // Number of times a desert was broken by a pink
        successfulRecoveries: 0 // Number of times we caught a pink in recovery phase
    }
};

// === SIMULATION LOGIC ===

function runSimulation(filename, rawValues) {
    // 1. INVERT GRAPH (Newest-to-Oldest -> Oldest-to-Newest)
    const values = [...rawValues].reverse();

    const history = []; 
    let bankroll = INITIAL_BANKROLL;
    let minBankroll = INITIAL_BANKROLL;
    let wins = 0;
    let losses = 0;
    let bets = 0;
    let consecutiveLosses = 0; 
    let inCoolDown = false;
    const profitHistory = [bankroll];

    // Trace Content
    let traceOutput = [];
    traceOutput.push(`================================================================`);
    traceOutput.push(` ANÁLISE SURVIVAL V9.5: ${filename}`);
    traceOutput.push(` Cronologia: [Round 1: Antigo] -> [Round ${values.length}: Novo]`);
    traceOutput.push(`================================================================`);
    traceOutput.push(` ROUND | VALOR | SINAL | REGIME     | STAKE | AÇÃO       | MOTIVO                    | RESULTADO | SALDO   | CD`);
    traceOutput.push(`---------------------------------------------------------------------------------------------------------`);

    let stopReason = 'END_OF_GRAPH';
    let wasInDesert = false;
    
    // 2. INITIAL MEMORY & TRACE (First 25 candles)
    const startIndex = MEMORY_SIZE;
    for (let i = 0; i < startIndex; i++) {
        const crashValue = values[i];
        const roundNum = i + 1; // Round absoluto no gráfico
        
        // Log de Memória (Sem Ação)
        traceOutput.push(` ${String(roundNum).padEnd(5)} | ${crashValue.toFixed(2).padEnd(5)} | ${getEmoji(crashValue).padEnd(5)} | MEMORY     | -     | -          | [Lendo Histórico]         | -         | R$ ${bankroll.toFixed(0)} | -`);
        
        history.unshift(crashValue);
    }

    traceOutput.push(`-------------------------- INÍCIO DA SESSÃO --------------------------`);

    // 3. PLAY SESSION (Next 60 rounds)
    const maxRounds = 60;
    const endGameIndex = Math.min(values.length, startIndex + maxRounds);

    for (let i = startIndex; i < endGameIndex; i++) {
        const roundNum = i + 1; // Round absoluto no gráfico
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

        // --- 1. COOL DOWN CHECK ---
        if (inCoolDown) {
            regimeStr = 'COOL_DOWN';
            if (crashValue >= 10.0) {
                inCoolDown = false;
                consecutiveLosses = 0;
                coolDownStr = 'RELEASE';
                traceOutput.push(`   >>> 🟢 [Round ${roundNum}] COOL DOWN LIBERADO POR ROSA (${crashValue.toFixed(2)}x) <<<`);
            } else {
                actionStr = 'BLOCKED';
                reasonStr = 'Smart Cool Down';
                resultStr = 'CD-WAIT';
            }
        } 
        else {
            // --- 2. ANALYZE ---
            const analysis = StrategyV9.analyze(history);
            regimeStr = analysis.regime.substring(0, 10);
            
            if (globalStats.regimeStats[analysis.regime]) {
                if (crashValue >= 10.0) globalStats.regimeStats[analysis.regime].totalPinks++;
            }

            if (analysis.regime === 'HOSTILE') wasInDesert = true;
            else if (wasInDesert && crashValue >= 10.0) {
                globalStats.recovery.desertBreaks++;
                wasInDesert = false;
            }

            // --- 3. DECIDE ---
            if (analysis.recommendation.action === 'PLAY_10X') {
                const recommendation = analysis.recommendation; // Alias for brevity
                // --- EXECUTION ---
                const betAmount = BASE_STAKE * (recommendation.stakeMultiplier !== undefined ? recommendation.stakeMultiplier : 1.0);
                
                stakeStr = `${(recommendation.stakeMultiplier !== undefined ? recommendation.stakeMultiplier : 1.0) * 100}%`;
                reasonStr = recommendation.reason;

                if (betAmount > 0) {
                    actionStr = 'PLAY 10x';
                    bets++;
                    
                    if (globalStats.regimeStats[analysis.regime]) globalStats.regimeStats[analysis.regime].bets++;

                    // MAPPING REASON TO KEY
                    let triggerKey = 'OTHER';
                    if (reasonStr.includes('RECOVERY')) triggerKey = 'RECOVERY';
                    else if (reasonStr.includes('COLADA')) triggerKey = 'COLADA (C1)';
                    else if (reasonStr.includes('SNIPER ZONE')) triggerKey = 'SNIPER ZONE (C3-C5)';
                    else if (reasonStr.includes('DESERT BREAK')) triggerKey = 'DESERT BREAK (C8-C10)';

                    // Init if missing (Safety)
                    if (!globalStats.triggers[triggerKey]) globalStats.triggers[triggerKey] = { bets: 0, wins: 0, profit: 0 };
                    globalStats.triggers[triggerKey].bets++;

                    // RESULT
                    const result = crashValue >= EXIT_TARGET ? 'WIN' : 'LOSS';
                    const profit = result === 'WIN' ? (betAmount * EXIT_TARGET) - betAmount : -betAmount;
                    
                    bankroll += profit;
                    resultStr = profit >= 0 ? `WIN +${profit.toFixed(0)}` : `LOSS ${profit.toFixed(0)}`;
                    
                    globalStats.triggers[triggerKey].profit += profit;

                    if (result === 'WIN') {
                         wins++;
                         globalStats.triggers[triggerKey].wins++;
                         if (globalStats.regimeStats[analysis.regime]) {
                            globalStats.regimeStats[analysis.regime].wins++;
                            globalStats.regimeStats[analysis.regime].caughtPinks++;
                         }
                         consecutiveLosses = 0;
                    } else {
                        losses++;
                        consecutiveLosses++;
                    }
                } else {
                    actionStr = 'SKIP';
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
        traceOutput.push(` ${String(roundNum).padEnd(5)} | ${crashValue.toFixed(2).padEnd(5)} | ${getEmoji(crashValue).padEnd(5)} | ${regimeStr.padEnd(10)} | ${stakeStr.padEnd(5)} | ${actionStr.padEnd(10)} | ${reasonStr.padEnd(25)} | ${resultStr.padEnd(9)} | R$ ${bankroll.toFixed(0)} | ${coolDownStr}`);

        // Update History
        history.unshift(crashValue);
        
        // Drawdown
        profitHistory.push(bankroll);
        if (bankroll < minBankroll) minBankroll = bankroll;
    }

    // Stats Compilation
    if (stopReason === 'STOP_WIN') globalStats.stopWin++;
    else if (stopReason === 'STOP_LOSS') globalStats.stopLoss++;
    else {
        // End of Graph
        if (bankroll > INITIAL_BANKROLL) globalStats.endOfGraphPositive++;
        else if (bankroll < INITIAL_BANKROLL) globalStats.endOfGraphNegative++;
        else globalStats.endOfGraphNeutral++;
    }

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
    const tracePath = path.join(TRACE_DIR, filename);
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
        .filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`Analyzing ${files.length} graphs...`);
    
    const fileResults = [];
    let monthlyBankroll = INITIAL_BANKROLL;
    let monthlyPeak = INITIAL_BANKROLL;
    let monthlyMaxDD = 0;

    // Drawdown Tracking
    let peakIndex = -1; // Index of the file that established the peak
    let ddStartIndex = -1; // File index where DD started (Peak + 1)
    let ddEndIndex = -1; // File index where Max DD occurred (Valley)
    let currentPeakIndex = -1; // Tracking current peak index

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(GRAFOS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const multipliers = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));

        const stats = runSimulation(file, multipliers);

        globalStats.totalGames++;
        globalStats.bets += stats.bets;
        globalStats.wins += stats.wins;
        globalStats.profit += stats.profit;
        
        // --- MONTHLY CUMULATIVE LOGIC ---
        monthlyBankroll += stats.profit;
        
        if (monthlyBankroll > monthlyPeak) {
            monthlyPeak = monthlyBankroll;
            currentPeakIndex = i;
        }
        
        const currentDD = monthlyPeak - monthlyBankroll;
        if (currentDD > monthlyMaxDD) {
            monthlyMaxDD = currentDD;
            // Drawdown spans from the file AFTER the peak until THIS file (the valley)
            ddStartIndex = currentPeakIndex + 1; 
            ddEndIndex = i;
        }


        // Update Daily Max DD (keeping legacy metric for reference)
        if (stats.maxDrawdown > globalStats.maxDrawdown) globalStats.maxDrawdown = stats.maxDrawdown;

        let icon = '➖';
        if (stats.stopReason === 'STOP_WIN') icon = '✅';
        else if (stats.stopReason === 'STOP_LOSS') icon = '💀';
        else {
            // END_OF_GRAPH cases
            if (stats.profit > 0) icon = '✅-';
            else if (stats.profit < 0) icon = '💀-';
            else icon = '➖';
        }
        
        fileResults.push(`| ${file.padEnd(15)} | ${String(stats.bets).padEnd(4)} | ${String(stats.wins).padEnd(4)} | ${(stats.profit).toFixed(2).padEnd(9)} | R$ ${monthlyBankroll.toFixed(0).padEnd(8)} | ${icon} |`);
    }

    // Report Console Output
    const roi = (globalStats.profit / (globalStats.bets * BASE_STAKE)) * 100;
    const assert = (globalStats.wins / globalStats.bets) * 100;

    const reportLines = [];
    const log = (msg) => { reportLines.push(msg); };
    
    // Format DD Period
    let ddPeriodStr = "N/A";
    if (ddStartIndex !== -1 && ddEndIndex !== -1) {
        const startFile = files[ddStartIndex] || "Start";
        const endFile = files[ddEndIndex];
        ddPeriodStr = `${startFile} ➔ ${endFile}`;
    }

    log('\n================================================================');
    log(' RELATÓRIO DE PERFORMANCE V9 - SURVIVAL & RECOVERY');
    log(` Data: ${new Date().toLocaleString('pt-BR')}`);
    log('================================================================');
    log(` 💰 SALDO FINAL:          R$ ${monthlyBankroll.toFixed(2)} (Lucro: R$ ${globalStats.profit.toFixed(2)})`);
    log(` 📉 MONTHLY MAX DRAWDOWN: R$ ${monthlyMaxDD.toFixed(2)}`);
    log(`    ↳ Period: ${ddPeriodStr}`);
    log(` ⚠️ DAILY MAX DRAWDOWN:   R$ ${globalStats.maxDrawdown.toFixed(2)} (Highest Single Session Risk)`);
    log(` 📊 ASSERTIVIDADE:    ${assert.toFixed(2)}% (${globalStats.wins}/${globalStats.bets})`);
    log('----------------------------------------------------------------');
    log(' 🏆 SESSÕES:');
    const totalWin = globalStats.stopWin + globalStats.endOfGraphPositive;
    const totalLoss = globalStats.stopLoss + globalStats.endOfGraphNegative;

    log(`    ✅ TOTAL GREEN:   ${totalWin} (Meta: ${globalStats.stopWin} | Fim Positivo: ${globalStats.endOfGraphPositive})`);
    log(`    💀 TOTAL RED:     ${totalLoss} (Stop: ${globalStats.stopLoss} | Fim Negativo: ${globalStats.endOfGraphNegative})`);
    log(`    ➖ EMPATE (0.00):  ${globalStats.endOfGraphNeutral}`);

    // Old breakdown hidden/merged as requested, but detail preserved in the line above.
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
    log(' 🔫 DETALHE DOS GATILHOS (Performance):');
    log('    [Gatilho]         | Winrate         | Profit Líquido | ROI');
    for (const [key, val] of Object.entries(globalStats.triggers)) {
        if (val.bets > 0) {
            const winrate = (val.wins/val.bets*100).toFixed(1);
            const roi = (val.profit / (val.bets * BASE_STAKE) * 100).toFixed(1);
            log(`    ${key.padEnd(17)} | ${winrate.padStart(5)}% (${val.wins}/${val.bets}) | R$ ${val.profit.toFixed(0).padStart(6)} | ${roi}%`);
        }
    }
    log('----------------------------------------------------------------');
    log(' 🌵 RECUPERAÇÃO PÓS-DESERTO:');
    log(`    Quebras de Deserto Detectadas: ${globalStats.recovery.desertBreaks}`);
    // Rec wins are already in triggers
    log('================================================================');
    log(' DETALHE POR GRAFO:');
    
    fileResults.forEach(l => log(l));

    // WRITE REPORT TO FILE
    fs.writeFileSync(REPORT_FILE, reportLines.join('\n'));
    console.log(`\n📄 Report saved to: ${REPORT_FILE}`);
}

main();
