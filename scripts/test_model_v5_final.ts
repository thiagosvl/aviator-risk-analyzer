
/**
 * TESTE DO MODELO V5 FINAL (PURE ROSA)
 * 
 * Regra Única e Definitiva:
 * - Trigger: Última vela < 2.00x (Blue)
 * - Filtros: NENHUM (Volume vence volatilidade)
 * - Roxa: DESATIVADA
 */

import fs from 'fs';
import path from 'path';

const CONFIG = {
  rosa: {
    target: 10.0,
    bet: 50,
    trigger_max_value: 2.0
  }
};

const graphsDir = 'GRAFOS_TESTE';

const targetFileArg = process.argv.find(arg => arg.startsWith('--file='));
const targetFile = targetFileArg ? targetFileArg.split('=')[1] : null;

let files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

if (targetFile) {
  const targets = targetFile.split(',').map(f => f.trim());
  const foundFiles = targets.filter(t => files.includes(t));
  const missingFiles = targets.filter(t => !files.includes(t));

  if (missingFiles.length > 0) {
    console.warn(`\n⚠️  AVISO: Arquivos não encontrados: ${missingFiles.join(', ')}`);
  }

  if (foundFiles.length > 0) {
    files = foundFiles;
    console.log(`\n🎯 MODO SELECT: Analisando ${foundFiles.length} arquivo(s): ${foundFiles.join(', ')}`);
  } else {
    console.error(`\n❌ ERRO: Nenhum dos arquivos solicitados foi encontrado.`);
    process.exit(1);
  }
}

// Buffers de saída
let outputHeader = '';
let outputSummary = '';
let outputDetails = '';

const logHeader = (msg: string) => outputHeader += msg + '\n';
const logSummary = (msg: string) => outputSummary += msg + '\n';
const logDetails = (msg: string) => outputDetails += msg + '\n';

// 1. Cabeçalho Rico
logHeader(`\n${'='.repeat(80)}`);
logHeader(`RELATÓRIO DE PERFORMANCE - AVIATOR RISK ANALYZER`);
logHeader(`${'='.repeat(80)}`);
logHeader(`Modelo:         V5 FINAL (PURE ROSA)`);
logHeader(`Data/Hora:      ${new Date().toLocaleString('pt-BR')}`);
logHeader(`${'-'.repeat(80)}`);
logHeader(`⚙️  CONFIGURAÇÃO DA ESTRATÉGIA:`);
logHeader(`   • Alvo (Target):        ${CONFIG.rosa.target.toFixed(2)}x`);
logHeader(`   • Trigger (Blue):       < ${CONFIG.rosa.trigger_max_value.toFixed(2)}x`);
logHeader(`   • Bet (Aposta):         R$ ${CONFIG.rosa.bet.toFixed(2)}`);
logHeader(`   • Filtros Extras:       NENHUM (Estratégia Volumétrica)`);
logHeader(`   • Estratégia Roxa:      OFF`);
logHeader(`${'='.repeat(80)}\n`);

let totalJogadas = 0;
let totalGreens = 0;
let totalInvestido = 0;
let totalRecebido = 0;

let positiveGraphs = 0;
let negativeGraphs = 0;
let neutralGraphs = 0;

// Estatísticas de Mercado (Totais)
let marketStats = {
  totalVelas: 0,
  blue: 0,   // < 2.00x
  purple: 0, // >= 2.00x e < 10.00x
  pink: 0    // >= 10.00x
};

// Cabeçalho dos detalhes
logDetails(`\n${'='.repeat(80)}`);
logDetails(`DETALHAMENTO POR GRAFO`);
logDetails(`${'='.repeat(80)}`);

