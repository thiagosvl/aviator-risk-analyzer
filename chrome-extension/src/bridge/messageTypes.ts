export type MessageType = 
  | 'GAME_UPDATE' 
  | 'ANALYSIS_UPDATE' 
  | 'PATTERN_DETECTED'
  | 'PING' 
  | 'PONG';

export interface CandleData {
  value: number;
  timestamp: number;
}

export interface GameData {
  currentMultiplier: number;
  isFlying: boolean;
  history: CandleData[];
  lastCrash: number;
}

export interface Recommendation {
  action: 'PLAY_2X' | 'PLAY_10X' | 'WAIT' | 'STOP' | 'STOP_WIN' | 'STOP_LOSS';
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0-100
  target?: number; // 2.0 or 10.0
}

export interface PatternData {
  type: 'DIAMOND' | 'GOLD' | 'SILVER';
  interval: number;
  confidence: number;
  candlesUntilMatch: number;
  displayName?: string;
}

export interface AnalysisData {
  recommendation: Recommendation;
  pinkPattern?: PatternData;
  purpleStreak: number;
  conversionRate: number;
  volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  candlesSinceLastPink: number;
}

export interface BridgeMessage<T = any> {
  type: MessageType;
  payload: T;
  timestamp: number;
  source: 'AVIATOR_SPY';
}
