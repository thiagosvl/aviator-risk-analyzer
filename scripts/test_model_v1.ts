/**
 * TESTE DO MODELO V1 EM TODOS OS 10 GRAFOS
 * Gera relatório completo com regras utilizadas
 */

import fs from 'fs';
import path from 'path';

// Capturar todo o output do console
let fullOutput = '';
const originalLog = console.log;
console.log = (...args: any[]) => {
  const message = args.join(' ');
  fullOutput += message + '\n';
  // originalLog(...args); // Silenciado conforme solicitado
};

// Configuração de Teste (AJUSTE AQUI)
const CONFIG = {
  rosa: {
    target: 10.0, // Multiplicador alvo (ex: 10.0x)
    bet: 50,      // Valor da aposta
  },
  roxa: {
    target: 2.0,  // Multiplicador alvo (ex: 2.0x)
    bet: 100,     // Valor da aposta
  }
};

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
console.log(`Configuração: Rosa ${CONFIG.rosa.target}x / Roxa ${CONFIG.roxa.target}x`);
console.log(`${'='.repeat(120)}\n`);

// Documentar regras utilizadas
console.log(`📋 REGRAS UTILIZADAS:\n`);
console.log(`🌸 ESTRATÉGIA ROSA (Agressiva):`);
console.log(`   Regra: Jogar quando última vela < 2.00x (blue)`);
console.log(`   Aposta: R$ ${CONFIG.rosa.bet}`);
console.log(`   Ganho: R$ ${CONFIG.rosa.bet * CONFIG.rosa.target} (se ≥${CONFIG.rosa.target.toFixed(2)}x)`);
console.log(`   Breakeven: ${(100/CONFIG.rosa.target).toFixed(1)}% assertividade`);
console.log(`   Lógica: Rosas tendem a vir após blues (52.4% das vezes)\n`);