for (const file of files) {
  const filepath = path.join(graphsDir, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  
  // Coletar estatísticas DO MERCADO antes da simulação
  values.forEach(v => {
    marketStats.totalVelas++;
    if (v < 2.0) marketStats.blue++;
    else if (v < 10.0) marketStats.purple++;
    else marketStats.pink++;
  });

  const chron = [...values].reverse();
  const MEMORY_SIZE = 25;
  const totalRounds = chron.length - MEMORY_SIZE;

  let graphJogadas = 0;
  let graphGreens = 0;
  let graphLucro = 0;

  for (let i = 0; i < totalRounds; i++) {
    const memory = chron.slice(i, i + MEMORY_SIZE);
    const lastValue = memory[memory.length - 1];
    const nextValue = chron[i + MEMORY_SIZE];

    // Regra V5: Apenas Trigger, sem filtros
    if (lastValue < CONFIG.rosa.trigger_max_value) {
      graphJogadas++;
      totalInvestido += CONFIG.rosa.bet;
      
      if (nextValue >= CONFIG.rosa.target) {
        graphGreens++;
        const gain = CONFIG.rosa.bet * CONFIG.rosa.target;
        totalRecebido += gain;
        graphLucro += (gain - CONFIG.rosa.bet);
      } else {
        graphLucro -= CONFIG.rosa.bet;
      }
    }
  }

  totalJogadas += graphJogadas;
  totalGreens += graphGreens;

  // Contagem de Status
  let statusIcon = '➖';
  let statusText = 'NEUTRO';
  if (graphLucro > 0) {
    positiveGraphs++;
    statusIcon = '✅';
    statusText = 'LUCRO ';
  } else if (graphLucro < 0) {
    negativeGraphs++;
    statusIcon = '❌';
    statusText = 'PREJUI';
  } else {
    neutralGraphs++;
  }

  const assert = graphJogadas > 0 ? (graphGreens / graphJogadas * 100) : 0;
  logDetails(`${statusIcon} ${file.padEnd(20)} | Jogadas: ${graphJogadas.toString().padStart(3)} | Wins: ${graphGreens.toString().padStart(2)} (${assert.toFixed(1)}%) | Result: R$ ${graphLucro.toString().padStart(6)}`);
}

const totalLucro = totalRecebido - totalInvestido;
const totalROI = totalInvestido > 0 ? (totalLucro / totalInvestido * 100) : 0;
const totalAssert = totalJogadas > 0 ? (totalGreens / totalJogadas * 100) : 0;

// Calcular percentuais de mercado
const percBlue = marketStats.totalVelas > 0 ? (marketStats.blue / marketStats.totalVelas * 100) : 0;
const percPurple = marketStats.totalVelas > 0 ? (marketStats.purple / marketStats.totalVelas * 100) : 0;
const percPink = marketStats.totalVelas > 0 ? (marketStats.pink / marketStats.totalVelas * 100) : 0;

// 2. Resumo Geral (Agora vem antes dos detalhes)
logSummary(`RESUMO GERAL DO TESTE`);
logSummary(`${'='.repeat(80)}`);
logSummary(`Total de Grafos:    ${files.length}`);
logSummary(`Total de Velas:     ${marketStats.totalVelas}`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`📊 DISTRIBUIÇÃO DO MERCADO (Velas):`);
logSummary(`   🔵 Azuis  (< 2x):    ${marketStats.blue.toString().padEnd(5)} (${percBlue.toFixed(2)}%)`);
logSummary(`   🟣 Roxas  (2x-10x):  ${marketStats.purple.toString().padEnd(5)} (${percPurple.toFixed(2)}%)`);
logSummary(`   🌸 Rosas  (>= 10x):  ${marketStats.pink.toString().padEnd(5)} (${percPink.toFixed(2)}%)`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`PERFORMANCE DA ESTRATÉGIA:`);
logSummary(`Jogadas Totais:     ${totalJogadas}`);
logSummary(`Wins (Greens):      ${totalGreens}`);
logSummary(`Assertividade:      ${totalAssert.toFixed(2)}%`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`Investimento Total: R$ ${totalInvestido.toFixed(2)}`);
logSummary(`Retorno Total:      R$ ${totalRecebido.toFixed(2)}`);
logSummary(`LUCRO LÍQUIDO:      R$ ${totalLucro.toFixed(2)} 💰`);
logSummary(`ROI FINAL:          ${totalROI.toFixed(2)}% 📈`);
logSummary(`${'-'.repeat(80)}`);
logSummary(`ANÁLISE DE GRAFOS:`);
logSummary(`✅ Positivos:       ${positiveGraphs} (${((positiveGraphs/files.length)*100).toFixed(1)}%)`);
logSummary(`❌ Negativos:       ${negativeGraphs} (${((negativeGraphs/files.length)*100).toFixed(1)}%)`);
logSummary(`➖ Neutros:         ${neutralGraphs}`);
logSummary(`${'='.repeat(80)}`);

// Montagem Final
const finalOutput = outputHeader + outputSummary + outputDetails;
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(graphsDir, `RELATORIO_FINAL_V5_${timestamp}.txt`);

fs.writeFileSync(reportPath, finalOutput);

console.log(finalOutput);
console.log(`\n📄 Relatório salvo em: ${reportPath}`);
