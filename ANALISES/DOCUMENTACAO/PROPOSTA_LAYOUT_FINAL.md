# 🎨 Proposta de Layout Final - Aviator Analyzer

**Objetivo:** Criar overlay FORA do iframe, com informações relevantes, limpo e focado em decisões.

---

## 📊 Análise do Layout Atual (Imagem Anexa)

### ✅ O que está BOM:

1. **Dois cards separados** (Aviator Analyzer + Análise Detalhada)
2. **Recomendação em destaque** ("NÃO JOGUE" em vermelho)
3. **Status e Último Crash** visíveis
4. **Padrões detectados** com descrição

### ❌ O que precisa MELHORAR:

1. **Informações irrelevantes:**
   - "Histórico: 60 velas" (usuário não precisa saber)
   - "Volatilidade: 12.91" (sem contexto, confuso)
   - "Últimas 5 Velas" (valores soltos, sem significado claro)

2. **Falta de contexto:**
   - Por que "NÃO JOGUE"? (motivo não está claro)
   - O que significa "Confiança: 50%"? (dos padrões)
   - Risco "CRITICAL" - mas por quê?

3. **Overlay DENTRO do iframe:**
   - Cobre parte do jogo
   - Dificulta visualização

4. **Padrões confusos:**
   - "3 velas baixas (< 1.5x) nas últimas 5 rodadas"
   - "Alta volatilidade detectada (σ = 12.91)"
   - "50% das últimas 20 velas são baixas"
   - **Usuário não entende o que fazer com isso**

---

## 🎯 Proposta de Layout NOVO

### Estrutura Geral:

```
┌─────────────────────────────────────────────────────┐
│  🎯 Aviator Analyzer                    [−] [×]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  🔴 VOO  │  Último: 1.38x  │  Banca: R$ 1.000 │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           ❌ NÃO JOGUE                        │  │
│  │                                               │  │
│  │  Motivo: Pós-Rosa vela 2/3 (Trava)           │  │
│  │  Risco: 🔴 CRITICAL                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  📊 Análise                                   │  │
│  │                                               │  │
│  │  Densidade: 🟡 MÉDIA (4/10 roxas)             │  │
│  │  Última Rosa: 8 velas atrás                   │  │
│  │  Taxa de Conversão: 65%                       │  │
│  │                                               │  │
│  │  🌸 Próximo Padrão Rosa:                      │  │
│  │  💎 Intervalo 8 (±1) - Conf 90%               │  │
│  │  Faltam: 0 velas (ALERTA!)                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  [Expandir Detalhes ▼]                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Especificação Detalhada

### 🎯 Card Principal (Sempre Visível)

#### Seção 1: Status Bar
```
┌──────────────────────────────────────────────┐
│  🔴 VOO  │  Último: 1.38x  │  Banca: R$ 1.000 │
└──────────────────────────────────────────────┘
```

**Elementos:**
- **Status:** 🔴 VOO / 🟢 AGUARDANDO
- **Último Crash:** Valor da última vela
- **Banca Atual:** Saldo em tempo real (se possível integrar)

**Cores:**
- VOO: Vermelho (#EF4444)
- AGUARDANDO: Verde (#10B981)

---

#### Seção 2: Recomendação (DESTAQUE MÁXIMO)
```
┌──────────────────────────────────────────────┐
│           ❌ NÃO JOGUE                        │
│                                               │
│  Motivo: Pós-Rosa vela 2/3 (Trava)           │
│  Risco: 🔴 CRITICAL                           │
└──────────────────────────────────────────────┘
```

**Variações:**

**NÃO JOGUE:**
```
❌ NÃO JOGUE

Motivo: Pós-Rosa vela 2/3 (Trava)
Risco: 🔴 CRITICAL
```

**JOGUE 2x:**
```
✅ JOGUE 2.00x (R$ 100)

Motivo: Sequência roxa (2ª), Taxa 75%
Risco: 🟡 MÉDIO
```

**JOGUE 10x:**
```
🌸 JOGUE 10.00x (R$ 50)

Motivo: Padrão 💎 DIAMANTE (Int 8, Conf 90%)
Risco: 🟢 BAIXO
```

**JOGUE DUPLA:**
```
✅🌸 JOGUE DUPLA (R$ 150)

