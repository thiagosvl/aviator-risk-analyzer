const fs = require('fs');
const path = require('path');

// === STRATEGY V9 LOGIC (Mirrors StrategyCore.ts) ===

class StrategyV9 {
    static HIGH_PURPLE_THRESHOLD = 8.0;
    static DESERT_THRESHOLD = 8;

    static analyze(values) {
        const lastPinkIndex = values.findIndex(v => v >= 10.0);
        const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;
        const { regime, phase, absStake } = this.calculateRegimeAndPhaseV9(values, candlesSinceLastPink);
        const recommendation = this.decideActionV9(values, candlesSinceLastPink, regime, phase);

        // Market Stats (Window 60)
        const slice = values.slice(0, 60);
        const blue = slice.filter(v => v < 2.0).length;
        const pink = slice.filter(v => v >= 10.0).length;
        const purple = slice.filter(v => v >= 2.0 && v < 10.0).length;
        
        const marketStats = {
            bluePercent: Math.round((blue / Math.max(1, slice.length)) * 100),
            purplePercent: Math.round((purple / Math.max(1, slice.length)) * 100),
            pinkPercent: Math.round((pink / Math.max(1, slice.length)) * 100)
        };

        return {
            recommendation,
            regime,
            phase,
            absStake,
            candlesSinceLastPink,
            marketStats
        };
    }

    static calculateRegimeAndPhaseV9(values, candlesSinceLastPink) {
        if (candlesSinceLastPink >= this.DESERT_THRESHOLD) {
            return { regime: 'HOSTILE', phase: 'DESERT', absStake: 0.0 };
        }
        
        const shortWindow = values.slice(0, 20);
        const blueCount = shortWindow.filter(v => v < 2.0).length;
        const recentPain = values.slice(0, 3).filter(v => v < 2.0).length >= 2;

        if (blueCount >= 12 || recentPain) {
            return { regime: 'UNCERTAINTY', phase: 'NORMAL', absStake: 0.5 };
        }

        let phase = 'NORMAL';
        if (candlesSinceLastPink >= 0 && candlesSinceLastPink <= 2) {
            // Verifica o gap do Rosa anterior ao atual para decidir se é RECOVERY
            const remaining = values.slice(candlesSinceLastPink + 1);
            const prevPinkIndex = remaining.findIndex(v => v >= 10.0);
            
            if (prevPinkIndex !== -1) {
                if (prevPinkIndex >= this.DESERT_THRESHOLD) {
                    phase = 'RECOVERY';
                }
            } else if (values.length > 20) {
                 phase = 'RECOVERY';
            }
        }

        return { 
            regime: 'EXPANSION', 
            phase, 
            absStake: phase === 'RECOVERY' ? 1.5 : 1.0 
        };
    }

    static decideActionV9(values, candlesSinceLastPink, regime, phase) {
        if (values.length === 0) return { action: 'WAIT', reason: 'Sem dados suficientes' };
        
        const lastValue = values[0];

        // Camada 1: Janelas (Sticky / Recovery)
        if (candlesSinceLastPink >= 0 && candlesSinceLastPink <= 2) {
            // Trava de Hesitação (8.0x)
            if (lastValue >= this.HIGH_PURPLE_THRESHOLD && lastValue < 10.0) {
                return { action: 'WAIT', reason: `✋ TRAVA: Roxo Alto (${lastValue.toFixed(2)}x) na janela.` };
            }

            return { 
                action: 'PLAY_10X', 
                reason: phase === 'RECOVERY' ? `🔥 RECOVERY (${candlesSinceLastPink + 1}/3)` : `🎯 JANELA V9.5 (${candlesSinceLastPink + 1}/3)` 
            };
        }

        if (regime === 'HOSTILE') {
            return { action: 'WAIT', reason: `🌵 DESERTO (Aguardando Rosa de Liberação)` };
        }

        // Camada 2: Sniper Trigger (Só em Expansão e fora da janela)
        if (regime === 'EXPANSION') {
            if (lastValue < 2.0) return { action: 'PLAY_10X', reason: `🎯 SNIPER: Azul (${lastValue.toFixed(2)}x)` };
            if (lastValue >= 2.0 && lastValue < this.HIGH_PURPLE_THRESHOLD) {
                return { action: 'PLAY_10X', reason: `🎯 SNIPER: Roxo Médio (${lastValue.toFixed(2)}x)` };
            }
        }
        
        return { action: 'WAIT', reason: `⏳ MÉDIO/ALTO (${lastValue.toFixed(2)}x). Não é gatilho.` };
    }
}

// === GENERATOR ===

