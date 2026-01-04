# 🟣 ESTRATÉGIA ROXA (2X) - V3 MELHORADA

**Data:** 04/01/2026  
**Versão:** V3 Melhorada (Otimizada para maior acerto)

---

## 🎯 OBJETIVO

Surfar sequências de velas roxas (2-9.99x) com **alta taxa de conversão** e **confirmação rigorosa**.

---

## 📊 PARÂMETROS

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Aposta** | R$ 100 | Valor fixo por jogada |
| **Alvo** | 2.00x | Multiplicador mínimo para green |
| **Conversão Mínima** | 60% | Taxa mínima de roxas seguidas |
| **Streak Mínimo (Validar)** | 2 roxas | Para validar sequência |
| **Streak Mínimo (Jogar)** | 3 roxas | Para começar a jogar |
| **Stop Loss** | 2 reds | Para após 2 azuis seguidas |
| **Recuperação Lenta** | 3 roxas | Após 3 azuis seguidas |
| **Trava Pós-Rosa** | 3 velas | Aguarda após rosa (≥10x) |

---

## 🔍 REGRAS DETALHADAS

### 1. ✅ QUANDO JOGAR

**Condições (TODAS devem ser atendidas):**

1. ✅ **Streak ≥3 roxas seguidas**
   - Última vela: roxa (≥2x)
   - Penúltima vela: roxa (≥2x)
   - Antepenúltima vela: roxa (≥2x)

2. ✅ **Conversão ≥60%**
   - Das últimas 25 velas roxas, ≥60% foram seguidas por outra roxa
   - Indica que sequências se sustentam

3. ✅ **Sem Trava Pós-Rosa**
   - Última rosa (≥10x) foi há ≥3 velas
   - OU double blue ≤1 nas últimas 25 velas (exceção)

4. ✅ **Sem Stop Loss**
   - Não teve 2 azuis seguidas recentemente

5. ✅ **Sem Deep Downtrend**
   - Não teve 3 azuis seguidas recentemente
   - OU já recuperou com 3 roxas

**Se TODAS as condições forem atendidas:** ✅ **JOGA 2X**

---

### 2. ❌ QUANDO NÃO JOGAR

#### A. Aguardando 2ª Roxa

**Situação:** 1 roxa recente

**Motivo:** "Aguardando 2ª vela roxa para confirmar."

**Regra:**
- Exige **2+ roxas** para validar sequência
- Com 1 roxa, ainda não sabemos se é sequência ou roxa isolada

**Ação:** Aguarda próxima vela

---

#### B. Aguardando 3ª Roxa

**Situação:** 2 roxas seguidas, conversão ≥60%

**Motivo:** "Aguardando 3ª vela roxa para confirmar sequência."

**Regra:**
- Exige **3+ roxas** para jogar
- Com 2 roxas, sequência está se formando mas ainda não confirmada
- Conversão ≥60% valida que é sequência forte

**Ação:** Aguarda 3ª roxa para jogar

---

#### C. Sequência Suspeita (Conversão <60%)

**Situação:** 3+ roxas seguidas, conversão <60%

**Motivo:** "Sequência Suspeita (Conversão Baixa <60%)."

**Regra:**
- Conversão <60% indica que roxas não se sustentam
- Muitas roxas isoladas (roxa → azul → roxa → azul)
- Alto risco de red

**Ação:** Não joga (aguarda conversão subir)

---

#### D. Stop Loss (2 Reds Seguidos)

**Situação:** 2 azuis seguidas (2 reds)

**Motivo:** "Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas."

**Regra:**
- 2 azuis seguidas indicam que sequência acabou
- Continuar jogando = risco de 3º, 4º red (martingale perigoso)
- **Para imediatamente**

**Ação:** Aguarda **2 roxas** para retomar

---

#### E. Recuperação Lenta (3 Azuis Seguidas)

**Situação:** 3+ azuis seguidas (deep downtrend)

**Motivo:** "Recuperação Lenta (3 Reds Recentes). Aguarde 3 Roxas."

**Regra:**
- 3 azuis seguidas indicam momento ruim (downtrend)
- Exige **3 roxas** para retomar (ao invés de 2)
- Recuperação mais rigorosa

**Ação:** Aguarda **3 roxas** para retomar

---

#### F. Trava Pós-Rosa (Aguarda 3 Velas)

**Situação:** Rosa recente (≥10x), menos de 3 velas depois

**Motivo:** "Trava Pós-Rosa (X/3). Aguarde correção."

**Regra:**
- Após rosa, gráfico tende a corrigir (azuis)
- Jogar 2x logo após rosa = risco alto de red
- **Aguarda 3 velas** antes de jogar 2x

**Exceção:** Double blue ≤1 nas últimas 25 velas
- Se double blue ≤1, trava liberada (gráfico estável)

**Ação:** Aguarda 3 velas (ou exceção)

---

## 📈 FLUXO DE DECISÃO

