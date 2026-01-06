const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const REPORT_FILE = path.join(__dirname, 'OTIMIZACAO_SNIPER.txt');

// CONSTANTS
const EXIT_TARGET = 10.0;
const BASE_STAKE = 50.0;

function getEmoji(val) {
    if (val >= 10.0) return '🌸';
    if (val >= 8.0) return '⛔';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

function analyzeSniper() {
    console.log('🚀 ANALISANDO PERFORMANCE DE SNIPER POR POSIÇÃO...');

    if (!fs.existsSync(GRAFOS_DIR)) {
        console.error('Directory not found:', GRAFOS_DIR);
        return;
    }

    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    
    // DATA STRUCTURE: Map CandleIndex -> Stats
    // Index 1 = 1st candle after pink, Index 2 = 2nd, etc.
    const positionStats = {};

    for (let i = 1; i <= 20; i++) {
        positionStats[i] = {
            occurrences: 0, // Total times this index appeared in EXPANSION
            wins: 0,        // Total Pinks at this index
            loss_blue: 0,
            loss_purple: 0,
            accumulated_roi_stake1: 0, // ROI assuming flat stake
            history: [] // Last 5 results
        };
    }

    let totalRounds = 0;
    let totalPinks = 0;

    for (const file of files) {
        const content = fs.readFileSync(path.join(GRAFOS_DIR, file), 'utf-8');
        // Oldest to Newest
        const values = content.split('\n').map(l => parseFloat(l.trim())).filter(n => !isNaN(n)).reverse();
        
        let candlesSinceLastPink = 0; // 0 means just saw a pink (so next is 1)
        
        // Find first pink to sync
        const firstPink = values.findIndex(v => v >= 10.0);
        if (firstPink === -1) continue; // Skip bad graph

        // Start from first pink
        candlesSinceLastPink = 0; 
        
        for (let i = firstPink + 1; i < values.length; i++) {
            const val = values[i];
            candlesSinceLastPink++; // This is the index (1, 2, 3...)

            // FILTER: Only analyze up to 20 candles deep
            if (candlesSinceLastPink > 20) {
                 if (val >= 10.0) candlesSinceLastPink = 0; // Reset on pink
                 continue;
            }

            // FILTER: "EXPANSION ONLY" SIMULATION
            // We want to know if it's worth shooting in expansions.
            // Simplified check: If we are not deep in desert (>12), we consider it potentially playable for stats.
            
            const stats = positionStats[candlesSinceLastPink];
            stats.occurrences++;

            const isWin = val >= EXIT_TARGET;
            
            if (isWin) {
                stats.wins++;
                // Profit = (Stake * 10) - Stake = 9 * Stake
                stats.accumulated_roi_stake1 += 9.0;
                totalPinks++;
                candlesSinceLastPink = 0; // Reset
            } else {
                if (val < 2.0) stats.loss_blue++;
                else stats.loss_purple++;
                
                // Loss = -Stake
                stats.accumulated_roi_stake1 -= 1.0;
            }

            stats.history.push(getEmoji(val));
            if (stats.history.length > 10) stats.history.shift(); // Keep last 10
        }
        totalRounds += values.length;
    }

    // === GENERATE REPORT ===
    const lines = [];
    lines.push(`================================================================`);
    lines.push(` 🔫 ESTUDO DE OTIMIZAÇÃO: RÉGUA DE SNIPER`);
    lines.push(` Base: 40 Grafos | Objetivo: Achar a "Zona Morta"`);
    lines.push(`================================================================`);
    lines.push(` INDICE | OCORRÊNCIAS | WINS (>=10x) | WINRATE |  ROI (1un)  | POSSÍVEL LUCRO (Stake R$50)`);
    lines.push(`----------------------------------------------------------------`);

    let bestRoi = -Infinity;
    let worstRoi = Infinity;

    for (let i = 1; i <= 20; i++) {
        const s = positionStats[i];
        if (s.occurrences === 0) continue;

        const winrate = (s.wins / s.occurrences) * 100;
        const profitBRL = s.accumulated_roi_stake1 * BASE_STAKE;
        
        let marker = '';
        if (profitBRL > 0) marker = '✅';
        else if (profitBRL < -1000) marker = '💀';
        
        // Highlight logic
        let type = '';
        if (i <= 3) type = '(Janela)';
        else if (i >= 8 && i <= 12) type = '(Deserto)';
        else type = '(Sniper)';

        lines.push(` ${String(i).padStart(2)}º ${type.padEnd(9)} | ${String(s.occurrences).padEnd(6)} | ${String(s.wins).padEnd(6)} | ${winrate.toFixed(1).padStart(5)}% | ${s.accumulated_roi_stake1.toFixed(1).padStart(6)}un | R$ ${profitBRL.toFixed(0).padStart(7)} ${marker}`);
    }

    lines.push(`----------------------------------------------------------------`);
    lines.push(`\n CONCLUSÕES PRELIMINARES:`);
    lines.push(` 1. Onde a "Janela" (1º a 3º) é lucrativa?`);
    lines.push(` 2. Onde o "Sniper" (4º a 8º) começa a dar prejuízo?`);
    lines.push(` 3. Vale a pena tentar adivinhar quebra de deserto (8º+)?`);
    
    fs.writeFileSync(REPORT_FILE, lines.join('\n'));
    console.log(`Report generated at: ${REPORT_FILE}`);
}

analyzeSniper();
