/**
 * ANÁLISE DE MOMENTUM E CICLOS
 * Objetivo: Descobrir QUANDO jogar em cada grafo para ter lucro
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Uso: npx tsx scripts/analyze_momentum.ts <pasta_grafos>');
    process.exit(1);
}

const graphsDir = args[0];
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

const MEMORY_SIZE = 25;

interface WindowAnalysis {
    index: number;
    purplePercent: number;
    bluePercent: number;
    avgValue: number;
    volatility: number;
    trend: 'UP' | 'DOWN' | 'FLAT';
    streak: number;
    nextIsGreen: boolean;
}

function analyzeWindow(memory: number[], nextValue: number): WindowAnalysis {
    const purples = memory.filter(v => v >= 2.0).length;
    const blues = memory.filter(v => v < 2.0).length;
    const purplePercent = (purples / memory.length) * 100;
    const bluePercent = (blues / memory.length) * 100;
    
    const avgValue = memory.reduce((a, b) => a + b, 0) / memory.length;
    
    // Volatilidade: desvio padrão
    const variance = memory.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / memory.length;
    const volatility = Math.sqrt(variance);
    
    // Tendência: comparar primeira metade vs segunda metade
    const firstHalf = memory.slice(0, Math.floor(memory.length / 2));
    const secondHalf = memory.slice(Math.floor(memory.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
    if (avgSecond > avgFirst * 1.1) trend = 'UP';
    else if (avgSecond < avgFirst * 0.9) trend = 'DOWN';
    
    // Streak: quantos purples consecutivos no final
    let streak = 0;
    for (let i = 0; i < memory.length; i++) {
        if (memory[i] >= 2.0) streak++;
        else break;
    }
    
    return {
        index: 0,
        purplePercent,
        bluePercent,
        avgValue,
        volatility,
        trend,
        streak,
        nextIsGreen: nextValue >= 2.0
    };
}

console.log(`\n${'='.repeat(80)}`);
console.log(`ANÁLISE DE MOMENTUM E CICLOS`);
console.log(`${'='.repeat(80)}\n`);

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
    
    // Analisar todas as janelas
    const windows: WindowAnalysis[] = [];
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        const analysis = analyzeWindow(memory, nextValue);
        analysis.index = i;
        windows.push(analysis);
    }
    
    // Estatísticas gerais
    const greens = windows.filter(w => w.nextIsGreen).length;
    const losses = windows.length - greens;
    const baseline = (greens / windows.length) * 100;
    
    console.log(`\n📈 BASELINE:`);
    console.log(`   Total: ${windows.length} rodadas`);
    console.log(`   Greens: ${greens} (${baseline.toFixed(1)}%)`);
    console.log(`   Losses: ${losses}`);
    
    // Análise 1: CICLOS DE PAGAMENTO
    // Identificar sequências de 5+ greens consecutivos
    console.log(`\n🔄 CICLOS DE PAGAMENTO (5+ greens consecutivos):`);
    
    let cycleStart = -1;
    let cycleLength = 0;
    const cycles: { start: number; end: number; length: number; greens: number }[] = [];
    
    for (let i = 0; i < windows.length; i++) {
        if (windows[i].nextIsGreen) {
            if (cycleStart === -1) cycleStart = i;
            cycleLength++;
        } else {
            if (cycleLength >= 5) {
                cycles.push({
                    start: cycleStart,
                    end: cycleStart + cycleLength - 1,
                    length: cycleLength,
                    greens: cycleLength
                });
            }
            cycleStart = -1;
            cycleLength = 0;
        }
    }
    
    // Último ciclo
    if (cycleLength >= 5) {
        cycles.push({
            start: cycleStart,
            end: cycleStart + cycleLength - 1,
            length: cycleLength,
            greens: cycleLength
        });
    }
    
    console.log(`   Total de ciclos: ${cycles.length}`);
    if (cycles.length > 0) {
        cycles.forEach((cycle, idx) => {
            console.log(`   Ciclo ${idx + 1}: Rodadas ${cycle.start}-${cycle.end} (${cycle.length} greens)`);
            
            // Características NO INÍCIO do ciclo
            const startWindow = windows[cycle.start];
            console.log(`      INÍCIO: Purple=${startWindow.purplePercent.toFixed(0)}%, Streak=${startWindow.streak}, Trend=${startWindow.trend}, Vol=${startWindow.volatility.toFixed(1)}`);
            
            // Características NO FIM do ciclo
            const endWindow = windows[cycle.end];
            console.log(`      FIM: Purple=${endWindow.purplePercent.toFixed(0)}%, Streak=${endWindow.streak}, Trend=${endWindow.trend}, Vol=${endWindow.volatility.toFixed(1)}`);
        });
    }
    
    // Análise 2: CONDIÇÕES QUE LEVAM A GREEN
    console.log(`\n✅ CONDIÇÕES QUE LEVAM A GREEN:`);
    
    // Purple% alta
    const highPurple = windows.filter(w => w.purplePercent >= 60);
    const highPurpleGreens = highPurple.filter(w => w.nextIsGreen).length;
    const highPurpleAccuracy = highPurple.length > 0 ? (highPurpleGreens / highPurple.length) * 100 : 0;
    console.log(`   Purple% ≥60: ${highPurple.length} rodadas, ${highPurpleAccuracy.toFixed(1)}% greens`);
    
    // Streak alto
    const highStreak = windows.filter(w => w.streak >= 3);
    const highStreakGreens = highStreak.filter(w => w.nextIsGreen).length;
    const highStreakAccuracy = highStreak.length > 0 ? (highStreakGreens / highStreak.length) * 100 : 0;
    console.log(`   Streak ≥3: ${highStreak.length} rodadas, ${highStreakAccuracy.toFixed(1)}% greens`);
    
    // Trend UP
    const trendUp = windows.filter(w => w.trend === 'UP');
    const trendUpGreens = trendUp.filter(w => w.nextIsGreen).length;
    const trendUpAccuracy = trendUp.length > 0 ? (trendUpGreens / trendUp.length) * 100 : 0;
    console.log(`   Trend UP: ${trendUp.length} rodadas, ${trendUpAccuracy.toFixed(1)}% greens`);
    
    // Volatilidade baixa
    const lowVol = windows.filter(w => w.volatility < 2.0);
    const lowVolGreens = lowVol.filter(w => w.nextIsGreen).length;
    const lowVolAccuracy = lowVol.length > 0 ? (lowVolGreens / lowVol.length) * 100 : 0;
    console.log(`   Volatilidade <2: ${lowVol.length} rodadas, ${lowVolAccuracy.toFixed(1)}% greens`);
    
    // Análise 3: CONDIÇÕES QUE LEVAM A LOSS
    console.log(`\n❌ CONDIÇÕES QUE LEVAM A LOSS:`);
    
    // Blue% alta
    const highBlue = windows.filter(w => w.bluePercent >= 60);
    const highBlueLosses = highBlue.filter(w => !w.nextIsGreen).length;
    const highBlueLossRate = highBlue.length > 0 ? (highBlueLosses / highBlue.length) * 100 : 0;
    console.log(`   Blue% ≥60: ${highBlue.length} rodadas, ${highBlueLossRate.toFixed(1)}% losses`);
    
    // Streak baixo
    const lowStreak = windows.filter(w => w.streak === 0);
    const lowStreakLosses = lowStreak.filter(w => !w.nextIsGreen).length;
    const lowStreakLossRate = lowStreak.length > 0 ? (lowStreakLosses / lowStreak.length) * 100 : 0;
    console.log(`   Streak=0: ${lowStreak.length} rodadas, ${lowStreakLossRate.toFixed(1)}% losses`);
    
    // Trend DOWN
    const trendDown = windows.filter(w => w.trend === 'DOWN');
    const trendDownLosses = trendDown.filter(w => !w.nextIsGreen).length;
    const trendDownLossRate = trendDown.length > 0 ? (trendDownLosses / trendDown.length) * 100 : 0;
    console.log(`   Trend DOWN: ${trendDown.length} rodadas, ${trendDownLossRate.toFixed(1)}% losses`);
    
    // Volatilidade alta
    const highVol = windows.filter(w => w.volatility >= 5.0);
    const highVolLosses = highVol.filter(w => !w.nextIsGreen).length;
    const highVolLossRate = highVol.length > 0 ? (highVolLosses / highVol.length) * 100 : 0;
    console.log(`   Volatilidade ≥5: ${highVol.length} rodadas, ${highVolLossRate.toFixed(1)}% losses`);
    
    // Análise 4: MELHOR COMBINAÇÃO
    console.log(`\n🎯 TESTANDO COMBINAÇÕES:`);
    
    const combinations = [
        {
            name: 'Purple≥60 + Streak≥2',
            filter: (w: WindowAnalysis) => w.purplePercent >= 60 && w.streak >= 2
        },
        {
            name: 'Purple≥60 + Trend=UP',
            filter: (w: WindowAnalysis) => w.purplePercent >= 60 && w.trend === 'UP'
        },
        {
            name: 'Streak≥3 + Vol<3',
            filter: (w: WindowAnalysis) => w.streak >= 3 && w.volatility < 3
        },
        {
            name: 'Purple≥55 + Streak≥2 + Vol<4',
            filter: (w: WindowAnalysis) => w.purplePercent >= 55 && w.streak >= 2 && w.volatility < 4
        },
        {
            name: 'Trend=UP + Streak≥2',
            filter: (w: WindowAnalysis) => w.trend === 'UP' && w.streak >= 2
        },
        {
            name: 'Purple≥50 + Blue<45 + Streak≥1',
            filter: (w: WindowAnalysis) => w.purplePercent >= 50 && w.bluePercent < 45 && w.streak >= 1
        }
    ];
    
    let bestCombo = { name: '', plays: 0, greens: 0, accuracy: 0, profit: 0 };
    
    combinations.forEach(combo => {
        const filtered = windows.filter(combo.filter);
        const comboGreens = filtered.filter(w => w.nextIsGreen).length;
        const comboAccuracy = filtered.length > 0 ? (comboGreens / filtered.length) * 100 : 0;
        const profit = (comboGreens - (filtered.length - comboGreens)) * 100;
        
        console.log(`   ${combo.name}:`);
        console.log(`      Jogadas: ${filtered.length}, Greens: ${comboGreens}, Assertividade: ${comboAccuracy.toFixed(1)}%, Lucro: R$ ${profit.toFixed(2)}`);
        
        if (profit > bestCombo.profit) {
            bestCombo = {
                name: combo.name,
                plays: filtered.length,
                greens: comboGreens,
                accuracy: comboAccuracy,
                profit
            };
        }
    });
    
    console.log(`\n🏆 MELHOR COMBINAÇÃO PARA ESTE GRAFO:`);
    console.log(`   ${bestCombo.name}`);
    console.log(`   Jogadas: ${bestCombo.plays}, Assertividade: ${bestCombo.accuracy.toFixed(1)}%, Lucro: R$ ${bestCombo.profit.toFixed(2)}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(80)}\n`);
