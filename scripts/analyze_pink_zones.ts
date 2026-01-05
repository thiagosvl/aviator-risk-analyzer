/**
 * ANÁLISE COMPLETA DAS ROSAS
 * - Recalcular roxa incluindo rosas (≥10x também paga ≥2x)
 * - Analisar zona de tiro: ANTES, DURANTE, DEPOIS do padrão
 */

import fs from 'fs';
import path from 'path';

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir)
    .filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'))
    .sort();

const MEMORY_SIZE = 25;

console.log(`\n${'='.repeat(80)}`);
console.log(`ANÁLISE COMPLETA DAS ROSAS - ZONA DE TIRO`);
console.log(`${'='.repeat(80)}\n`);

for (const file of files) {
    const filepath = path.join(graphsDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const graphValues = content.split('\n')
        .map(line => parseFloat(line.trim()))
        .filter(v => !isNaN(v));
    
    const chronological = [...graphValues].reverse();
    const totalRounds = chronological.length - MEMORY_SIZE;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 GRAFO: ${file}`);
    console.log(`${'='.repeat(80)}`);
    
    // Identificar todas as rosas
    const pinkPositions: number[] = [];
    for (let i = 0; i < chronological.length; i++) {
        if (chronological[i] >= 10.0) {
            pinkPositions.push(i);
        }
    }
    
    console.log(`\n🌸 ROSAS NO GRAFO:`);
    console.log(`   Total: ${pinkPositions.length}`);
    console.log(`   Posições: ${pinkPositions.join(', ')}`);
    
    // Para cada rodada, verificar se é antes/durante/depois de uma rosa
    let roxaTotal = 0, roxaGreens = 0;
    let roxaSemRosa = 0, roxaSemRosaGreens = 0;
    let roxaComRosa = 0, roxaComRosaGreens = 0;
    
    let rosaAntes = 0, rosaAntesGreens = 0;
    let rosaDurante = 0, rosaDuranteGreens = 0;
    let rosaDepois = 0, rosaDepoisGreens = 0;
    
    const zonaDetalhes: { rodada: number; zona: string; nextValue: number; isGreen: boolean }[] = [];
    
    for (let i = 0; i < totalRounds; i++) {
        const memory = chronological.slice(i, i + MEMORY_SIZE);
        const nextValue = chronological[i + MEMORY_SIZE];
        
        // Contar ROXA (≥2x, incluindo rosas!)
        const isRoxaGreen = nextValue >= 2.0;
        roxaTotal++;
        if (isRoxaGreen) roxaGreens++;
        
        // Verificar se há rosa na janela
        const hasPinkInWindow = memory.some(v => v >= 10.0);
        
        if (hasPinkInWindow) {
            roxaComRosa++;
            if (isRoxaGreen) roxaComRosaGreens++;
        } else {
            roxaSemRosa++;
            if (isRoxaGreen) roxaSemRosaGreens++;
        }
        
        // Verificar zona de tiro em relação à PRÓXIMA rosa
        const nextPinkPosition = pinkPositions.find(p => p > i + MEMORY_SIZE);
        
        if (nextPinkPosition !== undefined) {
            const distanceToNextPink = nextPinkPosition - (i + MEMORY_SIZE);
            
            let zona = 'FORA';
            
            // ANTES: 1-5 rodadas antes da rosa
            if (distanceToNextPink >= 1 && distanceToNextPink <= 5) {
                zona = 'ANTES';
                rosaAntes++;
                if (nextValue >= 10.0) rosaAntesGreens++;
            }
            // DURANTE: A rodada É a rosa
            else if (nextValue >= 10.0) {
                zona = 'DURANTE';
                rosaDurante++;
                rosaDuranteGreens++;
            }
            
            // Verificar se estamos DEPOIS de uma rosa recente
            const lastPinkPosition = pinkPositions.filter(p => p < i + MEMORY_SIZE).pop();
            if (lastPinkPosition !== undefined) {
                const distanceFromLastPink = (i + MEMORY_SIZE) - lastPinkPosition;
                
                // DEPOIS: 1-5 rodadas depois da rosa
                if (distanceFromLastPink >= 1 && distanceFromLastPink <= 5) {
                    zona = 'DEPOIS';
                    rosaDepois++;
                    if (nextValue >= 10.0) rosaDepoisGreens++;
                }
            }
            
            if (zona !== 'FORA') {
                zonaDetalhes.push({
                    rodada: i,
                    zona,
                    nextValue,
                    isGreen: nextValue >= 10.0
                });
            }
        }
    }
    
    const roxaAssertividade = roxaTotal > 0 ? (roxaGreens / roxaTotal) * 100 : 0;
    const roxaSemRosaAssertividade = roxaSemRosa > 0 ? (roxaSemRosaGreens / roxaSemRosa) * 100 : 0;
    const roxaComRosaAssertividade = roxaComRosa > 0 ? (roxaComRosaGreens / roxaComRosa) * 100 : 0;
    
    console.log(`\n🟣 ROXA (≥2x, INCLUINDO ROSAS):`);
    console.log(`   Total de rodadas: ${roxaTotal}`);
    console.log(`   Greens: ${roxaGreens}`);
    console.log(`   Assertividade: ${roxaAssertividade.toFixed(1)}%`);
    
    console.log(`\n🟣 ROXA SEM ROSA NA JANELA:`);
    console.log(`   Rodadas: ${roxaSemRosa}`);
    console.log(`   Greens: ${roxaSemRosaGreens}`);
    console.log(`   Assertividade: ${roxaSemRosaAssertividade.toFixed(1)}%`);
    
    console.log(`\n🟣 ROXA COM ROSA NA JANELA:`);
    console.log(`   Rodadas: ${roxaComRosa}`);
    console.log(`   Greens: ${roxaComRosaGreens}`);
    console.log(`   Assertividade: ${roxaComRosaAssertividade.toFixed(1)}%`);
    
    console.log(`\n🌸 ZONA DE TIRO DAS ROSAS:`);
    
    const rosaAntesAssertividade = rosaAntes > 0 ? (rosaAntesGreens / rosaAntes) * 100 : 0;
    console.log(`\n   ANTES (1-5 rodadas antes):`);
    console.log(`      Jogadas: ${rosaAntes}`);
    console.log(`      Greens (≥10x): ${rosaAntesGreens}`);
    console.log(`      Assertividade: ${rosaAntesAssertividade.toFixed(1)}%`);
    
    const rosaDuranteAssertividade = rosaDurante > 0 ? (rosaDuranteGreens / rosaDurante) * 100 : 0;
    console.log(`\n   DURANTE (a rodada É a rosa):`);
    console.log(`      Jogadas: ${rosaDurante}`);
    console.log(`      Greens (≥10x): ${rosaDuranteGreens}`);
    console.log(`      Assertividade: ${rosaDuranteAssertividade.toFixed(1)}%`);
    
    const rosaDepoisAssertividade = rosaDepois > 0 ? (rosaDepoisGreens / rosaDepois) * 100 : 0;
    console.log(`\n   DEPOIS (1-5 rodadas depois):`);
    console.log(`      Jogadas: ${rosaDepois}`);
    console.log(`      Greens (≥10x): ${rosaDepoisGreens}`);
    console.log(`      Assertividade: ${rosaDepoisAssertividade.toFixed(1)}%`);
    
    // Mostrar detalhes das primeiras 10 zonas
    if (zonaDetalhes.length > 0) {
        console.log(`\n   📋 DETALHES (primeiras 10):`);
        zonaDetalhes.slice(0, 10).forEach(z => {
            const status = z.isGreen ? '✅' : '❌';
            console.log(`      Rodada ${z.rodada}: ${z.zona} → ${z.nextValue.toFixed(2)}x ${status}`);
        });
    }
    
    // Análise de lucro
    const roxaLucro = (roxaGreens - (roxaTotal - roxaGreens)) * 100;
    const rosaAntesLucro = (rosaAntesGreens * 900) - ((rosaAntes - rosaAntesGreens) * 100);
    const rosaDuranteLucro = (rosaDuranteGreens * 900) - ((rosaDurante - rosaDuranteGreens) * 100);
    const rosaDepoisLucro = (rosaDepoisGreens * 900) - ((rosaDepois - rosaDepoisGreens) * 100);
    
    console.log(`\n💰 ANÁLISE DE LUCRO:`);
    console.log(`   ROXA (jogar sempre): R$ ${roxaLucro.toFixed(2)}`);
    console.log(`   ROSA ANTES: R$ ${rosaAntesLucro.toFixed(2)}`);
    console.log(`   ROSA DURANTE: R$ ${rosaDuranteLucro.toFixed(2)}`);
    console.log(`   ROSA DEPOIS: R$ ${rosaDepoisLucro.toFixed(2)}`);
    console.log(`   TOTAL ROSA: R$ ${(rosaAntesLucro + rosaDuranteLucro + rosaDepoisLucro).toFixed(2)}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log(`FIM DA ANÁLISE`);
console.log(`${'='.repeat(80)}\n`);
