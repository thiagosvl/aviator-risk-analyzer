/**
 * TESTE DO MODELO V1 EM TODOS OS GRAFOS
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
// Função para ler argumentos da linha de comando (ex: --rosa-target=5.0)
const getArg = (name: string, defaultValue: number): number => {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? parseFloat(arg.split('=')[1]) : defaultValue;
};

// Configuração de Teste (Padrões + Sobrescrita por CLI)
const CONFIG = {
  rosa: {
    target: getArg('rosa-target', 10.0),            // Alvo padrão: 10x
    bet: 50,
    trigger_max_value: getArg('rosa-trigger', 2.0)  // Gatilho padrão: < 2.0x
  },
  roxa: {
    target: getArg('roxa-target', 2.0),             // Alvo padrão: 2x
    bet: 100,
    trigger_purple_percent: getArg('roxa-trigger', 60) // Gatilho padrão: > 60%
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
  const lastIsBlue = lastValue < CONFIG.rosa.trigger_max_value; // Usa config
  
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
  const motivoRosa = playRosa ? `Última vela = ${lastValue.toFixed(2)}x < ${CONFIG.rosa.trigger_max_value}x` : '';
  
  const playRoxa = purplePercent >= CONFIG.roxa.trigger_purple_percent && streak >= 2 && trend === 'UP';
  const motivoRoxa = playRoxa ? `Purple%=${purplePercent.toFixed(0)}% + Streak=${streak} + Trend=${trend}` : '';
  
  return { playRosa, playRoxa, motivoRosa, motivoRoxa };
}

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

// Buffer para saída
let outputHeader = '';
let outputSummary = '';
let outputGraphs = '';
let outputRecommendations = '';

// Função auxiliar de log para os buffers
const logTo = (target: 'header' | 'summary' | 'graphs' | 'recs', ...args: any[]) => {
  const msg = args.join(' ') + '\n';
  if (target === 'header') outputHeader += msg;
  else if (target === 'summary') outputSummary += msg;
  else if (target === 'graphs') outputGraphs += msg;
  else if (target === 'recs') outputRecommendations += msg;
};

// ... headers ...
logTo('header', `\n${'='.repeat(120)}`);
logTo('header', `TESTE DO MODELO V1 - TODOS OS GRAFOS`);
logTo('header', `Configuração: Rosa ${CONFIG.rosa.target}x / Roxa ${CONFIG.roxa.target}x`);
logTo('header', `${'='.repeat(120)}\n`);

// Documentar regras utilizadas
logTo('header', `📋 REGRAS E CONFIGURAÇÃO ATUAL:\n`);
logTo('header', `🌸 ESTRATÉGIA ROSA (Agressiva):`);
logTo('header', `   • Target (Alvo): ${CONFIG.rosa.target.toFixed(2)}x`);
logTo('header', `   • Bet (Aposta): R$ ${CONFIG.rosa.bet.toFixed(2)}`);
logTo('header', `   • Trigger de Entrada: Última vela < ${CONFIG.rosa.trigger_max_value.toFixed(2)}x`);
logTo('header', `   • Ganho Potencial: R$ ${(CONFIG.rosa.bet * CONFIG.rosa.target).toFixed(2)}`);
logTo('header', `   • Breakeven Necessário: ${(100/CONFIG.rosa.target).toFixed(1)}%\n`);

logTo('header', `🟣 ESTRATÉGIA ROXA (Conservadora):`);
logTo('header', `   • Target (Alvo): ${CONFIG.roxa.target.toFixed(2)}x`);
logTo('header', `   • Bet (Aposta): R$ ${CONFIG.roxa.bet.toFixed(2)}`);
logTo('header', `   • Trigger de Entrada: Purple% >= ${CONFIG.roxa.trigger_purple_percent}%`);
logTo('header', `   • Ganho Potencial: R$ ${(CONFIG.roxa.bet * CONFIG.roxa.target).toFixed(2)}`);
logTo('header', `   • Breakeven Necessário: ${(100/CONFIG.roxa.target).toFixed(1)}%\n`);

logTo('header', `${'='.repeat(120)}\n`);

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
  
  logTo('graphs', `📊 ${file}:`);
  logTo('graphs', `   Rodadas: ${totalRounds}`);
  logTo('graphs', ``);
  logTo('graphs', `   🌸 ROSA: ${rosaJogadas} jogadas, ${rosaGreens} greens (${rosaAssert.toFixed(1)}%), Lucro: R$ ${rosaLucro.toFixed(2)}`);
  logTo('graphs', `   🟣 ROXA: ${roxaJogadas} jogadas, ${roxaGreens} greens (${roxaAssert.toFixed(1)}%), Lucro: R$ ${roxaLucro.toFixed(2)}`);
  logTo('graphs', `   💰 TOTAL: R$ ${lucroTotal.toFixed(2)}`);
  logTo('graphs', ``);
  
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

logTo('summary', `${'='.repeat(120)}`);
logTo('summary', `RESUMO GERAL - ${files.length} GRAFOS (ORDEM DO RELATÓRIO: GERAL -> DETALHADO)`);
logTo('summary', `${'='.repeat(120)}\n`);

logTo('summary', `🌸 ROSA (Última vela < ${CONFIG.rosa.trigger_max_value.toFixed(2)}x):`);
logTo('summary', `   Jogadas: ${totalRosaJogadas}`);
logTo('summary', `   Greens: ${totalRosaGreens} (${totalAssertRosa.toFixed(1)}%)`);
logTo('summary', `   Losses: ${totalRosaJogadas - totalRosaGreens}`);
logTo('summary', `   Investido: R$ ${totalInvestidoRosa.toFixed(2)}`);
logTo('summary', `   Recebido: R$ ${totalRecebidoRosa.toFixed(2)}`);
logTo('summary', `   Lucro: R$ ${totalRosaSaldo.toFixed(2)}`);
logTo('summary', `   ROI: ${totalInvestidoRosa > 0 ? ((totalRosaSaldo / totalInvestidoRosa) * 100).toFixed(1) : 0}%`);
logTo('summary', ``);

logTo('summary', `🟣 ROXA (Purple% ≥${CONFIG.roxa.trigger_purple_percent}%):`);
logTo('summary', `   Jogadas: ${totalRoxaJogadas}`);
logTo('summary', `   Greens: ${totalRoxaGreens} (${totalAssertRoxa.toFixed(1)}%)`);
logTo('summary', `   Losses: ${totalRoxaJogadas - totalRoxaGreens}`);
logTo('summary', `   Investido: R$ ${totalInvestidoRoxa.toFixed(2)}`);
logTo('summary', `   Recebido: R$ ${totalRecebidoRoxa.toFixed(2)}`);
logTo('summary', `   Lucro: R$ ${totalRoxaSaldo.toFixed(2)}`);
logTo('summary', `   ROI: ${totalInvestidoRoxa > 0 ? ((totalRoxaSaldo / totalInvestidoRoxa) * 100).toFixed(1) : 0}%`);
logTo('summary', ``);

logTo('summary', `💰 TOTAL ACUMULADO:`);
logTo('summary', `   Jogadas: ${totalRosaJogadas + totalRoxaJogadas}`);
logTo('summary', `   Greens: ${totalRosaGreens + totalRoxaGreens}`);
logTo('summary', `   Assertividade: ${((totalRosaGreens + totalRoxaGreens) / (totalRosaJogadas + totalRoxaJogadas) * 100).toFixed(1)}%`);
logTo('summary', `   Investido: R$ ${totalInvestidoGlobal.toFixed(2)}`);
logTo('summary', `   Recebido: R$ ${totalRecebidoGlobal.toFixed(2)}`);
logTo('summary', `   LUCRO: R$ ${totalSaldo.toFixed(2)}`);
logTo('summary', `   ROI: ${totalInvestidoGlobal > 0 ? ((totalSaldo / totalInvestidoGlobal) * 100).toFixed(1) : 0}%`);
logTo('summary', ``);

// Análise de performance
logTo('recs', `${'='.repeat(120)}`);
logTo('recs', `ANÁLISE DE PERFORMANCE E RECOMENDAÇÕES`);
logTo('recs', `${'='.repeat(120)}\n`);

const winningGraphs = files.length; // Simplificado
const totalROI = totalInvestidoGlobal > 0 ? ((totalSaldo / totalInvestidoGlobal) * 100) : 0;

if (totalROI >= 20) {
  logTo('recs', `✅ RESULTADO GERAL: EXCELENTE (ROI ${totalROI.toFixed(1)}%)`);
} else if (totalROI > 0) {
  logTo('recs', `⚠️  RESULTADO GERAL: POSITIVO (ROI ${totalROI.toFixed(1)}%)`);
} else {
  logTo('recs', `❌ RESULTADO GERAL: NEGATIVO (ROI ${totalROI.toFixed(1)}%)`);
}
logTo('recs', ``);

if (totalRosaSaldo > 0 && totalRoxaSaldo < 0) {
  logTo('recs', `💡 DICA: ROSA está carregando o lucro. Considere desativar ROXA.`);
} else if (totalRosaSaldo > 0 && totalRoxaSaldo > 0) {
  logTo('recs', `💡 DICA: Ambas estratégias estão lucrando. Mantenha assim.`);
}

logTo('recs', ``);
logTo('recs', `${'='.repeat(120)}\n`);

// Montar relatório na ordem solicitada: Geral -> Detalhado
fullOutput = outputHeader + outputSummary + outputRecommendations + '📊 DETALHAMENTO GRAFO A GRAFO:\n\n' + outputGraphs;

// Salvar relatório
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(graphsDir, `relatorio_modelo_v1_${timestamp}.txt`);
fs.writeFileSync(reportPath, fullOutput);

// Restaurar console.log
console.log = originalLog;
console.log(`📄 Relatório completo salvo em: ${reportPath}\n`);
