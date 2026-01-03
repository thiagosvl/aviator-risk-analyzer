/**
 * Content Script - Aviator Risk Analyzer
 * 
 * Este script é injetado nas páginas do jogo Aviator e exibe o overlay de análise.
 */

import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
import { createRoot } from 'react-dom/client';
import './index.css';

console.log('[Aviator Analyzer] Content script carregado!');

// Verificar se estamos no iframe ou na página principal
if (window.self !== window.top) {
  console.log('[Aviator Analyzer] Rodando dentro de um iframe. Ignorando.');
  // Não fazer nada se estivermos dentro de um iframe
} else {
  console.log('[Aviator Analyzer] Rodando na página principal. Continuando...');
}

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
  // Não rodar se estivermos dentro de um iframe
  if (window.self !== window.top) {
    console.log('[Aviator Analyzer] Dentro de iframe. Não inicializando.');
    return;
  }

  // Verificar se é realmente a página do Aviator
  const url = window.location.href.toLowerCase();
  const isAviatorPage = 
    url.includes('aviator') || 
    url.includes('spribe');

  if (!isAviatorPage) {
    console.log('[Aviator Analyzer] Não é a página do Aviator. Ignorando.');
    return;
  }

  // Verificar se o iframe do jogo está presente na página
  const hasGameIframe = 
    document.querySelector('iframe[src*="aviator"]') ||
    document.querySelector('iframe[src*="spribe"]') ||
    document.querySelector('iframe[src*="game"]');

  if (hasGameIframe) {
    console.log('[Aviator Analyzer] Iframe do jogo detectado! Inicializando overlay...');
    init();
  } else {
    // Tentar novamente em alguns segundos (carregamento dinâmico)
    console.log('[Aviator Analyzer] Aguardando carregamento do jogo...');
    setTimeout(() => {
      const hasGameIframeRetry = 
        document.querySelector('iframe[src*="aviator"]') ||
        document.querySelector('iframe[src*="spribe"]') ||
        document.querySelector('iframe[src*="game"]');
        
      if (hasGameIframeRetry) {
        console.log('[Aviator Analyzer] Iframe detectado após espera! Inicializando...');
        init();
      } else {
        console.log('[Aviator Analyzer] Iframe do jogo não encontrado após espera.');
      }
    }, 3000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}
