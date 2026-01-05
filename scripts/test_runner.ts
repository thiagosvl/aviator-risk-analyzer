/**
 * Script auxiliar para executar testes automatizados
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const memory = "4.02, 7.15, 6.85, 11.27, 2.30, 3.80, 2.04, 1.57, 1.41, 1.29, 1.00, 1.05, 130.14, 7.61, 1.11, 1.51, 1.78, 1.14, 3.11, 1.22, 1.27, 1.92, 3.36, 3.83, 2.19, 2.22, 1.01, 1.40, 2.74, 26.17, 1.98, 2.38, 1.02, 1.88, 1.17, 1.44, 1.45, 3.50, 1.12, 1.39, 10.07, 1.78, 4.56, 2.08, 1.02, 1.17, 1.27, 1.09, 1.24, 1.18, 2.96, 2.23, 2.36, 1.13, 9.61, 11.59, 14.33, 3.42, 1.21, 1.06";

const sequence = "16.93, 1.70, 2.95, 1.62, 5.27, 2.60, 2.06, 2.62, 1.57, 4.44, 1.16, 1.21, 2.70, 1.84, 5.84, 4.24, 16.61, 2.72, 1.02, 1.18, 2.09, 1.00, 1.74, 1.04, 2.78, 1.47, 2.60, 1.09, 1.15, 1.98, 2.18, 1.68, 1.45, 24.63, 1.73, 2.06, 4.99, 3.06, 4.99, 4.32, 1.31, 1.84, 2.73, 1.50, 2.75, 2.06, 1.61, 1.85, 1.29, 11.87, 1.72, 1.74, 1.18, 1.00, 3.54, 1.02, 1.68, 6.37, 3.29, 4.85, 4.92, 1.00, 1.58, 4.65, 1.51, 3.27, 1.06, 7.31, 7.00, 30.10, 1.97, 1.20, 1.00, 16.16, 1.48, 1.30, 1.96, 25.46, 1.00, 3.35, 1.08, 1.91, 29.54, 3.98, 2.10, 2.18, 1.06, 2.39, 1.43, 5.71, 1.17, 1.97, 2.74, 1.00, 1.54, 1.27, 1.02, 4.25";

const playScript = path.join(__dirname, 'play.ts');

console.log('🚀 Executando teste automatizado...\n');

const child = spawn('npx', ['tsx', playScript], {
    stdio: ['pipe', 'pipe', 'pipe']
});

// Enviar dados para stdin
child.stdin.write(memory + '\n');
child.stdin.write(sequence + '\n');
child.stdin.end();

// Capturar saída
child.stdout.on('data', (data) => {
    console.log(data.toString());
});

child.stderr.on('data', (data) => {
    console.error(data.toString());
});

child.on('close', (code) => {
    console.log(`\n✅ Teste concluído com código: ${code}`);
    console.log('📄 Relatório gerado em: SESSAO_VALIDACAO.md');
});
