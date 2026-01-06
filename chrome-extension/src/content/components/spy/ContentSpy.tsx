import { useGameAnalysis } from '@src/content/hooks/useGameAnalysis';
import { bridge } from '@src/content/services/BridgeService';
import { useEffect } from 'react';

export const ContentSpy = () => {
  const { gameState, analysis, startAnalysis } = useGameAnalysis();

  // Start analysis immediately when mounted (in Iframe)
  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  // Broadcast updates to the bridge (Top Frame)
  useEffect(() => {
    // CRITICAL: Only broadcast if we have meaningful data.
    // This prevents background helper iframes from overwriting the main game data with empty states.
    if (gameState.history.length > 0 || gameState.currentMultiplier > 1.0) {
        if (gameState.history.length > 0) {
            console.log(`[Aviator Analyzer] Spy: Capturado ${gameState.history[0].value}x. Enviando update...`);
        }
        bridge.sendToTop('GAME_UPDATE', {
          gameState,
          analysis,
        });
    } else {
        // Log skip reason occasionally
        if (Math.random() < 0.1) {
            console.log(`[Aviator Analyzer] Spy: Sem dados relevantes para enviar. Histórico: ${gameState.history.length}`);
        }
    }
  }, [gameState, analysis]);

  return null; // Invisible component
};
