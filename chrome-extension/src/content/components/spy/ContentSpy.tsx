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
    bridge.sendToTop('GAME_UPDATE', {
      gameState,
      analysis,
    });
  }, [gameState, analysis]);

  return null; // Invisible component
};
