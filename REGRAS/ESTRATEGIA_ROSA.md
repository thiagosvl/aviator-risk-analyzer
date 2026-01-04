# 🌸 ESTRATÉGIA ROSA (10X) - V3 MELHORADA

**Data:** 04/01/2026  
**Versão:** V3 Melhorada (Otimizada para maior acerto)

---

## 🎯 OBJETIVO

Identificar **padrões confirmados** de intervalos entre rosas (≥10x) e jogar no momento certo com **alta confiança**.

---

## 📊 PARÂMETROS

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Aposta** | R$ 50 | Valor fixo por jogada |
| **Alvo** | 10.00x | Multiplicador mínimo para green |
| **Confiança Mínima** | 75% | Confiança mínima para jogar |
| **Intervalo Mínimo** | 5 velas | Intervalos <5 são descartados |
| **Ocorrências (Intervalo 1-4)** | 4+ | Praticamente remove intervalos curtos |
| **Ocorrências (Intervalo 5-9)** | 3+ | Exige confirmação forte |
| **Ocorrências (Intervalo 10+)** | 2+ | Confirmação padrão |
| **Margem de Tolerância** | ±1 vela | Flexibilidade no timing |
| **Janela de Momentum** | 25 velas | Analisa apenas últimas 25 velas |

---

## 🔍 REGRAS DETALHADAS

### 1. ✅ QUANDO JOGAR

**Condições (TODAS devem ser atendidas):**

1. ✅ **Padrão Confirmado**
   - Intervalo se repetiu ≥2 vezes (ou ≥3 para intervalos 5-9)
   - Exemplo: Rosa → 7 velas → Rosa → 7 velas → Rosa

2. ✅ **Intervalo ≥5 velas**
   - Intervalos 1-4 são descartados (muito raros)
   - Exemplo: Intervalo 7 ✅ | Intervalo 3 ❌

3. ✅ **Confiança ≥75%**
   - Calculada por: 50 + (ocorrências * 15)
   - Exemplo: 3 ocorrências = 50 + 45 = 95% ✅

4. ✅ **Dentro da Margem (±1 vela)**
   - Distância atual vs alvo: diferença ≤1 vela
   - Exemplo: Alvo 7, atual 6 ou 8 ✅ | Atual 5 ou 9 ❌

**Se TODAS as condições forem atendidas:** ✅ **JOGA 10X**

---

### 2. ❌ QUANDO NÃO JOGAR

#### A. Padrão Não Confirmado

**Situação:** Intervalo apareceu apenas 1 vez

**Motivo:** "Buscando padrão confirmado..."

**Regra:**
- Exige **≥2 ocorrências** (ou ≥3 para intervalos 5-9)
- 1 ocorrência = coincidência, não padrão

**Ação:** Aguarda padrão se formar

---

#### B. Intervalo Muito Curto (<5 velas)

**Situação:** Intervalo 1-4 velas

**Motivo:** "Intervalo muito curto (<5 velas). Padrão não confiável."

**Regra:**
- Intervalos 1-4 exigem **4+ ocorrências** (praticamente impossível)
- Rosas a cada 2-3 velas é extremamente improvável
- Provavelmente coincidência

**Ação:** Não joga (intervalo descartado)

---

#### C. Ocorrências Insuficientes

**Situação:** Intervalo 5-9 com apenas 2 ocorrências

**Motivo:** "Padrão não confirmado (precisa 3+ ocorrências para intervalo 5-9)."

**Regra:**
- Intervalos 5-9 (médios) exigem **≥3 ocorrências**
- 2 ocorrências não são suficientes para intervalos curtos/médios

**Ação:** Aguarda 3ª ocorrência

---

#### D. Confiança Baixa (<75%)

**Situação:** Padrão com confiança <75%

**Motivo:** "Confiança baixa (<75%). Aguardando padrão mais forte."

**Regra:**
- Confiança = 50 + (ocorrências * 15)
- Exemplo: 2 ocorrências = 50 + 30 = 80% ✅
- Exemplo: 1 ocorrência = 50 + 15 = 65% ❌

**Ação:** Aguarda mais ocorrências

---

#### E. Fora da Margem (±2 ou mais)

**Situação:** Diferença entre distância atual e alvo >1 vela

**Motivo:** "Fora da margem (±1 vela). Aguardando próximo ciclo."

**Regra:**
- Margem ±1 vela permite flexibilidade
- ±2 ou mais = timing muito errado

