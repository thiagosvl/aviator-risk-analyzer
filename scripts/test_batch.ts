/**
 * Teste em Massa - Processa múltiplos grafos e gera relatório consolidado
 */

import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';
import { getActiveWeights, setActiveProfile, type ProfileName } from '../chrome-extension/src/shared/strategyWeights';

interface GraphResult {
  filename: string;
  totalRounds: number;
  plays2x: number;
  wins2x: number;
  losses2x: number;
  assertividade2x: number;
  playsPink: number;
  winsPink: number;
  lossesPink: number;
  assertividadePink: number;
  profit: number;
  roi: number;
}

// Ler argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Uso: npx tsx scripts/test_batch.ts <pasta_grafos> [profile]');
    console.log('Exemplo: npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced');
    process.exit(1);
}

const graphsDir = args[0];
const profile = (args[1] || 'balanced') as ProfileName;

// Configurar perfil
setActiveProfile(profile);
const weights = getActiveWeights();

console.log(`\n${'='.repeat(80)}`);
console.log(`TESTE EM MASSA - SISTEMA V4.1`);
console.log(`${'='.repeat(80)}`);
console.log(`Pasta: ${graphsDir}`);
console.log(`Perfil: ${profile.toUpperCase()}`);
console.log(`Threshold 2x: ${weights.roxa.threshold}`);
console.log(`Threshold Pink: ${weights.rosa.threshold}`);
console.log(`${'='.repeat(80)}\n`);

// Encontrar todos os arquivos .txt
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt'))
    .sort();

if (files.length === 0) {
    console.log(`❌ Nenhum arquivo .txt encontrado em ${graphsDir}`);
    process.exit(1);
}

console.log(`📊 Encontrados ${files.length} grafos\n`);

// Processar cada grafo
const results: GraphResult[] = [];
const BET_2X = 100.0;
const BET_PINK = 50.0;
const MEMORY_SIZE = 25;

for (const file of files) {
    const filepath = path.join(graphsDir, file);
    
    // Ler valores
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    if (graphValues.length < MEMORY_SIZE) {
        console.log(`⚠️  ${file}: Poucas velas (${graphValues.length}), pulando...`);
        continue;
    }
    
    // Inverter para ordem cronológica
    const chronological = [...graphValues].reverse();
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    // Simular
    let plays2x = 0, wins2x = 0, losses2x = 0;
    let playsPink = 0, winsPink = 0, lossesPink = 0;
    let bankroll = 1000.0;
    
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        const memoryForAnalysis = [...memory].reverse();
        
        const analysis = StrategyCore.analyze(memoryForAnalysis);
        
        // Roxa
        if (analysis.recommendation2x.action === 'PLAY_2X') {
            plays2x++;
            if (nextValue >= 2.0) {
                wins2x++;
                bankroll += BET_2X;
            } else {
                losses2x++;
                bankroll -= BET_2X;
            }
        }
        
        // Rosa
        if (analysis.recommendationPink.action === 'PLAY_10X') {
            playsPink++;
            if (nextValue >= 10.0) {
                winsPink++;
                bankroll += (BET_PINK * 9);
            } else {
                lossesPink++;
                bankroll -= BET_PINK;
            }
        }
    }
    
    // Calcular métricas
    const assertividade2x = plays2x > 0 ? (wins2x / plays2x) * 100 : 0;
    const assertividadePink = playsPink > 0 ? (winsPink / playsPink) * 100 : 0;
    const profit = bankroll - 1000;
    const roi = (profit / 1000) * 100;
    
    results.push({
        filename: file,
        totalRounds,
        plays2x,
        wins2x,
        losses2x,
        assertividade2x,
        playsPink,
        winsPink,
        lossesPink,
        assertividadePink,
        profit,
        roi
    });
    
    console.log(`✅ ${file}: ${totalRounds} rodadas, ${plays2x} jogadas 2x, ${assertividade2x.toFixed(1)}% acerto, R$ ${profit.toFixed(2)}`);
}

// Relatório consolidado
console.log(`\n${'='.repeat(80)}`);
console.log(`RELATÓRIO CONSOLIDADO`);
console.log(`${'='.repeat(80)}\n`);

