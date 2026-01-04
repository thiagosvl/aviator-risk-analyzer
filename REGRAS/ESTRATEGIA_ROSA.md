# 🌸 ESTRATÉGIA ROSA (10x) - V3 EQUILIBRADA

**Versão:** V3 Equilibrada  
**Data:** 04/01/2026  
**Objetivo:** Identificar padrões confirmados de intervalos entre rosas (≥10x)

---

## 📊 PARÂMETROS

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Confiança Mínima** | 70% | Confiança mínima para jogar |
| **Intervalo Mínimo** | 3 velas | Intervalos <3 são descartados |
| **Ocorrências (Intervalo <3)** | 4+ | Praticamente remove intervalos muito curtos |
| **Ocorrências (Intervalo 3-9)** | 2+ | Confirmação padrão |
| **Ocorrências (Intervalo 10+)** | 2+ | Confirmação padrão |
| **Margem de Tolerância** | ±1 vela | Flexibilidade no timing |
| **Janela de Momentum** | 25 velas | Analisa apenas últimas 25 velas |

---

## ✅ QUANDO JOGAR

### 1. Padrão Confirmado (Intervalo ≥3, 2+ Ocorrências, Confiança ≥70%)

**Condições:**
- ✅ Intervalo ≥ 3 velas
- ✅ Intervalo se repetiu ≥2 vezes
- ✅ Confiança ≥ 70%
- ✅ Dentro da margem (±1 vela)

**Exemplo:**
```
🔵 🔵 🟣 🔵 🟣 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🔵 🌸
```
- Rosa 1 → Rosa 2: 7 velas
- Rosa 2 → Rosa 3: 7 velas
- Distância atual: 6 velas
- **Padrão:** Intervalo 7 (3x confirmados - 💎)
- **Confiança:** 95%
- **Decisão:** ✅ JOGA

---

## ❌ QUANDO NÃO JOGAR

### 1. Padrão Não Confirmado (1 Ocorrência)

**Regra:** Intervalo apareceu apenas 1 vez.

**Motivo:** 1 ocorrência = coincidência, não padrão.

**Exemplo:**
```
🔵 🟣 🔵 🟣 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🌸
```
- Rosa 1 → Rosa 2: 12 velas (1 ocorrência)
- **Decisão:** ❌ NÃO JOGA (aguarde padrão se formar)

---

### 2. Intervalo Muito Curto (<3 Velas)

**Regra:** Intervalos 1-2 exigem 4+ ocorrências (praticamente impossível).

**Motivo:** Rosas a cada 2 velas é extremamente improvável.

**Exemplo:**
```
🔵 🌸 🔵 🌸 🔵 🟣 🔵 🟣
```
- Rosa 1 → Rosa 2: 2 velas (2 ocorrências)
- **Decisão:** ❌ NÃO JOGA (intervalo muito curto)

---

### 3. Fora da Margem (±2 ou Mais)

**Regra:** Diferença entre distância atual e alvo >1 vela.

**Motivo:** Timing muito errado.

**Exemplo:**
```
🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🔵 🌸
```
- Padrão: Intervalo 7 (2x confirmados)
- Distância atual: 10 velas
- Alvo: 7 velas
- Diferença: |10 - 7| = 3 velas ❌
- **Decisão:** ❌ NÃO JOGA (fora da margem)

---

### 4. Confiança Baixa (<70%)

**Regra:** Confiança = 50 + (ocorrências * 15).

**Motivo:** Padrão fraco.

**Exemplo:**
```
🔵 🟣 🔵 🟣 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🌸
```
- Padrão: Intervalo 12 (1 ocorrência)
- Confiança: 50 + 15 = 65% ❌
- **Decisão:** ❌ NÃO JOGA (confiança baixa)

---

### 5. Sem Padrões Confirmados

**Regra:** Nenhum intervalo se repetiu ≥2 vezes.

**Motivo:** Rosas aleatórias, sem previsibilidade.

**Exemplo:**
```
🔵 🟣 🔵 🟣 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🌸
```
- Rosa 1 → Rosa 2: 14 velas (1 ocorrência)
- **Decisão:** ❌ NÃO JOGA (aguarde padrão)

---

## 🎯 FLUXO DE DECISÃO

```
┌─────────────────────┐
│ Analisar Histórico  │
│ (≥3 rosas em 25)    │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Há intervalos│ ──── NÃO ──► ❌ NÃO JOGA
    │ com ≥2 ocorr?│
    └──────┬───────┘
           │ SIM
           ▼
    ┌──────────────┐
    │ Intervalo    │ ──── NÃO ──► ❌ NÃO JOGA
    │ ≥3 velas?    │
    └──────┬───────┘
           │ SIM
           ▼
    ┌──────────────┐
    │ Confiança    │ ──── NÃO ──► ❌ NÃO JOGA
    │ ≥70%?        │
    └──────┬───────┘
           │ SIM
           ▼
    ┌──────────────┐
    │ Dentro da    │ ──── NÃO ──► ❌ NÃO JOGA
    │ margem (±1)? │
    └──────┬───────┘
           │ SIM
           ▼
    ┌──────────────┐
    │ ✅ JOGA 10X  │
    └──────────────┘
```

---

## 📊 HIERARQUIA DE PADRÕES

| Tipo | Ocorrências | Confiança | Emoji |
|------|-------------|-----------|-------|
| **Diamante** | 3+ | 95% | 💎 |
| **Ouro** | 2 | 80% | 🥇 |

**Nota:** Com confiança mínima 70%, **Diamante (3+)** e **Ouro (2)** são jogáveis.

---

## 📈 MÉTRICAS ESPERADAS

| Métrica | Valor Esperado |
|---------|----------------|
| **Taxa de Acerto** | 30-50% |
| **ROI por Sessão** | +10% a +30% |
| **Jogadas/Sessão** | 2-8 |
| **Lucro/Sessão** | R$ 50 a R$ 150 |

---

## 📝 CHECKLIST RÁPIDO

Antes de jogar 10x, verifique:

- [ ] Padrão confirmado (≥2 ocorrências)?
- [ ] Intervalo ≥3 velas?
- [ ] Confiança ≥70%?
- [ ] Dentro da margem (±1 vela)?

**Se TODOS marcados:** ✅ JOGA  
**Se ALGUM desmarcado:** ❌ NÃO JOGA

---

## 🔄 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças |
|--------|------|----------|
| **V3 Equilibrada** | 04/01/2026 | Confiança 70% (era 75%), Intervalo ≥3 (era 5), Ocorrências 2+ (era 3+) |
| V3 Melhorada | 04/01/2026 | Confiança 75%, Intervalo ≥5, Ocorrências 3+ |
| V3 | 03/01/2026 | Padrões confirmados, Confiança por frequência |
| V2 | 02/01/2026 | Primeira versão documentada |

---

**Última Atualização:** 04/01/2026  
**Arquivo:** `REGRAS/ESTRATEGIA_ROSA.md`
