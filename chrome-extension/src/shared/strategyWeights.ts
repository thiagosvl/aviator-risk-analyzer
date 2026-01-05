/**
 * SISTEMA DE PONTUAÇÃO V4.0 - PESOS AJUSTÁVEIS
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
 * PERFIL BALANCEADO (PADRÃO)
 * Baseado no design V4.0
 */
export const WEIGHTS_BALANCED: StrategyWeights = {
  roxa: {
    // Streak
    streak_4_plus: 40,
    streak_3: 30,
    streak_2: 15,
    streak_1: 5,
    
    // Conversion Rate
    conv_60_plus: 30,
    conv_50_59: 20,
    conv_40_49: 10,
    conv_under_40: -10,
    
    // Blue Density
    blue_under_40: 20,
    blue_40_50: 10,
    blue_50_60: 0,
    blue_over_60: -30,
    
    // Pink Distance
    pink_5_plus: 15,
    pink_3_4: 5,
    pink_under_3: -50,
    
    // Volatility
    volatility_medium: 10,
    volatility_high: 5,
    volatility_low: 0,
    
    // Patterns
    xadrez_detected: 10,
    deep_downtrend: -20,
    
    // Threshold
    threshold: 55,  // Ajustado para mais jogadas
  },
  
  rosa: {
    // Pattern
    pattern_4_plus_occurrences: 50,
    pattern_3_occurrences: 35,
    pattern_2_occurrences: 20,
    no_pattern: -30,
    
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
    threshold: 65,  // Ajustado para mais jogadas
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
    threshold: 70,  // Conservador ajustado
  },
  rosa: {
    ...WEIGHTS_BALANCED.rosa,
    pattern_4_plus_occurrences: 60,
    zone_exact: 40,
    threshold: 80,  // Conservador ajustado
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
    threshold: 45,  // Agressivo ajustado
  },
  rosa: {
    ...WEIGHTS_BALANCED.rosa,
    pattern_3_occurrences: 40,
    pattern_2_occurrences: 25,
    zone_near: 25,
    threshold: 55,  // Agressivo ajustado
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
  balanced: WEIGHTS_BALANCED,
  conservative: WEIGHTS_CONSERVATIVE,
  aggressive: WEIGHTS_AGGRESSIVE,
  experimental: WEIGHTS_EXPERIMENTAL,
};

export type ProfileName = keyof typeof PROFILES;

/**
 * Perfil ativo (pode ser mudado dinamicamente)
 */
export let ACTIVE_PROFILE: ProfileName = 'balanced';

export const setActiveProfile = (profile: ProfileName): void => {
  ACTIVE_PROFILE = profile;
};

export const getActiveWeights = (): StrategyWeights => {
  return PROFILES[ACTIVE_PROFILE];
};
