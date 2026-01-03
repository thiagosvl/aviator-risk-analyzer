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

export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'MUITO_ALTO';

export interface PatternAnalysis {
  // Nível de risco calculado
  riskLevel: RiskLevel;
  
  // Confiança da análise (0-100)
  confidence: number;
  
  // Recomendação textual
  recommendation: string;
  
  // Métricas estatísticas
  volatility: number;
  average: number;
  median: number;
  
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
  | 'LOW_SEQUENCE'        // Sequência de velas baixas
  | 'HIGH_SEQUENCE'       // Sequência de velas altas
  | 'HIGH_VOLATILITY'     // Volatilidade alta
  | 'LOW_VOLATILITY'      // Volatilidade baixa
  | 'TREND_UP'            // Tendência de subida
  | 'TREND_DOWN'          // Tendência de descida
  | 'ALTERNATING'         // Alternância entre alto/baixo
  | 'CLUSTER_LOW'         // Cluster de valores baixos
  | 'CLUSTER_HIGH';       // Cluster de valores altos

export interface AnalyzerConfig {
  // Número de velas a considerar na análise
  historySize: number;
  
  // Intervalo de atualização em ms
  updateInterval: number;
  
  // Thresholds para classificação
  thresholds: {
    lowCandle: number;      // Ex: 1.5x
    highCandle: number;     // Ex: 5.0x
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
  enabledPatterns: [
    'LOW_SEQUENCE',
    'HIGH_SEQUENCE',
    'HIGH_VOLATILITY',
    'TREND_DOWN',
    'CLUSTER_LOW',
  ],
};
