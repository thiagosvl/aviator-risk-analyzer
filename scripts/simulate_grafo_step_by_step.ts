/**
 * SIMULAÇÃO RODADA POR RODADA
 * Mostrar EXATAMENTE o que acontece em cada rodada
 */

import fs from 'fs';
import path from 'path';

const graphFile = '4_143.txt'; // Grafo lucrativo
const graphsDir = 'GRAFOS_TESTE';

const filepath = path.join(graphsDir, graphFile);
const content = fs.readFileSync(filepath, 'utf-8');
const graphValues = content.split('\n')
    .map(line => parseFloat(line.trim()))
    .filter(v => !isNaN(v));

const chronological = [...graphValues].reverse();
const MEMORY_SIZE = 25;

console.log(`\n${'='.repeat(100)}`);
console.log(`SIMULAÇÃO RODADA POR RODADA - GRAFO ${graphFile}`);
console.log(`${'='.repeat(100)}\n`);

console.log(`Total de velas no grafo: ${chronological.length}`);
console.log(`Rodadas simuláveis: ${chronological.length - MEMORY_SIZE}\n`);

// Estratégia ROSA
let rosaJogadas = 0, rosaGreens = 0, rosaLosses = 0;
let rosaInvestido = 0, rosaRecebido = 0;

// Estratégia ROXA
let roxaJogadas = 0, roxaGreens = 0, roxaLosses = 0;
let roxaInvestido = 0, roxaRecebido = 0;

const totalRounds = chronological.length - MEMORY_SIZE;

// Mostrar primeiras 30 rodadas em detalhes
const SHOW_DETAILS = 30;

for (let i = 0; i < totalRounds; i++) {
    const memory = chronological.slice(i, i + MEMORY_SIZE);
    const nextValue = chronological[i + MEMORY_SIZE];
    
    // Calcular métricas da janela
    const purples = memory.filter(v => v >= 2.0).length;
    const blues = memory.filter(v => v < 2.0).length;
    const pinks = memory.filter(v => v >= 10.0).length;
    
    const purplePercent = (purples / 25) * 100;
    const bluePercent = (blues / 25) * 100;
    const pinkPercent = (pinks / 25) * 100;
    
    // Streak
    let streak = 0;
    for (let j = 0; j < memory.length; j++) {
        if (memory[j] >= 2.0) streak++;
        else break;
    }
    
    // Volatilidade
    const avgValue = memory.reduce((a, b) => a + b, 0) / 25;
    const variance = memory.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / 25;
    const volatility = Math.sqrt(variance);
    
    // Trend
    const firstHalf = memory.slice(0, 12);
    const secondHalf = memory.slice(13);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trend = 'FLAT';
    if (avgSecond > avgFirst * 1.1) trend = 'UP';
    else if (avgSecond < avgFirst * 0.9) trend = 'DOWN';
    
    // DECISÃO ROSA
    let decideRosa = false;
    let motivoRosa = '';
    
    if (pinkPercent >= 8 && volatility >= 10) {
        decideRosa = true;
        motivoRosa = `Pink%=${pinkPercent.toFixed(0)}% + Vol=${volatility.toFixed(1)}`;
    } else if (pinkPercent >= 8) {
        decideRosa = true;
        motivoRosa = `Pink%=${pinkPercent.toFixed(0)}%`;
    }
    
    // DECISÃO ROXA
    let decideRoxa = false;
    let motivoRoxa = '';
    
    if (purplePercent >= 60 && streak >= 2 && trend === 'UP') {
        decideRoxa = true;
        motivoRoxa = `Purple%=${purplePercent.toFixed(0)}% + Streak=${streak} + Trend=${trend}`;
    }
    
    // Executar apostas
    const isRosaGreen = nextValue >= 10.0;
    const isRoxaGreen = nextValue >= 2.0;
    
    if (decideRosa) {
        rosaJogadas++;
        rosaInvestido += 100;
        if (isRosaGreen) {
            rosaGreens++;
            rosaRecebido += 1000; // Aposta R$ 100, ganha R$ 1.000
        } else {
            rosaLosses++;
        }
    }
    
    if (decideRoxa) {
        roxaJogadas++;
        roxaInvestido += 100;
        if (isRoxaGreen) {
            roxaGreens++;
            roxaRecebido += 200; // Aposta R$ 100, ganha R$ 200
        } else {
            roxaLosses++;
        }
    }
    
    // Mostrar detalhes das primeiras rodadas
    if (i < SHOW_DETAILS) {
        console.log(`${'─'.repeat(100)}`);
        console.log(`RODADA ${i + 1}:`);
        console.log(`   Janela: [${memory.slice(0, 5).map(v => v.toFixed(1)).join(', ')}, ..., ${memory.slice(-3).map(v => v.toFixed(1)).join(', ')}]`);
        console.log(`   Próxima vela: ${nextValue.toFixed(2)}x`);
        console.log();
        console.log(`   Métricas:`);
        console.log(`      Purple%: ${purplePercent.toFixed(0)}% (${purples}/25)`);
        console.log(`      Blue%: ${bluePercent.toFixed(0)}% (${blues}/25)`);
        console.log(`      Pink%: ${pinkPercent.toFixed(0)}% (${pinks}/25)`);
        console.log(`      Streak: ${streak}`);
        console.log(`      Trend: ${trend}`);
        console.log(`      Volatilidade: ${volatility.toFixed(1)}`);
        console.log();
        
        if (decideRosa) {
            const resultado = isRosaGreen ? '✅ GREEN' : '❌ LOSS';
            console.log(`   🌸 ROSA: JOGAR! (${motivoRosa}) → ${resultado}`);
        } else {
            console.log(`   🌸 ROSA: AGUARDAR (Pink%=${pinkPercent.toFixed(0)}%, Vol=${volatility.toFixed(1)})`);
        }
        
        if (decideRoxa) {
            const resultado = isRoxaGreen ? '✅ GREEN' : '❌ LOSS';
            console.log(`   🟣 ROXA: JOGAR! (${motivoRoxa}) → ${resultado}`);
        } else {
            console.log(`   🟣 ROXA: AGUARDAR (Purple%=${purplePercent.toFixed(0)}%, Streak=${streak}, Trend=${trend})`);
        }
        
        console.log();
    }
}

