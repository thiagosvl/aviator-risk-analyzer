
const fs = require('fs');
const path = require('path');

// === STRATEGY LOGIC (Ported from StrategyCore.ts) ===

class StrategyLogic {
    static analyze(values) {
        // Basic stats needed for V8
        const lastPinkIndex = values.findIndex(v => v >= 10.0);
        const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;
        
        // Phase
        const phase = this.calculatePhaseV8(values, candlesSinceLastPink);
        
        // Decision
        const recPink = this.decideActionSniperV8(values, candlesSinceLastPink, phase);
        
        // Volatility Score (Mock for display)
        const volatilityScore = Math.random() * 100;

        // Market Stats (Window 60)
        const slice = values.slice(0, 60);
        const blue = slice.filter(v => v < 2.0).length;
        const pink = slice.filter(v => v >= 10.0).length;
        const purple = slice.length - blue - pink;
        
        const marketStats = {
           bluePercent: Math.round((blue / slice.length) * 100),
           purplePercent: Math.round((purple / slice.length) * 100),
           pinkPercent: Math.round((pink / slice.length) * 100)
        };

        return {
            recommendationPink: recPink,
            phase,
            candlesSinceLastPink,
            volatilityScore,
            marketStats
        };
    }

    static decideActionSniperV8(values, candlesSinceLastPink, phase) {
        if (values.length === 0) return { action: 'WAIT', reason: 'Aguardando dados...', riskLevel: 'LOW' };
        
        // 1. DESERT PROTECTION
        if (phase === 'DESERT') {
            return { action: 'WAIT', reason: `🌵 FASE DESERTO: ${candlesSinceLastPink} velas sem rosa.`, riskLevel: 'HIGH' };
        }

        // 2. RECOVERY
        if (phase === 'RECOVERY') {
            const recoveryRound = candlesSinceLastPink + 1;
            return {
                action: 'PLAY_10X',
                reason: `🔥 RECUPERAÇÃO PÓS-DESERTO (Tentativa ${recoveryRound}/3).`,
                riskLevel: 'MEDIUM'
            };
        }

        // 3. TRIGGERS
        const lastValue = values[0];
        
        // CHECK: Blue
        if (lastValue < 2.0) {
            return { action: 'PLAY_10X', reason: `🎯 TRIGGER: AZUL (< 2.0x)`, riskLevel: 'MEDIUM' };
        }

        // CHECK: Low Purple
        if (lastValue >= 2.0 && lastValue <= 3.5) {
            return { action: 'PLAY_10X', reason: `🎯 TRIGGER: ROXA BAIXA (2x-3.5x)`, riskLevel: 'MEDIUM' };
        }

        // CHECK: Sticky Pink
        if (lastValue >= 10.0) {
            return { action: 'PLAY_10X', reason: `🎯 TRIGGER: ROSA COLADA (Sticky)`, riskLevel: 'MEDIUM' };
        }

        // NO TRIGGER
        return { action: 'WAIT', reason: `⏳ Aguardando gatilho. Última: ${lastValue.toFixed(2)}x`, riskLevel: 'LOW' };
    }

    static calculatePhaseV8(values, candlesSinceLastPink) {
        if (candlesSinceLastPink >= 12) return 'DESERT';

        const pinkIndex = candlesSinceLastPink;
        
        if (pinkIndex <= 2) {
            const nextPinkIndexRel = values.slice(pinkIndex + 1).findIndex(v => v >= 10.0);
            
            if (nextPinkIndexRel !== -1) {
                const actualNextPinkIndex = pinkIndex + 1 + nextPinkIndexRel;
                const gap = actualNextPinkIndex - pinkIndex - 1;
                
                if (gap >= 12) {
                    return 'RECOVERY';
                }
            } else {
                if (values.length > pinkIndex + 1 + 12) {
                    return 'RECOVERY';
                }
            }
        }
        
        return 'NORMAL';
    }
}

// === GENERATOR ===

class V8ScenarioGenerator {
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

        const outputDir = path.join(__dirname, '../CENARIOS_V8');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('\n🚀 GERANDO CENÁRIOS V8 (Sniper Edition)\n');

        for (let stars = 1; stars <= 5; stars++) {
            const fileName = `cenario_${stars}_${stars === 1 ? 'star' : 'stars'}.md`;
            const filePath = path.join(outputDir, fileName);
            let fileContent = `# 🚁 Bateria de Cenários V8 - ${stars} Estrelas\n\n`;
            fileContent += `**Qualidade do Mercado:** ${starNames[stars - 1]}\n`;
            fileContent += `**Data da Geração:** ${new Date().toLocaleString()}\n\n`;

            for (let scenarioIdx = 1; scenarioIdx <= 5; scenarioIdx++) {
                const history = [];
                // Generate 60 candles history
                for (let j = 0; j < 60; j++) {
                    history.push(this.generateCandle(stars));
                }

                // Analyze (history[0] is newest)
                const memory = [...history].reverse(); // history was pushed sequentially [old...new], so reverse to get [new...old]
                const analysis = StrategyLogic.analyze(memory);

                fileContent += `--- \n\n`;
                fileContent += `## 📍 Cenário #${scenarioIdx}\n\n`;
                
                fileContent += `### 📜 Histórico Recente (Top 25 / Total 60)\n`;
                const recentIcons = [...memory].slice(0, 25).map(v => v >= 10 ? '🌸' : v >= 2 ? '🟣' : '🔵').join(' ');
                fileContent += `${recentIcons} (Últimas 25 velas - Esquerda é mais recente)\n\n`;

                fileContent += `### 🎯 Inteligência Sniper V8\n`;
                fileContent += `- **Fase Atual:** ${analysis.phase === 'RECOVERY' ? '🔥 RECOVERY (Repique)' : analysis.phase === 'DESERT' ? '🌵 DESERTO (Proteção)' : '⚖️ NORMAL'}\n`;
                fileContent += `- **Mercado (60 velas):** AZUL ${analysis.marketStats.bluePercent}% | ROXO ${analysis.marketStats.purplePercent}% | ROSA ${analysis.marketStats.pinkPercent}%\n`;
                
                fileContent += `\n#### 🛡️ Recomendação Sniper (V8)\n`;
                fileContent += `- **Ação:** ${analysis.recommendationPink.action === 'PLAY_10X' ? '✅ JOGAR' : '⏳ AGUARDAR'}\n`;
                fileContent += `- **Motivo:** ${analysis.recommendationPink.reason}\n`;
                fileContent += `- **Risco:** ${analysis.recommendationPink.riskLevel}\n\n`;
            }

            fileContent += `---\n*Relatório de simulação V8 Sniper Engine - Lote de 5 cenários.*`;
            fs.writeFileSync(filePath, fileContent);
            console.log(`✅ [${stars} Estrelas] Gerado 5 cenários em: ${fileName}`);
        }
        
        console.log(`\n✨ Todos os cenários foram gerados na pasta ${outputDir}\n`);
    }
}

new V8ScenarioGenerator().run();
