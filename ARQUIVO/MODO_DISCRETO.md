# 🕶️ MODO DISCRETO (STEALTH MODE)

**Versão:** 1.0  
**Data:** 04/01/2026

---

## 📋 OBJETIVO

Permitir o uso da ferramenta de análise **sem chamar atenção** de que você está jogando Aviator ou usando uma casa de apostas.

**Cenário:** Você está analisando o jogo em público (trabalho, biblioteca, etc.) e não quer que outras pessoas percebam o que está fazendo.

---

## 🎯 O QUE O MODO DISCRETO FAZ?

### 1. ✅ Fora do Iframe (Página da Casa de Apostas):

- **Oculta/desfoca logos** da casa de apostas (SorteBet, etc.)
- **Oculta botões** de depósito, torneios, missões
- **Desfoca menu lateral** (Fortune Tiger, Mines, etc.)
- **Oculta footer** com informações de ganhos
- **Reduz opacidade** de elementos secundários

**Resultado:** Página parece um dashboard genérico, não uma casa de apostas.

---

### 2. ✅ Dentro do Iframe (Jogo Aviator):

- **Remove logo "UFC AVIATOR"** e "OFFICIAL PARTNERS"
- **Oculta logo do Aviator** (texto e imagem)
- **Reduz tamanho do multiplicador** (60% menor, menos chamativo)
- **Oculta logo Spribe** (desenvolvedor)
- **Modifica cores dos botões** (tons neutros ao invés de verde vibrante)
- **Desfoca lista de apostadores** (menos óbvio que é jogo)
- **Aplica filtro grayscale** (reduz saturação de cores)

**Resultado:** Jogo parece um gráfico técnico ou simulador, não um jogo de apostas.

---

## 🎮 COMO USAR?

### Ativação:

1. Abra a ferramenta Aviator Analyzer
2. Clique no botão **"👁️ Discreto OFF"**
3. O botão muda para **"🕶️ Discreto ON"** (roxo)
4. Elementos são ocultados/modificados automaticamente

### Desativação:

1. Clique novamente no botão **"🕶️ Discreto ON"**
2. O botão volta para **"👁️ Discreto OFF"** (cinza)
3. Elementos são restaurados ao normal

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### Arquivos Criados:

1. **`stealthMode.ts`** - Serviço principal
   - Gerencia ativação/desativação
   - Injeta CSS no iframe
   - Oculta elementos externos

2. **`AnalyzerOverlay.tsx`** - Toggle no UI
   - Botão de ativação
   - Estado persistente
   - Feedback visual

---

### Como Funciona:

#### 1. Elementos Externos (Fora do Iframe):

```typescript
// Injeta CSS na página principal
const style = document.createElement('style');
style.textContent = `
  img[alt*="Sorte"] {
    opacity: 0 !important;
  }
  [class*="sidebar"] {
    filter: blur(10px) !important;
  }
  // ... etc
`;
document.head.appendChild(style);
```

**Vantagem:** Não modifica DOM, apenas aplica CSS (reversível).

---

#### 2. Elementos do Iframe (Jogo):

```typescript
// Acessa iframe e injeta CSS
const iframe = document.querySelector('iframe[src*="aviator"]');
const iframeDoc = iframe.contentDocument;

const style = iframeDoc.createElement('style');
style.textContent = `
  img[src*="ufc"] {
    display: none !important;
  }
  [class*="multiplier"] {
    font-size: 0.6em !important;
  }
  // ... etc
`;
iframeDoc.head.appendChild(style);
```

**Desafio:** Acesso ao `contentDocument` do iframe pode ser bloqueado por CORS.

**Solução:** Funciona se o iframe estiver no mesmo domínio ou permitir acesso.

---

## ⚠️ LIMITAÇÕES

### 1. Acesso ao Iframe:

**Problema:** Se o iframe do jogo estiver em domínio diferente (CORS), não conseguimos injetar CSS dentro dele.

**Impacto:** 
- ✅ Elementos externos (fora do iframe) funcionam 100%
- ❌ Elementos internos (dentro do iframe) podem não funcionar

**Solução Alternativa:**
- Usar extensão do Chrome para injetar CSS via `content_scripts`
- Adicionar permissões no `manifest.json`

---

### 2. Re-aplicação:

**Problema:** Se o jogo recarregar o iframe, o CSS injetado é perdido.

**Solução:** Monitoramento a cada 5 segundos para re-injetar CSS.

```typescript
setInterval(() => {
  if (isActive) {
    this.injectIframeStyles();
  }
}, 5000);
```

---

### 3. Detecção:

**Problema:** Casa de apostas pode detectar modificações no DOM/CSS.

**Impacto:** Baixo (apenas CSS, não altera funcionalidade).

**Mitigação:** Modo discreto é opcional e reversível.

---

## 📊 ANTES vs DEPOIS

### Antes (Modo Normal):

| Elemento | Visibilidade |
|----------|--------------|
| Logo SorteBet | ✅ Visível |
| Botão "Depositar" | ✅ Visível |
| Logo UFC AVIATOR | ✅ Visível |
| Multiplicador | ✅ Grande (100%) |
| Botões verdes | ✅ Vibrantes |
| Lista de apostadores | ✅ Visível |

**Impressão:** "Está jogando Aviator" 🎰

---

### Depois (Modo Discreto):

