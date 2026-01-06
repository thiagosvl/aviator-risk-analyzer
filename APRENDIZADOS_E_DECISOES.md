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
*   **Nova Classificação de Regimes (3 Estados):**
    *   🟢 **Expansão:** Assimetria permitida (Stake Normal). O sistema busca lucro.
    *   🟡 **Incerteza:** O perigo real. Onde a maioria dos danos ocorre. (Stake Reduzida/Mínima).
    *   🔴 **Hostil/Deserto:** Sobrevivência pura (Exposição Zero/Wait).
    *   *Erro Anterior:* Pular de Normal para Deserto ignorava a fase de transição (Incerteza), pagando o "Custo de Descoberta" caro demais.

## 3. Mecanismos de Defesa Aprovados
Estes mecanismos deixam de ser "ideias" e passam a ser **REQUISITOS OBRIGATÓRIOS** para a V9/Final:

*   **Conceito Refinado:** O ABS não deve reagir apenas à perda financeira ("Perdi R$ 100"), mas à **perda de confiança estatística**.
*   **Regra V2:** Se entrarmos no regime de **Incerteza (🟡)**, a stake cai pela metade *imediatamente*, mesmo se ainda estivermos no lucro.
*   **Por quê:** Reduz o "Custo de Descoberta" antes que o regime Hostil se confirme.
*   **Objetivo:** "Errar pequeno" quando estamos cegos.

### B. Cool Down (Lógica de Geladeira)
*   **Conceito:** Evitar a "tilt" algorítmico onde perdas em sequência geram sinais ruins em sequência.
*   **Regra:** 3 Loss Consecutivos (ou Drawdown rápido) = Stop de X minutos ou Y velas.
*   **Por quê:** Quebra a correlação temporal de perdas.

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
*   Precisamos identificar o regime 🟡 (Incerteza).
*   *Hipótese:* Aumento de densidade de velas < 2.0x nas últimas 20 rodadas = Início de Incerteza.
*   *Ação:* Reduzir Stake (ABS) preventivamente.

---
**Status Atual:**
Aguardando feedback da IA Externa (Ciclo 3) para validar se a engenharia dessas defesas está sólida.
**Próxima Etapa:** Implementar "Freio ABS" e "Cool Down" no simulador V8.