```
Início
  ↓
Última vela é roxa (≥2x)?
  ├─ Não → ❌ NÃO JOGA (aguarda roxa)
  └─ Sim
      ↓
Streak ≥3 roxas?
  ├─ Não
  │   ├─ Streak = 1 → ❌ NÃO JOGA (aguarda 2ª roxa)
  │   └─ Streak = 2 → ❌ NÃO JOGA (aguarda 3ª roxa)
  └─ Sim
      ↓
Conversão ≥60%?
  ├─ Não → ❌ NÃO JOGA (sequência suspeita)
  └─ Sim
      ↓
Teve 2 azuis seguidas?
  ├─ Sim → 🛑 STOP LOSS (aguarda 2 roxas)
  └─ Não
      ↓
Teve 3 azuis seguidas?
  ├─ Sim → ❌ NÃO JOGA (aguarda 3 roxas)
  └─ Não
      ↓
Rosa recente (<3 velas)?
  ├─ Sim
  │   ├─ Double blue ≤1? → Sim → ✅ JOGA (exceção)
  │   └─ Não → ❌ NÃO JOGA (trava pós-rosa)
  └─ Não
      ↓
✅ JOGA 2X
```

---

## 🎓 EXEMPLOS

### Exemplo 1: JOGA ✅

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 1.34x 1.08x 1.19x 2.15x 3.42x 2.87x [AGORA]
🔵   🔵   🔵   🔵   🔵   🟣   🟣   🟣   ❓
```

**Análise:**
- Streak: 3 roxas ✅
- Conversão (últimas 25): 68% ✅
- Trava pós-rosa: Não ✅
- Stop loss: Não ✅
- Deep downtrend: Não ✅

**Decisão:** ✅ **JOGA 2X** (R$ 100)

**Motivo:** "Surfando Sequência (Conversão ≥60%)."

---

### Exemplo 2: NÃO JOGA (Aguardando 3ª Roxa) ❌

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 1.34x 1.08x 1.19x 1.45x 1.23x 2.15x 3.42x [AGORA]
🔵   🔵   🔵   🔵   🔵   🔵   🔵   🟣   🟣   ❓
```

**Análise:**
- Streak: 2 roxas ❌ (precisa 3)
- Conversão: 65% ✅
- Trava pós-rosa: Não ✅
- Stop loss: Não ✅
- Deep downtrend: Não ✅

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Aguardando 3ª vela roxa para confirmar sequência."

---

### Exemplo 3: NÃO JOGA (Sequência Suspeita) ❌

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 2.34x 1.08x 3.19x 1.45x 2.23x 4.67x 2.15x [AGORA]
🔵   🔵   🟣   🔵   🟣   🔵   🟣   🟣   🟣   ❓
```

**Análise:**
- Streak: 3 roxas ✅
- Conversão: 45% ❌ (precisa 60%)
- Trava pós-rosa: Não ✅
- Stop loss: Não ✅
- Deep downtrend: Não ✅

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Sequência Suspeita (Conversão Baixa <60%)."

---

### Exemplo 4: STOP LOSS 🛑

**Gráfico (últimas 10 velas):**
```
2.15x 3.42x 2.87x 4.12x 1.34x 1.08x [AGORA]
🟣   🟣   🟣   🟣   🔵   🔵   ❓
```

**Análise:**
- Streak: -2 (2 azuis) 🛑
- Stop loss: ✅ SIM

**Decisão:** 🛑 **STOP LOSS - NÃO JOGA**

**Motivo:** "Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas."

---

## 📊 MÉTRICAS ESPERADAS

| Métrica | Valor Esperado |
|---------|----------------|
| **Taxa de Acerto** | 50-60% |
| **Jogadas/Sessão (60 velas)** | 5-15 |
| **ROI** | +5% a +15% |
| **Lucro/Sessão** | R$ 50 a R$ 150 |

---

## ✅ CHECKLIST RÁPIDO

Antes de jogar 2x:

- [ ] Streak ≥3 roxas?
- [ ] Conversão ≥60%?
- [ ] Sem trava pós-rosa (<3 velas)?
- [ ] Sem stop loss (2 reds)?
- [ ] Sem deep downtrend (3 azuis)?

**Se TODOS ✅:** Joga 2x  
**Se ALGUM ❌:** Não joga

---

## 🔄 HISTÓRICO DE VERSÕES

### V3 Melhorada (04/01/2026)

**Mudanças:**
- Conversão mínima: 50% → **60%**
- Streak mínimo para validar: 1 → **2 roxas**
- Streak mínimo para jogar: 2 → **3 roxas**

**Motivo:** Análise de 30 cenários mostrou taxa de acerto de 40% com regras antigas. Com novas regras, espera-se 50-60%.

---

### V3 Original (03/01/2026)

**Mudanças:**
- Conversão mínima: Não tinha → **50%**
- Streak mínimo: Não tinha → **1 roxa**
- Stop loss: Não tinha → **2 reds**

---

### V2 (02/01/2026)

**Regras básicas:**
- Surfar sequências roxas
- Sem validação de conversão
- Sem stop loss rigoroso

---

**Última Atualização:** 04/01/2026  
**Arquivo:** `REGRAS/ESTRATEGIA_ROXA.md`
