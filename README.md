# 🎯 Aviator Analyzer - V3 Melhorada

**Versão:** V3 Melhorada (Otimizada para maior acerto)  
**Data:** 04/01/2026

---

## 📖 SOBRE

Sistema de análise e recomendação para o jogo Aviator, com duas estratégias independentes:

- 🟣 **Estratégia 2x (Roxa):** Surfar sequências de velas roxas (2-9.99x)
- 🌸 **Estratégia 10x (Rosa):** Identificar padrões de intervalos entre rosas (≥10x)

---

## 📁 ESTRUTURA DO PROJETO

```
aviator-analyzer/
├── REGRAS/                          # Documentação das regras
│   ├── ESTRATEGIA_ROXA.md          # Regras da estratégia 2x
│   ├── ESTRATEGIA_ROSA.md          # Regras da estratégia 10x
│   ├── CENARIOS_DEMONSTRATIVOS.md  # 14 cenários visuais
│   └── HISTORICO_VELA_A_VELA.md    # Histórico de análises
│
├── TESTES/                          # Sistema de testes
│   ├── test_config.json            # Configuração centralizada
│   ├── generate_test_scenarios.ts  # Gerador de cenários
│   ├── analyze_by_criteria.ts      # Análise por critério
│   ├── GUIA_DE_TESTES.md           # 10 tipos de testes
│   ├── MODELO_DE_TESTES.md         # Documentação do modelo
│   ├── README.md                   # Guia rápido
│   └── resultados/                 # Resultados de testes
│
├── chrome-extension/                # Extensão do Chrome
│   └── src/
│       └── content/
│           └── services/
│               ├── patternService.ts     # Lógica principal (V3 Melhorada)
│               ├── domAnalyzer.ts        # Análise do DOM
│               └── stealthMode.ts        # Modo discreto
│
└── ARQUIVO/                         # Arquivos antigos (backup)
```

---

## 🎯 REGRAS V3 MELHORADAS

### Estratégia 2x (Roxa):

| Parâmetro | Valor |
|-----------|-------|
| **Conversão Mínima** | 60% |
| **Streak Mínimo (Validar)** | 2 roxas |
| **Streak Mínimo (Jogar)** | 3 roxas |
| **Stop Loss** | 2 reds |
| **Recuperação Lenta** | 3 roxas (após 3 azuis) |
| **Trava Pós-Rosa** | 3 velas |

### Estratégia 10x (Rosa):

| Parâmetro | Valor |
|-----------|-------|
| **Confiança Mínima** | 75% |
| **Intervalo Mínimo** | 5 velas |
| **Ocorrências (Intervalo 5-9)** | 3+ |
| **Ocorrências (Intervalo 10+)** | 2+ |
| **Margem de Tolerância** | ±1 vela |
| **Janela de Momentum** | 25 velas |

---

## 🚀 COMO USAR

### 1. Estudar Regras

```bash
# Ler regras da estratégia Roxa
cat REGRAS/ESTRATEGIA_ROXA.md

# Ler regras da estratégia Rosa
cat REGRAS/ESTRATEGIA_ROSA.md

# Ver cenários demonstrativos
cat REGRAS/CENARIOS_DEMONSTRATIVOS.md
```

### 2. Gerar Testes

```bash
# Gerar 30 cenários de teste
npx tsx TESTES/generate_test_scenarios.ts 30

# Análise detalhada por critério
npx tsx TESTES/analyze_by_criteria.ts 30

# Salvar resultados
npx tsx TESTES/generate_test_scenarios.ts 30 > TESTES/resultados/teste_$(date +%Y%m%d).md
```

### 3. Compilar Extensão

```bash
cd chrome-extension
pnpm install
pnpm build
```

### 4. Instalar Extensão

1. Abrir Chrome
2. Ir para `chrome://extensions/`
3. Ativar "Modo do desenvolvedor"
4. Clicar em "Carregar sem compactação"
5. Selecionar pasta `chrome-extension/dist/`

---

