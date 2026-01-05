# 🚀 GUIA RÁPIDO - SISTEMA AUTOMÁTICO

## ⚡ USO RÁPIDO (1 Comando)

```bash
# 1. Jogue suas screenshots PNG na pasta GRAFOS_SCREENSHOTS/
# 2. Rode:
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS balanced
```

**Pronto!** O sistema vai:
1. Extrair números de todas as imagens
2. Gerar arquivos .txt
3. Testar todos os grafos
4. Gerar relatório completo com análise

---

## 📸 PASSO A PASSO DETALHADO

### **1. Coletar Screenshots**

Tire prints do histórico do Aviator:
- Mínimo: 60-100 rodadas por print
- Formato: PNG ou JPG
- Salve com nomes descritivos

### **2. Organizar Pasta**

```bash
# Criar pasta (se não existir)
mkdir -p GRAFOS_SCREENSHOTS

# Copiar suas prints
cp ~/Downloads/aviator_*.png GRAFOS_SCREENSHOTS/

# Verificar
ls GRAFOS_SCREENSHOTS/
```

### **3. Executar Análise**

```bash
# Rodar análise completa
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS balanced
```

**O script vai pedir** que você digite os números de cada imagem (OCR automático ainda não está 100%).

### **4. Ver Resultados**

O relatório será exibido no terminal e salvo em:
```
GRAFOS_TESTE/relatorio_balanced_TIMESTAMP.txt
```

---

## 📊 ENTENDENDO O RELATÓRIO

### **Estatísticas Principais:**

```
📊 ESTATÍSTICAS GERAIS:
   Grafos testados: 10
   Rodadas totais: 1200
   Média de rodadas/grafo: 120.0

🟣 ESTRATÉGIA ROXA (2x):
   Total de jogadas: 150
   Greens: 90
   Losses: 60
   Assertividade média: 60.0%    ← META: >60%
   Taxa de entrada: 12.5%        ← IDEAL: 10-15%

💰 FINANCEIRO:
   Lucro total: R$ 3000.00
   Lucro médio/grafo: R$ 300.00  ← META: >R$200
   ROI médio: 30.0%              ← META: >20%
```

### **Análise de Regras:**

```
📊 ANÁLISE DE PERFORMANCE:

   ✅ Taxa de entrada ADEQUADA (12.7%)
      → Sistema jogando na quantidade certa

   ⚠️  ASSERTIVIDADE BAIXA (51.1%)
      → Precisa melhorar
      → Sugestão: Ajustar pesos ou threshold

   ⚠️  LUCRO BAIXO (3.3% ROI)
      → Pode melhorar
      → Meta: 20-30% ROI

   ❌ CONSISTÊNCIA BAIXA (33.3% grafos lucrativos)
      → Sistema instável
```

---

## 🎯 INTERPRETANDO RESULTADOS

### **✅ SISTEMA BOM:**
- Assertividade: **>60%**
- ROI: **>20%**
- Taxa de vitória: **>60%**
- Taxa de entrada: **10-15%**

### **⚠️ SISTEMA PRECISA AJUSTAR:**
- Assertividade: **50-60%**
- ROI: **5-20%**
- Taxa de vitória: **40-60%**

### **❌ SISTEMA RUIM:**
- Assertividade: **<50%**
- ROI: **<5%**
- Taxa de vitória: **<40%**

---

## 🔧 AJUSTANDO O SISTEMA

### **Se Assertividade Baixa (<55%):**

```typescript
// Editar: chrome-extension/src/shared/strategyWeights.ts

// OPÇÃO 1: Aumentar threshold (mais seletivo)
threshold: 60,  // Era 55

// OPÇÃO 2: Ajustar pesos
conv_60_plus: 40,  // Era 30 (valoriza mais conv rate)
blue_over_60: -40, // Era -30 (penaliza mais blue)
```

### **Se Jogando Pouco (<5%):**

```typescript
// Diminuir threshold
threshold: 50,  // Era 55
```

### **Se Jogando Muito (>20%):**

```typescript
// Aumentar threshold
threshold: 65,  // Era 55
```

---

## 🔄 WORKFLOW DE OTIMIZAÇÃO

```bash
# 1. Coletar 10 grafos
# (tire 10 screenshots e salve em GRAFOS_SCREENSHOTS/)

# 2. Testar
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS balanced

# 3. Analisar resultados
# - Assertividade: 51.1% (baixa)
# - ROI: 3.3% (baixo)
# - Sugestão: Ajustar threshold

# 4. Ajustar
# Editar strategyWeights.ts: threshold: 60

# 5. Re-testar (sem extrair de novo)
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced

# 6. Comparar
# - Assertividade: 58.0% (melhorou!)
# - ROI: 12.0% (melhorou!)

# 7. Repetir até otimizar
```

---

## 📝 COMANDOS ÚTEIS

### **Testar Perfis Diferentes:**

```bash
# Balanceado (padrão)
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS balanced

# Conservador (mais seletivo)
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS conservative

# Agressivo (mais jogadas)
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS aggressive
```

### **Re-testar Sem Extrair:**

```bash
# Se já extraiu os .txt, pode re-testar rapidamente
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced
```

### **Testar Um Grafo Individual:**

```bash
# Ver detalhes de um grafo específico
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001.txt balanced
```

### **Limpar e Recomeçar:**

```bash
# Limpar arquivos .txt
rm GRAFOS_TESTE/grafo_*.txt

# Limpar relatórios
rm GRAFOS_TESTE/relatorio_*.txt
```

---

## 🎯 META FINAL

**Objetivo:** R$ 1000 → R$ 1500 por sessão (+50%)

**Requisitos:**
- Assertividade Roxa: **70%+**
- Assertividade Rosa: **40%+**
- Volume: **15-20 jogadas/sessão**
- ROI: **30%+**

**Como chegar lá:**
1. ✅ Coletar 50-100 grafos
2. ✅ Testar múltiplos perfis
3. ✅ Identificar melhores pesos
4. ✅ Otimizar até atingir metas
5. ✅ Validar com novos grafos

---

## 🚨 TROUBLESHOOTING

### **"Nenhuma imagem encontrada"**

```bash
# Verificar se pasta existe
ls GRAFOS_SCREENSHOTS/

# Verificar formato
file GRAFOS_SCREENSHOTS/*.png
```

### **"OCR falhou"**

O OCR automático ainda não está 100%. Use entrada manual:
- Script vai pedir para você digitar os números
- Cole todos em uma linha ou várias
- Digite FIM quando terminar

### **"Assertividade muito baixa"**

- Colete mais grafos (mínimo 10)
- Ajuste threshold
- Revise pesos
- Considere adicionar mais hard blocks

---

## 📚 DOCUMENTAÇÃO COMPLETA

- `GUIA_RAPIDO.md` - Este arquivo
- `WORKFLOW_COMPLETO.md` - Workflow detalhado
- `ORDEM_LEITURA_GRAFOS.md` - Como ler grafos
- `README_V4.md` - Sistema de pontuação
- `DESIGN_SCORE_SYSTEM.md` - Design completo

---

## 🎉 PRONTO PARA USAR!

```bash
# Comece agora:
./scripts/analyze_all.sh GRAFOS_SCREENSHOTS balanced
```

**Boa sorte! 🚀**
