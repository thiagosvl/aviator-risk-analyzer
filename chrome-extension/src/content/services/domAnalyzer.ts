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
        // Regex melhorada: suporta 1.05x, 10,0x, 2x, 100, etc.
        const match = text.match(/(\d+[.,]?\d*)\s*x/i) || text.match(/^(\d+[.,]?\d*)$/);

        if (match) {
          const value = parseFloat(match[1].replace(',', '.'));
          if (value >= 1.0 && value < 100000) {
            this.gameState.currentMultiplier = value;
            if (value > 1.0) this.gameState.isFlying = true;
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

    // Fallback: procurar na página principal e usar varredura de texto se necessário
    const statusElements = Array.from(document.querySelectorAll(
      '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"], .flew-text, .game-state',
    ));
    
    // Adicionar o container principal do jogo se encontrado
    const gameContainer = document.querySelector('.game-container, .screen-container');
    if (gameContainer) statusElements.push(gameContainer);

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

      // Regex robusto para detectar "Voou para longe" em várias formatações, incluindo exclamação
      // Match: "Voou para longe", "Voou para longe!", "Flew away"
      if (/voou\s+para\s+longe|flew\s+away/i.test(text)) {
        this.gameState.isFlying = false;
        
        // Tentar extrair o valor final do texto "Voou para longe 1.06x"
        const match = text.match(/(\d+\.?\d*)\s*x/i);
        if (match) {
            const crashVal = parseFloat(match[1]);
            if (crashVal >= 1.0) {
                 this.gameState.lastCrash = crashVal;
                 console.log(`[Aviator Analyzer] Crash detected directly from text: ${crashVal}x`);
                 
                 // Adicionar ao histórico manualmente se não estiver lá
                 if (this.gameState.history.length === 0 || this.gameState.history[0].value !== crashVal) {
                     this.gameState.history.unshift({ value: crashVal, timestamp: Date.now() });
                     if (this.gameState.history.length > 60) this.gameState.history.pop();
                 }
            }
        }
        return;
      }
    }
    
    // ULTRAFALLBACK: Check for "Voou para longe" in the specific big-text/multiplier container
    // Often the multiplier text changes color or label
    const multiplierContainer = document.querySelector('.multiplier-block, .coeff-block');
    if (multiplierContainer && /voou|flew/i.test(multiplierContainer.textContent || '')) {
         this.gameState.isFlying = false;
         return;
    }

    // Se não encontrou indicador textual, usar o multiplicador como referência
    if (this.gameState.currentMultiplier > 1.00) {
        // Se estamos vendo um multiplicador > 1.00, assumimos que está voando...
        // ...EXCETO se esse multiplicador estiver ESTÁTICO por muito tempo (o que o analyzer não consegue saber num snapshot)
        // Mas podemos assumir True e confiar no texto "Voou para longe" pra desativar. 
        // Se falhamos em detectar "Voou para longe", ele vai ficar TRUE pra sempre até virar "Waiting".
        // Isso é perigoso ('Zumbi Flight').
        
        // Vamos logar essa decisão de fallback
        // console.log('[Aviator Analyzer] IsFlying=True based on multiplier > 1.00 fallback.');
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
    const scrapedValues: number[] = [];
    const now = Date.now();

    // Detectar se estamos dentro do iframe do jogo
    const isInsideGameIframe = window.location.href.includes('spribe') || 
                                window.location.href.includes('aviator') ||
                                document.querySelector('.payouts-block') !== null;

    if (isInsideGameIframe) {
      // Estamos dentro do iframe, buscar diretamente no document
      console.log('[Aviator Analyzer] DOM: Detectado contexto de iframe do jogo, buscando histórico...');
      this.parseHistoryFromContext(document, scrapedValues);
    } else {
      // Estamos na página principal, tentar acessar o iframe
      const iframe = document.querySelector(
        'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
      ) as HTMLIFrameElement;

      if (iframe?.contentDocument) {
        try {
          const iframeDoc = iframe.contentDocument;
          this.parseHistoryFromContext(iframeDoc, scrapedValues);
        } catch (error) {
           // Silently fail (cross-origin)
        }
      }

      // Fallback: tentar capturar da página principal
      if (scrapedValues.length === 0) {
        this.parseHistoryFromContext(document, scrapedValues);
      }
    }

    if (scrapedValues.length > 0) {
        console.log(`[Aviator Analyzer] DOM: Foram encontradas ${scrapedValues.length} velas no histórico.`);
    } else {
        // Log apenas se estivermos em um contexto de iframe ou se sabemos que o jogo está ali
        if (location.href.includes('game') || location.href.includes('aviator') || document.querySelector('iframe')) {
            console.warn('[Aviator Analyzer] DOM: Nenhum histórico encontrado com os seletores atuais.');
        }
    }
    // Se scrapedValues estiver vazio, não fazemos nada.
    if (scrapedValues.length > 0) {
        // O array scrapedValues vem na ordem do DOM. Geralmente: [Mais Recente, ..., Mais Antigo]
        
        const currentHistory = this.gameState.history;
        const lastRecordedValue = currentHistory.length > 0 ? currentHistory[0].value : null;

        // Helper para comparação segura de floats
        const isSame = (a: number | null, b: number | null) => {
             if (a === null || b === null) return false;
             return Math.abs(a - b) < 0.01;
        };

        if (lastRecordedValue === null) {
            this.gameState.history = scrapedValues.map(v => ({ value: v, timestamp: now }));
            if (this.gameState.history.length > 0) {
                 this.gameState.lastCrash = this.gameState.history[0].value;
            }
            return;
        }

        // Tenta achar o topo do histórico nos primeiros 10 itens
        let matchIndex = -1;
        
        for (let i = 0; i < Math.min(scrapedValues.length, 10); i++) {
            if (isSame(scrapedValues[i], lastRecordedValue)) {
                // Candidato a match.
                // Verificar segundo item por segurança
                const prevHistoryVal = currentHistory.length > 1 ? currentHistory[1].value : null;
                const nextScrapedVal = (i + 1 < scrapedValues.length) ? scrapedValues[i+1] : null;
                
                if (prevHistoryVal !== null && nextScrapedVal !== null) {
                    if (isSame(prevHistoryVal, nextScrapedVal)) {
                        matchIndex = i;
                        break; 
                    }
                } else {
                    // Sem segundo item para conferir, confiamos no primeiro
                    matchIndex = i;
                    break;
                }
            }
        }

        if (matchIndex > 0) {
            // Temos itens novos antes do match
            const newItems = scrapedValues.slice(0, matchIndex);
            
             // Double Check: Avoid adding if it looks like a flicker
             // If we are adding just ONE item, and it is equal to lastRecordedValue...
             // But we only got here because matchIndex > 0 (so scrapedValues[0] != lastRecorded, or scraped[0] was not the match)
             // Wait. If scraped = [1.08, 1.08] and history = [1.08].
             // i=0: scraped[0] (1.08) == last (1.08).
             // Check next: scraped[1] (1.08) vs history[1] (say 2.00). NO MATCH.
             // Loop continues to i=1.
             // i=1: scraped[1] (1.08) == last (1.08).
             // Check next: scraped[2] (2.00) vs history[1] (2.00). MATCH!
             // matchIndex = 1.
             // newItems = [scraped[0]] = [1.08].
             // Correct! We identified a new 1.08.

             console.log(`[Aviator Analyzer] 🆕 New Candles Detected: ${newItems.join(', ')}`);

            const newEntries: CandleData[] = newItems.map(v => ({ value: v, timestamp: now + Math.random() }));
            
            this.gameState.history = [...newEntries, ...currentHistory].slice(0, 60);
            this.gameState.lastCrash = this.gameState.history[0].value;
            
        } else if (matchIndex === -1) {
             // Lost sync?
             // Se scrapedValues[0] é diferente do topo atual...
             if (!isSame(scrapedValues[0], lastRecordedValue)) {
                  // Only add if we are reasonably sure (e.g. not empty)
                   console.log(`[Aviator Analyzer] New value (Sync Lost fallback): ${scrapedValues[0]}`);
                  const entry = { value: scrapedValues[0], timestamp: now };
                  this.gameState.history.unshift(entry);
                  this.gameState.lastCrash = entry.value;
                  if (this.gameState.history.length > 60) this.gameState.history.pop();
             }
        }
        // Se matchIndex === 0, significa que scrapedValues[0] == lastRecordedValue. Nada mudou.
    }
  }

  /**
   * Helper para extrair histórico de um contexto (Document ou Element)
   * Modificado para retornar array de números apenas
   */
  private parseHistoryFromContext(context: Document | Element, targetArray: number[]) {
     const historySelectors = [
      '.payouts-block .payout',
      '[apppayoutsmultiplier]',
      'div[_ngcontent*="rrh"] .payout',
      'app-payouts-item',
      '.payout-item',
      '.history-item',
      '.bubble-multiplier',
      '.multiplier',
      '.items-container',
      '.ng-star-inserted', 
      'div[class*="bubble"]',
      'div.bubble',
      'div.payout',
      '.coefficient',
      '.payouts-item',
      '.history-payouts',
      '.payouts-wrapper span'
    ];

    for (const selector of historySelectors) {
      const items = Array.from(context.querySelectorAll(selector));
      
      if (items.length > 0) {
        let foundBefore = targetArray.length;
        items.forEach(item => {
          this.parseElementValue(item, targetArray);
        });
        
        // Se encontramos algo novo com este seletor, logamos
        if (targetArray.length > foundBefore) {
            // console.debug(`[Aviator Analyzer] Selector '${selector}' found ${targetArray.length - foundBefore} values.`);
        }
        
        if (targetArray.length >= 10) return; // Já temos o suficiente para análise
      }
      
      const container = context.querySelector(selector);
      if (container && targetArray.length === 0) {
        const text = container.textContent || '';
        this.parseTextValue(text, targetArray);
        if (targetArray.length >= 3) return;
      }
    }
  }

  private parseElementValue(el: Element, targetArray: number[]) {
    const text = el.textContent?.trim() || '';
    this.parseTextValue(text, targetArray);
  }

  // Modificado para aceitar array de numbers
  private parseTextValue(text: string, targetArray: number[]) {
    if (text.length > 1000) return;
    
    const matches = text.matchAll(/(\d+[.,]?\d*)\s*x/gi);
    
    for (const match of matches) {
         const raw = match[1];
         const normalized = raw.replace(',', '.');
         const val = parseFloat(normalized);
         
         if (!isNaN(val) && val >= 1.0 && val < 100000) {
            targetArray.push(val);
         }
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
