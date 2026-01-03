/**
 * Content Script - Aviator Risk Analyzer
 * 
 * Este script é injetado nas páginas do jogo Aviator e exibe o overlay de análise.
 */

import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
import { createRoot } from 'react-dom/client';
import './index.css';

console.log('[Aviator Analyzer] Content script carregado!');

function init() {
  try {
    // Criar container para o overlay
    const appContainer = document.createElement('div');
    appContainer.id = 'aviator-analyzer-root';
    appContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999;';
    
    document.body.appendChild(appContainer);
    
    // Renderizar o overlay
    const root = createRoot(appContainer);
    root.render(<AnalyzerOverlay />);
    
    console.log('[Aviator Analyzer] Overlay renderizado com sucesso!');
  } catch (error) {
    console.error('[Aviator Analyzer] Erro ao inicializar:', error);
  }
}

// Aguardar o DOM estar pronto
const checkAndInit = () => {
  // Verificar se o jogo está presente neste frame
  // Procurar por elementos conhecidos do Aviator (Spribe)
  const isGameFrame = 
    document.querySelector('app-stats-dropdown') ||
    document.querySelector('app-canvas') ||
    document.querySelector('canvas') ||
    document.querySelector('.payouts-block') ||
    window.location.href.includes('spribe');

  if (isGameFrame) {
    console.log('[Aviator Analyzer] Jogo detectado neste frame! Inicializando overlay...');
    init();
  } else {
    // Tentar novamente em alguns segundos (carregamento dinâmico)
    setTimeout(() => {
      const isGameFrameRetry = 
        document.querySelector('app-stats-dropdown') ||
        document.querySelector('app-canvas') ||
        document.querySelector('canvas');
        
      if (isGameFrameRetry) {
        console.log('[Aviator Analyzer] Jogo detectado após espera! Inicializando...');
        init();
      }
    }, 2000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}
