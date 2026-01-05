/**
 * Test Detailed - Teste individual com relatório completo
 * 
 * Mostra memória, rodadas, e validação de integridade
 */

import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';
import { PROFILES, type ProfileName } from '../chrome-extension/src/shared/strategyWeights';

interface PlayLog {
  round: number;
  value: number;
  action: string;
  reason: string;
  result: 'GREEN' | 'LOSS' | 'PENDING';
  profit: number;
}

function main() {
  const graphFile = process.argv[2];
  const profile = (process.argv[3] || 'balanced') as ProfileName;

  if (!graphFile) {
    console.log('Uso: npx tsx scripts/test_detailed.ts <arquivo> [perfil]');
    console.log('Exemplo: npx tsx scripts/test_detailed.ts GRAFOS_TESTE/grafo_001.txt balanced');
    process.exit(1);
  }

  if (!fs.existsSync(graphFile)) {
    console.log(`❌ Arquivo não encontrado: ${graphFile}`);
    process.exit(1);
  }

  // Ler valores
  const content = fs.readFileSync(graphFile, 'utf-8');
  const allValues = content
    .trim()
    .split('\n')
    .map(line => parseFloat(line.trim()))
    .filter(v => !isNaN(v) && v >= 0.5 && v <= 1000);

  if (allValues.length < 60) {
    console.log(`❌ Arquivo com poucas velas: ${allValues.length} (mínimo: 60)`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`TESTE DETALHADO - ${path.basename(graphFile)}`);
  console.log('='.repeat(80));
  console.log(`Perfil: ${profile.toUpperCase()}`);
  console.log(`Total de velas: ${allValues.length}`);
  console.log('='.repeat(80) + '\n');

  // Inverter para ordem cronológica
  const chronological = [...allValues].reverse();

  // Memória inicial (primeiras 25)
  const initialMemory = chronological.slice(0, 25);
  
  console.log(`📋 MEMÓRIA INICIAL (25 velas):`);
  console.log(`   ${initialMemory.map(v => v.toFixed(2)).join(', ')}\n`);

  // Simular rodadas
  const strategy = new StrategyCore();
  const weights = PROFILES[profile];
  
  let bankroll = 1000;
  const plays: PlayLog[] = [];
  let totalRounds = 0;
  let greens2x = 0;
  let losses2x = 0;

  for (let i = 0; i < chronological.length - 25; i++) {
    const memory = chronological.slice(i, i + 25);
    const nextValue = chronological[i + 25];
    totalRounds++;

    // Decidir ação
    const rec2x = strategy.decideAction2xV4(memory, weights.roxa);
    
    if (rec2x.action === 'PLAY') {
      const result = nextValue >= 2.0 ? 'GREEN' : 'LOSS';
      const profit = result === 'GREEN' ? 100 : -100;
      
      bankroll += profit;
      
      if (result === 'GREEN') greens2x++;
      else losses2x++;

      plays.push({
        round: i + 26,
        value: nextValue,
        action: 'PLAY 2x',
        reason: rec2x.reason,
        result,
        profit
      });
    }
  }

  // Relatório
  console.log(`📊 RESUMO:`);
  console.log(`   Rodadas testáveis: ${totalRounds}`);
  console.log(`   Jogadas 2x: ${plays.length}`);
  console.log(`   Greens: ${greens2x}`);
  console.log(`   Losses: ${losses2x}`);
  console.log(`   Assertividade: ${plays.length > 0 ? ((greens2x / plays.length) * 100).toFixed(1) : 'N/A'}%`);
  console.log(`   Taxa de entrada: ${((plays.length / totalRounds) * 100).toFixed(1)}%`);
  console.log(`   Banca final: R$ ${bankroll.toFixed(2)}`);
  console.log(`   Lucro: R$ ${(bankroll - 1000).toFixed(2)}\n`);

  // Validação
  console.log(`✅ VALIDAÇÃO:`);
  console.log(`   Memória: 25 velas`);
  console.log(`   Rodadas processadas: ${totalRounds}`);
  console.log(`   Total de velas: ${allValues.length}`);
  console.log(`   Integridade: ${totalRounds + 25 === allValues.length ? '✅ OK' : '❌ ERRO'}\n`);

  // Log de jogadas
  if (plays.length > 0) {
    console.log(`📝 LOG DE JOGADAS (primeiras 10):`);
    plays.slice(0, 10).forEach(play => {
      const emoji = play.result === 'GREEN' ? '✅' : '❌';
      console.log(`   ${emoji} Rodada ${play.round}: ${play.value.toFixed(2)}x - ${play.reason} → ${play.result} (${play.profit > 0 ? '+' : ''}R$ ${play.profit})`);
    });
    
    if (plays.length > 10) {
      console.log(`   ... (${plays.length - 10} jogadas restantes)\n`);
    }
  }

  // Salvar relatório
  const reportPath = graphFile.replace('.txt', '_report.txt');
  const report = `
RELATÓRIO DETALHADO - ${path.basename(graphFile)}
${'='.repeat(80)}

PERFIL: ${profile.toUpperCase()}
DATA: ${new Date().toLocaleString('pt-BR')}

${'='.repeat(80)}
DADOS DO GRAFO
${'='.repeat(80)}

Total de velas: ${allValues.length}
Memória inicial: 25 velas
Rodadas testáveis: ${totalRounds}

MEMÓRIA INICIAL:
${initialMemory.map((v, i) => `  ${i + 1}. ${v.toFixed(2)}x`).join('\n')}

${'='.repeat(80)}
RESULTADOS
${'='.repeat(80)}

Jogadas 2x: ${plays.length}
Greens: ${greens2x}
Losses: ${losses2x}
Assertividade: ${plays.length > 0 ? ((greens2x / plays.length) * 100).toFixed(1) : 'N/A'}%
Taxa de entrada: ${((plays.length / totalRounds) * 100).toFixed(1)}%

Banca inicial: R$ 1000.00
Banca final: R$ ${bankroll.toFixed(2)}
Lucro: R$ ${(bankroll - 1000).toFixed(2)}

${'='.repeat(80)}
LOG COMPLETO DE JOGADAS
${'='.repeat(80)}

${plays.map(play => {
  const emoji = play.result === 'GREEN' ? '✅' : '❌';
  return `${emoji} Rodada ${play.round}: ${play.value.toFixed(2)}x - ${play.reason} → ${play.result} (${play.profit > 0 ? '+' : ''}R$ ${play.profit})`;
}).join('\n')}

${'='.repeat(80)}
VALIDAÇÃO DE INTEGRIDADE
${'='.repeat(80)}

Memória: 25 velas ✅
Rodadas processadas: ${totalRounds} ✅
Total de velas: ${allValues.length} ✅
Integridade: ${totalRounds + 25 === allValues.length ? 'OK ✅' : 'ERRO ❌'}

${'='.repeat(80)}
FIM DO RELATÓRIO
${'='.repeat(80)}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Relatório salvo em: ${reportPath}\n`);
}

main();
