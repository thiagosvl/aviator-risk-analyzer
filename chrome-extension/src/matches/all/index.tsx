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
  const isIframe = window.self !== window.top;
  const url = window.location.href.toLowerCase();
  
  // LOG DE DEBUG PARA RASTREAMENTO
  console.log(`[Aviator Analyzer] 🔍 Verificando Frame... (Iframe: ${isIframe} | URL: ${url.substring(0, 50)}...)`);

  if (document.getElementById(ROOT_ID)) return;

  // No TOP WINDOW, inicializamos o Overlay
  if (!isIframe) {
    console.log('[Aviator Analyzer] ✅ Top Window detectado. Montando Overlay...');
    setTimeout(init, 500);
    return;
  }

  // No IFRAME, vamos SEMPRE inicializar o ContentSpy.
  // A própria lógica do domAnalyzer vai filtrar se não encontrar dados úteis.
  // Isso evita que frames dinâmicos ou mascarados sejam ignorados.
  console.log('[Aviator Analyzer] 🎯 Iframe detectado. Montando ContentSpy para monitoramento...');
  setTimeout(init, 100);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}
