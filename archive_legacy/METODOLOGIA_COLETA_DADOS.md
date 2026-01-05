# 📸 METODOLOGIA DE COLETA DE DADOS EM MASSA

> **Objetivo:** Coletar 50-100 grafos reais para treinar e validar o sistema de pontuação V4.0

---

## 🎯 POR QUE PRECISAMOS DE DADOS EM MASSA?

### **Problema Atual**
- ❌ Testamos em **1 grafo** = 1 ponto de dados
- ❌ Não sabemos se funciona em grafos diferentes
- ❌ Não temos estatística confiável
- ❌ Risco de overfitting

### **Solução**
- ✅ Testar em **50-100 grafos** = estatística robusta
- ✅ Identificar padrões que funcionam consistentemente
- ✅ Ajustar pesos baseado em dados reais
- ✅ Validação cruzada (treino vs teste)

---

## 📊 MÉTODO 1: COLETA VIA SCREENSHOTS (RECOMENDADO)

### **Vantagens**
- ✅ Dados 100% reais (não simulados)
- ✅ Fácil de coletar (você já tem acesso)
- ✅ Pode coletar dezenas por dia
- ✅ Inclui contexto visual

### **Processo de Coleta**

#### **Passo 1: Tirar Screenshots Padronizadas**

**Regras:**
- 📸 Capturar **60-100 rodadas consecutivas** por screenshot
- 📸 Garantir que todos os valores estejam visíveis
- 📸 Não pular rodadas (precisa ser sequencial)
- 📸 Anotar data/hora do grafo (para análise temporal)

**Exemplo de Organização:**
```
DADOS_REAIS/
├── 2026-01-05/
│   ├── grafo_001_09h30.png
│   ├── grafo_002_11h15.png
│   ├── grafo_003_14h00.png
│   └── ...
├── 2026-01-06/
│   ├── grafo_001_08h45.png
│   └── ...
└── EXTRAIDOS/
    ├── grafo_001.txt
    ├── grafo_002.txt
    └── ...
```

#### **Passo 2: Extração Automática de Dados**

Criei um script Python com OCR para extrair valores:

```python
# scripts/extract_from_screenshot.py
import pytesseract
from PIL import Image
import re

def extract_values_from_screenshot(image_path):
    """
    Extrai valores do grafo a partir de screenshot
    """
    img = Image.open(image_path)
    
    # OCR para extrair texto
    text = pytesseract.image_to_string(img)
    
    # Regex para encontrar valores tipo "2.35x", "10.07x"
    pattern = r'(\d+\.\d+)x?'
    matches = re.findall(pattern, text)
    
    # Converter para float
    values = [float(m) for m in matches]
    
    return values
```

**Alternativa Manual (mais precisa):**
- Você copia os valores manualmente do site
- Cola em arquivo .txt (um valor por linha)
- Mais trabalhoso, mas 100% preciso

#### **Passo 3: Validação dos Dados**

```python
def validate_graph_data(values):
    """
    Valida se os dados extraídos fazem sentido
    """
    checks = {
        'min_length': len(values) >= 60,
        'max_length': len(values) <= 200,
        'valid_range': all(0.5 <= v <= 200 for v in values),
        'has_pinks': any(v >= 10.0 for v in values),
        'has_blues': any(v < 2.0 for v in values)
    }
    
    if not all(checks.values()):
        print(f"⚠️ Dados inválidos: {checks}")
        return False
    
    return True
```

---

## 📊 MÉTODO 2: COLETA VIA API (SE DISPONÍVEL)

### **Investigar se o site tem API**

Muitos sites de crash game expõem histórico via:
- WebSocket (mensagens em tempo real)
- API REST (histórico de rodadas)
- LocalStorage do navegador

**Como descobrir:**

1. Abrir DevTools (F12)
2. Aba "Network" → Filtrar "WS" (WebSocket)
3. Procurar mensagens com histórico de rodadas
4. Copiar endpoint e formato

**Se encontrar API:**
```python
import requests

def fetch_history_from_api():
    """
    Busca histórico direto da API (se disponível)
    """
    url = "https://api.aviator.com/history"  # Exemplo
    response = requests.get(url)
    data = response.json()
    
    # Extrair valores
    values = [round['multiplier'] for round in data['rounds']]
    return values
```

