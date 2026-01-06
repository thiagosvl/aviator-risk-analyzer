const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

function analyzeDeepPatterns() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    
    let blindWindowStats = { count: 0, wins3: 0, wins4: 0 };

    files.forEach(file => {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n));

        // Blind 4-Candle Window Stats
        for (let i = 0; i < values.length - 4; i++) {
            if (values[i] >= 10.0) {
                blindWindowStats.count++;
                // Check success for 3 houses
                if (values[i+1] >= 10.0 || values[i+2] >= 10.0 || values[i+3] >= 10.0) {
                    blindWindowStats.wins3++;
                }
                // Check success for 4 houses
                if (values[i+1] >= 10.0 || values[i+2] >= 10.0 || values[i+3] >= 10.0 || values[i+4] >= 10.0) {
                    blindWindowStats.wins4++;
                }
            }
        }
    });

    const report = [];
    const log = (msg) => { console.log(msg); report.push(msg); };

    log('================================================================');
    log(' ANÁLISE COMPARATIVA: JANELA 3 CASAS vs 4 CASAS');
    log('================================================================');
    
    log(`\n📌 RESULTADOS DAS JANELAS BLIND (Pós-Rosa):`);
    log(`   Ocorrências de Rosa: ${blindWindowStats.count}`);
    
    const wr3 = (blindWindowStats.wins3 / blindWindowStats.count * 100).toFixed(2);
    const wr4 = (blindWindowStats.wins4 / blindWindowStats.count * 100).toFixed(2);
    
    log(`\n   🔹 JANELA DE 3 CASAS:`);
    log(`      Taxa de Sucesso: ${wr3}% (${blindWindowStats.wins3}/${blindWindowStats.count})`);
    log(`      Apostas Médias: 3.00`);
    
    log(`\n   🔹 JANELA DE 4 CASAS:`);
    log(`      Taxa de Sucesso: ${wr4}% (${blindWindowStats.wins4}/${blindWindowStats.count})`);
    log(`      Apostas Médias: 4.00`);

    // ROI 3 casas
    const totalSpent3 = blindWindowStats.count * 3 * 50;
    const totalPrize3 = blindWindowStats.wins3 * 500;
    const roi3 = ((totalPrize3 - totalSpent3) / totalSpent3 * 100).toFixed(2);

    // ROI 4 casas
    const totalSpent4 = blindWindowStats.count * 4 * 50;
    const totalPrize4 = blindWindowStats.wins4 * 500;
    const roi4 = ((totalPrize4 - totalSpent4) / totalSpent4 * 100).toFixed(2);
    
    log(`\n📌 COMPARATIVO DE LUCRATIVIDADE (ROI):`);
    log(`   🚀 ROI (Janela 3): ${roi3}%`);
    log(`   📉 ROI (Janela 4): ${roi4}%`);
    log(`\n   Veredito: ${parseFloat(roi3) > parseFloat(roi4) ? 'A Janela de 3 é mais eficiente (melhor retorno por aposta).' : 'A Janela de 4 é mais lucrativa nominalmente.'}`);
    log('================================================================');

    fs.writeFileSync(path.join(__dirname, 'COMPARATIVO_JANELA.txt'), report.join('\n'));
}

analyzeDeepPatterns();