console.log(`\n${'='.repeat(100)}`);
console.log(`RESUMO FINAL`);
console.log(`${'='.repeat(100)}\n`);

console.log(`🌸 ESTRATÉGIA ROSA (Pink% ≥8%):`);
console.log(`   Jogadas: ${rosaJogadas}`);
console.log(`   Greens: ${rosaGreens} (${rosaJogadas > 0 ? ((rosaGreens / rosaJogadas) * 100).toFixed(1) : 0}%)`);
console.log(`   Losses: ${rosaLosses}`);
console.log(`   Investido: R$ ${rosaInvestido.toFixed(2)}`);
console.log(`   Recebido: R$ ${rosaRecebido.toFixed(2)}`);
console.log(`   Lucro: R$ ${(rosaRecebido - rosaInvestido).toFixed(2)}`);
console.log();

console.log(`🟣 ESTRATÉGIA ROXA (Purple% ≥60 + Streak ≥2 + Trend UP):`);
console.log(`   Jogadas: ${roxaJogadas}`);
console.log(`   Greens: ${roxaGreens} (${roxaJogadas > 0 ? ((roxaGreens / roxaJogadas) * 100).toFixed(1) : 0}%)`);
console.log(`   Losses: ${roxaLosses}`);
console.log(`   Investido: R$ ${roxaInvestido.toFixed(2)}`);
console.log(`   Recebido: R$ ${roxaRecebido.toFixed(2)}`);
console.log(`   Lucro: R$ ${(roxaRecebido - roxaInvestido).toFixed(2)}`);
console.log();

console.log(`💰 TOTAL:`);
console.log(`   Investido: R$ ${(rosaInvestido + roxaInvestido).toFixed(2)}`);
console.log(`   Recebido: R$ ${(rosaRecebido + roxaRecebido).toFixed(2)}`);
console.log(`   Lucro: R$ ${(rosaRecebido + roxaRecebido - rosaInvestido - roxaInvestido).toFixed(2)}`);
console.log();
