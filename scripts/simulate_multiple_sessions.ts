import fs from 'fs';
import path from 'path';

// Configuração
const BANCA_INICIAL = 3000;
const APOSTA = 50;
const META_SESSAO = 500;
const STOP_LOSS_SESSAO = -500;
const TARGET = 10.0;
const ENTRY_TRIGGER = 2.0;

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
  .filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO_'))
  .slice(0, 30);

console.log(`
🚀 SIMULAÇÃO: MÚLTIPLAS SESSÕES POR DIA
========================================
Banca Inicial: R$ ${BANCA_INICIAL}
Meta por Sessão: R$ ${META_SESSAO}
Stop Loss por Sessão: R$ ${STOP_LOSS_SESSAO}
`);

let banca = BANCA_INICIAL;
let lucroAcumulado = 0;
let sessaoIndex = 0;
let diasPositivos = 0;
let diasNegativos = 0;
let diasNeutros = 0;

for (let diaIndex = 0; diaIndex < files.length; diaIndex++) {
  console.log(`\n========================================`);
  console.log(`DIA ${diaIndex + 1}`);
  console.log(`========================================`);
  
  let lucroDia = 0;
  let sessoesDia = 0;
  
  // Jogar múltiplas sessões no mesmo dia
  while (true) {
    sessaoIndex++;
    sessoesDia++;
    
    const file = files[diaIndex];
    const content = fs.readFileSync(path.join(graphsDir, file), 'utf-8');
    const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const chron = [...values].reverse();
    
    let lucroSessao = 0;
    let metaAtingida = false;
    let stopAtingido = false;
    
    console.log(`\n  Sessão ${sessoesDia} (Grafo: ${file}):`);
    
    for (let i = 0; i < chron.length - 1; i++) {
      if (metaAtingida || stopAtingido) break;
      
      const current = chron[i];
      const next = chron[i + 1];
      
      if (current < ENTRY_TRIGGER) {
        banca -= APOSTA;
        lucroSessao -= APOSTA;
        
        if (next >= TARGET) {
          banca += APOSTA * TARGET;
          lucroSessao += APOSTA * TARGET;
        }
      }
      
      if (lucroSessao >= META_SESSAO) {
        metaAtingida = true;
      } else if (lucroSessao <= STOP_LOSS_SESSAO) {
        stopAtingido = true;
      }
    }
    
    lucroDia += lucroSessao;
    lucroAcumulado += lucroSessao;
    
    if (metaAtingida) {
      console.log(`    ✅ META ATINGIDA! Lucro da sessão: R$ ${lucroSessao.toFixed(2)}`);
      console.log(`    💰 Lucro acumulado do dia: R$ ${lucroDia.toFixed(2)}`);
      console.log(`    🔄 Continuar jogando? ${lucroDia >= 0 ? 'SIM (saldo positivo)' : 'NÃO (saldo negativo)'}`);
      
      // Se o saldo do dia ainda é positivo, continua jogando
      if (lucroDia >= 0) {
        // Mas não temos mais grafos, então para
        break;
      } else {
        break;
      }
    } else if (stopAtingido) {
      console.log(`    ❌ STOP LOSS! Prejuízo da sessão: R$ ${lucroSessao.toFixed(2)}`);
      console.log(`    💰 Lucro acumulado do dia: R$ ${lucroDia.toFixed(2)}`);
      
      // Se o saldo do dia ainda é positivo ou zero, pode continuar
      if (lucroDia >= 0) {
        console.log(`    🔄 Saldo do dia ainda é positivo/zero. Pode continuar, mas vamos parar aqui.`);
      }
      break;
    } else {
      console.log(`    🏁 Grafo finalizado. Lucro da sessão: R$ ${lucroSessao.toFixed(2)}`);
      break;
    }
  }
  
  console.log(`\n  📊 RESULTADO DO DIA ${diaIndex + 1}:`);
  console.log(`    Sessões jogadas: ${sessoesDia}`);
  console.log(`    Lucro do dia: R$ ${lucroDia.toFixed(2)}`);
  console.log(`    Banca atual: R$ ${banca.toFixed(2)}`);
  
  if (lucroDia > 0) diasPositivos++;
  else if (lucroDia < 0) diasNegativos++;
  else diasNeutros++;
}

console.log(`\n\n========================================`);
console.log(`RESULTADO FINAL (30 DIAS)`);
console.log(`========================================`);
console.log(`Lucro Total: R$ ${lucroAcumulado.toFixed(2)}`);
console.log(`Banca Final: R$ ${banca.toFixed(2)}`);
console.log(`Dias Positivos: ${diasPositivos} (${((diasPositivos / 30) * 100).toFixed(1)}%)`);
console.log(`Dias Negativos: ${diasNegativos} (${((diasNegativos / 30) * 100).toFixed(1)}%)`);
console.log(`Dias Neutros: ${diasNeutros} (${((diasNeutros / 30) * 100).toFixed(1)}%)`);
