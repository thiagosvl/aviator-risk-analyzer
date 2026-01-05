
import fs from 'fs';
import path from 'path';
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';

const CENARIOS_DIR = path.join(__dirname, '../CENARIOS_GERADOS');

function iconToValue(icon: string): number {
    if (icon === '🌸') return 10.0;
    if (icon === '🟣') return 2.0;
    if (icon === '🔵') return 1.0;
    return 1.0;
}

function valueToIcon(val: number): string {
    if (val >= 10.0) return '🌸';
    if (val >= 2.0) return '🟣';
    return '🔵';
}

function processFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    const scenarios = content.split(/### Cenário \d+/);
    const header = scenarios.shift(); // Get the file header
    
    let updatedContent = header || '';
    
    const scenarioMatches = content.match(/### Cenário (\d+)/g);
    
    scenarios.forEach((scenario, index) => {
        const historyMatch = scenario.match(/\*\*Histórico \(Recent -> Old\):\*\* (.*)/);
        if (!historyMatch) {
            updatedContent += (scenarioMatches ? scenarioMatches[index] : '') + scenario;
            return;
        }

        const historyIcons = historyMatch[1].trim().split(/\s+/);
        const historyValues = historyIcons.map(iconToValue);
        
        const result = StrategyCore.analyze(historyValues);
        
        // Update table
        let updatedScenario = scenario;
        
        // Replace 2x row
        const rec2x = result.recommendation2x;
        const action2x = rec2x.action === 'PLAY_2X' ? '✅ ENTRAR' : rec2x.action === 'STOP' ? '🛑 STOP' : '⏳ AGUARDAR';
        updatedScenario = updatedScenario.replace(
            /\| \*\*Roxa \(2x\)\*\* \| .* \| .* \|/,
            `| **Roxa (2x)** | ${action2x} | ${rec2x.reason} |`
        );
        
        // Replace Pink row
        const recPink = result.recommendationPink;
        const actionPink = recPink.action === 'PLAY_10X' ? '✅ ENTRAR' : recPink.action === 'STOP' ? '🛑 STOP' : '⏳ AGUARDAR';
        updatedScenario = updatedScenario.replace(
            /\| \*\*Rosa \(10x\)\*\* \| .* \| .* \|/,
            `| **Rosa (10x)** | ${actionPink} | ${recPink.reason} |`
        );
        
        updatedContent += (scenarioMatches ? scenarioMatches[index] : '') + updatedScenario;
    });

    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${path.basename(filePath)}`);
}

function main() {
    const files = fs.readdirSync(CENARIOS_DIR).filter(f => f.endsWith('.md'));
    files.forEach(file => {
        processFile(path.join(CENARIOS_DIR, file));
    });
}

main();
