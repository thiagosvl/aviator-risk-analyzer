/**
 * INVESTIGAÇÃO: COMO PREVER ROSAS?
 * Analisar padrões ANTES das rosas acontecerem
 */

import fs from 'fs';
import path from 'path';

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

const MEMORY_SIZE = 25;

console.log(`\n${'='.repeat(80)}`);
console.log(`INVESTIGAÇÃO: PADRÕES ANTES DAS ROSAS`);
console.log(`${'='.repeat(80)}\n`);

// Coletar TODAS as janelas antes de rosas
const allPinkWindows: any[] = [];
const allNonPinkWindows: any[] = [];

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
        
        const purples = memory.filter(v => v >= 2.0).length;
        const blues = memory.filter(v => v < 2.0).length;
        const pinks = memory.filter(v => v >= 10.0).length;
        
        const purplePercent = (purples / 25) * 100;
        const bluePercent = (blues / 25) * 100;
        const pinkPercent = (pinks / 25) * 100;
        
        const avgValue = memory.reduce((a, b) => a + b, 0) / 25;
        const maxValue = Math.max(...memory);
        const minValue = Math.min(...memory);
        
        const variance = memory.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / 25;
        const volatility = Math.sqrt(variance);
        
        // Streak de purples
        let streak = 0;
        for (let j = 0; j < memory.length; j++) {
            if (memory[j] >= 2.0) streak++;
            else break;
        }
        
        // Intervalo desde última rosa
        let intervalSinceLastPink = 999;
        for (let j = 0; j < memory.length; j++) {
            if (memory[j] >= 10.0) {
                intervalSinceLastPink = j;
                break;
            }
        }
        
        // Últimas 5 velas
        const last5 = memory.slice(0, 5);
        const last5Purples = last5.filter(v => v >= 2.0).length;
        const last5Blues = last5.filter(v => v < 2.0).length;
        const last5Avg = last5.reduce((a, b) => a + b, 0) / 5;
        
        const analysis = {
            purplePercent,
            bluePercent,
            pinkPercent,
            avgValue,
            maxValue,
            minValue,
            volatility,
            streak,
            intervalSinceLastPink,
            last5Purples,
            last5Blues,
            last5Avg,
            nextValue,
            isPink: nextValue >= 10.0
        };
        
        if (nextValue >= 10.0) {
            allPinkWindows.push(analysis);
        } else {
            allNonPinkWindows.push(analysis);
        }
    }
}

console.log(`\n📊 DADOS COLETADOS:`);
console.log(`   Janelas antes de ROSA: ${allPinkWindows.length}`);
console.log(`   Janelas NÃO-ROSA: ${allNonPinkWindows.length}`);

// Análise comparativa
console.log(`\n🔍 ANÁLISE COMPARATIVA:\n`);

const avgPinkPurple = allPinkWindows.reduce((sum, w) => sum + w.purplePercent, 0) / allPinkWindows.length;
const avgNonPinkPurple = allNonPinkWindows.reduce((sum, w) => sum + w.purplePercent, 0) / allNonPinkWindows.length;

console.log(`Purple%:`);
console.log(`   Antes de ROSA: ${avgPinkPurple.toFixed(1)}%`);
console.log(`   Não-rosa: ${avgNonPinkPurple.toFixed(1)}%`);
console.log(`   Diferença: ${(avgPinkPurple - avgNonPinkPurple).toFixed(1)}%`);

const avgPinkBlue = allPinkWindows.reduce((sum, w) => sum + w.bluePercent, 0) / allPinkWindows.length;
const avgNonPinkBlue = allNonPinkWindows.reduce((sum, w) => sum + w.bluePercent, 0) / allNonPinkWindows.length;

console.log(`\nBlue%:`);
console.log(`   Antes de ROSA: ${avgPinkBlue.toFixed(1)}%`);
console.log(`   Não-rosa: ${avgNonPinkBlue.toFixed(1)}%`);
console.log(`   Diferença: ${(avgPinkBlue - avgNonPinkBlue).toFixed(1)}%`);

const avgPinkVol = allPinkWindows.reduce((sum, w) => sum + w.volatility, 0) / allPinkWindows.length;
const avgNonPinkVol = allNonPinkWindows.reduce((sum, w) => sum + w.volatility, 0) / allNonPinkWindows.length;

console.log(`\nVolatilidade:`);
console.log(`   Antes de ROSA: ${avgPinkVol.toFixed(2)}`);
console.log(`   Não-rosa: ${avgNonPinkVol.toFixed(2)}`);
console.log(`   Diferença: ${(avgPinkVol - avgNonPinkVol).toFixed(2)}`);