const totalGraphs = results.length;
const totalRounds = results.reduce((sum, r) => sum + r.totalRounds, 0);
const totalPlays2x = results.reduce((sum, r) => sum + r.plays2x, 0);
const totalWins2x = results.reduce((sum, r) => sum + r.wins2x, 0);
const totalLosses2x = results.reduce((sum, r) => sum + r.losses2x, 0);
const totalPlaysPink = results.reduce((sum, r) => sum + r.playsPink, 0);
const totalWinsPink = results.reduce((sum, r) => sum + r.winsPink, 0);
const totalLossesPink = results.reduce((sum, r) => sum + r.lossesPink, 0);
const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);

const avgAssertividade2x = totalPlays2x > 0 ? (totalWins2x / totalPlays2x) * 100 : 0;
const avgAssertividadePink = totalPlaysPink > 0 ? (totalWinsPink / totalPlaysPink) * 100 : 0;
const avgProfit = totalProfit / totalGraphs;
const avgROI = (avgProfit / 1000) * 100;

console.log(`📊 ESTATÍSTICAS GERAIS:`);
console.log(`   Grafos testados: ${totalGraphs}`);
console.log(`   Rodadas totais: ${totalRounds}`);
console.log(`   Média de rodadas/grafo: ${(totalRounds / totalGraphs).toFixed(1)}`);

console.log(`\n🟣 ESTRATÉGIA ROXA (2x):`);
console.log(`   Total de jogadas: ${totalPlays2x}`);
console.log(`   Greens: ${totalWins2x}`);
console.log(`   Losses: ${totalLosses2x}`);
console.log(`   Assertividade média: ${avgAssertividade2x.toFixed(1)}%`);
console.log(`   Taxa de entrada: ${((totalPlays2x / totalRounds) * 100).toFixed(1)}%`);

console.log(`\n🌸 ESTRATÉGIA ROSA (10x):`);
console.log(`   Total de jogadas: ${totalPlaysPink}`);
console.log(`   Greens: ${totalWinsPink}`);
console.log(`   Losses: ${totalLossesPink}`);
console.log(`   Assertividade média: ${totalPlaysPink > 0 ? avgAssertividadePink.toFixed(1) : 'N/A'}%`);
console.log(`   Taxa de entrada: ${((totalPlaysPink / totalRounds) * 100).toFixed(1)}%`);

console.log(`\n💰 FINANCEIRO:`);
console.log(`   Lucro total: R$ ${totalProfit.toFixed(2)}`);
console.log(`   Lucro médio/grafo: R$ ${avgProfit.toFixed(2)}`);
console.log(`   ROI médio: ${avgROI.toFixed(1)}%`);

// Distribuição de resultados
const lucrativos = results.filter(r => r.profit > 0).length;
const empates = results.filter(r => r.profit === 0).length;
const prejuizo = results.filter(r => r.profit < 0).length;

console.log(`\n📈 DISTRIBUIÇÃO:`);
console.log(`   Grafos lucrativos: ${lucrativos} (${((lucrativos / totalGraphs) * 100).toFixed(1)}%)`);
console.log(`   Grafos no empate: ${empates} (${((empates / totalGraphs) * 100).toFixed(1)}%)`);
console.log(`   Grafos com prejuízo: ${prejuizo} (${((prejuizo / totalGraphs) * 100).toFixed(1)}%)`);

// Top 5 melhores e piores
console.log(`\n🏆 TOP 5 MELHORES:`);
const top5 = [...results].sort((a, b) => b.profit - a.profit).slice(0, 5);
top5.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.filename}: R$ ${r.profit.toFixed(2)} (${r.assertividade2x.toFixed(1)}% acerto, ${r.plays2x} jogadas)`);
});

console.log(`\n💔 TOP 5 PIORES:`);
const bottom5 = [...results].sort((a, b) => a.profit - b.profit).slice(0, 5);
bottom5.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.filename}: R$ ${r.profit.toFixed(2)} (${r.assertividade2x.toFixed(1)}% acerto, ${r.plays2x} jogadas)`);
});

