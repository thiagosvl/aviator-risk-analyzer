
import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';

class V7ScenarioGenerator {
    private strategy = new StrategyCore();

    public generateCandle(stars: number): number {
        const rand = Math.random() * 100;
        let pBlue = 55, pPurple = 40, pPink = 5;

        if (stars === 1) { pBlue = 80; pPurple = 18; pPink = 2; }
        else if (stars === 2) { pBlue = 70; pPurple = 25; pPink = 5; }
        else if (stars === 4) { pBlue = 30; pPurple = 55; pPink = 15; }
        else if (stars === 5) { pBlue = 15; pPurple = 65; pPink = 20; }

        if (rand < pBlue) return parseFloat((1 + Math.random() * 0.99).toFixed(2));
        if (rand < pBlue + pPurple) return parseFloat((2 + Math.random() * 7.99).toFixed(2));
        return parseFloat((10 + Math.random() * 90).toFixed(2));
    }

    public run() {
        const starNames = [
            '1 Estrela: Mercado Morto (Azul 80%)', 
            '2 Estrelas: Mercado Ruim (Azul 70%)', 
            '3 Estrelas: Mercado Equilibrado (Azul 55%)', 
            '4 Estrelas: Mercado Pagador (Roxo/Rosa 70%)', 
            '5 Estrelas: Mercado Excelente (Roxo/Rosa 85%)'
        ];

        const outputDir = 'CENARIOS_V7';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        console.log('\n🚀 GERANDO CENÁRIOS V7 (Sniper Edition)\n');

        for (let stars = 1; stars <= 5; stars++) {
            const fileName = `cenario_${stars}_${stars === 1 ? 'star' : 'stars'}.md`;
            const filePath = path.join(outputDir, fileName);
            let fileContent = `# 🚁 Bateria de Cenários V7 - ${stars} Estrelas\n\n`;
            fileContent += `**Qualidade do Mercado:** ${starNames[stars - 1]}\n`;
            fileContent += `**Data da Geração:** ${new Date().toLocaleString()}\n\n`;

            for (let scenarioIdx = 1; scenarioIdx <= 5; scenarioIdx++) {
                const history: number[] = [];
                for (let j = 0; j < 60; j++) {
                    history.push(this.generateCandle(stars));
                }

                const memory = [...history].reverse();
                const analysis = StrategyCore.analyze(memory);

                fileContent += `--- \n\n`;
                fileContent += `## 📍 Cenário #${scenarioIdx}\n\n`;
                
                fileContent += `### 📜 Histórico Recente (Top 25 / Total 60)\n`;
                const recentIcons = [...history].slice(-25).map(v => v >= 10 ? '🌸' : v >= 2 ? '🟣' : '🔵').join(' ');
                fileContent += `${recentIcons} (Últimas 25 velas)\n\n`;

                fileContent += `### 🎯 Inteligência Sniper V6.2/V7\n`;
                fileContent += `- **Fase Atual:** ${analysis.phase === 'CLUSTER' ? '☄️ CLUSTER (Agressivo)' : analysis.phase === 'DESERT' ? '🌵 DESERTO (Proteção)' : '秤 NORMAL'}\n`;
                fileContent += `- **Volatilidade (Score):** ${analysis.volatilityScore.toFixed(1)}\n`;
                fileContent += `- **Mercado (60 velas):** AZUL ${analysis.marketStats?.bluePercent}% | ROXO ${analysis.marketStats?.purplePercent}% | ROSA ${analysis.marketStats?.pinkPercent}%\n`;
                
                if (analysis.prediction) {
                    fileContent += `- **Predição V7:** 🎯 Alvo sugerido **${analysis.prediction.value}x** (Categoria: ${analysis.prediction.category})\n`;
                    fileContent += `- **Confiança:** ${analysis.prediction.confidence}%\n`;
                }

                fileContent += `\n#### 🛡️ Recomendação Sniper (V6)\n`;
                fileContent += `- **Ação:** ${analysis.recommendationPink.action === 'PLAY_10X' ? '✅ JOGAR' : '⏳ AGUARDAR'}\n`;
                fileContent += `- **Motivo:** ${analysis.recommendationPink.reason}\n`;
                fileContent += `- **Risco:** ${analysis.recommendationPink.riskLevel}\n\n`;
            }

            fileContent += `---\n*Relatório de simulação V7 Sniper Engine - Lote de 5 cenários.*`;
            fs.writeFileSync(filePath, fileContent);
            console.log(`✅ [${stars} Estrelas] Gerado 5 cenários em: ${filePath}`);
        }
        
        console.log('\n✨ Todos os cenários foram gerados na pasta /CENARIOS_V7\n');
    }
}

new V7ScenarioGenerator().run();
