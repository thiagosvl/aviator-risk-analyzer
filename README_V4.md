# 🚀 SISTEMA V4.0 - GUIA RÁPIDO

## ✅ O Que Foi Implementado

### **1. Sistema de Pontuação**
- Features isoladas que não se anulam
- Pesos ajustáveis por feature
- Threshold configurável
- Score breakdown para debug

### **2. Sistema de Perfis**
- **Balanced** (padrão): Threshold 70 (2x) e 80 (Pink)
- **Conservative**: Threshold 80 (2x) e 90 (Pink)
- **Aggressive**: Threshold 60 (2x) e 70 (Pink)
- **Experimental**: Para testes personalizados

### **3. Ferramentas de Teste**
- `test_v4.ts`: Teste rápido com score breakdown
- `extract_from_screenshots.py`: Extração de dados de screenshots
- Grafos de teste incluídos

---

## 🎯 Como Usar

### **Testar um Grafo**

```bash
# Com perfil balanced (padrão)
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001_00h-01h.txt

# Com perfil agressivo
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001_00h-01h.txt aggressive

# Com perfil conservador
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001_00h-01h.txt conservative
```

### **Ajustar Pesos**

Edite o arquivo: `chrome-extension/src/shared/strategyWeights.ts`

```typescript
export const WEIGHTS_BALANCED: StrategyWeights = {
  roxa: {
    streak_4_plus: 40,  // ← Mude aqui
    streak_3: 30,
    conv_60_plus: 30,
    // ...
    threshold: 70,  // ← Ou mude o threshold
  },
  // ...
};
```

### **Criar Novo Perfil**

```typescript
export const WEIGHTS_MEU_PERFIL: StrategyWeights = {
  roxa: {
    ...WEIGHTS_BALANCED.roxa,
    streak_3: 40,  // Aumenta peso do streak 3
    threshold: 65,  // Threshold mais baixo
  },
  rosa: {
    ...WEIGHTS_BALANCED.rosa,
    threshold: 75,
  }
};

// Adicionar aos perfis disponíveis
export const PROFILES = {
  balanced: WEIGHTS_BALANCED,
  conservative: WEIGHTS_CONSERVATIVE,
  aggressive: WEIGHTS_AGGRESSIVE,
  meu_perfil: WEIGHTS_MEU_PERFIL,  // ← Novo perfil
};
```

---

## 📊 Como Coletar Dados

### **Método 1: Manual (Recomendado)**

1. Abra o site do Aviator
2. Copie os valores do histórico (60-100 rodadas)
3. Cole em arquivo .txt (um valor por linha)
4. Salve como `grafo_XXX.txt`

**Formato:**
```
4.02
7.15
6.85
11.27
...
```

### **Método 2: Screenshot + OCR (Futuro)**

```bash
# Instalar dependências (quando disponível)
pip3 install pytesseract pillow

# Extrair de screenshots
python3 scripts/extract_from_screenshots.py PASTA_SCREENSHOTS/
```

---

## 🔍 Entendendo os Scores

### **Exemplo de Output:**

```
━━━ Rodada 1 ━━━ Valor: 1.88x

🟣 ROXA (2x):
   Ação: PLAY_2X
   Razão: ✅ Score: 75 (Threshold: 70)
   Score Total: 75
   Breakdown:
      Streak ≥4: +40
      Conv ≥60%: +30
      Blue 40-50%: +10
      Dist 3-4: +5
      Vol MEDIUM: +10
      Deep Downtrend: -20
```

**Interpretação:**
- **Score Total: 75** → Acima do threshold (70), então JOGA
- **Streak ≥4: +40** → Sequência de 4+ roxas contribuiu com 40 pontos
- **Deep Downtrend: -20** → Mas tinha downtrend, perdeu 20 pontos
- **Resultado:** 75 pontos no total, suficiente para jogar

---

## 📈 Workflow de Otimização

### **Passo 1: Coletar 10 Grafos**
```bash
# Crie arquivos grafo_001.txt até grafo_010.txt
```

### **Passo 2: Testar com Perfil Padrão**
```bash
for i in {001..010}; do
  echo "=== Grafo $i ==="
  npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_$i.txt balanced
done
```

### **Passo 3: Anotar Resultados**
```
Grafo 001: 50% acerto, R$ 0,00
Grafo 002: 0% acerto, R$ 0,00
Grafo 003: 75% acerto, R$ +300,00
...
```

### **Passo 4: Identificar Padrões**
- Quais features aparecem em greens?
- Quais features aparecem em losses?
- Threshold está muito alto/baixo?

### **Passo 5: Ajustar Pesos**
```typescript
// Se Conv% ≥60% sempre dá green:
conv_60_plus: 40,  // Aumenta de 30 para 40

// Se Streak=2 dá muito loss:
streak_2: 10,  // Diminui de 15 para 10

// Se threshold 70 não joga quase nada:
threshold: 65,  // Diminui threshold
```

### **Passo 6: Testar Novamente**
```bash
# Testar com novos pesos
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001.txt balanced
```

### **Passo 7: Repetir até Otimizar**
- Meta: 65%+ de assertividade
- Meta: R$ +300-500 por grafo

---

## 🎯 Regras Invioláveis

Estas regras **sempre** bloqueiam, independente do score:

```typescript
// 1. Mercado quebrado (3+ blues após rosa)
if (has3BluesAfterPink) return WAIT;

// 2. Stop loss ativo (2 reds seguidos)
if (isStopLoss) return STOP;

// 3. Sem rosas na janela (para estratégia rosa)
if (pinkCount25 === 0) return WAIT;
```

Para mudar essas regras, edite `strategyCore.ts` diretamente.

---

## 📝 Próximos Passos

1. ✅ **Coletar 10 grafos** hoje
2. ✅ **Testar** com perfil balanced
3. ✅ **Anotar** resultados
4. ✅ **Ajustar** pesos baseado em dados
5. ✅ **Expandir** para 50 grafos
6. ✅ **Otimizar** até atingir metas

---

## 🆘 Troubleshooting

### **"Nenhuma jogada aconteceu"**
- Threshold muito alto → Diminua
- Pesos muito baixos → Aumente
- Grafo muito ruim → Teste outro

### **"Muitas losses"**
- Threshold muito baixo → Aumente
- Pesos errados → Revise features que deram loss
- Regras invioláveis não estão funcionando → Ajuste

### **"Overlay não funciona"**
- Recarregue a extensão
- Verifique console do navegador
- Certifique-se que está no iframe do jogo

---

## 📚 Documentação Completa

- **DESIGN_SCORE_SYSTEM.md** - Design detalhado do sistema
- **METODOLOGIA_COLETA_DADOS.md** - Como coletar dados em massa
- **strategyWeights.ts** - Arquivo de configuração de pesos
- **strategyCore.ts** - Lógica principal do sistema

---

## 🎉 Resultado dos Testes Iniciais

### **Grafo 1 (00h-01h) - Balanced**
- Jogadas 2x: 4
- Assertividade: 50%
- Lucro: R$ 0,00

### **Grafo 1 (00h-01h) - Aggressive**
- Jogadas 2x: 6
- Assertividade: 33.3%
- Lucro: R$ -200,00

### **Grafo 2 (01h-02h) - Balanced**
- Jogadas 2x: 0
- Assertividade: N/A
- Lucro: R$ 0,00

**Conclusão:** Perfil balanced está muito conservador. Precisa ajustar pesos ou threshold.

---

**Boa sorte! 🚀**
