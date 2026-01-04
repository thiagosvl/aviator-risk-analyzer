# 🧪 GUIA DE TESTES - AVIATOR ANALYZER V3

**Data:** 04/01/2026  
**Versão:** V3 (Padrões Confirmados)

---

## 🎯 OBJETIVO

Este guia recomenda os **melhores cenários de teste** para validar as Regras V3 em diferentes situações.

---

## 📊 TIPOS DE TESTES

### 1. ✅ TESTE RÁPIDO (1 Cenário)

**Objetivo:** Validar que código está funcionando

**Quando usar:**
- Após fazer mudanças no código
- Debugging
- Validação rápida

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 1
```

**Tempo:** ~1 segundo

**O que verificar:**
- ✅ Gráfico gerado (60 rodadas)
- ✅ Composição realista (~50% azuis, ~40% roxas, ~10% rosas)
- ✅ Jogadas realizadas (se houver padrões confirmados)
- ✅ Métricas calculadas (ROI, taxa de acerto)
- ✅ Sem erros no console

**Exemplo de saída:**
```
## 📊 Cenário 1

**Gráfico Completo (60 rodadas):**
2.41x 1.01x 1.31x 1.41x 2.43x 45.47x ...

**Composição:**
- 🔵 Azuis (<2x): 28 (46.7%)
- 🟣 Roxas (2-9.99x): 29 (48.3%)
- 🌸 Rosas (≥10x): 3 (5.0%)

**Jogadas Realizadas (5 total):**
...

**Resultado Final:**
| **ROI** | +10.0% |
```

---

### 2. ✅ TESTE MÉDIO (10 Cenários)

**Objetivo:** Análise preliminar de assertividade

**Quando usar:**
- Antes de mudanças grandes no código
- Validação de novas regras
- Comparação antes/depois

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 10
```

**Tempo:** ~5 segundos

**O que verificar:**
- ✅ ROI médio entre -10% e +50%
- ✅ Taxa de acerto entre 40% e 70%
- ✅ Alguns cenários com lucro, outros com prejuízo (variação natural)
- ✅ Consolidado com interpretação automática
- ✅ Nenhum cenário com ROI extremo (> 100% ou < -50%)

**Métricas esperadas:**

| Métrica | Valor Esperado | Aceitável |
|---------|----------------|-----------|
| **ROI Médio** | +5% a +15% | -10% a +50% |
| **Taxa de Acerto Média** | 50% a 60% | 40% a 70% |
| **Jogadas/Cenário** | 3 a 8 | 0 a 15 |

**Exemplo de consolidado:**
```
## 📊 CONSOLIDADO (10 Cenários)

| **Média de Jogadas/Cenário** | 5.3 |
| **Taxa de Acerto Média** | 54.2% |
| **ROI Médio** | +12.5% |

**Interpretação:**
✅ **Excelente!** ROI médio acima de 10%. Regras V3 estão funcionando bem.
```

---

### 3. ✅ TESTE COMPLETO (30 Cenários)

**Objetivo:** Validação estatística robusta

