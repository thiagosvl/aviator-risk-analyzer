
/**
 * TESTE DO MODELO V5 IMPROVED (HÍBRIDO V1 + VOLATILIDADE)
 * 
 * Objetivo:
 * - Maximizar Lucro Absoluto (Base V1)
 * - Cortar Perdas em Mercado Morto (Filtro Volatilidade)
 * - Manter alto volume de jogadas
 * - Relatório detalhado com contagem de grafos positivos/negativos
 */

import fs from 'fs';
import path from 'path';

// Configuração V5 Improved
const CONFIG = {
  rosa: {
    target: 10.0,
    bet: 50,
    trigger_max_value: 2.0, // Regra Base V1
    min_volatility: 2.0     // Único Filtro Adicional
  }
};

// Funções Auxiliares
function calculateVolatility(memory: number[], windowSize: number): number {
  const slice = memory.slice(-windowSize);
  if (slice.length === 0) return 0;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function analyzeWindowV5Improved(memory: number[]) {
  const lastValue = memory[memory.length - 1];
  
  // 1. Trigger de Entrada (Base V1)
  if (lastValue >= CONFIG.rosa.trigger_max_value) return { play: false, reason: 'Wait (Last >= 2.0)' };

  // 2. Filtro de Volatilidade (Anti-Dead Market)
  const vol = calculateVolatility(memory, 10);
  if (vol < CONFIG.rosa.min_volatility) return { play: false, reason: `Dead Market (Vol ${vol.toFixed(2)})` };

  // 3. JOGAR (Sem limitação de distância)
  return { play: true, reason: 'Entry Signal' };
}

// Execução Principal
const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

let outputBuffer = '';
const log = (msg: string) => {
  // console.log(msg); 
  outputBuffer += msg + '\n';
};

log(`\n${'='.repeat(80)}`);
log(`TESTE DO MODELO V5 IMPROVED`);
log(`Estratégia: Base V1 (Aggressive) + Filtro Volatilidade > ${CONFIG.rosa.min_volatility.toFixed(1)}x`);
log(`${'='.repeat(80)}\n`);

let totalJogadas = 0;
let totalGreens = 0;
let totalInvestido = 0;
let totalRecebido = 0;

let positiveGraphs = 0;
let negativeGraphs = 0;
let neutralGraphs = 0;

for (const file of files) {
  const filepath = path.join(graphsDir, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  
  const chron = [...values].reverse();
  const MEMORY_SIZE = 25;
  const totalRounds = chron.length - MEMORY_SIZE;

  let graphJogadas = 0;
  let graphGreens = 0;
  let graphLucro = 0;

  for (let i = 0; i < totalRounds; i++) {
    const memory = chron.slice(i, i + MEMORY_SIZE);
    const nextValue = chron[i + MEMORY_SIZE];

    const decision = analyzeWindowV5Improved(memory);

    if (decision.play) {
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

  // Contagem de Status do Grafo
  let statusIcon = '➖';
  if (graphLucro > 0) {
    positiveGraphs++;
    statusIcon = '✅';
  } else if (graphLucro < 0) {
    negativeGraphs++;
    statusIcon = '❌';
  } else {
    neutralGraphs++;
  }

  const assert = graphJogadas > 0 ? (graphGreens / graphJogadas * 100) : 0;
  log(`${statusIcon} ${file.padEnd(15)} | Jogadas: ${graphJogadas.toString().padStart(3)} | Wins: ${graphGreens.toString().padStart(2)} (${assert.toFixed(1)}%) | Lucro: R$ ${graphLucro}`);
}

const totalLucro = totalRecebido - totalInvestido;
const totalROI = totalInvestido > 0 ? (totalLucro / totalInvestido * 100) : 0;
const totalAssert = totalJogadas > 0 ? (totalGreens / totalJogadas * 100) : 0;

log(`\n${'='.repeat(80)}`);
log(`RESUMO GERAL V5 IMPROVED`);
log(`${'='.repeat(80)}`);
log(`Jogadas Totais:   ${totalJogadas}`);
log(`Greens Totais:    ${totalGreens}`);
log(`Assertividade:    ${totalAssert.toFixed(2)}%`);
log(`Investido:        R$ ${totalInvestido.toFixed(2)}`);
log(`Recebido:         R$ ${totalRecebido.toFixed(2)}`);
log(`LUCRO LÍQUIDO:    R$ ${totalLucro.toFixed(2)}`);
log(`ROI FINAL:        ${totalROI.toFixed(2)}%`);
log(`${'='.repeat(80)}`);
log(`ANÁLISE DE GRAFOS:`);
log(`✅ Positivos:      ${positiveGraphs} (${((positiveGraphs/files.length)*100).toFixed(1)}%)`);
log(`❌ Negativos:      ${negativeGraphs} (${((negativeGraphs/files.length)*100).toFixed(1)}%)`);
log(`➖ Neutros:        ${neutralGraphs}`);
log(`${'='.repeat(80)}\n`);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(graphsDir, `relatorio_modelo_v5_improved_${timestamp}.txt`);
fs.writeFileSync(reportPath, outputBuffer);

console.log(outputBuffer); 
console.log(`\n📄 Relatório salvo em: ${reportPath}`);
