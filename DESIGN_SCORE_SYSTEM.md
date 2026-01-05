# 🎯 DESIGN: SISTEMA DE PONTUAÇÃO V4.0

> **Filosofia:** O padrão é **NÃO JOGAR**. Só jogamos quando o score atingir threshold mínimo.

---

## 📐 PRINCÍPIOS FUNDAMENTAIS

### 1. **Isolamento de Features**
Cada característica do grafo contribui **independentemente** para o score:
- ✅ Streak não anula Conv%
- ✅ Blue% não anula Padrão
- ✅ Cada feature adiciona ou subtrai pontos

### 2. **Threshold Ajustável**
```
Score < 50: NÃO JOGA
Score 50-69: ZONA CINZA (aguarda mais confirmação)
Score ≥ 70: JOGA (alta confiança)
```

### 3. **Regras Invioláveis (Hard Blocks)**
Algumas condições **bloqueiam** completamente, independente do score:
- ❌ 3+ blues consecutivos após último rosa (mercado quebrado)
- ❌ Stop loss ativo (2 reds seguidos)
- ❌ Banca < R$500 (proteção de capital)

---

## 🟣 ESTRATÉGIA ROXA (2x) - SISTEMA DE PONTUAÇÃO

### **Features e Pesos**

| Feature | Condição | Pontos | Justificativa |
|---------|----------|--------|---------------|
| **Streak Roxo** | Streak ≥ 4 | +40 | Momentum forte |
| | Streak = 3 | +30 | Momentum bom |
| | Streak = 2 | +15 | Momentum fraco |
| | Streak = 1 | +5 | Início de tendência |
| **Conversion Rate** | Conv% ≥ 60% | +30 | Mercado convertendo bem |
| | Conv% 50-59% | +20 | Mercado mediano |
| | Conv% 40-49% | +10 | Mercado fraco |
| | Conv% < 40% | -10 | Mercado ruim |
| **Densidade Blue** | Blue% < 40% | +20 | Mercado aberto |
| | Blue% 40-50% | +10 | Mercado neutro |
| | Blue% 50-60% | 0 | Mercado travado |
| | Blue% > 60% | -30 | Mercado muito travado |
| **Distância do Rosa** | 5+ velas do rosa | +15 | Fora da zona de risco |
| | 3-4 velas do rosa | +5 | Zona segura |
| | < 3 velas do rosa | -50 | Zona de risco (trava) |
| **Volatilidade** | Densidade MEDIUM | +10 | Mercado ativo |
| | Densidade HIGH | +5 | Mercado muito volátil |
| | Densidade LOW | 0 | Mercado calmo |
| **Padrão Xadrez** | Detectado | +10 | Alternância confirmada |
| **Deep Downtrend** | 3+ reds recentes | -20 | Recuperação lenta |

### **Exemplo de Cálculo**

```
Cenário 1: Streak=3, Conv%=55%, Blue%=45%, 6 velas do rosa
Score = 30 + 20 + 10 + 15 = 75 → JOGA ✅

Cenário 2: Streak=2, Conv%=45%, Blue%=55%, 4 velas do rosa
Score = 15 + 10 + 0 + 5 = 30 → NÃO JOGA ❌

Cenário 3: Streak=4, Conv%=65%, Blue%=35%, 2 velas do rosa
Score = 40 + 30 + 20 + (-50) = 40 → NÃO JOGA ❌ (trava pós-rosa)
```

### **Hard Blocks (Bloqueios Absolutos)**

```typescript
// Estas condições SEMPRE bloqueiam, independente do score:
if (has3ConsecutiveBluesAfterPink) return WAIT; // Mercado quebrado
if (stopLossActive) return STOP; // 2 reds seguidos
if (bankroll < 500) return STOP; // Proteção de capital
```

---

## 🌸 ESTRATÉGIA ROSA (10x) - SISTEMA DE PONTUAÇÃO

### **Features e Pesos**

| Feature | Condição | Pontos | Justificativa |
|---------|----------|--------|---------------|
| **Padrão Detectado** | Intervalo com 4+ ocorrências | +50 | Padrão forte |
| | Intervalo com 3 ocorrências | +35 | Padrão médio |
| | Intervalo com 2 ocorrências | +20 | Padrão fraco |
| | Sem padrão | -30 | Sem previsibilidade |
| **Zona de Tiro** | Exato (diff = 0) | +30 | Momento perfeito |
| | Próximo (diff = ±1) | +20 | Momento bom |
| | Distante (diff > 1) | -20 | Fora da zona |
| **Frequência Rosa** | 3+ rosas em 25 | +20 | Alta frequência |
| | 2 rosas em 25 | +10 | Frequência normal |
| | 1 rosa em 25 | 0 | Frequência baixa |
| | 0 rosas em 25 | -50 | Sem padrão |
| **Distância do Rosa** | 5+ velas do rosa | +15 | Fora da zona de risco |
| | 3-4 velas do rosa | +5 | Zona segura |
| | < 3 velas do rosa | -40 | Zona de risco |
| **Intervalo do Padrão** | Intervalo 3-5 | +15 | Padrão curto (mais confiável) |
| | Intervalo 6-10 | +10 | Padrão médio |
| | Intervalo > 10 | +5 | Padrão longo |
| **Confiança do Padrão** | Confidence ≥ 80% | +20 | Alta confiança |
| | Confidence 70-79% | +10 | Confiança média |
| | Confidence < 70% | 0 | Baixa confiança |

### **Exemplo de Cálculo**

