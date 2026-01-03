/**
 * Analyzer Overlay - Componente principal do overlay que aparece sobre o jogo
 */

import { Badge } from '@src/content/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@src/content/components/ui/card';
import { useGameAnalysis } from '@src/content/hooks/useGameAnalysis';
import { cn } from '@src/content/lib/utils';
import { RiskLevel } from '@src/content/types';
import {
  AlertTriangle,
  CheckCircle,
  Maximize2,
  Minimize2,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function AnalyzerOverlay() {
  const { gameState, analysis, isAnalyzing, startAnalysis, stopAnalysis } = useGameAnalysis();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Iniciar análise automaticamente
  useEffect(() => {
    startAnalysis();
    return () => stopAnalysis();
  }, []);

  if (!isVisible) return null;

  const getRiskColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      BAIXO: 'text-green-500 bg-green-500/10 border-green-500/20',
      MEDIO: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      ALTO: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      MUITO_ALTO: 'text-red-500 bg-red-500/10 border-red-500/20',
    };
    return colors[level];
  };

  const getRiskIcon = (level: RiskLevel) => {
    const icons: Record<RiskLevel, React.ReactNode> = {
      BAIXO: <CheckCircle className="w-5 h-5" />,
      MEDIO: <AlertTriangle className="w-5 h-5" />,
      ALTO: <AlertTriangle className="w-5 h-5" />,
      MUITO_ALTO: <XCircle className="w-5 h-5" />,
    };
    return icons[level];
  };

  return (
    // Container absoluto no canto superior direito, FORA da área do jogo
    // pointer-events-auto restaura os cliques para este elemento específico
    <div className="fixed top-2 right-2 z-[2147483647] font-sans pointer-events-auto max-w-sm">
      <Card className="w-80 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              🎯 Aviator Analyzer
            </CardTitle>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-3 space-y-3 text-sm">
            {/* Status do Jogo - Compacto */}
            <div className="flex items-center justify-between bg-slate-800/30 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <Badge variant={gameState.isFlying ? "success" : "secondary"} className="text-xs">
                  {gameState.isFlying ? '✈️ VOO' : '⏸️ AGUARDANDO'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mult:</span>
                <span className="text-base font-bold text-white">
                  {gameState.currentMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>



            {/* Nível de Risco - Destaque */}
            <div className={cn(
              "p-3 rounded-lg border-2",
              getRiskColor(analysis.riskLevel)
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRiskIcon(analysis.riskLevel)}
                  <span className="font-bold text-base">{analysis.riskLevel}</span>
                </div>
                <span className="text-xs font-semibold">
                  {analysis.confidence}% confiança
                </span>
              </div>
            </div>

            {/* Recomendação */}
            <div className={cn(
              "p-3 rounded-lg border-l-4",
              getRiskColor(analysis.riskLevel)
            )}>
              <p className="text-xs text-white whitespace-pre-line leading-relaxed">
                {analysis.recommendation}
              </p>
            </div>

            {/* Estatísticas - Compacto */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 p-2 rounded text-center">
                <div className="text-xs text-gray-400">Volatilidade</div>
                <div className="text-base font-bold text-white">
                  {analysis.volatility.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded text-center">
                <div className="text-xs text-gray-400">Média</div>
                <div className="text-base font-bold text-white">
                  {analysis.average.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Últimas Velas - Mostrar apenas as 8 mais recentes */}
            {analysis.lastCandles.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Últimas 8 velas (mais recente à esquerda):</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.lastCandles.slice(0, 8).map((candle, index) => (
                    <Badge
                      key={index}
                      variant={candle < 1.5 ? "danger" : candle > 5 ? "success" : "secondary"}
                      className="text-xs px-2 py-0.5"
                    >
                      {candle.toFixed(2)}x
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Padrões Detectados - Mais compacto */}
            {analysis.patterns.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">Padrões:</span>
                <div className="space-y-1">
                  {analysis.patterns.slice(0, 3).map((pattern, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-xs p-1.5 rounded border-l-2 leading-tight",
                        pattern.severity === 'danger' && "bg-red-500/10 border-red-500 text-red-300",
                        pattern.severity === 'warning' && "bg-yellow-500/10 border-yellow-500 text-yellow-300",
                        pattern.severity === 'info' && "bg-blue-500/10 border-blue-500 text-blue-300"
                      )}
                    >
                      {pattern.description}
                    </div>
                  ))}
                  {analysis.patterns.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">+{analysis.patterns.length - 3} mais</div>
                  )}
                </div>
              </div>
            )}

            {/* Footer - Mais compacto */}
            <div className="text-center text-xs text-slate-500 pt-1">
              {isAnalyzing ? '🟢 Análise ativa' : '🔴 Pausado'}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
