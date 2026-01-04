# 📋 ANÁLISE DAS REGRAS ATUAIS - CÓDIGO VS ESPECIFICAÇÃO

**Data:** 04/01/2026  
**Versão:** V3 (Padrões Confirmados)

---

## ✅ REGRAS IMPLEMENTADAS CORRETAMENTE

### 1. **Estratégia Rosa (10x) - Padrões Confirmados**

**Regra:** Só joga em padrões com ≥2 ocorrências do mesmo intervalo.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 287-291)
const confirmedIntervals = Array.from(frequencyMap.entries())
    .filter(([_, count]) => count >= 2)  // ✅ Filtro correto
    .sort((a, b) => b[1] - a[1]);

if (confirmedIntervals.length === 0) return null;  // ✅ Retorna null se não houver padrões confirmados
```

**Status:** ✅ Implementado corretamente no `patternService.ts`

---

### 2. **Confiança Baseada em Frequência**

**Regra:** Confiança = 50 + (ocorrências * 15), máximo 95%.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 299-300)
let confidence = 50 + (count * 15);
confidence = Math.min(confidence, 95);
```

**Exemplos:**
- 2 ocorrências: 50 + (2 * 15) = **80%**
- 3 ocorrências: 50 + (3 * 15) = **95%**
- 4+ ocorrências: **95%** (cap)

**Status:** ✅ Implementado corretamente

---

### 3. **Hierarquia de Padrões (Diamante/Ouro/Prata)**

**Regra:**
- **Diamante (💎):** ≥3 ocorrências
- **Ouro (🥇):** 2 ocorrências
- **Prata (🥈):** 1 ocorrência (mas V3 não joga em prata!)

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 302-304)
let type: 'DIAMOND' | 'GOLD' | 'SILVER' = 'SILVER';
if (count >= 3) type = 'DIAMOND';
else if (count >= 2) type = 'GOLD';
```

**Observação:** Como só aceita `count >= 2`, nunca retorna SILVER na prática. ✅ Correto!

**Status:** ✅ Implementado corretamente

---

### 4. **Janela de Momentum (25 velas)**

**Regra:** Só analisa rosas nas últimas 25 velas.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 268)
const pinkIndices = values
  .slice(0, 25) // ✅ STRICT Momentum (Last 25 candles only)
  .map((v, i) => (v >= 10.0 ? i : -1))
  .filter(i => i !== -1);
```

**Status:** ✅ Implementado corretamente

---

### 5. **Margem de Tolerância (±1 vela)**

