import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';

/**
 * Script configurável para gerar cenários de teste do Aviator.
 * Sistema unificado usando o StrategyCore compartilhado.
 */

export class TestPatternService {
    public analyze(values: number[]) {
        const result = StrategyCore.analyze(values);
        return {
            rec2x: result.recommendation2x,
            recPink: result.recommendationPink
        };
    }
}

export enum CandleColor {
    BLUE = '🔵',
    PURPLE = '🟣',
    PINK = '🌸'
}

function getCandleColor(value: number): CandleColor {
    if (value >= 10.0) return CandleColor.PINK;
    if (value >= 2.0) return CandleColor.PURPLE;
    return CandleColor.BLUE;
}

function generateCandle(stars: number): number {
    const rand = Math.random() * 100;
    
    // Probabilidades baseadas no nível de estrelas (V3.1 specs)
    let pBlue = 55, pPurple = 40, pPink = 5; // Default 3 estrelas

    if (stars === 1) { pBlue = 80; pPurple = 18; pPink = 2; }
    else if (stars === 2) { pBlue = 70; pPurple = 25; pPink = 5; }
    else if (stars === 4) { pBlue = 30; pPurple = 55; pPink = 15; }
    else if (stars === 5) { pBlue = 15; pPurple = 65; pPink = 20; }

    if (rand < pBlue) return parseFloat((1 + Math.random() * 0.99).toFixed(2));
    if (rand < pBlue + pPurple) return parseFloat((2 + Math.random() * 7.99).toFixed(2));
    return parseFloat((10 + Math.random() * 90).toFixed(2));
}

export function generateBatch(stars: number, count: number = 25): number[] {
    const candles: number[] = [];
    for (let i = 0; i < count; i++) {
        candles.push(generateCandle(stars));
    }
    return candles;
}

// --- EXECUÇÃO ---
async function run() {
    const args = process.argv.slice(2);
    const starArg = args.find(a => a.startsWith('-stars='));
    let stars = starArg ? parseInt(starArg.split('=')[1]) : Math.floor(Math.random() * 5) + 1;
    stars = Math.max(1, Math.min(5, stars));

    const starNames = [
        '1 Estrela: Mercado Morto (Azul 80%)', 
        '2 Estrelas: Mercado Ruim (Azul 70%)', 
        '3 Estrelas: Mercado Equilibrado (Azul 55%)', 
        '4 Estrelas: Mercado Pagador (Roxo/Rosa 70%)', 
        '5 Estrelas: Mercado Excelente (Roxo/Rosa 85%)'
    ];
    const starLabel = starNames[stars - 1];

    const dir = 'CENARIOS_GERADOS';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const files = fs.readdirSync(dir).filter(f => f.startsWith('cenario_') && f.endsWith('.md'));
    let maxNum = 0;
    files.forEach(f => {
        const match = f.match(/cenario_(\d+)\.md/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    const fileName = `cenario_${nextNum}.md`;
    const filePath = path.join(dir, fileName);

    const history = generateBatch(stars, 25);
    const service = new TestPatternService();
    const analysis = service.analyze(history);

    let content = `# 🚁 Cenário de Teste Aviator #${nextNum}\n\n`;
    content += `**Qualidade:** ${starLabel}\n`;
    content += `**Data:** ${new Date().toLocaleString()}\n\n`;
    
    content += `## 📜 Histórico (25 velas)\n`;
    const icons = history.map(v => getCandleColor(v)).join(' ');
    content += `${icons}\n\n`;

    content += `## 🎯 Análise "The Analyst" (V3.3 Core)\n`;
    content += `- **Roxo (2x):** ${analysis.rec2x.action} | ${analysis.rec2x.reason}\n`;
    content += `- **Rosa (10x):** ${analysis.recPink.action} | ${analysis.recPink.reason}\n\n`;

    content += `---\n*Gerado automaticamente pelo script de simulação unificado.*`;

    fs.writeFileSync(filePath, content);
    console.log(`\n✅ Cenário gerado: ${filePath}\n`);
}

// Rodar se for executado diretamente
const isMain = process.argv[1] && (process.argv[1].endsWith('generate_scenarios.ts') || process.argv[1].endsWith('generate_scenarios.js'));

if (isMain) {
    run().catch(console.error);
}
