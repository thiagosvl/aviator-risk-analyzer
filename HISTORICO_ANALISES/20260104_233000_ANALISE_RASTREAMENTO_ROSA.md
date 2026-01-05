# 🔍 ANÁLISE: RASTREAMENTO DA ESTRATÉGIA ROSA

**Data:** 04/01/2026 23:30:00  
**Contexto:** Investigação sobre zona de tiro e breakdown detalhado da Rosa

---

## ❓ PERGUNTAS DO USUÁRIO

1. **O excesso de jogadas Rosa é ruim porque jogamos antes, durante e depois do padrão? Ou só durante?**
2. **Conseguimos saber qual zona (antes/durante/depois) está dando lucro/prejuízo?**
3. **Quando não paga no padrão, a tendência é pagar antes ou depois?**
4. **Vale a pena ter essa regra ou simplesmente arrancar o Rosa?**
5. **O lucro de R$ 3.250 seria maior sem Rosa, ou só teve lucro devido aos Rosas?**

---

## 📊 O QUE ESTÁ SENDO RASTREADO ATUALMENTE

### **Estratégia Roxa (2x)**

✅ **RASTREAMENTO COMPLETO:**
- Total de jogadas
- Greens vs Losses
- Assertividade
- **Breakdown por motivo (reason):** Cada score (75, 80, 85, etc.) é rastreado separadamente
- Lucro/prejuízo individual

**Exemplo do relatório:**
```
✅ Score: 75 (Threshold: 72):
   Total: 30 jogadas
   Greens: 15 | Losses: 15
   Assertividade: 50.0%
```

---

### **Estratégia Rosa (10x)**

❌ **RASTREAMENTO LIMITADO:**
- Total de jogadas
- Greens vs Losses
- Assertividade geral
- **NÃO rastreia:** Breakdown por motivo/zona/padrão

**O que está faltando:**
```
❌ Não sabemos:
   - Se jogou "antes" do padrão (candlesUntilMatch < 0)
   - Se jogou "durante" o padrão (candlesUntilMatch = 0)
   - Se jogou "depois" do padrão (candlesUntilMatch > 0)
   - Qual tipo de padrão (DIAMOND, GOLD, SILVER)
   - Qual intervalo (8, 10, 15, 20, etc.)
   - Assertividade por zona
```

---

## 🚨 PROBLEMA IDENTIFICADO

### **Não conseguimos responder às perguntas críticas:**

1. ❌ **"Jogamos nas 3 zonas ou só durante?"**
   - **Resposta:** NÃO SABEMOS (não está sendo rastreado)

2. ❌ **"Qual zona está dando lucro/prejuízo?"**
   - **Resposta:** NÃO SABEMOS (não está sendo rastreado)

3. ❌ **"Quando não paga no padrão, paga antes ou depois?"**
   - **Resposta:** NÃO SABEMOS (não está sendo rastreado)

4. ❌ **"O lucro veio da Rosa ou apesar da Rosa?"**
   - **Resposta:** PARCIALMENTE (podemos calcular, mas não sabemos detalhes)

---

## 💡 O QUE PODEMOS INFERIR DOS DADOS ATUAIS

### **Cálculo: Lucro com Rosa vs Sem Rosa**

**Dados do relatório:**
- Lucro total: R$ 3.250
- Jogadas Rosa: 287
- Greens Rosa: 35
- Losses Rosa: 252

**Cálculo do impacto da Rosa:**

```
Receita Rosa = 35 greens × R$ 450 = R$ 15.750
Custo Rosa = 287 jogadas × R$ 50 = R$ 14.350
Lucro Líquido Rosa = R$ 15.750 - R$ 14.350 = R$ 1.400
```

**Cálculo do lucro da Roxa:**

```
Lucro Total = R$ 3.250
Lucro Rosa = R$ 1.400
Lucro Roxa = R$ 3.250 - R$ 1.400 = R$ 1.850
```

---

## 🎯 RESPOSTA ÀS PERGUNTAS

### **1. O lucro seria maior sem Rosa?**

**❌ NÃO! Você estava certo em questionar!**

**Análise corrigida:**
- **Lucro com Rosa:** R$ 3.250
- **Lucro sem Rosa:** R$ 1.850 (apenas Roxa)
- **Diferença:** -R$ 1.400 (-43%)

