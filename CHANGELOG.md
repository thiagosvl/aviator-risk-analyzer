# Changelog - Aviator Risk Analyzer

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

1. Faça `git pull` no seu repositório local
2. Execute `pnpm install` (se houver novas dependências)
3. Execute `pnpm build`
4. Recarregue a extensão no Chrome (`chrome://extensions` → botão de atualizar)

Ou simplesmente baixe o novo `.zip` e reinstale a extensão.
