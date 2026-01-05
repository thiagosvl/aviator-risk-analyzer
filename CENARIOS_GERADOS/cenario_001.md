# Relatório de Cenários de Teste - #001

**Nível do Gráfico:** 1 Estrela(s) - **1 Estrela: Mercado Morto (Azul 70-80%, Roxo 10-15%, Rosa 0-5%)**
**Data:** 04/01/2026, 18:35:52
**Objetivo:** Validar a aderência das regras V3 em cenários sintéticos.

---

### Cenário 1
**Histórico (Recent -> Old):** 🔵 🔵 🟣 🔵 🔵 🌸 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🌸 🔵 🔵 🟣 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:**  aqui, olhando depois do rosa, só quebrou 2x, e parece estar num padrão pós rosa (2 azul, roxo, 2 azul, entao agora poderia ser roxo). Porém, mesmo que a gente ajuste a regra para que só bloqueie quando tiver 3 quebras (e aqui pós rosa só tem 2 quebras, digo, 2 azuis em seguida (e aconteceu por 2x)), ainda assim temos tambem que considerar que da penultima rosa (quando há, e nesse caso existe), há historico de quebras maiores do que 2x (tem uma quebra de 6x velas azuis). Ou seja, o quanto queremos arriscar nesse caso? Ao olharmos para o TODO, está muuito mais azul do que roxo/rosa.

---

### Cenário 2
**Histórico (Recent -> Old):** 🔵 🔵 🌸 🔵 🔵 🔵 🌸 🔵 🌸 🔵 🔵 🌸 🔵 🔵 🔵 🔵 🌸 🟣 🟣 🔵 🔵 🔵 🟣 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Trava Pós-Rosa (2/3). |

**Minha Análise:**  Parecido com o cenario 1. Desde a penultima rosa, tem historico de quebras de 3x azuis, fora que tem tambem historico nas ultimas 25 rosas de quebras maiores do que 3x azuis, inclusive. Porém, se sempre ficarmos olhando as ultimas 25 (ao inves da penultima rosa pra frente), vamos acabar quase que nunca jogando e perdendo o momento do pague, mas é bom termos ciencia disso.
Já sobre a rosa: aqui tem padrão. Nas ultimas 25 velas tem rosas que foram pagas depois de 2 casas/velas, depois de 1, de tres, entao ainda há padrão (até na outra rodada ainda tem padrão). O sistema ainda precisa estar considerando a possibilidade de padrão com +/- 1. (uma antes ou depois).

---

### Cenário 3
**Histórico (Recent -> Old):** 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🔵 🔵 🟣 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Aqui nao jogamos de maneira alguma, nem no roxo nem rosa.

---

### Cenário 4
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🌸 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🌸 🔵 🔵 🟣 🟣 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:**  Nao jogamos no roxo, quebrou 3x (mais até) azul depois da ultima rosa. Aqui jogamos somente agora, no rosa apenas, porque o ultimo rosa veio depois de 8 casas depois do penultimo rosa. Agora estamos 9 casas depois do rosa (ou seja, 1 casa depois de um dos padroes encontrados, que é o de 8 casas).

---

### Cenário 5
**Histórico (Recent -> Old):** 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🌸 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🟣 🔵 🔵 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:**  Depois da ultima rosa quebrou mais de 3x, entao nao jogamos. E tambem nao buscamos rosa, nao há condição.

---

### Cenário 6
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🟣 🔵 🟣 🔵 🟣 🔵 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Não jogamos em nenhuma das duas, nao tem padrão de rosa e o historico de quebras em azul é superior a 3x seguidas.

---

### Cenário 7
**Histórico (Recent -> Old):** 🟣 🔵 🟣 🔵 🔵 🔵 🔵 🌸 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🟣 🟣 🔵 🟣 🔵 🔵 🟣 🟣 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:**  QUebrou 3x+ depois da ultima rosa.

---

### Cenário 8
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Sem condição alguma de jogar. A superioridade azul NUNCA será convidativo pra jogar roxo. Rosa, talvez, se houver padrão considerando tbm +/- 1 (antes, durante ou depois).

---

### Cenário 9
**Histórico (Recent -> Old):** 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 0/2). |

**Minha Análise:**  Mesma coisa do cenario 8.

---

### Cenário 10
**Histórico (Recent -> Old):** 🟣 🟣 🔵 🔵 🔵 🔵 🌸 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🔵 🟣 🔵 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Dominância Azul (>60%). Risco alto. |
| **Rosa (10x)** | ⏳ AGUARDAR | Aguardando 2ª Rosa na janela (Ative: 1/2). |

**Minha Análise:**  Mesma coisa dos ultimos cenarios, quebrou mais de 3x no azul apos ultima rosa.

---

