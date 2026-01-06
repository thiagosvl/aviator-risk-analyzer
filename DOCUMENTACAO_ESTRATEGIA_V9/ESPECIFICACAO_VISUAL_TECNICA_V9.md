# ESPECIFICAÇÃO VISUAL E TÉCNICA - SNIPER V9 (SURVIVAL)

Este documento define exatamente como as mudanças da V9 serão refletidas visualmente no Browser e nos arquivos de Relatório de Teste.

---

## 1. NOVA UI DO BROWSER (Overlay V9)
O painel lateral (Overlay) será redesenhado para dar visibilidade aos novos conceitos: **Regime, ABS e Sobrevivência.**

### A. Painel de Status (Topo)
Onde hoje diz apenas "Aguardando..." ou "Jogar", teremos uma **Barra de Regime**.

**Layout Proposto:**
```text
[  STATUS: 🟡 INCERTEZA (ABS ATIVO - 50%) ]  <-- Barra Colorida (Dinâmica)
```

**Comportamentos (3 Estados):**
1.  **🟢 EXPANSÃO (Verde Neon):**
    *   Texto: `STATUS: 🟢 EXPANSÃO (MODO ATAQUE)`
    *   Subtexto: `Stake: 100% (R$ 50.00)`
    *   Icon: Foguete subindo.
2.  **🟡 INCERTEZA (Amarelo Alerta):**
    *   Texto: `STATUS: 🟡 INCERTEZA (FREIO ABS)`
    *   Subtexto: `Stake: 50% (R$ 25.00) | Motivo: Excesso de Azuis`
    *   Icon: Escudo/Alerta.
3.  **🔴 HOSTIL/DESERTO (Vermelho Bloqueio):**
    *   Texto: `STATUS: 🔴 HOSTIL (PROTEÇÃO TOTAL)`
    *   Subtexto: `Stake: 0% (AGUARDANDO MELHORA)`
    *   Icon: Caveira/Pare.

### B. O "Card de Aposta" (Onde aparece o sinal)
Quando vier um sinal (ex: Rosa), ele mostrará a força da aposta baseada no ABS.

**Exemplo Visual (Card Pink):**
```text
+------------------------------------------+
|  🌸 ALVO DETECTADO: 10.00x               |
|  --------------------------------------- |
|  [ ÍCONE DE MOEDA ] APOSTA: R$ 25.00     | <--- Valor muda sozinho (ABS)
|  (Stake Reduzida pelo ABS 🟡)            | <--- Explicação visual
|                                          |
|  CONFIRMADO: ✅ SIM                      |
+------------------------------------------+
```

### C. Smart Cool Down ("A Geladeira Inteligente")
Se o sistema tomar 3 Loss seguidos, ele trava para não "tiltar".
Em vez de esperar tempo, ele espera **PROVA DE MELHORA**.

**Visual:**
*   **Overlay:** Fundo escuro/bloqueado.
*   **Mensagem Principal:** `❄️ COOL DOWN ATIVO (PROTEÇÃO)`
*   **Subtexto:** `AGUARDANDO CONFIRMAÇÃO DE MERCADO...`
*   **Condição de Saída (Visível):** `[ ] 1x Vela Rosa (>10x)`
*   **Motivo (Validado por Dados):** Análise em 40 grafos provou que sair em Rosa gera WinRate pós-saída superior (>50%) comparado a sair em Roxas.

*Assim que o mercado soltar uma Rosa, o sistema desbloqueia sozinho.*

### D. Histórico da Sessão (Abaixo)
A lista de velas terá uma coluna extra visual (bolinha colorida) indicando em qual regime aquela vela ocorreu.

```text
| HORA   | ODD   | REGIME | LUCRO    |
| 10:05  | 2.00x |   🟢   | + R$ 50  |
| 10:06  | 1.10x |   🟡   | - R$ 25  | <--- Mostra que perdeu pouco pq ABS ativou
```

---

## 2. ESTRUTURA DOS RELATÓRIOS DETALHADOS (TXT/Individual)
Cada grafo gerará um relatório muito mais rico, mostrando o "filme" da sobrevivência.

**Exemplo de Arquivo: `ANALISE_V9_DETALHADA/10_148_analysis.txt`**