2x: Sequência roxa (2ª), Taxa 80%
10x: Padrão 💎 DIAMANTE (Int 8, Conf 90%)
Risco: 🟡 MÉDIO
```

**AGUARDE:**
```
⏸️ AGUARDE

Motivo: Aguardando 2ª roxa consecutiva
Risco: 🟡 MÉDIO
```

**PARE:**
```
🛑 PARE IMEDIATAMENTE

Motivo: Stop Loss Diário ativado (-20%)
Proteja seu capital!
```

**Cores:**
- NÃO JOGUE: Vermelho (#EF4444), fundo escuro
- JOGUE: Verde (#10B981), fundo escuro
- AGUARDE: Amarelo (#F59E0B), fundo escuro
- PARE: Vermelho intenso (#DC2626), fundo vermelho escuro

**Tamanho da Fonte:**
- Recomendação: 24px, bold
- Motivo: 14px, regular
- Risco: 12px, regular

---

#### Seção 3: Análise Rápida
```
┌──────────────────────────────────────────────┐
│  📊 Análise                                   │
│                                               │
│  Densidade: 🟡 MÉDIA (4/10 roxas)             │
│  Última Rosa: 8 velas atrás                   │
│  Taxa de Conversão: 65%                       │
│                                               │
│  🌸 Próximo Padrão Rosa:                      │
│  💎 Intervalo 8 (±1) - Conf 90%               │
│  Faltam: 0 velas (ALERTA!)                    │
└──────────────────────────────────────────────┘
```

**Elementos:**

1. **Densidade de Volatilidade:**
   - 🟢 ALTA (5+ roxas nas últimas 10)
   - 🟡 MÉDIA (3-4 roxas)
   - 🔴 BAIXA (0-2 roxas)

2. **Última Rosa:**
   - Quantas velas desde a última rosa
   - Se = intervalo (±1): 🔔 ALERTA!

3. **Taxa de Conversão:**
   - % de roxas que viraram sequência
   - Indica se é bom momento para sequências

4. **Próximo Padrão Rosa:**
   - Tipo: 💎 DIAMANTE / 🥇 OURO / 🥈 PRATA
   - Intervalo esperado (±1)
   - Confiança (%)
   - Faltam X velas

---

#### Seção 4: Botão Expandir (Opcional)
```
[Expandir Detalhes ▼]
```

**Ao clicar, abre card secundário com:**
- Últimas 10 velas (visual)
- Histórico de padrões rosa
- Estatísticas detalhadas
- Histórico de decisões

---

### 📊 Card Secundário (Expandido - Opcional)

```
┌─────────────────────────────────────────────────────┐
│  📈 Detalhes da Análise                  [Fechar ×] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Estatísticas:                                   │
│  ├─ Média: 6.92x                                    │
│  ├─ Menor: 1.00x                                    │
│  ├─ Maior: 73.00x                                   │
│  └─ Volatilidade: 12.91 (Alta)                      │
│                                                     │
│  🎲 Últimas 10 Velas:                               │
│  🔵 1.38x  🔵 1.84x  🔵 1.07x  🌸 22.47x  🔵 1.45x  │
│  🟣 2.80x  🟣 3.17x  🟣 4.27x  🔵 1.61x  🔵 1.82x  │
│                                                     │
│  🌸 Histórico de Rosas:                             │
│  ├─ Vela 14: 17.02x                                 │
│  ├─ Vela 33: 13.20x (Int 19)                        │
│  ├─ Vela 41: 41.48x (Int 8)                         │
│  ├─ Vela 42: 10.64x (Int 1 - Double Pink!)          │
│  └─ Vela 43: 10.16x (Int 1 - Triple Pink!)          │
│                                                     │
│  📋 Histórico de Decisões (últimas 5):              │
│  ├─ Vela 40: ❌ NÃO JOGOU (Pós-Rosa 1/3) ✅         │
│  ├─ Vela 41: ✅ JOGOU 2x (Retomada) ✅ +100         │
│  ├─ Vela 42: ✅ JOGOU DUPLA ✅ +550                 │
│  ├─ Vela 43: 🌸 JOGOU 10x (Double Pink) ✅ +450     │
│  └─ Vela 44: ❌ NÃO JOGOU (Pós-Rosa 2/3) ✅         │
│                                                     │
│  💰 Resumo da Sessão:                               │
│  ├─ Entradas: 15                                    │
│  ├─ Greens: 14 (93%)                                │
│  ├─ Reds: 1 (7%)                                    │
│  └─ Lucro: +R$ 1.250 (+125%)                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Especificações de Design

