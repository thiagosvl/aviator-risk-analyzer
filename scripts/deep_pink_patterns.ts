/**
 * ANÁLISE PROFUNDA: PADRÕES ANTES DAS ROSAS
 * Buscar padrões reais que indicam rosa iminente
 */

import fs from 'fs';
import path from 'path';

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

const MEMORY_SIZE = 25;

console.log(`\n${'='.repeat(100)}`);
console.log(`ANÁLISE PROFUNDA: O QUE ACONTECE ANTES DAS ROSAS?`);
console.log(`${'='.repeat(100)}\n`);

// Coletar dados de TODAS as rodadas
const allRounds: any[] = [];

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
        
        // Métricas
        const purples = memory.filter(v => v >= 2.0).length;
        const blues = memory.filter(v => v < 2.0).length;
        const pinks = memory.filter(v => v > 10.0).length;
        
        const purplePercent = (purples / 25) * 100;
        const bluePercent = (blues / 25) * 100;
        const pinkPercent = (pinks / 25) * 100;
        
        // Últimas 3, 5, 10 velas
        const last3 = memory.slice(0, 3);
        const last5 = memory.slice(0, 5);
        const last10 = memory.slice(0, 10);
        
        const last3Avg = last3.reduce((a, b) => a + b, 0) / 3;
        const last5Avg = last5.reduce((a, b) => a + b, 0) / 5;
        const last10Avg = last10.reduce((a, b) => a + b, 0) / 10;
        
        const last3Pinks = last3.filter(v => v > 10.0).length;
        const last5Pinks = last5.filter(v => v > 10.0).length;
        const last10Pinks = last10.filter(v => v > 10.0).length;
        
        const last3Blues = last3.filter(v => v < 2.0).length;
        const last5Blues = last5.filter(v => v < 2.0).length;
        const last10Blues = last10.filter(v => v < 2.0).length;
        
        // Última vela
        const lastValue = memory[0];
        
        // Volatilidade
        const avgValue = memory.reduce((a, b) => a + b, 0) / 25;
        const variance = memory.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / 25;
        const volatility = Math.sqrt(variance);
        
        // Sequência de blues
        let blueStreak = 0;
        for (let j = 0; j < memory.length; j++) {
            if (memory[j] < 2.0) blueStreak++;
            else break;
        }
        
        // Sequência de purples
        let purpleStreak = 0;
        for (let j = 0; j < memory.length; j++) {
            if (memory[j] >= 2.0) purpleStreak++;
            else break;
        }
        
        allRounds.push({
            nextValue,
            isPink: nextValue > 10.0,
            purplePercent,
            bluePercent,
            pinkPercent,
            last3Avg,
            last5Avg,
            last10Avg,
            last3Pinks,
            last5Pinks,
            last10Pinks,
            last3Blues,
            last5Blues,
            last10Blues,
            lastValue,
            volatility,
            blueStreak,
            purpleStreak
        });
    }
}

const pinkRounds = allRounds.filter(r => r.isPink);
const nonPinkRounds = allRounds.filter(r => !r.isPink);

console.log(`Total de rodadas: ${allRounds.length}`);
console.log(`Rosas: ${pinkRounds.length} (${(pinkRounds.length / allRounds.length * 100).toFixed(1)}%)`);
console.log(`Não-rosas: ${nonPinkRounds.length}\n`);

// Análise comparativa detalhada
console.log(`🔍 COMPARAÇÃO: ANTES DE ROSA vs NÃO-ROSA\n`);