## 📊 MÉTRICAS ESPERADAS

### Estratégia 2x (Roxa):

| Métrica | Valor Esperado |
|---------|----------------|
| **Taxa de Acerto** | 50-60% |
| **Jogadas/Sessão** | 5-15 |
| **ROI** | +5% a +15% |

### Estratégia 10x (Rosa):

| Métrica | Valor Esperado |
|---------|----------------|
| **Taxa de Acerto** | 30-50% |
| **Jogadas/Sessão** | 2-8 |
| **ROI** | +10% a +30% |

---

## 🔄 HISTÓRICO DE VERSÕES

### V3 Melhorada (04/01/2026)

**Mudanças:**

**Estratégia 2x:**
- Conversão mínima: 50% → **60%**
- Streak mínimo para validar: 1 → **2 roxas**
- Streak mínimo para jogar: 2 → **3 roxas**

**Estratégia 10x:**
- Confiança mínima: 65% → **75%**
- Intervalo mínimo: 0 → **5 velas**
- Ocorrências por faixa (5-9: 3+, 10+: 2+)

**Motivo:** Análise de 30 cenários mostrou:
- Estratégia 2x: Taxa de acerto 40% → Esperado 50-60%
- Estratégia 10x: Taxa de acerto 6.5% → Esperado 30-50%

---

### V3 Original (03/01/2026)

**Mudanças:**
- Padrões confirmados (≥2 ocorrências)
- Confiança por frequência (50 + count*15)
- Hierarquia (💎/🥇/🥈)
- Conversão de roxas (≥50%)
- Stop loss (2 reds)
- Trava pós-rosa (3 velas)

---

### V2 (02/01/2026)

**Regras básicas:**
- Surfar sequências roxas
- Jogar em intervalos recentes de rosas
- Sem validação rigorosa

---

## 📚 DOCUMENTAÇÃO

### Regras:
- `REGRAS/ESTRATEGIA_ROXA.md` - Regras completas da estratégia 2x
- `REGRAS/ESTRATEGIA_ROSA.md` - Regras completas da estratégia 10x
- `REGRAS/CENARIOS_DEMONSTRATIVOS.md` - 14 cenários visuais

### Testes:
- `TESTES/GUIA_DE_TESTES.md` - 10 tipos de testes recomendados
- `TESTES/MODELO_DE_TESTES.md` - Documentação do modelo de testes
- `TESTES/README.md` - Guia rápido de uso

### Arquivo:
- `ARQUIVO/` - Arquivos antigos e backups (V2, análises antigas)

---

## 🛠️ TECNOLOGIAS

- **TypeScript** - Linguagem principal
- **Chrome Extension API** - Extensão do navegador
- **React** - Interface do usuário
- **TailwindCSS** - Estilização
- **Vite** - Build tool

---

## 📝 NOTAS

### Modo Discreto 🕶️

A extensão inclui um **Modo Discreto** que oculta elementos identificáveis do jogo:
- Logos e botões da casa de apostas
- "UFC AVIATOR" e logos do jogo
- Reduz multiplicador e aplica filtro grayscale

**Ativação:** Botão "👁️ Normal" / "🕶️ Discreto" no overlay

---

## 🤝 CONTRIBUINDO

### Ajustar Regras:

1. Editar `REGRAS/ESTRATEGIA_ROXA.md` ou `ESTRATEGIA_ROSA.md`
2. Atualizar `TESTES/test_config.json`
3. Aplicar mudanças em `chrome-extension/src/content/services/patternService.ts`
4. Gerar testes de validação
5. Commitar mudanças

### Adicionar Cenários:

1. Editar `REGRAS/CENARIOS_DEMONSTRATIVOS.md`
2. Adicionar novo cenário com gráfico visual
3. Explicar SE jogaria e PORQUÊ
4. Commitar mudanças

---

## 📧 CONTATO

**Projeto:** Aviator Analyzer  
**Versão:** V3 Melhorada  
**Data:** 04/01/2026

---

**Última Atualização:** 04/01/2026