// Avaliação final
console.log(`\n${'='.repeat(80)}`);
console.log(`AVALIAÇÃO FINAL`);
console.log(`${'='.repeat(80)}\n`);

if (avgAssertividade2x >= 65) {
    console.log(`✅ Assertividade EXCELENTE (≥65%)`);
} else if (avgAssertividade2x >= 55) {
    console.log(`⚠️  Assertividade BOA (55-64%)`);
} else if (avgAssertividade2x >= 45) {
    console.log(`⚠️  Assertividade MEDIANA (45-54%)`);
} else {
    console.log(`❌ Assertividade BAIXA (<45%)`);
}

if (avgProfit > 300) {
    console.log(`✅ Lucro médio EXCELENTE (>R$300/grafo)`);
} else if (avgProfit > 100) {
    console.log(`⚠️  Lucro médio BOM (R$100-300/grafo)`);
} else if (avgProfit > 0) {
    console.log(`⚠️  Lucro médio BAIXO (R$0-100/grafo)`);
} else {
    console.log(`❌ PREJUÍZO médio (R$${avgProfit.toFixed(2)}/grafo)`);
}

const winRate = (lucrativos / totalGraphs) * 100;
if (winRate >= 70) {
    console.log(`✅ Taxa de vitória EXCELENTE (${winRate.toFixed(1)}%)`);
} else if (winRate >= 60) {
    console.log(`⚠️  Taxa de vitória BOA (${winRate.toFixed(1)}%)`);
} else {
    console.log(`❌ Taxa de vitória BAIXA (${winRate.toFixed(1)}%)`);
}

// Recomendações
console.log(`\n💡 RECOMENDAÇÕES:\n`);

if (totalPlays2x < totalRounds * 0.1) {
    console.log(`   • Poucas jogadas (${((totalPlays2x / totalRounds) * 100).toFixed(1)}%). Considere diminuir threshold para ${weights.roxa.threshold - 10}.`);
} else if (totalPlays2x > totalRounds * 0.3) {
    console.log(`   • Muitas jogadas (${((totalPlays2x / totalRounds) * 100).toFixed(1)}%). Considere aumentar threshold para ${weights.roxa.threshold + 10}.`);
}

if (avgAssertividade2x < 55) {
    console.log(`   • Assertividade baixa. Revise pesos das features ou aumente threshold.`);
}

if (totalPlaysPink === 0) {
    console.log(`   • Estratégia Rosa não ativou. Considere diminuir threshold para ${weights.rosa.threshold - 10}.`);
}

if (winRate < 60) {
    console.log(`   • Taxa de vitória baixa. Sistema precisa de ajustes.`);
}

// Análise de regras
console.log(`\n${'='.repeat(80)}`);
console.log(`ANÁLISE DE REGRAS`);
console.log(`${'='.repeat(80)}\n`);