---

## 🔄 PIPELINE AUTOMATIZADO DE TESTES

### **Estrutura do Pipeline**

```
1. COLETA
   ├─ Screenshots ou API
   └─ Validação dos dados

2. EXTRAÇÃO
   ├─ OCR ou parsing
   └─ Conversão para formato padrão

3. PROCESSAMENTO
   ├─ Dividir em memória (60) + sequência (40-140)
   └─ Gerar arquivo de teste

4. EXECUÇÃO
   ├─ Rodar play_auto.ts para cada grafo
   └─ Coletar métricas

5. ANÁLISE
   ├─ Agregar resultados
   └─ Gerar relatório consolidado
```

### **Script de Teste em Massa**

```typescript
// scripts/mass_test.ts
import fs from 'fs';
import path from 'path';
import { TestPatternService } from './generate_scenarios';

interface TestResult {
  graphId: string;
  date: string;
  totalRounds: number;
  plays2x: number;
  playsPink: number;
  wins2x: number;
  losses2x: number;
  winsPink: number;
  lossesPink: number;
  accuracy2x: number;
  accuracyPink: number;
  profit: number;
  scoreBreakdowns: any[];
}

async function runMassTest(dataDir: string): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Ler todos os arquivos de dados
  const files = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.txt'))
    .sort();
  
  console.log(`📊 Iniciando teste em massa: ${files.length} grafos\n`);
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const values = content.split('\n')
      .map(line => parseFloat(line.trim()))
      .filter(v => !isNaN(v));
    
    if (values.length < 60) {
      console.log(`⚠️ Pulando ${file}: apenas ${values.length} rodadas`);
      continue;
    }
    
    // Dividir em memória + sequência
    const memory = values.slice(0, 60);
    const sequence = values.slice(60);
    
    // Rodar teste
    const result = await runSingleTest(file, memory, sequence);
    results.push(result);
    
    console.log(`✅ ${file}: ${result.accuracy2x.toFixed(1)}% (2x) | Lucro: R$${result.profit.toFixed(2)}`);
  }
  
  // Gerar relatório consolidado
  generateConsolidatedReport(results);
  
  return results;
}

function generateConsolidatedReport(results: TestResult[]) {
  const totalGraphs = results.length;
  const avgAccuracy2x = results.reduce((sum, r) => sum + r.accuracy2x, 0) / totalGraphs;
  const avgAccuracyPink = results.reduce((sum, r) => sum + r.accuracyPink, 0) / totalGraphs;
  const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
  const avgProfit = totalProfit / totalGraphs;
  
  const report = `
# 📊 RELATÓRIO CONSOLIDADO - TESTE EM MASSA

## Resumo Geral
- **Total de Grafos:** ${totalGraphs}
- **Período:** ${results[0].date} a ${results[results.length-1].date}

## Métricas Globais
| Estratégia | Assertividade Média | Total Jogadas | Total Greens | Total Losses |
|------------|---------------------|---------------|--------------|--------------|
| 🟣 Roxa (2x) | **${avgAccuracy2x.toFixed(1)}%** | ${results.reduce((s,r) => s + r.plays2x, 0)} | ${results.reduce((s,r) => s + r.wins2x, 0)} | ${results.reduce((s,r) => s + r.losses2x, 0)} |
| 🌸 Rosa (10x) | **${avgAccuracyPink.toFixed(1)}%** | ${results.reduce((s,r) => s + r.playsPink, 0)} | ${results.reduce((s,r) => s + r.winsPink, 0)} | ${results.reduce((s,r) => s + r.lossesPink, 0)} |

## Resultado Financeiro
- **Lucro Total:** R$ ${totalProfit.toFixed(2)}
- **Lucro Médio por Grafo:** R$ ${avgProfit.toFixed(2)}
- **Grafos Lucrativos:** ${results.filter(r => r.profit > 0).length} (${(results.filter(r => r.profit > 0).length / totalGraphs * 100).toFixed(1)}%)

