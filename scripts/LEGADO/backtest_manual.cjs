const fs = require('fs');
const path = require('path');

/**
 * 🛠️ BACKTEST MANUAL V9
 * Uso: node scripts/backtest_manual.cjs <nome_do_arquivo.txt>
 */

const fileName = process.argv[2];
if (!fileName) {
    console.error('❌ Erro: Forneça o nome do arquivo. Ex: node scripts/backtest_manual.cjs manual.txt');
    process.exit(1);
}

const filePath = path.isAbsolute(fileName) ? fileName : path.join(process.cwd(), fileName);
if (!fs.existsSync(filePath)) {
    console.error(`❌ Erro: Arquivo não encontrado em ${filePath}`);
    process.exit(1);
}

// === LÓGICA V9 (IDÊNTICA AO CORE) ===
const MEMORY_SIZE = 25;

function calculateRegimeV9(history, candlesSincePink) {
    if (candlesSincePink >= 8) return { regime: 'HOSTILE', phase: 'DESERT', absStake: 0.0 };
    const blueCount = history.slice(0, 20).filter(v => v < 2.0).length;
    const recentPain = history.slice(0, 3).filter(v => v < 2.0).length >= 2;
    if (blueCount >= 12 || recentPain) return { regime: 'UNCERTAINTY', phase: 'NORMAL', absStake: 0.5 };
    
    let phase = 'NORMAL';
    if (candlesSincePink <= 2) {
        const prevIdx = history.slice(candlesSincePink + 1).findIndex(v => v >= 10.0);
        if (prevIdx !== -1 && prevIdx >= 8) phase = 'RECOVERY';
    }
    return { regime: 'EXPANSION', phase, absStake: phase === 'RECOVERY' ? 1.5 : 1.0 };
}

function decideActionV9(history, candlesSincePink, regime, phase) {
    const lastValue = history[0];
    if (regime === 'HOSTILE') return { action: 'WAIT', reason: 'DESERTO' };
    
    // 1. RECOVERY BLIND
    if (phase === 'RECOVERY') return { action: 'PLAY_10X', reason: 'RECOVERY' };
    
    // 2. SNIPER EXPANSION
    if (regime === 'EXPANSION') {
        if (lastValue < 2.0) return { action: 'PLAY_10X', reason: 'AZUL' };
        if (lastValue >= 2.0 && lastValue < 8.0) return { action: 'PLAY_10X', reason: 'ROXO BAIXO' };
    }
    
    // 3. PINK WINDOW (HESITANT)
    if (candlesSincePink >= 0 && candlesSincePink <= 2) {
        if (lastValue >= 8.0 && lastValue < 10.0) return { action: 'WAIT', reason: 'TRAVA ROXO ALTO' };
        return { action: 'PLAY_10X', reason: 'JANELA REPIQUE' };
    }
    
    return { action: 'WAIT', reason: '---' };
}

async function runManualTest() {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const values = raw.split('\n').map(l => l.trim()).filter(l => l !== '').map(Number);
    
    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log(`\n🔍 ANALISANDO SEQUÊNCIA: ${fileName} (${values.length} velas)`);
    log(`--------------------------------------------------------------------------------`);
    log(` POS | VELA  | REGIME      | FASE     | AÇÃO       | DETALHE`);
    log(`--------------------------------------------------------------------------------`);

    let history = [];
    let bankroll = 3000;
    let sessionProfit = 0;
    let consecutiveLosses = 0;

    for (let i = 0; i < values.length; i++) {
        const current = values[i];
        const pos = i + 1;

        if (history.length < MEMORY_SIZE) {
            log(` ${String(pos).padEnd(3)} | ${current.toFixed(2).padEnd(5)} | ${'BUILDING'.padEnd(11)} | ${'INIT'.padEnd(8)} | ${'SKIP'.padEnd(10)} | Memória...`);
            history.unshift(current);
            continue;
        }

        const lastPinkIdx = history.findIndex(v => v >= 10.0);
        const candlesSincePink = lastPinkIdx === -1 ? history.length : lastPinkIdx;
        const { regime, phase, absStake } = calculateRegimeV9(history, candlesSincePink);
        
        // Simular o Cool Down Real
        const inCoolDown = consecutiveLosses >= 3;
        
        let decision = { action: 'WAIT', reason: '---' };
        if (!inCoolDown) {
            decision = decideActionV9(history, candlesSincePink, regime, phase);
        } else if (history[0] >= 10.0) {
            consecutiveLosses = 0; // Liberação Smart
            decision = decideActionV9(history, candlesSincePink, regime, phase);
        }

        const actionStr = inCoolDown ? '❄️ CD' : (decision.action === 'PLAY_10X' ? '✅ PLAY' : '⏳ WAIT');
        const reasonStr = inCoolDown ? 'GELADEIRA (Busca Rosa)' : decision.reason;

        log(` ${String(pos).padEnd(3)} | ${current.toFixed(2).padEnd(5)} | ${regime.padEnd(11)} | ${phase.padEnd(8)} | ${actionStr.padEnd(10)} | ${reasonStr}`);

        // Resultado da Bet (se jogou)
        if (decision.action === 'PLAY_10X' && !inCoolDown) {
            const stake = 50 * absStake;
            if (current >= 10.0) {
                sessionProfit += (stake * 10) - stake;
                consecutiveLosses = 0;
                log(`     >> 💰 WIN: +R$ ${(stake * 10 - stake).toFixed(0)}`);
            } else {
                sessionProfit -= stake;
                consecutiveLosses++;
                log(`     >> ❌ LOSS: -R$ ${stake.toFixed(0)}`);
            }
        }

        history.unshift(current);
    }
    
    log(`--------------------------------------------------------------------------------`);
    log(`🏁 RESULTADO FINAL: R$ ${sessionProfit.toFixed(2)} | BANCA: R$ ${(3000 + sessionProfit).toFixed(2)}`);
    log(`--------------------------------------------------------------------------------\n`);

    const resultPath = path.join(process.cwd(), 'TRACADO_MANUAL.txt');
    fs.writeFileSync(resultPath, report.join('\n'));
    console.log(`✅ Relatório salvo em: ${resultPath}`);
}

runManualTest();
