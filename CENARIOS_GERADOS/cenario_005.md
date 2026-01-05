# Relatório de Cenários de Teste - #005

**Nível do Gráfico:** 5 Estrela(s) - **5 Estrelas: Mercado Excelente (Roxo 60-75%, Azul 5-10%, Rosa 10-15%)**
**Data:** 04/01/2026, 19:13:21
**Objetivo:** Validar a aderência das regras V3.1 ("The Analyst") em cenários sintéticos.

----- 

### Cenário 1
**Histórico (Recent -> Old):** 🟣 🌸 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🌸 🟣 🌸 🌸 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🌸 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** tem padrao pra rosa, entao joga pra 10x. Está surfando sequencia de roxo, entao pode seguir jogando até tomar o red (se olhar as ultimas 25, o histórico e ALTAMENTE favoravel para roxo/rosa). NEssas situações, podemos abrir exceção para a regra que bloqueia jogar nas 3 primeiras após rosa. Pode quebrar logo em seguida? pode, mas nesse cenario, vale o risco.

---

### Cenário 2
**Histórico (Recent -> Old):** 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🌸 🟣 🌸 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Alta sequencia de roxo já aconteceu, entao podemos continuar jogando no roxo. Nao tem padrão pra rosa, entao nao jogamos até que venha a terceira rosa (porque ai entra na zona de tiro).

---

### Cenário 3
**Histórico (Recent -> Old):** 🟣 🌸 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Ainda nao tem padrão pra rosa, entao aguardamos. Sobre o roxo, é o mesmo que falei no primeiro cenario. Faz sentido jogar roxo.

---

### Cenário 4
**Histórico (Recent -> Old):** 🌸 🔵 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🟣 🔵 🌸 🟣 🟣 🔵 🔵 🟣 🔵 🟣 🌸 🟣 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Aguardando 2ª vela roxa. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Percentual de roxo/rosa é muito alto, favoravel, entao jogamos roxo. Tem padrão de rosa, entao jogamos também.

---

### Cenário 5
**Histórico (Recent -> Old):** 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🔵 🟣 🟣 🌸 🟣 🌸 🟣 🟣 🌸 🟣 🟣 🌸 🌸 🟣 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Padrão de roxo já aconteceu em maior quantidade (esse padrao de roxo deve considerar velas acimas de 2x, entao rosas tambem entram na conta, nao sao apenas roxas). NAo tem padrao de rosa mais, entao nao entra.

---

### Cenário 6
**Histórico (Recent -> Old):** 🟣 🟣 🟣 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🟣 🔵 🟣 🌸 🟣 🟣 🟣 🟣 🌸 🔵 🟣 🟣 🟣 🟣 🔵

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Padrão de rosa, entao joga. Aqui, devido a alta tendencia (percentual de roxo), faz sentido seguir jogando até quebrar. E quando quebrar, faz sentido seguir jogando. Parariamos quando quebrasse 2 (porque já seria uma NOVIDADE no grafico (janela das ultimas 25)).

---

### Cenário 7
**Histórico (Recent -> Old):** 🌸 🟣 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🌸 🟣 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Padrão de rosa, joga. Surf de roxo, entao joga tambem. Cenario semelhante ao cenario 6.

---

### Cenário 8
**Histórico (Recent -> Old):** 🟣 🟣 🔵 🔵 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🌸 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🌸 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Quebrou 3 azul pós ultima rosa, nao joga mais. Nao tem padrao de rosa, entao nao tenta jogar rosa.

---

### Cenário 9
**Histórico (Recent -> Old):** 🟣 🟣 🌸 🟣 🟣 🌸 🌸 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🌸 🌸

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ✅ ENTRAR | Surfando Sequência Confirmada. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Padrão de rosa, entao joga. Alto surf de velas roxas com alta tendencia de pague, entao continua jogando.

---

### Cenário 10
**Histórico (Recent -> Old):** 🔵 🟣 🟣 🟣 🌸 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🔵 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣 🟣

| Estratégia | Recomendação | Motivo |
| :--- | :--- | :--- |
| **Roxa (2x)** | ⏳ AGUARDAR | Buscando sinal claro. |
| **Rosa (10x)** | ⏳ AGUARDAR | Buscando padrão confirmado... |

**Minha Análise:** Acabou de quebrar, mas nao há historico de quebrar 2 seguidas, a tendencia (percentual de roxo) é alta, entao faz sentido seguir jogando e só aprar caso quebre 2x no azul seguidamente. Nao tem padrao de rosa, entao nao arrisca.

---

