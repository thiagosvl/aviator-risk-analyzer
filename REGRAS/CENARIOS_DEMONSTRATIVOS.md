# 📚 CENÁRIOS DEMONSTRATIVOS - REGRAS V3 MELHORADAS

**Data:** 04/01/2026  
**Versão:** V3 Melhorada (Otimizada para maior acerto)

---

## 🎯 OBJETIVO

Este arquivo mapeia **TODAS as regras e possibilidades** de entrada (ou não entrada) com cenários visuais de 30-60 velas.

Para cada cenário, você verá:
- ✅ **SE jogaria** ou ❌ **NÃO jogaria**
- 🔍 **POR QUÊ** (critério/regra aplicada)
- 📊 **Análise vela por vela**

---

## 📋 ÍNDICE DE CENÁRIOS

### Estratégia 2x (Roxa):
1. [Cenário 1: Aguardando 2ª Roxa](#cenário-1-aguardando-2ª-roxa)
2. [Cenário 2: Aguardando 3ª Roxa](#cenário-2-aguardando-3ª-roxa)
3. [Cenário 3: Surfando Sequência (Conversão ≥60%)](#cenário-3-surfando-sequência-conversão-60)
4. [Cenário 4: Sequência Suspeita (Conversão <60%)](#cenário-4-sequência-suspeita-conversão-60)
5. [Cenário 5: Stop Loss (2 Reds Seguidos)](#cenário-5-stop-loss-2-reds-seguidos)
6. [Cenário 6: Recuperação Lenta (3 Azuis Seguidas)](#cenário-6-recuperação-lenta-3-azuis-seguidas)
7. [Cenário 7: Trava Pós-Rosa (Aguarda 3 Velas)](#cenário-7-trava-pós-rosa-aguarda-3-velas)
8. [Cenário 8: Exceção Double Blue (Joga Antes de 3 Velas)](#cenário-8-exceção-double-blue-joga-antes-de-3-velas)

### Estratégia 10x (Rosa):
9. [Cenário 9: Padrão Confirmado (Intervalo 7, 3x)](#cenário-9-padrão-confirmado-intervalo-7-3x)
10. [Cenário 10: Padrão Não Confirmado (Intervalo 3, 2x)](#cenário-10-padrão-não-confirmado-intervalo-3-2x)
11. [Cenário 11: Intervalo Muito Curto (Intervalo 2)](#cenário-11-intervalo-muito-curto-intervalo-2)
12. [Cenário 12: Confiança Baixa (65%)](#cenário-12-confiança-baixa-65)
13. [Cenário 13: Fora da Margem (±2 velas)](#cenário-13-fora-da-margem-2-velas)
14. [Cenário 14: Sem Padrões Confirmados](#cenário-14-sem-padrões-confirmados)

---

## 🟣 ESTRATÉGIA 2X (ROXA)

---

### Cenário 1: Aguardando 2ª Roxa

**Situação:** 1 roxa recente

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 1.34x 1.08x 1.19x 1.45x 1.23x 1.67x 2.15x [AGORA]
🔵   🔵   🔵   🔵   🔵   🔵   🔵   🔵   🟣   ❓
```

**Análise:**
- Streak atual: **1 roxa**
- Conversão (últimas 25): 55% (≥60%? ❌ Não importa ainda)
- Densidade: Baixa
- Trava pós-rosa: Não
- Stop loss: Não

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Aguardando 2ª vela roxa para confirmar."

**Regra Aplicada:**
- Exige **2+ roxas** para validar sequência
- Com 1 roxa, ainda não sabemos se é sequência ou roxa isolada
- **Aguarda próxima vela**

**Próxima Vela:**
- Se sair **roxa (≥2x):** Vai para Cenário 2 (Aguardando 3ª)
- Se sair **azul (<2x):** Volta para Cenário 1 (streak = 0 ou -1)

---

### Cenário 2: Aguardando 3ª Roxa

**Situação:** 2 roxas seguidas, conversão ≥60%

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 1.34x 1.08x 1.19x 1.45x 1.23x 2.15x 3.42x [AGORA]
🔵   🔵   🔵   🔵   🔵   🔵   🔵   🟣   🟣   ❓
```

**Análise:**
- Streak atual: **2 roxas**
- Conversão (últimas 25): **65%** (≥60%? ✅ Sim)
- Densidade: Média
- Trava pós-rosa: Não
- Stop loss: Não
- Deep downtrend: Não

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Aguardando 3ª vela roxa para confirmar sequência."

**Regra Aplicada:**
- Exige **3+ roxas** para jogar
- Com 2 roxas, sequência está se formando mas ainda não confirmada
- Conversão ≥60% valida que é sequência forte
- **Aguarda 3ª roxa para jogar**

**Próxima Vela:**
- Se sair **roxa (≥2x):** Vai para Cenário 3 (Joga!)
- Se sair **azul (<2x):** Volta para Cenário 1 ou Stop Loss

---

### Cenário 3: Surfando Sequência (Conversão ≥60%)

**Situação:** 3+ roxas seguidas, conversão ≥60%

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 1.34x 1.08x 1.19x 2.15x 3.42x 2.87x [AGORA]
🔵   🔵   🔵   🔵   🔵   🟣   🟣   🟣   ❓
```

**Análise:**
- Streak atual: **3 roxas**
- Conversão (últimas 25): **68%** (≥60%? ✅ Sim)
- Densidade: Alta
- Trava pós-rosa: Não
- Stop loss: Não
- Deep downtrend: Não

**Decisão:** ✅ **JOGA 2X**

**Motivo:** "Surfando Sequência (Conversão ≥60%)."

**Regra Aplicada:**
- ✅ Streak ≥3 roxas
- ✅ Conversão ≥60%
- ✅ Sem trava pós-rosa
- ✅ Sem stop loss
- ✅ Sem deep downtrend

**Aposta:** R$ 100 no 2x

**Resultado Esperado:**
- Se sair **roxa (≥2x):** ✅ Green (+R$ 100)
- Se sair **azul (<2x):** ❌ Red (-R$ 100)

**Próxima Vela:**
- Se green: Continua surfando (joga novamente)
- Se red: Verifica se é stop loss (2 reds seguidos)

---

### Cenário 4: Sequência Suspeita (Conversão <60%)

**Situação:** 3+ roxas seguidas, conversão <60%

**Gráfico (últimas 10 velas):**
```
1.05x 1.12x 2.34x 1.08x 3.19x 1.45x 2.23x 4.67x 2.15x [AGORA]
🔵   🔵   🟣   🔵   🟣   🔵   🟣   🟣   🟣   ❓
```

**Análise:**
- Streak atual: **3 roxas**
- Conversão (últimas 25): **45%** (≥60%? ❌ Não)
- Densidade: Média
- Trava pós-rosa: Não
- Stop loss: Não
- Deep downtrend: Não

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Sequência Suspeita (Conversão Baixa <60%)."

**Regra Aplicada:**
- ✅ Streak ≥3 roxas
- ❌ Conversão <60% (sequência fraca)
- Historicamente, roxas não se sustentam (muitas azuis entre elas)
- **Não joga** (risco alto de red)

**Por quê conversão baixa?**
- Das últimas roxas, poucas foram seguidas por outra roxa
- Muitas roxas isoladas (roxa → azul → roxa → azul)
- Sequência não é sustentável

**Próxima Vela:**
- Aguarda conversão subir para ≥60%
- Ou aguarda nova sequência

---

### Cenário 5: Stop Loss (2 Reds Seguidos)

**Situação:** 2 azuis seguidas (2 reds)

**Gráfico (últimas 10 velas):**
```
2.15x 3.42x 2.87x 4.12x 1.34x 1.08x [AGORA]
🟣   🟣   🟣   🟣   🔵   🔵   ❓
```

**Análise:**
- Streak atual: **-2 (2 azuis)**
- Conversão: Não importa
- Stop loss: ✅ **SIM**

**Decisão:** 🛑 **STOP LOSS - NÃO JOGA**

**Motivo:** "Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas."

**Regra Aplicada:**
- ✅ 2 azuis seguidas
- **Para imediatamente**
- Aguarda **2 roxas** para retomar

**Por quê parar?**
- 2 reds seguidos indicam que sequência acabou
- Continuar jogando = risco de 3º, 4º red (martingale perigoso)
- **Preserva banca**

**Próxima Vela:**
- Se sair **roxa:** Streak = 1 (aguarda 2ª roxa)
- Se sair **azul:** Streak = -3 (deep downtrend - aguarda 3 roxas)

---

### Cenário 6: Recuperação Lenta (3 Azuis Seguidas)

**Situação:** 3+ azuis seguidas (deep downtrend)

**Gráfico (últimas 10 velas):**
```
2.15x 3.42x 2.87x 1.34x 1.08x 1.19x [AGORA]
🟣   🟣   🟣   🔵   🔵   🔵   ❓
```

**Análise:**
- Streak atual: **-3 (3 azuis)**
- Deep downtrend: ✅ **SIM**
- Conversão: Não importa ainda

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Recuperação Lenta (3 Reds Recentes). Aguarde 3 Roxas."

**Regra Aplicada:**
- ✅ 3 azuis seguidas (deep downtrend)
- Exige **3 roxas** para retomar (ao invés de 2)
- Recuperação mais rigorosa

**Por quê 3 roxas?**
- 3 azuis seguidas indicam momento ruim
- Gráfico pode estar em downtrend
- Exige confirmação mais forte (3 roxas) antes de jogar

**Próxima Vela:**
- Se sair **roxa:** Streak = 1 (aguarda 2ª roxa)
- Se sair **azul:** Streak = -4 (continua aguardando)

**Quando joga?**
- Após **3 roxas seguidas** (streak = 3)
- E conversão ≥60%

---

### Cenário 7: Trava Pós-Rosa (Aguarda 3 Velas)

**Situação:** Rosa recente (≥10x), menos de 3 velas depois

**Gráfico (últimas 10 velas):**
```
2.15x 3.42x 2.87x 14.52x 2.34x [AGORA]
🟣   🟣   🟣   🌸    🟣   ❓
```

**Análise:**
- Última rosa: **1 vela atrás** (14.52x)
- Velas desde rosa: **1** (<3)
- Streak atual: 1 roxa
- Conversão: 65%

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Trava Pós-Rosa (1/3). Aguarde correção."

**Regra Aplicada:**
- ✅ Rosa recente (≥10x)
- ✅ Menos de 3 velas depois
- **Aguarda 3 velas** antes de jogar 2x

**Por quê aguardar?**
- Após rosa, gráfico tende a corrigir (azuis)
- Jogar 2x logo após rosa = risco alto de red
- **Aguarda 3 velas** para gráfico estabilizar

**Próxima Vela:**
- Se sair **roxa:** Velas desde rosa = 2 (aguarda 3ª)
- Se sair **azul:** Velas desde rosa = 2 (aguarda 3ª)
- Após 3 velas: Trava liberada, volta para regras normais

---

### Cenário 8: Exceção Double Blue (Joga Antes de 3 Velas)

**Situação:** Rosa recente, mas double blue ≤1 nas últimas 25 velas

**Gráfico (últimas 10 velas):**
```
2.15x 3.42x 2.87x 14.52x 2.34x [AGORA]
🟣   🟣   🟣   🌸    🟣   ❓
```

**Análise:**
- Última rosa: **1 vela atrás**
- Velas desde rosa: **1** (<3)
- Double blue (últimas 25): **0** (≤1? ✅ Sim)
- Streak atual: 1 roxa
- Conversão: 65%

**Decisão:** ⚠️ **DEPENDE**

**Motivo:** "Exceção Double Blue. Trava liberada."

**Regra Aplicada:**
- ✅ Rosa recente (<3 velas)
- ✅ Double blue ≤1 (gráfico estável)
- **Exceção:** Trava liberada
- Volta para regras normais (aguarda 2ª roxa)

**Por quê exceção?**
- Double blue ≤1 indica que gráfico está estável
- Poucas azuis seguidas = baixo risco de correção
- **Pode jogar** antes de 3 velas

**Próxima Vela:**
- Segue regras normais (aguarda 2ª roxa, depois 3ª, depois joga)

---

## 🌸 ESTRATÉGIA 10X (ROSA)

---

### Cenário 9: Padrão Confirmado (Intervalo 7, 3x)

**Situação:** Padrão intervalo 7 com 3 ocorrências confirmadas

**Gráfico (últimas 30 velas):**
```
Vela 30: 1.05x 🔵
Vela 29: 1.12x 🔵
Vela 28: 2.34x 🟣
Vela 27: 1.08x 🔵
Vela 26: 3.19x 🟣
Vela 25: 1.45x 🔵
Vela 24: 2.23x 🟣
Vela 23: 4.67x 🟣
Vela 22: 2.15x 🟣
Vela 21: 3.42x 🟣
Vela 20: 2.87x 🟣
Vela 19: 1.34x 🔵
Vela 18: 1.08x 🔵
Vela 17: 1.19x 🔵
Vela 16: 1.45x 🔵
Vela 15: 1.23x 🔵
Vela 14: 12.34x 🌸 ← Rosa 3
Vela 13: 1.67x 🔵
Vela 12: 2.15x 🟣
Vela 11: 3.42x 🟣
Vela 10: 2.87x 🟣
Vela 9: 1.34x 🔵
Vela 8: 1.08x 🔵
Vela 7: 15.67x 🌸 ← Rosa 2
Vela 6: 1.19x 🔵
Vela 5: 1.45x 🔵
Vela 4: 1.23x 🔵
Vela 3: 1.67x 🔵
Vela 2: 1.34x 🔵
Vela 1: 1.08x 🔵
Vela 0: 18.92x 🌸 ← Rosa 1
[AGORA]
```

**Análise de Padrões:**
- Rosa 1 (vela 0) → Rosa 2 (vela 7): **7 velas** de intervalo
- Rosa 2 (vela 7) → Rosa 3 (vela 14): **7 velas** de intervalo
- Rosa 3 (vela 14) → Agora (vela 30): **16 velas** (não é 7)

**Espera:** Próxima rosa em **7 velas** (vela 21)

**Mas estamos na vela 30!**

**Distância atual:** 16 velas desde última rosa

**Padrão:** Intervalo 7 (3x confirmados)

**Margem:** ±1 vela

**Match?**
- Distância atual: 16
- Próximo alvo (intervalo 7): 7
- Diferença: |16 - 7| = 9 velas
- Margem: ±1 vela
- **Fora da margem!** ❌

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Fora da margem. Aguardando próximo ciclo."

---

**CORREÇÃO:** Vamos refazer o cenário corretamente!

**Gráfico (últimas 30 velas):**
```
Vela 23: 1.05x 🔵
Vela 22: 1.12x 🔵
Vela 21: 18.92x 🌸 ← Rosa 3
Vela 20: 1.08x 🔵
Vela 19: 3.19x 🟣
Vela 18: 1.45x 🔵
Vela 17: 2.23x 🟣
Vela 16: 4.67x 🟣
Vela 15: 2.15x 🟣
Vela 14: 15.67x 🌸 ← Rosa 2
Vela 13: 1.34x 🔵
Vela 12: 1.08x 🔵
Vela 11: 1.19x 🔵
Vela 10: 1.45x 🔵
Vela 9: 1.23x 🔵
Vela 8: 1.67x 🔵
Vela 7: 12.34x 🌸 ← Rosa 1
Vela 6: 2.15x 🟣
Vela 5: 3.42x 🟣
Vela 4: 2.87x 🟣
Vela 3: 1.34x 🔵
Vela 2: 1.08x 🔵
Vela 1: 1.19x 🔵
Vela 0: 1.45x 🔵
[AGORA - Vela 24]
```

**Análise de Padrões:**
- Rosa 1 (vela 7) → Rosa 2 (vela 14): **7 velas** de intervalo
- Rosa 2 (vela 14) → Rosa 3 (vela 21): **7 velas** de intervalo

**Última rosa:** Vela 21 (18.92x)

**Distância atual:** 23 - 21 = **2 velas** desde última rosa

**Padrão:** Intervalo 7 (3x confirmados - 💎 Diamante)

**Próximo alvo:** 21 + 7 = Vela 28

**Estamos na vela 24**

**Faltam:** 28 - 24 = **4 velas** para o alvo

**Match?**
- Distância atual: 2
- Alvo: 7
- Diferença: |2 - 7| = 5 velas
- Margem: ±1 vela
- **Fora da margem!** ❌

**Decisão:** ❌ **NÃO JOGA AINDA**

**Motivo:** "Aguardando. Faltam 4 velas para alvo (intervalo 7)."

---

**Agora na Vela 27:**

**Distância atual:** 27 - 21 = **6 velas** desde última rosa

**Alvo:** 7 velas

**Match?**
- Distância atual: 6
- Alvo: 7
- Diferença: |6 - 7| = 1 vela
- Margem: ±1 vela
- **Dentro da margem!** ✅

**Confiança:**
- 3 ocorrências (💎 Diamante)
- Confiança = 50 + (3 * 15) = **95%**
- Mínimo: 75%
- **95% ≥ 75%?** ✅ Sim

**Intervalo:**
- Intervalo: 7 velas
- Mínimo: 5 velas
- **7 ≥ 5?** ✅ Sim

**Decisão:** ✅ **JOGA 10X**

**Motivo:** "💎 Padrão Intervalo 7 (3x confirmados)"

**Regra Aplicada:**
- ✅ Intervalo ≥5 velas
- ✅ 3 ocorrências confirmadas
- ✅ Confiança 95% (≥75%)
- ✅ Dentro da margem (±1 vela)

**Aposta:** R$ 50 no 10x

**Resultado Esperado:**
- Se sair **rosa (≥10x):** ✅ Green (+R$ 450)
- Se sair **roxa/azul (<10x):** ❌ Red (-R$ 50)

---

### Cenário 10: Padrão Não Confirmado (Intervalo 3, 2x)

**Situação:** Padrão intervalo 3 com apenas 2 ocorrências

**Gráfico (últimas 20 velas):**
```
Vela 19: 1.05x 🔵
Vela 18: 1.12x 🔵
Vela 17: 2.34x 🟣
Vela 16: 1.08x 🔵
Vela 15: 3.19x 🟣
Vela 14: 1.45x 🔵
Vela 13: 2.23x 🟣
Vela 12: 12.34x 🌸 ← Rosa 2
Vela 11: 1.67x 🔵
Vela 10: 2.15x 🟣
Vela 9: 15.67x 🌸 ← Rosa 1
Vela 8: 1.34x 🔵
Vela 7: 1.08x 🔵
Vela 6: 1.19x 🔵
Vela 5: 1.45x 🔵
Vela 4: 1.23x 🔵
Vela 3: 18.92x 🌸 ← Rosa 0
Vela 2: 1.67x 🔵
Vela 1: 1.34x 🔵
Vela 0: 1.08x 🔵
[AGORA - Vela 20]
```

**Análise de Padrões:**
- Rosa 0 (vela 3) → Rosa 1 (vela 9): **6 velas** de intervalo
- Rosa 1 (vela 9) → Rosa 2 (vela 12): **3 velas** de intervalo

**Última rosa:** Vela 12

**Distância atual:** 20 - 12 = **8 velas** desde última rosa

**Padrões detectados:**
- Intervalo 6: 1 ocorrência
- Intervalo 3: 1 ocorrência

**Padrões confirmados (≥2 ocorrências):** ❌ **NENHUM**

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Buscando padrão confirmado..."

**Regra Aplicada:**
- ❌ Intervalo 3 tem apenas **1 ocorrência**
- ❌ Intervalo 6 tem apenas **1 ocorrência**
- Exige **≥2 ocorrências** (ou ≥3 para intervalos <10)
- **Não joga** (padrão não confirmado)

---

### Cenário 11: Intervalo Muito Curto (Intervalo 2)

**Situação:** Padrão intervalo 2 com 2 ocorrências

**Gráfico (últimas 15 velas):**
```
Vela 14: 1.05x 🔵
Vela 13: 1.12x 🔵
Vela 12: 12.34x 🌸 ← Rosa 2
Vela 11: 1.67x 🔵
Vela 10: 15.67x 🌸 ← Rosa 1
Vela 9: 1.34x 🔵
Vela 8: 18.92x 🌸 ← Rosa 0
Vela 7: 1.08x 🔵
Vela 6: 1.19x 🔵
Vela 5: 1.45x 🔵
Vela 4: 1.23x 🔵
Vela 3: 1.67x 🔵
Vela 2: 1.34x 🔵
Vela 1: 1.08x 🔵
Vela 0: 1.19x 🔵
[AGORA - Vela 15]
```

**Análise de Padrões:**
- Rosa 0 (vela 8) → Rosa 1 (vela 10): **2 velas** de intervalo
- Rosa 1 (vela 10) → Rosa 2 (vela 12): **2 velas** de intervalo

**Última rosa:** Vela 12

**Distância atual:** 15 - 12 = **3 velas** desde última rosa

**Padrão:** Intervalo 2 (2x confirmados - 🥇 Ouro)

**Próximo alvo:** 12 + 2 = Vela 14

**Estamos na vela 15**

**Match?**
- Distância atual: 3
- Alvo: 2
- Diferença: |3 - 2| = 1 vela
- Margem: ±1 vela
- **Dentro da margem!** ✅

**Confiança:**
- 2 ocorrências (🥇 Ouro)
- Confiança = 50 + (2 * 15) = **80%**
- Mínimo: 75%
- **80% ≥ 75%?** ✅ Sim

**Intervalo:**
- Intervalo: 2 velas
- Mínimo: 5 velas
- **2 ≥ 5?** ❌ **NÃO**

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Intervalo muito curto (<5 velas). Padrão não confiável."

**Regra Aplicada:**
- ❌ Intervalo 2 < 5 velas (mínimo)
- Intervalos curtos (1-4) exigem **4+ ocorrências**
- Intervalo 2 tem apenas 2 ocorrências
- **Não joga** (intervalo muito curto)

**Por quê?**
- Intervalos curtos (1-4 velas) são raros e não sustentáveis
- Rosas a cada 2 velas é **extremamente improvável**
- Provavelmente coincidência, não padrão real

---

### Cenário 12: Confiança Baixa (65%)

**Situação:** Padrão intervalo 7 com 2 ocorrências (confiança 65%)

**Gráfico (últimas 25 velas):**
```
Vela 24: 1.05x 🔵
Vela 23: 1.12x 🔵
Vela 22: 2.34x 🟣
Vela 21: 1.08x 🔵
Vela 20: 3.19x 🟣
Vela 19: 1.45x 🔵
Vela 18: 2.23x 🟣
Vela 17: 4.67x 🟣
Vela 16: 2.15x 🟣
Vela 15: 3.42x 🟣
Vela 14: 15.67x 🌸 ← Rosa 1
Vela 13: 1.34x 🔵
Vela 12: 1.08x 🔵
Vela 11: 1.19x 🔵
Vela 10: 1.45x 🔵
Vela 9: 1.23x 🔵
Vela 8: 1.67x 🔵
Vela 7: 12.34x 🌸 ← Rosa 0
Vela 6: 2.15x 🟣
Vela 5: 3.42x 🟣
Vela 4: 2.87x 🟣
Vela 3: 1.34x 🔵
Vela 2: 1.08x 🔵
Vela 1: 1.19x 🔵
Vela 0: 1.45x 🔵
[AGORA - Vela 25]
```

**Análise de Padrões:**
- Rosa 0 (vela 7) → Rosa 1 (vela 14): **7 velas** de intervalo

**Última rosa:** Vela 14

**Distância atual:** 25 - 14 = **11 velas** desde última rosa

**Padrão:** Intervalo 7 (apenas 1 ocorrência até agora)

**Mas vamos supor que há outra rosa antiga:**

**Rosa -1 (vela 0) → Rosa 0 (vela 7): 7 velas**

**Agora temos:**
- Intervalo 7: **2 ocorrências** (🥇 Ouro)

**Próximo alvo:** 14 + 7 = Vela 21

**Estamos na vela 25**

**Match?**
- Distância atual: 11
- Alvo: 7
- Diferença: |11 - 7| = 4 velas
- Margem: ±1 vela
- **Fora da margem!** ❌

**Mas vamos supor que estamos na vela 20:**

**Distância atual:** 20 - 14 = **6 velas**

**Match?**
- Distância atual: 6
- Alvo: 7
- Diferença: |6 - 7| = 1 vela
- Margem: ±1 vela
- **Dentro da margem!** ✅

**Confiança:**
- 2 ocorrências (🥇 Ouro)
- Confiança = 50 + (2 * 15) = **80%**
- Mínimo: 75%
- **80% ≥ 75%?** ✅ Sim

**Intervalo:**
- Intervalo: 7 velas
- Mínimo: 5 velas
- **7 ≥ 5?** ✅ Sim

**Mas espera! Intervalo 7 com 2 ocorrências:**
- Intervalo 7 está na faixa 5-9 (médio)
- Faixa média exige **≥3 ocorrências**
- Temos apenas **2 ocorrências**

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Padrão não confirmado (precisa 3+ ocorrências para intervalo 5-9)."

**Regra Aplicada:**
- ❌ Intervalo 7 (faixa 5-9) exige **≥3 ocorrências**
- Temos apenas **2 ocorrências**
- **Não joga** (padrão não suficientemente confirmado)

---

### Cenário 13: Fora da Margem (±2 velas)

**Situação:** Padrão confirmado mas fora da margem ±1

**Gráfico (últimas 30 velas):**
```
Vela 29: 1.05x 🔵
Vela 28: 1.12x 🔵
Vela 27: 2.34x 🟣
Vela 26: 1.08x 🔵
Vela 25: 3.19x 🟣
Vela 24: 1.45x 🔵
Vela 23: 2.23x 🟣
Vela 22: 4.67x 🟣
Vela 21: 18.92x 🌸 ← Rosa 3
Vela 20: 1.34x 🔵
Vela 19: 1.08x 🔵
Vela 18: 1.19x 🔵
Vela 17: 1.45x 🔵
Vela 16: 1.23x 🔵
Vela 15: 1.67x 🔵
Vela 14: 15.67x 🌸 ← Rosa 2
Vela 13: 1.34x 🔵
Vela 12: 1.08x 🔵
Vela 11: 1.19x 🔵
Vela 10: 1.45x 🔵
Vela 9: 1.23x 🔵
Vela 8: 1.67x 🔵
Vela 7: 12.34x 🌸 ← Rosa 1
Vela 6: 2.15x 🟣
Vela 5: 3.42x 🟣
Vela 4: 2.87x 🟣
Vela 3: 1.34x 🔵
Vela 2: 1.08x 🔵
Vela 1: 1.19x 🔵
Vela 0: 1.45x 🔵
[AGORA - Vela 30]
```

**Análise de Padrões:**
- Rosa 1 (vela 7) → Rosa 2 (vela 14): **7 velas** de intervalo
- Rosa 2 (vela 14) → Rosa 3 (vela 21): **7 velas** de intervalo

**Última rosa:** Vela 21

**Distância atual:** 30 - 21 = **9 velas** desde última rosa

**Padrão:** Intervalo 7 (3x confirmados - 💎 Diamante)

**Próximo alvo:** 21 + 7 = Vela 28

**Estamos na vela 30**

**Match?**
- Distância atual: 9
- Alvo: 7
- Diferença: |9 - 7| = 2 velas
- Margem: ±1 vela
- **Fora da margem!** ❌

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Fora da margem (±1 vela). Aguardando próximo ciclo."

**Regra Aplicada:**
- ✅ Padrão confirmado (3x)
- ✅ Intervalo ≥5
- ✅ Confiança ≥75%
- ❌ **Fora da margem** (diferença de 2 velas)
- **Não joga** (timing errado)

**Por quê margem ±1?**
- Padrões não são exatos (variação natural)
- Margem ±1 vela permite flexibilidade
- Mas ±2 ou mais = timing muito errado
- Melhor aguardar próximo ciclo

---

### Cenário 14: Sem Padrões Confirmados

**Situação:** Rosas aleatórias, sem padrão

**Gráfico (últimas 30 velas):**
```
Vela 29: 1.05x 🔵
Vela 28: 1.12x 🔵
Vela 27: 2.34x 🟣
Vela 26: 1.08x 🔵
Vela 25: 3.19x 🟣
Vela 24: 1.45x 🔵
Vela 23: 2.23x 🟣
Vela 22: 4.67x 🟣
Vela 21: 2.15x 🟣
Vela 20: 3.42x 🟣
Vela 19: 2.87x 🟣
Vela 18: 1.34x 🔵
Vela 17: 1.08x 🔵
Vela 16: 1.19x 🔵
Vela 15: 1.45x 🔵
Vela 14: 1.23x 🔵
Vela 13: 1.67x 🔵
Vela 12: 12.34x 🌸 ← Rosa 2
Vela 11: 1.34x 🔵
Vela 10: 1.08x 🔵
Vela 9: 1.19x 🔵
Vela 8: 1.45x 🔵
Vela 7: 1.23x 🔵
Vela 6: 1.67x 🔵
Vela 5: 1.34x 🔵
Vela 4: 15.67x 🌸 ← Rosa 1
Vela 3: 1.08x 🔵
Vela 2: 1.19x 🔵
Vela 1: 18.92x 🌸 ← Rosa 0
Vela 0: 1.45x 🔵
[AGORA - Vela 30]
```

**Análise de Padrões:**
- Rosa 0 (vela 1) → Rosa 1 (vela 4): **3 velas** de intervalo
- Rosa 1 (vela 4) → Rosa 2 (vela 12): **8 velas** de intervalo

**Intervalos detectados:**
- Intervalo 3: 1 ocorrência
- Intervalo 8: 1 ocorrência

**Padrões confirmados:** ❌ **NENHUM**

**Decisão:** ❌ **NÃO JOGA**

**Motivo:** "Buscando padrão confirmado..."

**Regra Aplicada:**
- ❌ Nenhum intervalo se repetiu ≥2 vezes
- Rosas estão aleatórias (sem padrão)
- **Não joga** (sem padrão confirmado)

**Por quê não jogar?**
- Sem padrão = sem previsibilidade
- Jogar aleatoriamente = loteria (house edge 4%)
- Melhor aguardar padrão se formar

---

## 📊 RESUMO DE TODAS AS REGRAS

### Estratégia 2x (Roxa):

| Situação | Joga? | Motivo |
|----------|-------|--------|
| **1 roxa** | ❌ Não | Aguardando 2ª roxa |
| **2 roxas + conversão ≥60%** | ❌ Não | Aguardando 3ª roxa |
| **3+ roxas + conversão ≥60%** | ✅ Sim | Surfando sequência |
| **3+ roxas + conversão <60%** | ❌ Não | Sequência suspeita |
| **2 azuis seguidas** | 🛑 Stop | Stop loss (aguarda 2 roxas) |
| **3 azuis seguidas** | ❌ Não | Recuperação lenta (aguarda 3 roxas) |
| **Rosa recente (<3 velas)** | ❌ Não | Trava pós-rosa |
| **Rosa recente + double blue ≤1** | ⚠️ Depende | Exceção (trava liberada) |

---

### Estratégia 10x (Rosa):

| Situação | Joga? | Motivo |
|----------|-------|--------|
| **Padrão confirmado (intervalo ≥5, 3+ ocorrências, confiança ≥75%, margem ±1)** | ✅ Sim | Padrão forte |
| **Intervalo <5 velas** | ❌ Não | Intervalo muito curto |
| **Intervalo 5-9 com <3 ocorrências** | ❌ Não | Padrão não confirmado |
| **Intervalo 10+ com <2 ocorrências** | ❌ Não | Padrão não confirmado |
| **Confiança <75%** | ❌ Não | Confiança baixa |
| **Fora da margem (±2 ou mais)** | ❌ Não | Timing errado |
| **Sem padrões confirmados** | ❌ Não | Aguardando padrão |

---

## ✅ CHECKLIST RÁPIDO

### Antes de Jogar 2x (Roxa):

- [ ] Streak ≥3 roxas?
- [ ] Conversão ≥60%?
- [ ] Sem trava pós-rosa (<3 velas)?
- [ ] Sem stop loss (2 reds)?
- [ ] Sem deep downtrend (3 azuis)?

**Se TODOS ✅:** Joga 2x  
**Se ALGUM ❌:** Não joga

---

### Antes de Jogar 10x (Rosa):

- [ ] Padrão confirmado?
- [ ] Intervalo ≥5 velas?
- [ ] Ocorrências suficientes (3+ para 5-9, 2+ para 10+)?
- [ ] Confiança ≥75%?
- [ ] Dentro da margem (±1 vela)?

**Se TODOS ✅:** Joga 10x  
**Se ALGUM ❌:** Não joga

---

## 🎓 COMO USAR ESTE ARQUIVO

### 1. **Estudar Cenários**

Leia cada cenário para entender:
- Quando jogar
- Quando NÃO jogar
- Por quê cada decisão

### 2. **Praticar Análise**

Pegue um gráfico real e:
1. Identifique a situação
2. Encontre o cenário correspondente
3. Veja se jogaria ou não
4. Compare com o que o sistema recomenda

### 3. **Validar Regras**

Se achar que uma regra está errada:
1. Documente o caso
2. Analise o resultado
3. Sugira ajuste
4. Atualize este arquivo

---

## 📝 NOTAS FINAIS

**Este arquivo é vivo!**

Conforme ajustarmos as regras, atualizaremos os cenários.

**Objetivo:** Ter referência visual clara de TODAS as possibilidades.

**Próxima atualização:** Após testes de validação pós-ajustes.

---

**Data:** 04/01/2026  
**Versão:** V3 Melhorada  
**Arquivo:** `REGRAS/CENARIOS_DEMONSTRATIVOS.md`
