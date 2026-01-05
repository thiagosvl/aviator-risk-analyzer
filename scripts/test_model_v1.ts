/**
 * TESTE DO MODELO V1 EM TODOS OS 10 GRAFOS
 */

import fs from 'fs';
import path from 'path';

// Importar modelo (simulado aqui)
interface Decision {
  playRosa: boolean;
  playRoxa: boolean;
  motivoRosa?: string;
  motivoRoxa?: string;
}

function analyzeWindow(memory: number[]): Decision {
  const purples = memory.filter(v => v >= 2.0).length;
  const purplePercent = (purples / 25) * 100;
  
  const lastValue = memory[0];
  const lastIsBlue = lastValue < 2.0;
  
  let streak = 0;
  for (let i = 0; i < memory.length; i++) {
    if (memory[i] >= 2.0) streak++;
    else break;
  }
  
  const firstHalf = memory.slice(0, 12);
  const secondHalf = memory.slice(13, 25);
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trend = 'FLAT';
  if (avgFirst > avgSecond * 1.1) trend = 'UP';
  else if (avgFirst < avgSecond * 0.9) trend = 'DOWN';
  
  const playRosa = lastIsBlue;
  const motivoRosa = playRosa ? `Última vela = ${lastValue.toFixed(2)}x < 2x` : '';
  
  const playRoxa = purplePercent >= 60 && streak >= 2 && trend === 'UP';
  const motivoRoxa = playRoxa ? `Purple%=${purplePercent.toFixed(0)}% + Streak=${streak} + Trend=${trend}` : '';
  
  return { playRosa, playRoxa, motivoRosa, motivoRoxa };
}

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

console.log(`\n${'='.repeat(120)}`);
console.log(`TESTE DO MODELO V1 - TODOS OS GRAFOS`);
console.log(`${'='.repeat(120)}\n`);

let totalRosaJogadas = 0, totalRosaGreens = 0, totalRosaSaldo = 0;
let totalRoxaJogadas = 0, totalRoxaGreens = 0, totalRoxaSaldo = 0;

