/**
 * Análise de Gráfico - Simulação com Código V3
 * 
 * Gráfico: Inicia em 2.41x, termina em 2.61x
 * Ordem: Esquerda → Direita (linha por linha)
 * Velas 1-25: Histórico base (não jogáveis)
 * Velas 26+: Jogáveis (simulação)
 */

// Extrair dados do gráfico (esquerda → direita, linha por linha)
const historico_completo = [
  // Linha 1 (mais recente)
  2.41, 1.01, 1.31, 1.41, 2.43, 45.47, 1.00, 1.25, 1.61, 4.29, 6.53, 1.49, 2.32, 10.88, 1.18, 2.13, 3.46,
  // Linha 2
  1.31, 2.20, 1.77, 1.82, 1.42, 1.04, 8.09, 3.46, 1.20, 1.28, 1.08, 1.98, 1.25, 14.13, 1.67, 1.60, 2.59,
  // Linha 3 (mais antiga)
  1.18, 3.91, 1.32, 7.70, 1.23, 3.90, 1.48, 1.60, 2.11, 1.06, 1.19, 1.74, 2.61
];

// Inverter para ordem cronológica (mais antiga → mais recente)
const historico_cronologico = [...historico_completo].reverse();

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 ANÁLISE DE GRÁFICO - SIMULAÇÃO COM CÓDIGO V3');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📈 Dados do Gráfico:');
console.log(`   Total de velas: ${historico_cronologico.length}`);
console.log(`   Primeira vela (mais antiga): ${historico_cronologico[0]}x`);
console.log(`   Última vela (mais recente): ${historico_cronologico[historico_cronologico.length - 1]}x`);
console.log(`   Velas 1-25: Histórico base (não jogáveis)`);
console.log(`   Velas 26-${historico_cronologico.length}: Jogáveis\n`);

// Identificar rosas no histórico completo
console.log('🌸 Rosas (≥10.00x) no histórico completo:');
historico_cronologico.forEach((v, i) => {
  if (v >= 10.0) {
    const velaNum = i + 1;
    const jogavel = velaNum > 25 ? '✅ JOGÁVEL' : '❌ Histórico';
    console.log(`   Vela ${velaNum}: ${v}x ${jogavel}`);
  }
});

// Identificar roxas (2.00-9.99x)
const roxas = historico_cronologico.filter(v => v >= 2.0 && v < 10.0);
console.log(`\n🟣 Roxas (2.00-9.99x): ${roxas.length} velas`);

