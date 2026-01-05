/**
 * Análise detalhada de um único grafo
 * Mostra cada jogada, score, e resultado
 */

import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';
import { setActiveProfile } from '../chrome-extension/src/shared/strategyWeights';

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Uso: npx tsx scripts/analyze_single_graph.ts <arquivo_grafo> [profile]');
    console.log('Exemplo: npx tsx scripts/analyze_single_graph.ts GRAFOS_TESTE/3_156.txt balanced');
    process.exit(1);
}

const graphFile = args[0];
const profile = (args[1] || 'balanced') as any;

setActiveProfile(profile);

// Ler valores
const content = fs.readFileSync(graphFile, 'utf-8');
const graphValues = content.split('\n')
    .map(line => parseFloat(line.trim()))
    .filter(v => !isNaN(v));

const MEMORY_SIZE = 25;
const chronological = [...graphValues].reverse();
const totalRounds = chronological.length - MEMORY_SIZE;

console.log(`\n${'='.repeat(80)}`);
console.log(`ANÁLISE DETALHADA: ${path.basename(graphFile)}`);
console.log(`${'='.repeat(80)}`);
console.log(`Total de velas: ${graphValues.length}`);
console.log(`Rodadas de teste: ${totalRounds}`);
console.log(`Perfil: ${profile.toUpperCase()}\n`);

let plays = 0, wins = 0, losses = 0;
let bankroll = 1000;
const BET = 100;

for (let i = 0; i < totalRounds; i++) {
    const memory = chronological.slice(i, i + MEMORY_SIZE);
    const nextValue = chronological[i + MEMORY_SIZE];
    const memoryForAnalysis = [...memory].reverse();
    
    const analysis = StrategyCore.analyze(memoryForAnalysis);
    
    if (analysis.recommendation2x.action === 'PLAY_2X') {
        plays++;
        const won = nextValue >= 2.0;
        if (won) {
            wins++;
            bankroll += BET;
        } else {
            losses++;
            bankroll -= BET;
        }
        
        const scoreBreakdown = analysis.recommendation2x.scoreBreakdown;
        
        console.log(`\n🎲 JOGADA #${plays} (Rodada ${i + 1}/${totalRounds})`);
        console.log(`   Próximo valor: ${nextValue.toFixed(2)}x ${won ? '✅ GREEN' : '❌ LOSS'}`);
        console.log(`   Score: ${scoreBreakdown?.total || 'N/A'}`);
        console.log(`   Conversion: ${analysis.conversionRate}%`);
        console.log(`   Streak: ${analysis.purpleStreak}`);
        console.log(`   Bankroll: R$ ${bankroll.toFixed(2)}`);
        
        if (scoreBreakdown) {
            console.log(`   Breakdown:`);
            scoreBreakdown.details.forEach(d => console.log(`      - ${d}`));
        }
    }
}

const assertividade = plays > 0 ? (wins / plays) * 100 : 0;
const profit = bankroll - 1000;

console.log(`\n${'='.repeat(80)}`);
console.log(`RESULTADO FINAL`);
console.log(`${'='.repeat(80)}`);
console.log(`Jogadas: ${plays}`);
console.log(`Greens: ${wins}`);
console.log(`Losses: ${losses}`);
console.log(`Assertividade: ${assertividade.toFixed(1)}%`);
console.log(`Lucro: R$ ${profit.toFixed(2)}`);
console.log(`ROI: ${((profit / 1000) * 100).toFixed(1)}%`);
console.log(`${'='.repeat(80)}\n`);
