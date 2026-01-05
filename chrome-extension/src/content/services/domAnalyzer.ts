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
    // Salvar histórico anterior antes de extrair
    const previousHistory = [...this.gameState.history];
    const previousHistoryLength = previousHistory.length;
    
    this.extractCurrentMultiplier();
    this.extractGameStatus();
    this.extractHistory();

    // Se a nova extração retornou vazio MAS tínhamos histórico antes,
    // manter o histórico anterior (evita piscar)
    if (this.gameState.history.length === 0 && previousHistoryLength > 0) {
      console.log(`[Aviator Analyzer] DOM: Preservando histórico anterior (${previousHistoryLength} velas) - nova extração falhou.`);
      this.gameState.history = previousHistory;
    }

    return { ...this.gameState };
  }

  /**
   * Extrai o multiplicador atual da tela
   */
  private extractCurrentMultiplier(): void {
    let foundMultiplier: number | null = null;

    // 1. Tentar pegar do iframe do jogo (Seletor específico Spribe)
    const iframe = document.querySelector(
      'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
    ) as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      try {
        const iframeDoc = iframe.contentDocument;
        // Seletores mais específicos para o multiplicador central
        const multiplierElements = Array.from(iframeDoc.querySelectorAll('.main-payout, .multiplier, .coefficient, span, div'))
          .filter(el => {
            const text = el.textContent?.trim() || '';
            // Match: 1.05x, 10.0x, 232x, etc
            return /(\d+[.,]?\d*)\s*x/i.test(text) || /^(\d+[.,]?\d*)$/.test(text);
          });

        if (multiplierElements.length > 0) {
          // Pegar o primeiro (geralmente o central mais importante)
          const text = multiplierElements[0].textContent?.trim() || '';
          const match = text.match(/(\d+[.,]?\d*)\s*x/i) || text.match(/^(\d+[.,]?\d*)$/);
          if (match) {
            foundMultiplier = parseFloat(match[1].replace(',', '.'));
          }
        }
      } catch {
        // Cross-origin ou erro
      }
    }

    // 2. Fallback: procurar na página principal com seletores amplos
    if (foundMultiplier === null) {
      const selectors = [
        '.main-coeff',
        '[class*="multiplier"]',
        '[class*="crash"]',
        '[class*="coefficient"]',
        '[class*="odds"]',
        '.flew-away', 
        'span',
        'div',
      ];

      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        for (const el of elements) {
          const text = el.textContent?.trim() || '';
          const match = text.match(/(\d+[.,]?\d*)\s*x/i) || text.match(/^(\d+[.,]?\d*)$/);

          if (match) {
            const value = parseFloat(match[1].replace(',', '.'));
            if (value >= 1.0 && value < 100000) {
              foundMultiplier = value;
              break;
            }
          }
        }
        if (foundMultiplier !== null) break;
      }
    }

    // SOMENTE atualizar se encontramos algo válido. 
    // Evita resetar para 1.0 durante carregamento ou frames vazios que causam o "piscar".
    if (foundMultiplier !== null && foundMultiplier >= 1.0) {
      this.gameState.currentMultiplier = foundMultiplier;
      if (foundMultiplier > 1.0) {
        this.gameState.isFlying = true;
      }
    }
  }

  /**
   * Detecta o status do jogo (voando ou aguardando)
   */
  private extractGameStatus(): void {
    let statusDetected: boolean | null = null;

    // Tentar detectar do iframe primeiro
    const iframe = document.querySelector(
      'iframe[src*="aviator"], iframe[src*="spribe"], iframe[src*="game"]',
    ) as HTMLIFrameElement;

    if (iframe?.contentDocument) {
      try {
        const iframeDoc = iframe.contentDocument;
        const statusElements = Array.from(iframeDoc.querySelectorAll(
          '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"], .flew-away, .stage-board',
        ));

        for (const el of statusElements) {
          const text = el.textContent?.toLowerCase() || '';

          if (text.includes('voando') || text.includes('flying') || text.includes('em voo')) {
            statusDetected = true;
            break;
          }

          if (text.includes('aguardando') || text.includes('waiting') || text.includes('próxima') || text.includes('voou') || text.includes('flew')) {
            statusDetected = false;
            break;
          }
        }
      } catch {
        // Cross-origin
      }
    }

    // Fallback: procurar na página principal
    if (statusDetected === null) {
      const statusElements = Array.from(document.querySelectorAll(
        '[class*="status"], [class*="state"], [class*="flying"], [class*="waiting"], .flew-text, .game-state, .stage-board',
      ));
      
      for (const el of statusElements) {
        const text = el.textContent?.toLowerCase() || '';

        if (text.includes('voando') || text.includes('flying') || text.includes('em voo')) {
          statusDetected = true;
          break;
        }

        if (text.includes('aguardando') || text.includes('waiting') || text.includes('próxima') || text.includes('voou') || text.includes('flew')) {
          statusDetected = false;
          break;
        }
      }
    }

    // SOMENTE atualizar se detectamos algo claro, para evitar flickering
    if (statusDetected !== null) {
      this.gameState.isFlying = statusDetected;
    } else {
      // Se não detectamos status mas o multiplicador está subindo, assumimos IsFlying
      if (this.gameState.currentMultiplier > 1.0) {
        this.gameState.isFlying = true;
      }
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
        const frameTag = window.self !== window.top ? `[Iframe: ${window.location.pathname.substring(0, 20)}]` : '[Top]';
        // Log apenas se encontrarmos algo, para ajudar a identificar o frame correto
        console.log(`[Aviator Analyzer] DOM ${frameTag}: Encontradas ${scrapedValues.length} velas.`);
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

        // --- NEW SYNC LOGIC V2: TRUST THE DOM ---
        // If the DOM provides a substantial list (>= 10), we assume it's the valid "Visible History".
        // Use it to REPLACE our state, avoiding infinite accumulation of off-screen items.
        // This fixes duplicates (e.g. 2x appearing twice) and count mismatches (51 stored vs 26 visible).
        if (scrapedValues.length >= 10 || scrapedValues.length > currentHistory.length) {
             const hasChange = scrapedValues[0] !== lastRecordedValue; 
             
             // Only replace if there's actually a change or length diff, to avoid React render spam?
             // Actually, recreating the object is fine if values are same, but we want to catch "New Candle".
             
             // If the top value is different, or length is different, update.
             // We map timestamp: Keep existing timestamps for matching items? 
             // Too complex. Just use current timestamp for new items.
             // But for pattern analysis, relative order matters more than absolute timestamp.
             
             // Simple approach: Replace.
             // To preserve some timestamps, we could try to map, but simplicity is key for fixing bugs.
             
             // Correction: If we just replace with Date.now(), we lose the relative time diffs?
             // Values don't rely on time diffs in StrategyCore.
             // So Replace is safe.
             
             if (scrapedValues.length !== currentHistory.length || !isSame(scrapedValues[0], lastRecordedValue)) {
                 // console.log(`[Aviator Analyzer] DOM Sync: Replace History (${currentHistory.length} -> ${scrapedValues.length} items)`);
                 this.gameState.history = scrapedValues.slice(0, 60).map(v => ({ value: v, timestamp: now })); 
                 this.gameState.lastCrash = this.gameState.history[0].value;
                 return; 
             }
        }

        // FALLBACK: Merge Logic (Only for small scrapes < 10 items, e.g. top bar only)
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
            // console.log(`[Aviator Analyzer] 🆕 New Candles Detected: ${newItems.join(', ')}`);

            const newEntries: CandleData[] = newItems.map(v => ({ value: v, timestamp: now + Math.random() }));
            
            this.gameState.history = [...newEntries, ...currentHistory].slice(0, 60);
            this.gameState.lastCrash = this.gameState.history[0].value;
            
        } else if (matchIndex === -1) {
             // Lost sync?
             if (!isSame(scrapedValues[0], lastRecordedValue)) {
                   // console.log(`[Aviator Analyzer] New value (Sync Lost fallback): ${scrapedValues[0]}`);
                  const entry = { value: scrapedValues[0], timestamp: now };
                  this.gameState.history.unshift(entry);
                  this.gameState.lastCrash = entry.value;
                  if (this.gameState.history.length > 60) this.gameState.history.pop();
             }
        }
    }
  }

  /**
   * Helper para extrair histórico de um contexto (Document ou Element)
   * Modificado para retornar array de números apenas
   */
  private parseHistoryFromContext(context: Document | Element, targetArray: number[]) {
     const historySelectors = [
      // Dropdown expandido (histórico completo - até 60 velas)
      '.payouts-block .payout',
      'app-stats-dropdown .payouts-block .payout',
      
      // Histórico visível no topo (sempre presente - últimas 10-15 velas)
      '.payout.ng-star-inserted',
      'div.payout.ng-star-inserted',
      '.payouts-wrapper .payout',
      
      // Fallbacks genéricos
      '[apppayoutsmultiplier]',
      'div[_ngcontent*="rrh"] .payout',
      'app-payouts-item',
      '.payout-item',
      '.history-item',
      '.bubble-multiplier',
      '.multiplier',
      'div.payout',
      '.coefficient',
      '.payouts-item'
    ];

    for (const selector of historySelectors) {
      try {
        const items = Array.from(context.querySelectorAll(selector));
        
        if (items.length > 0) {
          let foundBefore = targetArray.length;
          items.forEach(item => {
            this.parseElementValue(item, targetArray);
          });
          
          if (targetArray.length > foundBefore) {
              // Log detalhado para entender qual seletor está pegando o quê
              console.log(`[Aviator Analyzer] Seletor '${selector}' encontrou ${targetArray.length - foundBefore} valores. Total: ${targetArray.length}`);
          }
          
          // Se já temos 60 ou mais, podemos parar (limite do array)
          if (targetArray.length >= 60) return;
        }
      } catch (e) {
        // Erro silencioso em seletores inválidos ou contextos protegidos
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
    
    // Regex melhorada para capturar números com vírgulas de milhar e decimais
    // Exemplos: 1.03x, 3,718.72x, 232.47x, 1.00x
    const matches = text.matchAll(/([\d.,]+)\s*x/gi);
    
    for (const match of matches) {
         const raw = match[1];
         
         // Normalizar: remover vírgulas de milhar, depois converter vírgula decimal em ponto
         // 3,718.72 -> 3718.72 (já tem ponto decimal, remover vírgulas)
         // 3,72 -> 3.72 (vírgula é decimal)
         // 1.03 -> 1.03 (já está correto)
         let normalized = raw;
         
         // Se tem ponto E vírgula, a vírgula é separador de milhar
         if (raw.includes('.') && raw.includes(',')) {
            normalized = raw.replace(/,/g, ''); // Remove todas as vírgulas
         } 
         // Se tem apenas vírgula, é separador decimal
         else if (raw.includes(',')) {
            normalized = raw.replace(',', '.'); // Substitui vírgula por ponto
         }
         // Se tem apenas ponto, já está no formato correto
         
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
