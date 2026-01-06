# LOG DE APRENDIZADOS E DECISÕES ESTRATÉGICAS V3.5 (FINAL)

> **Data:** 06/01/2026
> **Contexto:** Validação Final da Golden Sequence (Stake Ajustada: C1=50%). Análise de Confiança Estatística.

## 1. O Ajuste Fino da Stake
Você notou corretamente que a **C1 (Colada)** estava com stake cheia. Corrigimos para **50%**.

| Métrica | V3 (Stake Full C1) | **V3.5 (Stake 50% C1)** | Impacto |
| :--- | :---: | :---: | :---: |
| **Lucro Líquido** | R$ 5.425 | **R$ 4.125** | 🔻 **Menor Lucro** |
| **Max Drawdown** | R$ 500 | **R$ 550** | ➖ Estável |
| **Stop Loss** | 6 Sessões | **8 Sessões** | ⚠️ **+2 Quebras** |

**Veredito:** Manter 50% na C1 é a decisão correta para segurança.

## 2. A Pergunta de Ouro: "40 vs 100 Grafos?"
Aprofundamos a análise (Estatística + Engenharia de Risco) para definir o próximo passo.

**Realidade Atual (40 Grafos):**
*   **Margem de Erro:** +/- 4.1% (Winrate entre 8.3% e 16.5%).
*   **Fragilidade:** Risco de "falso positivo" (Sorte).

**O Salto para 100 Grafos (A Prova de Fogo):**
A meta não é apenas "ter mais dados", é verificar se a **Hierarquia** se mantém (C3-C5 > C2).

**⚠️ Risco Crítico (Diluição de Edge):**
Não mexa na estratégia enquanto coleta. Se a hierarquia se mantiver, o edge é real.

## 3. Padronização de Dados (Data Science)
Para facilitar análises futuras (cross-month, seasonality), definimos a estrutura oficial:

1.  **Pasta Mestra:** `DATASETS/`
2.  **Pasta do Lote:** `DATASETS/DEZ_26/` (Mês_Ano)
3.  **Nome do Arquivo:** `MES_ANO_ORDEM_QTDVELAS.png`
    *   *Exemplo:* `DEZ_26_01_158.png` (Dezembro/26, Grafo nº 01, com 158 velas).
    *   *Motivo:* Permite rastrear se grafos com mais velas (ex: >200) tem comportamento diferente de grafos curtos (<150).

## 4. As Regras Definitivas (Hardcoded)
1.  **C1 (Colada):** **STAKE 50%**.
2.  **C2 (Trap):** **SKIP ABSOLUTO**.
3.  **C3, C4, C5 (Sniper):** **BET FORTE**.
4.  **C6, C7 (Death):** **SKIP ABSOLUTO**.
5.  **C8, C9, C10 (Resgate):** **BET NORMAL**.
6.  **C11+ (Hell):** **STOP**.

## 5. Próximos Passos
1.  **Coletar +60 grafos novos** (Total 100) na pasta `DATASETS`.
2.  **Rodar a validação** (`python scripts/auto_extract.py DATASETS/FOLDER_NAME`).
3.  **Checar os Cenários (A, B ou C)**.
