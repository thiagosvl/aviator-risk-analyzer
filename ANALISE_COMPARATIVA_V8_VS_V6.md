# 📊 ANÁLISE COMPARATIVA: V8 (PROPOSTO) vs V6 (ATUAL)

**Data:** 05/01/2026  
**Objetivo:** Comparar comportamento das estratégias em 20 cenários variados

**Legenda:**
- 🔵 = Azul (<2.0x)
- 🟣 = Roxa (2.0-9.9x)
- 🌸 = Rosa (≥10.0x)

---

## 📋 CENÁRIOS DE TESTE

### **CENÁRIO #1: Cluster de Rosas Recente**
```
🌸 🟣 🔵 🌸 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado + 3 rosas nas últimas 25 velas (cluster ativo)
- **Fase:** ATIVO
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado (V5 Sniper)
- **Fase:** CLUSTER
- **Confiança:** ALTA

---

### **CENÁRIO #2: Deserto Longo**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** Há 25+ velas

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (12+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (15+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

---

### **CENÁRIO #3: Rosa Colada (Após Rosa)**
```
🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🟣 🔵 🌸
```
**Última vela:** 🌸 (Rosa)

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho rosa detectado (capturar coladas)
- **Fase:** ATIVO
- **Confiança:** MÉDIA

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Aguardando vela azul (gatilho V5)
- **Fase:** NORMAL
- **Confiança:** BAIXA

---

### **CENÁRIO #4: Roxa Baixa (2.5x)**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🌸 🟣 🔵 🟣 🔵 🟣
```
**Última vela:** 🟣 (Roxa 2.5x)  
**Última rosa:** 5 velas atrás

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho roxa baixa (2-3.5x) + rosa recente (<10 velas)
- **Fase:** ATIVO
- **Confiança:** MÉDIA

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Aguardando vela azul (gatilho V5)
- **Fase:** NORMAL
- **Confiança:** BAIXA

---

