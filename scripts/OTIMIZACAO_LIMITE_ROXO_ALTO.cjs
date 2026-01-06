const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

function optimizeThreshold() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    const allValues = [];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));
        allValues.push(values);
    });

    const thresholds = [2.0, 2.5, 3.0, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0];
    const results = [];

    thresholds.forEach(t => {
        let bets = 0;
        let wins = 0;
        let occurrences = 0;

        allValues.forEach(values => {
            for (let i = 0; i < values.length - 3; i++) {
                if (values[i] >= 10.0) {
                    occurrences++;
                    // Simulate 3-house window
                    for (let d = 1; d <= 3; d++) {
                        bets++;
                        if (values[i + d] >= 10.0) {
                            wins++;
                            break; // Success
                        }
                        if (values[i + d] >= t && values[i + d] < 10.0) {
                            // High Purple STOP signal
                            break;
                        }
                    }
                }
            }
        });

        const profit = wins * 500 - bets * 50;
        const roi = (profit / (bets * 50) * 100);
        results.push({ t, profit, roi, wins, bets });
    });

    // Formatting
    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log('================================================================');
    log(' OTIMIZAÇÃO: RÉGUA IDEAL PARA ROXO ALTO (STOP SIGNAL)');
    log('================================================================');
    log(` POS | RÉGUA | LUCRO TOTAL | ROI      | VITÓRIAS | LANCES`);
    log(`----------------------------------------------------------------`);

    results.sort((a, b) => b.profit - a.profit).forEach((r, idx) => {
        const medal = idx === 0 ? '🏆' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '  '));
        const pos = String(idx + 1).padStart(2);
        log(`${medal} ${pos} | ${r.t.toFixed(2)}x | R$ ${r.profit.toLocaleString().padEnd(9)} | ${r.roi.toFixed(2).padEnd(6)}% | ${r.wins.toString().padEnd(8)} | ${r.bets}`);
    });

    log(`\n🏆 Veredito: A régua de ${results[0].t.toFixed(2)}x trouxe o maior lucro nas 40 amostras.`);
    log('================================================================');

    fs.writeFileSync(path.join(__dirname, 'OTIMIZACAO_ROXO_ALTO.txt'), report.join('\n'));
}

optimizeThreshold();
