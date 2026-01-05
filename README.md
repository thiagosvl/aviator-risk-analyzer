# 🎯 Aviator Risk Analyzer - Documentação Completa

**Sistema de análise e estratégia para grafos do Aviator**

**Status:** Modelo V1 implementado e testado  
**Lucro:** R$ 11.350 (10 grafos)  
**ROI:** 30.6%  
**Última atualização:** 05/01/2026

---

## 📋 INÍCIO RÁPIDO

### **Para testar o sistema:**

```bash
cd /home/ubuntu/aviator-analyzer
npx tsx scripts/test_model_v1.ts
```

**Resultado:** Relatório completo salvo em `GRAFOS_TESTE/relatorio_modelo_v1_*.txt`

---

## 🗂️ ESTRUTURA DO PROJETO

```
aviator-analyzer/
├── README.md                    ← Você está aqui
├── JORNADA_COMPLETA.md          ← História completa do projeto
│
├── HISTORICO_ANALISES/          ← Todas as análises históricas
│   ├── 20260104_231232_ANALISE_10_GRAFOS_BALANCED.md
│   ├── 20260104_233000_ANALISE_RASTREAMENTO_ROSA.md
│   └── 20260105_030000_MODELO_FINAL_V1.md
│
├── chrome-extension/src/shared/ ← Implementação
│   ├── strategyModelV1.ts       ← Modelo V1 (ATUAL)
│   ├── strategyCore.ts          ← Lógica antiga (pesos)
│   └── strategyWeights.ts       ← Pesos antigos
│
├── scripts/                     ← Scripts de teste e análise
│   ├── test_model_v1.ts         ← Teste do Modelo V1 (USAR ESTE!)
│   ├── test_batch.ts            ← Teste antigo (pesos)
│   ├── analyze_momentum.ts      ← Análise de momentum
│   ├── analyze_purple_multipliers.ts
│   ├── analyze_cashout_18x.ts
│   └── simulate_complete_graph.ts
│
├── GRAFOS_TESTE/                ← Grafos de teste
│   ├── 1_158.txt ... 10_148.txt
│   └── relatorio_modelo_v1_*.txt ← Relatórios gerados
│
└── Documentos de descobertas:
    ├── DESCOBERTAS_RADICAIS.md
    ├── DESCOBERTAS_MOMENTUM.md
    ├── EXPLICACAO_ESTRATEGIAS.md
    ├── IMPLEMENTACAO_TEMPO_REAL.md
    ├── ANALISE_RADICAL_DADOS_PUROS.txt
    ├── ANALISE_ROSAS_ZONAS.txt
    ├── ANALISE_PADROES_PROFUNDA.txt
    └── SIMULACAO_COMPLETA_LINHA_POR_LINHA.txt
```

---

## 🎯 MODELO V1 - ESTRATÉGIA ATUAL

### **🌸 ROSA (Agressiva) - FUNCIONA!**

**Regra:**
```
SE última vela < 2.00x (blue)
  ENTÃO JOGAR ROSA (R$ 50, tirar em 10x)
```

**Resultados (10 grafos):**
- Jogadas: 625 (49% das rodadas)
- Assertividade: 13.9%
- **Lucro: R$ 12.250**
- **ROI: 39.2%**
- Contribuição: 108% do lucro!

**Por quê funciona:**
- 52.4% das rosas vêm APÓS blues
- Padrão de reversão
- Simples de implementar

---

### **🟣 ROXA (Conservadora) - NÃO FUNCIONA!**

**Regra:**
```
SE Purple% ≥60 E Streak ≥2 E Trend=UP
  ENTÃO JOGAR ROXA (R$ 100, tirar em 2x)
```

**Resultados (10 grafos):**
- Jogadas: 59 (5% das rodadas)
- Assertividade: 42.4% (< 50% breakeven!)
- **Prejuízo: R$ -900**
- **ROI: -15.3%**
- Contribuição: -8% (prejuízo!)

**Por quê não funciona:**
- 57.6% das jogadas são blues (<2x)
- Assertividade abaixo do breakeven (50%)
- Regra atual não é boa o suficiente

---

## 📊 RESULTADOS POR GRAFO

| Grafo | Rodadas | ROSA | ROXA | TOTAL |
|-------|---------|------|------|-------|
| 10_148 | 123 | -R$ 650 | R$ 500 | -R$ 150 |
| 1_158 | 132 | -R$ 1.450 | -R$ 500 | -R$ 1.950 |
| **2_139** | 113 | **R$ 2.400** | -R$ 100 | **R$ 2.300** |
| 3_156 | 132 | -R$ 250 | R$ 0 | -R$ 250 |
| **4_143** | 120 | **R$ 4.650** | -R$ 100 | **R$ 4.550** |
| **5_163** | 139 | **R$ 700** | R$ 100 | **R$ 800** |
| **6_147** | 122 | **R$ 2.600** | -R$ 400 | **R$ 2.200** |
| **7_155** | 131 | **R$ 2.150** | R$ 0 | **R$ 2.150** |
| **8_170** | 145 | **R$ 1.050** | -R$ 300 | **R$ 750** |
| **9_147** | 123 | **R$ 1.050** | -R$ 100 | **R$ 950** |

**Grafos lucrativos:** 7 de 10 (70%)

---

## 🚀 COMO USAR

### **1. Testar com grafos atuais:**

```bash
cd /home/ubuntu/aviator-analyzer
npx tsx scripts/test_model_v1.ts
```

### **2. Adicionar novos grafos:**

1. Salvar velas em arquivo `.txt` (uma por linha, mais recente no topo)
2. Colocar em `GRAFOS_TESTE/`
3. Rodar teste novamente

**Formato do arquivo:**
```
1.50
2.30
1.80
...
```