```text
================================================================
 RELATÓRIO DE SESSÃO V9 - GRAFO: 10_148.txt
 Data Simulada: 06/01/2026
 Config: Banca R$ 3000 | Meta +500 | Stop -500
================================================================

[RESUMO DA PERFORMANCE]
Resultado:      ✅ STOP WIN
Lucro Final:    R$ 525.00
Tempo Sobrev.:  45 Rodadas (Sessão Completa)
Drawdown Max:   R$ 150.00 (Baixo Risco)
Regimes:        🟢 60% | 🟡 30% | 🔴 10%

[DIÁRIO DE BORDO - RODADA A RODADA]
------------------------------------------------------------------------------------------
#   | ODD   | REGIME | AÇÃO      | STAKE   | RESULTADO | MOTIVO/OBS
------------------------------------------------------------------------------------------
01  | 1.50x | 🟢 EXP | WAIT      | R$ 0    | ---       | Sem padrão
02  | 5.00x | 🟢 EXP | PLAY 2X   | R$ 50   | ✅ WIN     | Padrão de Intervalo
03  | 1.10x | 🟢 EXP | PLAY 2X   | R$ 50   | ❌ LOSS    | Normal
...
15  | 1.20x | 🟡 INC | PLAY PINK | R$ 25   | ❌ LOSS    | Stake Reduzida (ABS Ativado)
16  | 1.15x | 🟡 INC | WAIT      | R$ 0    | ---       | Filtro de Incerteza
...
40  | 55.0x | 🟢 EXP | PLAY PINK | R$ 75   | ✅ WIN 10x | Stake Turbo (Recovery)
------------------------------------------------------------------------------------------

[ESTATÍSTICAS DO ABS]
Economia Gerada: R$ 225.00 (Valor que seria perdido sem ABS)
Perdas Evitadas: 4 (Bloqueio em Regime Hostil)
```

---

## 3. RELATÓRIO GERAL (GLOBAL) V9
O arquivo que resume os 40 grafos focará na métrica de RUÍNA.

**Exemplo: `RELATORIO_V9_GLOBAL.txt`**

```text
================================================================
 RELATÓRIO GLOBAL V9 - AUDITORIA DE SOBREVIVÊNCIA
================================================================

[KPIs PRINCIPAIS]
🛡️ Taxa de Ruína (Quebra):  12.5% (5/40)   [META: <15% ✅]
💰 Lucro Líquido Total:    R$ 9.450,00
📉 Drawdown Médio:         R$ 850,00      [Melhoria de 50% vs V8]

[COMPARATIVO V8 vs V9]
Métrica            | V8 (Anterior) | V9 (Atual)
-------------------|---------------|------------
Stop Wins          | 26 (65%)      | 24 (60%)   <-- Leve queda aceitável
Stop Loss (Mortes) | 14 (35%)      | 05 (12%)   <-- REDUÇÃO DRÁSTICA (SUCESSO)
Sobrevivência Pior | 2 Rodadas     | 15 Rodadas <-- Morreu lutando

[ANÁLISE DE REGIMES]
Tempo em Incerteza (🟡): 42% das rodadas
Eficácia do ABS: Economizou R$ 4.500 em perdas evitadas.

[LISTA DE SESSÕES]
Grafo 01: ✅ WIN (+500) | ABS Atuou: Sim
Grafo 02: 🛡️ VIVO (+150) | Encerrou p/ tempo (Não quebrou)
Grafo 03: 💀 LOSS (-500) | Falha no Regime Hostil

```

---

## 4. TESTES DE CENÁRIO (Generator)
O gerador de cenários (`generator_v9.js`) agora incluirá anotações de regime no output.

**Output no Console/Arquivo:**

```javascript
/* CENÁRIO GERADO: "Armadilha de Azuis"
   Dificuldade: 🟡 MÉDIA (Teste de ABS)
*/

// [1.20, 1.15, 1.10, 1.05, 1.50, 1.30] -> Sequência de Morte
// V8 (Antigo): Apostaria R$ 50 em todos -> Prejuízo R$ 300
// V9 (Esperado): 
//    Vela 1: R$ 50 (Loss)
//    Vela 2: R$ 50 (Loss) -> Detecta Incerteza 🟡
//    Vela 3: R$ 25 (Loss) -> ABS Ativado
//    Vela 4: R$ 25 (Loss)
//    Vela 5: R$ 0  (Wait) -> Cool Down Ativado!
// Prejuízo V9: R$ 150 (50% menor)
```

---

### CONCLUSÃO
A V9 não é apenas uma mudança interna.
1.  **Visualmente:** Você verá cores (Verde/Amarelo/Vermelho) e o valor da aposta mudando sozinho.
2.  **Dados:** Os relatórios provarão quanto dinheiro você *deixou de perder* (Economia ABS).

Posso proceder com a implementação baseada nestas especificações?
