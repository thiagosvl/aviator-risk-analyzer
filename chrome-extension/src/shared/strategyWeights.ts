/**
 * SISTEMA DE PONTUAÇÃO V4.1 - PESOS AJUSTÁVEIS
 * 
 * Cada feature contribui independentemente para o score.
 * Ajuste os pesos aqui sem mexer na lógica principal.
 */

export interface ScoreBreakdown {
  streak: number;
  conversionRate: number;
  blueDensity: number;
  pinkDistance: number;
  volatility: number;
  pattern: number;
  downtrend: number;
  total: number;
  details: string[]; // Para debug: ["Streak=3: +30", "Conv=55%: +20", ...]
}

export interface StrategyWeights {
  // ROXA (2x)
  roxa: {
    // Streak
    streak_4_plus: number;
    streak_3: number;
    streak_2: number;
    streak_1: number;
    
    // Conversion Rate
    conv_60_plus: number;
    conv_50_59: number;
    conv_40_49: number;
    conv_under_40: number;
    
    // Blue Density
    blue_under_40: number;
    blue_40_50: number;
    blue_50_60: number;
    blue_over_60: number;
    
    // Pink Distance
    pink_5_plus: number;
    pink_3_4: number;
    pink_under_3: number;
    
    // Volatility
    volatility_medium: number;
    volatility_high: number;
    volatility_low: number;
    
    // Patterns
    xadrez_detected: number;
    deep_downtrend: number;
    
    // Threshold
    threshold: number;
  };
  
  // ROSA (10x)
  rosa: {
    // Pattern
    pattern_4_plus_occurrences: number;
    pattern_3_occurrences: number;
    pattern_2_occurrences: number;
    no_pattern: number;
    
    // Zone
    zone_exact: number;
    zone_near: number;
    zone_far: number;
    
    // Frequency
    freq_3_plus: number;
    freq_2: number;
    freq_1: number;
    freq_0: number;
    
    // Pink Distance
    pink_5_plus: number;
    pink_3_4: number;
    pink_under_3: number;
    
    // Interval
    interval_3_5: number;
    interval_6_10: number;
    interval_over_10: number;
    
    // Confidence
    confidence_80_plus: number;
    confidence_70_79: number;
    confidence_under_70: number;
    
    // Threshold
    threshold: number;
  };
}

/**
 * PERFIL SNIPER (NOVO - ULTRA CONSERVADOR)
 * Filosofia: Jogar MUITO POUCO, apenas nas MELHORES oportunidades
 * Meta: 70%+ assertividade, 5% taxa de entrada
 */
export const WEIGHTS_SNIPER: StrategyWeights = {
  roxa: {
    // Streak: Valorizar streaks médios (3-5), evitar extremos
    streak_4_plus: 60,  // Streak 4-5 é EXCELENTE
    streak_3: 45,       // Streak 3 é bom
    streak_2: 10,       // Streak 2 é fraco
    streak_1: -20,      // Streak 1 é ruim
    
    // Conversion Rate: EXIGIR alta conversão
    conv_60_plus: 60,   // Essencial!
    conv_50_59: 20,     // Fraco
    conv_40_49: -20,    // Ruim
    conv_under_40: -50, // Péssimo
    
    // Blue Density: Evitar mercados com muitos blues
    blue_under_40: 30,  // Poucos blues = bom
    blue_40_50: 5,      // Médio
    blue_50_60: -30,    // Muitos blues = ruim
    blue_over_60: -100, // Mercado quebrado
    
    // Pink Distance: Distância de rosa é crítica
    pink_5_plus: 40,    // Longe de rosa = seguro
    pink_3_4: 15,       // Médio
    pink_under_3: -100, // Muito perto = armadilha
    
    // Volatility
    volatility_medium: 15,
    volatility_high: 5,
    volatility_low: -10,  // Volatilidade baixa = mercado parado
    
    // Patterns
    xadrez_detected: 20,
    deep_downtrend: -60,  // Downtrend forte = EVITAR
    
    // Threshold: ULTRA ALTO - jogar apenas scores excepcio nais
    threshold: 120,  // Apenas as MELHORES oportunidades (top 5% dos casos)
  },
  
  rosa: {
    // DESATIVADO
    pattern_4_plus_occurrences: 50,
    pattern_3_occurrences: 35,
    pattern_2_occurrences: 25,
    no_pattern: 0,
    
    zone_exact: 30,
    zone_near: 20,
    zone_far: -20,
    
    freq_3_plus: 20,
    freq_2: 10,
    freq_1: 0,
    freq_0: -50,
    
    pink_5_plus: 15,
    pink_3_4: 5,
    pink_under_3: -40,
    
    interval_3_5: 15,
    interval_6_10: 10,
    interval_over_10: 5,
    
    confidence_80_plus: 20,
    confidence_70_79: 10,
    confidence_under_70: 0,
    
    threshold: 999,  // DESATIVADO
  }
};

