# 🧪 DIRETÓRIO DE TESTES

**Versão:** 2.0.0  
**Data:** 04/01/2026

---

## 📁 ESTRUTURA

```
TESTES/
├── README.md                      # Este arquivo
├── test_config.json               # Configuração centralizada de testes
├── MODELO_DE_TESTES.md            # Documentação completa do modelo
├── generate_test_scenarios.ts     # ✅ NOVO GERADOR (formato visual)
├── simulation_script.ts           # Gerador antigo (formato tabela)
└── resultados/                    # Resultados de testes
    └── README.md
```

---

## 🎯 PROPÓSITO

Este diretório contém:

1. **Configuração de Testes** (`test_config.json`)
   - Parâmetros centralizados
   - Regras V3
   - Valores de banca e apostas

2. **Documentação** (`MODELO_DE_TESTES.md`)
   - Como gerar testes
   - Como validar resultados
   - Boas práticas

3. **Geradores**
   - **`generate_test_scenarios.ts`** ✅ **RECOMENDADO**
     - Formato visual idêntico aos prints
     - Gráfico em linha única
     - Fácil de analisar
     - Consolidado automático
   
   - **`simulation_script.ts`** (legado)
     - Formato tabela com emojis
     - Mais verboso
     - Mantido para compatibilidade

4. **Resultados** (pasta `resultados/`)
   - Saídas de testes anteriores
   - Histórico de validações

---

## 🚀 COMO USAR

### 1. **Gerar Testes (RECOMENDADO)**

```bash
# Gerar 1 cenário (teste rápido)
npx tsx TESTES/generate_test_scenarios.ts 1

# Gerar 10 cenários (análise média)
npx tsx TESTES/generate_test_scenarios.ts 10

# Gerar 30 cenários (análise completa - padrão)
npx tsx TESTES/generate_test_scenarios.ts

# Salvar em arquivo
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/resultado_$(date +%Y%m%d).md
```

---

### 2. **Formato de Saída**

#### Exemplo de Cenário:

```markdown
## 📊 Cenário 1

**Gráfico Completo (60 rodadas):**

\`\`\`
2.41x 1.01x 1.31x 1.41x 2.43x 45.47x 1.00x 1.25x 1.61x 4.29x 6.53x 1.49x 2.32x 10.88x 1.18x 6.72x 2.13x 3.46x 7.55x 1.31x 2.20x 1.77x 1.82x 1.42x 1.04x 8.09x 3.46x 1.20x 1.28x 1.08x 1.98x 1.25x 14.13x 1.67x 1.60x 2.59x 1.18x 3.91x 1.32x 7.70x 1.23x 3.90x 1.48x 1.60x 2.11x 2.06x 1.19x 1.74x 2.61x 1.19x 5.22x 2.62x 6.93x 1.31x 1.27x 4.52x 2.81x 2.58x 1.11x 1.06x
\`\`\`

**Composição:**
- 🔵 Azuis (<2x): 28 (46.7%)
- 🟣 Roxas (2-9.99x): 29 (48.3%)
- 🌸 Rosas (≥10x): 3 (5.0%)

**Jogadas Realizadas (5 total):**

**Rodada 37:** 2.59x | 2x: ✅ +100 | 10x: ⏳ | Saldo: R$ 1100.00
**Rodada 38:** 1.18x | 2x: ❌ -100 | 10x: ⏳ | Saldo: R$ 1000.00
...

**Resultado Final:**

| Métrica | Valor |
|---------|-------|
| **Total de Jogadas** | 5 |
| **Greens** | 3 ✅ |
| **Reds** | 2 ❌ |
| **Taxa de Acerto** | 60.0% |
| **Banca Final** | R$ 1100.00 |
| **Lucro/Prejuízo** | +R$ 100.00 |
| **ROI** | +10.0% |
```

---

### 3. **Ajustar Parâmetros**

Editar `test_config.json`:

```json
{
  "bankroll": {
    "initialBalance": 2000.00,  // Mudar banca inicial
    "bet2x": 200.00,             // Mudar aposta 2x
    "bet10x": 100.00             // Mudar aposta 10x
  }
}
```

---

### 4. **Validar Resultados**

Verificar no relatório gerado:
- **ROI médio:** -10% a +50% (realista)
- **Taxa de acerto:** 40-70% (saudável)
- **Regras V3 respeitadas:** Sim

---

## 📊 TIPOS DE TESTES

### 1. **Teste Rápido (1 Cenário)**

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 1
```

**Uso:**
- Debugging
- Validação rápida
- Teste de mudanças

---

### 2. **Teste Médio (10 Cenários)**

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 10
```

