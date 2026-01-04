/**
 * Analyzer Overlay - Componente principal do overlay que aparece sobre o jogo
 */

import { cn } from '@src/content/lib/utils';
import { GripVertical, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';


/**
 * Analyzer Overlay - Componente principal (Final Layout)
 * Roda na janela pai e recebe dados via Bridge.
 */

import { useOverseer } from '@src/content/hooks/useOverseer'; // Novo Hook
import {
    ChevronDown,
    ChevronUp,
    Maximize2,
    Minimize2
} from 'lucide-react';

import { useBankrollLogic } from '@src/content/hooks/useBankroll';

export const AnalyzerOverlay = () => {
  // Conexão com o Bridge via Hook
  const { gameState, analysis } = useOverseer();
  
  // Bankroll Management
  const { balance, setBalance, history, stats } = useBankrollLogic(gameState, analysis);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('100.00');

  // Draggable State
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 20 }); // Canto superior direito
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Drag Logic
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
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // DRAG SHIELD: Cobre a tela inteira quando arrastando para evitar que o Iframe roube o evento
  const DragShield = () => (
    isDragging ? (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2147483647, // Max Z-Index
          cursor: 'grabbing'
        }}
      />
    ) : null
  );

  if (!isVisible) return null;

  // Helpers de UI baseados na Proposta
  const rec = analysis.recommendation;
  const isCritical = rec.riskLevel === 'CRITICAL' || rec.action === 'STOP' || rec.action === 'STOP_LOSS';
  
  const getRecommendationStyle = () => {
    switch (rec.action) {
      case 'PLAY_2X': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
      case 'PLAY_10X': return 'bg-pink-500/20 text-pink-400 border-pink-500'; // Rosa
      case 'STOP': 
      case 'STOP_LOSS': return 'bg-red-600 text-white border-red-700 animate-pulse';
      case 'WAIT': return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getRiskBadge = () => {
     const colors = {
       LOW: 'bg-emerald-500 text-emerald-950',
       MEDIUM: 'bg-amber-500 text-amber-950',
       HIGH: 'bg-orange-500 text-white',
       CRITICAL: 'bg-red-500 text-white'
     };
     return (
       <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ml-2", colors[rec.riskLevel])}>
         {rec.riskLevel}
       </span>
     );
  };

  // MODO MINIMIZADO
  if (isMinimized) {
    return (
       <div 
        ref={overlayRef}
        style={{ left: position.x, top: position.y }}
        className="fixed z-[999999] bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-64 p-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
       >
         <div className="flex items-center justify-between">
            <span className={cn("font-bold text-sm", rec.action.includes('PLAY') ? 'text-emerald-400' : 'text-red-400')}>
              {rec.action.replace('_', ' ')}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setIsMinimized(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Maximize2 size={12}/></button>
              <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X size={12}/></button>
            </div>
         </div>
       </div>
    );
  }

  // MODO NORMAL
  return (
    <div
      ref={overlayRef}
      className="fixed z-[999999] select-none flex flex-col gap-2 font-sans"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? '400px' : '350px',
        pointerEvents: 'auto' // Restoration of interactivity
      }}>
      <DragShield />
      
      {/* HEADER & CONTROLS */}
      <div 
        className="flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-700 rounded-t-lg p-2 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
         <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-slate-500"/>
            <span className="text-xs font-bold text-slate-200">Aviator Analyzer</span>
         </div>
         <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Minimizar"><Minimize2 size={14}/></button>
            <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400" title="Fechar"><X size={14}/></button>
         </div>
      </div>

      <div className="bg-slate-900/95 backdrop-blur border-x border-b border-slate-700 rounded-b-lg p-3 shadow-2xl space-y-3">
        
        {/* 1. STATUS BAR */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
           <div className={cn("rounded border p-1 font-bold", gameState.isFlying ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
             {gameState.isFlying ? '🔴 VOO' : '🟢 AGUARDO'}
           </div>
           <div className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-300">
             {typeof gameState.lastCrash === 'number' ? gameState.lastCrash.toFixed(2) : '0.00'}x
           </div>
           
           {/* CARTEIRA EDITÁVEL */}
           <div 
             className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
             onClick={() => { setIsEditingBalance(true); setBalanceInput(balance.toFixed(2)); }}
            >
             {isEditingBalance ? (
                <input 
                  autoFocus
                  type="number"
                  className="w-full h-full bg-slate-900 text-center text-xs outline-none text-emerald-400"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  onBlur={() => {
                      const val = parseFloat(balanceInput);
                      if (!isNaN(val)) setBalance(val);
                      setIsEditingBalance(false);
                  }}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          const val = parseFloat(balanceInput);
                          if (!isNaN(val)) setBalance(val);
                          setIsEditingBalance(false);
                      }
                  }}
                />
             ) : (
                <span className={cn("font-bold", balance > 0 ? "text-emerald-400" : "text-red-400")}>
                    R$ {balance.toFixed(2)}
                </span>
             )}
           </div>
        </div>

        {/* 2. RECOMENDAÇÃO (DESTAQUE) */}
        <div className={cn("rounded-lg border-2 p-4 text-center transition-all duration-300", getRecommendationStyle())}>
           <div className="text-2xl font-black tracking-tight">
             {rec.action === 'PLAY_2X' ? '✅ JOGUE 2.00x' : 
              rec.action === 'PLAY_10X' ? '🌸 JOGUE 10x' :
              rec.action === 'STOP' ? '🛑 STOP IMEDIATO' :
              rec.action === 'WAIT' ? '⏳ AGUARDE' : rec.action}
           </div>
           <div className="mt-2 text-xs font-medium uppercase opacity-90 border-t border-current/20 pt-2">
             {rec.reason || 'Analisando mercado...'}
           </div>
           
           <div className="mt-2 flex justify-center items-center">
             <span className="text-[10px] uppercase opacity-70">Risco:</span>
             {getRiskBadge()}
           </div>
        </div>

        {/* 3. ANÁLISE RÁPIDA */}
        <div className="rounded border border-slate-700/50 bg-slate-800/30 p-2 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
               <span>Densidade:</span>
               <span className={cn("font-bold", analysis.volatilityDensity === 'HIGH' ? "text-emerald-400" : "text-slate-200")}>
                 {analysis.volatilityDensity === 'HIGH' ? 'ALTA (Bom)' : analysis.volatilityDensity === 'MEDIUM' ? 'MÉDIA' : 'BAIXA'}
               </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
               <span>Conversão (Seq. Roxa):</span>
               <span className={cn("font-bold", analysis.conversionRate > 50 ? "text-emerald-400" : "text-amber-400")}>
                 {analysis.conversionRate}%
               </span>
            </div>
            
            {/* PRÓXIMO PADRÃO ROSA */}
            {analysis.pinkPattern && (
              <div className="mt-2 rounded bg-pink-500/10 border border-pink-500/30 p-2">
                 <div className="font-bold text-pink-400 flex justify-between">
                    <span>🌸 Padrão {analysis.pinkPattern.type}</span>
                    <span>{analysis.pinkPattern.confidence}% Conf.</span>
                 </div>
                 <div className="text-slate-300 mt-1 flex justify-between">
                    <span>Intervalo: {analysis.pinkPattern.interval} (±1)</span>
                    <span className={cn("font-bold", analysis.pinkPattern.candlesUntilMatch <= 1 ? "text-red-400 animate-pulse" : "text-slate-400")}>
                      Faltam: {analysis.pinkPattern.candlesUntilMatch}
                    </span>
                 </div>
              </div>
            )}
        </div>

        {/* BOTÃO EXPANDIR */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded flex items-center justify-center gap-1 transition-colors"
        >
          {isExpanded ? <><ChevronUp size={12}/> Ocultar Detalhes</> : <><ChevronDown size={12}/> Expandir Análise Detalhada</>}
        </button>

      </div>

      {/* 4. CARD SECUNDÁRIO (EXPANDIDO) */}
      {isExpanded && (
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-2xl text-xs space-y-3 animate-in slide-in-from-top-2">
           <div className="font-bold text-cyan-400 border-b border-slate-700 pb-1 flex justify-between">
             <span>📊 Detalhes da Sessão</span>
             <span className="flex gap-2">
                <span className="text-emerald-400">{stats.greens}G</span>
                <span className="text-red-400">{stats.reds}R</span>
                <span className={stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
                </span>
             </span>
           </div>
           
           <div>
             <div className="text-slate-500 mb-1">Últimas 10 Velas:</div>
             <div className="flex flex-wrap gap-1">
               {gameState.history.slice(0, 10).map((val, i) => (
                 <span key={i} className={cn("px-1 rounded font-mono", val.value >= 10 ? "bg-pink-500/20 text-pink-400" : val.value >= 2 ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-700 text-slate-400")}>
                   {val.value.toFixed(2)}x
                 </span>
               ))}
             </div>
           </div>

           <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 p-2 rounded">
                 <div className="text-slate-500">Streak Atual</div>
                 <div className={cn("font-mono font-bold text-lg", analysis.purpleStreak > 0 ? "text-emerald-400" : "text-red-400")}>
                   {analysis.purpleStreak > 0 ? `+${analysis.purpleStreak}` : analysis.purpleStreak}
                 </div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                 <div className="text-slate-500">Desde Rosa</div>
                 <div className="font-mono font-bold text-lg text-pink-400">
                   {analysis.candlesSinceLastPink}
                 </div>
              </div>
           </div>

           {/* Histórico de Apostas */}
           {history.length > 0 && (
               <div className="mt-2">
                   <div className="text-slate-500 mb-1 border-t border-slate-700 pt-2">Histórico de Jogadas:</div>
                   <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                       {history.map((bet, i) => (
                           <div key={i} className="flex justify-between items-center bg-slate-800/50 p-1 rounded text-[10px]">
                               <span className="text-slate-400">{bet.timestamp}</span>
                               <span className={bet.action.includes('10X') ? "text-pink-400" : "text-emerald-400"}>{bet.action.replace('PLAY_', '')}</span>
                               <span className="text-slate-300">{bet.crashPoint.toFixed(2)}x</span>
                               <span className={cn("font-bold", bet.profit > 0 ? "text-emerald-400" : "text-red-400")}>
                                   {bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}
                               </span>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </div>
      )}
    </div>
  );
};
