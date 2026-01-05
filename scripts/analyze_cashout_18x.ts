/**
 * ANÁLISE: TIRAR NO 1.8x AO INVÉS DE 2.0x
 * 
 * Estratégia ROXA:
 * - Jogar quando Purple% ≥60 + Streak ≥2 + Trend UP
 * - MAS tirar no 1.8x (não esperar 2.0x)
 * 
 * Ganho: R$ 180 (ao invés de R$ 200)
 * Breakeven: 35.7% (ao invés de 50%)
 */

import fs from 'fs';
import path from 'path';

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

console.log(`\n${'='.repeat(120)}`);
console.log(`ANÁLISE: TIRAR NO 1.8x AO INVÉS DE 2.0x`);
console.log(`${'='.repeat(120)}\n`);

// Comparar diferentes cashouts
const cashouts = [
  { name: '1.5x', threshold: 1.5, ganho: 150, breakeven: 40.0 },
  { name: '1.6x', threshold: 1.6, ganho: 160, breakeven: 38.5 },
  { name: '1.7x', threshold: 1.7, ganho: 170, breakeven: 37.0 },
  { name: '1.8x', threshold: 1.8, ganho: 180, breakeven: 35.7 },
  { name: '1.9x', threshold: 1.9, ganho: 190, breakeven: 34.5 },
  { name: '2.0x', threshold: 2.0, ganho: 200, breakeven: 33.3 }
];

for (const cashout of cashouts) {
  console.log(`\n${'─'.repeat(120)}`);
  console.log(`🎯 CASHOUT: ${cashout.name} (≥${cashout.threshold}x) - Ganho: R$ ${cashout.ganho} - Breakeven: ${cashout.breakeven.toFixed(1)}%`);
  console.log(`${'─'.repeat(120)}\n`);
  
  let totalJogadas = 0, totalGreens = 0, totalInvestido = 0, totalRecebido = 0;
  
  for (const file of files) {
    const filepath = path.join(graphsDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    const chronological = [...graphValues].reverse();
    const MEMORY_SIZE = 25;
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    let jogadas = 0, greens = 0, investido = 0, recebido = 0;
    
    for (let i = 0; i < totalRounds; i++) {
      const memory = chronological.slice(i, i + MEMORY_SIZE);
      const nextValue = chronological[i + MEMORY_SIZE];
      
      // Calcular métricas
      const purples = memory.filter(v => v >= 2.0).length;
      const purplePercent = (purples / 25) * 100;
      
      let streak = 0;
      for (let j = 0; j < memory.length; j++) {
        if (memory[j] >= 2.0) streak++;
        else break;
      }
      
      const firstHalf = memory.slice(0, 12);
      const secondHalf = memory.slice(13, 25);
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      let trend = 'FLAT';
      if (avgFirst > avgSecond * 1.1) trend = 'UP';
      else if (avgFirst < avgSecond * 0.9) trend = 'DOWN';
      
      // Decisão: mesma lógica
      const playRoxa = purplePercent >= 60 && streak >= 2 && trend === 'UP';
      
      if (playRoxa) {
        jogadas++;
        investido += 100;
        
        // Verificar se atingiu cashout
        if (nextValue >= cashout.threshold) {
          greens++;
          recebido += cashout.ganho;
        }
      }
    }
    
    totalJogadas += jogadas;
    totalGreens += greens;
    totalInvestido += investido;
    totalRecebido += recebido;
  }
  
  const totalLucro = totalRecebido - totalInvestido;
  const totalAssertividade = totalJogadas > 0 ? (totalGreens / totalJogadas * 100) : 0;
  const roi = totalInvestido > 0 ? (totalLucro / totalInvestido * 100) : 0;
  
  console.log(`📊 RESULTADOS:`);
  console.log(`   Jogadas: ${totalJogadas}`);
  console.log(`   Greens: ${totalGreens} (${totalAssertividade.toFixed(1)}%)`);
  console.log(`   Losses: ${totalJogadas - totalGreens}`);
  console.log(`   Investido: R$ ${totalInvestido.toFixed(2)}`);
  console.log(`   Recebido: R$ ${totalRecebido.toFixed(2)}`);
  console.log(`   LUCRO: R$ ${totalLucro.toFixed(2)}`);
  console.log(`   ROI: ${roi.toFixed(1)}%`);
  console.log();
  
  const status = totalAssertividade >= cashout.breakeven ? '✅ LUCRATIVO' : '❌ PREJUÍZO';
  const diff = totalAssertividade - cashout.breakeven;
  console.log(`   Breakeven: ${cashout.breakeven.toFixed(1)}%`);
  console.log(`   Diferença: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`);
  console.log(`   Status: ${status}`);
  console.log();
}

// Comparação: melhor cashout
console.log(`\n${'='.repeat(120)}`);
console.log(`COMPARAÇÃO: QUAL O MELHOR CASHOUT?`);
console.log(`${'='.repeat(120)}\n`);

const results: any[] = [];

for (const cashout of cashouts) {
  let totalJogadas = 0, totalGreens = 0, totalInvestido = 0, totalRecebido = 0;
  
  for (const file of files) {
    const filepath = path.join(graphsDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    const chronological = [...graphValues].reverse();
    const MEMORY_SIZE = 25;
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    for (let i = 0; i < totalRounds; i++) {
      const memory = chronological.slice(i, i + MEMORY_SIZE);
      const nextValue = chronological[i + MEMORY_SIZE];
      
      const purples = memory.filter(v => v >= 2.0).length;
      const purplePercent = (purples / 25) * 100;
      
      let streak = 0;
      for (let j = 0; j < memory.length; j++) {
        if (memory[j] >= 2.0) streak++;
        else break;
      }
      
      const firstHalf = memory.slice(0, 12);
      const secondHalf = memory.slice(13, 25);
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      let trend = 'FLAT';
      if (avgFirst > avgSecond * 1.1) trend = 'UP';
      else if (avgFirst < avgSecond * 0.9) trend = 'DOWN';
      
      const playRoxa = purplePercent >= 60 && streak >= 2 && trend === 'UP';
      
      if (playRoxa) {
        totalJogadas++;
        totalInvestido += 100;
        
        if (nextValue >= cashout.threshold) {
          totalGreens++;
          totalRecebido += cashout.ganho;
        }
      }
    }
  }
  
  const totalLucro = totalRecebido - totalInvestido;
  const totalAssertividade = totalJogadas > 0 ? (totalGreens / totalJogadas * 100) : 0;
  const roi = totalInvestido > 0 ? (totalLucro / totalInvestido * 100) : 0;
  
  results.push({
    cashout: cashout.name,
    jogadas: totalJogadas,
    greens: totalGreens,
    assertividade: totalAssertividade,
    lucro: totalLucro,
    roi
  });
}

// Ordenar por lucro
results.sort((a, b) => b.lucro - a.lucro);

console.log(`Ranking por LUCRO:\n`);
results.forEach((r, i) => {
  console.log(`   ${i + 1}. ${r.cashout}: R$ ${r.lucro.toFixed(2)} (${r.assertividade.toFixed(1)}% assert., ${r.roi.toFixed(1)}% ROI)`);
});

console.log(`\n${'='.repeat(120)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(120)}\n`);