## Top 10 Melhores Grafos
${results.sort((a, b) => b.profit - a.profit).slice(0, 10).map((r, i) => 
  `${i+1}. ${r.graphId}: R$ ${r.profit.toFixed(2)} (${r.accuracy2x.toFixed(1)}% acerto)`
).join('\n')}

## Top 10 Piores Grafos
${results.sort((a, b) => a.profit - b.profit).slice(0, 10).map((r, i) => 
  `${i+1}. ${r.graphId}: R$ ${r.profit.toFixed(2)} (${r.accuracy2x.toFixed(1)}% acerto)`
).join('\n')}

## Análise de Padrões
(TODO: Identificar quais features correlacionam com sucesso)
`;

  fs.writeFileSync('RELATORIO_MASSA.md', report);
  console.log('\n✅ Relatório consolidado gerado: RELATORIO_MASSA.md');
}
```

---

## 📈 ANÁLISE ESTATÍSTICA

### **Métricas a Coletar**

Para cada grafo:
- ✅ Assertividade 2x e 10x
- ✅ Lucro/prejuízo
- ✅ Número de jogadas
- ✅ Score médio das jogadas
- ✅ Features mais frequentes (streak, conv%, etc)

### **Análise de Correlação**

```python
import pandas as pd
import matplotlib.pyplot as plt

def analyze_feature_correlation(results):
    """
    Identifica quais features correlacionam com sucesso
    """
    df = pd.DataFrame(results)
    
    # Correlação entre features e acerto
    correlations = df.corr()['win_rate'].sort_values(ascending=False)
    
    print("🔍 Features mais correlacionadas com acerto:")
    print(correlations)
    
    # Visualizar
    plt.figure(figsize=(10, 6))
    correlations.plot(kind='barh')
    plt.title('Correlação Features vs Taxa de Acerto')
    plt.xlabel('Correlação')
    plt.tight_layout()
    plt.savefig('correlation_analysis.png')
```

---

## 🎯 META DE COLETA

### **Fase 1: Validação Inicial (10 grafos)**
- Objetivo: Testar se o sistema funciona basicamente
- Tempo: 1-2 dias
- Método: Manual (copiar/colar valores)

### **Fase 2: Validação Expandida (50 grafos)**
- Objetivo: Estatística confiável
- Tempo: 1 semana
- Método: Semi-automático (screenshots + OCR)

### **Fase 3: Produção (100+ grafos)**
- Objetivo: Treinar modelo ML
- Tempo: Contínuo
- Método: Automático (API se disponível)

---

## 🚀 COMO COMEÇAR HOJE

### **Tarefa Imediata:**

1. **Coletar 10 grafos hoje:**
   - Abrir site do Aviator
   - Tirar 10 screenshots de históricos diferentes
   - Copiar valores para arquivos .txt

2. **Formato do arquivo:**
```
# grafo_001.txt
4.02
7.15
6.85
11.27
2.30
...
(60-100 valores)
```

3. **Rodar teste:**
```bash
# Para cada grafo
npx tsx scripts/play_auto.ts < grafo_001.txt
```

4. **Coletar resultados:**
- Assertividade
- Lucro
- Número de jogadas

5. **Análise:**
- Média de assertividade dos 10 grafos
- Identificar grafos bons vs ruins
- Ajustar thresholds se necessário

---

## 📝 TEMPLATE DE COLETA

Criei um template para você anotar:

```
GRAFO #001
Data: 05/01/2026
Hora: 09:30
Período: Manhã
Fonte: [Site/Screenshot]

Valores (60-100):
4.02, 7.15, 6.85, 11.27, ...

Resultado do Teste:
- Jogadas 2x: __
- Greens 2x: __
- Assertividade: __%
- Lucro: R$ __

Observações:
- Grafo com muitos blues
- Padrão intervalo 4 detectado
- etc
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Coletar 10 grafos hoje (manual)
2. ✅ Rodar testes e anotar resultados
3. ✅ Implementar script de extração OCR (se viável)
4. ✅ Criar pipeline automatizado
5. ✅ Expandir para 50 grafos na próxima semana
6. ✅ Ajustar pesos do sistema de pontuação baseado em dados

**Você está disposto a coletar 10 grafos hoje para começarmos?**
