
/**
 * TESTE DO MODELO V5 (SNIPER MODE / BALANCEADO) EM TODOS OS GRAFOS
 * 
 * Regras V5:
 * 1. Trigger: Última vela < 2.00x
 * 2. Filtro 1 (Distância): Última rosa deve ter ocorrido há no máximo 10 velas.
 * 3. Filtro 2 (Volatilidade): Média das últimas 10 velas deve ser > 2.0x.
 * 4. Roxa: DESATIVADA.
 */

import fs from 'fs';
import path from 'path';

// Configuração V5
const CONFIG = {
  rosa: {
    target: 10.0,
    bet: 50,
    max_dist: 15,       // Filtro 1 (Relaxado para recuperar volume)
    min_volatility: 2.0 // Filtro 2
  }
};

// Funções Auxiliares
function calculateDistLastPink(memory: number[], target: number): number {
  // Memory está na ordem cronológica [antigo ... recente]
  // Percorrer de trás pra frente
  for (let i = memory.length - 1; i >= 0; i--) {
    if (memory[i] >= target) {
      return memory.length - 1 - i;
    }
  }
  return 999; // Não encontrada
}

function calculateVolatility(memory: number[], windowSize: number): number {
  const slice = memory.slice(-windowSize);
  if (slice.length === 0) return 0;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function analyzeWindowV5(memory: number[]) {
  const lastValue = memory[memory.length - 1];
  
  // 1. Trigger de Entrada
  if (lastValue >= 2.0) return { play: false, reason: 'Last >= 2.0' };

  // 2. Filtro de Distância (Sniper)
  const dist = calculateDistLastPink(memory, CONFIG.rosa.target);
  if (dist > CONFIG.rosa.max_dist) return { play: false, reason: `Cold Graph (Dist ${dist})` };

  // 3. Filtro de Volatilidade (Anti-Dead Market)
  const vol = calculateVolatility(memory, 10);
  if (vol < CONFIG.rosa.min_volatility) return { play: false, reason: `Dead Market (Vol ${vol.toFixed(2)})` };

  return { play: true, reason: 'Sniper Entry' };
}

// Execução Principal
const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

let outputBuffer = '';
const log = (msg: string) => {
  // console.log(msg); // Silenciar console se quiser
  outputBuffer += msg + '\n';
};

log(`\n${'='.repeat(80)}`);
log(`TESTE DO MODELO V5 - SNIPER MODE`);
log(`Config: Alvo 10x | Dist <= ${CONFIG.rosa.max_dist} | Vol > ${CONFIG.rosa.min_volatility.toFixed(1)}x`);
log(`${'='.repeat(80)}\n`);

let totalJogadas = 0;
let totalGreens = 0;
let totalInvestido = 0;
let totalRecebido = 0;

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

    const decision = analyzeWindowV5(memory);

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

  const assert = graphJogadas > 0 ? (graphGreens / graphJogadas * 100) : 0;
  log(`📊 ${file.padEnd(15)} | Jogadas: ${graphJogadas.toString().padStart(3)} | Wins: ${graphGreens.toString().padStart(2)} (${assert.toFixed(1)}%) | Lucro: R$ ${graphLucro}`);
}

const totalLucro = totalRecebido - totalInvestido;
const totalROI = totalInvestido > 0 ? (totalLucro / totalInvestido * 100) : 0;
const totalAssert = totalJogadas > 0 ? (totalGreens / totalJogadas * 100) : 0;

log(`\n${'='.repeat(80)}`);
log(`RESUMO GERAL V5 (SNIPER)`);
log(`${'='.repeat(80)}`);
log(`Jogadas:      ${totalJogadas}`);
log(`Greens:       ${totalGreens}`);
log(`Assertividade: ${totalAssert.toFixed(2)}%`);
log(`Investido:    R$ ${totalInvestido.toFixed(2)}`);
log(`Recebido:     R$ ${totalRecebido.toFixed(2)}`);
log(`LUCRO LÍQUIDO: R$ ${totalLucro.toFixed(2)}`);
log(`ROI FINAL:     ${totalROI.toFixed(2)}%`);
log(`${'='.repeat(80)}\n`);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(graphsDir, `relatorio_modelo_v5_${timestamp}.txt`);
fs.writeFileSync(reportPath, outputBuffer);

console.log(outputBuffer); // Printar resumo no final
console.log(`\n📄 Relatório salvo em: ${reportPath}`);
