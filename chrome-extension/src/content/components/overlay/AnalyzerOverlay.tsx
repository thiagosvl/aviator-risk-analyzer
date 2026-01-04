/**
 * Analyzer Overlay - Componente principal do overlay que aparece sobre o jogo
 */

import { Badge } from '@src/content/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@src/content/components/ui/card';
import { cn } from '@src/content/lib/utils';
import type { RiskLevel } from '@src/content/types';
import { AlertTriangle, CheckCircle, Clock, GripVertical, TrendingUp, X, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { UseGameAnalysisReturn } from '@src/content/hooks/useGameAnalysis';

interface AnalyzerOverlayProps {
  controller: UseGameAnalysisReturn;
}

export const AnalyzerOverlay = ({ controller }: AnalyzerOverlayProps) => {
  const { gameState, analysis, startAnalysis, stopAnalysis } = controller;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return { text: 'JOGUE', sub: 'Mercado Pagador', color: 'text-green-400 bg-green-500/20 border-green-500' };
      case 'medium':
        return { text: 'CUIDADO', sub: 'Proteja no 2x', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500' };
      case 'high':
        return { text: 'AGUARDE', sub: 'Alto Risco', color: 'text-orange-400 bg-orange-500/20 border-orange-500' };
      case 'critical':
        return { text: 'BLOQUEADO', sub: '3+ Quebras Pós-Rosa', color: 'text-red-400 bg-red-500/20 border-red-500' };
      default:
        return { text: 'AGUARDE', sub: 'Analisando...', color: 'text-slate-400 bg-slate-500/20 border-slate-500' };
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
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {typeof gameState.lastCrash === 'number' ? gameState.lastCrash.toFixed(2) : '0.00'}x
                </span>
              </div>
            )}

            {/* Recomendação PRINCIPAL */}
            <div className="mt-4 rounded-lg border-2 p-4 text-center">
              <div className={cn('rounded-lg border-2 p-3 flex flex-col items-center justify-center', recommendation.color)}>
                <div className="text-2xl font-black">{recommendation.text}</div>
                <div className="text-[10px] font-bold uppercase opacity-80 mt-1">{recommendation.sub}</div>
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
            <CardTitle className="text-sm font-bold text-cyan-400">📊 Análise Smart</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-4">
            {/* Estatísticas Gerais (Nova Grid 2x2) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Indicadores Chave:</div>
              <div className="grid grid-cols-2 gap-2">
                {/* Streak */}
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3"/> Streak
                  </div>
                  <div className={cn(
                    "font-mono text-lg font-bold", 
                    analysis.streak > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {analysis.streak > 0 ? `+${analysis.streak}` : analysis.streak}
                  </div>
                </div>

                {/* Pink Distance */}
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3"/> Dist. Rosa
                  </div>
                  <div className="font-mono text-lg font-bold text-pink-400">
                    {analysis.pinkDistance}
                  </div>
                </div>

                {/* Win Rate */}
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3"/> Win Rate
                  </div>
                  <div className={cn(
                    "font-mono text-lg font-bold",
                    analysis.winRate >= 50 ? "text-green-400" : analysis.winRate >= 30 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {Math.round(analysis.winRate)}%
                  </div>
                </div>

                {/* Median Post Pink (Substituindo Média por Mediana conforme pedido) */}
                <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center bg-purple-500/10 border-purple-500/30">
                  <div className="text-[10px] text-purple-300 mb-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3"/> Vela Segura
                  </div>
                  <div className="font-mono text-lg font-bold text-purple-400">
                    {analysis.medianPostPink?.toFixed(2) || '0.00'}x
                  </div>
                </div>
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
                      variant={candle.value < 2 ? 'destructive' : candle.value >= 10 ? 'default' : 'secondary'}
                      className={cn("font-mono text-xs", candle.value >= 10 && "bg-pink-500 hover:bg-pink-600 border-pink-400 text-white")}>
                      {candle.value.toFixed(2)}x
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Aguardando dados...</span>
                )}
              </div>
            </div>

            {/* Padrões Detectados (Detalhes) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Padrões Ativos:</div>
              <div className="space-y-1">
                {analysis.patterns.slice(0, 3).map((pattern, index) => (
                  <div
                    key={index}
                    className="rounded border-l-2 p-1.5 text-xs leading-tight shadow-sm"
                    style={{
                      borderColor:
                        pattern.type === 'PINK_LOCK' ? '#ef4444' :
                        pattern.type === 'PINK_PREDICTION' ? '#ec4899' :
                        pattern.severity === 'danger'
                          ? '#ef4444'
                          : pattern.severity === 'warning'
                            ? '#f59e0b'
                            : '#3b82f6',
                      backgroundColor:
                        pattern.type === 'PINK_LOCK' ? 'rgba(239, 68, 68, 0.2)' :
                        pattern.severity === 'danger'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : pattern.severity === 'warning'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                      color:
                        pattern.type === 'PINK_LOCK' ? '#fca5a5' :
                        pattern.type === 'PINK_PREDICTION' ? '#fbcfe8' :
                        pattern.severity === 'danger'
                          ? '#fca5a5'
                          : pattern.severity === 'warning'
                            ? '#fcd34d'
                            : '#93c5fd',
                    }}>
                    <div className="font-bold mb-0.5">{pattern.description.split(':')[0]}</div>
                    <div className="text-[10px] opacity-90">{pattern.description.split(':')[1] || pattern.description}</div>
                  </div>
                ))}
                {analysis.patterns.length === 0 && (
                  <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-center text-xs text-slate-500">
                    Nenhum padrão crítico detectado.
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t border-slate-700/50 pt-2 text-center text-xs text-slate-500">
              Análise baseada no histórico Pós-Rosa
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