**Regra:** Aceita padrão se distância atual está a ±1 vela do intervalo confirmado.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 295-297)
for (const [interval, count] of confirmedIntervals) {
    const diff = Math.abs(currentDistance - interval);
    
    if (diff <= 1) {  // ✅ Margem de ±1
        // ... retorna padrão
    }
}
```

**Status:** ✅ Implementado corretamente

---

### 6. **Confiança Mínima para Jogar (60%)**

**Regra:** Só sugere PLAY_10X se confiança ≥ 60%.

**Implementação:** ⚠️ **PRECISA AJUSTE**

```typescript
// patternService.ts (linha 188)
if (pinkPattern && pinkPattern.confidence >= 60 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
```

**Problema:** Confiança mínima está 60%, mas deveria ser **65%** segundo regras V3.

**Correção necessária:**
```typescript
if (pinkPattern && pinkPattern.confidence >= 65 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
```

**Status:** ⚠️ **AJUSTE NECESSÁRIO** (60% → 65%)

---

### 7. **Densidade de Volatilidade**

**Regra:**
- **ALTA:** ≥10% de rosas nas últimas 50 velas
- **MÉDIA:** ≥6% de rosas
- **BAIXA:** <6% de rosas

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 34-45)
const densityCheckWindow = Math.min(values.length, 50);
const recentValues = values.slice(0, densityCheckWindow);
const pinkCount = recentValues.filter(v => v >= 10.0).length;
const pinkDensityPercent = (pinkCount / densityCheckWindow) * 100;

let volatilityDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
if (densityCheckWindow >= 3) {
    if (pinkDensityPercent >= 10) volatilityDensity = 'HIGH';
    else if (pinkDensityPercent >= 6) volatilityDensity = 'MEDIUM';
}
```

**Status:** ✅ Implementado corretamente

---

### 8. **Trava Pós-Rosa (3 velas) com Exceção**

**Regra:**
- Pula 3 velas após rosa (estratégia 2x)
- **Exceção:** Se "double blue" (2 reds seguidos) ocorreu ≤1 vez nas últimas 25 velas, ignora trava

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 67-77)
const doubleBlueStats = this.calculateDoubleBlueStats(values, 25);
const isDoubleBlueSafe = doubleBlueStats <= 1; // 0 ou 1 ocorrência

let isPostPinkLock = candlesSinceLastPink < 3; 

let lockReason = `Trava Pós-Rosa (${candlesSinceLastPink}/3). Aguarde correção.`;
if (isPostPinkLock && isDoubleBlueSafe) {
    isPostPinkLock = false; // Override lock
}
```

**Status:** ✅ Implementado corretamente

---

### 9. **Stop Loss (2 Azuis Seguidas)**

**Regra:** Se streak ≤ -2 (2 ou mais azuis seguidas), para de jogar (estratégia 2x).

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 81)
const isStopLoss = streak <= -2;

// patternService.ts (linha 106-112)
if (isStopLoss) {
    return {
        action: 'STOP_LOSS',
        reason: 'Stop Loss: 2 Reds Seguidos. Pare!',
        riskLevel: 'CRITICAL',
        confidence: 100
    };
}
```

**Status:** ✅ Implementado corretamente

---

### 10. **Taxa de Conversão de Roxas (50%)**

**Regra:** Só joga em sequência roxa se conversão ≥ 50%.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 85)
const isPurpleStreakValid = streak >= 1 && purpleConversionRate >= 50;

// patternService.ts (linha 161-176)
if (streak >= 2) {
   if (isValidStreak) {  // isValidStreak = purpleConversionRate >= 50
       return {
           action: 'PLAY_2X',
           reason: 'Surfando Sequência (Conversão > 50%).',
           riskLevel: 'LOW',
           confidence: 85
       };
   } else {
       return {
           action: 'WAIT',
           reason: 'Sequência Suspeita (Conversão Baixa).',
           riskLevel: 'MEDIUM',
           confidence: 50
       };
   }
}
```

**Status:** ✅ Implementado corretamente

---

### 11. **Amostragem Mínima para Conversão (2 oportunidades)**

**Regra:** Requer ≥2 oportunidades para calcular conversão, caso contrário retorna 0%.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 248)
if (opportunities < 2) return 0;
```

**Status:** ✅ Implementado corretamente

---

### 12. **Recuperação Lenta (3 Reds Recentes)**

**Regra:** Se houver 3 reds nas últimas 5 velas, exige 3 roxas para jogar (ao invés de 2).

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 115-120)
const last5 = values.slice(0, 5);
const recentBlues = last5.filter(v => v < 2.0).length;
const deepDowntrend = recentBlues >= 3;

// patternService.ts (linha 138-157)
if (streak === 1) {
    return {
        action: 'WAIT',
        reason: deepDowntrend 
           ? 'Recuperação Lenta (3 Reds Recentes). Aguarde 3 Roxas.' 
           : 'Aguardando 2ª vela roxa para confirmar.',
        riskLevel: 'MEDIUM',
        confidence: 80
    };
}