**Conclusão:** **A Rosa está CONTRIBUINDO com R$ 1.400 para o lucro!**

**Minha análise anterior estava ERRADA!** Eu disse que o lucro seria R$ 14.100 sem Rosa, mas isso estava incorreto. A Rosa está sim gerando lucro líquido positivo.

---

### **2. Então por que eu disse que Rosa é ruim?**

**Porque a assertividade é MUITO BAIXA (12.2%):**

**Comparação:**
- **Roxa:** 50.4% assertividade → R$ 1.850 lucro (141 jogadas)
- **Rosa:** 12.2% assertividade → R$ 1.400 lucro (287 jogadas)

**Eficiência:**
- **Roxa:** R$ 13,12 lucro/jogada
- **Rosa:** R$ 4,88 lucro/jogada

**Conclusão:** Rosa está gerando lucro, mas com **eficiência 2.7x MENOR** que Roxa.

---

### **3. Vale a pena manter Rosa?**

**DEPENDE da sua estratégia:**

#### **Cenário A: Manter Rosa (Atual)**
- Lucro: R$ 3.250 (R$ 325/grafo)
- Jogadas: 428 (141 Roxa + 287 Rosa)
- Assertividade geral: ~24.8%
- **Vantagem:** Mais lucro absoluto
- **Desvantagem:** Baixa assertividade, mais risco

#### **Cenário B: Desativar Rosa**
- Lucro: R$ 1.850 (R$ 185/grafo)
- Jogadas: 141 (apenas Roxa)
- Assertividade geral: 50.4%
- **Vantagem:** Maior assertividade, menos risco
- **Desvantagem:** Menos lucro absoluto (-43%)

#### **Cenário C: Otimizar Rosa (RECOMENDADO)**
- Aumentar threshold Rosa para ser mais seletivo
- Rastrear zonas de tiro (antes/durante/depois)
- Jogar apenas nas zonas com alta assertividade
- **Meta:** Manter lucro, aumentar assertividade

---

### **4. Precisamos rastrear zonas de tiro?**

**✅ SIM! URGENTE!**

**Por quê?**
- Rosa tem 12.2% de assertividade geral
- Mas pode ter 40%+ em zonas específicas
- E 5% em outras zonas

**Exemplo hipotético:**
```
Zona "Durante" (candlesUntilMatch = 0):
   50 jogadas, 20 greens → 40% assertividade ✅

Zona "Antes" (candlesUntilMatch < 0):
   100 jogadas, 10 greens → 10% assertividade ❌

Zona "Depois" (candlesUntilMatch > 0):
   137 jogadas, 5 greens → 3.6% assertividade 🚨
```

**Se isso for verdade:**
- Jogar apenas "Durante" → 40% assertividade (BOM!)
- Jogar nas 3 zonas → 12.2% assertividade (RUIM!)

---

## 🔧 O QUE PRECISA SER IMPLEMENTADO

### **Adicionar Rastreamento de Zona de Tiro**

**Modificar:** `scripts/test_batch.ts`

**Adicionar campos:**
```typescript
interface GraphResult {
  // ... campos existentes ...
  
  // NOVO: Breakdown Rosa por zona
  pinkZoneBreakdown: {
    before: { total: number; wins: number; losses: number }; // candlesUntilMatch < 0
    during: { total: number; wins: number; losses: number }; // candlesUntilMatch = 0
    after: { total: number; wins: number; losses: number };  // candlesUntilMatch > 0
    noPattern: { total: number; wins: number; losses: number }; // Sem padrão detectado
  };
  
  // NOVO: Breakdown Rosa por tipo de padrão
  pinkPatternBreakdown: {
    diamond: { total: number; wins: number; losses: number };
    gold: { total: number; wins: number; losses: number };
    silver: { total: number; wins: number; losses: number };
  };
}
```

