/**
 * ANÁLISE: PREDIÇÃO DE MULTIPLICADORES ROXOS
 * 
 * Objetivo: Descobrir se conseguimos prever ATÉ ONDE a vela vai
 * Se prevermos até 3x: lucro aumenta 2x
 * Se prevermos até 4x: lucro aumenta 3x
 * Se prevermos até 5x: lucro aumenta 4x
 */

import fs from 'fs';
import path from 'path';

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

console.log(`\n${'='.repeat(120)}`);
console.log(`ANÁLISE: PREDIÇÃO DE MULTIPLICADORES ROXOS`);
console.log(`${'='.repeat(120)}\n`);

// Testar diferentes targets
const targets = [
  { name: '2x', threshold: 2.0, ganho: 200 },
  { name: '3x', threshold: 3.0, ganho: 300 },
  { name: '4x', threshold: 4.0, ganho: 400 },
  { name: '5x', threshold: 5.0, ganho: 500 }
];

for (const target of targets) {
  console.log(`\n${'─'.repeat(120)}`);
  console.log(`🎯 TARGET: ${target.name} (≥${target.threshold}x) - Ganho: R$ ${target.ganho}`);
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
        
        // Verificar se atingiu target
        if (nextValue >= target.threshold) {
          greens++;
          recebido += target.ganho;
        }
      }
    }
    
    const lucro = recebido - investido;
    const assertividade = jogadas > 0 ? (greens / jogadas * 100) : 0;
    
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
  
  // Breakeven
  const breakeven = (100 / target.ganho) * 100;
  console.log(`   Breakeven: ${breakeven.toFixed(1)}%`);
  console.log(`   Status: ${totalAssertividade >= breakeven ? '✅ LUCRATIVO' : '❌ PREJUÍZO'}`);
  console.log();
}

// Análise: distribuição de valores quando jogamos
console.log(`\n${'='.repeat(120)}`);
console.log(`ANÁLISE: DISTRIBUIÇÃO DE VALORES QUANDO JOGAMOS ROXA`);
console.log(`${'='.repeat(120)}\n`);

const distribution: { [key: string]: number } = {
  '<2x (blue)': 0,
  '2-3x': 0,
  '3-4x': 0,
  '4-5x': 0,
  '5-10x': 0,
  '≥10x (rosa)': 0
};

let totalPlays = 0;

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
      totalPlays++;
      
      if (nextValue < 2.0) distribution['<2x (blue)']++;
      else if (nextValue < 3.0) distribution['2-3x']++;
      else if (nextValue < 4.0) distribution['3-4x']++;
      else if (nextValue < 5.0) distribution['4-5x']++;
      else if (nextValue < 10.0) distribution['5-10x']++;
      else distribution['≥10x (rosa)']++;
    }
  }
}

console.log(`Total de jogadas ROXA: ${totalPlays}\n`);

for (const [range, count] of Object.entries(distribution)) {
  const percent = (count / totalPlays * 100).toFixed(1);
  console.log(`   ${range}: ${count} (${percent}%)`);
}

console.log(`\n${'='.repeat(120)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(120)}\n`);