### Cores (Dark Theme):

**Backgrounds:**
- Card principal: `#1E293B` (slate-800)
- Card secundário: `#0F172A` (slate-900)
- Seções: `#334155` (slate-700)

**Textos:**
- Título: `#F1F5F9` (slate-100)
- Texto principal: `#E2E8F0` (slate-200)
- Texto secundário: `#94A3B8` (slate-400)

**Ações:**
- NÃO JOGUE: `#EF4444` (red-500)
- JOGUE: `#10B981` (emerald-500)
- AGUARDE: `#F59E0B` (amber-500)
- PARE: `#DC2626` (red-600)

**Indicadores:**
- Risco BAIXO: `#10B981` (green)
- Risco MÉDIO: `#F59E0B` (yellow)
- Risco ALTO: `#F97316` (orange)
- Risco CRITICAL: `#EF4444` (red)

### Tipografia:

**Fontes:**
- Principal: `Inter, system-ui, sans-serif`
- Monospace (valores): `JetBrains Mono, monospace`

**Tamanhos:**
- Recomendação: `24px` (bold)
- Título seção: `16px` (semibold)
- Texto normal: `14px` (regular)
- Texto pequeno: `12px` (regular)

### Espaçamento:

- Padding card: `16px`
- Gap entre seções: `12px`
- Border radius: `8px`
- Border: `1px solid #334155`

### Animações:

- Transição de recomendação: `0.3s ease`
- Hover em botões: `scale(1.02)`
- Pulsação em ALERTA: `pulse 2s infinite`

---

## 🚀 Posicionamento do Overlay

### ❌ ATUAL (Dentro do iframe):
- Cobre parte do jogo
- Dificulta visualização
- Pode ser bloqueado por atualizações do jogo

### ✅ NOVO (Fora do iframe):
- Posição fixa no canto superior direito da PÁGINA PRINCIPAL
- Não cobre o jogo
- Sempre visível
- Draggable (usuário pode mover)

**Coordenadas:**
```css
position: fixed;
top: 20px;
right: 20px;
z-index: 999999;
```

**Alternativa (se usuário preferir):**
```css
position: fixed;
top: 20px;
left: 20px;
z-index: 999999;
```

---

## 📱 Responsividade

### Desktop (> 1024px):
- Card principal: `400px` largura
- Card secundário: `500px` largura
- Posição: Canto superior direito

### Tablet (768px - 1024px):
- Card principal: `350px` largura
- Card secundário: `450px` largura
- Posição: Canto superior direito

### Mobile (< 768px):
- Card principal: `90vw` largura (quase tela cheia)
- Card secundário: `95vw` largura
- Posição: Centro superior
- Botão minimizar mais visível

---

## 🎯 Prioridades de Informação

### 🔴 CRÍTICO (Sempre visível):
1. Recomendação (JOGUE/NÃO JOGUE/AGUARDE/PARE)
2. Motivo da recomendação
3. Nível de risco

### 🟡 IMPORTANTE (Visível no card principal):
4. Status do jogo (VOO/AGUARDANDO)
5. Último crash
6. Densidade de volatilidade
7. Última rosa (se próximo de padrão)
8. Próximo padrão rosa (se detectado)

### 🟢 COMPLEMENTAR (Visível apenas no card expandido):
9. Estatísticas (média, menor, maior)
10. Últimas 10 velas
11. Histórico de rosas
12. Histórico de decisões
13. Resumo da sessão

---

## 🛠️ Funcionalidades Interativas

### 1. **Draggable (Arrastar)**
- Usuário pode mover o overlay para qualquer posição
- Posição salva em localStorage

### 2. **Minimizar/Expandir**
- Botão [-] minimiza para apenas recomendação
- Botão [×] fecha o overlay (pode reabrir)

### 3. **Notificações Sonoras (Opcional)**
- Som ao detectar padrão rosa
- Som ao ativar stop loss/win
- Som ao mudar recomendação (JOGUE ↔ NÃO JOGUE)