/**
 * PERFIL BALANCED (PADRÃO)
 * Baseado no design V4.0
 */
export const WEIGHTS_BALANCED: StrategyWeights = {
  roxa: {
    // Streak
    streak_4_plus: 40,  // Aumentado: streak longo é forte indicador
    streak_3: 25,       // Aumentado
    streak_2: 10,
    streak_1: 0,
    
    // Conversion Rate
    conv_60_plus: 50,   // Aumentado: alta conversão é essencial
    conv_50_59: 30,
    conv_40_49: 10,     // Reduzido
    conv_under_40: -30, // Penalidade maior
    
    // Blue Density
    blue_under_40: 25,  // Aumentado: poucos blues é bom sinal
    blue_40_50: 10,
    blue_50_60: -10,    // Penalidade leve
    blue_over_60: -80,  // Penalidade maior: muitos blues = mercado ruim
    
    // Pink Distance
    pink_5_plus: 30,    // AUMENTADO: distância de rosa é crítica
    pink_3_4: 10,       // AUMENTADO
    pink_under_3: -70,  // PENALIDADE MAIOR: rosa muito perto = armadilha
    
    // Volatility
    volatility_medium: 10,
    volatility_high: 5,
    volatility_low: 0,
    
    // Patterns
    xadrez_detected: 15,     // AUMENTADO: padrão xadrez é bom indicador
    deep_downtrend: -40,     // PENALIDADE MAIOR: downtrend forte = evitar
    
    // Threshold
    threshold: 95,  // MUITO CONSERVADOR: Jogar apenas scores altíssimos: Threshold não é o problema. Foco em pesos mais inteligentes
  },
  
  rosa: {
    // Pattern
    pattern_4_plus_occurrences: 50,
    pattern_3_occurrences: 35,
    pattern_2_occurrences: 25,
    no_pattern: 0,
    
    // Zone
    zone_exact: 30,
    zone_near: 20,
    zone_far: -20,
    
    // Frequency
    freq_3_plus: 20,
    freq_2: 10,
    freq_1: 0,
    freq_0: -50,
    
    // Pink Distance
    pink_5_plus: 15,
    pink_3_4: 5,
    pink_under_3: -40,
    
    // Interval
    interval_3_5: 15,
    interval_6_10: 10,
    interval_over_10: 5,
    
    // Confidence
    confidence_80_plus: 20,
    confidence_70_79: 10,
    confidence_under_70: 0,
    
    // Threshold
    threshold: 999,  // DESATIVADO: 12.2% assertividade é inaceitável. Reativar apenas após implementar rastreamento de zonas
  }
};

/**
 * PERFIL CONSERVADOR
 * Thresholds mais altos, pesos mais exigentes
 */
export const WEIGHTS_CONSERVATIVE: StrategyWeights = {
  roxa: {
    ...WEIGHTS_BALANCED.roxa,
    streak_4_plus: 50,
    streak_3: 35,
    conv_60_plus: 40,
    threshold: 70,
  },
  rosa: {
    ...WEIGHTS_BALANCED.rosa,
    pattern_4_plus_occurrences: 60,
    zone_exact: 40,
    threshold: 80,
  }
};

/**
 * PERFIL AGRESSIVO
 * Thresholds mais baixos, aceita mais oportunidades
 */
export const WEIGHTS_AGGRESSIVE: StrategyWeights = {
  roxa: {
    ...WEIGHTS_BALANCED.roxa,
    streak_3: 35,
    streak_2: 20,
    conv_50_59: 25,
    conv_40_49: 15,
    threshold: 45,
  },
  rosa: {
    ...WEIGHTS_BALANCED.rosa,
    pattern_3_occurrences: 40,
    pattern_2_occurrences: 25,
    zone_near: 25,
    threshold: 55,
  }
};

/**
 * PERFIL EXPERIMENTAL
 * Para testar novas configurações
 */
export const WEIGHTS_EXPERIMENTAL: StrategyWeights = {
  roxa: {
    ...WEIGHTS_BALANCED.roxa,
    // Ajuste aqui para testar
  },
  rosa: {
    ...WEIGHTS_BALANCED.rosa,
    // Ajuste aqui para testar
  }
};

/**
 * Perfis disponíveis
 */
export const PROFILES = {
  sniper: WEIGHTS_SNIPER,
  balanced: WEIGHTS_BALANCED,
  conservative: WEIGHTS_CONSERVATIVE,
  aggressive: WEIGHTS_AGGRESSIVE,
  experimental: WEIGHTS_EXPERIMENTAL,
};

export type ProfileName = keyof typeof PROFILES;

/**
 * Perfil ativo (pode ser mudado dinamicamente)
 */
export let ACTIVE_PROFILE: ProfileName = 'sniper';  // MUDADO PARA SNIPER

export const setActiveProfile = (profile: ProfileName): void => {
  ACTIVE_PROFILE = profile;
};

export const getActiveWeights = (): StrategyWeights => {
  return PROFILES[ACTIVE_PROFILE];
};
