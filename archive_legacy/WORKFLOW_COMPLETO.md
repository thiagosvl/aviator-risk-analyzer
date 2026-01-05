# 🚀 WORKFLOW COMPLETO: SCREENSHOT → ANÁLISE

## 📋 VISÃO GERAL

Este guia mostra **3 maneiras** de coletar e testar grafos do Aviator:

1. **Manual** - Você digita os números (mais confiável)
2. **Semi-automático** - Você cola, script processa (recomendado)
3. **Automático** - OCR extrai tudo (futuro)

---

## 🎯 OPÇÃO 1: MANUAL (Mais Confiável)

### **Passo 1: Tirar Screenshot**

Tire print do histórico completo do Aviator:

![Screenshot Example](../docs/screenshot_example.png)

**Dicas:**
- Capture pelo menos 60-100 rodadas
- Certifique-se que os números estão legíveis
- Salve com nome descritivo: `grafo_003_02h-03h.png`

### **Passo 2: Criar Arquivo Manualmente**

```bash
# Criar arquivo
nano GRAFOS_TESTE/grafo_003.txt

# Ou usar qualquer editor de texto
```

**Digite os valores** (da esquerda pra direita, linha por linha):

```
1.33
9.38
1.19
1.06
3.45
...
```

**IMPORTANTE:** Ordem de leitura é **esquerda → direita, linha por linha** (como ler um livro)

### **Passo 3: Testar**

```bash
# Testar um grafo
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_003.txt balanced

# Ver detalhes completos
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_003.txt balanced --details
```

---

## 🤖 OPÇÃO 2: SEMI-AUTOMÁTICO (Recomendado)

### **Passo 1: Tirar Screenshot** (igual ao método manual)

### **Passo 2: Extrair com Script Interativo**

```bash
npx tsx scripts/extract_interactive.ts
```

**O que acontece:**

1. Script pergunta: `Nome do arquivo (ex: grafo_003):`
   - Digite: `grafo_003`

2. Script pede: `Cole os valores abaixo`
   - Você olha a screenshot e digita/cola: `1.33 9.38 1.19 1.06 3.45 ...`
   - Pode colar tudo em uma linha ou várias linhas
   - Quando terminar, digite: `FIM`

3. Script valida e salva: `GRAFOS_TESTE/grafo_003.txt`

4. Script pergunta: `Deseja testar agora? (s/n)`
   - Digite: `s`
   - Escolha perfil: `balanced`
   - Teste roda automaticamente!

**Vantagens:**
- ✅ Validação automática
- ✅ Aceita vários formatos (1.33x, 1.33, 1,33)
- ✅ Testa imediatamente
- ✅ Sem dependências externas

---

## 🚀 OPÇÃO 3: AUTOMÁTICO (OCR - Futuro)

### **Passo 1: Salvar Screenshots em Pasta**

```
GRAFOS_SCREENSHOTS/
  screenshot_001.png
  screenshot_002.png
  screenshot_003.png
  ...
```

### **Passo 2: Instalar Tesseract OCR**

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-por

# macOS
brew install tesseract

# Windows
# Baixe de: https://github.com/UB-Mannheim/tesseract/wiki
```

### **Passo 3: Rodar Script All-in-One**

```bash
npx tsx scripts/process_all.ts GRAFOS_SCREENSHOTS balanced
```

**O que acontece:**
1. Script encontra todas as imagens
2. Extrai números com OCR
3. Gera arquivos .txt
4. Testa todos automaticamente
5. Gera relatório consolidado

**Status:** ⚠️ OCR ainda não está 100% confiável. Use Opção 1 ou 2 por enquanto.

---

## 📊 TESTE EM MASSA

Depois de coletar vários grafos, teste todos de uma vez:

```bash
# Testar todos os grafos da pasta
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced

# Testar com perfil conservador
npx tsx scripts/test_batch.ts GRAFOS_TESTE conservative

# Testar com perfil agressivo
npx tsx scripts/test_batch.ts GRAFOS_TESTE aggressive
```

**Output:**
```
================================================================================
RELATÓRIO CONSOLIDADO
================================================================================

📊 ESTATÍSTICAS GERAIS:
   Grafos testados: 3
   Rodadas totais: 355
   Média de rodadas/grafo: 118.3

🟣 ESTRATÉGIA ROXA (2x):
   Total de jogadas: 17
   Greens: 7
   Losses: 10
   Assertividade média: 41.2%
   Taxa de entrada: 4.8%

💰 FINANCEIRO:
   Lucro total: R$ -300.00
   Lucro médio/grafo: R$ -100.00
   ROI médio: -10.0%

📈 DISTRIBUIÇÃO:
   Grafos lucrativos: 1 (33.3%)
   Grafos no empate: 1 (33.3%)
   Grafos com prejuízo: 1 (33.3%)

🏆 TOP 5 MELHORES:
   1. grafo_002_01h-02h.txt: R$ 200.00 (75.0% acerto, 4 jogadas)
   ...

