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
          
          // Validar se é um multiplicador válido (Aviator começa em 1.00x)
          if (value >= 1.0 && value < 10000) {
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
      'app-stats-dropdown .payouts-block',
      '.payouts-block',
      '[class*="payout"]',
      'app-stats-dropdown',
      'app-bubble-multiplier',
      // Fallbacks
      '[class*="history"]',
      '[class*="previous"]',
      '[class*="crash"]',
      '[class*="recent"]',
      '[class*="last"]',
      '.result-history',
      '.bubble-multiplier',
    ];

    const crashes: CandleData[] = [];
    const now = Date.now();
    let debugFound = false;

    for (const selector of historySelectors) {
      const containers = document.querySelectorAll(selector);
      
      if (containers.length > 0 && !debugFound) {
        console.log(`[Aviator Debug] Found containers with selector: ${selector}`, containers.length);
        debugFound = true;
      }

      for (const container of containers) {
        // Tentar pegar do atributo title ou text
        const text = container.textContent || container.getAttribute('title') || '';
        
        // Padrão Angular/Spribe
        if (text.includes('x') || selector.includes('payout')) {
             const matches = text.match(/(\d+\.?\d*)\s*x?/gi); // O 'x' pode ser opcional em alguns casos
             
             if (matches && matches.length > 0) {
               matches.forEach((match, index) => {
                 const value = parseFloat(match.replace(/[^\d.]/g, ''));
                 
                 // Validar multiplicador
                 if (value >= 1.0 && value < 10000) {
                   crashes.push({
                     value,
                     timestamp: now - (matches.length - index) * 1000,
                   });
                 }
               });
             }
        }
      }
      
      if (crashes.length >= 5) break;
    }

    // Atualizar histórico se encontrou dados novos
    if (crashes.length > 0) {
      // Remover duplicatas e manter os mais recentes
      const uniqueCrashes = crashes.filter((crash, index, self) =>
        index === self.findIndex(c => c.value === crash.value && 
          Math.abs(c.timestamp - crash.timestamp) < 2000)
      );
      
      // IMPORTANTE: No Aviator, as velas são exibidas da ESQUERDA para DIREITA
      // A vela mais recente está à ESQUERDA, então precisamos INVERTER a ordem
      console.log('[Aviator Debug] Ordem ANTES do reverse (como capturado do DOM):', 
        uniqueCrashes.slice(0, 5).map(c => c.value.toFixed(2) + 'x').join(' <- '));
      
      const orderedCrashes = uniqueCrashes.reverse();
      
      console.log('[Aviator Debug] Ordem DEPOIS do reverse (mais recente primeiro no array):', 
        orderedCrashes.slice(0, 5).map(c => c.value.toFixed(2) + 'x').join(' <- '));
      
      this.gameState.history = orderedCrashes.slice(-60); // Manter últimas 60
      
      // Atualizar último crash (agora é o primeiro do array invertido)
      if (orderedCrashes.length > 0) {
        this.gameState.lastCrash = orderedCrashes[0].value;
      }
      
      console.log('[Aviator Debug] Histórico atualizado (mais recente à esquerda):', 
        orderedCrashes.slice(0, 10).map(c => c.value.toFixed(2) + 'x').join(', '));
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
