import readline from 'readline';
import { TestPatternService } from './generate_scenarios';

/**
 * MODO JOGO / LIVE SIMULATOR
 * Permite alimentar dados reais e ver a recomendação da extensão em tempo real.
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const service = new TestPatternService();
let history: number[] = [];

function clearConsole() {
    console.clear();
    console.log('\x1b[35m%s\x1b[0m', '=========================================');
    console.log('\x1b[35m%s\x1b[0m', '   AVIATOR V3 - LIVE SIMULATOR (DEMA)    ');
    console.log('\x1b[35m%s\x1b[0m', '=========================================\n');
}

function getCandleIcon(val: number): string {
    if (val >= 10.0) return '🌸';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

function showStatus() {
    clearConsole();
    if (history.length > 0) {
        console.log('📜 Histórico Atual (Mais Recente Primeiro):');
        const icons = history.slice(0, 15).map(v => `${getCandleIcon(v)} ${v.toFixed(2)}x`).join(' | ');
        console.log(`[ ${icons}${history.length > 15 ? ' ...' : ''} ]\n`);

        const { rec2x, recPink } = service.analyze(history);

        console.log('🚀 RECOMENDAÇÃO ATUAL:');
        console.log('-----------------------------------------');
        const color2x = rec2x.action === 'PLAY_2X' ? '\x1b[32m' : rec2x.action === 'STOP' ? '\x1b[31m' : '\x1b[33m';
        console.log(`${color2x}ESTRATÉGIA 2X: ${rec2x.action} - ${rec2x.reason}\x1b[0m`);
        
        const colorPink = recPink.action === 'PLAY_10X' ? '\x1b[35m' : '\x1b[33m';
        console.log(`${colorPink}ESTRATÉGIA PINK: ${recPink.action} - ${recPink.reason}\x1b[0m`);
        console.log('-----------------------------------------\n');
    } else {
        console.log('💡 Aguardando dados iniciais...\n');
    }
}

async function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
    showStatus();
    
    // Entrada inicial de massa
    const initialInput = await askQuestion('Cole o histórico inicial (ex: 1.5, 3.2, 12, ...) ou apenas uma vela: ');
    if (initialInput.trim()) {
        const parts = initialInput.split(/[,|\s]+/).map(p => parseFloat(p)).filter(n => !isNaN(n));
        history = [...parts, ...history];
    }

    while (true) {
        showStatus();
        const nextInput = await askQuestion('Resultado da próxima vela (ou "clear" para reiniciar): ');
        
        if (nextInput.toLowerCase() === 'clear') {
            history = [];
            continue;
        }

        const val = parseFloat(nextInput);
        if (!isNaN(val)) {
            // No Aviator, o novo resultado vira o index 0 (mais recente)
            history.unshift(val);
        } else {
            console.log('\x1b[31mValor inválido. Use números (ex: 1.85).\x1b[0m');
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

main().catch(console.error);