// Analisar quais features mais contribuem
if (totalPlays2x > 0) {
    console.log(`📊 ANÁLISE DE PERFORMANCE:\n`);
    
    // Taxa de entrada
    const entryRate = (totalPlays2x / totalRounds) * 100;
    if (entryRate < 5) {
        console.log(`   ⚠️  Taxa de entrada MUITO BAIXA (${entryRate.toFixed(1)}%)`);
        console.log(`      → Sistema está jogando pouco demais`);
        console.log(`      → Sugestão: Diminuir threshold em 5-10 pontos\n`);
    } else if (entryRate > 20) {
        console.log(`   ⚠️  Taxa de entrada MUITO ALTA (${entryRate.toFixed(1)}%)`);
        console.log(`      → Sistema está jogando demais`);
        console.log(`      → Sugestão: Aumentar threshold em 5-10 pontos\n`);
    } else {
        console.log(`   ✅ Taxa de entrada ADEQUADA (${entryRate.toFixed(1)}%)\n`);
    }
    
    // Assertividade
    if (avgAssertividade2x < 50) {
        console.log(`   ❌ ASSERTIVIDADE CRÍTICA (${avgAssertividade2x.toFixed(1)}%)`);
        console.log(`      → Regras estão falhando muito`);
        console.log(`      → Sugestões:`);
        console.log(`         1. Aumentar threshold para ser mais seletivo`);
        console.log(`         2. Revisar pesos das features`);
        console.log(`         3. Adicionar mais hard blocks\n`);
    } else if (avgAssertividade2x < 60) {
        console.log(`   ⚠️  ASSERTIVIDADE BAIXA (${avgAssertividade2x.toFixed(1)}%)`);
        console.log(`      → Precisa melhorar`);
        console.log(`      → Sugestão: Ajustar pesos ou threshold\n`);
    } else if (avgAssertividade2x < 70) {
        console.log(`   ✅ ASSERTIVIDADE BOA (${avgAssertividade2x.toFixed(1)}%)`);
        console.log(`      → Sistema funcionando bem`);
        console.log(`      → Pode otimizar ainda mais\n`);
    } else {
        console.log(`   🎉 ASSERTIVIDADE EXCELENTE (${avgAssertividade2x.toFixed(1)}%)`);
        console.log(`      → Sistema muito bem calibrado!\n`);
    }
    
    // ROI
    if (avgROI < -10) {
        console.log(`   🚨 PREJUÍZO ALTO (${avgROI.toFixed(1)}% ROI)`);
        console.log(`      → URGENTE: Sistema precisa de ajustes imediatos`);
        console.log(`      → Sugestão: Aumentar threshold drasticamente\n`);
    } else if (avgROI < 0) {
        console.log(`   ❌ PREJUÍZO (${avgROI.toFixed(1)}% ROI)`);
        console.log(`      → Sistema não está lucrando`);
        console.log(`      → Sugestão: Revisar estratégia\n`);
    } else if (avgROI < 10) {
        console.log(`   ⚠️  LUCRO BAIXO (${avgROI.toFixed(1)}% ROI)`);
        console.log(`      → Pode melhorar`);
        console.log(`      → Meta: 20-30% ROI\n`);
    } else if (avgROI < 30) {
        console.log(`   ✅ LUCRO BOM (${avgROI.toFixed(1)}% ROI)`);
        console.log(`      → Sistema lucrativo!\n`);
    } else {
        console.log(`   🎉 LUCRO EXCELENTE (${avgROI.toFixed(1)}% ROI)`);
        console.log(`      → Sistema muito lucrativo!\n`);
    }
    
    // Consistência
    if (winRate >= 70) {
        console.log(`   ✅ CONSISTÊNCIA ALTA (${winRate.toFixed(1)}% grafos lucrativos)`);
        console.log(`      → Sistema confiável\n`);
    } else if (winRate >= 50) {
        console.log(`   ⚠️  CONSISTÊNCIA MÉDIA (${winRate.toFixed(1)}% grafos lucrativos)`);
        console.log(`      → Precisa melhorar estabilidade\n`);
    } else {
        console.log(`   ❌ CONSISTÊNCIA BAIXA (${winRate.toFixed(1)}% grafos lucrativos)`);
        console.log(`      → Sistema instável\n`);
    }
}

console.log(`\n${'='.repeat(80)}\n`);

// Salvar relatório
const reportPath = path.join(graphsDir, `relatorio_${profile}_${Date.now()}.txt`);
const report = `
RELATÓRIO CONSOLIDADO - ${new Date().toLocaleString('pt-BR')}
Perfil: ${profile.toUpperCase()}
Threshold 2x: ${weights.roxa.threshold}
Threshold Pink: ${weights.rosa.threshold}

ESTATÍSTICAS:
- Grafos: ${totalGraphs}
- Rodadas: ${totalRounds}
- Jogadas 2x: ${totalPlays2x}
- Assertividade 2x: ${avgAssertividade2x.toFixed(1)}%
- Lucro médio: R$ ${avgProfit.toFixed(2)}
- ROI médio: ${avgROI.toFixed(1)}%
- Taxa de vitória: ${winRate.toFixed(1)}%

DETALHES POR GRAFO:
${results.map(r => `${r.filename}: ${r.plays2x} jogadas, ${r.assertividade2x.toFixed(1)}% acerto, R$ ${r.profit.toFixed(2)}`).join('\n')}
`;

fs.writeFileSync(reportPath, report);
console.log(`📄 Relatório salvo em: ${reportPath}\n`);
