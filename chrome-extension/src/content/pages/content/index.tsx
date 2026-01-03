import { createRoot } from 'react-dom/client';
import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';

function init() {
  const appContainer = document.createElement('div');
  document.body.appendChild(appContainer);
  if (!appContainer) {
    throw new Error('Can not find AppContainer');
  }
  const root = createRoot(appContainer);
  root.render(<AnalyzerOverlay />);
}

init();