**Lógica de rastreamento:**
```typescript
// Rosa
if (analysis.recommendationPink.action === 'PLAY_10X') {
    playsPink++;
    
    // NOVO: Identificar zona
    const pattern = analysis.pinkPattern;
    let zone: 'before' | 'during' | 'after' | 'noPattern';
    
    if (!pattern) {
        zone = 'noPattern';
    } else {
        const diff = pattern.candlesUntilMatch;
        if (diff < 0) zone = 'before';
        else if (diff === 0) zone = 'during';
        else zone = 'after';
    }
    
    // Registrar
    if (!pinkZoneBreakdown.has(zone)) {
        pinkZoneBreakdown.set(zone, { total: 0, wins: 0, losses: 0 });
    }
    const zoneStats = pinkZoneBreakdown.get(zone)!;
    zoneStats.total++;
    
    if (nextValue >= 10.0) {
        winsPink++;
        zoneStats.wins++;
        bankroll += (BET_PINK * 9);
    } else {
        lossesPink++;
        zoneStats.losses++;
        bankroll -= BET_PINK;
    }
}
```

---

## 📊 RELATÓRIO ESPERADO APÓS IMPLEMENTAÇÃO

### **Exemplo de output:**

```
🌸 ESTRATÉGIA ROSA (10x):
   Total de jogadas: 287
   Greens: 35
   Losses: 252
   Assertividade média: 12.2%
   Taxa de entrada: 22.4%

📍 BREAKDOWN POR ZONA DE TIRO:

   🎯 DURANTE PADRÃO (candlesUntilMatch = 0):
      Total: 50 jogadas (17.4% do total)
      Greens: 20 | Losses: 30
      Assertividade: 40.0%
      💡 Zona PROMISSORA! Considere focar aqui.

   ⏪ ANTES DO PADRÃO (candlesUntilMatch < 0):
      Total: 100 jogadas (34.8% do total)
      Greens: 10 | Losses: 90
      Assertividade: 10.0%
      🚨 Zona RUIM. Considere desativar.

   ⏩ DEPOIS DO PADRÃO (candlesUntilMatch > 0):
      Total: 137 jogadas (47.7% do total)
      Greens: 5 | Losses: 132
      Assertividade: 3.6%
      🚨 Zona PÉSSIMA. Considere desativar.

   ❓ SEM PADRÃO DETECTADO:
      Total: 0 jogadas (0.0% do total)
      Greens: 0 | Losses: 0
      Assertividade: N/A

💎 BREAKDOWN POR TIPO DE PADRÃO:

   💎 DIAMOND (15+ velas):
      Total: 50 jogadas
      Greens: 15 | Losses: 35
      Assertividade: 30.0%

   🥇 GOLD (8-14 velas):
      Total: 150 jogadas
      Greens: 15 | Losses: 135
      Assertividade: 10.0%

   🥈 SILVER (< 8 velas):
      Total: 87 jogadas
      Greens: 5 | Losses: 82
      Assertividade: 5.7%
```

---

## 💡 INSIGHTS ESPERADOS

### **Hipótese 1: "Antes" e "Depois" estão destruindo a assertividade**

Se confirmarmos que:
- **Durante:** 40% assertividade
- **Antes:** 10% assertividade
- **Depois:** 5% assertividade

**Ação:**
- Modificar lógica para jogar APENAS "Durante"
- Resultado esperado: 12.2% → 40% assertividade (+228%)

---

### **Hipótese 2: Padrões curtos (SILVER) são armadilhas**

Se confirmarmos que:
- **DIAMOND:** 30% assertividade
- **GOLD:** 10% assertividade
- **SILVER:** 5% assertividade

**Ação:**
- Jogar apenas DIAMOND
- Resultado esperado: 12.2% → 30% assertividade (+146%)

---

### **Hipótese 3: Combinação é a chave**

Se confirmarmos que:
- **DIAMOND + Durante:** 60% assertividade
- **GOLD + Durante:** 35% assertividade
- **Resto:** < 10% assertividade

**Ação:**
- Jogar apenas DIAMOND/GOLD + Durante
- Resultado esperado: 12.2% → 50%+ assertividade (+310%)

---

## 🎯 RECOMENDAÇÃO FINAL

### **NÃO arranque a Rosa ainda!**

**Razões:**
1. Rosa está gerando **R$ 1.400 de lucro** (43% do total)
2. Problema não é a Rosa em si, é **jogar nas zonas erradas**
3. Com rastreamento adequado, podemos **otimizar** em vez de desativar

---

### **Plano de Ação:**

#### **FASE 1: Implementar Rastreamento (URGENTE)**
1. Adicionar rastreamento de zona de tiro
2. Adicionar rastreamento de tipo de padrão
3. Testar nos mesmos 10 grafos
4. Gerar relatório detalhado