**Uso:**
- Análise preliminar
- Validação de regras
- Comparação antes/depois

---

### 3. **Teste Completo (30 Cenários)**

**Comando:**
```bash
npx tsx TESTES/generate_test_scenarios.ts 30
```

**Uso:**
- Análise estatística robusta
- Validação final
- Relatório oficial

---

### 4. **Teste Comparativo**

**Fluxo:**
1. Gerar teste antes de mudança
2. Fazer alteração no código
3. Gerar teste depois de mudança
4. Comparar métricas

**Exemplo:**
```bash
# Antes
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/antes_$(date +%Y%m%d).md

# (fazer alteração no código)

# Depois
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/depois_$(date +%Y%m%d).md

# Comparar ROI médio, taxa de acerto, etc.
```

---

## 🎓 BOAS PRÁTICAS

### 1. **Sempre gerar testes após mudanças no código**

```bash
# Após alterar patternService.ts
npx tsx TESTES/generate_test_scenarios.ts 10
```

---

### 2. **Salvar resultados com data**

```bash
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/resultado_20260104.md
```

---

### 3. **Analisar consolidado**

Ao final de múltiplos cenários, verificar:
- **ROI Médio:** Deve ser positivo ou próximo de zero
- **Taxa de Acerto Média:** Deve estar entre 40-70%
- **Interpretação:** Leia a mensagem automática

---

### 4. **Extrair aprendizados**

Ao analisar resultados:
- ✅ Quais cenários deram lucro? Por quê?
- ❌ Quais cenários deram prejuízo? Por quê?
- 📊 Padrões confirmados funcionaram?
- 🎯 Regras V3 foram respeitadas?

---

## 🔧 MANUTENÇÃO

### Quando Atualizar `test_config.json`:

- ✅ Mudar regras (ex: confiança mínima 65% → 70%)
- ✅ Ajustar valores de banca/apostas
- ✅ Alterar parâmetros de validação

### Quando Atualizar `generate_test_scenarios.ts`:

- ✅ Sincronizar com `patternService.ts`
- ✅ Adicionar novas métricas
- ✅ Melhorar formato de saída
- ✅ Corrigir bugs

### Quando Atualizar `MODELO_DE_TESTES.md`:

- ✅ Documentar novas regras
- ✅ Adicionar exemplos
- ✅ Atualizar boas práticas

---

## 📝 CHECKLIST DE TESTE

Antes de commitar novos resultados:

- [ ] Gerados ≥10 cenários?
- [ ] ROI médio dentro do esperado?
- [ ] Taxa de acerto razoável?
- [ ] Regras V3 respeitadas?
- [ ] Arquivo nomeado com data?
- [ ] Consolidado analisado?

---

## 🎯 DIFERENÇAS ENTRE GERADORES

| Característica | `generate_test_scenarios.ts` | `simulation_script.ts` |
|----------------|------------------------------|------------------------|
| **Formato Gráfico** | ✅ Linha única (como prints) | Emojis em grid |
| **Legibilidade** | ✅ Alta | Média |
| **Consolidado** | ✅ Automático | Sim |
| **Cores** | ✅ Sim (terminal) | Sim (emojis) |
| **Jogadas** | ✅ Apenas as realizadas | Todas (tabela) |
| **Tamanho Saída** | ✅ Compacto | Verboso |
| **Recomendado** | ✅ **SIM** | Legado |

---

## 📚 REFERÊNCIAS

- **Regras V3:** `ANALISE_REGRAS_ATUAIS.md`
- **Código Principal:** `chrome-extension/src/content/services/patternService.ts`
- **Documentação Geral:** `README.md` (raiz do projeto)
- **Modelo de Testes:** `MODELO_DE_TESTES.md`

---

## 🎉 EXEMPLO DE USO COMPLETO

```bash
# 1. Gerar 30 cenários
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/teste_20260104.md

# 2. Abrir arquivo
cat TESTES/resultados/teste_20260104.md

# 3. Analisar:
#    - ROI médio: +13.3% ✅
#    - Taxa de acerto: 52.3% ✅
#    - Interpretação: "Excelente! Regras V3 funcionando bem."

# 4. Extrair aprendizado:
#    - Cenários com padrões confirmados: Lucro
#    - Cenários sem padrões: Banca preservada (não jogou)
#    - Regras V3 protegem banca ✅

# 5. Commitar
git add TESTES/resultados/teste_20260104.md
git commit -m "test: Validação Regras V3 - ROI +13.3%"
git push
```

---

**Última Atualização:** 04/01/2026  
**Próxima Revisão:** Após implementação de novas regras
