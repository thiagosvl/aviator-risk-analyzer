# 🟣 ESTRATÉGIA ROXA (2x) - V3 EQUILIBRADA

**Versão:** V3 Equilibrada  
**Data:** 04/01/2026  
**Objetivo:** Surfar sequências de velas roxas (2.00x - 9.99x)

---

## 📊 PARÂMETROS

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Conversão Mínima** | 55% | Taxa mínima de conversão de roxas |
| **Streak Mínimo (Validar)** | 2 roxas | Mínimo para validar sequência |
| **Streak Mínimo (Jogar)** | 2 roxas | Mínimo para jogar |
| **Stop Loss** | 2 azuis | Para após 2 reds seguidos |
| **Trava Pós-Rosa** | 3 velas | Aguarda 3 velas após rosa |
| **Recuperação Lenta** | 3 roxas | Após 3 azuis recentes, exige 3 roxas |

---

## ✅ QUANDO JOGAR

### 1. Sequência de 2+ Roxas com Conversão ≥55%

**Condições:**
- ✅ Streak ≥ 2 roxas
- ✅ Conversão ≥ 55% (nas últimas 25 velas)
- ✅ Não está em trava pós-rosa
- ✅ Não está em stop loss

**Exemplo:**
```
🟣 🟣 🔵 🟣 🔵 🟣 🟣 🔵 🟣 🟣 ← Última vela (mais recente)
```
- Streak: 2 roxas (🟣🟣)
- Conversão: 60% (6 de 10 roxas viraram sequência)
- **Decisão:** ✅ JOGA

---

## ❌ QUANDO NÃO JOGAR

### 1. Trava Pós-Rosa (3 velas)

**Regra:** Após uma rosa (≥10x), aguarda 3 velas antes de jogar 2x.

**Motivo:** Mercado tende a corrigir após rosas.

**Exemplo:**
```
🟣 🔵 🌸 🔵 🟣 🔵 🟣 ← Última vela
```
- Distância da rosa: 2 velas
- **Decisão:** ❌ NÃO JOGA (aguarde mais 1 vela)

---

### 2. Stop Loss (2 Azuis Seguidas)

**Regra:** Após 2 azuis seguidas, para e aguarda 2 roxas para retomar.

**Motivo:** Mercado em downtrend, evita perdas consecutivas.

**Exemplo:**
```
🔵 🔵 🟣 🔵 🟣 🟣 ← Última vela
```
- Streak: -2 (2 azuis seguidas)
- **Decisão:** ❌ NÃO JOGA (aguarde 2 roxas)

---

### 3. Recuperação Lenta (3 Azuis Recentes)

**Regra:** Se houve 3+ azuis nas últimas 10 velas, exige 3 roxas para jogar (ao invés de 2).

**Motivo:** Mercado em recuperação lenta, precisa de mais confirmação.

**Exemplo:**
```
🟣 🟣 🔵 🔵 🔵 🟣 🔵 🟣 ← Última vela
```
- 3 azuis recentes (🔵🔵🔵)
- Streak: 2 roxas
- **Decisão:** ❌ NÃO JOGA (aguarde 3ª roxa)

---

### 4. Aguardando 2ª Roxa

**Regra:** Com apenas 1 roxa, aguarda 2ª para confirmar sequência.

**Motivo:** 1 roxa isolada não confirma tendência.

**Exemplo:**
```
🟣 🔵 🔵 🟣 🔵 🟣 ← Última vela
```
- Streak: 1 roxa
- **Decisão:** ❌ NÃO JOGA (aguarde 2ª roxa)

---

### 5. Conversão Baixa (<55%)

**Regra:** Se conversão < 55%, não joga mesmo com 2+ roxas.

**Motivo:** Sequências fracas, alta chance de azul interromper.

**Exemplo:**
```
🟣 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 ← Última vela
```
- Streak: 2 roxas
- Conversão: 30% (3 de 10 roxas viraram sequência)
- **Decisão:** ❌ NÃO JOGA (conversão baixa)

---

### 6. Aguardando Oportunidade Clara

**Regra:** Se não há padrão claro, aguarda.

**Motivo:** Não força jogadas sem setup.

**Exemplo:**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 ← Última vela
```
- Alternando azul/roxa (sem sequência)
- **Decisão:** ❌ NÃO JOGA (aguarde sequência)

---

## 🎯 FLUXO DE DECISÃO

```
┌─────────────────────┐
│ Analisar Histórico  │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Trava Pós-   │ ──── SIM ──► ❌ NÃO JOGA
    │ Rosa (3)?    │
    └──────┬───────┘
           │ NÃO
           ▼
    ┌──────────────┐
    │ Stop Loss    │ ──── SIM ──► ❌ NÃO JOGA
    │ (2 Azuis)?   │
    └──────┬───────┘
           │ NÃO
           ▼
    ┌──────────────┐
    │ 3 Azuis      │ ──── SIM ──► Exige 3 Roxas
    │ Recentes?    │
    └──────┬───────┘
           │ NÃO
           ▼
    ┌──────────────┐
    │ Streak ≥ 2?  │ ──── NÃO ──► ❌ NÃO JOGA
    └──────┬───────┘
           │ SIM
           ▼
    ┌──────────────┐
    │ Conversão    │ ──── NÃO ──► ❌ NÃO JOGA
    │ ≥ 55%?       │
    └──────┬───────┘
           │ SIM
           ▼
    ┌──────────────┐
    │ ✅ JOGA 2X   │
    └──────────────┘
```

---

## 📈 MÉTRICAS ESPERADAS

| Métrica | Valor Esperado |
|---------|----------------|
| **Taxa de Acerto** | 40-60% |
| **ROI por Sessão** | +5% a +15% |
| **Jogadas/Sessão** | 5-15 |
| **Greens Consecutivos** | 2-4 |
| **Reds Consecutivos** | 1-2 (stop loss) |

---

## 📝 CHECKLIST RÁPIDO

Antes de jogar 2x, verifique:

- [ ] Não está em trava pós-rosa (3 velas)?
- [ ] Não está em stop loss (2 azuis)?
- [ ] Não houve 3 azuis recentes (ou já tem 3 roxas)?
- [ ] Tem 2+ roxas na sequência?
- [ ] Conversão ≥ 55%?

**Se TODOS marcados:** ✅ JOGA  
**Se ALGUM desmarcado:** ❌ NÃO JOGA

---

## 🔄 HISTÓRICO DE VERSÕES

| Versão | Data | Mudanças |
|--------|------|----------|
| **V3 Equilibrada** | 04/01/2026 | Conversão 55% (era 60%), Streak 2 roxas para jogar (era 3) |
| V3 Melhorada | 04/01/2026 | Conversão 60%, Streak 3 roxas |
| V3 | 03/01/2026 | Conversão 50%, Streak 2 roxas |
| V2 | 02/01/2026 | Primeira versão documentada |

---

**Última Atualização:** 04/01/2026  
**Arquivo:** `REGRAS/ESTRATEGIA_ROXA.md`
