/**
 * ANÁLISE RADICAL - DADOS PUROS
 * Esquecer regras atuais e descobrir padrões REAIS
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Uso: npx tsx scripts/analyze_raw_patterns.ts <pasta_grafos>');
    process.exit(1);
}

const graphsDir = args[0];
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

console.log(`\n${'='.repeat(80)}`);
console.log(`ANÁLISE RADICAL - DADOS PUROS`);
console.log(`${'='.repeat(80)}\n`);

const MEMORY_SIZE = 25;

for (const file of files) {
    const filepath = path.join(graphsDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    const chronological = [...graphValues].reverse();
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 GRAFO: ${file}`);
    console.log(`${'='.repeat(80)}`);
    
    // Estatísticas básicas
    const purples = chronological.filter(v => v >= 2.0).length;
    const blues = chronological.filter(v => v < 2.0).length;
    const pinks = chronological.filter(v => v >= 10.0).length;
    
    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de velas: ${graphValues.length}`);
    console.log(`   Purples (≥2x): ${purples} (${(purples/graphValues.length*100).toFixed(1)}%)`);
    console.log(`   Blues (<2x): ${blues} (${(blues/graphValues.length*100).toFixed(1)}%)`);
    console.log(`   Pinks (≥10x): ${pinks} (${(pinks/graphValues.length*100).toFixed(1)}%)`);
    
    // Analisar TODAS as rodadas: quando o próximo é ≥2x?
    let totalOpportunities = 0;
    let greenIfPlayedAll = 0;
    
    const patterns: {
        lastValue: string;
        purplePercent: string;
        bluePercent: string;
        result: string;
    }[] = [];
    
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        
        totalOpportunities++;
        const isGreen = nextValue >= 2.0;
        if (isGreen) greenIfPlayedAll++;
        
        // Características da janela
        const purpleCount = memory.filter(v => v >= 2.0).length;
        const blueCount = memory.filter(v => v < 2.0).length;
        const purplePercent = (purpleCount / MEMORY_SIZE) * 100;
        const bluePercent = (blueCount / MEMORY_SIZE) * 100;
        const lastValue = memory[0];
        
        patterns.push({
            lastValue: lastValue < 2.0 ? 'BLUE' : (lastValue >= 10.0 ? 'PINK' : 'PURPLE'),
            purplePercent: purplePercent.toFixed(0),
            bluePercent: bluePercent.toFixed(0),
            result: isGreen ? 'GREEN' : 'LOSS'
        });
    }
    
    const baselineAccuracy = (greenIfPlayedAll / totalOpportunities) * 100;
    
    console.log(`\n🎯 BASELINE (jogar SEMPRE):`);
    console.log(`   Rodadas: ${totalOpportunities}`);
    console.log(`   Greens: ${greenIfPlayedAll}`);
    console.log(`   Losses: ${totalOpportunities - greenIfPlayedAll}`);
    console.log(`   Assertividade: ${baselineAccuracy.toFixed(1)}%`);
    console.log(`   Lucro: R$ ${((greenIfPlayedAll - (totalOpportunities - greenIfPlayedAll)) * 100).toFixed(2)}`);
    
    // Análise: Após BLUE, qual a chance de GREEN?
    const afterBlue = patterns.filter(p => p.lastValue === 'BLUE');
    const afterBlueGreens = afterBlue.filter(p => p.result === 'GREEN').length;
    const afterBlueAccuracy = afterBlue.length > 0 ? (afterBlueGreens / afterBlue.length) * 100 : 0;
    
    console.log(`\n🔵 APÓS BLUE:`);
    console.log(`   Ocorrências: ${afterBlue.length}`);
    console.log(`   Greens: ${afterBlueGreens}`);
    console.log(`   Assertividade: ${afterBlueAccuracy.toFixed(1)}%`);
    
    // Análise: Após PURPLE, qual a chance de GREEN?
    const afterPurple = patterns.filter(p => p.lastValue === 'PURPLE');
    const afterPurpleGreens = afterPurple.filter(p => p.result === 'GREEN').length;
    const afterPurpleAccuracy = afterPurple.length > 0 ? (afterPurpleGreens / afterPurple.length) * 100 : 0;
    
    console.log(`\n🟣 APÓS PURPLE:`);
    console.log(`   Ocorrências: ${afterPurple.length}`);
    console.log(`   Greens: ${afterPurpleGreens}`);
    console.log(`   Assertividade: ${afterPurpleAccuracy.toFixed(1)}%`);
    
    // Análise: Após PINK, qual a chance de GREEN?
    const afterPink = patterns.filter(p => p.lastValue === 'PINK');
    const afterPinkGreens = afterPink.filter(p => p.result === 'GREEN').length;
    const afterPinkAccuracy = afterPink.length > 0 ? (afterPinkGreens / afterPink.length) * 100 : 0;
    
    console.log(`\n🌸 APÓS PINK:`);
    console.log(`   Ocorrências: ${afterPink.length}`);
    console.log(`   Greens: ${afterPinkGreens}`);
    console.log(`   Assertividade: ${afterPinkAccuracy.toFixed(1)}%`);
    
    // Análise: Purple% alta (≥60%) → qual a chance de GREEN?
    const highPurple = patterns.filter(p => parseInt(p.purplePercent) >= 60);
    const highPurpleGreens = highPurple.filter(p => p.result === 'GREEN').length;
    const highPurpleAccuracy = highPurple.length > 0 ? (highPurpleGreens / highPurple.length) * 100 : 0;
    
    console.log(`\n📊 PURPLE% ALTA (≥60%):`);
    console.log(`   Ocorrências: ${highPurple.length}`);
    console.log(`   Greens: ${highPurpleGreens}`);
    console.log(`   Assertividade: ${highPurpleAccuracy.toFixed(1)}%`);
    
    // Análise: Blue% alta (≥60%) → qual a chance de GREEN?
    const highBlue = patterns.filter(p => parseInt(p.bluePercent) >= 60);
    const highBlueGreens = highBlue.filter(p => p.result === 'GREEN').length;
    const highBlueAccuracy = highBlue.length > 0 ? (highBlueGreens / highBlue.length) * 100 : 0;
    
    console.log(`\n📊 BLUE% ALTA (≥60%):`);
    console.log(`   Ocorrências: ${highBlue.length}`);
    console.log(`   Greens: ${highBlueGreens}`);
    console.log(`   Assertividade: ${highBlueAccuracy.toFixed(1)}%`);
    
    // Análise: BLUE + Purple% alta (≥60%)
    const blueAndHighPurple = patterns.filter(p => p.lastValue === 'BLUE' && parseInt(p.purplePercent) >= 60);
    const blueAndHighPurpleGreens = blueAndHighPurple.filter(p => p.result === 'GREEN').length;
    const blueAndHighPurpleAccuracy = blueAndHighPurple.length > 0 ? (blueAndHighPurpleGreens / blueAndHighPurple.length) * 100 : 0;
    
    console.log(`\n🎯 BLUE + PURPLE% ALTA (≥60%):`);
    console.log(`   Ocorrências: ${blueAndHighPurple.length}`);
    console.log(`   Greens: ${blueAndHighPurpleGreens}`);
    console.log(`   Assertividade: ${blueAndHighPurpleAccuracy.toFixed(1)}%`);
    if (blueAndHighPurple.length > 0) {
        const profit = (blueAndHighPurpleGreens - (blueAndHighPurple.length - blueAndHighPurpleGreens)) * 100;
        console.log(`   Lucro: R$ ${profit.toFixed(2)}`);
    }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(80)}\n`);
