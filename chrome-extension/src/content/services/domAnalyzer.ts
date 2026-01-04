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
        const iframeElements = Array.from(iframeDoc.querySelectorAll('span, div'));

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
      const elements = Array.from(document.querySelectorAll(selector));

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
        const statusElements = Array.from(iframeDoc.querySelectorAll(
          '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"]',
        ));

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
    const statusElements = Array.from(document.querySelectorAll(
      '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"], .flew-text',
    ));

    for (const el of statusElements) {

      const text = el.textContent?.toLowerCase() || '';

      if (text.includes('voando') || text.includes('flying') || text.includes('em voo')) {
        this.gameState.isFlying = true;
        return;
      }

      if (text.includes('aguardando') || text.includes('waiting') || text.includes('próxima') || text.includes('carregando') || text.includes('loading')) {
        this.gameState.isFlying = false;
        return;
      }
    }

    // Se não encontrou indicador, usar o multiplicador como referência
    // Se for 1.00 ou 0, assume que não está voando (ou está no inicio/fim)
    // Se for > 1.00, assume que está voando
    if (this.gameState.currentMultiplier > 1.00) {
        this.gameState.isFlying = true;
    } else {
        this.gameState.isFlying = false;
    }
  }

  /**
   * Extrai o histórico de velas/crashes da página
   * FOCO: Capturar do dropdown expandido (histórico completo de até 60 velas)
   */
  /**
   * Extrai o histórico de velas/crashes da página
   * FOCO: Capturar do dropdown expandido (histórico completo de até 60 velas)
   */
  private extractHistory(): void {
    const crashes: CandleData[] = [];
    const now = Date.now();

    // 1. Tentar capturar do iframe do jogo
    const iframe = document.querySelector(
      'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
    ) as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      try {
        console.log('[Aviator Debug] Accessing iframe content...');
        const iframeDoc = iframe.contentDocument;
        this.parseHistoryFromContext(iframeDoc, crashes, now);
      } catch (error) {
        console.log('[Aviator Debug] Erro ao acessar iframe:', error);
      }
    } else {
         console.log('[Aviator Debug] Iframe found but contentDocument is null (cross-origin restricted?) or iframe not found.');
    }

    // 2. Fallback: tentar capturar da página principal se não achou nada no iframe
    if (crashes.length === 0) {
      console.log('[Aviator Debug] Tentando capturar da página principal...');
      this.parseHistoryFromContext(document, crashes, now);
    }

    // 3. Atualizar Estado
    if (crashes.length > 0) {
      // Remover duplicatas? NÃO. O histórico do Aviator pode ter valores repetidos (ex: 1.0x seguido de 1.0x).
      // Apenas filtramos se for EXATAMENTE o mesmo identificador, mas aqui estamos extraindo valores.
      // Assumimos que a ordem do DOM (querySelectorAll) retorna a sequência correta.
      // Se a ordem for [Newest, Oldest...], history[0] será o mais recente.

      // Manter últimas 60
      this.gameState.history = crashes.slice(0, 60);

      // Atualizar último crash
      if (this.gameState.history.length > 0) {
        this.gameState.lastCrash = this.gameState.history[0].value;
      }
    } 
  }

  /**
   * Helper para extrair histórico de um contexto (Document ou Element)
   */
  private parseHistoryFromContext(context: Document | Element, crashes: CandleData[], now: number) {
     // Seletores específicos para o dropdown expandido do Aviator
     const historySelectors = [
      'app-stats-dropdown .payouts-block',
      '.payouts-block',
      'app-bubble-multiplier', 
      '.bubble-multiplier',
      '.payouts-block .ng-star-inserted',
      '[class*="payout"]',
      '[class*="history"]',
      // Novos seletores baseados em observação visual (pills)
      '.multiplier',
      '.items-container',
      '.ng-star-inserted', // Genérico, mas validado pelo contexto de números
      'div[class*="bubble"]'
    ];

    for (const selector of historySelectors) {
      // Tenta achar múltiplos itens diretos
      // Usando Array.from para garantir compatibilidade
      const items = Array.from(context.querySelectorAll(selector));
      
      if (items.length > 0) {
           console.log(`[Aviator Debug] Found ${items.length} items using selector: "${selector}"`);
      }

      if (items.length > 1) {
        // Encontrou lista de itens
        items.forEach(item => {
          this.parseElementValue(item, crashes, now);
        });
        // Se conseguimos extrair pelo menos 3 velas, consideramos sucesso e retornamos
        if (crashes.length >= 3) {
             console.log(`[Aviator Debug] Successfully extracted ${crashes.length} crashes using selector: "${selector}"`);
             return;
        }
      }
      
      // Tenta achar container
      const container = context.querySelector(selector);
      if (container) {
        // Tenta achar filhos com multiplicadores
        const children = Array.from(container.querySelectorAll('*'));
        // Filtra elementos muito profundos ou irrelevantes
        const validChildren = children.filter(c => c.textContent && c.textContent.trim().length < 10);

        if (validChildren.length > 0) {
           validChildren.forEach(child => this.parseElementValue(child, crashes, now));
        } else {
           // Tenta parsear texto do container como fallback
           this.parseTextValue(container.textContent || '', crashes, now);
        }
        if (crashes.length >= 3) return;
      }
    }
  }

  private parseElementValue(el: Element, crashes: CandleData[], now: number) {
    const text = el.textContent?.trim() || '';
    this.parseTextValue(text, crashes, now);
  }

  private parseTextValue(text: string, crashes: CandleData[], now: number) {
    if (text.length > 20) return; // Ignore long text
    
    // Regex mais flexível (aceita vírgula e ponto)
    const matches = text.match(/(\d+[.,]?\d*)\s*x?/gi);
    if (matches) {
      matches.forEach(match => {
        // Normaliza para ponto flutuante
        const normalized = match.replace(/,/g, '.').replace(/[^0-9.]/g, '');
        const val = parseFloat(normalized);
        
        if (!isNaN(val) && val >= 1.0 && val < 100000) {
           crashes.push({ value: val, timestamp: now });
        }
      });
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