for (const file of files) {
  const filepath = path.join(graphsDir, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  const graphValues = content.split('\n')
      .map(line => parseFloat(line.trim()))
      .filter(v => !isNaN(v));
  
  const chronological = [...graphValues].reverse();
  const MEMORY_SIZE = 25;
  const totalRounds = chronological.length - MEMORY_SIZE;
  
  let rosaJogadas = 0, rosaGreens = 0, rosaInvestido = 0, rosaRecebido = 0;
  let roxaJogadas = 0, roxaGreens = 0, roxaInvestido = 0, roxaRecebido = 0;
  
  for (let i = 0; i < totalRounds; i++) {
    const memory = chronological.slice(i, i + MEMORY_SIZE);
    const nextValue = chronological[i + MEMORY_SIZE];
    
    const decision = analyzeWindow(memory);
    
    if (decision.playRosa) {
      rosaJogadas++;
      rosaInvestido += 50;
      if (nextValue >= 10.0) {
        rosaGreens++;
        rosaRecebido += 500;
      }
    }
    
    if (decision.playRoxa) {
      roxaJogadas++;
      roxaInvestido += 100;
      if (nextValue >= 2.0) {
        roxaGreens++;
        roxaRecebido += 200;
      }
    }
  }
  
  const rosaLucro = rosaRecebido - rosaInvestido;
  const roxaLucro = roxaRecebido - roxaInvestido;
  const lucroTotal = rosaLucro + roxaLucro;
  
  const rosaAssert = rosaJogadas > 0 ? (rosaGreens / rosaJogadas * 100) : 0;
  const roxaAssert = roxaJogadas > 0 ? (roxaGreens / roxaJogadas * 100) : 0;
  
  console.log(`📊 ${file}:`);
  console.log(`   Rodadas: ${totalRounds}`);
  console.log();
  console.log(`   🌸 ROSA: ${rosaJogadas} jogadas, ${rosaGreens} greens (${rosaAssert.toFixed(1)}%), Lucro: R$ ${rosaLucro.toFixed(2)}`);
  console.log(`   🟣 ROXA: ${roxaJogadas} jogadas, ${roxaGreens} greens (${roxaAssert.toFixed(1)}%), Lucro: R$ ${roxaLucro.toFixed(2)}`);
  console.log(`   💰 TOTAL: R$ ${lucroTotal.toFixed(2)}`);
  console.log();
  
  totalRosaJogadas += rosaJogadas;
  totalRosaGreens += rosaGreens;
  totalRosaSaldo += rosaLucro;
  
  totalRoxaJogadas += roxaJogadas;
  totalRoxaGreens += roxaGreens;
  totalRoxaSaldo += roxaLucro;
}

const totalAssertRosa = totalRosaJogadas > 0 ? (totalRosaGreens / totalRosaJogadas * 100) : 0;
const totalAssertRoxa = totalRoxaJogadas > 0 ? (totalRoxaGreens / totalRoxaJogadas * 100) : 0;
const totalSaldo = totalRosaSaldo + totalRoxaSaldo;

console.log(`${'='.repeat(120)}`);
console.log(`RESUMO GERAL - 10 GRAFOS`);
console.log(`${'='.repeat(120)}\n`);

console.log(`🌸 ROSA (Última vela < 2x):`);
console.log(`   Jogadas: ${totalRosaJogadas}`);
console.log(`   Greens: ${totalRosaGreens} (${totalAssertRosa.toFixed(1)}%)`);
console.log(`   Losses: ${totalRosaJogadas - totalRosaGreens}`);
console.log(`   Investido: R$ ${(totalRosaJogadas * 50).toFixed(2)}`);
console.log(`   Recebido: R$ ${(totalRosaGreens * 500).toFixed(2)}`);
console.log(`   Lucro: R$ ${totalRosaSaldo.toFixed(2)}`);
console.log(`   ROI: ${totalRosaJogadas > 0 ? ((totalRosaSaldo / (totalRosaJogadas * 50)) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`🟣 ROXA (Purple% ≥60 + Streak ≥2 + Trend UP):`);
console.log(`   Jogadas: ${totalRoxaJogadas}`);
console.log(`   Greens: ${totalRoxaGreens} (${totalAssertRoxa.toFixed(1)}%)`);
console.log(`   Losses: ${totalRoxaJogadas - totalRoxaGreens}`);
console.log(`   Investido: R$ ${(totalRoxaJogadas * 100).toFixed(2)}`);
console.log(`   Recebido: R$ ${(totalRoxaGreens * 200).toFixed(2)}`);
console.log(`   Lucro: R$ ${totalRoxaSaldo.toFixed(2)}`);
console.log(`   ROI: ${totalRoxaJogadas > 0 ? ((totalRoxaSaldo / (totalRoxaJogadas * 100)) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`💰 TOTAL:`);
console.log(`   Jogadas: ${totalRosaJogadas + totalRoxaJogadas}`);
console.log(`   Greens: ${totalRosaGreens + totalRoxaGreens}`);
console.log(`   Assertividade: ${((totalRosaGreens + totalRoxaGreens) / (totalRosaJogadas + totalRoxaJogadas) * 100).toFixed(1)}%`);
console.log(`   Investido: R$ ${(totalRosaJogadas * 50 + totalRoxaJogadas * 100).toFixed(2)}`);
console.log(`   Recebido: R$ ${(totalRosaGreens * 500 + totalRoxaGreens * 200).toFixed(2)}`);
console.log(`   LUCRO: R$ ${totalSaldo.toFixed(2)}`);
console.log(`   ROI: ${((totalSaldo / (totalRosaJogadas * 50 + totalRoxaJogadas * 100)) * 100).toFixed(1)}%`);
console.log();

console.log(`📊 CONTRIBUIÇÃO:`);
console.log(`   ROSA: ${((totalRosaSaldo / totalSaldo) * 100).toFixed(1)}% do lucro`);
console.log(`   ROXA: ${((totalRoxaSaldo / totalSaldo) * 100).toFixed(1)}% do lucro`);
console.log();
