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
    Maximize2
} from 'lucide-react';

import { useBankrollLogic } from '@src/content/hooks/useBankroll';

export const AnalyzerOverlay = () => {
  // Conexão com o Bridge via Hook
  const { gameState, analysis } = useOverseer();
  
  const [bet2x, setBet2x] = useState(100.00);
  const [bet10x, setBet10x] = useState(50.00);

  // Bankroll Management
  const { balance, setBalance, history, stats } = useBankrollLogic(gameState, analysis, { bet2x, bet10x });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('1000.00');

  // Draggable State - DEFAULT POSITION LEFT
  const [position, setPosition] = useState({ x: 20, y: 100 }); 
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
  
  const getRecommendationStyle = (rec: any) => {
    switch (rec.action) {
      case 'PLAY_2X': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
      case 'PLAY_10X': return 'bg-pink-500/20 text-pink-400 border-pink-500'; // Rosa
      case 'STOP': 
      case 'STOP_LOSS': return 'bg-red-600 text-white border-red-700 animate-pulse';
      case 'WAIT': return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getRiskBadge = (rec: any) => {
     const colors: Record<string, string> = {
       LOW: 'bg-emerald-500 text-emerald-950',
       MEDIUM: 'bg-amber-500 text-amber-950',
       HIGH: 'bg-orange-500 text-white',
       CRITICAL: 'bg-red-500 text-white'
     };
     const translations: Record<string, string> = {
       LOW: 'BAIXO',
       MEDIUM: 'MÉDIO',
       HIGH: 'ALTO',
       CRITICAL: 'CRÍTICO'
     };
     return (
       <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ml-2 select-none", colors[rec.riskLevel])}>
         {translations[rec.riskLevel] || rec.riskLevel}
       </span>
     );
  };
  
  const formatAction = (action: string) => {
       if (action === 'PLAY_2X') return '✅ JOGUE 2.00x';
       if (action === 'PLAY_10X') return '🌸 JOGUE 10x';
       if (action === 'STOP' || action === 'STOP_LOSS') return '🛑 STOP';
       if (action === 'WAIT') return '⏳ AGUARDE';
       return action;
  };
  
  // Helpers para Padrão Rosa (Tradução)
  const getPinkPatternName = (type: string) => {
       switch(type) {
           case 'DIAMOND': return 'Alta Freq.';
           case 'GOLD': return 'Média Freq.';
           case 'SILVER': return 'Baixa Freq.';
           default: return type;
       }
   };

  // MODO MINIMIZADO
  if (isMinimized) {
    // Safety check
    const rec2x = analysis.recommendation2x || { action: 'WAIT' };
    const recPink = analysis.recommendationPink || { action: 'WAIT' };

    const active2x = rec2x.action?.includes('PLAY');
    const activePink = recPink.action?.includes('PLAY');
    
    return (
       <div 
        ref={overlayRef}
        style={{ left: position.x, top: position.y }}
        className="fixed z-[999999] bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-64 p-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
       >
         <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col text-[10px] leading-tight">
                <span className={cn(active2x ? "text-emerald-400 font-bold" : "text-slate-500")}>
                    2x: {formatAction(rec2x.action)}
                </span>
                <span className={cn(activePink ? "text-pink-400 font-bold" : "text-slate-500")}>
                    Rosa: {formatAction(recPink.action)}
                </span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsMinimized(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Maximize2 size={12}/></button>
              <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X size={12}/></button>
            </div>
         </div>
       </div>
    );
  }

  // MODO NORMAL
  const rec2x = analysis.recommendation2x || { action: 'WAIT', reason: 'Carregando...', riskLevel: 'LOW' };
  const recPink = analysis.recommendationPink || { action: 'WAIT', reason: 'Carregando...', riskLevel: 'LOW' };

  // Helper colors
  const getCardStyle = (rec: any, type: '2x' | 'pink') => {
      const isPlay = rec.action?.includes('PLAY');
      const isStop = rec.action?.includes('STOP');
      
      if (isStop) return 'bg-red-900/40 border-red-500/50 text-red-200 animate-pulse';
      
      if (type === '2x') {
          return isPlay 
            ? 'bg-[#4c1d95]/90 border-[#8b5cf6] text-white shadow-[#8b5cf6]/50 shadow-lg' // Roxo Vivo
            : 'bg-[#4c1d95]/30 border-[#8b5cf6]/30 text-slate-400'; // Roxo Apagado
      } else {
          return isPlay 
            ? 'bg-[#be185d]/90 border-[#f43f5e] text-white shadow-[#f43f5e]/50 shadow-lg' // Rosa Vivo
            : 'bg-[#be185d]/30 border-[#f43f5e]/30 text-slate-400'; // Rosa Apagado
      }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed z-[999999] select-none flex flex-col gap-2 font-sans"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? '400px' : '350px',
        pointerEvents: 'auto'
      }}>
      <DragShield />
      
      {/* HEADER & CONTROLS */}
      <div 
        className="flex items-center justify-between bg-slate-950/90 backdrop-blur border border-slate-800 rounded-t-lg p-2 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
         <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-slate-500"/>
            <span className="text-xs font-bold text-slate-200">Aviator Analyzer</span>
         </div>
         <div className="text-[10px] text-slate-500 font-mono">
            v0.5.1
         </div>
      </div>

      <div className="bg-slate-950/95 backdrop-blur border-x border-b border-slate-800 rounded-b-lg p-3 shadow-2xl space-y-3">
        
        {/* 1. STATUS BAR (Lucro & Carteira) */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
           {/* Lucro da Sessão */}
           <div className={cn("rounded border p-1 font-bold", stats.totalProfit >= 0 ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" : "bg-red-950/40 text-red-400 border-red-500/20")}>
             LUCRO: R$ {stats.totalProfit.toFixed(2)}
           </div>
           
           {/* CARTEIRA EDITÁVEL */}
           <div 
             className="rounded border border-slate-700 bg-slate-900 p-1 text-slate-300 cursor-pointer hover:bg-slate-800 transition-colors"
             onClick={() => { setIsEditingBalance(true); setBalanceInput(balance.toFixed(2)); }}
            >
             {isEditingBalance ? (
                <input 
                  autoFocus
                  type="number"
                  className="w-full h-full bg-transparent text-center text-xs outline-none text-emerald-400"
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
                    BANCA: R$ {balance.toFixed(2)}
                </span>
             )}
           </div>
        </div>

        {/* 2. RECOMENDAÇÃO DUPLA (ROXA ACIMA, ROSA ABAIXO) */}
        
        {/* CARD ROXA (2.00x) */}
        <div className={cn("rounded-lg border-2 p-3 text-center transition-all duration-300 relative overflow-hidden", getCardStyle(rec2x, '2x'))}>
            <div className="absolute top-0 right-0 bg-black/40 px-2 rounded-bl text-[8px] font-bold uppercase text-white/70">
                Estratégia Defesa (2x)
            </div>
           <div className="text-xl font-black tracking-tight mt-1">
             {formatAction(rec2x.action).replace('STOP', 'PARE').replace('WAIT', 'AGUARDE')}
           </div>
           <div className="mt-1 text-xs font-medium uppercase opacity-90 border-t border-white/10 pt-1 flex justify-between items-center">
             <span>{rec2x.reason || '...'}</span>
             {getRiskBadge(rec2x)}
           </div>
        </div>

        {/* CARD ROSA (10.00x) */}
        <div className={cn("rounded-lg border-2 p-3 text-center transition-all duration-300 relative overflow-hidden", getCardStyle(recPink, 'pink'))}>
            <div className="absolute top-0 right-0 bg-black/40 px-2 rounded-bl text-[8px] font-bold uppercase text-white/70">
                Estratégia Ataque (10x)
            </div>
           <div className="text-xl font-black tracking-tight mt-1">
             {formatAction(recPink.action).replace('STOP', 'PARE').replace('WAIT', 'AGUARDE')}
           </div>
           <div className="mt-1 text-xs font-medium uppercase opacity-90 border-t border-white/10 pt-1 flex justify-between items-center">
             <span>{recPink.reason || '...'}</span>
             {getRiskBadge(recPink)}
           </div>
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
        <div className="bg-slate-950/95 backdrop-blur border border-slate-800 rounded-lg p-3 shadow-2xl text-xs space-y-3 animate-in slide-in-from-top-2">
             <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between">
              <span>📊 Detalhes da Sessão</span>
              <span className="flex gap-2">
                 <span className={stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}>
                     {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
                 </span>
              </span>
            </div>
           
           <div>
             <div className="text-slate-500 mb-1">Últimas 10 Velas:</div>
             <div className="flex flex-wrap gap-1">
               {gameState.history.slice(0, 10).map((val, i) => (
                 <span key={i} className={cn("px-1 rounded font-mono font-bold select-none", val.value >= 10 ? "bg-pink-900/40 text-pink-400 border border-pink-500/30" : val.value >= 2 ? "bg-purple-900/40 text-purple-400 border border-purple-500/30" : "bg-slate-900 text-blue-400 border border-slate-700")}>
                   {val.value.toFixed(2)}x
                 </span>
               ))}
             </div>
           </div>

           <div className="mb-2 p-2 bg-slate-900 rounded border border-slate-800">
             <div className="text-[10px] text-slate-500 mb-1 flex justify-between items-center">
                <span>Configuração de Aposta (Simulador)</span>
                <span className="text-[9px] opacity-70">Valores em R$</span>
             </div>
             <div className="flex gap-2">
                <div className="flex-1">
                   <label className="text-[9px] text-purple-400 block">Alvo 2.00x</label>
                   <input 
                      type="number" 
                      className="w-full bg-black/50 border border-slate-700 rounded px-1 text-xs text-slate-200 focus:border-purple-500 outline-none"
                      value={bet2x}
                      onChange={(e) => setBet2x(Number(e.target.value))}
                   />
                </div>
                <div className="flex-1">
                   <label className="text-[9px] text-pink-400 block">Alvo 10.00x</label>
                   <input 
                      type="number" 
                      className="w-full bg-black/50 border border-slate-700 rounded px-1 text-xs text-slate-200 focus:border-pink-500 outline-none"
                      value={bet10x}
                      onChange={(e) => setBet10x(Number(e.target.value))}
                   />
                </div>
             </div>
           </div>

           {/* Informações Técnicas Minimizadas */}
           <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                 <span>Densidade 10x:</span>
                 <span className={analysis.volatilityDensity === 'HIGH' ? "text-emerald-400" : "text-slate-400"}>{analysis.volatilityDensity}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                 <span>Conversão 2x:</span>
                 <span className={analysis.conversionRate > 50 ? "text-emerald-400" : "text-slate-400"}>{analysis.conversionRate}%</span>
              </div>
           </div>

           {/* --- STATISTICS GRID (Replacing old History) --- */}
           <div className="grid grid-cols-2 gap-2 text-xs mt-2 border-t border-slate-700/50 pt-2">
               {/* ROXO (2x) STATS */}
               <div className="bg-[#4c1d95]/20 border border-[#8b5cf6]/30 rounded p-2 flex flex-col items-center">
                   <span className="text-[#a78bfa] font-bold mb-1">Estratégia 2.00x</span>
                   <div className="grid grid-cols-2 w-full gap-y-1 text-[10px] text-gray-300">
                       <span>Tentativas:</span> <span className="text-right text-white">{stats.stats2x.attempts}</span>
                       <span>Acertos:</span> <span className="text-right text-green-400">{stats.stats2x.wins} ({stats.stats2x.winRate}%)</span>
                       <span>Lucro:</span> 
                       <span className={`text-right font-bold ${stats.stats2x.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                           R$ {stats.stats2x.profit.toFixed(2)}
                       </span>
                   </div>
               </div>

               {/* ROSA (10x) STATS */}
               <div className="bg-[#be185d]/20 border border-[#f43f5e]/30 rounded p-2 flex flex-col items-center">
                   <span className="text-[#fb7185] font-bold mb-1">Estratégia 10.00x</span>
                   <div className="grid grid-cols-2 w-full gap-y-1 text-[10px] text-gray-300">
                       <span>Tentativas:</span> <span className="text-right text-white">{stats.statsPink.attempts}</span>
                       <span>Acertos:</span> <span className="text-right text-green-400">{stats.statsPink.wins} ({stats.statsPink.winRate}%)</span>
                       <span>Lucro:</span> 
                       <span className={`text-right font-bold ${stats.statsPink.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                           R$ {stats.statsPink.profit.toFixed(2)}
                       </span>
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* DRAGGABLE HISTORY COMPONENT INSTANCE (Using Bankroll History) */}
      <DraggableHistory history={history} />
    </div>
  );
};

// --- DRAGGABLE HISTORY COMPONENT ---
const DraggableHistory = ({ history }: { history: any[] }) => {
    // Initial position: RIGHT SIDE
    const [position, setPosition] = useState({ x: window.innerWidth - 260, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // SHOW ALWAYS (Even if empty, show container)
    // if (!history || history.length === 0) return null;

    return (
        <div 
            style={{ 
                left: position.x, 
                top: position.y,
                width: '240px',
                zIndex: 10001
            }}
            className="fixed bg-slate-950/95 border border-slate-700/50 rounded-lg shadow-2xl flex flex-col font-mono backdrop-blur-md overflow-hidden"
        >
            {/* Header (Drag Handle) */}
            <div 
                onMouseDown={handleMouseDown}
                className="h-7 bg-slate-900/80 flex items-center justify-between px-2 cursor-move select-none border-b border-slate-800 group"
            >
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors">
                        Histórico (Simulação)
                    </span>
                </div>
            </div>

            {/* List Content */}
            <div className="overflow-y-auto custom-scrollbar bg-black/20" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '150px' }}>
                <table className="w-full text-[10px] border-collapse table-fixed">
                    <thead className="bg-slate-900/80 text-slate-500 sticky top-0 backdrop-blur-sm z-10 text-[9px]">
                        <tr>
                            <th className="py-1 px-2 text-left w-1/4">HORA</th>
                            <th className="py-1 px-1 text-center w-1/4">TIPO</th>
                            <th className="py-1 px-1 text-center w-1/4">CRASH</th>
                            <th className="py-1 px-2 text-right w-1/4">LUCRO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.slice(0, 50).map((h, i) => (
                             <tr key={h.roundId || i} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors group">
                                 <td className="py-1 px-2 text-slate-500 font-mono tracking-tighter opacity-70 group-hover:opacity-100">
                                     {h.timestamp}
                                 </td>
                                 <td className="py-0.5 px-1 text-center font-bold text-[9px]">
                                     {h.action === 'PLAY_10X' 
                                        ? <span className="text-pink-400">10x</span> 
                                        : <span className="text-purple-400">2x</span>
                                     }
                                 </td>
                                 <td className={`py-0.5 px-1 text-center font-bold ${
                                     h.crashPoint >= 10.0 ? 'text-[#fb7185] drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]' : 
                                     h.crashPoint >= 2.0 ? 'text-[#a78bfa]' : 'text-blue-400'
                                 }`}>
                                     {h.crashPoint.toFixed(2)}x
                                 </td>
                                 <td className={`py-0.5 px-2 text-right font-bold ${h.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {h.profit > 0 ? '+' : ''}{h.profit.toFixed(2)}
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
};

