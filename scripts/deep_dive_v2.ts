
import fs from 'fs';
import path from 'path';

// Configuração fixa para análise (Rosa 10x)
const TARGET = 10.0;
const ENTRY_TRIGGER = 2.0;

interface EntryContext {
  result: 'WIN' | 'LOSS';
  blueStreak: number;
  distLastPink: number; // Distância desde a última vela >= 10x
  recentVolatility: number; // Média das últimas 10 velas
}

const entries: EntryContext[] = [];

const graphsDir = 'GRAFOS_TESTE';
const files = fs.readdirSync(graphsDir).filter(f => f.endsWith('.txt') && !f.startsWith('relatorio_'));

console.log(`🔍 Analisando ${files.length} grafos para encontrar Padrões de Vitória/Derrota...`);

for (const file of files) {
  const content = fs.readFileSync(path.join(graphsDir, file), 'utf-8');
  const values = content.split('\n').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  const chron = [...values].reverse(); // Do antigo pro recente

  let lastPinkIndex = -1; // -1 significa que não vimos pink ainda

  for (let i = 0; i < chron.length - 1; i++) {
    const current = chron[i];
    const next = chron[i+1];

    // Atualizar índice da última Rosa
    if (current >= TARGET) {
      lastPinkIndex = i;
    }

    // Regra de Entrada: Última < 2.0
    if (current < ENTRY_TRIGGER) {
      const isWin = next >= TARGET;
      
      // 1. Calcular Streak de Blues (retroativo)
      let streak = 0;
      for (let j = i; j >= 0; j--) {
        if (chron[j] < 2.0) streak++;
        else break;
      }

      // 2. Calcular Distância da Última Pink
      const distPink = lastPinkIndex === -1 ? 999 : (i - lastPinkIndex);

      // 3. Volatilidade recente (média das últimas 10)
      const startVol = Math.max(0, i - 10);
      const recentWindow = chron.slice(startVol, i + 1);
      const volatility = recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length;

      entries.push({
        result: isWin ? 'WIN' : 'LOSS',
        blueStreak: streak,
        distLastPink: distPink,
        recentVolatility: volatility
      });
    }
  }
}

// --- ANALISE ESTATÍSTICA ---

// Buffer de saída
let output = '';
const log = (msg: string) => {
  console.log(msg);
  output += msg + '\n';
};

function analyzeMetric(name: string, extractor: (e: EntryContext) => number, buckets: number[]) {
  log(`\n📊 ANÁLISE POR: ${name}`);
  log(`Range\t| Jogadas\t| Wins\t| WinRate\t| Lucro (Simulado R$50/R$500)`);
  log(`----------------------------------------------------------------`);

  // Buckets: ex [1, 2, 3, 5, 10] -> 1, 2, 3, 4-5, 6-10, 11+
  // Simplificação: vamos agrupar valores exatos para numeros pequenos e ranges para grandes
  
  const groups: Record<string, EntryContext[]> = {};
  
  entries.forEach(e => {
    const val = extractor(e);
    let key = '';
    
    // Logica de bucket customizada
    if (name === 'Blue Streak') {
       if (val <= 5) key = val.toString();
       else if (val <= 10) key = '6-10';
       else key = '11+';
    } else if (name === 'Distância Pink') {
       if (val <= 10) key = '00-10'; // Muito quente (Padding 00 para sort)
       else if (val <= 20) key = '11-20';
       else if (val <= 50) key = '21-50';
       else key = '51+'; // Gelado
    } else if (name === 'Volatilidade') {
       if (val < 2.0) key = '< 2.0x';
       else if (val < 5.0) key = '2.0x - 5.0x';
       else key = '> 5.0x';
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  // Ordenar keys
  const sortedKeys = Object.keys(groups).sort((a,b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    const group = groups[key];
    const total = group.length;
    const wins = group.filter(g => g.result === 'WIN').length;
    const winRate = (wins / total) * 100;
    const profit = (wins * 500) - (total * 50);

    log(`${key}\t| ${total}\t\t| ${wins}\t| ${winRate.toFixed(1)}%\t\t| R$ ${profit}`);
  }
}

analyzeMetric('Blue Streak', e => e.blueStreak, []);
analyzeMetric('Distância Pink', e => e.distLastPink, []);
analyzeMetric('Volatilidade', e => e.recentVolatility, []);

log(`\n💡 INSIGHTS AUTOMÁTICOS:`);
log(`- Total de Analises: ${entries.length}`);
const globalWinRate = (entries.filter(e => e.result === 'WIN').length / entries.length) * 100;
log(`- WinRate Global: ${globalWinRate.toFixed(1)}%`);

fs.writeFileSync('relatorio_deep_dive.txt', output);
console.log('\n📄 Relatório salvo em: relatorio_deep_dive.txt');