| Elemento | Visibilidade |
|----------|--------------|
| Logo SorteBet | ❌ Oculto |
| Botão "Depositar" | ❌ Oculto |
| Logo UFC AVIATOR | ❌ Oculto |
| Multiplicador | ⚠️ Pequeno (60%) |
| Botões verdes | ⚠️ Neutros (cinza) |
| Lista de apostadores | ⚠️ Desfocada |

**Impressão:** "Está analisando gráficos" 📊

---

## 🎯 CASOS DE USO

### 1. Trabalho/Escritório:

**Cenário:** Analisando padrões durante intervalo, mas não quer que colegas vejam.

**Solução:** Ativa modo discreto → Parece dashboard de análise técnica.

---

### 2. Biblioteca/Espaço Público:

**Cenário:** Estudando estratégias, mas tela está visível para outros.

**Solução:** Ativa modo discreto → Reduz elementos chamativos.

---

### 3. Compartilhamento de Tela:

**Cenário:** Mostrando análise para amigo, mas não quer expor casa de apostas.

**Solução:** Ativa modo discreto → Foca na análise, não no jogo.

---

## 🔮 MELHORIAS FUTURAS

### 1. ⭐ Níveis de Discrição:

**Ideia:** 3 níveis de intensidade

- **Nível 1 (Leve):** Apenas oculta logos
- **Nível 2 (Médio):** Oculta logos + desfoca elementos
- **Nível 3 (Máximo):** Tudo acima + grayscale + reduz multiplicador

---

### 2. ⭐ Atalho de Teclado:

**Ideia:** Pressionar `Ctrl + Shift + D` para ativar/desativar rapidamente.

**Benefício:** Ativação instantânea quando alguém se aproxima.

---

### 3. ⭐ Modo "Pânico":

**Ideia:** Botão de pânico que:
1. Ativa modo discreto
2. Minimiza analyzer
3. Abre aba falsa (ex: Google Docs)

**Benefício:** Proteção máxima em emergências.

---

### 4. ⭐ Personalização:

**Ideia:** Usuário escolhe o que ocultar:
- ☑️ Logos
- ☑️ Multiplicador
- ☑️ Lista de apostadores
- ☑️ Botões de depósito

**Benefício:** Flexibilidade para diferentes cenários.

---

### 5. ⭐ Tema "Trabalho":

**Ideia:** Modo discreto + tema que parece planilha/dashboard corporativo.

**Elementos:**
- Cores neutras (azul/cinza)
- Fonte corporativa (Arial, Roboto)
- Gráficos de linha ao invés de avião
- Terminologia técnica ("Coeficiente" ao invés de "Multiplicador")

**Benefício:** Passa por ferramenta de trabalho legítima.

---

## 🚀 PRÓXIMOS PASSOS

### 1. Testar em Produção:

**Objetivo:** Validar se CSS é aplicado corretamente no iframe.

**Teste:**
1. Abrir jogo Aviator
2. Ativar modo discreto
3. Verificar se elementos são ocultados

**Resultado esperado:**
- ✅ Elementos externos ocultados
- ⚠️ Elementos do iframe (depende de CORS)

---

### 2. Adicionar Permissões (se necessário):

**Se iframe bloquear acesso:**

```json
// manifest.json
{
  "content_scripts": [
    {
      "matches": ["*://*.spribe.co/*", "*://aviator.game/*"],
      "css": ["stealth-iframe.css"],
      "all_frames": true
    }
  ]
}
```

**Arquivo `stealth-iframe.css`:**
```css
img[src*="ufc"] {
  display: none !important;
}
/* ... resto do CSS ... */
```

---

### 3. Feedback do Usuário:

**Perguntas:**
1. O modo discreto funciona no seu navegador?
2. Quais elementos ainda são identificáveis?
3. Você usaria níveis de discrição?
4. Atalho de teclado seria útil?

---

## 📝 CONCLUSÃO

### ✅ Implementado:

1. Serviço `StealthModeService` ✅
2. Toggle no UI ✅
3. Ocultamento de elementos externos ✅
4. Injeção de CSS no iframe ✅
5. Monitoramento e re-aplicação ✅

### ⏳ Pendente:

1. Testes em produção
2. Validação de acesso ao iframe
3. Ajustes finos de CSS
4. Melhorias futuras (níveis, atalhos, etc.)

---

**Status:** ✅ Pronto para testar!

**Próximo passo:** Compilar extensão e testar no jogo real.

---

## 🎓 LIÇÕES APRENDIDAS

### 1. CSS Injection é Poderoso:

**Vantagem:** Modificações reversíveis sem alterar DOM.

**Desvantagem:** Pode ser bloqueado por CORS.

---

### 2. Modo Discreto ≠ Anonimato:

**Importante:** Modo discreto apenas **oculta elementos visuais**.

**NÃO protege contra:**
- Detecção pela casa de apostas (logs, cookies, etc.)
- Histórico do navegador
- Monitoramento de rede

**Objetivo:** Apenas discrição visual, não segurança.

---

### 3. UX Importa:

**Feedback visual:** Botão muda de cor quando ativo (roxo).

**Tooltip:** Explica o que o modo faz.

**Reversível:** Um clique para ativar/desativar.

---

**Tudo pronto! Basta testar e ajustar conforme necessário! 🚀**
