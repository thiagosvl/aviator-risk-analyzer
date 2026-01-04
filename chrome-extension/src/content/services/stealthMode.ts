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
  private isIframe: boolean;

  constructor() {
    this.isIframe = window.self !== window.top;
    
    // Escutar mensagens de outros frames/background
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'TOGGLE_STEALTH') {
            if (message.state === true) {
                this.activate(false); // false = não propagar novamente
            } else {
                this.deactivate(false);
            }
        }
    });
  }

  /**
   * Ativa o modo discreto
   * @param propagate Se deve propagar a mensagem para outros frames (default: true)
   */
  public activate(propagate = true): void {
    if (this.isActive) return;

    console.log(`[StealthMode] Ativando... (Contexto: ${this.isIframe ? 'Iframe' : 'Principal'})`);

    if (this.isIframe) {
      this.injectIframeStyles();
    } else {
      this.injectMainPageStyles();
    }

    this.isActive = true;

    if (propagate) {
        chrome.runtime.sendMessage({ action: 'TOGGLE_STEALTH', state: true }).catch(() => {});
    }
  }

  /**
   * Desativa o modo discreto
   * @param propagate Se deve propagar a mensagem para outros frames (default: true)
   */
  public deactivate(propagate = true): void {
    if (!this.isActive) return;

    if (this.injectedStyles) {
      this.injectedStyles.remove();
      this.injectedStyles = null;
    }

    this.isActive = false;
    console.log('[StealthMode] Desativado.');

    if (propagate) {
        chrome.runtime.sendMessage({ action: 'TOGGLE_STEALTH', state: false }).catch(() => {});
    }
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
   * Injeta CSS na página principal (SorteNaBet)
   */
  private injectMainPageStyles(): void {
    if (this.injectedStyles) return;

    this.injectedStyles = document.createElement('style');
    this.injectedStyles.id = 'aviator-stealth-main';
    
    // CSS para SorteNaBet (Página Principal)
    this.injectedStyles.textContent = `
      /* Ocultar Logo e Cabeçalho */
      .l6oz0, 
      .divPageHeader, 
      .ntdfP,
      header,
      img[alt*="Sorte"],
      .brand {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        height: 0 !important;
        overflow: hidden !important;
      }

      /* Ocultar Barra de Navegação e Botões Superiores */
      nav,
      .nav,
      .navbar,
      .F2Y1D, /* Container de Ações (Depósito) */
      .btn-deposit,
      .btn-balance,
      button:has-text("Depositar"),
      a[href*="torneio"],
      a[href*="miss"] {
        display: none !important;
      }

      /* Ocultar Menu Lateral */
      #divSidebarMenu,
      .sidebar,
      aside {
        display: none !important;
      }

      /* Ocultar Rodapé/Barras Inferiores (Ganhos) */
      .Gy5Pq,
      footer,
      .footer {
        display: none !important;
      }

      /* Garantir que o Analyzer fique visível */
      #aviator-analyzer {
        z-index: 2147483647 !important; /* Max Z-Index */
        position: fixed !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
    `;

    document.head.appendChild(this.injectedStyles);
    console.log('[StealthMode] CSS Principal injetado.');
  }

  /**
   * Injeta CSS no Iframe do Jogo (Spribe/Aviator)
   * Executado apenas quando o script está rodando DENTRO do iframe.
   */
  private injectIframeStyles(): void {
    if (this.injectedStyles) return;

    this.injectedStyles = document.createElement('style');
    this.injectedStyles.id = 'aviator-stealth-iframe';

    // CSS para o Jogo (Aviator)
    this.injectedStyles.textContent = `
      /* Ocultar Logos Internos */
      .game-logo,
      .logo, 
      .brand, 
      img[src*="logo"],
      svg.logo {
        display: none !important;
        opacity: 0 !important;
      }

      /* Ocultar Cabeçalho do Jogo Completo */
      .main-header,
      .header-left,
      .game-header,
      .top-bar,
      .balance,
      .menu-burger,
      .provably-fair {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Ocultar Chat Inteiramente */
      .chat-container {
        display: none !important;
      }

      /* Ocultar CONTEÚDO da lista de apostas lateral (preservando layout) */
      .bets-block > *, 
      .bets-widget-container > *,
      app-bets-widget > * {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      .bets-block {
         background: transparent !important;
         border: none !important;
      }

      /* Discretizar APENAS o multiplicador central e aviso de voo */
      /* Usamos .stage-board para isolar o centro e evitamos o histórico (.result-history) */
      .stage-board .payout, 
      .stage-board .payout-counter, 
      .stage-board .f-headline,
      .stage-board .font-weight-bold.payout,
      .stage-board div[class*="payout"],
      .stage-board .payout-wrapper,
      .stage-board .flew-away,
      .stage-board [class*="multiplier-board"] {
        filter: grayscale(100%) !important;
        opacity: 0.5 !important;
        color: #fff !important;
        text-shadow: none !important;
      }

      /* Botões de Aposta MUDOS + Texto "EU VOU" */
      button.bet,
      .bet-button,
      .btn-success,
      [class*="bet-button"] {
        background: #344d5e !important; /* Muted Slate */
        border: 1px solid #2c3e50 !important;
        box-shadow: none !important;
        position: relative !important;
      }

      /* Esconder texto original "Aposta" e injetar "EU VOU" */
      [class*="bet-button"] .label,
      button.bet .label {
          font-size: 0 !important;
      }
      
      [class*="bet-button"] .label::before,
      button.bet .label::before {
          content: 'EU VOU' !important;
          font-size: 14px !important;
          font-weight: bold !important;
          color: #fff !important;
          display: block !important;
          visibility: visible !important;
      }

      /* Fundo Neutro */
      body, .main-container {
        background-color: #000 !important;
      }
    `;

    document.head.appendChild(this.injectedStyles);
    console.log('[StealthMode] CSS Iframe injetado.');
  }

  /**
   * Monitora/Reaplica (Opcional, pois CSS injetado geralmente persiste)
   */
  public startMonitoring(): void {
    // Monitoramento passivo se necessário (ex: SPA navigation removal)
  }
}

export const stealthMode = new StealthModeService();
