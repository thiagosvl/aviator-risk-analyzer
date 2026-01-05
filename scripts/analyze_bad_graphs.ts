/**
 * ANÁLISE PROFUNDA DOS GRAFOS "RUINS"
 * Objetivo: Descobrir O QUE daria lucro nos grafos 2, 3, 8, 9
 */

import fs from 'fs';
import path from 'path';

const badGraphs = ['2_139.txt', '3_156.txt', '8_170.txt', '9_147.txt'];
const graphsDir = 'GRAFOS_TESTE';

const MEMORY_SIZE = 25;

interface Strategy {
    name: string;
    test: (window: WindowData) => boolean;
}

interface WindowData {
    purplePercent: number;
    bluePercent: number;
    streak: number;
    trend: 'UP' | 'DOWN' | 'FLAT';
    volatility: number;
    avgValue: number;
    lastValue: number;
    recentPurples: number; // últimos 5
    recentBlues: number; // últimos 5
}

function analyzeWindow(memory: number[]): WindowData {
    const purples = memory.filter(v => v >= 2.0).length;
    const blues = memory.filter(v => v < 2.0).length;
    const purplePercent = (purples / memory.length) * 100;
    const bluePercent = (blues / memory.length) * 100;
    
    const avgValue = memory.reduce((a, b) => a + b, 0) / memory.length;
    
    const variance = memory.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / memory.length;
    const volatility = Math.sqrt(variance);
    
    const firstHalf = memory.slice(0, Math.floor(memory.length / 2));
    const secondHalf = memory.slice(Math.floor(memory.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
    if (avgSecond > avgFirst * 1.1) trend = 'UP';
    else if (avgSecond < avgFirst * 0.9) trend = 'DOWN';
    
    let streak = 0;
    for (let i = 0; i < memory.length; i++) {
        if (memory[i] >= 2.0) streak++;
        else break;
    }
    
    const recent5 = memory.slice(0, 5);
    const recentPurples = recent5.filter(v => v >= 2.0).length;
    const recentBlues = recent5.filter(v => v < 2.0).length;
    
    return {
        purplePercent,
        bluePercent,
        streak,
        trend,
        volatility,
        avgValue,
        lastValue: memory[0],
        recentPurples,
        recentBlues
    };
}

console.log(`\n${'='.repeat(80)}`);
console.log(`ANÁLISE PROFUNDA DOS GRAFOS "RUINS"`);
console.log(`${'='.repeat(80)}\n`);

// Testar MUITAS estratégias diferentes
const strategies: Strategy[] = [
    // Baseadas em purple%
    { name: 'Purple≥70', test: w => w.purplePercent >= 70 },
    { name: 'Purple≥65', test: w => w.purplePercent >= 65 },
    { name: 'Purple≥60', test: w => w.purplePercent >= 60 },
    { name: 'Purple 50-60', test: w => w.purplePercent >= 50 && w.purplePercent < 60 },
    { name: 'Purple 40-50', test: w => w.purplePercent >= 40 && w.purplePercent < 50 },
    
    // Baseadas em streak
    { name: 'Streak≥5', test: w => w.streak >= 5 },
    { name: 'Streak≥4', test: w => w.streak >= 4 },
    { name: 'Streak≥3', test: w => w.streak >= 3 },
    { name: 'Streak≥2', test: w => w.streak >= 2 },
    { name: 'Streak=1', test: w => w.streak === 1 },
    { name: 'Streak=0 (após blue)', test: w => w.streak === 0 },
    
    // Baseadas em trend
    { name: 'Trend=UP', test: w => w.trend === 'UP' },
    { name: 'Trend=DOWN', test: w => w.trend === 'DOWN' },
    { name: 'Trend=FLAT', test: w => w.trend === 'FLAT' },
    
    // Baseadas em volatilidade
    { name: 'Vol<2 (baixa)', test: w => w.volatility < 2 },
    { name: 'Vol 2-5 (média)', test: w => w.volatility >= 2 && w.volatility < 5 },
    { name: 'Vol≥5 (alta)', test: w => w.volatility >= 5 },
    
    // Baseadas em últimas 5 velas
    { name: 'Recent: 4-5 purples', test: w => w.recentPurples >= 4 },
    { name: 'Recent: 3 purples', test: w => w.recentPurples === 3 },
    { name: 'Recent: 4-5 blues', test: w => w.recentBlues >= 4 },
    
    // Combinações complexas
    { name: 'Purple≥60 + Streak≥3', test: w => w.purplePercent >= 60 && w.streak >= 3 },
    { name: 'Purple≥60 + Streak≥2', test: w => w.purplePercent >= 60 && w.streak >= 2 },
    { name: 'Purple≥55 + Streak≥2', test: w => w.purplePercent >= 55 && w.streak >= 2 },
    { name: 'Purple≥50 + Streak≥3', test: w => w.purplePercent >= 50 && w.streak >= 3 },
    { name: 'Purple≥60 + Trend=UP', test: w => w.purplePercent >= 60 && w.trend === 'UP' },
    { name: 'Purple≥55 + Trend=UP', test: w => w.purplePercent >= 55 && w.trend === 'UP' },
    { name: 'Streak≥3 + Vol<5', test: w => w.streak >= 3 && w.volatility < 5 },
    { name: 'Streak≥2 + Vol<3', test: w => w.streak >= 2 && w.volatility < 3 },
    { name: 'Trend=UP + Streak≥2', test: w => w.trend === 'UP' && w.streak >= 2 },
    { name: 'Trend=UP + Streak≥3', test: w => w.trend === 'UP' && w.streak >= 3 },
    { name: 'Purple≥50 + Blue<45', test: w => w.purplePercent >= 50 && w.bluePercent < 45 },
    { name: 'Purple≥50 + Blue<45 + Streak≥1', test: w => w.purplePercent >= 50 && w.bluePercent < 45 && w.streak >= 1 },
    { name: 'Purple≥55 + Blue<40', test: w => w.purplePercent >= 55 && w.bluePercent < 40 },
    { name: 'Recent 4+ purples + Streak≥2', test: w => w.recentPurples >= 4 && w.streak >= 2 },
    { name: 'Recent 3+ purples + Trend=UP', test: w => w.recentPurples >= 3 && w.trend === 'UP' },
    
    // Estratégias inversas (após muitos blues)
    { name: 'Blue≥60 (reversão)', test: w => w.bluePercent >= 60 },
    { name: 'Blue≥55 (reversão)', test: w => w.bluePercent >= 55 },
    { name: 'Recent 4+ blues (reversão)', test: w => w.recentBlues >= 4 },
    { name: 'Streak=0 + Blue≥50', test: w => w.streak === 0 && w.bluePercent >= 50 },
];

for (const file of badGraphs) {
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
    
    const windows: { data: WindowData; nextIsGreen: boolean }[] = [];
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        const data = analyzeWindow(memory);
        windows.push({ data, nextIsGreen: nextValue >= 2.0 });
    }
    
    const greens = windows.filter(w => w.nextIsGreen).length;
    const baseline = (greens / windows.length) * 100;
    
    console.log(`\n📈 BASELINE: ${baseline.toFixed(1)}% (${greens}/${windows.length})`);
    
    console.log(`\n🔍 TESTANDO ${strategies.length} ESTRATÉGIAS:\n`);
    
    const results: { name: string; plays: number; greens: number; accuracy: number; profit: number }[] = [];
    
    for (const strategy of strategies) {
        const filtered = windows.filter(w => strategy.test(w.data));
        const strategyGreens = filtered.filter(w => w.nextIsGreen).length;
        const accuracy = filtered.length > 0 ? (strategyGreens / filtered.length) * 100 : 0;
        const profit = (strategyGreens - (filtered.length - strategyGreens)) * 100;
        
        if (filtered.length >= 5) { // Mínimo 5 jogadas para ser válido
            results.push({
                name: strategy.name,
                plays: filtered.length,
                greens: strategyGreens,
                accuracy,
                profit
            });
        }
    }
    
    // Ordenar por lucro
    results.sort((a, b) => b.profit - a.profit);
    
    console.log(`🏆 TOP 10 ESTRATÉGIAS POR LUCRO:\n`);
    results.slice(0, 10).forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.name}`);
        console.log(`   Jogadas: ${r.plays}, Greens: ${r.greens}, Assertividade: ${r.accuracy.toFixed(1)}%, Lucro: R$ ${r.profit.toFixed(2)}`);
    });
    
    console.log(`\n📊 TOP 10 ESTRATÉGIAS POR ASSERTIVIDADE:\n`);
    const byAccuracy = [...results].sort((a, b) => b.accuracy - a.accuracy);
    byAccuracy.slice(0, 10).forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.name}`);
        console.log(`   Jogadas: ${r.plays}, Greens: ${r.greens}, Assertividade: ${r.accuracy.toFixed(1)}%, Lucro: R$ ${r.profit.toFixed(2)}`);
    });
    
    if (results.length > 0 && results[0].profit > 0) {
        console.log(`\n✅ ESTRATÉGIA LUCRATIVA ENCONTRADA!`);
        console.log(`   ${results[0].name}`);
        console.log(`   Lucro: R$ ${results[0].profit.toFixed(2)}, Assertividade: ${results[0].accuracy.toFixed(1)}%`);
    } else {
        console.log(`\n❌ NENHUMA ESTRATÉGIA LUCRATIVA ENCONTRADA!`);
        console.log(`   Melhor resultado: ${results[0]?.name || 'N/A'}`);
        console.log(`   Lucro: R$ ${results[0]?.profit.toFixed(2) || '0.00'}, Assertividade: ${results[0]?.accuracy.toFixed(1) || '0.0'}%`);
    }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(80)}\n`);
