# LOG DE APRENDIZADOS E DECISÕES ESTRATÉGIAS

> Este documento registra a virada de chave no desenvolvimento do Aviator Risk Analyzer, movendo-se de uma abordagem puramente estatística para uma abordagem de "Sobrevivência e Regime".

## 1. O Novo Paradigma: Sobrevivência > Lucro
**Aprendizado:** Em sistemas de payout variável e "House Edge" negativo, tentar eliminar o drawdown via entrada perfeita é impossível. O drawdown é inevitável.
**Decisão:** O foco do desenvolvimento muda de *"Como acertar mais velas rosas?"* para *"Como perder menos dinheiro nas velas ruins?"*.
**Métrica Chave:** Substituir ROI puro por **Tempo Médio de Sobrevivência** em simulações de Monte Carlo.

## 2. A Ilusão do Controle Estatístico
**Aprendizado:** Backtests em dados estáticos (30 grafos embaralhados) criam uma falsa sensação de segurança. A aleatoriedade do "Mundo Real" tem regimes (fases) que duram mais do que nossa banca aguenta.
**Decisão:**
*   Não confiar em winrates globais (ex: "60% de acerto").
*   Confiar apenas em performance por **Contexto/Regime** (ex: "Performance pós-deserto").

## 3. Mecanismos de Defesa Aprovados
Estes mecanismos deixam de ser "ideias" e passam a ser **REQUISITOS OBRIGATÓRIOS** para a V9/Final:

### A. Freio ABS (Dynamic Staking)
*   **Conceito:** Se o sistema está perdendo, ele deve apostar MENOS, não mais (o oposto de Martingale).
*   **Regra:** Se Drawdown Sessão > 15%, Stake cai 50%.
*   **Por quê:** Compra tempo para o regime ruim passar sem quebrar a banca.

### B. Cool Down (Lógica de Geladeira)
*   **Conceito:** Evitar a "tilt" algorítmico onde perdas em sequência geram sinais ruins em sequência.
*   **Regra:** 3 Loss Consecutivos (ou Drawdown rápido) = Stop de X minutos ou Y velas.
*   **Por quê:** Quebra a correlação temporal de perdas.

### C. Lock Profit Racional
*   **Conceito:** Garantir que um dia bom não vire um dia ruim.
*   **Regra:** Bateu 50% da Meta? Ativar "Trailing Stop" de lucro (não devolver mais do que 30% do lucro obtido).

## 4. O Grande Desafio: "Regime Detection"
**Aprendizado:** Saber *quando* parar é mais importante do que saber *quando* entrar.
**Problema Aberto:** O sistema V8 detecta o regime ruim (Deserto) tarde demais (após 12 velas).
**Plano de Ação:** Investigar indicadores antecedentes de mudança de regime.
*   *Hipótese:* Aumento súbito de densidade de velas azuis (< 2.0x) nas últimas 20 rodadas pode ser o "canário na mina" antes do Deserto.

---
**Status Atual:**
Aguardando feedback da IA Externa (Ciclo 3) para validar se a engenharia dessas defesas está sólida.
**Próxima Etapa:** Implementar "Freio ABS" e "Cool Down" no simulador V8.
