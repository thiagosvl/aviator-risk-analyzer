
import * as fs from 'fs';
import * as path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore.ts';

// CONFIGURAÇÃO
const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const EXIT_TARGET = 10.0;
const STAKE = 10.0; // Valor fixo por aposta

interface SimulationStats {
    totalGames: number;
    bets: number;
    wins: number;
    losses: number;
    profit: number;
    maxDrawdown: number;
    assertiveness: number;
    history: number[]; // Profit history for drawdown
}

function runSimulation(filename: string, multipliers: number[]): SimulationStats {
    const history: number[] = [];
    let bankroll = 0;
    let minBankroll = 0;
    let wins = 0;
    let losses = 0;
    let bets = 0;
    const profitHistory: number[] = [0];

    // Simula cronologicamente
    for (let i = 0; i < multipliers.length; i++) {
        const currentResult = multipliers[i];
        
        // Analisa com base no histórico PASSADO (antes do resultado atual)
        // O StrategyCore espera 'history' onde history[0] é o mais recente.
        const analysis = StrategyCore.analyze(history);
        const decision = analysis.recommendationPink;

        // Executa aposta se recomendado
        if (decision.action === 'PLAY_10X' || decision.action === 'PLAY_2X') { // V8 foca em 10x, mas aceita gatilho
            bets++;
            if (currentResult >= EXIT_TARGET) {
                wins++;
                const profit = (STAKE * EXIT_TARGET) - STAKE;
                bankroll += profit;
                // console.log(`[WIN] Round ${i+1}: Result ${currentResult}x -> Profit +${profit}`);
            } else {
                losses++;
                bankroll -= STAKE;
                // console.log(`[LOSS] Round ${i+1}: Result ${currentResult}x -> Loss -${STAKE}`);
            }
        }

        // Atualiza histórico para a próxima rodada
        history.unshift(currentResult);
        
        // Drawdown tracking
        profitHistory.push(bankroll);
        if (bankroll < minBankroll) minBankroll = bankroll;
    }

    // Calcular Drawdown Máximo Real (Peak to Valley)
    let maxDrawdown = 0;
    let peak = 0;
    for (const val of profitHistory) {
        if (val > peak) peak = val;
        const dd = peak - val;
        if (dd > maxDrawdown) maxDrawdown = dd;
    }

    return {
        totalGames: multipliers.length,
        bets,
        wins,
        losses,
        profit: bankroll,
        maxDrawdown,
        assertiveness: bets > 0 ? (wins / bets) * 100 : 0,
        history: profitHistory
    };
}

async function main() {
    console.log('🚀 INICIANDO BACKTEST SNIPER V8+...');
    console.log(`📂 Diretório: ${GRAFOS_DIR}`);
    console.log(`🎯 Saída Fixa: ${EXIT_TARGET}x`);
    console.log('----------------------------------------------------------------');

    if (!fs.existsSync(GRAFOS_DIR)) {
        console.error(`Diretório não encontrado: ${GRAFOS_DIR}`);
        return;
    }

    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt'));
    let globalStats: SimulationStats = {
        totalGames: 0,
        bets: 0,
        wins: 0,
        losses: 0,
        profit: 0,
        maxDrawdown: 0,
        assertiveness: 0,
        history: []
    };

    console.log(`Encontrados ${files.length} grafos para teste.\n`);

    const results: string[] = [];
    results.push('================================================================');
    results.push('RELATÓRIO DE BACKTEST - SNIPER V8+ (ANTIGRAVITY)');
    results.push(`Data: ${new Date().toISOString()}`);
    results.push('================================================================');
    results.push(String(files.length).padEnd(15) + 'Grafos Analisados');
    results.push('----------------------------------------------------------------');
    results.push(`| ${'GRAFO'.padEnd(15)} | ${'BETS'.padEnd(6)} | ${'WINS'.padEnd(6)} | ${'ASSERT%'.padEnd(8)} | ${'LUCRO'.padEnd(10)} |`);
    results.push('----------------------------------------------------------------');

    let totalDrawdownAccumulated = 0;

    for (const file of files) {
        const filePath = path.join(GRAFOS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const multipliers = content
            .split('\n')
            .map(l => parseFloat(l.trim()))
            .filter(n => !isNaN(n));

        const stats = runSimulation(file, multipliers);

        globalStats.totalGames += stats.totalGames;
        globalStats.bets += stats.bets;
        globalStats.wins += stats.wins;
        globalStats.losses += stats.losses;
        globalStats.profit += stats.profit;
        if (stats.maxDrawdown > globalStats.maxDrawdown) globalStats.maxDrawdown = stats.maxDrawdown; // Worst case DD
        totalDrawdownAccumulated += stats.maxDrawdown;

        const icon = stats.profit >= 0 ? '✅' : '❌';
        const line = `| ${file.padEnd(15)} | ${String(stats.bets).padEnd(6)} | ${String(stats.wins).padEnd(6)} | ${stats.assertiveness.toFixed(2).padEnd(8)} | R$ ${stats.profit.toFixed(2).padEnd(7)} ${icon}|`;
        console.log(line);
        results.push(line);
    }

    const globalAssertiveness = globalStats.bets > 0 ? (globalStats.wins / globalStats.bets) * 100 : 0;

    console.log('----------------------------------------------------------------');
    results.push('----------------------------------------------------------------');
    results.push('RESUMO GLOBAL');
    results.push('----------------------------------------------------------------');
    results.push(`Total de Velas:     ${globalStats.totalGames}`);
    results.push(`Total de Apostas:   ${globalStats.bets}`);
    results.push(`Total de Greens:    ${globalStats.wins}`);
    results.push(`Assertividade:      ${globalAssertiveness.toFixed(2)}%`);
    results.push(`Lucro Líquido:      R$ ${globalStats.profit.toFixed(2)}`);
    results.push(`Drawdown Máximo:    R$ ${globalStats.maxDrawdown.toFixed(2)}`);
    results.push('----------------------------------------------------------------');
    
    const outputContent = results.join('\n');
    const outputPath = path.join(__dirname, 'RELATORIO_V8_ANTIGRAVITY.txt');
    fs.writeFileSync(outputPath, outputContent);
    console.log(`\n📄 Relatório salvo em: ${outputPath}`);
}

main().catch(err => console.error(err));
