# Estratégia Rosa (Busca de 10.00x) 🌸

**Objetivo:** Capturar multiplicadores altos (10x+) com precisão cirúrgica.
**Prioridade:** ATAQUE. (Operação independente da defesa).
**Investimento:** Valor Reduzido (Ex: 50% da mão da roxa).

---

## 🎯 A Lógica do Caçador

Diferente da estratégia Roxa (que é reativa), a estratégia Rosa é **PROATIVA**. Ela não se importa se o mercado está bom ou ruim, ela só se importa se **O MOMENTO BATEU**.

### 1. O Gatilho: Repetição de Intervalo
O sistema memoriza os intervalos entre todas as rosas anteriores visíveis (Ex: 2 rosas atrás, 3 rosas atrás...).
*   **Regra:** Se a distância atual bater com algum intervalo histórico, **JOGUE**.

### 2. A Janela de Precisão (+/- 1)
O algoritmo do jogo tem uma variância programada.
*   **Regra:** Se o padrão é **10 casas**, o alerta vale para as casas **9, 10 e 11**.
*   **Ação:** Jogue nas 3. (Ou até sair a rosa/passar a janela).

### 3. A Hierarquia de Peso
*   💎 **DIAMANTE (Recente):** Se repetir o intervalo da **Última Rosa**. (Ex: Veio com 4, agora está com 4). *Probabilidade Máxima.*
*   🥇 **OURO (Curto Prazo):** Se repetir um intervalo das últimas 3 rosas.
*   🥈 **PRATA (Histórico):** Se repetir qualquer outro intervalo visível.

### 4. Independência Total (Override)
*   **Regra de Ouro:** A Estratégia Rosa **IGNORA** todas as travas da Estratégia Roxa.
*   **Cenário:** Ocorreu uma Rosa. A "Trava Pós-Rosa" bloqueou o jogo de 2x. Porém, o sistema detectou um padrão de "Rosa Colada" (Intervalo 0).
*   **Ação:** A jogada de R$ 100 (Roxa) fica OFF. A jogada de R$ 50 (Rosa) fica **ON**.

---

## 🧠 Cenários de Aplicação (30 Velas)

### Cenário 1: O "Double Pink" (Intervalo 0) no Meio do Bloqueio
**Histórico:**
... 🌸 (60.00x) -> [AGORA]

*   **Contexto:** Acabou de sair uma rosa.
*   **Estratégia Roxa:** 🛑 TRAVADA (Zona de Cautela 3 velas).
*   **Estratégia Rosa:** Analisa histórico. Houve "rosas coladas" antes? SIM.
*   **Ação:** 🌸 **ENTRA com R$ 50**.
*   **Resultado:** Se vier rosa, lucramos R$ 450 limpinhos, sem expor os R$ 100 da proteção.

### Cenário 2: A Janela de Antecipação
**Histórico de Intervalos:** [15, 4, 15]
**Momento Atual:** 14 casas desde a última rosa.

*   **Análise:** O padrão histórico é 15. Estamos no 14.
*   **Regra +/- 1:** O 14 está na janela do 15.
*   **Ação:** 🌸 **ENTRA**. (Alerta: "1 Antes").

### Cenário 3: O Padrão Quebrado
**Histórico:** [10, 10, 10]
**Momento Atual:** 12 casas.

*   **Análise:** Passou do 10. Passou do 11 (Janela +1).
*   **Ação:** ❌ **CANCELAR BUSCA**.
*   **Motivo:** O padrão quebrou. Não fique perseguindo a rosa "no escuro". Espere o próximo padrão se formar ou reiniciar.

---

## ✅ Checklist de Entrada (QUANDO JOGAR)

Só entre com R$ 50 se:
1.  [ ] A distância atual é IGUAL a algum intervalo anterior? (Considerando +/- 1).
2.  [ ] Se houver múltiplos padrões, dê preferência ao mais recente (Diamante).

**Lembrete:** Se a Estratégia Roxa estiver ON, jogue as duas (R$ 100 + R$ 50). Se estiver OFF, jogue só a Rosa (R$ 50).
