# 🔧 Solução: Overlay FORA do Iframe

**Problema:** Overlay está sendo injetado DENTRO do iframe do jogo, cobrindo parte da tela.

**Solução:** Usar `postMessage` para comunicação entre iframe e página principal.

---

## 🎯 Arquitetura da Solução

### Fluxo de Dados:

```
┌─────────────────────────────────────────────────────────┐
│  PÁGINA PRINCIPAL (sortenabet.bet.br)                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Content Script (index.tsx)                        │ │
│  │  - Detecta iframe do jogo                          │ │
│  │  - Cria overlay FORA do iframe                     │ │
│  │  - Escuta mensagens do iframe (postMessage)        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Overlay (AnalyzerOverlay.tsx)                     │ │
│  │  - Renderizado na página principal                 │ │
│  │  - Recebe dados via props/context                  │ │
│  │  - Exibe recomendações                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  IFRAME (jogo Aviator)                             │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  Content Script Iframe (iframeScript.tsx)    │  │ │
│  │  │  - Captura dados do DOM do jogo              │  │ │
│  │  │  - Analisa velas (domAnalyzer.ts)            │  │ │
│  │  │  - Envia dados para página principal         │  │ │
│  │  │    via window.parent.postMessage()           │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Implementação Passo a Passo

### Passo 1: Criar Script para Iframe

**Arquivo:** `chrome-extension/src/matches/iframe/iframeScript.tsx`

```typescript
/**
 * Content Script - Aviator Iframe Analyzer
 *
 * Este script roda DENTRO do iframe do jogo e captura dados do DOM.
 * Envia os dados para a página principal via postMessage.
 */

import { analyzeDom } from '@src/content/services/domAnalyzer';
import { analyzePatterns } from '@src/content/services/patternService';

console.log('[Aviator Iframe] Script carregado dentro do iframe!');

// Verificar se estamos DENTRO de um iframe
if (window.self === window.top) {
  console.log('[Aviator Iframe] Não estamos em um iframe. Ignorando.');
} else {
  console.log('[Aviator Iframe] Dentro do iframe. Iniciando captura...');

  // Função para capturar e enviar dados
  const captureAndSend = () => {
    try {
      // Capturar dados do DOM
      const gameData = analyzeDom();

      if (!gameData) {
        console.log('[Aviator Iframe] Nenhum dado capturado ainda.');
        return;
      }

      // Analisar padrões
      const analysis = analyzePatterns(gameData.history);

      // Preparar mensagem
      const message = {
        type: 'AVIATOR_DATA',
        source: 'aviator-iframe',
        data: {
          gameData,
          analysis,
          timestamp: Date.now(),
        },
      };

      // Enviar para página principal
      window.parent.postMessage(message, '*');

      console.log('[Aviator Iframe] Dados enviados:', message);
    } catch (error) {
      console.error('[Aviator Iframe] Erro ao capturar dados:', error);
    }
  };

  // Capturar dados a cada 2 segundos
  setInterval(captureAndSend, 2000);

  // Capturar imediatamente
  setTimeout(captureAndSend, 1000);
}
```

---

### Passo 2: Atualizar Script da Página Principal

**Arquivo:** `chrome-extension/src/matches/all/index.tsx`

```typescript
/**
 * Content Script - Aviator Risk Analyzer
 *
 * Este script roda na PÁGINA PRINCIPAL e exibe o overlay.
 * Recebe dados do iframe via postMessage.
 */

import { AnalyzerOverlay } from '@src/content/components/overlay/AnalyzerOverlay';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './index.css';

console.log('[Aviator Analyzer] Content script carregado!');

