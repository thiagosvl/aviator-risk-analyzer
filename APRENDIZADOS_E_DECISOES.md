# LOG DE APRENDIZADOS E DECISÕES ESTRATÉGIAS

> Este documento registra a virada de chave no desenvolvimento do Aviator Risk Analyzer, movendo-se de uma abordagem puramente estatística para uma abordagem de "Sobrevivência e Regime".

## 1. O Novo Paradigma: Sobrevivência > Lucro
**Aprendizado:** Em sistemas de payout variável e "House Edge" negativo, tentar eliminar o drawdown via entrada perfeita é impossível. O drawdown é inevitável.
**Decisão:** O foco do desenvolvimento muda de *"Como acertar mais velas rosas?"* para *"Como perder menos dinheiro nas velas ruins?"*.
**Métrica Chave:** Substituir ROI puro por **Tempo Médio até Drawdown Crítico**.
*   *Definição:* Quantas sessões o sistema sobrevive antes de atingir -50% da banca?
*   *Por quê:* Em ambientes aleatórios, resiliência estatística vale mais que rentabilidade pontual.

## 2. A Ilusão do Controle Estatístico
**Aprendizado:** Backtests em dados estáticos (30 grafos embaralhados) criam uma falsa sensação de segurança. A aleatoriedade do "Mundo Real" tem regimes (fases) que duram mais do que nossa banca aguenta.
**Decisão:**
*   Não confiar em winrates globais (ex: "60% de acerto").
*   Confiar apenas em performance por **Contexto/Regime** (ex: "Performance pós-deserto").
*   **Novo Modelo de Regimes (3 Estados):**
    *   🟢 **EXPANSÃO (Stake 100%):** Assimetria favorável. Busca de lucro.
    *   🟡 **INCERTEZA (Stake 50%):** Fase de transição perigosa (>60% azuis recentes). ABS Ativo.
    *   🔴 **HOSTIL (Stake 0%):** Deserto confirmado (>12 velas). Proteção Total.
*   *Virada de Chave:* Detectar o amarelo (🟡) antes de levar o tiro do vermelho (🔴).

## 3. Mecanismos de Defesa Aprovados
Estes mecanismos deixam de ser "ideias" e passam a ser **REQUISITOS OBRIGATÓRIOS** para a V9/Final:

### A. Freio ABS Elástico (Contextual)
*   **Conceito:** O sistema tem "marchas". Não opera sempre na velocidade máxima.
*   **Regra:**
    *   **Normal:** R$ 50 (100%)
    *   **Incerteza:** R$ 25 (50%) - *Gatilho: Densidade de azuis ou drawdown leve.*
    *   **Recovery:** R$ 75 (150%) - *Gatilho: Sniper pós-deserto.*
*   **Objetivo:** Reduzir o **Custo de Descoberta** e maximizar janelas curtas.

### B. Cool Down (Lógica de Geladeira)
*   **Conceito:** Evitar a "tilt" algorítmico onde perdas em sequência geram sinais ruins em sequência.
*   **Regra:** 3 Loss Consecutivos (ou Drawdown rápido) = Stop de X minutos ou Y velas.
*   **Por quê:** Quebra a correlação temporal de perdas.

### C. Lock Profit Inteligente
*   **Conceito:** Garantir que um dia bom não vire um dia ruim.
*   **Regra:** Bateu 50% da Meta? Ativar "Trailing Stop" de lucro (não devolver mais do que 30% do lucro obtido).
*   **Filosofia:** "Um sistema robusto aceita perder oportunidades para evitar catástrofes."

## 4. Separação de Objetivos (Sessão vs Sistema)
**Aprendizado:** Confundir a meta do dia com a meta da vida é fatal.
*   **Objetivo da Sessão:** Coletar assimetria positiva (Lucro) quando disponível.
*   **Objetivo do Sistema:** Não morrer (Sobrevivência) sempre.
*   *Conflito:* Se a Sessão está ruim, o Sistema assume o controle e aborta a missão de lucro para priorizar a vida.

## 5. O Grande Desafio: "Regime Detection"
**Aprendizado:** Saber *quando* parar é mais importante do que saber *quando* entrar.
**Problema Aberto:** O sistema V8 detecta o regime 🔴 (Deserto) tarde demais.
**Solução Proposta (Transition Detector):**
*   **Hipótese:** Se `(velas < 2.0x nas últimas 20) > 12`, entramos em INCERTEZA (🟡).
*   **Ação:** Stake cai para 50% automaticamente.

## 6. Métricas de Sucesso da V9
1.  **Taxa de Ruína:** Meta < 15% (Hoje 35%).
2.  **Drawdown Médio:** Meta < R$ 1.000 (Hoje R$ 1.714).
3.  **Survival Time:** Maximizar rodadas vivas no Stress Test.

---
**Status Atual:**
Planejamento da Fase 2 (Sobrevivência) CONCLUÍDO.
**Próxima Etapa:** Implementar `StrategyCore` com lógica de 3 Estados e `backtest` com Stake Dinâmica. Aguardando sinal verde.