if (streak === 2 && deepDowntrend) {
     return {
         action: 'WAIT',
         reason: 'Recuperação Lenta (3 Reds Recentes). Aguarde 3 Roxas.',
         riskLevel: 'MEDIUM',
         confidence: 85
     };
}
```

**Status:** ✅ Implementado corretamente

---

### 13. **Separação de Estratégias (2x e Pink)**

**Regra:** Estratégias 2x e Pink são independentes. Rosa não é afetada por trava pós-rosa.

**Implementação:** ✅ **CORRETO**

```typescript
// patternService.ts (linha 88-89)
const rec2x = this.decideAction2x(...);  // Independente
const recPink = this.decideActionPink(pinkPattern);  // Independente
```

**Status:** ✅ Implementado corretamente

---

## ❌ INCONSISTÊNCIAS ENCONTRADAS

### 1. **Confiança Mínima (60% vs 65%)**

**Localização:** `patternService.ts` linha 188

**Atual:**
```typescript
if (pinkPattern && pinkPattern.confidence >= 60 && ...)
```

**Deveria ser:**
```typescript
if (pinkPattern && pinkPattern.confidence >= 65 && ...)
```

**Impacto:** Aceita padrões com confiança 60-64%, quando deveria exigir ≥65%.

**Correção:** ⚠️ **NECESSÁRIA**

---

### 2. **simulation_script.ts Desatualizado**

**Problema:** `simulation_script.ts` é uma cópia do `patternService.ts`, mas pode estar desatualizado.

**Verificação necessária:**
- Comparar ambos os arquivos
- Sincronizar lógica
- Garantir que testes usem regras atualizadas

**Status:** ⏳ **VERIFICAÇÃO PENDENTE**

---

## 📊 RESUMO

| Regra | Status | Observação |
|-------|--------|------------|
| **Padrões Confirmados (≥2)** | ✅ Correto | Implementado |
| **Confiança por Frequência** | ✅ Correto | 50 + (count * 15) |
| **Hierarquia (💎/🥇/🥈)** | ✅ Correto | Nunca retorna prata |
| **Janela 25 velas** | ✅ Correto | Momentum estrito |
| **Margem ±1** | ✅ Correto | Tolerância implementada |
| **Confiança Mínima** | ⚠️ **60% → 65%** | **AJUSTE NECESSÁRIO** |
| **Densidade** | ✅ Correto | HIGH/MEDIUM/LOW |
| **Trava Pós-Rosa + Exceção** | ✅ Correto | Double blue check |
| **Stop Loss** | ✅ Correto | 2 reds seguidos |
| **Conversão 50%** | ✅ Correto | Validação de sequência |
| **Amostragem Mínima** | ✅ Correto | ≥2 oportunidades |
| **Recuperação Lenta** | ✅ Correto | 3 reds = 3 roxas |
| **Separação de Estratégias** | ✅ Correto | Independentes |

---

## 🔧 AÇÕES NECESSÁRIAS

### 1. **Ajustar Confiança Mínima**

**Arquivo:** `chrome-extension/src/content/services/patternService.ts`

**Linha:** 188

**Mudança:**
```diff
- if (pinkPattern && pinkPattern.confidence >= 60 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
+ if (pinkPattern && pinkPattern.confidence >= 65 && Math.abs(pinkPattern.candlesUntilMatch) <= 1) {
```

---

### 2. **Sincronizar simulation_script.ts**

**Arquivo:** `simulation_script.ts`

**Ação:** Verificar se está com a mesma lógica do `patternService.ts`

**Verificações:**
- ✅ Filtro de padrões confirmados (≥2)
- ✅ Confiança mínima (65%)
- ✅ Janela de 25 velas
- ✅ Todas as regras V3

---

### 3. **Criar Arquivo de Configuração de Testes**

**Objetivo:** Centralizar parâmetros de testes para facilitar ajustes futuros.

**Conteúdo:**
- Número de rodadas (60)
- Rodadas iniciais (25 - não jogáveis)
- Rodadas jogáveis (35)
- Valores de apostas (bet2x, bet10x)
- Banca inicial
- Regras de validação

---

### 4. **Documentar Modelo de Testes**

**Objetivo:** Criar guia para geração de testes consistentes.

**Conteúdo:**
- Como gerar gráficos de teste
- Como validar resultados
- Como interpretar métricas
- Como ajustar parâmetros

---

## ✅ CONCLUSÃO

**Status Geral:** 🟢 **92% Correto**

**Inconsistências:** 1 ajuste necessário (confiança mínima)

**Próximos Passos:**
1. Ajustar confiança mínima (60% → 65%)
2. Sincronizar simulation_script.ts
3. Criar arquivo de configuração de testes
4. Documentar modelo de testes
5. Limpar arquivos antigos
6. Commitar tudo organizado

---

**Data de Análise:** 04/01/2026  
**Versão Analisada:** V3 (Padrões Confirmados)  
**Próxima Revisão:** Após ajustes