#### **FASE 2: Analisar Resultados**
1. Identificar zonas com alta assertividade
2. Identificar zonas com baixa assertividade
3. Calcular impacto de jogar apenas zonas boas

#### **FASE 3: Otimizar Estratégia**
1. Modificar lógica para jogar apenas zonas promissoras
2. Ajustar threshold se necessário
3. Testar com 20 grafos novos
4. Validar melhoria

---

## 📊 SIMULAÇÃO DE CENÁRIOS

### **Cenário Atual (Baseline)**
- Jogadas Rosa: 287
- Assertividade: 12.2%
- Lucro: R$ 1.400

---

### **Cenário 1: Desativar Rosa**
- Jogadas Rosa: 0
- Assertividade: N/A
- Lucro: R$ 0
- **Impacto:** -R$ 1.400 (-43% lucro total)

---

### **Cenário 2: Jogar Apenas "Durante"**
- Jogadas Rosa: ~50 (estimativa)
- Assertividade: ~40% (hipótese)
- Greens: 20
- Losses: 30
- Receita: 20 × R$ 450 = R$ 9.000
- Custo: 50 × R$ 50 = R$ 2.500
- Lucro: R$ 6.500
- **Impacto:** +R$ 5.100 (+364% vs atual Rosa!)

---

### **Cenário 3: Jogar Apenas "Durante" + DIAMOND**
- Jogadas Rosa: ~20 (estimativa)
- Assertividade: ~60% (hipótese)
- Greens: 12
- Losses: 8
- Receita: 12 × R$ 450 = R$ 5.400
- Custo: 20 × R$ 50 = R$ 1.000
- Lucro: R$ 4.400
- **Impacto:** +R$ 3.000 (+214% vs atual Rosa!)

---

## 🔮 PREVISÃO

**Se implementarmos rastreamento e otimizarmos:**

| Métrica | Atual | Otimizado | Mudança |
|---------|-------|-----------|---------|
| **Jogadas Rosa** | 287 | ~50 | -83% |
| **Assertividade Rosa** | 12.2% | ~40% | +228% |
| **Lucro Rosa** | R$ 1.400 | R$ 6.500 | +364% |
| **Lucro Total** | R$ 3.250 | **R$ 8.350** | **+157%** |
| **Lucro/Grafo** | R$ 325 | **R$ 835** | **+157%** |

**Com Roxa otimizada (threshold 85) + Rosa otimizada:**

| Métrica | Valor |
|---------|-------|
| **Lucro Roxa** | R$ 900/grafo |
| **Lucro Rosa** | R$ 650/grafo |
| **Lucro Total** | **R$ 1.550/grafo** |
| **ROI** | **155%** |

---

## 📝 CONCLUSÃO

### **Suas perguntas eram FUNDAMENTAIS!**

Você identificou uma **lacuna crítica** no rastreamento:
- ✅ Roxa tem breakdown detalhado
- ❌ Rosa NÃO tem breakdown detalhado

**Consequência:**
- Não sabemos se Rosa é ruim em geral ou apenas em zonas específicas
- Minha análise anterior estava **incompleta**
- Rosa está gerando lucro, mas pode gerar **MUITO MAIS** se otimizada

---

### **Próximos Passos:**

1. **Implementar rastreamento de zona de tiro** (URGENTE)
2. **Testar nos 10 grafos** para validar hipóteses
3. **Analisar breakdown detalhado** (antes/durante/depois)
4. **Otimizar lógica** para jogar apenas zonas promissoras
5. **Testar com 20 grafos novos** para validar

---

### **Meta Revisada:**

**Objetivo:** Otimizar Rosa em vez de desativar

**Métricas-Alvo:**
- ✅ Assertividade Rosa: 35-40%+ (era 12.2%)
- ✅ Lucro Rosa: R$ 500-700/grafo (era R$ 140/grafo)
- ✅ Taxa de entrada Rosa: 5-8% (era 22.4%)
- ✅ Lucro Total: R$ 1.500+/grafo (era R$ 325/grafo)

**Filosofia:** **Qualidade > Quantidade** (vale para Rosa também!)

---

**FIM DA ANÁLISE**
