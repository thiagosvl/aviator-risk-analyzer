/**
 * SIMULAÇÃO COMPLETA LINHA POR LINHA
 * Mostrar TODAS as rodadas de um grafo com decisões e resultados
 */

import fs from 'fs';
import path from 'path';

const graphFile = '4_143.txt'; // Grafo exemplo
const graphsDir = 'GRAFOS_TESTE';

const filepath = path.join(graphsDir, graphFile);
const content = fs.readFileSync(filepath, 'utf-8');
const graphValues = content.split('\n')
    .map(line => parseFloat(line.trim()))
    .filter(v => !isNaN(v));

const chronological = [...graphValues].reverse();
const MEMORY_SIZE = 25;

const APOSTA_ROXA = 100;
const APOSTA_ROSA = 50;
const GANHO_ROXA = 200;
const GANHO_ROSA = 500;

console.log(`\n${'='.repeat(120)}`);
console.log(`SIMULAÇÃO COMPLETA - GRAFO ${graphFile}`);
console.log(`${'='.repeat(120)}\n`);

console.log(`Total de velas: ${chronological.length}`);
console.log(`Rodadas simuláveis: ${chronological.length - MEMORY_SIZE}\n`);

console.log(`REGRAS:`);
console.log(`   ROSA: Jogar quando última vela < 2x (blue)`);
console.log(`   ROXA: Jogar quando Purple% ≥60 E Streak ≥2 E Trend=UP\n`);

console.log(`VALORES:`);
console.log(`   Aposta ROSA: R$ ${APOSTA_ROSA} → Ganha R$ ${GANHO_ROSA} se ≥10.00x`);
console.log(`   Aposta ROXA: R$ ${APOSTA_ROXA} → Ganha R$ ${GANHO_ROXA} se ≥2.00x\n`);

let saldoRosa = 0, saldoRoxa = 0;
let jogadasRosa = 0, greensRosa = 0;
let jogadasRoxa = 0, greensRoxa = 0;

const totalRounds = chronological.length - MEMORY_SIZE;

