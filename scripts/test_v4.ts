/**
 * Teste V4.0 - PROCESSAMENTO CORRETO DE GRAFOS
 * 
 * ORDEM DE LEITURA:
 * - Grafo vem com velas mais recentes PRIMEIRO (esquerda → direita, linha por linha)
 * - Precisamos INVERTER para ordem cronológica (mais antiga → mais recente)
 * - Memória inicial = últimas 25 velas do histórico
 * - Simulamos rodada por rodada, atualizando memória
 */

import fs from 'fs';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';
import { getActiveWeights, setActiveProfile, type ProfileName } from '../chrome-extension/src/shared/strategyWeights';

// Ler argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Uso: npx tsx scripts/test_v4.ts <arquivo_grafo> [profile]');
    console.log('Profiles disponíveis: balanced, conservative, aggressive, experimental');
    process.exit(1);
}

const graphFile = args[0];
const profile = (args[1] || 'balanced') as ProfileName;

// Configurar perfil
setActiveProfile(profile);
const weights = getActiveWeights();

console.log(`\n${'='.repeat(80)}`);
console.log(`TESTE V4.0 - SISTEMA DE PONTUAÇÃO (PROCESSAMENTO CORRETO)`);
console.log(`${'='.repeat(80)}`);
console.log(`Grafo: ${graphFile}`);
console.log(`Perfil: ${profile.toUpperCase()}`);
console.log(`Threshold 2x: ${weights.roxa.threshold}`);
console.log(`Threshold Pink: ${weights.rosa.threshold}`);
console.log(`${'='.repeat(80)}\n`);

// Ler valores do grafo
const content = fs.readFileSync(graphFile, 'utf-8');
const graphValues = content.split('\n')
    .map(line => parseFloat(line.trim()))
    .filter(v => !isNaN(v));

console.log(`📊 Total de velas no grafo: ${graphValues.length}`);

// IMPORTANTE: Grafo vem com velas mais recentes PRIMEIRO
// Precisamos INVERTER para ordem cronológica
const chronological = [...graphValues].reverse();

console.log(`📅 Ordem cronológica: ${chronological.length} velas (mais antiga → mais recente)`);

// Memória inicial = últimas 25 velas
const MEMORY_SIZE = 25;
if (chronological.length < MEMORY_SIZE) {
    console.log(`\n❌ Erro: Grafo tem menos de ${MEMORY_SIZE} velas!`);
    process.exit(1);
}

const totalRounds = chronological.length - MEMORY_SIZE;
console.log(`🎯 Rodadas testáveis: ${totalRounds}\n`);

// Estatísticas
let plays2x = 0;
let playsPink = 0;
let wins2x = 0;
let losses2x = 0;
let winsPink = 0;
let lossesPink = 0;
let bankroll = 1000.0;
const BET_2X = 100.0;
const BET_PINK = 50.0;

// Simular rodadas
const showDetails = process.argv.includes('--details');
const maxRoundsToShow = showDetails ? totalRounds : 20;

console.log(`🎮 SIMULAÇÃO (mostrando ${maxRoundsToShow} rodadas):\n`);

for (let i = 0; i < totalRounds; i++) {
    // Memória = últimas 25 velas até este ponto
    const memoryStart = i;
    const memoryEnd = i + MEMORY_SIZE;
    const memory = chronological.slice(memoryStart, memoryEnd);
    
    // Próxima vela (a que vai acontecer)
    const nextValue = chronological[memoryEnd];
    
    // StrategyCore espera [recente, ..., antiga], então invertemos
    const memoryForAnalysis = [...memory].reverse();
    
    // Analisar
    const analysis = StrategyCore.analyze(memoryForAnalysis);
    const rec2x = analysis.recommendation2x;
    const recPink = analysis.recommendationPink;
    
    // Mostrar detalhes (primeiras N rodadas)
    if (i < maxRoundsToShow) {
        console.log(`━━━ Rodada ${i + 1}/${totalRounds} ━━━ Próxima vela: ${nextValue.toFixed(2)}x`);
        
        // Roxa
        console.log(`\n🟣 ROXA (2x):`);
        console.log(`   Ação: ${rec2x.action}`);
        console.log(`   Razão: ${rec2x.reason}`);
        
        if (rec2x.scoreBreakdown && rec2x.action !== 'STOP') {
            const sb = rec2x.scoreBreakdown;
            console.log(`   Score: ${sb.total} (Threshold: ${weights.roxa.threshold})`);
            if (showDetails) {
                console.log(`   Breakdown:`);
                sb.details.forEach(d => console.log(`      ${d}`));
            }
        }
        
        // Rosa
        console.log(`\n🌸 ROSA (10x):`);
        console.log(`   Ação: ${recPink.action}`);
        console.log(`   Razão: ${recPink.reason}`);
        
        if (recPink.scoreBreakdown && recPink.action !== 'WAIT') {
            const sb = recPink.scoreBreakdown;
            console.log(`   Score: ${sb.total} (Threshold: ${weights.rosa.threshold})`);
            if (showDetails) {
                console.log(`   Breakdown:`);
                sb.details.forEach(d => console.log(`      ${d}`));
            }
        }
    }
    
    // Processar jogadas
    if (rec2x.action === 'PLAY_2X') {
        plays2x++;
        if (nextValue >= 2.0) {
            wins2x++;
            bankroll += BET_2X;
            if (i < maxRoundsToShow) console.log(`   ✅ GREEN 2x! (+R$ ${BET_2X})`);
        } else {
            losses2x++;
            bankroll -= BET_2X;
            if (i < maxRoundsToShow) console.log(`   ❌ LOSS 2x (-R$ ${BET_2X})`);
        }
    }
    
    if (recPink.action === 'PLAY_10X') {
        playsPink++;
        if (nextValue >= 10.0) {
            winsPink++;
            bankroll += (BET_PINK * 9); // Lucro = 10x - aposta
            if (i < maxRoundsToShow) console.log(`   ✅ GREEN PINK! (+R$ ${BET_PINK * 9})`);
        } else {
            lossesPink++;
            bankroll -= BET_PINK;
            if (i < maxRoundsToShow) console.log(`   ❌ LOSS PINK (-R$ ${BET_PINK})`);
        }
    }
    
    if (i < maxRoundsToShow) {
        console.log(`   💰 Banca: R$ ${bankroll.toFixed(2)}\n`);
    }
}

