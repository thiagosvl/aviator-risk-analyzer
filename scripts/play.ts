import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { TestPatternService } from './generate_scenarios';

/**
 * MODO JOGO / VALIDATION DASHBOARD
 * Integra o Simulator com um arquivo Markdown que atualiza em tempo real.
 */

const DASHBOARD_PATH = path.join(process.cwd(), 'SESSAO_VALIDACAO.md');
const service = new TestPatternService();

// CONFIGURAÇÃO DA SESSÃO
let bankroll = 1000.0;
const BET_2X = 100.0;
const BET_PINK = 50.0;

let history: number[] = []; // Usado para a análise (limitado a 60)
let fullSessionHistory: number[] = []; // Armazena TUDO (Memória + Futuro)
let logs: { 
    id: number,
    rec2x: string, 
    motivo2x: string,
    recPink: string, 
    motivoPink: string,
    result: number, 
    profit: number, 
    status: string,
    profitLabel: string;
    checklist2x?: Record<string, boolean>;
    checklistPink?: Record<string, boolean>;
    target2x?: number;
}[] = [];

let stats = { wins2x: 0, losses2x: 0, winsPink: 0, lossesPink: 0, totalProfit: 0 };

// ANÁLISE DE MOTIVOS (V3.11)
interface MotivoStats {
    motivo: string;
    greens: number;
    losses: number;
    total: number;
    assertividade: number;
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function getCandleIcon(val: number): string {
    if (val >= 10.0) return '🌸';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

function analyzeMotivoStats(): { roxa: MotivoStats[], rosa: MotivoStats[] } {
    const motivosRoxa = new Map<string, { greens: number, losses: number }>();
    const motivosRosa = new Map<string, { greens: number, losses: number }>();

    logs.forEach(log => {
        // Estratégia 2x (Roxa)
        if (log.rec2x === 'SIM') {
            const motivo = log.motivo2x.split('.')[0]; // Pega primeira frase
            if (!motivosRoxa.has(motivo)) {
                motivosRoxa.set(motivo, { greens: 0, losses: 0 });
            }
            const stats = motivosRoxa.get(motivo)!;
            if (log.status.includes('GREEN 2x')) {
                stats.greens++;
            } else if (log.status.includes('LOSS 2x')) {
                stats.losses++;
            }
        }

        // Estratégia 10x (Rosa)
        if (log.recPink === 'SIM') {
            const motivo = log.motivoPink.split('.')[0]; // Pega primeira frase
            if (!motivosRosa.has(motivo)) {
                motivosRosa.set(motivo, { greens: 0, losses: 0 });
            }
            const stats = motivosRosa.get(motivo)!;
            if (log.status.includes('GREEN Pink')) {
                stats.greens++;
            } else if (log.status.includes('LOSS Pink')) {
                stats.losses++;
            }
        }
    });

    const toArray = (map: Map<string, { greens: number, losses: number }>): MotivoStats[] => {
        return Array.from(map.entries()).map(([motivo, stats]) => ({
            motivo,
            greens: stats.greens,
            losses: stats.losses,
            total: stats.greens + stats.losses,
            assertividade: stats.greens + stats.losses > 0 
                ? (stats.greens / (stats.greens + stats.losses)) * 100 
                : 0
        })).sort((a, b) => b.total - a.total); // Ordena por total de jogadas
    };

    return {
        roxa: toArray(motivosRoxa),
        rosa: toArray(motivosRosa)
    };
}

function generateInsights(): string[] {
    const insights: string[] = [];
    const motivoStats = analyzeMotivoStats();

    // Insights Estratégia 2x (Roxa)
    const roxaBest = motivoStats.roxa.filter(m => m.assertividade >= 60);
    const roxaWorst = motivoStats.roxa.filter(m => m.assertividade < 40 && m.total >= 3);

    if (roxaBest.length > 0) {
        insights.push(`✅ **Roxa - Motivos Bons:** ${roxaBest.map(m => `"${m.motivo}" (${m.assertividade.toFixed(0)}%)`).join(', ')}`);
    }
    if (roxaWorst.length > 0) {
        insights.push(`❌ **Roxa - Motivos Ruins:** ${roxaWorst.map(m => `"${m.motivo}" (${m.assertividade.toFixed(0)}%)`).join(', ')} - **Considere ajustar regras!**`);
    }

    // Insights Estratégia 10x (Rosa)
    const rosaBest = motivoStats.rosa.filter(m => m.assertividade >= 40);
    const rosaWorst = motivoStats.rosa.filter(m => m.assertividade < 30 && m.total >= 2);

    if (rosaBest.length > 0) {
        insights.push(`✅ **Rosa - Motivos Bons:** ${rosaBest.map(m => `"${m.motivo}" (${m.assertividade.toFixed(0)}%)`).join(', ')}`);
    }
    if (rosaWorst.length > 0) {
        insights.push(`❌ **Rosa - Motivos Ruins:** ${rosaWorst.map(m => `"${m.motivo}" (${m.assertividade.toFixed(0)}%)`).join(', ')} - **Considere remover padrão!**`);
    }

    // Insights gerais
    const totalJogadas = stats.wins2x + stats.losses2x + stats.winsPink + stats.lossesPink;
    if (totalJogadas > 50) {
        insights.push(`⚠️ **Muitas Jogadas:** ${totalJogadas} entradas. Considere ser mais seletivo.`);
    } else if (totalJogadas < 10) {
        insights.push(`⚠️ **Poucas Jogadas:** ${totalJogadas} entradas. Regras podem estar muito restritivas.`);
    }

    if (stats.totalProfit < 0) {
        insights.push(`🔴 **Prejuízo:** R$ ${stats.totalProfit.toFixed(2)}. Revise regras urgentemente!`);
    } else if (stats.totalProfit > 200) {
        insights.push(`🟢 **Lucro Alto:** R$ ${stats.totalProfit.toFixed(2)}. Estratégia funcionando bem!`);
    }

    return insights;
}

function updateDashboard() {
    console.log('\n🔧 [DEBUG] updateDashboard() chamado');
    console.log(`📊 Stats: ${stats.wins2x} greens, ${stats.losses2x} losses`);
    const lastBankroll = bankroll;
    const profitColor = stats.totalProfit > 0 ? '🟢' : '🔴';
    const profitText = `R$ ${stats.totalProfit.toFixed(2)}`;
    
    let content = `# 🎯 DASHBOARD DE VALIDAÇÃO - MODO RETROSPECTIVA\n\n`;
    
    // ALERTA CRÍTICO
    if (lastBankroll < 500) {
        content += `> [!CAUTION]\n`;
        content += `> **🚨 RISCO CRÍTICO:** Banca abaixo de R$ 500,00. Pare e reavalie!\n\n`;
    }

    // STATUS RESUMIDO
    content += `**Status:** ✅ Concluída | **Banca Final:** R$ ${lastBankroll.toFixed(2)} | **Lucro:** ${profitColor} ${profitText}\n\n`;
    content += `---\n\n`;

    // ESTATÍSTICAS GERAIS
    content += `## 📊 ESTATÍSTICAS GERAIS\n\n`;
    const acc2x = stats.wins2x + stats.losses2x > 0 ? ((stats.wins2x / (stats.wins2x + stats.losses2x)) * 100).toFixed(1) : '0';
    const accPink = stats.winsPink + stats.lossesPink > 0 ? ((stats.winsPink / (stats.winsPink + stats.lossesPink)) * 100).toFixed(1) : '0';
    
    content += `| Estratégia | Greens | Losses | Total | Assertividade | Lucro |\n`;
    content += `|:-----------|:-------|:-------|:------|:--------------|:------|\n`;
    const lucro2x = (stats.wins2x * BET_2X) - (stats.losses2x * BET_2X);
    const lucroPink = (stats.winsPink * BET_PINK * 9) - (stats.lossesPink * BET_PINK);
    content += `| 🟣 **Roxa (2x)** | ${stats.wins2x} | ${stats.losses2x} | ${stats.wins2x + stats.losses2x} | **${acc2x}%** | R$ ${lucro2x.toFixed(2)} |\n`;
    content += `| 🌸 **Rosa (10x)** | ${stats.winsPink} | ${stats.lossesPink} | ${stats.winsPink + stats.lossesPink} | **${accPink}%** | R$ ${lucroPink.toFixed(2)} |\n\n`;

    // ANÁLISE DE MOTIVOS
    content += `## 🔍 ANÁLISE DE MOTIVOS (Acertos/Erros por Tipo)\n\n`;
    const motivoStats = analyzeMotivoStats();

    if (motivoStats.roxa.length > 0) {
        content += `### 🟣 Estratégia Roxa (2x)\n\n`;
        content += `| Motivo | Greens | Losses | Total | Assertividade |\n`;
        content += `|:-------|:-------|:-------|:------|:--------------|\n`;
        motivoStats.roxa.forEach(m => {
            const emoji = m.assertividade >= 60 ? '✅' : m.assertividade >= 40 ? '⚠️' : '❌';
            content += `| ${emoji} ${m.motivo} | ${m.greens} | ${m.losses} | ${m.total} | **${m.assertividade.toFixed(1)}%** |\n`;
        });
        content += `\n`;
    }

    if (motivoStats.rosa.length > 0) {
        content += `### 🌸 Estratégia Rosa (10x)\n\n`;
        content += `| Motivo | Greens | Losses | Total | Assertividade |\n`;
        content += `|:-------|:-------|:-------|:------|:--------------|\n`;
        motivoStats.rosa.forEach(m => {
            const emoji = m.assertividade >= 40 ? '✅' : m.assertividade >= 25 ? '⚠️' : '❌';
            content += `| ${emoji} ${m.motivo} | ${m.greens} | ${m.losses} | ${m.total} | **${m.assertividade.toFixed(1)}%** |\n`;
        });
        content += `\n`;
    }

    // INSIGHTS ACIONÁVEIS
    content += `## 💡 INSIGHTS E RECOMENDAÇÕES\n\n`;
    const insights = generateInsights();
    if (insights.length > 0) {
        insights.forEach(insight => {
            content += `- ${insight}\n`;
        });
    } else {
        content += `- ✅ Nenhum ajuste urgente necessário.\n`;
    }
    content += `\n---\n\n`;

    // HISTÓRICO VISUAL
    content += `## 📜 HISTÓRICO VISUAL (Sessão Completa)\n\n`;
    const icons = fullSessionHistory.map(v => getCandleIcon(v));
    for (let i = 0; i < icons.length; i += 20) {
        content += `${icons.slice(i, i + 20).join(' ')}\n`;
    }
    content += `\n*Total: ${fullSessionHistory.length} velas*\n\n`;
    content += `---\n\n`;

    // LOG DETALHADO (COLAPSÁVEL)
    content += `<details>\n`;
    content += `<summary>📋 LOG DETALHADO DAS JOGADAS (Clique para expandir)</summary>\n\n`;
    content += `| ID | 2x | Motivo 2x | Pink | Motivo Pink | Resultado | Lucro | Status |\n`;
    content += `|:---|:---|:----------|:-----|:------------|:----------|:------|:-------|\n`;
    
    const formatChecklist = (cl?: Record<string, boolean>) => {
        if (!cl) return '';
        return '<br>' + Object.entries(cl).map(([rule, pass]) => `${pass ? '✅' : '❌'} ${rule}`).join('<br>');
    };

    logs.slice().reverse().forEach(log => {
        const targetText = log.target2x ? `<br>🎯 Alvo: **${log.target2x.toFixed(2)}x**` : '';
        content += `| ${log.id} | ${log.rec2x} | ${log.motivo2x}${targetText}${formatChecklist(log.checklist2x)} | ${log.recPink} | ${log.motivoPink}${formatChecklist(log.checklistPink)} | ${log.result.toFixed(2)}x | ${log.profitLabel} | ${log.status} |\n`;
    });

    content += `\n</details>\n\n`;
    content += `---\n\n`;

    // LISTA CONSOLIDADA
    content += `## 📝 LISTA CONSOLIDADA (Para Novos Testes)\n\n`;
    content += `> Copie a lista abaixo para usar como "Histórico Passado" em uma nova validação:\n\n`;
    content += `\`\`\`\n${fullSessionHistory.join(', ')}\n\`\`\`\n`;

    fs.writeFileSync(DASHBOARD_PATH, content);
}

async function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

function processResult(val: number) {
    // 1. ANÁLISE ANTES DA VELA SAIR
    const result = service.analyze(history);
    const rec2x = result.rec2x;
    const recPink = result.recPink;
    
    let roundProfit = 0;
    let status2x = '';
    let statusPink = '';
    let detail2x = 0;
    let detailPink = 0;

    // Lógica 2x (Independente - V3.9 Restaurado 2.0x)
    if (rec2x.action === 'PLAY_2X') {
        if (val >= 2.0) {
            detail2x = BET_2X;
            stats.wins2x++;
            status2x = '✅ GREEN';
        } else {
            detail2x = -BET_2X;
            stats.losses2x++;
            status2x = '❌ LOSS';
        }
    }

    // Lógica Pink (Independente)
    if (recPink.action === 'PLAY_10X') {
        if (val >= 10.0) {
            detailPink = (BET_PINK * 9);
            stats.winsPink++;
            statusPink = '🌸 PINK GREEN';
        } else {
            detailPink = -BET_PINK;
            stats.lossesPink++;
            statusPink = '❌ PINK LOSS';
        }
    }

    roundProfit = detail2x + detailPink;
    bankroll += roundProfit;
    stats.totalProfit += roundProfit;

    // Construir label de lucro detalhado
    let profitLabel = '';
    if (rec2x.action === 'PLAY_2X' && recPink.action === 'PLAY_10X') {
        profitLabel = `2x: ${detail2x > 0 ? '+' : ''}${detail2x} | Pk: ${detailPink > 0 ? '+' : ''}${detailPink}`;
    } else if (rec2x.action === 'PLAY_2X') {
        profitLabel = `2x: ${detail2x > 0 ? '+' : ''}${detail2x}`;
    } else if (recPink.action === 'PLAY_10X') {
        profitLabel = `Pk: ${detailPink > 0 ? '+' : ''}${detailPink}`;
    } else {
        profitLabel = `R$ 0.00`;
    }

    // Construir status consolidado (V3.9: Granular Failure)
    let finalStatus = '';
    const s2x = rec2x.action === 'PLAY_2X' ? (val >= 2.0 ? '✅ GREEN 2x' : '❌ LOSS 2x') : '⏳ WAIT 2x';
    const sPk = recPink.action === 'PLAY_10X' ? (val >= 10.0 ? '🌸 GREEN Pink' : '❌ LOSS Pink') : '⏳ WAIT Pink';
    
    finalStatus = `${s2x} | ${sPk}`;

    logs.push({
        id: logs.length + 1,
        rec2x: rec2x.action === 'PLAY_2X' ? 'SIM' : 'NÃO',
        motivo2x: rec2x.reason,
        recPink: recPink.action === 'PLAY_10X' ? 'SIM' : 'NÃO',
        motivoPink: recPink.reason,
        result: val,
        profit: roundProfit,
        status: finalStatus,
        profitLabel: profitLabel,
        checklist2x: rec2x.ruleChecklist,
        checklistPink: recPink.ruleChecklist,
        target2x: rec2x.estimatedTarget
    });

    // 2. ATUALIZA HISTÓRICO DE ANÁLISE (Máximo 60)
    history.unshift(val);
    if (history.length > 60) history.pop();

    // 3. ATUALIZA HISTÓRICO TOTAL DA SESSÃO
    fullSessionHistory.unshift(val);
}

async function main() {
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', '--- MODO RETROSPECTIVA: VALIDAÇÃO EM MASSA ---');
    console.log('Este modo processa uma lista de resultados futuros de uma vez.\n');

    const memoryInput = await askQuestion('1. Cole o HISTÓRICO PASSADO (Memória inicial): ');
    if (memoryInput.trim()) {
        history = memoryInput.split(/[,|\s]+/).map(p => parseFloat(p)).filter(n => !isNaN(n));
        fullSessionHistory = [...history]; // Inicia o histórico visual com a memória
    }

    const futureInput = await askQuestion('\n2. Cole a LISTA DE RESULTADOS (O que aconteceu depois): ');
    if (futureInput.trim()) {
        const futureResults = futureInput.split(/[,|\s]+/).map(p => parseFloat(p)).filter(n => !isNaN(n));
        
        console.log(`\n⚙️ Processando ${futureResults.length} rodadas...`);
        
        for (const val of futureResults) {
            processResult(val);
        }

        updateDashboard();
        console.log(`\x1b[32m\n✅ TESTE CONCLUÍDO! Visualize os resultados em: SESSAO_VALIDACAO.md\x1b[0m\n`);
    }
    
    rl.close();
}

main().catch(console.error);
