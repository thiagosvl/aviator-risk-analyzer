/**
 * Versão automatizada do play.ts para testes
 */

import fs from 'fs';
import path from 'path';
import { TestPatternService } from './generate_scenarios';

const DASHBOARD_PATH = path.join(process.cwd(), 'SESSAO_VALIDACAO.md');
const service = new TestPatternService();

// CONFIGURAÇÃO DA SESSÃO
let bankroll = 1000.0;
const BET_2X = 100.0;
const BET_PINK = 50.0;

let history: number[] = [];
let fullSessionHistory: number[] = [];
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

function getCandleIcon(val: number): string {
    if (val >= 10.0) return '🌸';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

function analyzeMotivoStats(): { roxa: MotivoStats[], rosa: MotivoStats[] } {
    const motivosRoxa = new Map<string, { greens: number, losses: number }>();
    const motivosRosa = new Map<string, { greens: number, losses: number }>();

    logs.forEach(log => {
        // Estratégia Roxa (2x)
        if (log.rec2x === 'SIM') {
            const motivo = log.motivo2x.split('.')[0].split('<br>')[0].trim();
            if (!motivosRoxa.has(motivo)) {
                motivosRoxa.set(motivo, { greens: 0, losses: 0 });
            }
            const entry = motivosRoxa.get(motivo)!;
            if (log.status.includes('✅ GREEN 2x')) {
                entry.greens++;
            } else if (log.status.includes('❌ LOSS 2x')) {
                entry.losses++;
            }
        }

        // Estratégia Rosa (10x)
        if (log.recPink === 'SIM') {
            const motivo = log.motivoPink.split('.')[0].split('<br>')[0].trim();
            if (!motivosRosa.has(motivo)) {
                motivosRosa.set(motivo, { greens: 0, losses: 0 });
            }
            const entry = motivosRosa.get(motivo)!;
            if (log.status.includes('🌸 GREEN Pink')) {
                entry.greens++;
            } else if (log.status.includes('❌ LOSS Pink')) {
                entry.losses++;
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
        })).sort((a, b) => b.total - a.total);
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
    if (motivoStats.roxa.length > 0) {
        const melhorMotivo = motivoStats.roxa.reduce((best, current) => 
            current.assertividade > best.assertividade ? current : best
        );
        const piorMotivo = motivoStats.roxa.reduce((worst, current) => 
            current.assertividade < worst.assertividade ? current : worst
        );

        if (melhorMotivo.assertividade >= 70) {
            insights.push(`✅ **Roxa:** "${melhorMotivo.motivo}" está com ${melhorMotivo.assertividade.toFixed(1)}% de acerto (${melhorMotivo.greens}/${melhorMotivo.total}). Continue usando!`);
        }

        if (piorMotivo.assertividade < 40 && piorMotivo.total >= 3) {
            insights.push(`❌ **Roxa:** "${piorMotivo.motivo}" está com apenas ${piorMotivo.assertividade.toFixed(1)}% de acerto (${piorMotivo.greens}/${piorMotivo.total}). Considere remover ou ajustar esta regra.`);
        }
    }

    // Insights Estratégia 10x (Rosa)
    if (motivoStats.rosa.length > 0) {
        const melhorMotivo = motivoStats.rosa.reduce((best, current) => 
            current.assertividade > best.assertividade ? current : best
        );
        const piorMotivo = motivoStats.rosa.reduce((worst, current) => 
            current.assertividade < worst.assertividade ? current : worst
        );

        if (melhorMotivo.assertividade >= 40) {
            insights.push(`✅ **Rosa:** "${melhorMotivo.motivo}" está com ${melhorMotivo.assertividade.toFixed(1)}% de acerto (${melhorMotivo.greens}/${melhorMotivo.total}). Continue usando!`);
        }

        if (piorMotivo.assertividade < 25 && piorMotivo.total >= 2) {
            insights.push(`❌ **Rosa:** "${piorMotivo.motivo}" está com apenas ${piorMotivo.assertividade.toFixed(1)}% de acerto (${piorMotivo.greens}/${piorMotivo.total}). Considere remover ou ajustar esta regra.`);
        }
    }

    // Insights gerais
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
        content += `| ${log.id} | ${log.rec2x} | ${log.motivo2x}${formatChecklist(log.checklist2x)} | ${log.recPink} | ${log.motivoPink}${formatChecklist(log.checklistPink)} | ${log.result.toFixed(2)}x | ${log.profitLabel} | ${log.status} |\n`;
    });

    content += `\n</details>\n\n`;
    content += `---\n\n`;

    // LISTA CONSOLIDADA
    content += `## 📝 LISTA CONSOLIDADA (Para Novos Testes)\n\n`;
    content += `> Copie a lista abaixo para usar como "Histórico Passado" em uma nova validação:\n\n`;
    content += `\`\`\`\n${fullSessionHistory.join(', ')}\n\`\`\`\n`;

    fs.writeFileSync(DASHBOARD_PATH, content);
    console.log(`✅ Dashboard atualizado: ${DASHBOARD_PATH}`);
}

