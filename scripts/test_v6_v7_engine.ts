
import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';

const CONFIG = {
  rosa: {
    target: 10.0,
    bet: 50
  }
};

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

// Buffers de saída
let outputHeader = '';
let outputSummary = '';
let outputDetails = '';

const logHeader = (msg: string) => outputHeader += msg + '\n';
const logSummary = (msg: string) => outputSummary += msg + '\n';
const logDetails = (msg: string) => outputDetails += msg + '\n';

logHeader(`\n${'='.repeat(80)}`);
logHeader(`RELATÓRIO DE PERFORMANCE V6/V7 (SNIPER ENGINE)`);
logHeader(`${'='.repeat(80)}`);
logHeader(`Data/Hora:      ${new Date().toLocaleString('pt-BR')}`);
logHeader(`${'-'.repeat(80)}`);
logHeader(`🚀 Analisando ${files.length} grafos...`);
logHeader(`${'='.repeat(80)}\n`);

let totalJogadas = 0;
let totalGreens = 0;
let totalInvestido = 0;
let totalRecebido = 0;

let clusterPlays = 0;
let clusterGreens = 0;
let normalPlays = 0;
let normalGreens = 0;
let desertBlocks = 0;

let positiveGraphs = 0;
let negativeGraphs = 0;
let neutralGraphs = 0;

// Estatísticas de Mercado (Totais)
let marketStats = {
  totalVelas: 0,
  blue: 0,
  purple: 0,
  pink: 0
};

// NOVO: Análise de Contexto de Rosas
let pinkContext = {
  afterBlue: 0,    // Rosas que vieram após azul
  afterPurple: 0,  // Rosas que vieram após roxo
  afterPink: 0,    // Rosas coladas (após outra rosa)
  total: 0
};

// NOVO: Análise por Fase
let phaseStats = {
  cluster: { pinks: 0, total: 0 },
  normal: { pinks: 0, total: 0 },
  desert: { pinks: 0, total: 0 }
};

// NOVO: Recuperação Pós-Deserto
let desertRecovery = {
  desertBreaks: 0,           // Quantas vezes saiu de deserto
  secondPinkIn10: 0,         // Quantas vezes veio 2ª rosa em 10 velas
  backToDesertIn10: 0        // Quantas vezes voltou ao deserto em 10 velas
};

logDetails(`${'='.repeat(80)}`);
logDetails(`DETALHAMENTO POR GRAFO`);
logDetails(`${'='.repeat(80)}`);