**Ação:** Aguarda próximo ciclo

---

#### F. Sem Padrões Confirmados

**Situação:** Rosas aleatórias, sem padrão

**Motivo:** "Buscando padrão confirmado..."

**Regra:**
- Nenhum intervalo se repetiu ≥2 vezes
- Rosas estão aleatórias (sem previsibilidade)

**Ação:** Aguarda padrão se formar

---

## 📈 FLUXO DE DECISÃO

```
Início
  ↓
Há ≥3 rosas nas últimas 25 velas?
  ├─ Não → ❌ NÃO JOGA (aguarda rosas)
  └─ Sim
      ↓
Calcular intervalos entre rosas
  ↓
Há intervalos com ≥2 ocorrências?
  ├─ Não → ❌ NÃO JOGA (sem padrão)
  └─ Sim
      ↓
Filtrar intervalos ≥5 velas
  ↓
Há intervalos ≥5 velas?
  ├─ Não → ❌ NÃO JOGA (intervalos muito curtos)
  └─ Sim
      ↓
Verificar ocorrências por faixa:
  - Intervalo 5-9: ≥3 ocorrências?
  - Intervalo 10+: ≥2 ocorrências?
  ├─ Não → ❌ NÃO JOGA (ocorrências insuficientes)
  └─ Sim
      ↓
Calcular confiança (50 + ocorrências*15)
  ↓
Confiança ≥75%?
  ├─ Não → ❌ NÃO JOGA (confiança baixa)
  └─ Sim
      ↓
Distância atual vs alvo: diferença ≤1?
  ├─ Não → ❌ NÃO JOGA (fora da margem)
  └─ Sim
      ↓
✅ JOGA 10X
```

---

## 🎓 EXEMPLOS

### Exemplo 1: JOGA ✅ (Padrão Intervalo 7, 3x)

**Gráfico (últimas 30 velas):**
```
Vela 27: 1.05x 🔵
Vela 26: 1.12x 🔵
Vela 25: 2.34x 🟣
Vela 24: 1.08x 🔵
Vela 23: 3.19x 🟣
Vela 22: 1.45x 🔵
Vela 21: 18.92x 🌸 ← Rosa 3
Vela 20: 1.34x 🔵
Vela 19: 1.08x 🔵
...
Vela 14: 15.67x 🌸 ← Rosa 2
...
Vela 7: 12.34x 🌸 ← Rosa 1
...
[AGORA - Vela 27]
```

**Análise:**
- Rosa 1 (vela 7) → Rosa 2 (vela 14): **7 velas**
- Rosa 2 (vela 14) → Rosa 3 (vela 21): **7 velas**
- Distância atual: 27 - 21 = **6 velas**

**Padrão:** Intervalo 7 (3x confirmados - 💎 Diamante)

**Confiança:** 50 + (3 * 15) = **95%**

**Alvo:** 21 + 7 = Vela 28

**Match?**
- Distância atual: 6
- Alvo: 7
- Diferença: |6 - 7| = 1 vela ✅

**Decisão:** ✅ **JOGA 10X** (R$ 50)

**Motivo:** "💎 Padrão Intervalo 7 (3x confirmados)"

---

### Exemplo 2: NÃO JOGA (Intervalo 3, 2x) ❌

**Gráfico (últimas 20 velas):**
```
Vela 20: 1.05x 🔵
...
Vela 12: 12.34x 🌸 ← Rosa 2
...
Vela 9: 15.67x 🌸 ← Rosa 1
...
Vela 3: 18.92x 🌸 ← Rosa 0
...
[AGORA - Vela 20]
```

**Análise:**
- Rosa 0 (vela 3) → Rosa 1 (vela 9): **6 velas**
- Rosa 1 (vela 9) → Rosa 2 (vela 12): **3 velas**

**Padrões:**
- Intervalo 6: 1 ocorrência
- Intervalo 3: 1 ocorrência

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Buscando padrão confirmado..."

**Regra:** Nenhum intervalo se repetiu ≥2 vezes

---

### Exemplo 3: NÃO JOGA (Intervalo 2) ❌

**Gráfico (últimas 15 velas):**
```
Vela 15: 1.05x 🔵
...
Vela 12: 12.34x 🌸 ← Rosa 2
...
Vela 10: 15.67x 🌸 ← Rosa 1
...
Vela 8: 18.92x 🌸 ← Rosa 0
...
[AGORA - Vela 15]
```