// Resumo final
console.log(`\n${'='.repeat(80)}`);
console.log(`RESUMO FINAL - ${totalRounds} rodadas testadas`);
console.log(`${'='.repeat(80)}`);

const assertividade2x = plays2x > 0 ? ((wins2x / plays2x) * 100) : 0;
const assertividadePink = playsPink > 0 ? ((winsPink / playsPink) * 100) : 0;

console.log(`\n🟣 ROXA (2x):`);
console.log(`   Jogadas: ${plays2x}`);
console.log(`   Greens: ${wins2x}`);
console.log(`   Losses: ${losses2x}`);
console.log(`   Assertividade: ${assertividade2x.toFixed(1)}%`);
console.log(`   Taxa de entrada: ${((plays2x / totalRounds) * 100).toFixed(1)}%`);

console.log(`\n🌸 ROSA (10x):`);
console.log(`   Jogadas: ${playsPink}`);
console.log(`   Greens: ${winsPink}`);
console.log(`   Losses: ${lossesPink}`);
console.log(`   Assertividade: ${playsPink > 0 ? assertividadePink.toFixed(1) : 'N/A'}%`);
console.log(`   Taxa de entrada: ${((playsPink / totalRounds) * 100).toFixed(1)}%`);

const profit2x = (wins2x * BET_2X) - (losses2x * BET_2X);
const profitPink = (winsPink * BET_PINK * 9) - (lossesPink * BET_PINK);
const totalProfit = profit2x + profitPink;

console.log(`\n💰 FINANCEIRO:`);
console.log(`   Banca Inicial: R$ 1000.00`);
console.log(`   Lucro 2x: R$ ${profit2x.toFixed(2)}`);
console.log(`   Lucro Pink: R$ ${profitPink.toFixed(2)}`);
console.log(`   Lucro Total: R$ ${totalProfit.toFixed(2)}`);
console.log(`   Banca Final: R$ ${bankroll.toFixed(2)}`);
console.log(`   ROI: ${((totalProfit / 1000) * 100).toFixed(1)}%`);

// Avaliação
console.log(`\n📊 AVALIAÇÃO:`);
if (assertividade2x >= 65) {
    console.log(`   ✅ Assertividade 2x EXCELENTE (≥65%)`);
} else if (assertividade2x >= 55) {
    console.log(`   ⚠️  Assertividade 2x BOA (55-64%)`);
} else if (assertividade2x >= 45) {
    console.log(`   ⚠️  Assertividade 2x MEDIANA (45-54%)`);
} else {
    console.log(`   ❌ Assertividade 2x BAIXA (<45%)`);
}

if (totalProfit > 300) {
    console.log(`   ✅ Lucro EXCELENTE (>R$300)`);
} else if (totalProfit > 100) {
    console.log(`   ⚠️  Lucro BOM (R$100-300)`);
} else if (totalProfit > 0) {
    console.log(`   ⚠️  Lucro BAIXO (R$0-100)`);
} else {
    console.log(`   ❌ PREJUÍZO (R$${totalProfit.toFixed(2)})`);
}

console.log(`\n${'='.repeat(80)}\n`);

// Dica
if (plays2x < totalRounds * 0.1) {
    console.log(`💡 DICA: Poucas jogadas (${((plays2x / totalRounds) * 100).toFixed(1)}%). Considere diminuir threshold.`);
} else if (plays2x > totalRounds * 0.3) {
    console.log(`💡 DICA: Muitas jogadas (${((plays2x / totalRounds) * 100).toFixed(1)}%). Considere aumentar threshold.`);
}

if (assertividade2x < 50 && plays2x >= 10) {
    console.log(`💡 DICA: Assertividade baixa. Revise pesos das features ou aumente threshold.`);
}

console.log();
