/**
 * Stealth Mode Service - Modo Discreto
 * 
 * Oculta elementos que identificam o jogo como Aviator/casa de apostas
 * para uso discreto da ferramenta de análise.
 * 
 * Funcionalidades:
 * - Oculta logo e botões da casa de apostas (fora do iframe)
 * - Injeta CSS no iframe para ocultar/modificar elementos do jogo
 * - Remove "UFC AVIATOR", logos, reduz multiplicador, etc.
 */

export class StealthModeService {
  private isActive: boolean = false;
  private injectedStyles: HTMLStyleElement | null = null;
  private iframeStyleElement: HTMLStyleElement | null = null;
  private hiddenElements: HTMLElement[] = [];

  /**
   * Ativa o modo discreto
   */
  public activate(): void {
    if (this.isActive) return;

    console.log('[StealthMode] Ativando modo discreto...');

    // 1. Ocultar elementos externos (fora do iframe)
    this.hideExternalElements();

    // 2. Injetar CSS no iframe
    this.injectIframeStyles();

    this.isActive = true;
    console.log('[StealthMode] Modo discreto ativado ✅');
  }

  /**
   * Desativa o modo discreto
   */
  public deactivate(): void {
    if (!this.isActive) return;

    console.log('[StealthMode] Desativando modo discreto...');

    // 1. Restaurar elementos externos
    this.restoreExternalElements();

    // 2. Remover CSS do iframe
    this.removeIframeStyles();

    this.isActive = false;
    console.log('[StealthMode] Modo discreto desativado ✅');
  }

  /**
   * Alterna o modo discreto
   */
  public toggle(): boolean {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return this.isActive;
  }

  /**
   * Retorna se o modo está ativo
   */
  public isEnabled(): boolean {
    return this.isActive;
  }

  /**
   * Oculta elementos externos (fora do iframe)
   */
  private hideExternalElements(): void {

    // Injetar CSS para ocultar
    if (!this.injectedStyles) {
      this.injectedStyles = document.createElement('style');
      this.injectedStyles.id = 'aviator-stealth-mode';
      document.head.appendChild(this.injectedStyles);
    }

    // CSS mais agressivo
    this.injectedStyles.textContent = `
      /* Ocultar logo */
      img[alt*="Sorte"],
      img[alt*="sorte"],
      [class*="logo"]:not(#aviator-analyzer *) {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      /* Ocultar botões de ação */
      button:has-text("Depositar"),
      button:has-text("DEPOSITAR"),
      [href*="deposit"],
      [href*="deposito"] {
        display: none !important;
      }

      /* Ocultar menu superior */
      [class*="header-buttons"],
      [class*="top-menu"],
      [class*="nav-buttons"] {
        opacity: 0.3 !important;
        filter: blur(8px) !important;
      }

      /* Ocultar sidebar */
      [class*="sidebar"]:not(#aviator-analyzer *),
      [class*="menu-lateral"],
      nav[class*="side"]:not(#aviator-analyzer *) {
        opacity: 0.1 !important;
        filter: blur(10px) !important;
      }

      /* Ocultar footer */
      footer:not(#aviator-analyzer *),
      [class*="footer"]:not(#aviator-analyzer *) {
        display: none !important;
      }

      /* Destacar apenas o analyzer */
      #aviator-analyzer {
        z-index: 999999 !important;
        position: relative !important;
      }
    `;

    console.log('[StealthMode] Elementos externos ocultados');
  }

  /**
   * Restaura elementos externos
   */
  private restoreExternalElements(): void {
    if (this.injectedStyles) {
      this.injectedStyles.remove();
      this.injectedStyles = null;
    }

    this.hiddenElements.forEach(el => {
      el.style.display = '';
      el.style.visibility = '';
      el.style.opacity = '';
    });
    this.hiddenElements = [];

    console.log('[StealthMode] Elementos externos restaurados');
  }

  /**
   * Injeta CSS no iframe do jogo
   */
  private injectIframeStyles(): void {
    const iframe = this.findGameIframe();
    if (!iframe) {
      console.warn('[StealthMode] Iframe do jogo não encontrado');
      return;
    }

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.warn('[StealthMode] Sem acesso ao contentDocument do iframe');
        return;
      }

