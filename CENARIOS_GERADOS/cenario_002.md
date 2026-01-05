# Relatório de Cenários de Teste - #004

**Nível do Gráfico:** 2 Estrela(s) - **2 Estrelas: Mercado Ruim (Azul 60-70%, Roxo 15-25%, Rosa 0-5%)**
**Data:** 04/01/2026, 19:01:32
**Objetivo:** Validar a aderência das regras V3 em cenários sintéticos.

---

### Cenário 1
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:** Sem rosa (regra maxima do sistema), nao joga.

---

### Cenário 2
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🟣 🟣 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:** Igual resposta 1.

---

### Cenário 3
**Histórico (Recent -> Old):** 🔵 🟣 🔵 🔵 🟣 🌸 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:** Tem 1 rosa, entao nao busca rosa (nao tem como confirmar). Para roxo, a predominancia aqui das 25 velas é extremamente azul, mesmo que só tenha quebrado 2x azul seguido pós rosa, entao nao jogamos ainda por roxo.

---

### Cenário 4
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🌸 🟣 🔵 🌸

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:**  Tem rosa, mas nao há padrão. Nao jogamos por rosa. Para roxos, depois da ultima rosa ja quebrou 3x ou mais azul, entao nao jogamos. Aguardamos proxima rosa para tentar pegar padrao.

---

### Cenário 5
**Histórico (Recent -> Old):** 🔵 🟣 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🟣 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:** Resposta do cenario 1.

---

### Cenário 6
**Histórico (Recent -> Old):** 🌸 🔵 🔵 🔵 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🟣 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:** Acabou de vir um rosa, entao vamos aguardar padrão. Predominancia é azul, entao nao da pra jogar roxo.

---

### Cenário 7
**Histórico (Recent -> Old):** 🟣 🔵 🟣 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🟣 🟣 🔵 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:** Resposta cenario 1.

---

### Cenário 8
**Histórico (Recent -> Old):** 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🌸 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🟣 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:** Só 1 rosa, sem padrão. Predominancia de azul, nao jogamos roxo.

---

### Cenário 9
**Histórico (Recent -> Old):** 🌸 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🔵 🔵 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:** Igual resposta 8.

---

### Cenário 10
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:** Igual resposta 1.

---

