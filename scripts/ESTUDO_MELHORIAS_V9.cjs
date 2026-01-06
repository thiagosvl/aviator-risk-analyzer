const fs = require('fs');
const path = require('path');

/**
 * 📊 BENCHMARK V9 IMPROVEMENTS
 * Compara ROI e Lucro Total de:
 * 1. Fast-Scan (Captura Total) vs Slow-Scan (Perda de 4% das Azuis)
 * 2. Hard CD (Pausa Fixa 12 velas) vs Smart CD (Até vir Rosa)
 */

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

// Configuração Base (V9 Hesitante - Parar em Roxo Alto)
function decideActionV9(lastValue, _regime, _phase) {
    if (lastValue >= 10.0) return 'PLAY_10X'; // Sticky Pink
    // Nota: Paramos em Roxo Alto (3.5-9.9) ou Azuis isoladas fora de gatilho
    return 'WAIT';
}

function runSimulation(values, options = {}) {
    const { 
        dataLossProb = 0,      // Probabilidade de pular vela azul
        cdType = 'SMART'       // 'SMART' (até rosa) ou 'HARD' (12 velas)
    } = options;

    let balance = 0;
    let consecutiveLosses = 0;
    let cdRemaining = 0;
    let inCD = false;
    let processedValues = [];

    // 1. Simular Perda de Dados (Data Skip)
    const visibleValues = [];
    for (const v of values) {
        if (v < 2.0 && Math.random() < dataLossProb) {
            continue; // Pulou a vela (Simulação Slow Scan)
        }
        visibleValues.push(v);
    }

    // 2. Simular Jogo
    for (let i = 1; i < visibleValues.length; i++) {
        const current = visibleValues[i];
        const last = visibleValues[i - 1];

        // Lógica de Cool Down
        if (inCD) {
            if (cdType === 'HARD') {
                cdRemaining--;
                if (cdRemaining <= 0) inCD = false;
            } else {
                if (current >= 10.0) inCD = false; // Smart CD sai com Rosa
            }
            continue;
        }

        // Condição de Entrada (V9 Simplificada: Sticky Pink)
        if (last >= 10.0) {
            const stake = 50;
            if (current >= 10.0) {
                balance += (stake * 10) - stake;
                consecutiveLosses = 0;
            } else {
                balance -= stake;
                consecutiveLosses++;
                if (consecutiveLosses >= 3) {
                    inCD = true;
                    if (cdType === 'HARD') cdRemaining = 12;
                }
            }
        }
    }
    return balance;
}

function main() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    
    let scenarios = {
        'ATUAL (Slow-Scan + Smart-CD)': { profit: 0, roi: 0, wins: 0, bets: 0 },
        'NOVO (Fast-Scan + Smart-CD)':  { profit: 0, roi: 0, wins: 0, bets: 0 },
        'NOVO (Fast-Scan + Hard-CD)':   { profit: 0, roi: 0, wins: 0, bets: 0 }
    };

    files.forEach(file => {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));

        // Rodar 100 vezes cada para tirar uma média da perda de dados aleatória
        for (let it = 0; it < 20; it++) {
            scenarios['ATUAL (Slow-Scan + Smart-CD)'].profit += runSimulation(values, { dataLossProb: 0.05, cdType: 'SMART' });
            scenarios['NOVO (Fast-Scan + Smart-CD)'].profit  += runSimulation(values, { dataLossProb: 0,    cdType: 'SMART' });
            scenarios['NOVO (Fast-Scan + Hard-CD)'].profit   += runSimulation(values, { dataLossProb: 0,    cdType: 'HARD' });
        }
    });

    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log('================================================================');
    log(' COMPARATIVO TÉCNICO V9: EVOLUÇÃO SCAN & PROTEÇÃO');
    log('================================================================');
    
    Object.entries(scenarios).forEach(([name, data]) => {
        const avgProfit = data.profit / 20;
        log(`\n🔹 ${name}:`);
        log(`   LUCRO TOTAL MÉDIO (40 GRAFOS): R$ ${avgProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    });

    log('\n📊 ANÁLISE DO IMPACTO:');
    const fastScanGain = (scenarios['NOVO (Fast-Scan + Smart-CD)'].profit - scenarios['ATUAL (Slow-Scan + Smart-CD)'].profit) / 20;
    const hardCdGain = (scenarios['NOVO (Fast-Scan + Hard-CD)'].profit - scenarios['NOVO (Fast-Scan + Smart-CD)'].profit) / 20;
    
    log(`   ✅ IMPACTO FAST-SCAN: +R$ ${fastScanGain.toLocaleString()} (Evita erros de sincronia)`);
    log(`   ✅ IMPACTO HARD-CD:   ${hardCdGain > 0 ? '+' : ''}R$ ${hardCdGain.toLocaleString()} (Mudança na proteção de deserto)`);

    log('\n================================================================');

    fs.writeFileSync(path.join(__dirname, 'BENCHMARK_EVOLUCAO_V9.txt'), report.join('\n'));
}

main();
