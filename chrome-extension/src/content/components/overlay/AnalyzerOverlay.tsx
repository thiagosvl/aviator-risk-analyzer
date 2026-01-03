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
  GripVertical,
  Maximize2,
  Minimize2,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export function AnalyzerOverlay() {
  const { gameState, analysis, isAnalyzing, startAnalysis, stopAnalysis } = useGameAnalysis();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Estado para draggable
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Posição inicial na lateral esquerda
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Iniciar análise automaticamente
  useEffect(() => {
    startAnalysis();
    return () => stopAnalysis();
  }, []);

  // Handlers para drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isVisible) return null;

  const getRiskColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      BAIXO: 'text-green-400 bg-green-500/10 border-green-500',
      MEDIO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500',
      ALTO: 'text-orange-400 bg-orange-500/10 border-orange-500',
      MUITO_ALTO: 'text-red-400 bg-red-500/10 border-red-500',
    };
    return colors[level];
  };

  const getRiskIcon = (level: RiskLevel) => {
    const icons: Record<RiskLevel, React.ReactNode> = {
      BAIXO: <CheckCircle className="w-4 h-4" />,
      MEDIO: <AlertTriangle className="w-4 h-4" />,
      ALTO: <AlertTriangle className="w-4 h-4" />,
      MUITO_ALTO: <XCircle className="w-4 h-4" />,
    };
    return icons[level];
  };

  return (
    // Container FIXED na lateral da tela, completamente FORA do jogo
    // pointer-events-auto restaura os cliques para este elemento específico
    <div
      ref={overlayRef}
      className="fixed z-[2147483647] font-sans pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <Card className="w-80 bg-slate-900/98 backdrop-blur-md border-cyan-500/40 shadow-2xl shadow-cyan-500/30">
        <CardHeader 
          className="pb-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-lg cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              🎯 Aviator Analyzer
            </CardTitle>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-3 pb-3 space-y-2.5 text-sm">
            {/* Status do Jogo */}
            <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <Badge variant={gameState.isFlying ? "success" : "secondary"} className="text-xs px-2 py-0.5">
                  {gameState.isFlying ? '✈️ VOO' : '⏸️ AGUARDANDO'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mult:</span>
                <span className="text-sm font-bold text-white">
                  {gameState.currentMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Nível de Risco - Card Destacado */}
            <div className={cn(
              "p-2.5 rounded-lg border-2",
              getRiskColor(analysis.riskLevel)
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRiskIcon(analysis.riskLevel)}
                  <span className="font-bold text-sm">{analysis.riskLevel}</span>
                </div>
                <span className="text-xs font-semibold opacity-90">
                  {analysis.confidence}% confiança
                </span>
              </div>
            </div>

            {/* Recomendação */}
            <div className={cn(
              "p-2.5 rounded-lg border-l-4",
              getRiskColor(analysis.riskLevel)
            )}>
              <p className="text-xs text-white/90 leading-relaxed">
                {analysis.recommendation}
              </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center">
                <div className="text-xs text-slate-400 mb-0.5">Volatilidade</div>
                <div className="text-sm font-bold text-white">
                  {analysis.volatility.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center">
                <div className="text-xs text-slate-400 mb-0.5">Média</div>
                <div className="text-sm font-bold text-white">
                  {analysis.average.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Últimas Velas */}
            {analysis.lastCandles.length > 0 && (
              <div className="space-y-1.5 bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">
                  Últimas 8 velas (← mais recente):
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.lastCandles.slice(0, 8).map((candle, index) => (
                    <Badge
                      key={index}
                      variant={candle < 1.5 ? "danger" : candle > 5 ? "success" : "secondary"}
                      className="text-xs px-1.5 py-0.5 font-mono"
                    >
                      {candle.toFixed(2)}x
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Padrões Detectados */}
            {analysis.patterns.length > 0 && (
              <div className="space-y-1.5 bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Padrões detectados:</div>
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
                    <div className="text-xs text-slate-500 text-center pt-0.5">
                      +{analysis.patterns.length - 3} padrões adicionais
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-700/50">
              {isAnalyzing ? '🟢 Análise em tempo real' : '🔴 Pausado'}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
