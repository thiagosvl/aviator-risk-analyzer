/**
 * Analyzer Overlay - Componente principal do overlay que aparece sobre o jogo
 */

import { Badge } from '@src/content/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@src/content/components/ui/card';
import { useGameAnalysis } from '@src/content/hooks/useGameAnalysis';
import { cn } from '@src/content/lib/utils';
import { AlertTriangle, CheckCircle, GripVertical, X, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { RiskLevel } from '@src/content/types';
import type React from 'react';

export const AnalyzerOverlay = () => {
  const { gameState, analysis, startAnalysis, stopAnalysis } = useGameAnalysis();
  const [isVisible, setIsVisible] = useState(true);

  // Estado para draggable
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Iniciar análise automaticamente
  useEffect(() => {
    startAnalysis();
    return () => stopAnalysis();
  }, [startAnalysis, stopAnalysis]);

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

  // Função auxiliar para obter cor do risco
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'text-green-400 border-green-500 bg-green-500/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
      case 'high':
        return 'text-orange-400 border-orange-500 bg-orange-500/10';
      case 'critical':
        return 'text-red-400 border-red-500 bg-red-500/10';
      default:
        return 'text-slate-400 border-slate-500 bg-slate-500/10';
    }
  };

  // Função auxiliar para obter ícone do risco
  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  // Função auxiliar para obter recomendação
  const getRecommendation = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return { text: 'JOGUE', color: 'text-green-400 bg-green-500/20 border-green-500' };
      case 'medium':
        return { text: 'CUIDADO', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500' };
      case 'high':
      case 'critical':
        return { text: 'NÃO JOGUE', color: 'text-red-400 bg-red-500/20 border-red-500' };
      default:
        return { text: 'AGUARDE', color: 'text-slate-400 bg-slate-500/20 border-slate-500' };
    }
  };

  const recommendation = getRecommendation(analysis.riskLevel);
  const lastFiveCandles = gameState.history.slice(0, 5);

  return (
    <div
      ref={overlayRef}
      className="fixed z-[999999] select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        pointerEvents: 'auto',
      }}>
      <div className="flex gap-3">
        {/* CARD 1: RESUMO - Recomendação Direta */}
        <Card className="w-64 border-cyan-500/50 bg-slate-900 shadow-2xl shadow-cyan-500/40 backdrop-blur-md">
          <CardHeader
            className="cursor-grab rounded-t-lg bg-gradient-to-r from-cyan-600 to-blue-600 pb-2 active:cursor-grabbing"
            onMouseDown={handleMouseDown}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-white/70" />
                <CardTitle className="text-sm font-bold text-white">Aviator Analyzer</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsVisible(false)}
                  className="rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  title="Fechar">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-4">
            {/* Status do Jogo */}
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-2">
              <span className="text-xs font-medium text-slate-400">Status:</span>
              <Badge
                variant={gameState.isFlying ? 'default' : 'secondary'}
                className={cn(
                  'text-xs font-bold',
                  gameState.isFlying ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300',
                )}>
                {gameState.isFlying ? '✈️ VOO' : '⏳ AGUARDANDO'}
              </Badge>
            </div>

            {/* Último Crash */}
            {gameState.lastCrash && (
              <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-2">
                <span className="text-xs font-medium text-slate-400">Último Crash:</span>
                <span className="font-mono text-sm font-bold text-cyan-400">{gameState.lastCrash.toFixed(2)}x</span>
              </div>
            )}

            {/* Recomendação PRINCIPAL */}
            <div className="mt-4 rounded-lg border-2 p-4 text-center">
              <div className={cn('rounded-lg border-2 p-3', recommendation.color)}>
                <div className="text-2xl font-black">{recommendation.text}</div>
              </div>
            </div>

            {/* Nível de Risco */}
            <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-2">
              <span className="text-xs font-medium text-slate-400">Risco:</span>
              <div
                className={cn('flex items-center gap-1.5 rounded border px-2 py-1', getRiskColor(analysis.riskLevel))}>
                {getRiskIcon(analysis.riskLevel)}
                <span className="text-xs font-bold uppercase">{analysis.riskLevel}</span>
              </div>
            </div>

            {/* Histórico de Velas Disponíveis */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-2">
              <div className="text-xs font-medium text-slate-400">Histórico: {gameState.history.length} velas</div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: DETALHADO - Estatísticas e Análises */}
        <Card className="w-80 border-cyan-500/50 bg-slate-900 shadow-2xl shadow-cyan-500/40 backdrop-blur-md">
          <CardHeader className="rounded-t-lg border-b border-cyan-500/30 bg-slate-800/50 pb-2">
            <CardTitle className="text-sm font-bold text-cyan-400">📊 Análise Detalhada</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-4">
            {/* Estatísticas Gerais */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Estatísticas:</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="text-[10px] text-slate-500">Média</div>
                  <div className="font-mono text-xs font-bold text-cyan-400">{analysis.avgMultiplier.toFixed(2)}x</div>
                </div>
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="text-[10px] text-slate-500">Menor</div>
                  <div className="font-mono text-xs font-bold text-red-400">{analysis.minMultiplier.toFixed(2)}x</div>
                </div>
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="text-[10px] text-slate-500">Maior</div>
                  <div className="font-mono text-xs font-bold text-green-400">{analysis.maxMultiplier.toFixed(2)}x</div>
                </div>
              </div>
            </div>

            {/* Volatilidade */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Volatilidade:</span>
                <Badge variant={analysis.volatility > 1.5 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                  {analysis.volatility.toFixed(2)}
                </Badge>
              </div>
            </div>

            {/* Últimas 5 Velas */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Últimas 5 Velas:</div>
              <div className="flex flex-wrap gap-1.5">
                {lastFiveCandles.length > 0 ? (
                  lastFiveCandles.map((candle, index) => (
                    <Badge
                      key={index}
                      variant={candle.value < 2 ? 'destructive' : candle.value > 5 ? 'default' : 'secondary'}
                      className="font-mono text-xs">
                      {candle.value.toFixed(2)}x
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Aguardando dados...</span>
                )}
              </div>
            </div>

            {/* Padrões Detectados (placeholder para futuras análises) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Padrões Detectados:</div>
              <div className="space-y-1">
                {analysis.patterns.slice(0, 3).map((pattern, index) => (
                  <div
                    key={index}
                    className="rounded border-l-2 p-1.5 text-xs leading-tight"
                    style={{
                      borderColor:
                        pattern.type === 'high_risk'
                          ? '#ef4444'
                          : pattern.type === 'medium_risk'
                            ? '#f59e0b'
                            : '#3b82f6',
                      backgroundColor:
                        pattern.type === 'high_risk'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : pattern.type === 'medium_risk'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                      color:
                        pattern.type === 'high_risk'
                          ? '#fca5a5'
                          : pattern.type === 'medium_risk'
                            ? '#fcd34d'
                            : '#93c5fd',
                    }}>
                    <div className="font-medium">{pattern.description}</div>
                    <div className="text-[10px] opacity-70">Confiança: {(pattern.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
                {analysis.patterns.length === 0 && (
                  <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center text-xs text-slate-500">
                    Analisando padrões...
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t border-slate-700/50 pt-2 text-center text-xs text-slate-500">
              Atualizado em tempo real
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