```
Cenário 1: Padrão intervalo 4 (3x), diff=0, 2 rosas, 6 velas do rosa, conf=75%
Score = 35 + 30 + 10 + 15 + 15 + 10 = 115 → JOGA ✅

Cenário 2: Padrão intervalo 8 (2x), diff=2, 1 rosa, 4 velas do rosa, conf=65%
Score = 20 + (-20) + 0 + 5 + 10 + 0 = 15 → NÃO JOGA ❌

Cenário 3: Sem padrão, 3 rosas, 2 velas do rosa
Score = (-30) + 20 + (-40) = -50 → NÃO JOGA ❌
```

### **Hard Blocks (Bloqueios Absolutos)**

```typescript
// Estas condições SEMPRE bloqueiam:
if (pinkCount25 === 0) return WAIT; // Sem rosa, sem jogo
if (has3ConsecutiveBluesAfterPink) return WAIT; // Mercado quebrado
if (bankroll < 500) return STOP; // Proteção de capital
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **Estrutura de Código**

```typescript
interface ScoreBreakdown {
  streak: number;
  conversionRate: number;
  blueDensity: number;
  pinkDistance: number;
  volatility: number;
  pattern: number;
  downtrend: number;
  total: number;
}

function calculateScore2x(features: Features): ScoreBreakdown {
  let score: ScoreBreakdown = {
    streak: 0,
    conversionRate: 0,
    blueDensity: 0,
    pinkDistance: 0,
    volatility: 0,
    pattern: 0,
    downtrend: 0,
    total: 0
  };
  
  // Streak
  if (features.streak >= 4) score.streak = 40;
  else if (features.streak === 3) score.streak = 30;
  else if (features.streak === 2) score.streak = 15;
  else if (features.streak === 1) score.streak = 5;
  
  // Conversion Rate
  if (features.convRate >= 60) score.conversionRate = 30;
  else if (features.convRate >= 50) score.conversionRate = 20;
  else if (features.convRate >= 40) score.conversionRate = 10;
  else score.conversionRate = -10;
  
  // ... outras features
  
  score.total = Object.values(score).reduce((sum, val) => sum + val, 0);
  return score;
}

function decideAction2x(features: Features): Recommendation {
  // 1. Hard blocks (sempre bloqueiam)
  if (features.has3BluesAfterPink) {
    return { action: 'WAIT', reason: 'Mercado quebrado (3+ blues)' };
  }
  if (features.stopLoss) {
    return { action: 'STOP', reason: 'Stop loss ativo' };
  }
  
  // 2. Calcular score
  const scoreBreakdown = calculateScore2x(features);
  
  // 3. Decisão baseada em threshold
  if (scoreBreakdown.total >= 70) {
    return { 
      action: 'PLAY_2X', 
      reason: `Score: ${scoreBreakdown.total} (Alta confiança)`,
      confidence: Math.min(95, scoreBreakdown.total),
      scoreBreakdown // Para debug
    };
  } else if (scoreBreakdown.total >= 50) {
    return { 
      action: 'WAIT', 
      reason: `Score: ${scoreBreakdown.total} (Zona cinza - aguarde)`,
      confidence: scoreBreakdown.total
    };
  } else {
    return { 
      action: 'WAIT', 
      reason: `Score: ${scoreBreakdown.total} (Baixa confiança)`,
      confidence: scoreBreakdown.total
    };
  }
}
```

---

## 📊 AJUSTE DE THRESHOLDS

Os thresholds podem ser ajustados baseado em dados reais:

### **Perfis de Risco**

```typescript
const PROFILES = {
  conservative: { threshold2x: 80, thresholdPink: 90 },
  balanced: { threshold2x: 70, thresholdPink: 80 },
  aggressive: { threshold2x: 60, thresholdPink: 70 }
};
```

### **Ajuste Dinâmico**

```typescript
// Se últimos 10 plays tiveram >70% de acerto, fica mais agressivo
if (recentWinRate > 70) {
  threshold = PROFILES.aggressive.threshold2x;
} else if (recentWinRate < 50) {
  threshold = PROFILES.conservative.threshold2x;
} else {
  threshold = PROFILES.balanced.threshold2x;
}
```

---

## 🧪 VALIDAÇÃO

### **Testes Necessários**

1. **Teste de Regressão:** Rodar sistema novo nos 10 grafos antigos
2. **Teste A/B:** Comparar V3.10 vs V4.0 em 50 grafos novos
3. **Análise de Sensibilidade:** Testar thresholds 60, 70, 80, 90

### **Métricas de Sucesso**

- Assertividade Roxa: **≥ 65%** (vs 53.8% atual)
- Assertividade Rosa: **≥ 35%** (vs 0% atual)
- Volume de jogadas: **15-25 por 100 rodadas** (vs 13 atual)
- Lucro médio: **+R$300-500 por sessão**

---

## 🎯 VANTAGENS DO SISTEMA DE PONTUAÇÃO

1. **Transparência:** Você vê exatamente por que jogou ou não
2. **Ajustabilidade:** Pode mudar pesos sem reescrever lógica
3. **Debugging:** Score breakdown mostra qual feature está falhando
4. **Não-binário:** Zona cinza permite "quase jogar" e aguardar
5. **Evolutivo:** Pode adicionar novas features sem quebrar as antigas

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Implementar `calculateScore2x()` e `calculateScorePink()`
2. ✅ Adicionar `scoreBreakdown` na interface `Recommendation`
3. ✅ Atualizar overlay para mostrar score visual
4. ✅ Criar testes unitários para cada feature
5. ✅ Rodar testes em massa com 50+ grafos reais
6. ✅ Ajustar pesos baseado em resultados