💡 RECOMENDAÇÕES:
   • Poucas jogadas (4.8%). Considere diminuir threshold para 60.
   • Assertividade baixa. Revise pesos das features ou aumente threshold.
```

---

## 🎯 WORKFLOW RECOMENDADO

### **Para 10-20 Grafos (Começando)**

```bash
# 1. Tire screenshots
# 2. Use extração interativa
npx tsx scripts/extract_interactive.ts
# (Repita para cada grafo)

# 3. Teste em massa
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced

# 4. Analise resultados
# 5. Ajuste pesos/threshold
# 6. Re-teste
```

### **Para 100+ Grafos (Produção)**

```bash
# 1. Tire 100 screenshots e salve em GRAFOS_SCREENSHOTS/

# 2. Extraia todos de uma vez (quando OCR estiver pronto)
npx tsx scripts/process_all.ts GRAFOS_SCREENSHOTS balanced

# 3. Analise relatório consolidado

# 4. Ajuste sistema

# 5. Re-teste com novos grafos
```

---

## 📝 EXEMPLO COMPLETO

### **Cenário: Coletar 5 grafos de hoje**

```bash
# 1. Tirar screenshots
# - 00h-01h → screenshot_001.png
# - 01h-02h → screenshot_002.png
# - 02h-03h → screenshot_003.png
# - 03h-04h → screenshot_004.png
# - 04h-05h → screenshot_005.png

# 2. Extrair cada um
npx tsx scripts/extract_interactive.ts
# Nome: grafo_001_00h-01h
# Cole valores: 1.06 1.21 3.42 ...
# FIM
# Testar agora? s
# Perfil: balanced

# (Repita para os outros 4)

# 3. Teste consolidado
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced

# 4. Ver resultados
cat GRAFOS_TESTE/relatorio_balanced_*.txt

# 5. Ajustar se necessário
# Editar: chrome-extension/src/shared/strategyWeights.ts
# Mudar threshold de 70 para 60

# 6. Re-testar
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced
```

---

## 🔧 DICAS E TRUQUES

### **1. Nomear Grafos Descritivamente**

```
✅ GOOD:
grafo_001_00h-01h.txt
grafo_002_01h-02h.txt
grafo_003_02h-03h_sabado.txt

❌ BAD:
grafo1.txt
teste.txt
aaa.txt
```

### **2. Validar Extração**

Depois de extrair, sempre confira:

```bash
# Ver quantas linhas
wc -l GRAFOS_TESTE/grafo_003.txt
# Deve ter 60-150 linhas

# Ver primeiras linhas
head GRAFOS_TESTE/grafo_003.txt

# Ver últimas linhas
tail GRAFOS_TESTE/grafo_003.txt
```

### **3. Organizar por Período**

```
GRAFOS_TESTE/
  2026-01-04/
    grafo_001_00h-01h.txt
    grafo_002_01h-02h.txt
  2026-01-05/
    grafo_003_00h-01h.txt
    grafo_004_01h-02h.txt
```

### **4. Backup dos Grafos**

```bash
# Fazer backup
tar -czf grafos_backup_$(date +%Y%m%d).tar.gz GRAFOS_TESTE/

# Restaurar
tar -xzf grafos_backup_20260104.tar.gz
```

---

## ⚠️ PROBLEMAS COMUNS

### **"Nenhum valor encontrado"**

**Causa:** Formato incorreto

**Solução:**
- Certifique-se de usar ponto (.) não vírgula (,)
- Aceita: `1.33`, `1.33x`, `1,33`, `1,33x`
- Não aceita: `1.33.`, `x1.33`

### **"Poucas velas (menos de 60)"**

**Causa:** Screenshot incompleto

**Solução:**
- Tire screenshot com mais rodadas
- Ou continue mesmo assim (menos preciso)

### **"Assertividade muito baixa"**

**Causa:** Threshold muito baixo ou pesos errados

**Solução:**
- Aumente threshold: `60 → 70`
- Ou ajuste pesos das features
- Ou colete mais grafos para validar

### **"Estratégia Rosa não ativou"**

**Causa:** Threshold muito alto (80)

**Solução:**
- Diminua threshold: `80 → 70`
- Ou ajuste pesos da estratégia rosa

---

## 📚 REFERÊNCIAS

- `scripts/extract_interactive.ts` - Extração interativa
- `scripts/test_v4.ts` - Teste individual
- `scripts/test_batch.ts` - Teste em massa
- `scripts/process_all.ts` - Processamento automático
- `ORDEM_LEITURA_GRAFOS.md` - Como ler grafos
- `README_V4.md` - Guia completo do sistema

---

## 🎉 PRONTO PARA COMEÇAR!

**Comece agora:**

```bash
# 1. Tire uma screenshot
# 2. Extraia os valores
npx tsx scripts/extract_interactive.ts
# 3. Veja os resultados!
```

**Boa sorte! 🚀**
