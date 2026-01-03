/**
 * Content Script - Aviator Risk Analyzer
 * 
 * Este script é injetado nas páginas do jogo Aviator e exibe o overlay de análise.
 */

import { createRoot } from 'react-dom/client';
import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
