const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

function analyzeHighPurpleImpact() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    
    let stats = {
        blind: { count: 0, bets: 0, wins: 0 },
        hesitant: { count: 0, bets: 0, wins: 0 } 
    };

    files.forEach(file => {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));

        for (let i = 0; i < values.length - 4; i++) {
            if (values[i] >= 10.0) {
                stats.blind.count++;
                stats.blind.bets += 3;
                if (values[i+1] >= 10.0 || values[i+2] >= 10.0 || values[i+3] >= 10.0) {
                    stats.blind.wins++;
                }

                let hBets = 0;
                let hWon = false;
                for (let d = 1; d <= 3; d++) {
                    hBets++;
                    if (values[i+d] >= 10.0) {
                        hWon = true;
                        break; 
                    }
                    if (values[i+d] > 3.5 && values[i+d] < 10.0) break;
                }
                stats.hesitant.count++;
                stats.hesitant.bets += hBets;
                if (hWon) stats.hesitant.wins++;
            }
        }
    });

    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    const blindProfit = stats.blind.wins * 500 - stats.blind.bets * 50;
    const hesitantProfit = stats.hesitant.wins * 500 - stats.hesitant.bets * 50;

    const roiBlind = (blindProfit / (stats.blind.bets * 50) * 100).toFixed(2);
    const roiHesitant = (hesitantProfit / (stats.hesitant.bets * 50) * 100).toFixed(2);

    log('================================================================');
    log(' ESTUDO: O IMPACTO DO MEDO DO ROXO ALTO (3.5x - 9.9x)');
    log('================================================================');
    
    log(`\n🔹 JANELA CEGA (Joga 3 casas sem olhar o valor):`);
    log(`   Rosas: ${stats.blind.wins}/${stats.blind.count}`);
    log(`   Bets: ${stats.blind.bets}`);
    log(`   ROI: ${roiBlind}%`);
    log(`   LUCRO TOTAL: R$ ${blindProfit.toLocaleString()}`);

    log(`\n🔹 JANELA HESITANTE (Para se vier um Roxo Alto):`);
    log(`   Rosas: ${stats.hesitant.wins}/${stats.hesitant.count}`);
    log(`   Bets: ${stats.hesitant.bets}`);
    log(`   ROI: ${roiHesitant}%`);
    log(`   LUCRO TOTAL: R$ ${hesitantProfit.toLocaleString()}`);

    log(`\n📊 CONCLUSÃO:`);
    log(`   A Hesitação faz você perder R$ ${(blindProfit - hesitantProfit).toLocaleString()} de lucro.`);
    log(`   Embora a estratégia hesitante tenha um ROI maior (mais eficiente),`);
    log(`   ela lucra menos dinheiro no bolso porque joga menos volume.`);
    
    log('\n================================================================');

    fs.writeFileSync(path.join(__dirname, 'IMPACTO_ROXO_ALTO.txt'), report.join('\n'));
}

analyzeHighPurpleImpact();