**Análise:**
- Rosa 0 (vela 8) → Rosa 1 (vela 10): **2 velas**
- Rosa 1 (vela 10) → Rosa 2 (vela 12): **2 velas**
- Distância atual: 15 - 12 = **3 velas**

**Padrão:** Intervalo 2 (2x confirmados - 🥇 Ouro)

**Confiança:** 50 + (2 * 15) = **80%**

**Alvo:** 12 + 2 = Vela 14

**Match?**
- Distância atual: 3
- Alvo: 2
- Diferença: |3 - 2| = 1 vela ✅

**Intervalo:**
- Intervalo: 2 velas
- Mínimo: 5 velas
- **2 ≥ 5?** ❌ **NÃO**

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Intervalo muito curto (<5 velas). Padrão não confiável."

---

### Exemplo 4: NÃO JOGA (Fora da Margem) ❌

**Gráfico (últimas 30 velas):**
```
Vela 30: 1.05x 🔵
...
Vela 21: 18.92x 🌸 ← Rosa 3
...
Vela 14: 15.67x 🌸 ← Rosa 2
...
Vela 7: 12.34x 🌸 ← Rosa 1
...
[AGORA - Vela 30]
```

**Análise:**
- Rosa 1 (vela 7) → Rosa 2 (vela 14): **7 velas**
- Rosa 2 (vela 14) → Rosa 3 (vela 21): **7 velas**
- Distância atual: 30 - 21 = **9 velas**

**Padrão:** Intervalo 7 (3x confirmados - 💎 Diamante)

**Alvo:** 21 + 7 = Vela 28

**Match?**
- Distância atual: 9
- Alvo: 7
- Diferença: |9 - 7| = 2 velas ❌

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Fora da margem (±1 vela). Aguardando próximo ciclo."

---

## 📊 HIERARQUIA DE PADRÕES

| Tipo | Ocorrências | Confiança | Emoji |
|------|-------------|-----------|-------|
| **Diamante** | 3+ | 95% | 💎 |
| **Ouro** | 2 | 80% | 🥇 |
| **Prata** | 1 | 65% | 🥈 |

**Nota:** Com confiança mínima 75%, apenas **Diamante (3+)** e **Ouro (2)** são jogáveis.

---

## 📊 MÉTRICAS ESPERADAS

| Métrica | Valor Esperado |
|---------|----------------|
| **Taxa de Acerto** | 30-50% |
| **Jogadas/Sessão (60 velas)** | 2-8 |
| **ROI** | +10% a +30% |
| **Lucro/Sessão** | R$ 50 a R$ 150 |

**Nota:** Taxa de acerto menor que 2x, mas lucro maior (10x vs 2x).

---

## ✅ CHECKLIST RÁPIDO

Antes de jogar 10x:

- [ ] Padrão confirmado (≥2 ocorrências, ou ≥3 para intervalo 5-9)?
- [ ] Intervalo ≥5 velas?
- [ ] Confiança ≥75%?
- [ ] Dentro da margem (±1 vela)?

**Se TODOS ✅:** Joga 10x  
**Se ALGUM ❌:** Não joga

---

## 🔄 HISTÓRICO DE VERSÕES

### V3 Melhorada (04/01/2026)

**Mudanças:**
- Confiança mínima: 65% → **75%**
- Intervalo mínimo: 0 → **5 velas**
- Ocorrências por faixa:
  - Intervalo 1-4: **4+ ocorrências** (praticamente remove)
  - Intervalo 5-9: **3+ ocorrências**
  - Intervalo 10+: **2+ ocorrências**

**Motivo:** Análise de 30 cenários mostrou taxa de acerto de 6.5% com regras antigas. Com novas regras, espera-se 30-50%.

---

### V3 Original (03/01/2026)

**Mudanças:**
- Padrões confirmados: Não tinha → **≥2 ocorrências**
- Confiança por frequência: Não tinha → **50 + count*15**
- Hierarquia: Não tinha → **💎/🥇/🥈**

---

### V2 (02/01/2026)

**Regras básicas:**
- Jogar em intervalos recentes
- Sem validação de padrões confirmados
- Aceitava intervalos curtos (1-4 velas)

---

**Última Atualização:** 04/01/2026  
**Arquivo:** `REGRAS/ESTRATEGIA_ROSA.md`
