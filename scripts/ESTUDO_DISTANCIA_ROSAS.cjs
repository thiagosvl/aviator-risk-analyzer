const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const REPORT_FILE = path.join(__dirname, 'ESTUDO_DISTANCIA_ROSAS.txt');

const BASE_STAKE = 50.0;
const EXIT_TARGET = 10.0;

function analyzePinkDistances() {
    console.log('🚀 ANALISANDO DISTÂNCIA ENTRE ROSAS ACIMA DE 10X...');

    if (!fs.existsSync(GRAFOS_DIR)) {
        console.error('Directory not found:', GRAFOS_DIR);
        return;
    }

    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    
    // Stats storage
    const distanceStats = {};
    for (let i = 1; i <= 30; i++) {
        distanceStats[i] = {
            count: 0, // Times we saw a pink at this distance
            opportunities: 0, // Times we reached this distance (survived previous candles)
            wins: 0, // Same as count, for clarity
            profit_full: 0,
            profit_half_c2: 0,
            profit_smart: 0 // No bet on C2, Full on C3, C4, C5
        };
    }

    let totalPinksFound = 0;
    let totalSequences = 0;

    for (const file of files) {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n)).reverse();
        
        let candlesSinceLastPink = 0;
        // Find first pink
        const firstPink = values.findIndex(v => v >= 10.0);
        if (firstPink === -1) continue;
        
        candlesSinceLastPink = 0;

        for (let i = firstPink + 1; i < values.length; i++) {
            const val = values[i];
            candlesSinceLastPink++;
            
            if (candlesSinceLastPink > 30) {
                 if (val >= 10.0) {
                     candlesSinceLastPink = 0; 
                     totalSequences++;
                 }
                 continue;
            }

            const s = distanceStats[candlesSinceLastPink];
            s.opportunities++;

            // BETTING LOGIC SIMULATION
            
            // Scenario A: Full Stake (R$ 50) always
            let stakeA = BASE_STAKE;
            
            // Scenario B: Half Stake on C2 (R$ 25), Full elsewhere
            let stakeB = BASE_STAKE;
            if (candlesSinceLastPink === 2) stakeB = BASE_STAKE * 0.5;

            // Scenario C: Smart (Skip C2, Full C3-C5, C8-C10)
            let stakeC = 0;
            if ([1, 3, 4, 5, 8, 9, 10].includes(candlesSinceLastPink)) stakeC = BASE_STAKE;

            if (val >= 10.0) {
                s.count++;
                s.wins++;
                totalPinksFound++;
                totalSequences++;

                s.profit_full += (stakeA * EXIT_TARGET) - stakeA;
                s.profit_half_c2 += (stakeB * EXIT_TARGET) - stakeB;
                if (stakeC > 0) s.profit_smart += (stakeC * EXIT_TARGET) - stakeC;
                
                candlesSinceLastPink = 0; // Reset
            } else {
                s.profit_full -= stakeA;
                s.profit_half_c2 -= stakeB;
                if (stakeC > 0) s.profit_smart -= stakeC;
            }
        }
    }

    // === GENERATE REPORT ===
    const lines = [];
    lines.push(`================================================================`);
    lines.push(` 🌸 ESTUDO DE INTERVALO DE ROSAS (DISTÂNCIA)`);
    lines.push(` Base: 40 Grafos | Pinks Analisados: ${totalPinksFound}`);
    lines.push(`================================================================`);
    lines.push(` DIST | OCORRÊNCIAS | PROBABILIDADE | LUCRO (Full) | LUCRO (Half C2) | LUCRO (Smart)`);
    lines.push(`----------------------------------------------------------------`);

    let accProfitFull = 0;
    let accProfitHalf = 0;
    let accProfitSmart = 0;

    for (let i = 1; i <= 15; i++) {
        const s = distanceStats[i];
        if (s.opportunities === 0) continue;

        // Probability of Pink appearing EXACTLY here given we reached here
        // (Hazard Rate essentially)
        const prob = (s.wins / s.opportunities) * 100;
        
        let marker = '';
        if (s.profit_full > 0) marker = '✅';
        else if (s.profit_full < -2000) marker = '💀';

        let smartMarker = '';
        if (s.profit_smart > 0) smartMarker = '🏆';
        
        // Highlight logic
        let label = `C${i}`;
        if (i===1) label += ' (Colada)';
        if (i===2) label += ' (Trap?)';
        if (i===3) label += ' (Janela)';
        if (i>=4 && i<=6) label += ' (Sniper)';
        if (i>=8 && i<=10) label += ' (Desert)';

        lines.push(` ${label.padEnd(15)} | ${String(s.count).padEnd(11)} | ${prob.toFixed(1).padStart(5)}%      | R$ ${s.profit_full.toFixed(0).padStart(7)} ${marker} | R$ ${s.profit_half_c2.toFixed(0).padStart(8)}    | R$ ${s.profit_smart.toFixed(0).padStart(7)} ${smartMarker}`);
        
        accProfitFull += s.profit_full;
        accProfitHalf += s.profit_half_c2;
        accProfitSmart += s.profit_smart;
    }
    
    lines.push(`----------------------------------------------------------------`);
    lines.push(` 💰 LUCRO ACUMULADO (Até 15ª casa):`);
    lines.push(` 🟦 FULL STAKE (R$50 fixa):       R$ ${accProfitFull.toFixed(2)}`);
    lines.push(` 🟨 HALF C2 (R$25 na Casa 2):     R$ ${accProfitHalf.toFixed(2)}`);
    lines.push(` 🟩 SMART (Pula C2, C6, C7):      R$ ${accProfitSmart.toFixed(2)}`);
    
    fs.writeFileSync(REPORT_FILE, lines.join('\n'));
    console.log(`Report generated at: ${REPORT_FILE}`);
}

analyzePinkDistances();
