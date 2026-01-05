# Changelog - Aviator Risk Analyzer

## [Versão 0.5.1] - 03/01/2026 - MAJOR UI/UX OVERHAUL

### 🎨 Reformulação Completa do UI/UX

**Posicionamento Correto (FINALMENTE!)**
- Overlay agora aparece na **lateral ESQUERDA** da tela (posição inicial: x=20px, y=20px)
- **Completamente FORA da área do jogo** - não cobre mais nada
- Usa `position: fixed` com coordenadas absolutas para controle preciso

**Funcionalidade Draggable (Arrastar)**
- ✨ **NOVO:** Você pode **clicar e arrastar** o overlay para qualquer lugar da tela
- Clique no **header** (onde tem o ícone ≡) e arraste
- Cursor muda para "grabbing" enquanto arrasta
- Ícone `GripVertical` indica visualmente que é arrastável

**Layout Restaurado e Melhorado**
- ✅ **TODOS os cards estão de volta:**
  - Status do jogo + Multiplicador
  - Nível de Risco (com destaque visual)
  - Recomendação
  - Estatísticas (Volatilidade + Média)
  - Últimas 8 velas
  - Padrões detectados (até 3, com contador de adicionais)
- Design mais compacto e organizado
- Bordas e backgrounds melhorados para legibilidade
- Background: `slate-900/98` com `backdrop-blur` para transparência elegante

**Melhorias Visuais**
- Cards com bordas sutis (`border-slate-700/50`)
- Ícones menores e mais proporcionais
- Espaçamento otimizado entre elementos
- Cores mais vibrantes para níveis de risco
- Footer com indicador de status da análise

---

## [Versão 0.5.0] - 03/01/2026

### 🎨 Melhorias de UI/UX

**Posicionamento do Overlay**
- Overlay agora aparece no canto superior direito, **fora da área do jogo**
- Não cobre mais o gráfico do Aviator
- Background com transparência e blur para melhor legibilidade

**Layout Mais Compacto**
- Reduziu espaçamento entre elementos
- Status do jogo e multiplicador agora em uma única linha
- Nível de risco com destaque visual maior
- Mostra apenas as 8 velas mais recentes (antes mostrava todas)
- Padrões limitados a 3 principais (com contador de quantos mais existem)

**Funcionalidade dos Botões**
- Botão **X** fecha o overlay completamente
- Botão **Minimizar/Maximizar** funciona corretamente
- Ícones visuais claros (Lucide React)

### 🔧 Correções Técnicas

**Ordem das Velas Corrigida**
- **IMPORTANTE:** A vela mais recente está à **ESQUERDA** no Aviator
- Código agora inverte a ordem corretamente para análise precisa
- Adicionado log de debug para verificar a ordem

**Restrição de Sites**
- Extensão agora carrega **apenas em sites `.bet` e `.bet.br`**
- Detecção melhorada: só exibe overlay na página do Aviator
- Verifica se a URL contém "aviator" ou "spribe"
- Logs informativos no console para debug

### 📝 Documentação

- Adicionado `TUTORIAL_INSTALACAO.md`
- Adicionado `COMO_FUNCIONA.md`
- Adicionado `HOW_TO_EVOLVE.md`
- Repositório no GitHub: https://github.com/thiagosvl/aviator-risk-analyzer

---

## Como Atualizar

### Opção 1: Git Pull (Recomendado)
```bash
cd aviator-risk-analyzer
git pull
pnpm build
```

Depois vá em `chrome://extensions` e clique no botão de **atualizar** (ícone de reload) da extensão.

### Opção 2: Reinstalar
1. Baixe o novo código do repositório
2. Execute `pnpm install && pnpm build`
3. Recarregue a extensão no Chrome

---

## Testando as Novas Funcionalidades

1. **Posicionamento:** O overlay deve aparecer na lateral esquerda, fora do jogo
2. **Draggable:** Clique no header (onde tem ≡) e arraste para mover
3. **Todos os cards:** Verifique se Status, Risco, Recomendação, Estatísticas, Velas e Padrões estão visíveis
4. **Console:** Abra F12 e procure por `[Aviator Debug] Histórico atualizado (mais recente à esquerda)`

---

## Próximos Passos

- [ ] Adicionar mais padrões de análise personalizados
- [ ] Implementar histórico de longo prazo (últimas 1000 velas)
- [ ] Adicionar gráfico de tendência
- [ ] Salvar posição do overlay (localStorage)
- [ ] Modo de teste com dados simulados
