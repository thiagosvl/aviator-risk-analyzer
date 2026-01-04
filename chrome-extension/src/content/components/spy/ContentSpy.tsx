import { useGameAnalysis } from '@src/content/hooks/useGameAnalysis';
import { BridgeMessageType, bridgeService } from '@src/content/services/BridgeService';
import { useEffect } from 'react';

export const ContentSpy = () => {
  const { gameState, analysis, startAnalysis } = useGameAnalysis();

  // Start analysis immediately when mounted
  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  // Broadcast updates to the bridge
  useEffect(() => {
    bridgeService.sendToParent(BridgeMessageType.GAME_UPDATE, {
      gameState,
      analysis,
    });
  }, [gameState, analysis]);

  return null; // Invisible component
};
