# 📋 MODELO DE TESTES - AVIATOR ANALYZER

**Versão:** 1.0.0  
**Data:** 04/01/2026  
**Regras:** V3 (Padrões Confirmados)

---

## 🎯 OBJETIVO

Este documento define o **modelo padrão** para geração, execução e validação de testes do Aviator Analyzer.

**Por que este documento existe?**
- Centralizar parâmetros de teste
- Garantir consistência entre testes
- Facilitar ajustes futuros
- Documentar metodologia

---

## 📊 ESTRUTURA DE UM TESTE

### 1. **Gráfico de Teste (60 Rodadas)**

Cada teste simula **60 rodadas** divididas em:

| Fase | Rodadas | Descrição | Jogável? |
|------|---------|-----------|----------|
| **Histórico Inicial** | 1-25 | Velas que já estavam na tela ao entrar | ❌ NÃO |
| **Rodadas Jogáveis** | 26-60 | Velas que ocorrem após entrada | ✅ SIM |

**Total:** 60 rodadas  
**Jogáveis:** 35 rodadas (26-60)  
**Não jogáveis:** 25 rodadas (1-25)

---

### 2. **Por que 25 Rodadas Iniciais?**

**Motivo:** Simula a realidade de entrar no jogo.

**Quando você abre o Aviator:**
- O histórico já mostra as últimas ~20-30 rodadas
- Você NÃO jogou nessas rodadas
- Elas servem apenas para análise de padrões

**No teste:**
- Primeiras 25 rodadas = histórico que você vê ao entrar
- Você só começa a jogar a partir da rodada 26
- Análise usa todo o histórico disponível (1-25 + rodadas jogadas)

---

### 3. **Geração de Valores**

**Fórmula:**
```javascript
const r = Math.random(); // 0 a 1
const houseEdge = 0.04;  // 4% (RTP 96%)
const value = (1 - houseEdge) / (1 - r);
return Math.max(1.00, parseFloat(value.toFixed(2)));
```

**Distribuição Esperada:**
- 🔵 **Azuis (<2.00x):** ~50%
- 🟣 **Roxas (2.00-9.99x):** ~40%
- 🌸 **Rosas (≥10.00x):** ~10-12%

**Características:**
- House edge 4% (realista)
- Valores arredondados para 2 casas decimais
- Mínimo 1.00x (crash instantâneo)

---

## 🎮 SIMULAÇÃO DE JOGADAS

### 1. **Banca Inicial**

**Valor padrão:** R$ 1.000,00

**Apostas:**
- **Estratégia 2x:** R$ 100,00 por entrada
- **Estratégia 10x:** R$ 50,00 por entrada

---

### 2. **Fluxo de Simulação**

Para cada rodada jogável (26-60):

1. **Análise ANTES do resultado**
   - Histórico atual = rodadas 1-25 + rodadas jogadas até agora
   - Analyzer recebe histórico invertido (mais recente primeiro)
   - Gera recomendações: `recommendation2x` e `recommendationPink`

2. **Execução das Apostas**
   - Se `recommendation2x === 'PLAY_2X'` → Aposta R$ 100
   - Se `recommendationPink === 'PLAY_10X'` → Aposta R$ 50
   - **Independentes:** Pode jogar ambas na mesma rodada!

3. **Resultado**
   - Revela o crash da rodada
   - Calcula lucro/prejuízo
   - Atualiza banca

4. **Atualização do Histórico**
   - Adiciona rodada ao histórico
   - Próxima análise terá mais dados

---

### 3. **Cálculo de Lucro**

#### Estratégia 2x:
- **Aposta:** R$ 100
- **Alvo:** ≥2.00x
- **Lucro se acertar:** +R$ 100 (retorna R$ 200 total)
- **Prejuízo se errar:** -R$ 100

#### Estratégia 10x:
- **Aposta:** R$ 50
- **Alvo:** ≥10.00x
- **Lucro se acertar:** +R$ 450 (retorna R$ 500 total)
- **Prejuízo se errar:** -R$ 50

---

## 📈 MÉTRICAS CALCULADAS

### 1. **Métricas Básicas**

| Métrica | Descrição | Fórmula |
|---------|-----------|---------|
| **Total de Jogadas** | Quantas vezes jogou | `plays2x + playsPink` |
| **Greens** | Quantas acertou | `wins` |
| **Reds** | Quantas errou | `losses` |
| **Taxa de Acerto** | % de acertos | `(wins / totalPlays) * 100` |
| **Lucro Total** | Saldo final - inicial | `finalBalance - 1000` |
| **ROI** | Retorno sobre investimento | `(profit / 1000) * 100` |

---

### 2. **Métricas por Estratégia**

#### Estratégia 2x:
- `plays2x`: Total de jogadas 2x
- `wins2x`: Acertos 2x
- `winRate2x`: Taxa de acerto 2x
- `profit2x`: Lucro/prejuízo 2x

#### Estratégia 10x:
- `playsPink`: Total de jogadas 10x
- `winsPink`: Acertos 10x
- `winRatePink`: Taxa de acerto 10x
- `profitPink`: Lucro/prejuízo 10x