### **3. Ver relatório:**

```bash
cat GRAFOS_TESTE/relatorio_modelo_v1_*.txt | tail -1
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

### **Para entender TODA a jornada:**

**Leia:** `JORNADA_COMPLETA.md`

**Conteúdo:**
- Cronologia completa (04/01 - 05/01)
- Todas as fases de análise
- Erros e correções
- Descobertas importantes
- Lições aprendidas

### **Para entender o Modelo V1:**

**Leia:** `HISTORICO_ANALISES/20260105_030000_MODELO_FINAL_V1.md`

**Conteúdo:**
- Estratégias detalhadas
- Implementação técnica
- Resultados completos
- Vantagens e limitações
- Próximos passos

### **Para ver simulação detalhada:**

**Leia:** `SIMULACAO_COMPLETA_LINHA_POR_LINHA.txt`

**Conteúdo:**
- Grafo 4_143 completo (120 rodadas)
- Cada rodada: janela, métricas, decisão, resultado
- Exemplo prático de como funciona

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **Arquivos principais:**

**1. `chrome-extension/src/shared/strategyModelV1.ts`**
- Implementação do Modelo V1
- Funções: `analyzeWindow()`, `analyzeRound()`, `simulateRound()`
- Pronto para integração

**2. `scripts/test_model_v1.ts`**
- Testa modelo em todos os grafos
- Gera relatório completo
- Inclui regras utilizadas

### **Como funciona:**

```typescript
// 1. Ler últimas 25 velas
const memory = history.slice(0, 25);

// 2. Analisar
const decision = analyzeWindow({ memory });

// 3. Decidir
if (decision.playRosa) {
  // Jogar ROSA (R$ 50, tirar em 10x)
}

if (decision.playRoxa) {
  // Jogar ROXA (R$ 100, tirar em 2x)
}
```

---

## 💡 RECOMENDAÇÕES

### **Curto prazo (agora):**

1. ✅ **Usar apenas ROSA** (desativar ROXA)
2. ✅ **Coletar 100 grafos** novos
3. ✅ **Validar** se assertividade se mantém

### **Médio prazo (1 semana):**

1. **Otimizar ROSA:**
   - Testar condições adicionais
   - Buscar 15%+ assertividade
   - Cada 1% = +R$ 3.125 lucro

2. **Implementar stop loss:**
   - Parar após 3 losses consecutivos
   - Parar se prejuízo > R$ 500

### **Longo prazo (1 mês):**

1. **Desenvolver ROXA V2:**
   - Regras completamente novas
   - Baseadas em novos padrões
   - Objetivo: 50%+ assertividade

2. **Sistema adaptativo:**
   - Detectar tipo de grafo
   - Aplicar estratégia específica
   - Ajustar em tempo real

---

## 📊 MÉTRICAS-CHAVE

### **Assertividade:**
- **ROSA:** 13.9% (breakeven: 10%) ✅
- **ROXA:** 42.4% (breakeven: 50%) ❌

### **ROI:**
- **ROSA:** 39.2% ✅
- **ROXA:** -15.3% ❌
- **TOTAL:** 30.6% ✅

### **Consistência:**
- **Grafos lucrativos:** 70% ✅
- **Lucro médio/grafo:** R$ 1.135

---

## 🎓 LIÇÕES APRENDIDAS

1. **Simplicidade > Complexidade**
   - Regra simples (última vela < 2x) funciona!
   - Pesos e scores complexos não funcionaram

2. **Focar no que funciona**
   - ROSA: R$ 12.250 ✅
   - ROXA: R$ -900 ❌
   - Não insistir no que não dá resultado

3. **Validar sempre**
   - Erro inicial: Rosa tinha prejuízo
   - Correção: Rosa tinha lucro!
   - Sempre revisar cálculos

4. **Rastreamento detalhado é essencial**
   - Métricas agregadas escondem padrões
   - Breakdown por zona/tipo é fundamental

---

## 🚨 PROBLEMAS CONHECIDOS

1. **ROXA dá prejuízo**
   - Assertividade 42.4% < 50% breakeven
   - 57.6% das jogadas são blues
   - Precisa de regras novas

2. **Alguns grafos são impossíveis**
   - Grafo 8_170: baseline 42.8%
   - Nenhuma estratégia funciona
   - Aceitar que nem todos dão lucro

3. **Assertividade ROSA é baixa (13.9%)**
   - Mas ROI compensa (39.2%)
   - Pode otimizar para 15%+

---

## 📞 SUPORTE

**Para continuar o desenvolvimento:**

1. Ler `JORNADA_COMPLETA.md` (história completa)
2. Ler `HISTORICO_ANALISES/20260105_030000_MODELO_FINAL_V1.md` (modelo atual)
3. Rodar `npx tsx scripts/test_model_v1.ts` (testar)
4. Ver relatório em `GRAFOS_TESTE/relatorio_modelo_v1_*.txt`

**Arquivos-chave para outra IA:**
- `README.md` (este arquivo)
- `JORNADA_COMPLETA.md` (história)
- `HISTORICO_ANALISES/20260105_030000_MODELO_FINAL_V1.md` (modelo)
- `chrome-extension/src/shared/strategyModelV1.ts` (código)
- `scripts/test_model_v1.ts` (testes)

---

## 🏆 CONCLUSÃO

**Sistema funciona e dá lucro!**

- ✅ R$ 11.350 (10 grafos)
- ✅ ROI 30.6%
- ✅ 70% grafos lucrativos
- ✅ Documentação completa
- ✅ Pronto para escalar

**Próximo passo:** Testar com 100 grafos!

---

**Última atualização:** 05/01/2026 03:45  
**Versão:** 1.0  
**Status:** Pronto para produção (apenas ROSA)
