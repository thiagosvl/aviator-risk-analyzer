import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
import { ContentSpy } from '@src/content/components/spy/ContentSpy'; // Importar o espião
import { stealthMode } from '@src/content/services/stealthMode';
import { createRoot } from 'react-dom/client';

function init() {
  const isIframe = window.self !== window.top;
  console.log(`[Aviator Analyzer] Content Script Initialized. Context: ${isIframe ? 'Iframe' : 'Top Window'}`);

  if (stealthMode) {
      console.log(`[Aviator Analyzer] StealthMode Service Ready in ${isIframe ? 'Iframe' : 'Top Window'}`);
  }

  const appContainer = document.createElement('div');
  document.body.appendChild(appContainer);
  const root = createRoot(appContainer);

  if (isIframe) {
      // No Iframe, rodamos apenas a lógica de espionagem e análise
      console.log('[Aviator Analyzer] Mounting ContentSpy in Iframe...');
      root.render(<ContentSpy />);
  } else {
      // Na Janela Principal, rodamos a Interface (Overlay)
      console.log('[Aviator Analyzer] Mounting Overlay in Top Window...');
      root.render(<AnalyzerOverlay />);
  }
}

init();
