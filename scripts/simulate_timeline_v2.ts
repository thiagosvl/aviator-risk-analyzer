import fs from 'fs';
import path from 'path';

// Configuração da Simulação
const BANCA_INICIAL = 3000;
const APOSTA = 50;
const META_LUCRO_DIARIA = 500;
const STOP_LOSS_DIARIO = -500;

// Configuração da Estratégia (V5 PURE ROSA)
const TARGET = 10.0;
const ENTRY_TRIGGER = 2.0;

interface SimulationResult {
  estrategia: string;
  lucroTotal: number;
  diasPositivos: number;
  diasNegativos: number;
  diasNeutros: number;
  bancaFinal: number;
  quebrouBanca: boolean;
}

function simularEstrategia(estrategia: 'A' | 'B'): SimulationResult {
  const graphsDir = 'GRAFOS_TESTE';
  const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO_'))
    .slice(0, 30); // Apenas os 30 primeiros grafos (1h cada)

  let banca = BANCA_INICIAL;
  let lucroTotal = 0;
  let diasPositivos = 0;
  let diasNegativos = 0;
  let diasNeutros = 0;
  let quebrouBanca = false;

  console.log(`\n========================================`);
  console.log(`ESTRATÉGIA ${estrategia}: ${estrategia === 'A' ? 'SACAR E PARAR' : 'SACAR E CONTINUAR COM GORDURA'}`);
  console.log(`========================================`);

  for (const file of files) {
    if (quebrouBanca) break;

    let lucroDia = 0;
    let metaAtingida = false;
    let stopAtingido = false;

    const content = fs.readFileSync(path.join(graphsDir, file), 'utf-8');
    const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const chron = [...values].reverse();

    for (let i = 0; i < chron.length - 1; i++) {
      if (metaAtingida || stopAtingido) break;

      const current = chron[i];
      const next = chron[i + 1];

      if (current < ENTRY_TRIGGER) {
        banca -= APOSTA;
        lucroDia -= APOSTA;

        if (next >= TARGET) {
          banca += APOSTA * TARGET;
          lucroDia += APOSTA * TARGET;
        }
      }

      // Checar metas
      if (lucroDia >= META_LUCRO_DIARIA) {
        if (estrategia === 'A') {
          // ESTRATÉGIA A: Sacar e parar
          metaAtingida = true;
        } else {
          // ESTRATÉGIA B: Sacar e continuar com gordura
          banca -= META_LUCRO_DIARIA; // Saca o lucro
          lucroTotal += META_LUCRO_DIARIA;
          lucroDia = 0; // Reseta o lucro do dia
          // Continua jogando...
        }
      } else if (lucroDia <= STOP_LOSS_DIARIO) {
        stopAtingido = true;
      }

      // Checar se quebrou a banca
      if (banca <= 0) {
        quebrouBanca = true;
        break;
      }
    }

    // Finalizar o dia
    if (estrategia === 'A' && metaAtingida) {
      lucroTotal += lucroDia;
      diasPositivos++;
      console.log(`✅ ${file}: Meta atingida! Lucro: R$ ${lucroDia.toFixed(2)}`);
    } else if (stopAtingido) {
      lucroTotal += lucroDia;
      diasNegativos++;
      console.log(`❌ ${file}: Stop loss! Prejuízo: R$ ${lucroDia.toFixed(2)}`);
    } else {
      lucroTotal += lucroDia;
      if (lucroDia > 0) {
        diasPositivos++;
        console.log(`✅ ${file}: Grafo finalizado. Lucro: R$ ${lucroDia.toFixed(2)}`);
      } else if (lucroDia < 0) {
        diasNegativos++;
        console.log(`❌ ${file}: Grafo finalizado. Prejuízo: R$ ${lucroDia.toFixed(2)}`);
      } else {
        diasNeutros++;
        console.log(`➖ ${file}: Grafo finalizado. Neutro.`);
      }
    }
  }

  return {
    estrategia: estrategia === 'A' ? 'Sacar e Parar' : 'Sacar e Continuar',
    lucroTotal,
    diasPositivos,
    diasNegativos,
    diasNeutros,
    bancaFinal: banca,
    quebrouBanca
  };
}

// Simular ambas as estratégias
const resultadoA = simularEstrategia('A');
const resultadoB = simularEstrategia('B');

// Comparação
console.log(`\n\n========================================`);
console.log(`COMPARAÇÃO DAS ESTRATÉGIAS`);
console.log(`========================================`);
console.log(`\nESTRATÉGIA A (Sacar e Parar):`);
console.log(`  Lucro Total: R$ ${resultadoA.lucroTotal.toFixed(2)}`);
console.log(`  Banca Final: R$ ${resultadoA.bancaFinal.toFixed(2)}`);
console.log(`  Dias Positivos: ${resultadoA.diasPositivos} (${((resultadoA.diasPositivos / 30) * 100).toFixed(1)}%)`);
console.log(`  Dias Negativos: ${resultadoA.diasNegativos} (${((resultadoA.diasNegativos / 30) * 100).toFixed(1)}%)`);
console.log(`  Quebrou Banca: ${resultadoA.quebrouBanca ? 'SIM ❌' : 'NÃO ✅'}`);

console.log(`\nESTRATÉGIA B (Sacar e Continuar):`);
console.log(`  Lucro Total: R$ ${resultadoB.lucroTotal.toFixed(2)}`);
console.log(`  Banca Final: R$ ${resultadoB.bancaFinal.toFixed(2)}`);
console.log(`  Dias Positivos: ${resultadoB.diasPositivos} (${((resultadoB.diasPositivos / 30) * 100).toFixed(1)}%)`);
console.log(`  Dias Negativos: ${resultadoB.diasNegativos} (${((resultadoB.diasNegativos / 30) * 100).toFixed(1)}%)`);
console.log(`  Quebrou Banca: ${resultadoB.quebrouBanca ? 'SIM ❌' : 'NÃO ✅'}`);

console.log(`\n========================================`);
console.log(`MELHOR ESTRATÉGIA: ${resultadoA.lucroTotal > resultadoB.lucroTotal ? 'A (Sacar e Parar)' : 'B (Sacar e Continuar)'}`);
console.log(`========================================`);
