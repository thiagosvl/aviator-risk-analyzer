# 📦 Tutorial de Instalação: Aviator Risk Analyzer

Este tutorial mostra passo a passo como instalar a extensão **Aviator Risk Analyzer** no Google Chrome.

## Pré-requisitos

-   Google Chrome instalado (versão 88 ou superior)
-   Arquivo `aviator-analyzer-extension.zip` (baixado do repositório ou fornecido)

## Passo 1: Descompactar o Arquivo

1.  Localize o arquivo `aviator-analyzer-extension.zip` no seu computador.
2.  Clique com o botão direito no arquivo e selecione **"Extrair aqui"** ou **"Descompactar"**.
3.  Uma nova pasta chamada `dist` será criada. Esta pasta contém todos os arquivos da extensão.

## Passo 2: Abrir a Página de Extensões do Chrome

1.  Abra o Google Chrome.
2.  Na barra de endereços, digite: `chrome://extensions` e pressione **Enter**.
3.  Você será redirecionado para a página de gerenciamento de extensões.

## Passo 3: Ativar o Modo do Desenvolvedor

1.  No canto superior direito da página de extensões, você verá um botão chamado **"Modo do desenvolvedor"**.
2.  Clique no botão para ativá-lo. Ele ficará azul quando ativado.

## Passo 4: Carregar a Extensão

1.  Após ativar o "Modo do desenvolvedor", três novos botões aparecerão no topo da página: **"Carregar sem compactação"**, **"Compactar extensão"**, e **"Atualizar"**.
2.  Clique no botão **"Carregar sem compactação"**.
3.  Uma janela de seleção de pasta será aberta.
4.  Navegue até a pasta `dist` que você extraiu no **Passo 1** e selecione-a.
5.  Clique em **"Selecionar pasta"** (ou **"Abrir"**, dependendo do sistema operacional).

## Passo 5: Verificar a Instalação

1.  A extensão **Aviator Risk Analyzer** agora deve aparecer na lista de extensões instaladas.
2.  Você verá o ícone da extensão, o nome, e a versão.
3.  Certifique-se de que o botão de ativação (toggle) esteja **ligado** (azul).

## Passo 6: Testar a Extensão

1.  Abra uma nova aba no Chrome.
2.  Navegue até um dos sites de apostas suportados (ex: Bet365, Betano, Pixbet, etc.) e abra o jogo **Aviator**.
3.  Após alguns segundos, o **overlay do Aviator Risk Analyzer** deve aparecer no canto superior direito da tela do jogo.
4.  Se o overlay não aparecer, tente recarregar a página (F5).

## Solução de Problemas

### A extensão não aparece na lista após carregar

-   **Verifique se você selecionou a pasta `dist` correta.** A pasta deve conter um arquivo chamado `manifest.json`.
-   **Verifique se há erros na página de extensões.** Se houver, clique em "Detalhes" para ver mais informações.

### O overlay não aparece no jogo

-   **Verifique se a extensão está ativada** na página `chrome://extensions`.
-   **Recarregue a página do jogo** (F5).
-   **Abra o console do navegador** (F12) e procure por mensagens de erro. Se houver alguma mensagem começando com `[Aviator Analyzer]`, isso pode indicar um problema.

### A extensão para de funcionar após fechar o Chrome

-   Isso é normal quando você carrega uma extensão em modo de desenvolvedor. Ao fechar o Chrome, a extensão pode ser desativada.
-   Para reativá-la, basta voltar em `chrome://extensions` e clicar no botão de ativação novamente.

## Próximos Passos

Agora que a extensão está instalada, você pode:

-   **Ler a documentação:** Veja os arquivos `COMO_FUNCIONA.md` e `HOW_TO_EVOLVE.md` para entender melhor como a extensão funciona e como personalizá-la.
-   **Contribuir no GitHub:** Acesse o repositório em https://github.com/thiagosvl/aviator-risk-analyzer e contribua com melhorias.
