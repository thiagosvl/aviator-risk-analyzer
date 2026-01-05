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
}[] = [];

let stats = { wins2x: 0, losses2x: 0, winsPink: 0, lossesPink: 0, totalProfit: 0 };

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function getCandleIcon(val: number): string {
    if (val >= 10.0) return '🌸';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

function updateDashboard() {
    const lastBankroll = bankroll; // Use the global bankroll variable
    const profitColor = stats.totalProfit > 0 ? '🟢' : '🔴';
    const profitText = `**Lucro Total:** R$ ${stats.totalProfit.toFixed(2)}`;
    
    let content = `# 🚁 DASHBOARD DE VALIDAÇÃO AVIATOR - MODO RETROSPECTIVA\n\n`;
    
    if (lastBankroll < 500) {
        content += `> [!CAUTION]\n`;
        content += `> **RISCO CRÍTICO:** Banca abaixo de R$ 500,00. Pare a sessão e reavalie a estratégia!\n\n`;
    }

    content += `> **Status:** Simulação Concluída | **Banca Final:** R$ ${lastBankroll.toFixed(2)} | ${profitColor} ${profitText}\n\n`;

    content += `## 📊 ESTATÍSTICAS DO TESTE\n`;
    content += `| Estratégia | Greens | Losses | Assertividade |\n`;
    content += `| :--- | :--- | :--- | :--- |\n`;
    const acc2x = stats.wins2x + stats.losses2x > 0 ? ((stats.wins2x / (stats.wins2x + stats.losses2x)) * 100).toFixed(1) : '0';
    const accPink = stats.winsPink + stats.lossesPink > 0 ? ((stats.winsPink / (stats.winsPink + stats.lossesPink)) * 100).toFixed(1) : '0';
    content += `| **Roxa (2x)** | ${stats.wins2x} | ${stats.losses2x} | ${acc2x}% |\n`;
    content += `| **Rosa (10x)** | ${stats.winsPink} | ${stats.lossesPink} | ${accPink}% |\n\n`;

    content += `## 📜 HISTÓRICO VISUAL COMPLETO (Sessão)\n`;
    const icons = fullSessionHistory.map(v => getCandleIcon(v));
    for (let i = 0; i < icons.length; i += 10) {
        content += `${icons.slice(i, i + 10).join(' ')}  \n`;
    }
    content += `\n*Nota: Mostrando o histórico consolidado (Memória + Simulação).* \n\n--- \n\n`;

    content += `## 📈 LOG COMPLETO DAS JOGADAS (Passo a Passo)\n`;
    content += `| ID | Entrada 2x | Motivo 2x | Entrada Pink | Motivo Pink | Resultado | Lucro | Status |\n`;
    content += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    
    const formatChecklist = (cl?: Record<string, boolean>) => {
        if (!cl) return '';
        return Object.entries(cl).map(([rule, pass]) => `${pass ? '✅' : '❌'} ${rule}`).join('<br>');
    };

    logs.slice().reverse().forEach(log => {
        content += `| ${log.id} | ${log.rec2x} | ${log.motivo2x}<br>${formatChecklist(log.checklist2x)} | ${log.recPink} | ${log.motivoPink}<br>${formatChecklist(log.checklistPink)} | ${log.result.toFixed(2)}x | ${log.profitLabel} | ${log.status} |\n`;
    });

    content += `\n\n## 📝 LISTA CONSOLIDADA (Para novos testes)\n`;
    content += `> Copie a lista abaixo para usar como 'Histórico Passado' em uma nova validação:\n\n`;
    content += `\`${fullSessionHistory.join(', ')}\`\n`;

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
        profitLabel = `(2x: ${detail2x > 0 ? '+' : ''}${detail2x} | Pk: ${detailPink > 0 ? '+' : ''}${detailPink})`;
    } else if (rec2x.action === 'PLAY_2X') {
        profitLabel = `(2x: ${detail2x > 0 ? '+' : ''}${detail2x})`;
    } else if (recPink.action === 'PLAY_10X') {
        profitLabel = `(Pk: ${detailPink > 0 ? '+' : ''}${detailPink})`;
    } else {
        profitLabel = `R$ 0.00`;
    }

    // Construir status consolidado (V3.9: Granular Failure)
    let finalStatus = '';
    const s2x = rec2x.action === 'PLAY_2X' ? (val >= 2.0 ? '✅ GREEN 2x' : '❌ LOSS 2x') : '⏳ WAIT 2x';
    const sPk = recPink.action === 'PLAY_10X' ? (val >= 10.0 ? '🌸 GREEN Pink' : '❌ LOSS Pink') : '⏳ WAIT Pink';
    
    finalStatus = `${s2x} | ${sPk}`;

    const formatCLI = (cl?: Record<string, boolean>) => {
        if (!cl) return '';
        return '\n    ' + Object.entries(cl).map(([rule, pass]) => `${pass ? '✅' : '❌'} ${rule}`).join('\n    ');
    };

    console.log(`\n🤖 PREDIÇÃO V4.0:`);
    console.log(` Roxa (2x):  ${rec2x.action === 'PLAY_2X' ? '🚀 JOGAR' : '⏳ AGUARDAR'} -> ${rec2x.reason}${formatCLI(rec2x.ruleChecklist)}`);
    console.log(` Rosa (10x): ${recPink.action === 'PLAY_10X' ? '🌸 JOGAR' : '⏳ AGUARDAR'} -> ${recPink.reason}${formatCLI(recPink.ruleChecklist)}`);
    console.log(`--------------------------------------------------`);

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
        
        // No modo retrospectiva, a lista "Future" geralmente vem na ordem cronológica (antiga -> nova)
        // se você extraiu da esquerda para a direita no gráfico futuro.
        // Se ela vier da nova para a antiga, precisaria inverter. 
        // Assumimos que o usuário passa na ordem que aconteceu (Chronological).
        for (const val of futureResults) {
            processResult(val);
        }

        updateDashboard();
        console.log(`\x1b[32m\n✅ TESTE CONCLUÍDO! Visualize os resultados em: SESSAO_VALIDACAO.md\x1b[0m\n`);
    }
    
    rl.close();
}

main().catch(console.error);