**Quando usar:**
- Validação final antes de produção
- Relatórios oficiais
- Análise estatística completa

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/validacao_$(date +%Y%m%d).md
```

**Tempo:** ~15 segundos

**O que verificar:**
- ✅ ROI médio positivo ou próximo de zero
- ✅ Taxa de acerto consistente (não muito variável)
- ✅ Distribuição de lucros/prejuízos razoável
- ✅ Regras V3 sendo respeitadas em todos os cenários
- ✅ Poucos outliers (cenários extremos)

**Métricas esperadas:**

| Métrica | Valor Esperado |
|---------|----------------|
| **ROI Médio** | +5% a +20% |
| **Taxa de Acerto Média** | 50% a 60% |
| **% Cenários Lucrativos** | 50% a 70% |
| **% Cenários Sem Jogadas** | 10% a 30% |

**Análise recomendada:**

1. **Distribuição de ROI:**
   - Quantos cenários com ROI > 20%?
   - Quantos cenários com ROI < -20%?
   - Distribuição é normal (gaussiana)?

2. **Padrões:**
   - Cenários com padrões confirmados: Taxa de acerto?
   - Cenários sem padrões confirmados: Banca preservada?

3. **Estratégias:**
   - Taxa de acerto 2x vs 10x
   - Qual estratégia contribui mais para o ROI?

---

### 4. ✅ TESTE COMPARATIVO (Antes/Depois)

**Objetivo:** Validar impacto de mudanças no código

**Quando usar:**
- Após ajustar parâmetros (ex: confiança mínima 65% → 70%)
- Após implementar novas regras
- Comparação de versões (V2 vs V3)

**Fluxo:**

```bash
# 1. Gerar baseline (antes da mudança)
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/antes_$(date +%Y%m%d).md

# 2. Fazer mudança no código
# (ex: editar patternService.ts)

# 3. Gerar novo teste (depois da mudança)
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/depois_$(date +%Y%m%d).md

# 4. Comparar métricas
echo "=== ANTES ==="
grep "ROI Médio" TESTES/resultados/antes_*.md | tail -1
grep "Taxa de Acerto Média" TESTES/resultados/antes_*.md | tail -1

echo "=== DEPOIS ==="
grep "ROI Médio" TESTES/resultados/depois_*.md | tail -1
grep "Taxa de Acerto Média" TESTES/resultados/depois_*.md | tail -1
```

**Tempo:** ~30 segundos (total)

**O que verificar:**
- ✅ ROI melhorou ou piorou?
- ✅ Taxa de acerto melhorou ou piorou?
- ✅ Número de jogadas aumentou ou diminuiu?
- ✅ Mudança foi na direção esperada?

**Exemplo de análise:**

| Métrica | Antes | Depois | Mudança |
|---------|-------|--------|---------|
| **ROI Médio** | +12.5% | +15.3% | +2.8% ✅ |
| **Taxa de Acerto** | 54.2% | 58.1% | +3.9% ✅ |
| **Jogadas/Cenário** | 5.3 | 4.1 | -1.2 ✅ (mais seletivo) |

**Interpretação:** Mudança foi positiva! ROI e taxa de acerto melhoraram, com menos jogadas (mais seletivo).

---

### 5. ✅ TESTE DE ESTRESSE (100 Cenários)

**Objetivo:** Validação estatística extrema

**Quando usar:**
- Validação final antes de lançamento
- Análise de longo prazo
- Detecção de outliers raros

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 100 > TESTES/resultados/estresse_$(date +%Y%m%d).md
```

**Tempo:** ~30 segundos

**O que verificar:**
- ✅ ROI médio estável (não muito diferente de 30 cenários)
- ✅ Taxa de acerto convergindo para valor esperado
- ✅ Sem outliers extremos (ROI > 100% ou < -50%)
- ✅ Distribuição normal (gaussiana)
- ✅ Desvio padrão razoável

**Métricas esperadas:**

| Métrica | Valor Esperado |
|---------|----------------|
| **ROI Médio** | +5% a +20% |
| **Desvio Padrão ROI** | 10% a 30% |
| **Taxa de Acerto Média** | 50% a 60% |
| **% Outliers (ROI > 50%)** | < 5% |
| **% Outliers (ROI < -30%)** | < 5% |

**Análise avançada:**

1. **Distribuição de ROI:**
   ```bash
   # Extrair ROIs de todos os cenários
   grep "| \*\*ROI\*\*" TESTES/resultados/estresse_*.md | grep -v "ROI Médio" | awk '{print $4}' > /tmp/rois.txt
   
   # Calcular estatísticas
   python3 -c "
   import numpy as np
   rois = [float(line.strip('%')) for line in open('/tmp/rois.txt')]
   print(f'Média: {np.mean(rois):.1f}%')
   print(f'Mediana: {np.median(rois):.1f}%')
   print(f'Desvio Padrão: {np.std(rois):.1f}%')
   print(f'Mínimo: {np.min(rois):.1f}%')
   print(f'Máximo: {np.max(rois):.1f}%')
   "
   ```

