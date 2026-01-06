const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

/**
 * 📊 OTIMIZAÇÃO: RÉGUA DE DESERTO (RECOVERY MODE)
 * Objetivo: Descobrir com quantas velas sem Rosa (Deserto) 
 * vale a pena ignorar a trava do Roxo Alto e jogar 3 casas cegas.
 */

function optimizeDesert() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    const allValues = [];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));
        allValues.push(values);
    });

    const desertLimits = [8, 10, 12, 14, 16, 18, 20, 25, 30];
    const results = [];

    desertLimits.forEach(limit => {
        let recoveryOpportunities = 0;
        let recoveryWins = 0;
        let recoveryBets = 0;

        allValues.forEach(values => {
            let candlesSincePink = 0;
            
            for (let i = 0; i < values.length - 4; i++) {
                const current = values[i];
                
                if (current >= 10.0) {
                    // Verificamos se era um deserto
                    if (candlesSincePink >= limit) {
                        recoveryOpportunities++;
                        // Fase RECOVERY: Joga as próximas 3 casas CEGAS
                        for (let d = 1; d <= 3; d++) {
                            recoveryBets++;
                            if (values[i + d] >= 10.0) {
                                recoveryWins++;
                                break; // Pegou o repique!
                            }
                        }
                    }
                    candlesSincePink = 0;
                } else {
                    candlesSincePink++;
                }
            }
        });

        const profit = recoveryWins * 500 - recoveryBets * 50;
        const roi = recoveryBets > 0 ? (profit / (recoveryBets * 50) * 100) : 0;
        results.push({ limit, profit, roi, wins: recoveryWins, opp: recoveryOpportunities, bets: recoveryBets });
    });

    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log('================================================================');
    log(' OTIMIZAÇÃO: RÉGUA DE DESERTO PARA RECOVERY (JANELA CEGA)');
    log('================================================================');
    log(` POS | DESERTO | LUCRO TOTAL | ROI      | VITÓRIAS | OPORTUNID.`);
    log(`----------------------------------------------------------------`);

    results.sort((a, b) => b.profit - a.profit).forEach((r, idx) => {
        const medal = idx === 0 ? '🏆' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '  '));
        const pos = String(idx + 1).padStart(2);
        log(`${medal} ${pos} | ${String(r.limit).padStart(2)} velas | R$ ${r.profit.toLocaleString().padEnd(9)} | ${r.roi.toFixed(2).padEnd(6)}% | ${r.wins.toString().padEnd(8)} | ${r.opp}`);
    });

    log(`\n🏆 Veredito: Um deserto de ${results[0].limit} velas é o melhor gatilho para RECOVERY.`);
    log(`   Neste cenário, ignorar a régua do Roxo traz o maior lucro absoluto.`);
    log('================================================================');

    fs.writeFileSync(path.join(__dirname, 'OTIMIZACAO_DESERTO.txt'), report.join('\n'));
}

optimizeDesert();
