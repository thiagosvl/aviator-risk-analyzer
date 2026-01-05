# 📖 ORDEM DE LEITURA DOS GRAFOS

## 🎯 Entendendo a Ordem das Velas

### **Como o Grafo é Exibido**

O histórico do Aviator mostra as velas em ordem **mais recente primeiro**:

```
Linha 1: [33.10x] [2.61x] [1.15x] ... [2.60x]
         ↑ MAIS RECENTE              ↑ MAIS ANTIGA (dessa linha)
         
Linha 2: [1.06x] [9.49x] [1.15x] ...
         ↑ Continua da linha 1
         
Última linha: [...] [...] [2.43x]
                           ↑ VELA MAIS ANTIGA DE TODAS
```

**Leitura:** Esquerda → Direita, Linha 1 → Última linha (como ler um livro)

---

## 🔄 Como Processar Corretamente

### **Passo 1: Extrair Valores**

Quando você extrai os valores do screenshot, eles vêm nesta ordem:

```
33.10  ← Mais recente
2.61
1.15
...
2.43   ← Mais antiga
```

### **Passo 2: Inverter para Ordem Cronológica**

Para simular o jogo, precisamos da ordem cronológica (mais antiga → mais recente):

```typescript
const graphValues = [33.10, 2.61, 1.15, ..., 2.43]; // Como vem do screenshot
const chronological = [...graphValues].reverse();   // Invertemos
// chronological = [2.43, ..., 1.15, 2.61, 33.10]
```

### **Passo 3: Definir Memória Inicial**

No jogo, quando você entra, vê as **últimas 25 velas**:

```typescript
const MEMORY_SIZE = 25;
const initialMemory = chronological.slice(-25); // Últimas 25
```

### **Passo 4: Simular Rodadas**

Agora simulamos rodada por rodada:

```typescript
// Total de rodadas testáveis = total - memória inicial
const totalRounds = chronological.length - MEMORY_SIZE;

for (let i = 0; i < totalRounds; i++) {
    // Memória = últimas 25 velas até este ponto
    const memory = chronological.slice(i, i + MEMORY_SIZE);
    
    // Próxima vela (a que vai acontecer)
    const nextValue = chronological[i + MEMORY_SIZE];
    
    // StrategyCore espera [recente, ..., antiga], então invertemos
    const memoryForAnalysis = [...memory].reverse();
    
    // Analisar
    const analysis = StrategyCore.analyze(memoryForAnalysis);
    
    // Decidir se joga
    if (analysis.recommendation2x.action === 'PLAY_2X') {
        if (nextValue >= 2.0) {
            // GREEN!
        } else {
            // LOSS
        }
    }
}
```

---

## 📊 Exemplo Prático

**Grafo:** 139 velas (01h-02h)

### **Rodada 1:**
- **Memória:** Velas 1-25 (mais antigas)
- **Próxima:** Vela 26
- **Decisão:** Analisa velas 1-25, decide se joga na 26

### **Rodada 2:**
- **Memória:** Velas 2-26
- **Próxima:** Vela 27
- **Decisão:** Analisa velas 2-26, decide se joga na 27

### **Rodada 113:**
- **Memória:** Velas 113-137
- **Próxima:** Vela 138
- **Decisão:** Analisa velas 113-137, decide se joga na 138

### **Rodada 114:**
- **Memória:** Velas 114-138
- **Próxima:** Vela 139
- **Decisão:** Analisa velas 114-138, decide se joga na 139

**Total de rodadas testáveis:** 139 - 25 = **114 rodadas**

---

## ⚠️ Erros Comuns

### **❌ Erro 1: Não Inverter o Grafo**

```typescript
// ERRADO
const memory = graphValues.slice(0, 25); // Pega as 25 MAIS RECENTES
const sequence = graphValues.slice(25);  // Resto é "futuro"
```

**Problema:** Você está simulando do futuro para o passado!

### **❌ Erro 2: Pegar Memória Fixa**

```typescript
// ERRADO
const memory = chronological.slice(0, 25); // Sempre as mesmas 25
for (let i = 0; i < sequence.length; i++) {
    // Analisa sempre com a mesma memória
}
```

**Problema:** Memória não atualiza conforme rodadas acontecem!

### **✅ Correto:**

```typescript
// CERTO
const chronological = [...graphValues].reverse();
for (let i = 0; i < totalRounds; i++) {
    const memory = chronological.slice(i, i + 25); // Memória deslizante
    const next = chronological[i + 25];
    // ...
}
```

---

## 🎯 Por Que Isso Importa?

### **Exemplo Real:**

**Grafo:** [33.10, 2.61, 1.15, ..., 2.43] (139 velas)

#### **Processamento ERRADO:**
```
Rodada 1: Memória = [33.10, 2.61, ..., (25 mais recentes)]
          Próxima = vela 26 (do meio do grafo)
          
Resultado: Você está "prevendo o passado"!
```

#### **Processamento CORRETO:**
```
Rodada 1: Memória = [2.43, ..., (25 mais antigas)]
          Próxima = vela 26 (cronologicamente)
          
Resultado: Você está simulando como se estivesse jogando ao vivo!
```

---

## 📝 Checklist de Validação

Antes de rodar testes em massa, verifique:

- [ ] Grafo foi invertido para ordem cronológica?
- [ ] Memória inicial são as últimas 25 velas?
- [ ] Memória atualiza a cada rodada (sliding window)?
- [ ] Próxima vela é sempre `chronological[i + 25]`?
- [ ] StrategyCore recebe memória invertida `[recente, ..., antiga]`?
- [ ] Total de rodadas = `grafo.length - 25`?

---

## 🚀 Script Implementado

O script `test_v4.ts` já implementa tudo isso corretamente:

```bash
# Testar um grafo
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001.txt balanced

# Ver detalhes completos
npx tsx scripts/test_v4.ts GRAFOS_TESTE/grafo_001.txt balanced --details
```

---

## 📚 Referências

- `scripts/test_v4.ts` - Implementação completa
- `chrome-extension/src/shared/strategyCore.ts` - Lógica de análise
- `DESIGN_SCORE_SYSTEM.md` - Sistema de pontuação

---

**Agora você está pronto para coletar e testar 100+ grafos!** 🎉