      // Criar elemento de estilo
      this.iframeStyleElement = iframeDoc.createElement('style');
      this.iframeStyleElement.id = 'aviator-stealth-iframe';
      
      // CSS para ocultar/modificar elementos do jogo
      this.iframeStyleElement.textContent = `
        /* Ocultar logo UFC AVIATOR */
        img[src*="ufc"],
        img[src*="UFC"],
        img[alt*="UFC"],
        [class*="ufc"],
        [class*="UFC"] {
          display: none !important;
        }

        /* Ocultar logo Aviator */
        img[src*="aviator"],
        img[src*="Aviator"],
        img[alt*="Aviator"],
        [class*="aviator-logo"],
        svg[class*="logo"] {
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Ocultar texto "OFFICIAL PARTNERS" */
        *:has-text("OFFICIAL PARTNERS"),
        *:has-text("Official Partners") {
          display: none !important;
        }

        /* Reduzir tamanho do multiplicador (menos chamativo) */
        [class*="multiplier"],
        [class*="coefficient"],
        [class*="odds"] {
          font-size: 0.6em !important;
          opacity: 0.7 !important;
        }

        /* Ocultar logo Spribe */
        img[src*="spribe"],
        img[alt*="Spribe"],
        [class*="spribe"] {
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Modificar cores dos botões (menos chamativo) */
        button[class*="bet"],
        button[class*="aposta"] {
          background: #2a2a2a !important;
          color: #888 !important;
          border: 1px solid #444 !important;
        }

        /* Ocultar lista de apostadores */
        [class*="players-list"],
        [class*="bets-list"],
        [class*="apostas"] {
          opacity: 0.3 !important;
          filter: blur(5px) !important;
        }

        /* Ocultar histórico de apostas (dentro do jogo) */
        [class*="bet-history"],
        [class*="history-panel"] {
          opacity: 0.5 !important;
        }

        /* Reduzir destaque do avião */
        canvas,
        [class*="game-canvas"],
        [class*="plane"] {
          opacity: 0.8 !important;
          filter: grayscale(30%) !important;
        }

        /* Ocultar texto "Aviator" no rodapé */
        footer *:has-text("Aviator"),
        [class*="footer"] *:has-text("Aviator") {
          display: none !important;
        }

        /* Modo discreto geral: tons mais neutros */
        body {
          filter: saturate(0.7) !important;
        }
      `;

      iframeDoc.head.appendChild(this.iframeStyleElement);
      console.log('[StealthMode] CSS injetado no iframe ✅');

    } catch (error) {
      console.error('[StealthMode] Erro ao injetar CSS no iframe:', error);
    }
  }

  /**
   * Remove CSS do iframe
   */
  private removeIframeStyles(): void {
    if (!this.iframeStyleElement) return;

    try {
      this.iframeStyleElement.remove();
      this.iframeStyleElement = null;
      console.log('[StealthMode] CSS removido do iframe');
    } catch (error) {
      console.error('[StealthMode] Erro ao remover CSS do iframe:', error);
    }
  }

  /**
   * Encontra o iframe do jogo
   */
  private findGameIframe(): HTMLIFrameElement | null {
    const selectors = [
      'iframe[src*="aviator"]',
      'iframe[src*="spribe"]',
      'iframe[src*="game"]',
      'iframe[id*="game"]',
      'iframe[class*="game"]',
    ];

    for (const selector of selectors) {
      const iframe = document.querySelector(selector) as HTMLIFrameElement;
      if (iframe) return iframe;
    }

    // Fallback: pegar primeiro iframe
    return document.querySelector('iframe');
  }

  /**
   * Monitora mudanças no DOM para re-aplicar estilos
   */
  public startMonitoring(): void {
    if (this.isActive) {
      // Re-aplicar a cada 5 segundos (caso o jogo recarregue)
      setInterval(() => {
        if (this.isActive) {
          this.injectIframeStyles();
        }
      }, 5000);
    }
  }
}

export const stealthMode = new StealthModeService();
