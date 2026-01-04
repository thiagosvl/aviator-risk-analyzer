/**
 * Content Script - Aviator Risk Analyzer
 *
 * Este script é injetado nas páginas do jogo Aviator e exibe o overlay de análise.
 */

import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
import { createRoot } from 'react-dom/client';
// @ts-ignore
import cssContent from './index.css?inline';

console.log('[Aviator Analyzer] Content script carregado!');

// Elemento raiz
const ROOT_ID = 'aviator-analyzer-root';

import { ContentSpy } from '@src/content/components/spy/ContentSpy';

// Componente Wrapper para decidir qual modo usar
const App = () => {
  const isIframe = window.self !== window.top;

  if (isIframe) {
    return <ContentSpy />;
  }

  return <ParentOverlay />;
};

const ParentOverlay = () => {
  // O Overlay agora gerencia seu próprio estado via useOverseer (conectado ao Bridge)
  return <AnalyzerOverlay />;
};

const init = () => {
  try {
    // Verificar se já existe
    if (document.getElementById(ROOT_ID)) {
      console.log('[Aviator Analyzer] Overlay já existe neste frame.');
      return;
    }

    console.log('[Aviator Analyzer] Inicializando Shadow DOM...');

    // Criar container para o overlay (host do Shadow DOM)
    const appContainer = document.createElement('div');
    appContainer.id = ROOT_ID;
    
    // Estilo do host (invisível e não bloqueante)
    appContainer.style.cssText = 
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';

    document.body.appendChild(appContainer);

    // Criar Shadow Root (Modo 'open' para debug)
    const shadowRoot = appContainer.attachShadow({ mode: 'open' });

    // Injetar estilos diretamente no Shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    shadowRoot.appendChild(styleElement);

    // Adicionar estilos extras para Tailwind/Preflight se necessário
    const baseStyle = document.createElement('style');
    baseStyle.textContent = `
      :host {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.5;
      }
    `;
    shadowRoot.appendChild(baseStyle);

    // Criar ponto de montagem do React dentro do Shadow DOM
    const mountPoint = document.createElement('div');
    mountPoint.id = 'root';
    // Importante: pointer-events: none para passar cliques, mas auto nos filhos
    mountPoint.style.cssText = 'width: 100%; height: 100%; pointer-events: none;';
    shadowRoot.appendChild(mountPoint);

    // Renderizar o App
    const root = createRoot(mountPoint);
    root.render(<App />);

    console.log('[Aviator Analyzer] App renderizado com sucesso no Shadow DOM!');
  } catch (error) {
    console.error('[Aviator Analyzer] Erro ao inicializar:', error);
  }
};

// Aguardar o DOM estar pronto
const checkAndInit = () => {
  const url = window.location.href.toLowerCase();
  
  // Verificação de segurança: Estamos dentro do iframe do jogo?
  // 1. O jogo Aviator (Spribe) geralmente roda em um iframe.
  // 2. Não queremos rodar na página "pai" (Casino wrapper), pois ela não tem acesso aos dados do jogo.
  // 3. Se window.self === window.top, provavelmente estamos no wrapper (a menos que seja o site direto da Spribe).
  
  const isIframe = window.self !== window.top;
  
  // Elementos que SÓ existem dentro do jogo
  const gameCanvas = document.querySelector('canvas');
  const gameRoot = document.querySelector('app-root') || document.querySelector('app-game');
  const gameDropdown = document.querySelector('app-stats-dropdown');
  const payouts = document.querySelector('.payouts-block');
  
  // Só inicializa se tiver FORTE evidência de ser o jogo
  const isGameInternal = !!(gameCanvas || gameRoot || gameDropdown || payouts);

  if (isGameInternal) {
    console.log('[Aviator Analyzer] Jogo detectado (IFRAME)! Inicializando Spy...');
    setTimeout(init, 500); 
  } else if (!isIframe) {
    console.log('[Aviator Analyzer] Página Pai detectada! Inicializando Overlay UI...');
    setTimeout(init, 500);
  } else {
      // Se estamos num iframe mas ainda não carregou... tenta de novo em breve
      console.log('[Aviator Analyzer] Iframe sem jogo detectado. Retentando...');
      setTimeout(checkAndInit, 2000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}
