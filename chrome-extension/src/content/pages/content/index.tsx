import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
import { stealthMode } from '@src/content/services/stealthMode'; // Ensure instantiation
import { createRoot } from 'react-dom/client';

function init() {
  const isIframe = window.self !== window.top;
  console.log(`[Aviator Analyzer] Content Script Initialized. Context: ${isIframe ? 'Iframe' : 'Top Window'}`);

  // Garantir que o serviço de Stealth Mode esteja ativo (listeners)
  // Como ele é um singleton instanciado no import, já deve estar ouvindo.
  // Vamos apenas logar para confirmar.
  if (stealthMode) {
      console.log(`[Aviator Analyzer] StealthMode Service Ready in ${isIframe ? 'Iframe' : 'Top Window'}`);
  }

  // Se for iframe, NÃO renderiza a UI (Overlay), apenas roda os serviços (Stealth Mode)
  if (isIframe) {
      return;
  }

  const appContainer = document.createElement('div');
  document.body.appendChild(appContainer);
  if (!appContainer) {
    throw new Error('Can not find AppContainer');
  }
  const root = createRoot(appContainer);
  root.render(<AnalyzerOverlay />);
}

init();
