/**
 * MODELO V1 - ESTRATÉGIA HÍBRIDA
 * 
 * ROSA: Última vela < 2x (blue)
 * ROXA: Purple% ≥60 + Streak ≥2 + Trend UP
 * 
 * Data: 05/01/2026
 * Versão: 1.0
 */

export interface WindowData {
  memory: number[];        // 25 últimas velas (memory[0] = mais recente)
  nextValue?: number;      // Próxima vela (apenas para teste)
}

export interface Decision {
  playRosa: boolean;
  playRoxa: boolean;
  motivoRosa?: string;
  motivoRoxa?: string;
  metrics?: {
    purplePercent: number;
    bluePercent: number;
    lastValue: number;
    streak: number;
    trend: 'UP' | 'DOWN' | 'FLAT';
  };
}

export interface StrategyResult {
  shouldPlay: boolean;
  strategy: 'ROSA' | 'ROXA' | 'WAIT';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reason: string;
  betAmount?: number;
  targetMultiplier?: number;
}

/**
 * Analisa janela de 25 velas e decide se deve jogar
 */
export function analyzeWindow(window: WindowData): Decision {
  const { memory } = window;
  
  if (memory.length !== 25) {
    throw new Error(`Janela deve ter 25 velas, recebeu ${memory.length}`);
  }
  
  // Calcular métricas
  const purples = memory.filter(v => v >= 2.0).length;
  const blues = memory.filter(v => v < 2.0).length;
  
  const purplePercent = (purples / 25) * 100;
  const bluePercent = (blues / 25) * 100;
  
  // Última vela (mais recente)
  const lastValue = memory[0];
  const lastIsBlue = lastValue < 2.0;
  
  // Streak de purples (do final para o início)
  let streak = 0;
  for (let i = 0; i < memory.length; i++) {
    if (memory[i] >= 2.0) {
      streak++;
    } else {
      break;
    }
  }
  
  // Trend (primeira metade vs segunda metade)
  const firstHalf = memory.slice(0, 12);   // Mais recentes
  const secondHalf = memory.slice(13, 25); // Mais antigas
  
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
  if (avgFirst > avgSecond * 1.1) {
    trend = 'UP';
  } else if (avgFirst < avgSecond * 0.9) {
    trend = 'DOWN';
  }
  
  // DECISÃO ROSA
  const playRosa = lastIsBlue;
  const motivoRosa = playRosa 
    ? `Última vela = ${lastValue.toFixed(2)}x < 2x (blue)` 
    : '';
  
  // DECISÃO ROXA
  const playRoxa = purplePercent >= 60 && streak >= 2 && trend === 'UP';
  const motivoRoxa = playRoxa 
    ? `Purple%=${purplePercent.toFixed(0)}% + Streak=${streak} + Trend=${trend}` 
    : '';
  
  return {
    playRosa,
    playRoxa,
    motivoRosa,
    motivoRoxa,
    metrics: {
      purplePercent,
      bluePercent,
      lastValue,
      streak,
      trend
    }
  };
}

/**
 * Converte decisão em resultado de estratégia
 */
export function decisionToResult(decision: Decision): StrategyResult {
  if (decision.playRosa) {
    return {
      shouldPlay: true,
      strategy: 'ROSA',
      confidence: 'MEDIUM',
      reason: decision.motivoRosa || 'Última vela é blue',
      betAmount: 50,
      targetMultiplier: 10.0
    };
  }
  
  if (decision.playRoxa) {
    return {
      shouldPlay: true,
      strategy: 'ROXA',
      confidence: 'HIGH',
      reason: decision.motivoRoxa || 'Momentum positivo forte',
      betAmount: 100,
      targetMultiplier: 2.0
    };
  }
  
  return {
    shouldPlay: false,
    strategy: 'WAIT',
    confidence: 'NONE',
    reason: 'Aguardando condições favoráveis'
  };
}

/**
 * Função principal: analisa e retorna resultado
 */
export function analyzeRound(history: number[]): StrategyResult {
  if (history.length < 25) {
    return {
      shouldPlay: false,
      strategy: 'WAIT',
      confidence: 'NONE',
      reason: `Aguardando histórico completo (${history.length}/25)`
    };
  }
  
  // Pegar últimas 25 velas
  const memory = history.slice(0, 25);
  
  const decision = analyzeWindow({ memory });
  return decisionToResult(decision);
}

/**
 * Simular rodada (para testes)
 */
export function simulateRound(window: WindowData): {
  decision: Decision;
  result: StrategyResult;
  outcome?: {
    rosaGreen: boolean;
    roxaGreen: boolean;
    rosaProfit: number;
    roxaProfit: number;
  };
} {
  const decision = analyzeWindow(window);
  const result = decisionToResult(decision);
  
  let outcome;
  if (window.nextValue !== undefined) {
    const rosaGreen = window.nextValue >= 10.0;
    const roxaGreen = window.nextValue >= 2.0;
    
    const rosaProfit = decision.playRosa 
      ? (rosaGreen ? 450 : -50) 
      : 0;
    
    const roxaProfit = decision.playRoxa 
      ? (roxaGreen ? 100 : -100) 
      : 0;
    
    outcome = {
      rosaGreen,
      roxaGreen,
      rosaProfit,
      roxaProfit
    };
  }
  
  return {
    decision,
    result,
    outcome
  };
}
