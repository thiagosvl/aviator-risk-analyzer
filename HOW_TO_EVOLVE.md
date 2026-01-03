# 🚀 Guia de Evolução: Aviator Risk Analyzer

Este guia detalha os próximos passos para evoluir o **Aviator Risk Analyzer**, transformando-o em uma ferramenta ainda mais poderosa e personalizada.

## 1. Adicionando Novas Estratégias e Padrões

O coração da extensão é o `patternService.ts`. É aqui que você pode adicionar sua inteligência e experiência para detectar novos padrões.

**Local do Arquivo:** `chrome-extension/src/content/services/patternService.ts`

**Como Adicionar um Novo Padrão:**

1.  **Abra o arquivo** `patternService.ts`.
2.  **Navegue até a função `analyzePatterns`**. Esta função recebe o array `candles` com o histórico de multiplicadores.
3.  **Implemente sua lógica**. Use `if`, `for`, `slice`, `every`, etc., para analisar o array `candles`.

    ```typescript
    // Exemplo: Detectar um padrão de "três velas vermelhas seguidas"
    if (candles.length >= 3) {
      const lastThree = candles.slice(-3);
      if (lastThree.every(c => c < 1.5)) {
        patterns.push({
          name: "Sequência de 3 Velas Vermelhas",
          description: "Três velas abaixo de 1.5x em sequência. Risco de crash baixo aumentando.",
          severity: "warning", // Pode ser 'info', 'warning', ou 'danger'
        });
      }
    }
    ```

4.  **Ajuste o Cálculo de Risco:** Na função `calculateRisk`, você pode usar os padrões detectados para influenciar o `riskLevel` e a `recommendation`.

    ```typescript
    // Exemplo: Aumentar o risco se o padrão de 3 velas vermelhas for detectado
    const hasThreeReds = patterns.some(p => p.name === "Sequência de 3 Velas Vermelhas");

    if (hasThreeReds) {
      riskScore += 20; // Aumenta a pontuação de risco
      messages.push("Atenção: Sequência de 3 velas baixas detectada.");
    }
    ```

## 2. Melhorando a Captura de Dados (DOM Analyzer)

O `domAnalyzer.ts` pode ser aprimorado para extrair mais informações da tela ou para se adaptar a diferentes layouts de sites de apostas.

**Local do Arquivo:** `chrome-extension/src/content/services/domAnalyzer.ts`

**Ideias de Melhoria:**

-   **Suporte a Novos Sites:** Adicione novos seletores de CSS na função `getGameHistory` para suportar outros sites de Aviator.
-   **Capturar Apostas de Outros Jogadores:** Você pode tentar capturar a lista de apostas de outros jogadores para analisar o comportamento do mercado.
-   **Detecção de Layout:** Crie uma lógica que detecta qual site está ativo e usa os seletores corretos para cada um.

## 3. Armazenamento de Dados e Histórico

Atualmente, a análise é feita apenas com as velas visíveis na tela. Para uma análise mais profunda, você pode armazenar um histórico de longo prazo.

**Como Implementar:**

1.  **Use `chrome.storage.local`:** No `useGameAnalysis.ts`, você pode usar a API de armazenamento do Chrome para salvar cada nova vela que aparece.

    ```typescript
    // Dentro de useGameAnalysis.ts

    useEffect(() => {
      const saveCandleHistory = async () => {
        if (gameState.history.length > 0) {
          const { candleHistory = [] } = await chrome.storage.local.get("candleHistory");
          const newHistory = [...candleHistory, ...gameState.history].slice(-1000); // Salva as últimas 1000 velas
          await chrome.storage.local.set({ candleHistory: newHistory });
        }
      };

      saveCandleHistory();
    }, [gameState.history]);
    ```

2.  **Carregue o Histórico:** Ao iniciar a análise, carregue o histórico salvo para ter uma base de dados maior.

## 4. Criando uma Interface de Configurações (Popup)

Você pode criar uma página de popup para permitir que o usuário configure a extensão.

**Local dos Arquivos:** `pages/popup/`

**Ideias para a Página de Popup:**

-   **Ativar/Desativar Padrões:** Permita que o usuário escolha quais padrões ele quer que sejam analisados.
-   **Ajustar Sensibilidade:** Crie um slider para o usuário ajustar a sensibilidade do cálculo de risco.
-   **Limpar Histórico:** Um botão para limpar o histórico de velas armazenado.

## 5. Modo de Desenvolvimento

Para fazer todas essas alterações de forma eficiente, use o modo de desenvolvimento:

1.  **Clone o repositório:** `git clone https://github.com/thiagosvl/aviator-risk-analyzer.git`
2.  **Instale as dependências:** `cd aviator-risk-analyzer && pnpm install`
3.  **Inicie o modo dev:** `pnpm dev`
4.  **Carregue a extensão no Chrome:** Vá para `chrome://extensions`, ative o "Modo do desenvolvedor", clique em "Carregar sem compactação" e selecione a pasta `dist`.

Agora, qualquer alteração que você salvar no código será refletida na extensão automaticamente, agilizando muito o desenvolvimento e os testes.
