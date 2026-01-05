/**
 * ANÁLISE CORRIGIDA
 * - Rosa: R$ 50 (não R$ 100)
 * - Rosa: >10.0x (não ≥10.0x)
 * - Analisar padrões REAIS antes das rosas
 */

import fs from 'fs';
import path from 'path';

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

const MEMORY_SIZE = 25;
const APOSTA_ROXA = 100;
const APOSTA_ROSA = 50;
const GANHO_ROXA = 200; // Aposta R$ 100, ganha R$ 200
const GANHO_ROSA = 500; // Aposta R$ 50, ganha R$ 500

console.log(`\n${'='.repeat(100)}`);
console.log(`ANÁLISE CORRIGIDA - VALORES E THRESHOLDS CORRETOS`);
console.log(`${'='.repeat(100)}\n`);

console.log(`Configuração:`);
console.log(`   Aposta ROXA: R$ ${APOSTA_ROXA}`);
console.log(`   Aposta ROSA: R$ ${APOSTA_ROSA}`);
console.log(`   Ganho ROXA: R$ ${GANHO_ROXA} (≥2.0x)`);
console.log(`   Ganho ROSA: R$ ${GANHO_ROSA} (>10.0x)`);
console.log();

// Coletar TODAS as rosas e analisar o que acontece ANTES
const pinkAnalysis: any[] = [];

for (const file of files) {
    const filepath = path.join(graphsDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    const chronological = [...graphValues].reverse();
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        
        // Rosa CORRETA: >10.0 (não ≥10.0)
        if (nextValue > 10.0) {
            // Analisar o que aconteceu ANTES desta rosa
            const purples = memory.filter(v => v >= 2.0).length;
            const blues = memory.filter(v => v < 2.0).length;
            const pinks = memory.filter(v => v > 10.0).length;
            
            const purplePercent = (purples / 25) * 100;
            const bluePercent = (blues / 25) * 100;
            const pinkPercent = (pinks / 25) * 100;
            
            // Últimas 5 velas
            const last5 = memory.slice(0, 5);
            const last5Purples = last5.filter(v => v >= 2.0).length;
            const last5Blues = last5.filter(v => v < 2.0).length;
            const last5Pinks = last5.filter(v => v > 10.0).length;
            const last5Avg = last5.reduce((a, b) => a + b, 0) / 5;
            
            // Última vela
            const lastValue = memory[0];
            const lastIsBlue = lastValue < 2.0;
            const lastIsPurple = lastValue >= 2.0 && lastValue <= 10.0;
            const lastIsPink = lastValue > 10.0;
            
            // Intervalo desde última rosa
            let intervalSinceLastPink = 25;
            for (let j = 0; j < memory.length; j++) {
                if (memory[j] > 10.0) {
                    intervalSinceLastPink = j;
                    break;
                }
            }
            
            // Volatilidade
            const avgValue = memory.reduce((a, b) => a + b, 0) / 25;
            const variance = memory.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / 25;
            const volatility = Math.sqrt(variance);
            
            pinkAnalysis.push({
                grafo: file,
                rodada: i,
                nextValue,
                purplePercent,
                bluePercent,
                pinkPercent,
                last5Purples,
                last5Blues,
                last5Pinks,
                last5Avg,
                lastValue,
                lastIsBlue,
                lastIsPurple,
                lastIsPink,
                intervalSinceLastPink,
                volatility
            });
        }
    }
}

console.log(`\n📊 ROSAS ENCONTRADAS: ${pinkAnalysis.length}\n`);

// Análise estatística
console.log(`🔍 PADRÕES ANTES DAS ROSAS:\n`);

const avgPurple = pinkAnalysis.reduce((sum, p) => sum + p.purplePercent, 0) / pinkAnalysis.length;
console.log(`Purple% médio: ${avgPurple.toFixed(1)}%`);

const avgBlue = pinkAnalysis.reduce((sum, p) => sum + p.bluePercent, 0) / pinkAnalysis.length;
console.log(`Blue% médio: ${avgBlue.toFixed(1)}%`);

