/**
 * DOM Analyzer - Extrai dados do jogo Aviator do DOM
 *
 * Este módulo é responsável por encontrar e extrair informações
 * do histórico de velas diretamente dos elementos da página.
 */

import type { CandleData, GameState } from '@src/content/types';

export class DOMAnalyzer {
  private gameState: GameState = {
    currentMultiplier: 1.0,
    isFlying: false,
    lastCrash: null,
    history: [],
  };

  /**
   * Extrai dados do jogo da página atual
   */
  public extractGameData(): GameState {
    this.extractCurrentMultiplier();
    this.extractGameStatus();
    this.extractHistory();

    return { ...this.gameState };
  }

  /**
   * Extrai o multiplicador atual da tela
   */
  private extractCurrentMultiplier(): void {
    // Primeiro tentar pegar do iframe do jogo
    const iframe = document.querySelector(
      'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
    ) as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      try {
        const iframeDoc = iframe.contentDocument;
        const iframeElements = iframeDoc.querySelectorAll('span, div');

        for (const el of iframeElements) {
          const text = el.textContent?.trim() || '';
          const match = text.match(/(\d+\.?\d*)\s*x/i);

          if (match) {
            const value = parseFloat(match[1]);
            if (value >= 1.0 && value < 10000) {
              this.gameState.currentMultiplier = value;
              if (value > 1.0) {
                this.gameState.isFlying = true;
              }
              return;
            }
          }
        }
      } catch {
        // Sem acesso ao iframe, continuar com fallback
      }
    }

    // Fallback: procurar na página principal
    const selectors = [
      '[class*="multiplier"]',
      '[class*="crash"]',
      '[class*="coefficient"]',
      '[class*="odds"]',
      'span',
      'div',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);