### 4. **Histórico de Decisões**
- Registra todas as recomendações
- Mostra se usuário seguiu ou não
- Calcula taxa de acerto

### 5. **Modo Compacto**
- Apenas recomendação + motivo
- Ideal para telas pequenas

---

## 📊 Mockup Visual (ASCII)

### Modo Normal:
```
┌─────────────────────────────────────────┐
│ 🎯 Aviator Analyzer          [−] [×]   │
├─────────────────────────────────────────┤
│ 🔴 VOO │ 1.38x │ R$ 1.000              │
├─────────────────────────────────────────┤
│                                         │
│         ❌ NÃO JOGUE                    │
│                                         │
│  Pós-Rosa vela 2/3 (Trava)             │
│  Risco: 🔴 CRITICAL                     │
│                                         │
├─────────────────────────────────────────┤
│ 📊 Densidade: 🟡 MÉDIA (4/10)           │
│ 🌸 Última Rosa: 8 velas atrás           │
│ 📈 Taxa Conversão: 65%                  │
│                                         │
│ 🌸 Próximo Padrão:                      │
│ 💎 Int 8 (±1) - Conf 90%                │
│ Faltam: 0 velas 🔔 ALERTA!              │
├─────────────────────────────────────────┤
│ [Expandir Detalhes ▼]                  │
└─────────────────────────────────────────┘
```

### Modo Minimizado:
```
┌─────────────────────────────────────────┐
│ 🎯 Aviator Analyzer          [□] [×]   │
├─────────────────────────────────────────┤
│         ❌ NÃO JOGUE                    │
│  Pós-Rosa vela 2/3 (Trava)             │
└─────────────────────────────────────────┘
```

### Modo Expandido:
```
┌─────────────────────────────────────────┐
│ 🎯 Aviator Analyzer          [−] [×]   │
├─────────────────────────────────────────┤
│ (Card Principal - mesmo de cima)        │
├─────────────────────────────────────────┤
│ 📈 Detalhes da Análise       [Fechar]  │
├─────────────────────────────────────────┤
│ 📊 Estatísticas:                        │
│ Média: 6.92x │ Menor: 1.00x │ Maior...│
│                                         │
│ 🎲 Últimas 10 Velas:                    │
│ 🔵 1.38x 🔵 1.84x 🔵 1.07x 🌸 22.47x... │
│                                         │
│ 🌸 Histórico de Rosas:                  │
│ Vela 14: 17.02x                         │
│ Vela 33: 13.20x (Int 19)                │
│ ...                                     │
│                                         │
│ 💰 Resumo: 14/15 (93%) | +R$ 1.250      │
└─────────────────────────────────────────┘
```

---

## 🎯 Comparação: Antes vs Depois

| Aspecto | ANTES (Atual) | DEPOIS (Proposto) |
|---------|---------------|-------------------|
| **Posição** | Dentro do iframe | Fora do iframe (canto superior direito) |
| **Tamanho** | 2 cards grandes | 1 card compacto + 1 expandível |
| **Recomendação** | Visível, mas pequena | DESTAQUE MÁXIMO |
| **Motivo** | Não explicado | Sempre explicado |
| **Informações** | Muitas irrelevantes | Apenas relevantes |
| **Padrões** | Confusos | Claros e acionáveis |
| **Densidade** | Não mostrado | Indicador visual |
| **Última Rosa** | Não mostrado | Com alerta se próximo |
| **Histórico** | Não mostrado | Expandível |
| **Interatividade** | Apenas minimizar | Draggable, expandir, histórico |

---

## 🚀 Implementação Técnica

### Arquivos a Criar/Modificar:

1. **`AnalyzerOverlay.tsx`** (Refatorar completamente)
   - Novo layout conforme proposta
   - Lógica de expansão/minimização
   - Draggable functionality

2. **`index.tsx`** (Injeção do overlay)
   - Injetar FORA do iframe (página principal)
   - Comunicação com iframe via `postMessage`

3. **`domAnalyzer.ts`** (Captura de dados)
   - Enviar dados para página principal via `postMessage`

4. **`styles.css`** (Novo)
   - Estilos conforme especificação

---

**Documento completo. Pronto para implementação! 🎨**
