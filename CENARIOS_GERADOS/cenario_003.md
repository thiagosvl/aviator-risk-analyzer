# Relatório de Cenários de Teste - #002

**Nível do Gráfico:** 3 Estrela(s) - **3 Estrelas: Mercado Equilibrado (Azul 50-60%, Roxo 25-35%, Rosa 0-5%)**
**Data:** 04/01/2026, 18:35:54
**Objetivo:** Validar a aderência das regras V3 em cenários sintéticos.

---

### Cenário 1
**Histórico (Recent -> Old):** 🟣 🔵 🟣 🟣 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Sem rosa, jogamos nem 2x nem 10x.

---

### Cenário 2
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🌸 🟣 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🟣 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:**  Tem rosa, porem só 1, entao não buscamos rosa (nao tem como haver padrão). O que podemos é jogar 2x, mas já quebrou 3x azul depois da ultima rosa, fora que no historico geral ja tem qubra de 3x tambem, entao a tendencia é nao jogar.

---

### Cenário 3
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🟣 🔵 🔵 🟣 🔵 🟣 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Mesma resposta do cenario 1.

---

### Cenário 4
**Histórico (Recent -> Old):** 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🌸 🔵 🌸 🔵 🟣 🟣 🔵 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:**  Nada de jogar por azul, tem sequencias maiores do que 2 azuis quebradas (3+). Podemos aguardar um rosa e tentar pegar ele por 3 casas seguidas, já que as ultimas vieram no padrão de ROSA-VELA-ROSA, ou seja, 1 casa de diferença. Na proxima rosa que vier, podemos jogar para pegala uma antes (ou seja, colada, padrão-1), uma depois (no padrao exato) ou duas depois (seria o cenario do padrao+1)

---

### Cenário 5
**Histórico (Recent -> Old):** 🟣 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Mesma resposta do cenario 3.

---

### Cenário 6
**Histórico (Recent -> Old):** 🔵 🟣 🟣 🔵 🔵 🔵 🟣 🟣 🟣 🔵 🔵 🔵 🟣 🟣 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Mesma resposta do cenario 5.

---

### Cenário 7
**Histórico (Recent -> Old):** 🌸 🟣 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🟣 🔵 🟣 🔵 🌸 🔵 🌸 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Aguardando correção pós-rosa. |
| **Rosa (10x)** | ⏳ AGUARDAR | Trava Pós-Rosa (0/3). |

**Minha Análise:**  mesma resposta do cenario 4.

---

### Cenário 8
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🌸 🟣 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🟣 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:**  quebrou 3 depois da rosa, nao jogamos mais por roxo. Só tem 1 rosa, entao nao buscamos rosa (nao há padrao). E se nao tivesse essa rosa, nao jogariamos nem roxo nem rosa. Sem rosa nao há jogada.

---

### Cenário 9
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🌸 🔵 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🔵 🟣 🟣 🔵 🔵 🔵 🟣 🔵 🟣 🔵 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | 🛑 STOP | Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:**  quebrou 3 depois da rosa, nao jogamos mais por roxo. Só tem 1 rosa, entao nao buscamos rosa (nao há padrao). E se nao tivesse essa rosa, nao jogariamos nem roxo nem rosa. Sem rosa nao há jogada.

---

### Cenário 10
**Histórico (Recent -> Old):** 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | 🛑 STOP | Stop Loss (2 Reds Seguidos). Aguarde 2 Roxas. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Não tem rosa, nao jogamos por nada, nem analisamos.

---