for (const file of files) {
  const filepath = path.join(graphsDir, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  
  // Coletar estatísticas DO MERCADO
  values.forEach(v => {
    marketStats.totalVelas++;
    if (v < 2.0) marketStats.blue++;
    else if (v < 10.0) marketStats.purple++;
    else marketStats.pink++;
  });

  const chron = [...values].reverse();
  const MEMORY_SIZE = 60; 
  const totalRounds = chron.length - MEMORY_SIZE;

  let graphJogadas = 0;
  let graphGreens = 0;
  let graphLucro = 0;

  let wasInDesert = false;
  let desertBreakIndex = -1;

  for (let i = 0; i < totalRounds; i++) {
    const memory = chron.slice(i, i + MEMORY_SIZE);
    const nextValue = chron[i + MEMORY_SIZE];
    const reversedMemory = [...memory].reverse();
    const result = StrategyCore.analyze(reversedMemory);
    
    // NOVO: Tracking de Fase
    const phaseLower = result.phase.toLowerCase() as 'cluster' | 'normal' | 'desert';
    if (phaseStats[phaseLower]) {
      phaseStats[phaseLower].total++;
      if (nextValue >= 10.0) phaseStats[phaseLower].pinks++;
    }
    
    // NOVO: Análise de Contexto de Rosas
    if (nextValue >= 10.0) {
      pinkContext.total++;
      const prevValue = reversedMemory[0]; // Vela imediatamente anterior
      if (prevValue < 2.0) pinkContext.afterBlue++;
      else if (prevValue < 10.0) pinkContext.afterPurple++;
      else pinkContext.afterPink++;
    }
    
    // NOVO: Análise de Recuperação Pós-Deserto
    if (result.phase === 'DESERT') {
      wasInDesert = true;
    } else if (wasInDesert && nextValue >= 10.0) {
      // Saiu do deserto com uma rosa
      desertRecovery.desertBreaks++;
      desertBreakIndex = i;
      wasInDesert = false;
    }
    
    // Verificar se veio 2ª rosa em 10 velas após quebra de deserto
    if (desertBreakIndex !== -1 && i > desertBreakIndex && i <= desertBreakIndex + 10) {
      if (nextValue >= 10.0 && i > desertBreakIndex) {
        desertRecovery.secondPinkIn10++;
        desertBreakIndex = -1; // Já contou, resetar
      }
    } else if (desertBreakIndex !== -1 && i > desertBreakIndex + 10) {
      // Passou 10 velas sem 2ª rosa
      if (result.phase === 'DESERT') {
        desertRecovery.backToDesertIn10++;
      }
      desertBreakIndex = -1;
    }
    
    if (result.recommendationPink.action === 'PLAY_10X') {
      graphJogadas++;
      totalJogadas++;
      totalInvestido += CONFIG.rosa.bet;

      if (result.phase === 'CLUSTER') clusterPlays++;
      else normalPlays++;
      
      if (nextValue >= CONFIG.rosa.target) {
        graphGreens++;
        totalGreens++;
        const gain = (CONFIG.rosa.bet * CONFIG.rosa.target);
        totalRecebido += gain;
        graphLucro += (gain - CONFIG.rosa.bet);
        if (result.phase === 'CLUSTER') clusterGreens++;
        else normalGreens++;
      } else {
        graphLucro -= CONFIG.rosa.bet;
      }
    } else if (result.phase === 'DESERT' && reversedMemory[0] < 2.0) {
      desertBlocks++;
    }
  }

  // Contagem de Status
  let statusIcon = '➖';
  if (graphLucro > 0) { positiveGraphs++; statusIcon = '✅'; }
  else if (graphLucro < 0) { negativeGraphs++; statusIcon = '❌'; }
  else { neutralGraphs++; }

  const assert = graphJogadas > 0 ? (graphGreens / graphJogadas * 100) : 0;
  logDetails(`${statusIcon} ${file.padEnd(20)} | Jogadas: ${graphJogadas.toString().padStart(3)} | Wins: ${graphGreens.toString().padStart(2)} (${assert.toFixed(1)}%) | Result: R$ ${graphLucro.toString().padStart(6)}`);
}

const totalLucro = totalRecebido - totalInvestido;
const totalROI = totalInvestido > 0 ? (totalLucro / totalInvestido * 100) : 0;
const totalAssert = totalJogadas > 0 ? (totalGreens / totalJogadas * 100) : 0;

const percBlue = marketStats.totalVelas > 0 ? (marketStats.blue / marketStats.totalVelas * 100) : 0;
const percPurple = marketStats.totalVelas > 0 ? (marketStats.purple / marketStats.totalVelas * 100) : 0;
const percPink = marketStats.totalVelas > 0 ? (marketStats.pink / marketStats.totalVelas * 100) : 0;

logSummary(`RESUMO GERAL DO MOTOR V6/V7`);
logSummary(`${'='.repeat(80)}`);
logSummary(`Total de Grafos:    ${files.length}`);
logSummary(`Total de Velas:     ${marketStats.totalVelas}`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`📊 DISTRIBUIÇÃO DO MERCADO:`);
logSummary(`   🔵 Azuis  (< 2x):    ${marketStats.blue.toString().padEnd(5)} (${percBlue.toFixed(2)}%)`);
logSummary(`   🟣 Roxas  (2x-10x):  ${marketStats.purple.toString().padEnd(5)} (${percPurple.toFixed(2)}%)`);
logSummary(`   🌸 Rosas  (>= 10x):  ${marketStats.pink.toString().padEnd(5)} (${percPink.toFixed(2)}%)`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`PERFORMANCE SNIPER:`);
logSummary(`Jogadas Totais:     ${totalJogadas}`);
logSummary(`Wins (Greens):      ${totalGreens}`);
logSummary(`Assertividade:      ${totalAssert.toFixed(2)}%`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`🔥 Jogadas Cluster: ${clusterPlays} (Greens: ${clusterGreens} | ${(clusterGreens/clusterPlays*100 || 0).toFixed(1)}%)`);
logSummary(`⚖️  Jogadas Normal:  ${normalPlays} (Greens: ${normalGreens} | ${(normalGreens/normalPlays*100 || 0).toFixed(1)}%)`);
logSummary(`🌵 Deserto Blocks:  ${desertBlocks} (Reds evitados no Deserto)`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`LUCRO ESCALADO:     R$ ${totalLucro.toFixed(2)} 💰`);
logSummary(`ROI FINAL:          ${totalROI.toFixed(2)}% 📈`);
logSummary(`${'-'.repeat(80)}`);

// NOVO: INTELIGÊNCIA DE PADRÕES
logSummary(`🧠 INTELIGÊNCIA DE PADRÕES:`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`📌 CONTEXTO DAS ROSAS (O que vem antes?):`);
const pctAfterBlue = pinkContext.total > 0 ? (pinkContext.afterBlue / pinkContext.total * 100) : 0;
const pctAfterPurple = pinkContext.total > 0 ? (pinkContext.afterPurple / pinkContext.total * 100) : 0;
const pctAfterPink = pinkContext.total > 0 ? (pinkContext.afterPink / pinkContext.total * 100) : 0;
logSummary(`   Após AZUL (<2x):     ${pinkContext.afterBlue.toString().padEnd(4)} (${pctAfterBlue.toFixed(1)}%)`);
logSummary(`   Após ROXO (2-10x):   ${pinkContext.afterPurple.toString().padEnd(4)} (${pctAfterPurple.toFixed(1)}%)`);
logSummary(`   Após ROSA (>=10x):   ${pinkContext.afterPink.toString().padEnd(4)} (${pctAfterPink.toFixed(1)}%) - Rosas Coladas`);
logSummary(`   Total de Rosas:      ${pinkContext.total}`);
logSummary(``);
logSummary(`📍 ROSAS POR FASE:`);
const clusterPinkRate = phaseStats.cluster.total > 0 ? (phaseStats.cluster.pinks / phaseStats.cluster.total * 100) : 0;
const normalPinkRate = phaseStats.normal.total > 0 ? (phaseStats.normal.pinks / phaseStats.normal.total * 100) : 0;
const desertPinkRate = phaseStats.desert.total > 0 ? (phaseStats.desert.pinks / phaseStats.desert.total * 100) : 0;
logSummary(`   🔥 CLUSTER: ${phaseStats.cluster.pinks}/${phaseStats.cluster.total} velas (${clusterPinkRate.toFixed(2)}% rosa)`);
logSummary(`   ⚖️  NORMAL:  ${phaseStats.normal.pinks}/${phaseStats.normal.total} velas (${normalPinkRate.toFixed(2)}% rosa)`);
logSummary(`   🌵 DESERTO: ${phaseStats.desert.pinks}/${phaseStats.desert.total} velas (${desertPinkRate.toFixed(2)}% rosa)`);
logSummary(``);
logSummary(`🌵 RECUPERAÇÃO PÓS-DESERTO:`);
const secondPinkRate = desertRecovery.desertBreaks > 0 ? (desertRecovery.secondPinkIn10 / desertRecovery.desertBreaks * 100) : 0;
const backToDesertRate = desertRecovery.desertBreaks > 0 ? (desertRecovery.backToDesertIn10 / desertRecovery.desertBreaks * 100) : 0;
logSummary(`   Quebras de Deserto:        ${desertRecovery.desertBreaks}`);
logSummary(`   2ª Rosa em 10 velas:       ${desertRecovery.secondPinkIn10} (${secondPinkRate.toFixed(1)}%)`);
logSummary(`   Volta ao Deserto em 10:    ${desertRecovery.backToDesertIn10} (${backToDesertRate.toFixed(1)}%)`);
logSummary(`${'-'.repeat(80)}`);

logSummary(`ANÁLISE DE GRAFOS:`);
logSummary(`✅ Positivos:       ${positiveGraphs} (${((positiveGraphs/files.length)*100).toFixed(1)}%)`);
logSummary(`❌ Negativos:       ${negativeGraphs} (${((negativeGraphs/files.length)*100).toFixed(1)}%)`);
logSummary(`➖ Neutros:         ${neutralGraphs}`);
logSummary(`${'='.repeat(80)}`);

const finalOutput = outputHeader + outputSummary + outputDetails;
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(graphsDir, `RELATORIO_FINAL_V6_V7_${timestamp}.txt`);

fs.writeFileSync(reportPath, finalOutput);
console.log(finalOutput);
console.log(`\n📄 Relatório salvo em: ${reportPath}`);
