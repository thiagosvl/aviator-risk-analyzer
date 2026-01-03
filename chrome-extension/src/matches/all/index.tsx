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
    // Verificar se já existe
    if (document.getElementById('aviator-analyzer-root')) {
      console.log('[Aviator Analyzer] Overlay já existe neste frame.');
      return;
    }

    // Criar container para o overlay
    const appContainer = document.createElement('div');
    appContainer.id = 'aviator-analyzer-root';
    // Importante: pointer-events: none no container para que cliques passem através dele (nas áreas vazias)
    appContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';
    
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
  // Verificar se é realmente a página do Aviator
  const url = window.location.href.toLowerCase();
  const isAviatorPage = 
    url.includes('aviator') || 
    url.includes('spribe');

  if (!isAviatorPage) {
    console.log('[Aviator Analyzer] Não é a página do Aviator. Ignorando.');
    return;
  }

  // Verificar se o jogo está presente neste frame
  // Procurar por elementos conhecidos do Aviator (Spribe)
  const isGameFrame = 
    document.querySelector('app-stats-dropdown') ||
    document.querySelector('app-canvas') ||
    document.querySelector('canvas') ||
    document.querySelector('.payouts-block') ||
    document.querySelector('[class*="payout"]');

  if (isGameFrame) {
    console.log('[Aviator Analyzer] Jogo Aviator detectado! Inicializando overlay...');
    init();
  } else {
    // Tentar novamente em alguns segundos (carregamento dinâmico)
    console.log('[Aviator Analyzer] Aguardando carregamento do jogo...');
    setTimeout(() => {
      const isGameFrameRetry = 
        document.querySelector('app-stats-dropdown') ||
        document.querySelector('app-canvas') ||
        document.querySelector('canvas') ||
        document.querySelector('.payouts-block');
        
      if (isGameFrameRetry) {
        console.log('[Aviator Analyzer] Jogo detectado após espera! Inicializando...');
        init();
      } else {
        console.log('[Aviator Analyzer] Jogo não encontrado após espera.');
      }
    }, 3000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}