class V9ScenarioGenerator {
    generateCandle(stars) {
        const rand = Math.random() * 100;
        let pBlue = 55, pPurple = 40, pPink = 5;

        // Probabilities based on Stars
        if (stars === 1) { pBlue = 80; pPurple = 18; pPink = 2; }
        else if (stars === 2) { pBlue = 70; pPurple = 25; pPink = 5; }
        else if (stars === 3) { pBlue = 55; pPurple = 37; pPink = 8; }
        else if (stars === 4) { pBlue = 30; pPurple = 55; pPink = 15; }
        else if (stars === 5) { pBlue = 15; pPurple = 65; pPink = 20; }

        if (rand < pBlue) return parseFloat((1 + Math.random() * 0.99).toFixed(2));
        if (rand < pBlue + pPurple) return parseFloat((2 + Math.random() * 7.99).toFixed(2));
        return parseFloat((10 + Math.random() * 90).toFixed(2));
    }

    run() {
        const starNames = [
            '1 Estrela: Mercado Morto (Azul 80%)', 
            '2 Estrelas: Mercado Ruim (Azul 70%)', 
            '3 Estrelas: Mercado Equilibrado (Azul 55%)', 
            '4 Estrelas: Mercado Pagador (Roxo/Rosa 70%)', 
            '5 Estrelas: Mercado Excelente (Roxo/Rosa 85%)'
        ];

        const outputDir = path.join(__dirname, '../CENARIOS_V9_SURVIVAL');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('\n🚀 GERANDO CENÁRIOS V9 SURVIVAL\n');

        for (let stars = 1; stars <= 5; stars++) {
            const fileName = `cenario_${stars}_estrelas.md`;
            const filePath = path.join(outputDir, fileName);
            let fileContent = `# 🚀 Bateria de Cenários V9 Survival - ${stars} Estrelas\n\n`;
            fileContent += `**Qualidade do Mercado:** ${starNames[stars - 1]}\n`;
            fileContent += `**Data da Geração:** ${new Date().toLocaleString()}\n\n`;

            for (let scenarioIdx = 1; scenarioIdx <= 5; scenarioIdx++) {
                const history = [];
                for (let j = 0; j < 60; j++) {
                    history.push(this.generateCandle(stars));
                }

                const memory = [...history].reverse(); 
                const analysis = StrategyV9.analyze(memory);

                fileContent += `--- \n\n`;
                fileContent += `## 📍 Cenário #${scenarioIdx}\n\n`;
                
                fileContent += `### 📜 Histórico Recente (Top 25)\n`;
                
                // Formatação dos ícones com ⛔ para Roxo Alto
                const recentIcons = [...memory].slice(0, 25).map(v => {
                    if (v >= 10.0) return '🌸';
                    if (v >= StrategyV9.HIGH_PURPLE_THRESHOLD) return '⛔';
                    if (v >= 2.0) return '🟣';
                    return '🔵';
                }).join('');
                
                fileContent += `[NOVA] ${recentIcons} [VELHA]\n\n`;

                fileContent += `### 🧠 Inteligência V9.5 Survival\n`;
                fileContent += `- **Última Vela:** ${memory[0].toFixed(2)}x\n`;
                fileContent += `- **Regime:** ${analysis.regime}\n`;
                fileContent += `- **Fase:** ${analysis.phase}\n`;
                fileContent += `- **Stake Sugerida:** ${analysis.absStake * 100}%\n`;
                fileContent += `- **Mercado (60 velas):** AZUL ${analysis.marketStats.bluePercent}% | ROXO ${analysis.marketStats.purplePercent}% | ROSA ${analysis.marketStats.pinkPercent}%\n`;
                
                fileContent += `\n#### 🛡️ Recomendação\n`;
                fileContent += `- **Ação:** ${analysis.recommendation.action === 'PLAY_10X' ? '✅ JOGAR' : '⏳ AGUARDAR'}\n`;
                fileContent += `- **Motivo:** ${analysis.recommendation.reason}\n`;
                fileContent += `- **Veredito:** ${analysis.regime === 'HOSTILE' ? '🌵 PROTEÇÃO: Deserto Detectado' : '✅ OPERAÇÃO: Dentro dos parâmetros'}\n\n`;
            }

            fileContent += `---\n*Simulação V9.5 Sniper Hesitante - Baseada em 40 grafos reais.*`;
            fs.writeFileSync(filePath, fileContent);
            console.log(`✅ [${stars} Estrelas] Gerado 5 cenários em: ${fileName}`);
        }
        
        console.log(`\n✨ Todos os cenários foram gerados na pasta ${outputDir}\n`);
    }
}

new V9ScenarioGenerator().run();