---

### 3. **Métricas Avançadas (Opcional)**

| Métrica | Descrição |
|---------|-----------|
| **Max Drawdown** | Maior queda da banca |
| **Profit Factor** | Lucro total / Prejuízo total |
| **Sharpe Ratio** | Retorno ajustado ao risco |
| **Max Consecutive Wins** | Maior sequência de greens |
| **Max Consecutive Losses** | Maior sequência de reds |

---

## ✅ VALIDAÇÃO DE TESTES

### 1. **Critérios de Realismo**

Um teste é considerado **realista** se:

| Critério | Valor Aceitável | Motivo |
|----------|-----------------|--------|
| **ROI** | -10% a +50% | Fora disso é improvável |
| **Taxa de Acerto** | 40% a 70% | Estratégia equilibrada |
| **Max Consecutive Losses** | ≤5 | Mais que isso é raro |
| **Densidade** | LOW/MEDIUM/HIGH | Deve variar entre testes |

---

### 2. **Validação de Regras**

Para cada teste, verificar:

#### Estratégia Rosa:
- ✅ Só jogou em padrões com ≥2 ocorrências?
- ✅ Confiança sempre ≥65%?
- ✅ Margem de ±1 vela respeitada?
- ✅ Janela de 25 velas aplicada?

#### Estratégia 2x:
- ✅ Stop loss ativado em 2 reds seguidos?
- ✅ Trava pós-rosa respeitada (exceto exceção)?
- ✅ Conversão ≥50% para sequências?
- ✅ Recuperação lenta (3 reds = 3 roxas)?

---

### 3. **Validação de Distribuição**

Verificar se distribuição de valores está realista:

```
🔵 Azuis: ~50% (±10%)
🟣 Roxas: ~40% (±10%)
🌸 Rosas: ~10% (±5%)
```

**Se muito diferente:** Gerador pode estar enviesado.

---

## 🎨 FORMATO DE SAÍDA

### 1. **Estrutura do Relatório**

```markdown
### Cenário X

**Banca Inicial:** R$ 1000.00

**Histórico Visual:**
🔵 🟣 🟣 🔵 🌸 🟣 🔵 🔵 🟣 🟣 🔵 🟣 🔵 🟣 🟣 🔵 🟣 🌸 🔵 🟣
🟣 🔵 🟣 🔵 🔵 🟣 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🟣 🔵 🟣 🔵 🟣 🟣
🔵 🟣 🔵 🟣 🟣 🔵 🟣 🌸 🔵 🟣 🔵 🟣 🟣 🔵 🟣 🔵 🟣 🟣 🔵 🟣

**Simulação Passo a Passo (Rodadas 26-60):**
| Rodada | Vela | Decisão 2x | Resultado 2x | Decisão 10x | Resultado 10x | Saldo |
|---|---|---|---|---|---|---|
| 26 | 🟣 2.34x | ⏳ | - | ⏳ | - | R$ 1000.00 |
| 27 | 🟣 3.45x | 🚀 | ✅ +100 | ⏳ | - | R$ 1100.00 |
| ... | ... | ... | ... | ... | ... | ... |

**Saldo Final:** R$ 1250.00

> **Feedback/Ajuste:** [_________________________________]
```

---

### 2. **Elementos Visuais**

**Emojis:**
- 🔵 = Azul (<2.00x)
- 🟣 = Roxa (2.00-9.99x)
- 🌸 = Rosa (≥10.00x)

**Decisões:**
- ⏳ = WAIT (não jogou)
- 🚀 = PLAY_2X (jogou 2x)
- 🎯 = PLAY_10X (jogou 10x)
- 🛑 = STOP (stop loss)

**Resultados:**
- ✅ = Green (acertou)
- ❌ = Red (errou)

---

## 🔧 CONFIGURAÇÃO DE TESTES

### 1. **Arquivo de Configuração**

**Localização:** `TESTES/test_config.json`

**Conteúdo:** Todos os parâmetros centralizados

**Vantagens:**
- Fácil ajustar valores
- Consistência entre testes
- Versionamento de parâmetros

---

### 2. **Como Ajustar Parâmetros**

**Exemplo:** Aumentar banca inicial para R$ 2.000

```json
{
  "bankroll": {
    "initialBalance": 2000.00,
    "bet2x": 200.00,
    "bet10x": 100.00
  }
}
```

**Exemplo:** Mudar confiança mínima para 70%

```json
{
  "rules": {
    "pinkStrategy": {
      "minConfidence": 70
    }
  }
}
```

---

### 3. **Como Gerar Novos Testes**

1. Ajustar `test_config.json` se necessário
2. Executar gerador:
   ```bash
   npx tsx simulation_script.ts > TESTES/resultado_YYYYMMDD.md
   ```
3. Analisar resultados
4. Ajustar regras se necessário
5. Repetir

---

## 📊 TIPOS DE CENÁRIOS

### 1. **Cenário Equilibrado (Balanced)**