function processResult(val: number) {
    const result = service.analyze(history);
    const rec2x = result.rec2x;
    const recPink = result.recPink;

    let detail2x = 0;
    let detailPink = 0;
    let roundProfit = 0;

    if (rec2x.action === 'PLAY_2X') {
        if (val >= 2.0) {
            detail2x = BET_2X;
            bankroll += BET_2X;
            stats.wins2x++;
            stats.totalProfit += BET_2X;
            roundProfit += BET_2X;
        } else {
            detail2x = -BET_2X;
            bankroll -= BET_2X;
            stats.losses2x++;
            stats.totalProfit -= BET_2X;
            roundProfit -= BET_2X;
        }
    }

    if (recPink.action === 'PLAY_10X') {
        if (val >= 10.0) {
            detailPink = BET_PINK * 9;
            bankroll += BET_PINK * 9;
            stats.winsPink++;
            stats.totalProfit += BET_PINK * 9;
            roundProfit += BET_PINK * 9;
        } else {
            detailPink = -BET_PINK;
            bankroll -= BET_PINK;
            stats.lossesPink++;
            stats.totalProfit -= BET_PINK;
            roundProfit -= BET_PINK;
        }
    }

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
        checklistPink: recPink.ruleChecklist
    });

    history.unshift(val);
    if (history.length > 60) history.pop();

    fullSessionHistory.unshift(val);
}

// DADOS DO TESTE
const memory = [4.02, 7.15, 6.85, 11.27, 2.30, 3.80, 2.04, 1.57, 1.41, 1.29, 1.00, 1.05, 130.14, 7.61, 1.11, 1.51, 1.78, 1.14, 3.11, 1.22, 1.27, 1.92, 3.36, 3.83, 2.19, 2.22, 1.01, 1.40, 2.74, 26.17, 1.98, 2.38, 1.02, 1.88, 1.17, 1.44, 1.45, 3.50, 1.12, 1.39, 10.07, 1.78, 4.56, 2.08, 1.02, 1.17, 1.27, 1.09, 1.24, 1.18, 2.96, 2.23, 2.36, 1.13, 9.61, 11.59, 14.33, 3.42, 1.21, 1.06];

const sequence = [16.93, 1.70, 2.95, 1.62, 5.27, 2.60, 2.06, 2.62, 1.57, 4.44, 1.16, 1.21, 2.70, 1.84, 5.84, 4.24, 16.61, 2.72, 1.02, 1.18, 2.09, 1.00, 1.74, 1.04, 2.78, 1.47, 2.60, 1.09, 1.15, 1.98, 2.18, 1.68, 1.45, 24.63, 1.73, 2.06, 4.99, 3.06, 4.99, 4.32, 1.31, 1.84, 2.73, 1.50, 2.75, 2.06, 1.61, 1.85, 1.29, 11.87, 1.72, 1.74, 1.18, 1.00, 3.54, 1.02, 1.68, 6.37, 3.29, 4.85, 4.92, 1.00, 1.58, 4.65, 1.51, 3.27, 1.06, 7.31, 7.00, 30.10, 1.97, 1.20, 1.00, 16.16, 1.48, 1.30, 1.96, 25.46, 1.00, 3.35, 1.08, 1.91, 29.54, 3.98, 2.10, 2.18, 1.06, 2.39, 1.43, 5.71, 1.17, 1.97, 2.74, 1.00, 1.54, 1.27, 1.02, 4.25];

console.log('🚀 Executando teste automatizado...\n');
history = [...memory];
fullSessionHistory = [...memory];

console.log(`⚙️ Processando ${sequence.length} rodadas...`);

for (const val of sequence) {
    processResult(val);
}

updateDashboard();
console.log(`\n✅ TESTE CONCLUÍDO! Visualize os resultados em: SESSAO_VALIDACAO.md\n`);