console.log(`🟣 ESTRATÉGIA ROXA (Conservadora):`);
console.log(`   Regra: Jogar quando Purple% ≥60 E Streak ≥2 E Trend=UP`);
console.log(`   Aposta: R$ ${CONFIG.roxa.bet}`);
console.log(`   Ganho: R$ ${CONFIG.roxa.bet * CONFIG.roxa.target} (se ≥${CONFIG.roxa.target.toFixed(2)}x)`);
console.log(`   Breakeven: ${(100/CONFIG.roxa.target).toFixed(1)}% assertividade`);
console.log(`   Lógica: Momentum positivo forte indica alta probabilidade\n`);

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
      rosaInvestido += CONFIG.rosa.bet;
      if (nextValue >= CONFIG.rosa.target) {
        rosaGreens++;
        rosaRecebido += CONFIG.rosa.bet * CONFIG.rosa.target;
      }
    }
    
    if (decision.playRoxa) {
      roxaJogadas++;
      roxaInvestido += CONFIG.roxa.bet;
      if (nextValue >= CONFIG.roxa.target) {
        roxaGreens++;
        roxaRecebido += CONFIG.roxa.bet * CONFIG.roxa.target;
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

// Cálculos de ROI baseados nos valores investidos reais
const totalInvestidoRosa = totalRosaJogadas * CONFIG.rosa.bet;
const totalInvestidoRoxa = totalRoxaJogadas * CONFIG.roxa.bet;
const totalInvestidoGlobal = totalInvestidoRosa + totalInvestidoRoxa;

const totalRecebidoRosa = totalRosaGreens * (CONFIG.rosa.bet * CONFIG.rosa.target);
const totalRecebidoRoxa = totalRoxaGreens * (CONFIG.roxa.bet * CONFIG.roxa.target);
const totalRecebidoGlobal = totalRecebidoRosa + totalRecebidoRoxa;

console.log(`${'='.repeat(120)}`);
console.log(`RESUMO GERAL - ${files.length} GRAFOS`);
console.log(`${'='.repeat(120)}\n`);

console.log(`🌸 ROSA (Última vela < 2x):`);
console.log(`   Jogadas: ${totalRosaJogadas}`);
console.log(`   Greens: ${totalRosaGreens} (${totalAssertRosa.toFixed(1)}%)`);
console.log(`   Losses: ${totalRosaJogadas - totalRosaGreens}`);
console.log(`   Investido: R$ ${totalInvestidoRosa.toFixed(2)}`);
console.log(`   Recebido: R$ ${totalRecebidoRosa.toFixed(2)}`);
console.log(`   Lucro: R$ ${totalRosaSaldo.toFixed(2)}`);
console.log(`   ROI: ${totalInvestidoRosa > 0 ? ((totalRosaSaldo / totalInvestidoRosa) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`🟣 ROXA (Purple% ≥60 + Streak ≥2 + Trend UP):`);
console.log(`   Jogadas: ${totalRoxaJogadas}`);
console.log(`   Greens: ${totalRoxaGreens} (${totalAssertRoxa.toFixed(1)}%)`);
console.log(`   Losses: ${totalRoxaJogadas - totalRoxaGreens}`);
console.log(`   Investido: R$ ${totalInvestidoRoxa.toFixed(2)}`);
console.log(`   Recebido: R$ ${totalRecebidoRoxa.toFixed(2)}`);
console.log(`   Lucro: R$ ${totalRoxaSaldo.toFixed(2)}`);
console.log(`   ROI: ${totalInvestidoRoxa > 0 ? ((totalRoxaSaldo / totalInvestidoRoxa) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`💰 TOTAL:`);
console.log(`   Jogadas: ${totalRosaJogadas + totalRoxaJogadas}`);
console.log(`   Greens: ${totalRosaGreens + totalRoxaGreens}`);
console.log(`   Assertividade: ${((totalRosaGreens + totalRoxaGreens) / (totalRosaJogadas + totalRoxaJogadas) * 100).toFixed(1)}%`);
console.log(`   Investido: R$ ${totalInvestidoGlobal.toFixed(2)}`);
console.log(`   Recebido: R$ ${totalRecebidoGlobal.toFixed(2)}`);
console.log(`   LUCRO: R$ ${totalSaldo.toFixed(2)}`);
console.log(`   ROI: ${totalInvestidoGlobal > 0 ? ((totalSaldo / totalInvestidoGlobal) * 100).toFixed(1) : 0}%`);
console.log();

console.log(`📊 CONTRIBUIÇÃO:`);
if (totalSaldo !== 0) {
  console.log(`   ROSA: ${((totalRosaSaldo / Math.abs(totalSaldo)) * 100).toFixed(1)}% do resultado`);
  console.log(`   ROXA: ${((totalRoxaSaldo / Math.abs(totalSaldo)) * 100).toFixed(1)}% do resultado`);
}
console.log();

// Análise de performance
console.log(`${'='.repeat(120)}`);
console.log(`ANÁLISE DE PERFORMANCE`);
console.log(`${'='.repeat(120)}\n`);

const winningGraphs = files.length; // Simplificado
const totalROI = totalInvestidoGlobal > 0 ? ((totalSaldo / totalInvestidoGlobal) * 100) : 0;

if (totalAssertRosa >= (100/CONFIG.rosa.target) * 1.5) {
  console.log(`✅ ROSA: Assertividade EXCELENTE (${totalAssertRosa.toFixed(1)}%)`);
} else if (totalAssertRosa >= (100/CONFIG.rosa.target) * 1.2) {
  console.log(`✅ ROSA: Assertividade BOA (${totalAssertRosa.toFixed(1)}%)`);
} else if (totalAssertRosa >= (100/CONFIG.rosa.target)) {
  console.log(`⚠️  ROSA: Assertividade ACEITÁVEL (${totalAssertRosa.toFixed(1)}%)`);
} else {
  console.log(`❌ ROSA: Assertividade BAIXA (${totalAssertRosa.toFixed(1)}%) - Abaixo do breakeven (${(100/CONFIG.rosa.target).toFixed(1)}%)`);
}

if (totalAssertRoxa >= (100/CONFIG.roxa.target) * 1.2) {
  console.log(`✅ ROXA: Assertividade BOA (${totalAssertRoxa.toFixed(1)}%)`);
} else if (totalAssertRoxa >= (100/CONFIG.roxa.target)) {
  console.log(`⚠️  ROXA: Assertividade ACEITÁVEL (${totalAssertRoxa.toFixed(1)}%)`);
} else {
  console.log(`❌ ROXA: Assertividade BAIXA (${totalAssertRoxa.toFixed(1)}%) - Abaixo do breakeven (${(100/CONFIG.roxa.target).toFixed(1)}%)`);
}

console.log();

if (totalROI >= 30) {
  console.log(`🎉 ROI EXCELENTE: ${totalROI.toFixed(1)}%`);
} else if (totalROI >= 20) {
  console.log(`✅ ROI BOM: ${totalROI.toFixed(1)}%`);
} else if (totalROI >= 10) {
  console.log(`⚠️  ROI BAIXO: ${totalROI.toFixed(1)}%`);
} else if (totalROI >= 0) {
  console.log(`⚠️  ROI MUITO BAIXO: ${totalROI.toFixed(1)}%`);
} else {
  console.log(`❌ PREJUÍZO: ${totalROI.toFixed(1)}%`);
}

console.log();
console.log(`${'='.repeat(120)}\n`);

// Recomendações
console.log(`💡 RECOMENDAÇÕES:\n`);

if (totalRosaSaldo > 0 && totalRoxaSaldo < 0) {
  console.log(`1. ✅ ROSA está funcionando bem! Manter estratégia.`);
  console.log(`2. ❌ ROXA está dando prejuízo. Considerar:`);
  console.log(`   • Desativar ROXA temporariamente`);
  console.log(`   • Revisar regras completamente`);
  console.log(`   • Testar cashout alternativo (1.5x, 1.6x)`);
} else if (totalRosaSaldo > 0 && totalRoxaSaldo > 0) {
  console.log(`1. ✅ Ambas estratégias estão funcionando!`);
  console.log(`2. Otimizar para aumentar lucro:`);
  console.log(`   • Testar condições adicionais para ROSA`);
  console.log(`   • Ajustar threshold ROXA para mais jogadas`);
} else {
  console.log(`1. ❌ Sistema precisa de ajustes urgentes!`);
  console.log(`2. Revisar completamente as regras`);
  console.log(`3. Coletar mais grafos para validação`);
}

console.log();
console.log(`${'='.repeat(120)}\n`);

// Salvar relatório
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(graphsDir, `relatorio_modelo_v1_${timestamp}.txt`);
fs.writeFileSync(reportPath, fullOutput);

// Restaurar console.log
console.log = originalLog;
console.log(`📄 Relatório completo salvo em: ${reportPath}\n`);
