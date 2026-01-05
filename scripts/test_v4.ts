/**
 * Teste Rápido do Sistema V4.0
 * Mostra scores e decisões para cada rodada
 */

import fs from 'fs';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';
import { getActiveWeights, setActiveProfile, type ProfileName } from '../chrome-extension/src/shared/strategyWeights';

// Ler arquivo de grafo
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
console.log(`TESTE V4.0 - SISTEMA DE PONTUAÇÃO`);
console.log(`${'='.repeat(80)}`);
console.log(`Grafo: ${graphFile}`);
console.log(`Perfil: ${profile.toUpperCase()}`);
console.log(`Threshold 2x: ${weights.roxa.threshold}`);
console.log(`Threshold Pink: ${weights.rosa.threshold}`);
console.log(`${'='.repeat(80)}\n`);

// Ler valores
const content = fs.readFileSync(graphFile, 'utf-8');
const allValues = content.split('\n')
    .map(line => parseFloat(line.trim()))
    .filter(v => !isNaN(v));

console.log(`📊 Total de rodadas: ${allValues.length}\n`);

// Simular sessão
const MEMORY_SIZE = 60;
const memory = allValues.slice(0, MEMORY_SIZE);
const sequence = allValues.slice(MEMORY_SIZE);

let plays2x = 0;
let playsPink = 0;
let wins2x = 0;
let losses2x = 0;
let winsPink = 0;
let lossesPink = 0;

console.log(`🎯 ANÁLISE RODADA POR RODADA:\n`);

for (let i = 0; i < Math.min(sequence.length, 20); i++) {
    const currentValue = sequence[i];
    const history = [...memory, ...sequence.slice(0, i)].reverse();
    
    // Analisar
    const analysis = StrategyCore.analyze(history);
    
    const rec2x = analysis.recommendation2x;
    const recPink = analysis.recommendationPink;
    
    console.log(`\n━━━ Rodada ${i + 1} ━━━ Valor: ${currentValue.toFixed(2)}x`);
    
    // Mostrar 2x
    console.log(`\n🟣 ROXA (2x):`);
    console.log(`   Ação: ${rec2x.action}`);
    console.log(`   Razão: ${rec2x.reason}`);
    
    if (rec2x.scoreBreakdown) {
        const sb = rec2x.scoreBreakdown;
        console.log(`   Score Total: ${sb.total}`);
        console.log(`   Breakdown:`);
        sb.details.forEach(d => console.log(`      ${d}`));
    }
    
    if (rec2x.action === 'PLAY_2X') {
        plays2x++;
        if (currentValue >= 2.0) {
            wins2x++;
            console.log(`   ✅ GREEN!`);
        } else {
            losses2x++;
            console.log(`   ❌ LOSS`);
        }
    }
    
    // Mostrar Pink
    console.log(`\n🌸 ROSA (10x):`);
    console.log(`   Ação: ${recPink.action}`);
    console.log(`   Razão: ${recPink.reason}`);
    
    if (recPink.scoreBreakdown) {
        const sb = recPink.scoreBreakdown;
        console.log(`   Score Total: ${sb.total}`);
        console.log(`   Breakdown:`);
        sb.details.forEach(d => console.log(`      ${d}`));
    }
    
    if (recPink.action === 'PLAY_10X') {
        playsPink++;
        if (currentValue >= 10.0) {
            winsPink++;
            console.log(`   ✅ GREEN!`);
        } else {
            lossesPink++;
            console.log(`   ❌ LOSS`);
        }
    }
}

// Resumo
console.log(`\n${'='.repeat(80)}`);
console.log(`RESUMO - Primeiras 20 rodadas:`);
console.log(`${'='.repeat(80)}`);

console.log(`\n🟣 ROXA (2x):`);
console.log(`   Jogadas: ${plays2x}`);
console.log(`   Greens: ${wins2x}`);
console.log(`   Losses: ${losses2x}`);
console.log(`   Assertividade: ${plays2x > 0 ? ((wins2x / plays2x) * 100).toFixed(1) : 0}%`);

console.log(`\n🌸 ROSA (10x):`);
console.log(`   Jogadas: ${playsPink}`);
console.log(`   Greens: ${winsPink}`);
console.log(`   Losses: ${lossesPink}`);
console.log(`   Assertividade: ${playsPink > 0 ? ((winsPink / playsPink) * 100).toFixed(1) : 0}%`);

const profit2x = (wins2x * 100) - (losses2x * 100);
const profitPink = (winsPink * 450) - (lossesPink * 50);
const totalProfit = profit2x + profitPink;

console.log(`\n💰 FINANCEIRO:`);
console.log(`   Lucro 2x: R$ ${profit2x.toFixed(2)}`);
console.log(`   Lucro Pink: R$ ${profitPink.toFixed(2)}`);
console.log(`   Lucro Total: R$ ${totalProfit.toFixed(2)}`);
console.log(`   Banca Final: R$ ${(1000 + totalProfit).toFixed(2)}`);

console.log(`\n${'='.repeat(80)}\n`);