const avgPink = pinkAnalysis.reduce((sum, p) => sum + p.pinkPercent, 0) / pinkAnalysis.length;
console.log(`Pink% médio: ${avgPink.toFixed(1)}%`);

const avgInterval = pinkAnalysis.reduce((sum, p) => sum + p.intervalSinceLastPink, 0) / pinkAnalysis.length;
console.log(`Intervalo médio desde última rosa: ${avgInterval.toFixed(1)} rodadas`);

const avgVol = pinkAnalysis.reduce((sum, p) => sum + p.volatility, 0) / pinkAnalysis.length;
console.log(`Volatilidade média: ${avgVol.toFixed(2)}`);

const avgLast5Avg = pinkAnalysis.reduce((sum, p) => sum + p.last5Avg, 0) / pinkAnalysis.length;
console.log(`Média das últimas 5 velas: ${avgLast5Avg.toFixed(2)}x`);

console.log(`\n📋 ÚLTIMA VELA ANTES DA ROSA:\n`);

const lastBlue = pinkAnalysis.filter(p => p.lastIsBlue).length;
const lastPurple = pinkAnalysis.filter(p => p.lastIsPurple).length;
const lastPink = pinkAnalysis.filter(p => p.lastIsPink).length;

console.log(`   Blue (<2x): ${lastBlue} (${(lastBlue / pinkAnalysis.length * 100).toFixed(1)}%)`);
console.log(`   Purple (2-10x): ${lastPurple} (${(lastPurple / pinkAnalysis.length * 100).toFixed(1)}%)`);
console.log(`   Pink (>10x): ${lastPink} (${(lastPink / pinkAnalysis.length * 100).toFixed(1)}%)`);

// Analisar se há padrão de intervalo
console.log(`\n📊 DISTRIBUIÇÃO DE INTERVALOS:\n`);

const intervals = [
    { range: '0 (rosa consecutiva)', count: 0 },
    { range: '1-5', count: 0 },
    { range: '6-10', count: 0 },
    { range: '11-15', count: 0 },
    { range: '16-20', count: 0 },
    { range: '21-25', count: 0 }
];

pinkAnalysis.forEach(p => {
    if (p.intervalSinceLastPink === 0) intervals[0].count++;
    else if (p.intervalSinceLastPink <= 5) intervals[1].count++;
    else if (p.intervalSinceLastPink <= 10) intervals[2].count++;
    else if (p.intervalSinceLastPink <= 15) intervals[3].count++;
    else if (p.intervalSinceLastPink <= 20) intervals[4].count++;
    else intervals[5].count++;
});

intervals.forEach(int => {
    const percent = (int.count / pinkAnalysis.length * 100).toFixed(1);
    console.log(`   ${int.range}: ${int.count} (${percent}%)`);
});

// Testar estratégia: Jogar 25 rodadas após rosa
console.log(`\n\n💰 TESTE: JOGAR 25 RODADAS APÓS CADA ROSA\n`);

for (const file of files) {
    const filepath = path.join(graphsDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    const chronological = [...graphValues].reverse();
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    let investido = 0, recebido = 0, jogadas = 0, greens = 0;
    let rodadasAposRosa = 0; // Contador de rodadas após última rosa
    
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        
        // Se última vela foi rosa, ativar contador
        if (memory[0] > 10.0) {
            rodadasAposRosa = 25;
        }
        
        // Se estamos dentro das 25 rodadas após rosa, jogar
        if (rodadasAposRosa > 0) {
            jogadas++;
            investido += APOSTA_ROSA;
            
            if (nextValue > 10.0) {
                greens++;
                recebido += GANHO_ROSA;
            }
            
            rodadasAposRosa--;
        }
    }
    
    const lucro = recebido - investido;
    const assertividade = jogadas > 0 ? (greens / jogadas * 100) : 0;
    
    console.log(`${file}:`);
    console.log(`   Jogadas: ${jogadas}, Greens: ${greens}, Assertividade: ${assertividade.toFixed(1)}%`);
    console.log(`   Investido: R$ ${investido}, Recebido: R$ ${recebido}, Lucro: R$ ${lucro}`);
    console.log();
}

console.log(`\n${'='.repeat(100)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(100)}\n`);