// Identificar azuis (<2.00x)
const azuis = historico_cronologico.filter(v => v < 2.0);
console.log(`🔵 Azuis (<2.00x): ${azuis.length} velas\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('🎮 SIMULAÇÃO VELA POR VELA (26+)');
console.log('═══════════════════════════════════════════════════════════\n');

interface PatternData {
  type: 'DIAMOND' | 'GOLD' | 'SILVER';
  interval: number;
  confidence: number;
  candlesUntilMatch: number;
  occurrences?: number;
}

interface Recommendation {
  action: 'PLAY_2X' | 'PLAY_10X' | 'WAIT' | 'STOP';
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
}

interface AnalysisData {
  recommendation: Recommendation;
  pinkPattern?: PatternData;
  purpleStreak: number;
  conversionRate: number;
  volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  candlesSinceLastPink: number;
}

/**
 * Calcula streak (sequência de roxas ou azuis)
 */
function calculateStreak(values: number[]): number {
  if (values.length === 0) return 0;
  const firstIsBlue = values[0] < 2.0;
  let count = 0;
  for (const v of values) {
    if ((v < 2.0) === firstIsBlue) count++;
    else break;
  }
  return firstIsBlue ? -count : count;
}

/**
 * Calcula taxa de conversão de roxas
 */
function calculateConversionRate(values: number[], lookback: number): number {
  const slice = values.slice(0, Math.min(lookback, values.length));
  let opportunities = 0;
  let conversions = 0;

  for (let i = 1; i < slice.length; i++) {
    const current = slice[i];
    const next = slice[i - 1];

    if (current >= 2.0 && current < 10.0) {
      opportunities++;
      if (next >= 2.0) {
        conversions++;
      }
    }
  }

  return opportunities === 0 ? 0 : (conversions / opportunities) * 100;
}

/**
 * Detecta padrões Rosa - Versão V3 (CORRIGIDA)
 */
function detectPinkPatternV3(values: number[]): PatternData | null {
  const lastPinkIndex = values.findIndex(v => v >= 10.0);

  if (lastPinkIndex === -1) return null;

  const pinkIndices = values
    .map((v, i) => (v >= 10.0 ? i : -1))
    .filter(i => i !== -1);

  if (pinkIndices.length < 3) return null;

  const currentDistance = lastPinkIndex;
  const intervals: number[] = [];

  for (let i = 0; i < pinkIndices.length - 1; i++) {
    intervals.push(pinkIndices[i + 1] - pinkIndices[i]);
  }

  const intervalFrequency = new Map<number, number>();
  intervals.forEach(interval => {
    intervalFrequency.set(interval, (intervalFrequency.get(interval) || 0) + 1);
  });

  const confirmedIntervals = Array.from(intervalFrequency.entries())
    .filter(([, count]) => count >= 2)
    .map(([interval, count]) => ({ interval, count }))
    .sort((a, b) => b.count - a.count);

  if (confirmedIntervals.length === 0) return null;

  for (const { interval, count } of confirmedIntervals) {
    const diff = Math.abs(currentDistance - interval);

    if (diff <= 1) {
      let confidence = 50 + count * 15;
      confidence = Math.min(confidence, 95);

      let type: 'DIAMOND' | 'GOLD' | 'SILVER' = 'SILVER';
      if (count >= 3) type = 'DIAMOND';
      else if (count >= 2) type = 'GOLD';

      return {
        type,
        interval,
        confidence,
        candlesUntilMatch: interval - currentDistance,
        occurrences: count,
      };
    }
  }

  return null;
}

/**
 * Analisa estado atual e gera recomendação
 */
function analyze(history: number[]): AnalysisData {
  const values = [...history].reverse(); // Mais recente primeiro

  // Densidade
  const densityCheckWindow = Math.min(values.length, 50);
  const recentValues = values.slice(0, densityCheckWindow);
  const pinkCount = recentValues.filter(v => v >= 10.0).length;
  const pinkDensityPercent = (pinkCount / densityCheckWindow) * 100;

  let volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
  else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';

  // Conversão
  const purpleConversionRate = calculateConversionRate(values, 25);

  // Streak
  const streak = calculateStreak(values);
  const lastPinkIndex = values.findIndex(v => v >= 10.0);
  const candlesSinceLastPink = lastPinkIndex === -1 ? values.length : lastPinkIndex;

  // Padrão Rosa
  const pinkPattern = detectPinkPatternV3(values);

  // Trava pós-rosa
  const isPostPinkLock = candlesSinceLastPink < 3;

  // Stop Loss
  const isStopLoss = streak <= -2;

  // Sequência válida
  const isPurpleStreakValid = streak >= 1 && purpleConversionRate >= 50;

  // Decisão
  let recommendation: Recommendation;

  // Prioridade 1: Padrão Rosa confirmado
  if (pinkPattern && pinkPattern.confidence >= 65 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
    recommendation = {
      action: 'PLAY_10X',
      reason: `Padrão ${pinkPattern.type} (${pinkPattern.occurrences}x confirmado)`,
      riskLevel: 'LOW',
      confidence: pinkPattern.confidence,
    };
  }
  // Prioridade 2: Trava pós-rosa (apenas para Roxa)
  else if (isPostPinkLock) {
    recommendation = {
      action: 'WAIT',
      reason: `Trava Pós-Rosa (${candlesSinceLastPink}/3)`,
      riskLevel: 'CRITICAL',
      confidence: 100,
    };
  }
  // Prioridade 3: Stop Loss
  else if (isStopLoss) {
    recommendation = {
      action: 'STOP',
      reason: 'Stop Loss (2 Azuis)',
      riskLevel: 'HIGH',
      confidence: 90,
    };
  }
  // Prioridade 4: Retomada (1 roxa)
  else if (streak === 1) {
    if (volatilityDensity === 'HIGH') {
      recommendation = {
        action: 'PLAY_2X',
        reason: 'Retomada Agressiva (Alta Densidade)',
        riskLevel: 'MEDIUM',
        confidence: 60,
      };
    } else {
      recommendation = {
        action: 'WAIT',
        reason: 'Retomada: Aguardando 2ª roxa',
        riskLevel: 'MEDIUM',
        confidence: 80,
      };
    }
  }
  // Prioridade 5: Sequência
  else if (streak >= 2) {
    if (isPurpleStreakValid) {
      recommendation = {
        action: 'PLAY_2X',
        reason: 'Surfando Sequência (Conv > 50%)',
        riskLevel: 'LOW',
        confidence: 85,
      };
    } else {
      recommendation = {
        action: 'WAIT',
        reason: 'Sequência Suspeita (Conv Baixa)',
        riskLevel: 'MEDIUM',
        confidence: 50,
      };
    }
  }
  // Default
  else {
    recommendation = {
      action: 'WAIT',
      reason: 'Aguardando oportunidade',
      riskLevel: 'MEDIUM',
      confidence: 50,
    };
  }

  return {
    recommendation,
    pinkPattern,
    purpleStreak: streak > 0 ? streak : 0,
    conversionRate: Math.round(purpleConversionRate),
    volatilityDensity,
    candlesSinceLastPink,
  };
}

// Simular jogadas
interface Jogada {
  vela: number;
  acao: string;
  motivo: string;
  valor: number;
  resultado: string;
  lucro: number;
  banca: number;
}

const jogadas: Jogada[] = [];
let banca = 1000; // Banca inicial R$ 1000

for (let i = 25; i < historico_cronologico.length; i++) {
  const velaAtual = i + 1;
  const historico_ate_agora = historico_cronologico.slice(0, i);
  const proxima_vela = historico_cronologico[i];

  const analise = analyze(historico_ate_agora);
  const { recommendation } = analise;

  if (recommendation.action === 'PLAY_2X') {
    const aposta = 100;
    const resultado = proxima_vela >= 2.0 ? 'GREEN' : 'RED';
    const lucro = resultado === 'GREEN' ? aposta : -aposta;
    banca += lucro;

    jogadas.push({
      vela: velaAtual,
      acao: 'JOGUE 2x @ R$100',
      motivo: recommendation.reason,
      valor: proxima_vela,
      resultado,
      lucro,
      banca,
    });

    console.log(`Vela ${velaAtual}: ${recommendation.action} (${recommendation.reason})`);
    console.log(`   Resultado: ${proxima_vela}x → ${resultado} (${lucro >= 0 ? '+' : ''}R$${lucro})`);
    console.log(`   Banca: R$${banca}\n`);
  } else if (recommendation.action === 'PLAY_10X') {
    const aposta = 50;
    const resultado = proxima_vela >= 10.0 ? 'GREEN' : 'RED';
    const lucro = resultado === 'GREEN' ? aposta * 9 : -aposta; // 10x = 9x de lucro + aposta
    banca += lucro;

    jogadas.push({
      vela: velaAtual,
      acao: 'JOGUE 10x @ R$50',
      motivo: recommendation.reason,
      valor: proxima_vela,
      resultado,
      lucro,
      banca,
    });

    console.log(`Vela ${velaAtual}: ${recommendation.action} (${recommendation.reason})`);
    console.log(`   Resultado: ${proxima_vela}x → ${resultado} (${lucro >= 0 ? '+' : ''}R$${lucro})`);
    console.log(`   Banca: R$${banca}\n`);
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 RESUMO DA SIMULAÇÃO');
console.log('═══════════════════════════════════════════════════════════\n');

const total_jogadas = jogadas.length;
const jogadas_2x = jogadas.filter(j => j.acao.includes('2x')).length;
const jogadas_10x = jogadas.filter(j => j.acao.includes('10x')).length;
const greens = jogadas.filter(j => j.resultado === 'GREEN').length;
const reds = jogadas.filter(j => j.resultado === 'RED').length;
const taxa_acerto = total_jogadas > 0 ? (greens / total_jogadas) * 100 : 0;
const lucro_total = banca - 1000;
const roi = ((lucro_total / 1000) * 100).toFixed(2);

console.log(`📈 Total de jogadas: ${total_jogadas}`);
console.log(`   🟣 Jogadas 2x: ${jogadas_2x}`);
console.log(`   🌸 Jogadas 10x: ${jogadas_10x}\n`);

console.log(`✅ Greens: ${greens}`);
console.log(`❌ Reds: ${reds}`);
console.log(`📊 Taxa de acerto: ${taxa_acerto.toFixed(2)}%\n`);

console.log(`💰 Banca inicial: R$ 1000.00`);
console.log(`💰 Banca final: R$ ${banca.toFixed(2)}`);
console.log(`📈 Lucro/Prejuízo: ${lucro_total >= 0 ? '+' : ''}R$ ${lucro_total.toFixed(2)}`);
console.log(`📊 ROI: ${roi}%\n`);

if (jogadas.length > 0) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 DETALHAMENTO DAS JOGADAS');
  console.log('═══════════════════════════════════════════════════════════\n');

  jogadas.forEach(j => {
    console.log(`Vela ${j.vela}: ${j.acao}`);
    console.log(`   Motivo: ${j.motivo}`);
    console.log(`   Resultado: ${j.valor}x → ${j.resultado} (${j.lucro >= 0 ? '+' : ''}R$${j.lucro})`);
    console.log(`   Banca: R$${j.banca.toFixed(2)}\n`);
  });
} else {
  console.log('⚠️  Nenhuma jogada foi realizada (código V3 não encontrou oportunidades).\n');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🎯 CONCLUSÃO');
console.log('═══════════════════════════════════════════════════════════\n');

if (total_jogadas === 0) {
  console.log('O código V3 é muito conservador e não encontrou padrões');
  console.log('confirmados neste gráfico. Isso é esperado quando:');
  console.log('- Poucos intervalos de rosas se repetem (≥2x)');
  console.log('- Densidade de rosas é baixa');
  console.log('- Histórico é curto (poucas velas)\n');
} else {
  if (taxa_acerto >= 80) {
    console.log('✅ Taxa de acerto EXCELENTE (≥80%)');
  } else if (taxa_acerto >= 70) {
    console.log('✅ Taxa de acerto BOA (70-79%)');
  } else if (taxa_acerto >= 60) {
    console.log('⚠️  Taxa de acerto RAZOÁVEL (60-69%)');
  } else {
    console.log('❌ Taxa de acerto BAIXA (<60%)');
  }

  if (parseFloat(roi) >= 100) {
    console.log('✅ ROI EXCELENTE (≥100%)');
  } else if (parseFloat(roi) >= 50) {
    console.log('✅ ROI BOM (50-99%)');
  } else if (parseFloat(roi) > 0) {
    console.log('⚠️  ROI POSITIVO mas baixo (1-49%)');
  } else {
    console.log('❌ ROI NEGATIVO (prejuízo)');
  }

  console.log(`\nTotal de entradas: ${total_jogadas} em ${historico_cronologico.length - 25} velas jogáveis`);
  console.log(`Seletividade: ${((total_jogadas / (historico_cronologico.length - 25)) * 100).toFixed(2)}%\n`);
}

console.log('═══════════════════════════════════════════════════════════\n');