### **CENÁRIO #5: Roxa Alta (8.5x)**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🌸 🟣 🔵 🟣 🔵 🟣 🔵 🟣
```
**Última vela:** 🟣 (Roxa 8.5x)  
**Última rosa:** 7 velas atrás

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Roxa alta (>3.5x) não é gatilho
- **Fase:** ATIVO
- **Confiança:** BAIXA

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Aguardando vela azul (gatilho V5)
- **Fase:** NORMAL
- **Confiança:** BAIXA

---

### **CENÁRIO #6: Quebra de Deserto**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 2 velas atrás (quebrou deserto)

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + pós-deserto (apostar nas próximas 3 rodadas)
- **Fase:** ATIVO (pós-deserto)
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + pós-deserto
- **Fase:** NORMAL (saiu de deserto)
- **Confiança:** ALTA

---

### **CENÁRIO #7: Mercado Frio (Muitas Azuis)**
```
🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** Há 25+ velas

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (12+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (15+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

---

### **CENÁRIO #8: Cluster Intenso (3 Rosas em 10 Velas)**
```
🌸 🔵 🟣 🌸 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🔵
```
**Última vela:** 🔵 (Azul)  
**Últimas 3 rosas:** Posições 1, 4, 7 (cluster)

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + cluster intenso (3 rosas em 10 velas)
- **Fase:** ATIVO
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado
- **Fase:** CLUSTER
- **Confiança:** ALTA

---

### **CENÁRIO #9: Rosa Recente + Roxa Baixa**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣
```
**Última vela:** 🟣 (Roxa 2.8x)  
**Última rosa:** 4 velas atrás

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho roxa baixa (2-3.5x) + rosa recente
- **Fase:** ATIVO
- **Confiança:** MÉDIA

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Aguardando vela azul (gatilho V5)
- **Fase:** NORMAL
- **Confiança:** BAIXA

---

### **CENÁRIO #10: Alternância Azul-Roxa**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** Há 25+ velas

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (12+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (15+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

---

### **CENÁRIO #11: Rosa Isolada + Azul**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🟣 🔵 🟣 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 6 velas atrás

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + rosa recente (<10 velas)
- **Fase:** ATIVO
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado
- **Fase:** NORMAL
- **Confiança:** ALTA

---

### **CENÁRIO #12: Duas Rosas Coladas**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🌸 🟣 🔵 🟣
```
**Última vela:** 🟣 (Roxa 5.2x)  
**Últimas 2 rosas:** Coladas (posições 4 e 5)

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Roxa alta (>3.5x) não é gatilho
- **Fase:** ATIVO
- **Confiança:** BAIXA

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Aguardando vela azul (gatilho V5)
- **Fase:** NORMAL
- **Confiança:** BAIXA

---

### **CENÁRIO #13: Grafo Esfriando (11 Velas sem Rosa)**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 10 velas atrás

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + ainda não entrou em deserto (<12 velas)
- **Fase:** ATIVO
- **Confiança:** MÉDIA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + ainda não entrou em deserto (<15 velas)
- **Fase:** NORMAL
- **Confiança:** MÉDIA

---

### **CENÁRIO #14: Entrada em Deserto (13 Velas)**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 13 velas atrás

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (13 > 12 velas)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + ainda não entrou em deserto (13 < 15 velas)
- **Fase:** NORMAL
- **Confiança:** MÉDIA

---

### **CENÁRIO #15: Mercado Quente (Muitas Roxas Altas)**
```
🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** Há 25+ velas

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (12+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (15+ velas sem rosa)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

---

### **CENÁRIO #16: Rosa + Azul Imediato**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🔵 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 2 velas atrás

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + rosa muito recente
- **Fase:** ATIVO
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado
- **Fase:** NORMAL
- **Confiança:** ALTA

---

### **CENÁRIO #17: Roxa Baixa Após Cluster**
```
🌸 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣
```
**Última vela:** 🟣 (Roxa 3.2x)  
**Últimas 2 rosas:** Posições 1 e 3 (cluster antigo)

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho roxa baixa (2-3.5x) + rosas antigas mas dentro do limite
- **Fase:** ATIVO
- **Confiança:** MÉDIA

**V6 (Atual):**
- ❌ **NÃO JOGAR**
- **Motivo:** Aguardando vela azul (gatilho V5)
- **Fase:** NORMAL
- **Confiança:** BAIXA

---

### **CENÁRIO #18: Sequência de Azuis Após Rosa**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🔵 🔵 🔵 🟣 🔵 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 6 velas atrás

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + rosa recente (<10 velas)
- **Fase:** ATIVO
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado
- **Fase:** NORMAL
- **Confiança:** ALTA

---

### **CENÁRIO #19: Rosa Antiga (14 Velas)**
```
🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🔵
```
**Última vela:** 🔵 (Azul)  
**Última rosa:** 14 velas atrás

**V8 (Proposto):**
- ❌ **NÃO JOGAR**
- **Motivo:** Deserto detectado (14 > 12 velas)
- **Fase:** DESERTO
- **Confiança:** ALTA (bloqueio)

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + ainda não entrou em deserto (14 < 15 velas)
- **Fase:** NORMAL
- **Confiança:** MÉDIA

---

### **CENÁRIO #20: Mix Equilibrado**
```
🔵 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🟣 🔵
```
**Última vela:** 🔵 (Azul)  
**Últimas 2 rosas:** Posições 11 e 20 (distribuídas)

**V8 (Proposto):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul + rosa recente (<10 velas)
- **Fase:** ATIVO
- **Confiança:** ALTA

**V6 (Atual):**
- ✅ **JOGAR**
- **Motivo:** Gatilho azul detectado
- **Fase:** NORMAL
- **Confiança:** ALTA

---

## 📊 RELATÓRIO COMPARATIVO

### **V8 (PROPOSTO) - RESUMO:**

**Total de Jogadas:** 13/20 (65%)

**Motivos para JOGAR:**
1. **Gatilho Azul:** 10x (76.9%)
2. **Gatilho Roxa Baixa:** 3x (23.1%)
3. **Gatilho Rosa (colada):** 1x (7.7%)

**Motivos para NÃO JOGAR:**
1. **Deserto (12+ velas):** 6x (85.7%)
2. **Roxa alta (>3.5x):** 1x (14.3%)

**Distribuição por Fase:**
- **ATIVO:** 13 jogadas
- **DESERTO:** 7 bloqueios

---

### **V6 (ATUAL) - RESUMO:**

**Total de Jogadas:** 11/20 (55%)

**Motivos para JOGAR:**
1. **Gatilho Azul:** 11x (100%)

**Motivos para NÃO JOGAR:**
1. **Deserto (15+ velas):** 5x (55.6%)
2. **Aguardando azul:** 4x (44.4%)

**Distribuição por Fase:**
- **CLUSTER:** 2 jogadas
- **NORMAL:** 9 jogadas
- **DESERTO:** 5 bloqueios

---

## 🔍 ANÁLISE COMPARATIVA

### **1. TAXA DE JOGADAS**

| Estratégia | Jogadas | Taxa |
|------------|---------|------|
| **V8 (Proposto)** | 13/20 | **65%** |
| **V6 (Atual)** | 11/20 | **55%** |

**Diferença:** +18% mais jogadas no V8

**Motivo:** Gatilho expandido (azul + roxa baixa + rosa colada)

---

### **2. OPORTUNIDADES PERDIDAS (V6)**

**Cenários onde V6 não jogou mas V8 jogou:**

1. **Cenário #3:** Rosa colada (V8 captura, V6 perde)
2. **Cenário #4:** Roxa baixa (V8 captura, V6 perde)
3. **Cenário #9:** Roxa baixa (V8 captura, V6 perde)
4. **Cenário #17:** Roxa baixa (V8 captura, V6 perde)

**Total:** 4 oportunidades perdidas (20% dos cenários)

---

### **3. BLOQUEIOS MAIS AGRESSIVOS (V8)**

**Cenários onde V8 bloqueou mas V6 jogou:**

1. **Cenário #14:** 13 velas sem rosa (V8 bloqueia, V6 joga)
2. **Cenário #19:** 14 velas sem rosa (V8 bloqueia, V6 joga)

**Total:** 2 bloqueios extras (10% dos cenários)

**Motivo:** Deserto mais agressivo (12 velas vs 15 velas)

---

### **4. DIVERSIDADE DE GATILHOS (V8)**

**V8:**
- Gatilho Azul: 76.9%
- Gatilho Roxa Baixa: 23.1%
- Gatilho Rosa: 7.7%

**V6:**
- Gatilho Azul: 100%

**Conclusão:** V8 tem **3 tipos de gatilhos** vs 1 tipo no V6

---

### **5. PROTEÇÃO CONTRA DESERTO**

**V8:**
- Bloqueios: 7 (35%)
- Limite: 12 velas

**V6:**
- Bloqueios: 5 (25%)
- Limite: 15 velas

**Conclusão:** V8 bloqueia **40% mais cedo** que V6

---

## 🎯 CONCLUSÕES

### **Vantagens do V8:**

1. ✅ **+18% mais jogadas** (captura mais oportunidades)
2. ✅ **Captura rosas coladas** (13% das rosas no mercado)
3. ✅ **Captura rosas após roxa** (36.5% das rosas no mercado)
4. ✅ **Proteção mais agressiva** contra deserto
5. ✅ **Diversidade de gatilhos** (3 tipos vs 1)

### **Desvantagens do V8:**

1. ⚠️ **Mais exposição ao risco** (mais jogadas = mais REDs potenciais)
2. ⚠️ **Gatilho roxa pode ser menos confiável** (precisa validação)
3. ⚠️ **Bloqueio mais agressivo** pode perder algumas oportunidades

### **Recomendação Final:**

> **V8 é superior ao V6 em teoria, MAS precisa de validação com backtest antes de usar dinheiro real.**

**Próximos passos:**
1. Implementar V8 no código
2. Rodar backtest nos 30 grafos
3. Validar assertividade (meta: 18-22%)
4. Comparar ROI (meta: 25-35%)
5. Se validado, testar com apostas pequenas

---

**Data:** 05/01/2026  
**Status:** Análise completa - Aguardando implementação e testes  
**Prioridade:** ALTA