2. **Histograma de ROI:**
   - Quantos cenários em cada faixa?
   - Distribuição é simétrica?

---

## 🎓 CENÁRIOS ESPECÍFICOS

### 6. ✅ TESTE DE PADRÕES CONFIRMADOS

**Objetivo:** Validar que só joga em padrões confirmados (≥2 ocorrências)

**Método:**
1. Gerar 30 cenários
2. Para cada cenário com jogadas 10x, verificar:
   - Padrão tinha ≥2 ocorrências?
   - Confiança era ≥65%?
   - Margem de tolerância ±1 respeitada?

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > /tmp/test_padroes.md

# Verificar jogadas 10x
grep "10x:" /tmp/test_padroes.md | grep -v "⏳"
```

**Análise:**
- Se houver jogadas 10x, verificar se o motivo menciona "confirmados"
- Exemplo: `10x: ✅ +450 | 💎 Padrão Intervalo 7 (3x confirmados)`

---

### 7. ✅ TESTE DE STOP LOSS

**Objetivo:** Validar que para após 2 reds seguidos

**Método:**
1. Gerar 30 cenários
2. Procurar por sequências de 2 reds seguidos
3. Verificar se parou (não jogou na próxima)

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > /tmp/test_stoploss.md

# Procurar por 2 reds seguidos
grep -A 1 "❌" /tmp/test_stoploss.md | grep "❌"
```

**Análise:**
- Se houver 2 reds seguidos, próxima linha NÃO deve ter jogada
- Ou deve ter mensagem "Stop Loss"

---

### 8. ✅ TESTE DE TRAVA PÓS-ROSA

**Objetivo:** Validar que aguarda 3 velas após rosa (ou exceção double blue)

**Método:**
1. Gerar 30 cenários
2. Identificar rosas (≥10x)
3. Verificar se jogou nas próximas 3 velas

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > /tmp/test_trava.md

# Procurar por rosas no gráfico
grep -E "[0-9]+\.[0-9]+x" /tmp/test_trava.md | grep -E "[1-9][0-9]\.[0-9]+x"
```

**Análise:**
- Após rosa, verificar se jogou nas próximas 3 rodadas
- Se jogou, verificar se foi exceção (double blue ≤1)

---

### 9. ✅ TESTE DE RECUPERAÇÃO LENTA

**Objetivo:** Validar que exige 3 roxas após 3 reds seguidos

**Método:**
1. Gerar 30 cenários
2. Procurar por 3 azuis seguidas
3. Verificar se exigiu 3 roxas para jogar

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > /tmp/test_recuperacao.md

# Procurar por mensagem "Recuperação Lenta"
grep "Recuperação Lenta" /tmp/test_recuperacao.md
```

**Análise:**
- Se houver 3 azuis seguidas, deve aparecer "Recuperação Lenta"
- Deve exigir 3 roxas (não jogar com 1 ou 2)

---

### 10. ✅ TESTE DE CONVERSÃO

**Objetivo:** Validar que só surfa sequência com conversão ≥50%

**Método:**
1. Gerar 30 cenários
2. Para cada jogada 2x, verificar:
   - Estava em sequência (≥2 roxas)?
   - Taxa de conversão era ≥50%?

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > /tmp/test_conversao.md