// Componente wrapper que gerencia o estado dos dados
const AnalyzerWrapper = () => {
  const [gameData, setGameData] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    // Escutar mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      // Validar origem (segurança)
      if (event.data?.type === 'AVIATOR_DATA' && event.data?.source === 'aviator-iframe') {
        console.log('[Aviator Analyzer] Dados recebidos do iframe:', event.data);

        setGameData(event.data.data.gameData);
        setAnalysis(event.data.data.analysis);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return <AnalyzerOverlay gameData={gameData} analysis={analysis} />;
};

const init = () => {
  try {
    // Verificar se já existe
    if (document.getElementById('aviator-analyzer-root')) {
      console.log('[Aviator Analyzer] Overlay já existe.');
      return;
    }

    // Criar container para o overlay FORA do iframe
    const appContainer = document.createElement('div');
    appContainer.id = 'aviator-analyzer-root';
    appContainer.style.cssText =
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';

    document.body.appendChild(appContainer);

    // Renderizar o overlay
    const root = createRoot(appContainer);
    root.render(<AnalyzerWrapper />);

    console.log('[Aviator Analyzer] Overlay renderizado FORA do iframe!');
  } catch (error) {
    console.error('[Aviator Analyzer] Erro ao inicializar:', error);
  }
};

const checkAndInit = () => {
  // NÃO rodar se estivermos dentro de um iframe
  if (window.self !== window.top) {
    console.log('[Aviator Analyzer] Dentro de iframe. Não inicializando overlay aqui.');
    return;
  }

  // Verificar se é a página do Aviator
  const url = window.location.href.toLowerCase();
  const isAviatorPage = url.includes('aviator') || url.includes('spribe');

  if (!isAviatorPage) {
    console.log('[Aviator Analyzer] Não é a página do Aviator. Ignorando.');
    return;
  }

  // Verificar se o iframe do jogo está presente
  const hasGameIframe =
    document.querySelector('iframe[src*="aviator"]') ||
    document.querySelector('iframe[src*="spribe"]') ||
    document.querySelector('iframe[src*="game"]');

  if (hasGameIframe) {
    console.log('[Aviator Analyzer] Iframe do jogo detectado! Inicializando overlay...');
    init();
  } else {
    // Tentar novamente
    console.log('[Aviator Analyzer] Aguardando carregamento do jogo...');
    setTimeout(() => {
      const hasGameIframeRetry =
        document.querySelector('iframe[src*="aviator"]') ||
        document.querySelector('iframe[src*="spribe"]') ||
        document.querySelector('iframe[src*="game"]');

      if (hasGameIframeRetry) {
        console.log('[Aviator Analyzer] Iframe detectado! Inicializando...');
        init();
      } else {
        console.log('[Aviator Analyzer] Iframe não encontrado.');
      }
    }, 3000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}
```

---

### Passo 3: Atualizar AnalyzerOverlay para Receber Props

**Arquivo:** `chrome-extension/src/content/components/overlay/AnalyzerOverlay.tsx`

```typescript
import { useState, useEffect } from 'react';
import type { GameData, PatternAnalysis } from '@src/content/types';

interface AnalyzerOverlayProps {
  gameData: GameData | null;
  analysis: PatternAnalysis | null;
}

export const AnalyzerOverlay = ({ gameData, analysis }: AnalyzerOverlayProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Se não há dados ainda, mostrar "Aguardando dados..."
  if (!gameData || !analysis) {
    return (
      <div className="aviator-overlay">
        <div className="card-principal">
          <div className="header">
            <h3>🎯 Aviator Analyzer</h3>
          </div>
          <div className="loading">
            <p>Aguardando dados do jogo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar overlay com dados
  return (
    <div className="aviator-overlay">
      {/* Card Principal */}
      <div className={`card-principal ${isMinimized ? 'minimized' : ''}`}>
        {/* ... resto do código ... */}
      </div>

      {/* Card Secundário (se expandido) */}
      {isExpanded && (
        <div className="card-secundario">
          {/* ... detalhes ... */}
        </div>
      )}
    </div>
  );
};
```

---

### Passo 4: Configurar Manifest para Injetar em Ambos os Contextos

**Arquivo:** `chrome-extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Aviator Risk Analyzer",
  "version": "1.0.0",
  "content_scripts": [
    {
      "matches": ["*://*.sortenabet.bet.br/*", "*://*.aviator.com/*"],
      "js": ["src/matches/all/index.tsx"],
      "css": ["src/matches/all/index.css"],
      "run_at": "document_end",
      "all_frames": false
    },
    {
      "matches": ["*://*.spribe.co/*", "*://*/game/aviator*"],
      "js": ["src/matches/iframe/iframeScript.tsx"],
      "run_at": "document_end",
      "all_frames": true
    }
  ]
}
```

---

## 🔒 Segurança

### Validação de Mensagens:

```typescript
const handleMessage = (event: MessageEvent) => {
  // 1. Verificar tipo e source
  if (event.data?.type !== 'AVIATOR_DATA' || event.data?.source !== 'aviator-iframe') {
    return; // Ignorar mensagens de outras fontes
  }

  // 2. Validar estrutura dos dados
  if (!event.data?.data?.gameData || !event.data?.data?.analysis) {
    console.warn('[Aviator Analyzer] Dados inválidos recebidos');
    return;
  }

  // 3. Validar timestamp (evitar mensagens antigas)
  const now = Date.now();
  const messageTime = event.data.data.timestamp;
  if (now - messageTime > 10000) {
    // Mais de 10 segundos
    console.warn('[Aviator Analyzer] Mensagem muito antiga, ignorando');
    return;
  }

  // 4. Processar dados
  setGameData(event.data.data.gameData);
  setAnalysis(event.data.data.analysis);
};
```

---

## 🎯 Vantagens da Solução

### ✅ Overlay FORA do Iframe:
- Não cobre o jogo
- Sempre visível
- Não afetado por atualizações do jogo

### ✅ Comunicação Segura:
- postMessage é API padrão do navegador
- Validação de origem e estrutura
- Não depende de DOM compartilhado

### ✅ Separação de Responsabilidades:
- Iframe: Captura dados
- Página principal: Exibe overlay
- Fácil de manter e debugar

### ✅ Performance:
- Captura a cada 2 segundos (configurável)
- Não bloqueia renderização
- Dados são enviados apenas quando mudam

---

## 🐛 Troubleshooting

### Problema: Overlay não aparece

**Solução:**
1. Verificar se script está rodando na página principal:
   ```javascript
   console.log('window.self === window.top:', window.self === window.top);
   ```

2. Verificar se iframe foi detectado:
   ```javascript
   const iframe = document.querySelector('iframe[src*="aviator"]');
   console.log('Iframe encontrado:', iframe);
   ```

3. Verificar se container foi criado:
   ```javascript
   const container = document.getElementById('aviator-analyzer-root');
   console.log('Container criado:', container);
   ```

---

### Problema: Dados não chegam do iframe

**Solução:**
1. Verificar se script está rodando no iframe:
   ```javascript
   console.log('Dentro de iframe:', window.self !== window.top);
   ```

2. Verificar se postMessage está sendo chamado:
   ```javascript
   console.log('Enviando mensagem:', message);
   window.parent.postMessage(message, '*');
   ```

3. Verificar se listener está ativo na página principal:
   ```javascript
   window.addEventListener('message', (event) => {
     console.log('Mensagem recebida:', event.data);
   });
   ```

---

### Problema: CORS ou Same-Origin Policy

**Solução:**
- postMessage funciona MESMO com origens diferentes
- Não há problema de CORS com postMessage
- Se ainda assim houver erro, verificar permissões no manifest.json

---

## 🚀 Próximos Passos

1. ✅ Criar `iframeScript.tsx`
2. ✅ Atualizar `index.tsx` com listener
3. ✅ Atualizar `AnalyzerOverlay.tsx` para receber props
4. ✅ Configurar `manifest.json`
5. ✅ Testar comunicação
6. ✅ Ajustar posicionamento do overlay (canto superior direito)

---

**Documento completo. Pronto para implementação! 🔧**