for (let i = 0; i < totalRounds; i++) {
    const memory = chronological.slice(i, i + MEMORY_SIZE);
    const nextValue = chronological[i + MEMORY_SIZE];
    
    // Calcular métricas
    const purples = memory.filter(v => v >= 2.0).length;
    const blues = memory.filter(v => v < 2.0).length;
    const pinks = memory.filter(v => v >= 10.0).length; // CORRIGIDO: ≥10.0
    
    const purplePercent = (purples / 25) * 100;
    const bluePercent = (blues / 25) * 100;
    const pinkPercent = (pinks / 25) * 100;
    
    // Última vela
    const lastValue = memory[0];
    const lastIsBlue = lastValue < 2.0;
    
    // Streak
    let streak = 0;
    for (let j = 0; j < memory.length; j++) {
        if (memory[j] >= 2.0) streak++;
        else break;
    }
    
    // Trend
    const firstHalf = memory.slice(0, 12);
    const secondHalf = memory.slice(13);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trend = 'FLAT';
    if (avgSecond > avgFirst * 1.1) trend = 'UP';
    else if (avgSecond < avgFirst * 0.9) trend = 'DOWN';
    
    // DECISÃO ROSA
    let jogarRosa = false;
    let motivoRosa = '';
    
    if (lastIsBlue) {
        jogarRosa = true;
        motivoRosa = `Última vela = ${lastValue.toFixed(2)}x < 2x (blue)`;
    }
    
    // DECISÃO ROXA
    let jogarRoxa = false;
    let motivoRoxa = '';
    
    if (purplePercent >= 60 && streak >= 2 && trend === 'UP') {
        jogarRoxa = true;
        motivoRoxa = `Purple%=${purplePercent.toFixed(0)}% + Streak=${streak} + Trend=${trend}`;
    }
    
    // Executar apostas e calcular resultados
    const isRosaGreen = nextValue >= 10.0; // CORRIGIDO: ≥10.0
    const isRoxaGreen = nextValue >= 2.0;
    
    let resultadoRosa = '';
    let lucroRosa = 0;
    
    if (jogarRosa) {
        jogadasRosa++;
        saldoRosa -= APOSTA_ROSA;
        
        if (isRosaGreen) {
            greensRosa++;
            saldoRosa += GANHO_ROSA;
            lucroRosa = GANHO_ROSA - APOSTA_ROSA;
            resultadoRosa = `✅ GREEN! +R$ ${lucroRosa}`;
        } else {
            lucroRosa = -APOSTA_ROSA;
            resultadoRosa = `❌ LOSS -R$ ${APOSTA_ROSA}`;
        }
    }
    
    let resultadoRoxa = '';
    let lucroRoxa = 0;
    
    if (jogarRoxa) {
        jogadasRoxa++;
        saldoRoxa -= APOSTA_ROXA;
        
        if (isRoxaGreen) {
            greensRoxa++;
            saldoRoxa += GANHO_ROXA;
            lucroRoxa = GANHO_ROXA - APOSTA_ROXA;
            resultadoRoxa = `✅ GREEN! +R$ ${lucroRoxa}`;
        } else {
            lucroRoxa = -APOSTA_ROXA;
            resultadoRoxa = `❌ LOSS -R$ ${APOSTA_ROXA}`;
        }
    }
    
    // Mostrar linha
    console.log(`${'─'.repeat(120)}`);
    console.log(`RODADA ${i + 1}:`);
    console.log(`   Janela: [${memory.slice(0, 3).map(v => v.toFixed(2)).join(', ')}, ..., ${memory.slice(-3).map(v => v.toFixed(2)).join(', ')}]`);
    console.log(`   Próxima vela: ${nextValue.toFixed(2)}x`);
    console.log();
    console.log(`   Métricas: Purple%=${purplePercent.toFixed(0)}%, Blue%=${bluePercent.toFixed(0)}%, Pink%=${pinkPercent.toFixed(0)}%, Última=${lastValue.toFixed(2)}x, Streak=${streak}, Trend=${trend}`);
    console.log();
    
    if (jogarRosa) {
        console.log(`   🌸 ROSA: JOGAR R$ ${APOSTA_ROSA} (${motivoRosa})`);
        console.log(`      → ${resultadoRosa}`);
        console.log(`      → Saldo ROSA: R$ ${saldoRosa.toFixed(2)}`);
    } else {
        console.log(`   🌸 ROSA: AGUARDAR (Última vela = ${lastValue.toFixed(2)}x ≥ 2x)`);
    }
    
    if (jogarRoxa) {
        console.log(`   🟣 ROXA: JOGAR R$ ${APOSTA_ROXA} (${motivoRoxa})`);
        console.log(`      → ${resultadoRoxa}`);
        console.log(`      → Saldo ROXA: R$ ${saldoRoxa.toFixed(2)}`);
    } else {
        const razao = purplePercent < 60 ? `Purple%=${purplePercent.toFixed(0)}% < 60` :
                      streak < 2 ? `Streak=${streak} < 2` :
                      trend !== 'UP' ? `Trend=${trend} ≠ UP` :
                      'Condições não atendidas';
        console.log(`   🟣 ROXA: AGUARDAR (${razao})`);
    }
    
    console.log();
}

console.log(`\n${'='.repeat(120)}`);
console.log(`RESUMO FINAL`);
console.log(`${'='.repeat(120)}\n`);

const assertividadeRosa = jogadasRosa > 0 ? (greensRosa / jogadasRosa * 100) : 0;
const assertividadeRoxa = jogadasRoxa > 0 ? (greensRoxa / jogadasRoxa * 100) : 0;

console.log(`🌸 ESTRATÉGIA ROSA (Última vela < 2x):`);
console.log(`   Jogadas: ${jogadasRosa}`);
console.log(`   Greens: ${greensRosa} (${assertividadeRosa.toFixed(1)}%)`);
console.log(`   Losses: ${jogadasRosa - greensRosa}`);
console.log(`   Saldo final: R$ ${saldoRosa.toFixed(2)}`);
console.log();

console.log(`🟣 ESTRATÉGIA ROXA (Purple% ≥60 + Streak ≥2 + Trend UP):`);
console.log(`   Jogadas: ${jogadasRoxa}`);
console.log(`   Greens: ${greensRoxa} (${assertividadeRoxa.toFixed(1)}%)`);
console.log(`   Losses: ${jogadasRoxa - greensRoxa}`);
console.log(`   Saldo final: R$ ${saldoRoxa.toFixed(2)}`);
console.log();

console.log(`💰 SALDO TOTAL: R$ ${(saldoRosa + saldoRoxa).toFixed(2)}`);
console.log();
