import fs from 'fs';
import path from 'path';

// Configuração da Simulação
const BANCA_INICIAL = 1000;
const APOSTA = 50;
const META_LUCRO_DIARIA = 500; // Para quando bater 1500
const STOP_LOSS_DIARIO = -500; // Para quando chegar em 500

// Configuração da Estratégia (V5 PURE ROSA)
const TARGET = 10.0;
const ENTRY_TRIGGER = 2.0;

interface RoundResult {
  grafo: string;
  rodada: number;
  decisao: 'JOGAR' | 'AGUARDAR';
  resultado: 'WIN' | 'LOSS' | 'N/A';
  banca: number;
  lucroDia: number;
}

const timeline: RoundResult[] = [];

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO_'));

console.log(`
🚀 SIMULANDO LINHA DO TEMPO COM GESTÃO DE BANCA
`);
console.log(`Banca Inicial: R$ ${BANCA_INICIAL}`);
console.log(`Aposta: R$ ${APOSTA}`);
console.log(`Meta de Lucro: R$ ${META_LUCRO_DIARIA} (Banca = ${BANCA_INICIAL + META_LUCRO_DIARIA})`);
console.log(`Stop Loss: R$ ${STOP_LOSS_DIARIO} (Banca = ${BANCA_INICIAL + STOP_LOSS_DIARIO})`);

let banca = BANCA_INICIAL;
let lucroTotal = 0;
let diasPositivos = 0;
let diasNegativos = 0;
let diasNeutros = 0;

for (const file of files) {
  console.log(`\n--- INICIANDO GRAFO: ${file} ---`);
  banca = BANCA_INICIAL; // Reseta a banca para cada "dia" (grafo)
  let lucroDia = 0;
  let diaFinalizado = false;

  const content = fs.readFileSync(path.join(graphsDir, file), 'utf-8');
  const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  const chron = [...values].reverse();

  for (let i = 0; i < chron.length - 1; i++) {
    if (diaFinalizado) break;

    const current = chron[i];
    const next = chron[i + 1];

    let decisao: 'JOGAR' | 'AGUARDAR' = 'AGUARDAR';
    let resultado: 'WIN' | 'LOSS' | 'N/A' = 'N/A';

    if (current < ENTRY_TRIGGER) {
      decisao = 'JOGAR';
      banca -= APOSTA;
      lucroDia -= APOSTA;

      if (next >= TARGET) {
        resultado = 'WIN';
        banca += APOSTA * TARGET; // Ganhamos 10x a aposta
        lucroDia += APOSTA * TARGET;
      } else {
        resultado = 'LOSS';
      }
    }

    timeline.push({ grafo: file, rodada: i + 1, decisao, resultado, banca, lucroDia });

    // Checar metas
    if (lucroDia >= META_LUCRO_DIARIA) {
      console.log(`🎯 META ATINGIDA! Lucro do dia: R$ ${lucroDia.toFixed(2)}`);
      diasPositivos++;
      diaFinalizado = true;
    } else if (lucroDia <= STOP_LOSS_DIARIO) {
      console.log(`🚨 STOP LOSS ATINGIDO! Prejuízo do dia: R$ ${lucroDia.toFixed(2)}`);
      diasNegativos++;
      diaFinalizado = true;
    }
  }

  if (!diaFinalizado) {
    if (lucroDia > 0) diasPositivos++;
    else if (lucroDia < 0) diasNegativos++;
    else diasNeutros++;
    console.log(`🏁 GRAFO FINALIZADO! Resultado do dia: R$ ${lucroDia.toFixed(2)}`);
  }
  lucroTotal += lucroDia;
}

// --- ANÁLISE FINAL ---
let output = 'GRAFO,RODADA,DECISAO,RESULTADO,BANCA,LUCRO_DIA\n';
timeline.forEach(r => {
  output += `${r.grafo},${r.rodada},${r.decisao},${r.resultado},${r.banca.toFixed(2)},${r.lucroDia.toFixed(2)}\n`;
});
fs.writeFileSync('timeline_banca.csv', output);
console.log('\n\n📄 Linha do tempo completa salva em: timeline_banca.csv');

console.log(`\n========================================`);
console.log(`🏁 RESULTADO FINAL DA SIMULAÇÃO (32 DIAS)`);
console.log(`========================================`);
console.log(`Lucro Líquido Total: R$ ${lucroTotal.toFixed(2)}`);
console.log(`Dias Positivos: ${diasPositivos} (${((diasPositivos / files.length) * 100).toFixed(1)}%)`);
console.log(`Dias Negativos: ${diasNegativos} (${((diasNegativos / files.length) * 100).toFixed(1)}%)`);
console.log(`Dias Neutros: ${diasNeutros} (${((diasNeutros / files.length) * 100).toFixed(1)}%)`);

const maxDrawdown = Math.min(...timeline.map(r => r.lucroDia));
console.log(`Pior Drawdown em um dia: R$ ${maxDrawdown.toFixed(2)}`);