const avgPinkStreak = allPinkWindows.reduce((sum, w) => sum + w.streak, 0) / allPinkWindows.length;
const avgNonPinkStreak = allNonPinkWindows.reduce((sum, w) => sum + w.streak, 0) / allNonPinkWindows.length;

console.log(`\nStreak:`);
console.log(`   Antes de ROSA: ${avgPinkStreak.toFixed(1)}`);
console.log(`   Não-rosa: ${avgNonPinkStreak.toFixed(1)}`);
console.log(`   Diferença: ${(avgPinkStreak - avgNonPinkStreak).toFixed(1)}`);

const avgPinkInterval = allPinkWindows.reduce((sum, w) => sum + w.intervalSinceLastPink, 0) / allPinkWindows.length;
const avgNonPinkInterval = allNonPinkWindows.reduce((sum, w) => sum + w.intervalSinceLastPink, 0) / allNonPinkWindows.length;

console.log(`\nIntervalo desde última rosa:`);
console.log(`   Antes de ROSA: ${avgPinkInterval.toFixed(1)} rodadas`);
console.log(`   Não-rosa: ${avgNonPinkInterval.toFixed(1)} rodadas`);
console.log(`   Diferença: ${(avgPinkInterval - avgNonPinkInterval).toFixed(1)}`);

const avgPinkLast5Purples = allPinkWindows.reduce((sum, w) => sum + w.last5Purples, 0) / allPinkWindows.length;
const avgNonPinkLast5Purples = allNonPinkWindows.reduce((sum, w) => sum + w.last5Purples, 0) / allNonPinkWindows.length;

console.log(`\nÚltimas 5 velas - Purples:`);
console.log(`   Antes de ROSA: ${avgPinkLast5Purples.toFixed(1)}`);
console.log(`   Não-rosa: ${avgNonPinkLast5Purples.toFixed(1)}`);
console.log(`   Diferença: ${(avgPinkLast5Purples - avgNonPinkLast5Purples).toFixed(1)}`);

// Testar regras específicas
console.log(`\n\n🎯 TESTANDO REGRAS PREDITIVAS:\n`);

const rules = [
    {
        name: 'Purple% ≥ 60',
        test: (w: any) => w.purplePercent >= 60
    },
    {
        name: 'Blue% ≥ 60',
        test: (w: any) => w.bluePercent >= 60
    },
    {
        name: 'Volatilidade ≥ 10',
        test: (w: any) => w.volatility >= 10
    },
    {
        name: 'Streak ≥ 5',
        test: (w: any) => w.streak >= 5
    },
    {
        name: 'Intervalo ≥ 10 (sem rosa há muito tempo)',
        test: (w: any) => w.intervalSinceLastPink >= 10
    },
    {
        name: 'Pink% na janela ≥ 8% (tem rosas recentes)',
        test: (w: any) => w.pinkPercent >= 8
    },
    {
        name: 'Últimas 5: 4+ purples',
        test: (w: any) => w.last5Purples >= 4
    },
    {
        name: 'Últimas 5: 4+ blues',
        test: (w: any) => w.last5Blues >= 4
    },
    {
        name: 'Purple% ≥ 55 + Volatilidade ≥ 5',
        test: (w: any) => w.purplePercent >= 55 && w.volatility >= 5
    },
    {
        name: 'Blue% ≥ 55 + Intervalo ≥ 10',
        test: (w: any) => w.bluePercent >= 55 && w.intervalSinceLastPink >= 10
    },
];

for (const rule of rules) {
    const pinkMatches = allPinkWindows.filter(rule.test).length;
    const nonPinkMatches = allNonPinkWindows.filter(rule.test).length;
    const totalMatches = pinkMatches + nonPinkMatches;
    
    if (totalMatches === 0) continue;
    
    const precision = (pinkMatches / totalMatches) * 100;
    const recall = (pinkMatches / allPinkWindows.length) * 100;
    
    console.log(`${rule.name}:`);
    console.log(`   Matches: ${totalMatches} (${pinkMatches} rosas, ${nonPinkMatches} não-rosas)`);
    console.log(`   Precisão: ${precision.toFixed(1)}% (quando a regra ativa, quantas são rosas)`);
    console.log(`   Recall: ${recall.toFixed(1)}% (quantas rosas a regra captura)`);
    
    if (totalMatches >= 10) {
        const lucro = (pinkMatches * 900) - (nonPinkMatches * 100);
        console.log(`   Lucro estimado: R$ ${lucro.toFixed(2)}`);
    }
    console.log();
}

console.log(`\n${'='.repeat(80)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(80)}\n`);
