/**
 * DOM Analyzer - Extrai dados do jogo Aviator do DOM
 * 
 * Este módulo é responsável por encontrar e extrair informações
 * do histórico de velas diretamente dos elementos da página.
 */

import { CandleData, GameState } from '@src/content/types';

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
    // Procurar por elementos que mostram o multiplicador
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
        
        // Procurar por padrão de multiplicador (ex: "2.45x", "1.00x")
        const match = text.match(/(\d+\.?\d*)\s*x/i);
        
        if (match) {
          const value = parseFloat(match[1]);
          
          // Validar se é um multiplicador válido
          if (value > 0 && value < 10000) {
            this.gameState.currentMultiplier = value;
            
            // Se o multiplicador está crescendo, o avião está voando
            if (value > 1.0) {
              this.gameState.isFlying = true;
            }
            
            return; // Encontrou, pode parar
          }
        }
      }
    }
  }

  /**
   * Detecta o status do jogo (voando ou aguardando)
   */
  private extractGameStatus(): void {
    // Procurar por indicadores de status
    const statusElements = document.querySelectorAll(
      '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"]'
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
   */
  private extractHistory(): void {
    // Procurar por elementos de histórico
    const historySelectors = [
      '[class*="history"]',
      '[class*="previous"]',
      '[class*="crash"]',
      '[class*="recent"]',
      '[class*="last"]',
    ];

    const crashes: CandleData[] = [];
    const now = Date.now();

    for (const selector of historySelectors) {
      const containers = document.querySelectorAll(selector);
      
      for (const container of containers) {
        // Procurar por todos os multiplicadores dentro do container
        const text = container.textContent || '';
        const matches = text.match(/(\d+\.?\d*)\s*x/gi);
        
        if (matches && matches.length > 0) {
          matches.forEach((match, index) => {
            const value = parseFloat(match);
            
            // Validar multiplicador
            if (value > 0.5 && value < 10000) {
              crashes.push({
                value,
                timestamp: now - (matches.length - index) * 1000, // Estimativa de tempo
              });
            }
          });
          
          // Se encontrou vários multiplicadores, provavelmente é o histórico
          if (crashes.length >= 5) {
            break;
          }
        }
      }
      
      if (crashes.length >= 5) {
        break;
      }
    }

    // Atualizar histórico se encontrou dados novos
    if (crashes.length > 0) {
      // Remover duplicatas e manter os mais recentes
      const uniqueCrashes = crashes.filter((crash, index, self) =>
        index === self.findIndex(c => c.value === crash.value && 
          Math.abs(c.timestamp - crash.timestamp) < 2000)
      );
      
      this.gameState.history = uniqueCrashes.slice(-60); // Manter últimas 60
      
      // Atualizar último crash
      if (uniqueCrashes.length > 0) {
        this.gameState.lastCrash = uniqueCrashes[uniqueCrashes.length - 1].value;
      }
    }
  }

  /**
   * Método para adicionar um crash manualmente (útil para testes)
   */
  public addCrash(value: number): void {
    if (value > 0 && value < 10000) {
      this.gameState.history.push({
        value,
        timestamp: Date.now(),
      });
      
      // Manter apenas últimas 60
      if (this.gameState.history.length > 60) {
        this.gameState.history.shift();
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
