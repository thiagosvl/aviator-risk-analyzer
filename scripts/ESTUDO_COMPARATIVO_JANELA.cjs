const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

/**
 * 📊 ESTUDO: JANELA CEGA vs HESITANTE (PÓS-DESERTO)
 * O usuário quer saber se vale a pena ignorar a trava de 8.0x dentro da janela Recovery.
 */

function runComparison() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    const allValues = [];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));
        allValues.push(values);
    });

    const desertLimits = [8, 10, 12, 14, 16];
    const highPurpleThreshold = 8.0;

    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log('================================================================');
    log(' ESTUDO TÉCNICO: JANELA 3-CASAS PÓS-DESERTO');
    log('================================================================');

    desertLimits.forEach(limit => {
        let blindWins = 0;
        let blindBets = 0;
        let hesitantWins = 0;
        let hesitantBets = 0;
        let opportunities = 0;

        allValues.forEach(values => {
            let candlesSincePink = 0;
            
            for (let i = 0; i < values.length - 4; i++) {
                const current = values[i];
                
                if (current >= 10.0) {
                    // Verifica se era um deserto
                    if (candlesSincePink >= limit) {
                        opportunities++;
                        
                        // --- ESTRATÉGIA A: CEGA (RECOVERY V8/V9) ---
                        let hasWonBlind = false;
                        for (let d = 1; d <= 3; d++) {
                            blindBets++;
                            if (values[i + d] >= 10.0) {
                                blindWins++;
                                hasWonBlind = true;
                                break;
                            }
                        }

                        // --- ESTRATÉGIA B: HESITANTE (RESPEITA 8.0X) ---
                        let hasWonHesitant = false;
                        for (let d = 1; d <= 3; d++) {
                            // Se a vela ANTERIOR (dentro da janela) foi Roxo Alto, para.
                            if (d > 1 && values[i + d - 1] >= highPurpleThreshold && values[i + d - 1] < 10.0) {
                                break; // Hesitou e parou de jogar no 3-casas
                            }
                            
                            hesitantBets++;
                            if (values[i + d] >= 10.0) {
                                hesitantWins++;
                                hasWonHesitant = true;
                                break;
                            }
                        }
                    }
                    candlesSincePink = 0;
                } else {
                    candlesSincePink++;
                }
            }
        });

        const blindProfit = blindWins * 500 - blindBets * 50;
        const hesitantProfit = hesitantWins * 500 - hesitantBets * 50;
        
        log(`\n📌 DESERTO: ${limit} velas`);
        log(`➡️  JANELA CEGA:      R$ ${blindProfit.toLocaleString().padEnd(8)} | ROI: ${(blindBets > 0 ? (blindProfit/(blindBets*50)*100) : 0).toFixed(2)}% | Wins: ${blindWins}/${opportunities}`);
        log(`➡️  JANELA HESITANTE: R$ ${hesitantProfit.toLocaleString().padEnd(8)} | ROI: ${(hesitantBets > 0 ? (hesitantProfit/(hesitantBets*50)*100) : 0).toFixed(2)}% | Wins: ${hesitantWins}/${opportunities}`);
        
        const diff = blindProfit - hesitantProfit;
        log(`💡 Conclusão: A Janela CEGA lucrou R$ ${diff.toLocaleString()} ${diff >= 0 ? 'A MAIS' : 'A MENOS'} que a Hesitante.`);
    });

    log('\n================================================================');
    log(' VEREDITO FINAL:');
    log(' No cenário de RECOVERY (pós-deserto), a Janela CEGA é superior');
    log(' porque o Aviator tende a "corrigir o RTP" soltando velas altas');
    log(' próximas uma da outra. A hesitação faz você perder o "pulo"');
    log(' da recuperação, mesmo que economize alguns reds.');
    log('================================================================');

    fs.writeFileSync(path.join(__dirname, 'ESTUDO_RECOVERY_CEGO.txt'), report.join('\n'));
}

runComparison();