**Características:**
- Distribuição normal (~50% azuis, ~40% roxas, ~10% rosas)
- Densidade MÉDIA
- Alguns padrões confirmados

**Resultado Esperado:**
- ROI: 0-10%
- Taxa de acerto: 50-60%
- Poucos greens, mas consistentes

---

### 2. **Cenário Alta Densidade (High Density)**

**Características:**
- Muitas rosas (≥10% nas últimas 50 velas)
- Densidade ALTA
- Vários padrões confirmados

**Resultado Esperado:**
- ROI: 10-30%
- Taxa de acerto: 60-70%
- Muitos greens, especialmente em 10x

---

### 3. **Cenário Ruim (Low Density)**

**Características:**
- Poucas rosas (<6%)
- Muitas azuis (>60%)
- Densidade BAIXA
- Poucos ou nenhum padrão confirmado

**Resultado Esperado:**
- ROI: -10-0%
- Taxa de acerto: 30-40%
- Poucos greens, sistema deve proteger banca (não jogar muito)

---

### 4. **Cenário Padrões Confirmados**

**Características:**
- Rosas com intervalos repetidos (≥2 ocorrências)
- Densidade MÉDIA-ALTA
- Padrões claros (Diamante/Ouro)

**Resultado Esperado:**
- ROI: 15-40%
- Taxa de acerto: 65-75%
- Muitos greens em 10x (padrões funcionam)

---

### 5. **Cenário Sem Padrões**

**Características:**
- Rosas aleatórias (sem intervalos repetidos)
- Densidade qualquer
- Nenhum padrão confirmado

**Resultado Esperado:**
- ROI: ~0% (sistema não joga 10x)
- Taxa de acerto: N/A (poucas ou nenhuma jogada)
- Banca preservada ✅

---

## 🎓 BOAS PRÁTICAS

### 1. **Geração de Testes**

- ✅ Gerar no mínimo 30 cenários por rodada de testes
- ✅ Variar tipos de cenários (equilibrado, alta densidade, ruim, etc.)
- ✅ Usar seed aleatório (não fixo) para realismo
- ✅ Documentar data e versão das regras

---

### 2. **Análise de Resultados**

- ✅ Calcular médias (ROI médio, taxa de acerto média)
- ✅ Identificar outliers (cenários muito bons ou ruins)
- ✅ Verificar se regras foram respeitadas
- ✅ Comparar com testes anteriores

---

### 3. **Ajustes de Regras**

- ✅ Ajustar apenas 1 parâmetro por vez
- ✅ Gerar novos testes após cada ajuste
- ✅ Comparar resultados antes/depois
- ✅ Documentar motivo do ajuste

---

### 4. **Versionamento**

- ✅ Nomear arquivos com data: `resultado_20260104.md`
- ✅ Incluir versão das regras no relatório
- ✅ Manter histórico de testes antigos
- ✅ Commitar tudo no Git

---

## 🔄 FLUXO DE TRABALHO

### 1. **Desenvolvimento de Novas Regras**

```
1. Propor nova regra
   ↓
2. Atualizar test_config.json
   ↓
3. Implementar no patternService.ts
   ↓
4. Sincronizar simulation_script.ts
   ↓
5. Gerar 30 cenários de teste
   ↓
6. Analisar resultados
   ↓
7. Ajustar se necessário
   ↓
8. Commitar tudo
```

---

### 2. **Validação de Código**

```
1. Fazer alteração no código
   ↓
2. Gerar testes antes/depois
   ↓
3. Comparar métricas
   ↓
4. Verificar se regras foram respeitadas
   ↓
5. Se OK → Commitar
   ↓
6. Se NOK → Corrigir e repetir
```

---

### 3. **Debugging**

```
1. Identificar comportamento estranho
   ↓
2. Ativar verbose no test_config.json
   ↓
3. Gerar 1 cenário isolado
   ↓
4. Analisar logs detalhados
   ↓
5. Identificar causa
   ↓
6. Corrigir código
   ↓
7. Desativar verbose
   ↓
8. Gerar testes completos
```

---

## 📝 CHECKLIST DE TESTE

Antes de commitar novos testes:

- [ ] Gerados ≥30 cenários?
- [ ] Distribuição de valores realista?
- [ ] ROI dentro do esperado (-10% a +50%)?
- [ ] Taxa de acerto razoável (40-70%)?
- [ ] Regras V3 respeitadas?
- [ ] Arquivo de configuração atualizado?
- [ ] Documentação atualizada?
- [ ] Resultados commitados no Git?

---

## 🎯 CONCLUSÃO

Este modelo garante:

✅ **Consistência:** Todos os testes seguem o mesmo padrão  
✅ **Rastreabilidade:** Parâmetros documentados e versionados  
✅ **Facilidade:** Ajustes centralizados em 1 arquivo  
✅ **Qualidade:** Validações automáticas de realismo  
✅ **Evolução:** Fácil adaptar para novas regras

---

**Última Atualização:** 04/01/2026  
**Versão:** 1.0.0  
**Próxima Revisão:** Após implementação de novas regras
