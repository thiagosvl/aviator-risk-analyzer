# 🧪 DIRETÓRIO DE TESTES

**Versão:** 1.0.0  
**Data:** 04/01/2026

---

## 📁 ESTRUTURA

```
TESTES/
├── README.md                  # Este arquivo
├── test_config.json           # Configuração centralizada de testes
├── MODELO_DE_TESTES.md        # Documentação completa do modelo
├── simulation_script.ts       # Gerador de cenários de teste
└── resultados/                # Resultados de testes (criar conforme necessário)
    ├── resultado_20260104.md
    ├── resultado_20260105.md
    └── ...
```

---

## 🎯 PROPÓSITO

Este diretório contém:

1. **Configuração de Testes** (`test_config.json`)
   - Parâmetros centralizados
   - Regras V3
   - Valores de banca e apostas

2. **Documentação** (`MODELO_DE_TESTES.md`)
   - Como gerar testes
   - Como validar resultados
   - Boas práticas

3. **Gerador** (`simulation_script.ts`)
   - Cria cenários de 60 rodadas
   - Simula jogadas com regras V3
   - Gera relatórios em Markdown

4. **Resultados** (pasta `resultados/`)
   - Saídas de testes anteriores
   - Histórico de validações

---

## 🚀 COMO USAR

### 1. **Gerar Testes**

```bash
# Gerar 30 cenários e salvar em arquivo
npx tsx TESTES/simulation_script.ts > TESTES/resultados/resultado_$(date +%Y%m%d).md
```

### 2. **Ajustar Parâmetros**

Editar `test_config.json`:

```json
{
  "bankroll": {
    "initialBalance": 2000.00,  // Mudar banca inicial
    "bet2x": 200.00,             // Mudar aposta 2x
    "bet10x": 100.00             // Mudar aposta 10x
  }
}
```

### 3. **Validar Resultados**

Verificar no relatório gerado:
- ROI médio (-10% a +50%)
- Taxa de acerto (40-70%)
- Regras V3 respeitadas

---

## 📊 TIPOS DE TESTES

### 1. **Teste Padrão (30 Cenários)**

**Comando:**
```bash
npx tsx TESTES/simulation_script.ts > TESTES/resultados/padrao_$(date +%Y%m%d).md
```

**Características:**
- 30 cenários aleatórios
- Distribuição natural
- Valida comportamento geral

---

### 2. **Teste Específico (1 Cenário)**

**Comando:**
```bash
# Editar simulation_script.ts: for (let s = 1; s <= 1; s++)
npx tsx TESTES/simulation_script.ts
```

**Uso:**
- Debugging
- Análise detalhada
- Validação de regra específica

---

### 3. **Teste Comparativo (Antes/Depois)**

**Fluxo:**
1. Gerar teste antes de mudança
2. Fazer alteração no código
3. Gerar teste depois de mudança
4. Comparar métricas

**Exemplo:**
```bash
# Antes
npx tsx TESTES/simulation_script.ts > TESTES/resultados/antes_mudanca.md

# (fazer alteração no código)

# Depois
npx tsx TESTES/simulation_script.ts > TESTES/resultados/depois_mudanca.md

# Comparar
diff TESTES/resultados/antes_mudanca.md TESTES/resultados/depois_mudanca.md
```

---

## 🔧 MANUTENÇÃO

### Quando Atualizar `test_config.json`:

- ✅ Mudar regras (ex: confiança mínima 65% → 70%)
- ✅ Ajustar valores de banca/apostas
- ✅ Alterar parâmetros de validação
- ✅ Adicionar novos tipos de cenários

### Quando Atualizar `simulation_script.ts`:

- ✅ Sincronizar com `patternService.ts`
- ✅ Adicionar novas métricas
- ✅ Melhorar geração de valores
- ✅ Corrigir bugs

### Quando Atualizar `MODELO_DE_TESTES.md`:

- ✅ Documentar novas regras
- ✅ Adicionar exemplos
- ✅ Atualizar boas práticas
- ✅ Corrigir erros de documentação

---

## 📝 CHECKLIST DE TESTE

Antes de commitar novos resultados:

- [ ] Gerados ≥30 cenários?
- [ ] ROI dentro do esperado?
- [ ] Taxa de acerto razoável?
- [ ] Regras V3 respeitadas?
- [ ] Arquivo nomeado com data?
- [ ] Documentação atualizada?

---

## 🎓 BOAS PRÁTICAS

1. **Sempre gerar testes após mudanças no código**
2. **Manter histórico de resultados** (não deletar arquivos antigos)
3. **Nomear arquivos com data** (`resultado_YYYYMMDD.md`)
4. **Documentar mudanças** (commit message explicativo)
5. **Comparar com testes anteriores** (validar evolução)

---

## 📚 REFERÊNCIAS

- **Regras V3:** `ANALISE_REGRAS_ATUAIS.md`
- **Código Principal:** `chrome-extension/src/content/services/patternService.ts`
- **Documentação Geral:** `README.md` (raiz do projeto)

---

**Última Atualização:** 04/01/2026  
**Próxima Revisão:** Após implementação de novas regras