const metrics = [
    { name: 'Purple%', key: 'purplePercent' },
    { name: 'Blue%', key: 'bluePercent' },
    { name: 'Pink%', key: 'pinkPercent' },
    { name: 'Última vela', key: 'lastValue' },
    { name: 'Média últimas 3', key: 'last3Avg' },
    { name: 'Média últimas 5', key: 'last5Avg' },
    { name: 'Média últimas 10', key: 'last10Avg' },
    { name: 'Pinks últimas 3', key: 'last3Pinks' },
    { name: 'Pinks últimas 5', key: 'last5Pinks' },
    { name: 'Pinks últimas 10', key: 'last10Pinks' },
    { name: 'Blues últimas 3', key: 'last3Blues' },
    { name: 'Blues últimas 5', key: 'last5Blues' },
    { name: 'Blues últimas 10', key: 'last10Blues' },
    { name: 'Volatilidade', key: 'volatility' },
    { name: 'Blue streak', key: 'blueStreak' },
    { name: 'Purple streak', key: 'purpleStreak' }
];

metrics.forEach(metric => {
    const avgPink = pinkRounds.reduce((sum, r) => sum + r[metric.key], 0) / pinkRounds.length;
    const avgNonPink = nonPinkRounds.reduce((sum, r) => sum + r[metric.key], 0) / nonPinkRounds.length;
    const diff = avgPink - avgNonPink;
    const diffPercent = avgNonPink !== 0 ? (diff / avgNonPink * 100) : 0;
    
    console.log(`${metric.name}:`);
    console.log(`   Antes de rosa: ${avgPink.toFixed(2)}`);
    console.log(`   Não-rosa: ${avgNonPink.toFixed(2)}`);
    console.log(`   Diferença: ${diff.toFixed(2)} (${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(1)}%)`);
    console.log();
});

// Testar regras específicas
console.log(`\n🎯 TESTANDO REGRAS ESPECÍFICAS:\n`);

const rules = [
    {
        name: 'Pinks últimas 3 ≥ 1',
        test: (r: any) => r.last3Pinks >= 1
    },
    {
        name: 'Pinks últimas 5 ≥ 2',
        test: (r: any) => r.last5Pinks >= 2
    },
    {
        name: 'Pinks últimas 10 ≥ 3',
        test: (r: any) => r.last10Pinks >= 3
    },
    {
        name: 'Média últimas 5 ≥ 10x',
        test: (r: any) => r.last5Avg >= 10
    },
    {
        name: 'Última vela < 2x (blue)',
        test: (r: any) => r.lastValue < 2.0
    },
    {
        name: 'Última vela > 10x (pink)',
        test: (r: any) => r.lastValue > 10.0
    },
    {
        name: 'Volatilidade ≥ 20',
        test: (r: any) => r.volatility >= 20
    },
    {
        name: 'Pink% ≥ 12',
        test: (r: any) => r.pinkPercent >= 12
    },
    {
        name: 'Pinks últimas 5 ≥ 1 + Volatilidade ≥ 10',
        test: (r: any) => r.last5Pinks >= 1 && r.volatility >= 10
    },
    {
        name: 'Pinks últimas 5 ≥ 2 + Média últimas 5 ≥ 5x',
        test: (r: any) => r.last5Pinks >= 2 && r.last5Avg >= 5
    }
];

for (const rule of rules) {
    const pinkMatches = pinkRounds.filter(rule.test).length;
    const nonPinkMatches = nonPinkRounds.filter(rule.test).length;
    const totalMatches = pinkMatches + nonPinkMatches;
    
    if (totalMatches === 0) continue;
    
    const precision = (pinkMatches / totalMatches) * 100;
    const recall = (pinkMatches / pinkRounds.length) * 100;
    
    // Simular lucro
    const investido = totalMatches * 50;
    const recebido = pinkMatches * 500;
    const lucro = recebido - investido;
    
    console.log(`${rule.name}:`);
    console.log(`   Jogadas: ${totalMatches} (${pinkMatches} rosas, ${nonPinkMatches} não-rosas)`);
    console.log(`   Precisão: ${precision.toFixed(1)}% (quando ativa, quantas são rosas)`);
    console.log(`   Recall: ${recall.toFixed(1)}% (quantas rosas captura)`);
    console.log(`   Investido: R$ ${investido}, Recebido: R$ ${recebido}, Lucro: R$ ${lucro}`);
    console.log();
}

console.log(`\n${'='.repeat(100)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(100)}\n`);