      for (const el of elements) {
        const text = el.textContent?.trim() || '';
        const match = text.match(/(\d+\.?\d*)\s*x/i);

        if (match) {
          const value = parseFloat(match[1]);

          if (value >= 1.0 && value < 10000) {
            this.gameState.currentMultiplier = value;

            if (value > 1.0) {
              this.gameState.isFlying = true;
            }

            return;
          }
        }
      }
    }
  }

  /**
   * Detecta o status do jogo (voando ou aguardando)
   */
  private extractGameStatus(): void {
    // Tentar detectar do iframe primeiro
    const iframe = document.querySelector(
      'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
    ) as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      try {
        const iframeDoc = iframe.contentDocument;
        const statusElements = iframeDoc.querySelectorAll(
          '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"]',
        );

        for (const el of statusElements) {
          const text = el.textContent?.toLowerCase() || '';

          if (text.includes('voando') || text.includes('flying') || text.includes('em voo')) {
            this.gameState.isFlying = true;
            return;
          }

          if (text.includes('aguardando') || text.includes('waiting') || text.includes('próxima')) {
            this.gameState.isFlying = false;
            return;
          }
        }
      } catch {
        // Sem acesso ao iframe
      }
    }

    // Fallback: procurar na página principal
    const statusElements = document.querySelectorAll(
      '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"]',
    );

    for (const el of statusElements) {
      const text = el.textContent?.toLowerCase() || '';

      if (text.includes('voando') || text.includes('flying') || text.includes('em voo')) {
        this.gameState.isFlying = true;
        return;
      }

      if (text.includes('aguardando') || text.includes('waiting') || text.includes('próxima')) {
        this.gameState.isFlying = false;
        return;
      }
    }

    // Se não encontrou indicador, usar o multiplicador como referência
    if (this.gameState.currentMultiplier <= 1.0) {
      this.gameState.isFlying = false;
    }
  }

  /**
   * Extrai o histórico de velas/crashes da página
   * FOCO: Capturar do dropdown expandido (histórico completo de até 60 velas)
   */
  private extractHistory(): void {
    const crashes: CandleData[] = [];
    const now = Date.now();

    // Tentar capturar do iframe do jogo
    const iframe = document.querySelector(
      'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
    ) as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      try {
        const iframeDoc = iframe.contentDocument;

        // Seletores específicos para o dropdown expandido do Aviator
        const historySelectors = [
          // Dropdown expandido (quando clica nos 3 pontinhos)
          'app-stats-dropdown',
          '.payouts-block',
          '[class*="payout"]',
          'app-bubble-multiplier',
          // Linha superior (fallback)
          '[class*="history"]',
          '[class*="bubble"]',
          '[class*="result"]',
        ];

        console.log('[Aviator Debug] Tentando capturar histórico do iframe...');

        for (const selector of historySelectors) {
          const containers = iframeDoc.querySelectorAll(selector);

          if (containers.length > 0) {
            console.log(`[Aviator Debug] Encontrado ${containers.length} containers com seletor: ${selector}`);

            for (const container of containers) {
              // Capturar todos os elementos filhos que podem conter multiplicadores
              const childElements = container.querySelectorAll('*');

              for (const child of childElements) {
                const text = child.textContent?.trim() || '';

                // Procurar por padrão de multiplicador
                const matches = text.match(/(\d+\.?\d*)\s*x/gi);

                if (matches) {
                  matches.forEach(match => {
                    const value = parseFloat(match.replace(/[^\d.]/g, ''));

                    // Validar multiplicador
                    if (value >= 1.0 && value < 10000) {
                      // Verificar se já não foi adicionado
                      const exists = crashes.some(c => Math.abs(c.value - value) < 0.01);
                      if (!exists) {
                        crashes.push({
                          value,
                          timestamp: now - crashes.length * 1000,
                        });
                      }
                    }
                  });
                }
              }
            }

            // Se encontrou dados suficientes, parar
            if (crashes.length >= 10) break;
          }
        }
      } catch (error) {
        console.log('[Aviator Debug] Erro ao acessar iframe:', error);
      }
    }

    // Fallback: tentar capturar da página principal
    if (crashes.length === 0) {
      console.log('[Aviator Debug] Tentando capturar da página principal...');

      const historySelectors = [
        'app-stats-dropdown',
        '.payouts-block',
        '[class*="payout"]',
        'app-bubble-multiplier',
        '[class*="history"]',
        '[class*="bubble"]',
      ];

      for (const selector of historySelectors) {
        const containers = document.querySelectorAll(selector);

        if (containers.length > 0) {
          console.log(`[Aviator Debug] Encontrado ${containers.length} containers (página principal): ${selector}`);

          for (const container of containers) {
            const text = container.textContent || '';
            const matches = text.match(/(\d+\.?\d*)\s*x/gi);

            if (matches) {
              matches.forEach(match => {
                const value = parseFloat(match.replace(/[^\d.]/g, ''));

                if (value >= 1.0 && value < 10000) {
                  const exists = crashes.some(c => Math.abs(c.value - value) < 0.01);
                  if (!exists) {
                    crashes.push({
                      value,
                      timestamp: now - crashes.length * 1000,
                    });
                  }
                }
              });
            }
          }

          if (crashes.length >= 10) break;
        }
      }
    }

    // Atualizar histórico se encontrou dados novos
    if (crashes.length > 0) {
      console.log(`[Aviator Debug] Total de velas capturadas: ${crashes.length}`);
      console.log(
        '[Aviator Debug] Primeiras 10 velas:',
        crashes
          .slice(0, 10)
          .map(c => c.value.toFixed(2) + 'x')
          .join(', '),
      );

      // Remover duplicatas
      const uniqueCrashes = crashes.filter(
        (crash, index, self) => index === self.findIndex(c => Math.abs(c.value - crash.value) < 0.01),
      );

      // No Aviator, a vela mais recente está à ESQUERDA
      // Inverter ordem para que a mais recente fique no índice 0
      const orderedCrashes = uniqueCrashes.reverse();

      // Manter últimas 60
      this.gameState.history = orderedCrashes.slice(0, 60);

      // Atualizar último crash
      if (orderedCrashes.length > 0) {
        this.gameState.lastCrash = orderedCrashes[0].value;
      }

      console.log(
        '[Aviator Debug] Histórico final (mais recente primeiro):',
        this.gameState.history
          .slice(0, 10)
          .map(c => c.value.toFixed(2) + 'x')
          .join(', '),
      );
      console.log(`[Aviator Debug] Total no histórico: ${this.gameState.history.length} velas`);
    } else {
      console.log('[Aviator Debug] Nenhuma vela capturada. Verifique se o dropdown está expandido.');
    }
  }

  /**
   * Método para adicionar um crash manualmente (útil para testes)
   */
  public addCrash(value: number): void {
    if (value > 0 && value < 10000) {
      this.gameState.history.unshift({
        value,
        timestamp: Date.now(),
      });

      // Manter apenas últimas 60
      if (this.gameState.history.length > 60) {
        this.gameState.history.pop();
      }

      this.gameState.lastCrash = value;
    }
  }

  /**
   * Reseta o estado do analisador
   */
  public reset(): void {
    this.gameState = {
      currentMultiplier: 1.0,
      isFlying: false,
      lastCrash: null,
      history: [],
    };
  }
}

// Exportar instância singleton
export const domAnalyzer = new DOMAnalyzer();