# Procurar por jogadas 2x
grep "2x: ✅\|2x: ❌" /tmp/test_conversao.md
```

**Análise:**
- Jogadas 2x devem ter motivo "Surfando Sequência"
- Ou estar em retomada (aguardando 2ª roxa)

---

## 📊 MATRIZ DE DECISÃO

### Quando usar cada tipo de teste:

| Situação | Teste Recomendado | Tempo | Objetivo |
|----------|-------------------|-------|----------|
| **Após mudança no código** | Teste Rápido (1) | 1s | Validar que não quebrou |
| **Antes de commit** | Teste Médio (10) | 5s | Validar assertividade |
| **Antes de deploy** | Teste Completo (30) | 15s | Validação robusta |
| **Após ajustar parâmetros** | Teste Comparativo | 30s | Comparar antes/depois |
| **Antes de lançamento** | Teste de Estresse (100) | 30s | Validação extrema |
| **Validar regra específica** | Teste Específico | 15s | Foco em uma regra |

---

## 🎯 CHECKLIST DE VALIDAÇÃO

Antes de considerar código pronto:

### Testes Gerais:
- [ ] Teste Rápido (1 cenário) passou?
- [ ] Teste Médio (10 cenários) com ROI > 0%?
- [ ] Teste Completo (30 cenários) com ROI > 5%?
- [ ] Taxa de acerto entre 40-70%?

### Testes Específicos:
- [ ] Padrões confirmados: Só joga com ≥2 ocorrências?
- [ ] Stop Loss: Para após 2 reds?
- [ ] Trava Pós-Rosa: Aguarda 3 velas (ou exceção)?
- [ ] Recuperação Lenta: Exige 3 roxas após 3 reds?
- [ ] Conversão: Só surfa com ≥50%?

### Testes Comparativos:
- [ ] V3 melhor que V2?
- [ ] Ajuste de parâmetro melhorou ROI?
- [ ] Mudança teve impacto esperado?

---

## 💡 DICAS

### 1. **Sempre salvar resultados**

```bash
# Bom
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/teste_$(date +%Y%m%d).md

# Ruim
npx tsx TESTES/generate_test_scenarios.ts 30
```

**Por quê?** Você pode querer analisar depois ou comparar com outros testes.

---

### 2. **Usar seed para reproduzir cenários**

```bash
# Gerar cenário com seed fixa
RANDOM_SEED=12345 npx tsx TESTES/generate_test_scenarios.ts 1
```

**Por quê?** Útil para debugging (sempre gera o mesmo cenário).

**Nota:** Precisa implementar seed no gerador (futuro).

---

### 3. **Analisar outliers**

```bash
# Encontrar cenários com ROI extremo
grep "| \*\*ROI\*\*" TESTES/resultados/teste_*.md | grep -E "\+[5-9][0-9]%|\-[3-9][0-9]%"
```

**Por quê?** Outliers podem indicar bugs ou situações raras.

---

### 4. **Comparar com gráficos reais**

```bash
# Gerar 10 cenários
npx tsx TESTES/generate_test_scenarios.ts 10

# Comparar com gráfico real que você enviou
# Verificar se comportamento é similar
```

**Por quê?** Validar que gerador está realista.

---

## 📚 REFERÊNCIAS

- **Regras V3:** `VALIDACAO_COMPLETA_V3.md`
- **Código Principal:** `chrome-extension/src/content/services/patternService.ts`
- **Gerador:** `TESTES/generate_test_scenarios.ts`
- **Configuração:** `TESTES/test_config.json`
- **Modelo de Testes:** `TESTES/MODELO_DE_TESTES.md`

---

## ✅ RESUMO

**Testes Recomendados:**

1. **Diário:** Teste Rápido (1 cenário) - 1s
2. **Antes de commit:** Teste Médio (10 cenários) - 5s
3. **Antes de deploy:** Teste Completo (30 cenários) - 15s
4. **Após mudanças:** Teste Comparativo - 30s
5. **Antes de lançamento:** Teste de Estresse (100 cenários) - 30s

**Total de tempo:** ~1 minuto para validação completa!

---

**Última Atualização:** 04/01/2026  
**Próxima Revisão:** Após implementação de seed para reproduzibilidade
