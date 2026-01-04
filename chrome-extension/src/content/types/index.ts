/**
 * Tipos e interfaces do Aviator Risk Analyzer
 */

export interface CandleData {
  value: number;
  timestamp: number;
}

export interface GameState {
  currentMultiplier: number;
  isFlying: boolean;
  lastCrash: number | null;
  history: CandleData[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PatternAnalysis {
  // Nível de risco calculado
  riskLevel: RiskLevel;

  // Confiança da análise (0-100)
  confidence: number;

  // Recomendação textual
  recommendation: string;

  // Métricas estatísticas
  volatility: number;
  avgMultiplier: number;
  minMultiplier: number;
  maxMultiplier: number;
  
  // Smart Risk Metrics
  streak: number; // Positive (Purple/Pink count) or Negative (Blue count)
  pinkDistance: number; // Candles since last 10x+
  avgPostPink: number; // Médio das roxas após a última rosa
  medianPostPink: number; // Mediana das roxas (Valor Central/Seguro)
  winRate: number; // % of paying candles in recent history

  // Últimas velas para exibição
  lastCandles: number[];

  // Padrões detectados
  patterns: DetectedPattern[];
}

export interface DetectedPattern {
  type: PatternType;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  confidence: number;
}

export type PatternType =
  | 'LOW_SEQUENCE' // Sequência de velas baixas
  | 'HIGH_SEQUENCE' // Sequência de velas altas
  | 'HIGH_VOLATILITY' // Volatilidade alta
  | 'LOW_VOLATILITY' // Volatilidade baixa
  | 'TREND_UP' // Tendência de subida
  | 'TREND_DOWN' // Tendência de descida
  | 'ALTERNATING' // Alternância entre alto/baixo
  | 'CLUSTER_LOW' // Cluster de valores baixos
  | 'CLUSTER_HIGH' // Cluster de valores altos
  | 'PINK_LOCK' // Bloqueio por 3 quebras após rosa
  | 'PINK_PREDICTION'; // Previsão de rosa próxima

export interface AnalyzerConfig {
  // Número de velas a considerar na análise
  historySize: number;

  // Intervalo de atualização em ms
  updateInterval: number;

  // Thresholds para classificação
  thresholds: {
    lowCandle: number; // Ex: 1.5x
    highCandle: number; // Ex: 5.0x
    highVolatility: number; // Ex: 2.0
  };

  // Padrões a detectar
  enabledPatterns: PatternType[];
}

export const DEFAULT_CONFIG: AnalyzerConfig = {
  historySize: 20,
  updateInterval: 500,
  thresholds: {
    lowCandle: 1.5,
    highCandle: 5.0,
    highVolatility: 2.0,
  },
  enabledPatterns: ['LOW_SEQUENCE', 'HIGH_SEQUENCE', 'HIGH_VOLATILITY', 'TREND_DOWN', 'CLUSTER_LOW'],
};
