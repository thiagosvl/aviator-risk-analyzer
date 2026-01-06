# Relatório Técnico: Lógica de Decisão e Cenários (v9.5)

Este documento detalha **EXATAMENTE** como o robô pensa e decide em cada situação. A V9.5 introduziu "Regimes de Mercado" e ajustou o "Sniper" para segurança máxima.

---

## 1. Regimes de Mercado (O "Clima")

Antes de decidir *se* aposta, o robô olha para o "Mar" (Contexto).

| Regime | Condição | Stake (Banca) | Comportamento |
| :--- | :--- | :--- | :--- |
| **🌊 EXPANSÃO (Mar Liso)** | Mercado saudável, equilíbrio entre Azuis e Roxos. | **100%** | **Ativo.** Busca Padrões e ativa o Sniper. |
| **🌪️ INCERTEZA (Mar Agitado)** | Muitos azuis recentes (< 2.0x) ou comportamento errático. | **50% (ABS)** | **Cauteloso.** Reduz a mão pela metade. |
| **🌵 HOSTILE (Deserto)** | **8 ou mais velas** sem Rosa. | **0% (STOP)** | **Bloqueio Total.** Aguarda o fim da seca. |

---

## 2. Gatilhos de Entrada (Quando Apostamos)

Se o regime permitir, buscamos um destes gatilhos:

### A. 🌸 Janela de Repique (A "Zona Quente")
*   **O que é:** As **3 primeiras velas** imediatamente após uma Rosa.
*   **Lógica:** O algoritmo costuma pagar em "clusters". Se saiu uma Rosa, a chance de outra (ou roxos bons) vir logo em seguida é alta.
*   **Stake:** Se viemos de um Deserto, ativamos **RECOVERY (150%)**. Senão, normal.

### B. 🎯 Sniper (O "Tiro de Precisão")
*   **O que é:** Apostas fora da janela de repique, baseadas em fraqueza ou força do gráfico.
*   **Regra VITAL (Nova):** Só atira se estivermos em **Zona Segura (< 6 velas desde a Rosa)**.
    *   Se estivermos na vela 6, 7 ou 8, o Sniper **NÃO** atira, para evitar entrar num Deserto.
*   **Gatilhos:**
    *   **Exaustão Azul:** Vela < 1.50x (Azul baixo costuma puxar correção).
    *   **Força Roxa:** Vela entre 2.00x e 8.00x (Mercado pagando).

---

## 3. Travas de Segurança (Quando NÃO Apostamos)

Proteções que anulam qualquer gatilho acima.

1.  **✋ Hesitação (Roxo Alto):** Se sair uma vela entre **8.00x e 9.99x** dentro da Janela de Repique, paramos. Isso é sinal de "Cansaço" (quase pagou rosa, mas falhou).
2.  **🛑 Smart Cool Down (Gelo):** Se tomarmos **3 Loss** seguidos, o robô congela. Ele só volta a operar depois que sair uma Rosa >= 10x verdadeira.
3.  **🚧 Proximidade de Deserto:** Como dito no Sniper, da vela 6 em diante, entramos em modo de alerta e paramos de abrir novas operações de Sniper.

---

## 4. Guia Visual de Cenários (25 Rodadas)

Legenda:
*   🔵 = Azul (Loss)
*   🟣 = Roxo Bom (2x - 8x)
*   ⛔ = Roxo Alto (8x - 9.99x)
*   🌸 = Rosa (Win)
*   🎯 = Entrada Sniper
*   � = Entrada Janela/Recovery

Lembre-se: O gráfico lê da **Direita (Velho)** para a **Esquerda (Novo)**.

### Cenário 1: O "Sniper" Perfeito e a Parada de Segurança
*Situação: Mercado bom, Sniper lucra e para antes do perigo.*

`NOVA 🔵(7) 🔵(6) 🎯🟣(5) 🔵(4) 🎯(3) �(2) �(1) 🌸 VELHA`

1.  **Vela 1 e 2 (🔥):** Janela de Repique. O robô joga.
2.  **Vela 3 (🎯):** Azul Baixo (< 1.50x). **Sniper Ativa** (Estamos na vela 3, zona segura).
3.  **Vela 4 (🔵):** Loss.
4.  **Vela 5 (🎯):** Roxo Médio. **Sniper Ativa** (Estamos na vela 5, limite da zona segura). Win!
5.  **Vela 6 e 7 (🔵):** O mercado virou. O robô **NÃO CHUTA** (Sniper travado na vela 6+). Economizamos 2 reds!

### Cenário 2: Deserto e Recovery (A Retomada)
*Situação: Uma seca longa seguida de recuperação agressiva.*

`NOVA �🌸(Win) 🔥🟣(Win) 🔥🔵(Loss) 🌸 (Fim Deserto) ... 🔵   🔵 🔵   🔵 (8 Velas Secas) VELHA`

1.  **8 Velas Secas:** O robô detecta **HOSTILE/DESERT**. Fica 100% parado.
2.  **🌸 (Fim Deserto):** Saiu a Rosa salvadora >= 10x.
3.  **Modo RECOVERY Ligado:** O robô sabe que pós-deserto costuma pagar.
4.  **Vela 1, 2 e 3 (🔥):** O robô entra com mão pesada (150%). Pega o Green na 1 e na 2.

### Cenário 3: A Hesitação (O "Quase")
*Situação: Mercado ameaça pagar mas falha.*

`NOVA 🔵(Wait) 🔵(Wait) ⛔(8.44x) 🔥🔵(Loss) 🌸 VELHA`

1.  **Vela 1 (🔥):** Janela de Repique. Entramos. Loss (veio azul).
2.  **Vela 2 (⛔):** Veio 8.44x.
3.  **Análise:** 8.44x é Roxo Alto ("Hesitação"). O robô aborta a janela.
4.  **Vela 3 e 4:** O robô fica em **WAIT**. Se não tivesse a trava, teríamos tomado loss nessas velas.

### Cenário 4: Smart Cool Down (Proteção de Quebra)
*Situação: Sequência de perdas trava o robô.*

`NOVA ... (Wait Eterno) ... 🔵 🔵 🔵 �🔵(Loss 3) 🎯🔵(Loss 2) �🔵(Loss 1) 🌸 VELHA`

1.  **Loss 1, 2 e 3:** Tomamos 3 reds seguidos (na janela e no sniper).
2.  **GELO ATIVADO:** O robô entra em **COOL DOWN**.
3.  **Próximas Velas:** O robô ignora tudo (neste caso, evitou mais prejuízo se a sequência azul continuasse).
4.  **Destrava:** Só destrava quando vier outra Rosa >= 10x.

---

## 5. Resumo da Estratégia V9.5

*   **JOGAMOS:** Nas 3 casas pós-rosa (Repique) OU quando o gráfico está "Liso" e seguro (< 6 casas).
*   **PARAMOS:** Se o gráfico secar (8+), se "hesitar" (8x-9.9x) ou se começarmos a perder muito (3 hits).
*   **EVITAMOS:** Tentar adivinhar rosa no meio do deserto (Vela 7, 10, 15...). É estatisticamente suicídio a longo prazo.
