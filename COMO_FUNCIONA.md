# 🧠 Como Funciona o Aviator Risk Analyzer

Este documento explica em detalhes técnicos como a extensão funciona, desde a injeção na página até a análise de padrões.

## 1. Como o Overlay Aparece Sobre a Tela do Jogo?

A extensão utiliza um **Content Script** para injetar código JavaScript diretamente na página do jogo. Este processo é controlado pelo arquivo `manifest.json`.

### Fluxo de Injeção:

1.  **Manifest.json:** O arquivo `dist/manifest.json` contém uma seção chamada `content_scripts`. Esta seção define:
    -   **`matches`:** Uma lista de URLs onde o script deve ser injetado (ex: `*://*.bet365.com/*`, `*://*.betano.com/*`, etc.).
    -   **`js`:** O arquivo JavaScript que será injetado (`content/all.iife.js`).

    ```json
    "content_scripts": [
      {
        "matches": [
          "*://*.bet365.com/*",
          "*://*.betano.com/*",
          // ... outros sites
        ],
        "js": ["content/all.iife.js"]
      }
    ]
    ```

2.  **Content Script (`content/all.iife.js`):** Quando você abre uma das páginas listadas em `matches`, o Chrome automaticamente executa o arquivo `content/all.iife.js`. Este arquivo é o resultado da compilação do código React que está em `chrome-extension/src/matches/all/index.tsx`.

3.  **Criação do Container:** O `index.tsx` cria uma `<div>` com o ID `aviator-analyzer-root` e a adiciona ao `document.body` da página. Esta `<div>` tem estilos CSS que a fazem flutuar sobre todo o conteúdo da página:

    ```javascript
    appContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999;';
    ```

    -   **`position: fixed`:** Faz com que a `<div>` fique fixa na tela, independentemente da rolagem.
    -   **`z-index: 999999`:** Garante que a `<div>` fique acima de todos os outros elementos da página.
    -   **`pointer-events: none`:** Faz com que cliques "atravessem" a `<div>` e cheguem aos elementos abaixo dela. Isso é importante para que você possa continuar interagindo com o jogo normalmente.

4.  **Renderização do React:** Dentro dessa `<div>`, o React renderiza o componente `AnalyzerOverlay.tsx`, que é a interface visual que você vê.

## 2. Como os Dados do Jogo São Capturados?

A extensão não tem acesso direto aos dados internos do jogo. Em vez disso, ela "lê" a tela do jogo, analisando o HTML (DOM - Document Object Model) da página.

### Serviço de Análise do DOM (`domAnalyzer.ts`):

O arquivo `chrome-extension/src/content/services/domAnalyzer.ts` contém as funções responsáveis por extrair informações da página.

**Funções Principais:**

-   **`getGameHistory()`:** Esta função usa `document.querySelectorAll()` para encontrar os elementos HTML que exibem o histórico de velas (multiplicadores). Ela procura por padrões comuns de HTML usados pelos sites de Aviator.

    ```typescript
    // Exemplo simplificado
    const historyElements = document.querySelectorAll('.history-item'); // Seletor de exemplo
    const candles = Array.from(historyElements).map(el => {
      const text = el.textContent;
      return parseFloat(text.replace('x', ''));
    });
    ```

    **Nota:** Os seletores CSS (`'.history-item'`) variam de site para site. O `domAnalyzer.ts` precisa ser atualizado para suportar cada site específico.

-   **`getCurrentMultiplier()`:** Extrai o multiplicador atual do jogo (o número que está crescendo durante o voo do avião).

-   **`isGameFlying()`:** Detecta se o jogo está em andamento (avião voando) ou aguardando a próxima rodada.

### Monitoramento Contínuo (`MutationObserver`):

Para detectar mudanças em tempo real na página (como uma nova vela aparecendo no histórico), o `useGameAnalysis.ts` utiliza um `MutationObserver`. Este é um recurso nativo do JavaScript que "observa" mudanças no DOM.

```typescript
const observer = new MutationObserver(() => {
  // Quando o DOM muda, chama as funções do domAnalyzer novamente
  const newHistory = getGameHistory();
  // ... atualiza o estado
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

## 3. Como os Padrões São Analisados?

Depois que os dados são capturados, eles são enviados para o `patternService.ts`, que aplica a lógica de análise.

### Serviço de Padrões (`patternService.ts`):

**Função `analyzePatterns(candles)`:**

Esta função recebe o array de velas (multiplicadores) e aplica uma série de regras para detectar padrões. Exemplos de padrões implementados:

-   **Sequência de Velas Baixas:** Verifica se há muitas velas com multiplicador abaixo de 1.5x em sequência.
-   **Vela de Correção:** Procura por uma vela alta (ex: > 5x) após uma sequência de velas baixas.
-   **Alternância:** Detecta se há um padrão de alternância entre velas altas e baixas.

**Função `calculateRisk(candles, patterns)`:**

Com base nos padrões detectados, esta função calcula:

-   **`riskLevel`:** Um nível de risco categórico (BAIXO, MEDIO, ALTO, MUITO_ALTO).
-   **`confidence`:** Um percentual de confiança na análise (0-100%).
-   **`recommendation`:** Uma mensagem de texto com a recomendação para o usuário.

**Exemplo de Cálculo:**

```typescript
let riskScore = 0;

// Se há muitas velas baixas, aumenta o risco
if (lowCandlesCount > 5) {
  riskScore += 30;
}

// Se há uma vela de correção, diminui o risco
if (hasHighCandle) {
  riskScore -= 20;
}

// Converte a pontuação em um nível de risco
if (riskScore < 25) {
  riskLevel = "BAIXO";
} else if (riskScore < 50) {
  riskLevel = "MEDIO";
} // ... e assim por diante
```

## 4. Como os Dados São Armazenados?

A extensão utiliza a API `chrome.storage.local` para armazenar dados de forma persistente no navegador.

**Uso Atual:**

-   **Configurações do Usuário:** Armazena se o overlay está minimizado, se a extensão está ativa, etc.

**Uso Futuro (Sugestão):**

-   **Histórico de Velas:** Armazenar um histórico de longo prazo (ex: últimas 1000 velas) para análises mais profundas.
-   **Estratégias Personalizadas:** Permitir que o usuário salve suas próprias estratégias e padrões.

**Exemplo de Código:**

```typescript
// Salvar dados
await chrome.storage.local.set({ candleHistory: [1.2, 2.5, 1.1, 3.0] });

// Carregar dados
const { candleHistory } = await chrome.storage.local.get("candleHistory");
console.log(candleHistory); // [1.2, 2.5, 1.1, 3.0]
```

**Privacidade:** Todos os dados ficam armazenados **apenas na sua máquina**. Nenhuma informação é enviada para servidores externos.

## 5. Arquitetura do Projeto

O projeto segue uma arquitetura modular e escalável:

-   **`chrome-extension/src/matches/all/`**: Ponto de entrada do Content Script.
-   **`chrome-extension/src/content/`**: Contém toda a lógica da aplicação React.
    -   **`services/`**: Lógica de negócio (análise de DOM, padrões).
    -   **`components/`**: Componentes visuais (UI).
    -   **`hooks/`**: Hooks React para gerenciar estado e efeitos colaterais.
    -   **`types/`**: Definições de tipos TypeScript.
-   **`dist/`**: Pasta com a extensão compilada, pronta para ser carregada no Chrome.

Esta estrutura facilita a manutenção e a adição de novas funcionalidades.
