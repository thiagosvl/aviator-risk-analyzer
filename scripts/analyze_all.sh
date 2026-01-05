#!/bin/bash
#
# ANALYZE ALL - Script Master
# 
# Uso: ./scripts/analyze_all.sh GRAFOS_SCREENSHOTS [profile]
#
# O que faz:
# 1. Extrai números de todas as imagens PNG
# 2. Gera arquivos .txt
# 3. Executa testes em massa
# 4. Gera relatório consolidado
#

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Argumentos
SCREENSHOTS_DIR="${1:-GRAFOS_SCREENSHOTS}"
PROFILE="${2:-balanced}"
OUTPUT_DIR="GRAFOS_TESTE"

echo ""
echo "================================================================================"
echo "ANALYZE ALL - PROCESSAMENTO COMPLETO"
echo "================================================================================"
echo "Pasta de screenshots: $SCREENSHOTS_DIR"
echo "Pasta de saída: $OUTPUT_DIR"
echo "Perfil: $PROFILE"
echo "================================================================================"
echo ""

# Verificar se pasta existe
if [ ! -d "$SCREENSHOTS_DIR" ]; then
    echo -e "${RED}❌ Pasta não encontrada: $SCREENSHOTS_DIR${NC}"
    echo ""
    echo "Crie a pasta e adicione suas screenshots:"
    echo "  mkdir -p $SCREENSHOTS_DIR"
    echo "  # Copie suas imagens para $SCREENSHOTS_DIR/"
    echo ""
    exit 1
fi

# Criar pasta de saída
mkdir -p "$OUTPUT_DIR"

# Encontrar imagens
IMAGES=$(find "$SCREENSHOTS_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | sort)
IMAGE_COUNT=$(echo "$IMAGES" | wc -l)

if [ -z "$IMAGES" ] || [ "$IMAGE_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ Nenhuma imagem encontrada em $SCREENSHOTS_DIR${NC}"
    echo ""
    echo "Adicione imagens PNG/JPG na pasta e tente novamente."
    echo ""
    exit 1
fi

echo -e "${BLUE}📸 Encontradas $IMAGE_COUNT imagens${NC}"
echo ""

# Processar cada imagem
echo "🔄 Extraindo valores das imagens..."
echo ""

SUCCESS_COUNT=0
FAILED_COUNT=0

INDEX=1
while IFS= read -r IMAGE_PATH; do
    BASENAME=$(basename "$IMAGE_PATH")
    OUTPUT_FILE="$OUTPUT_DIR/grafo_$(printf "%03d" $INDEX).txt"
    
    echo -e "${YELLOW}[$INDEX/$IMAGE_COUNT]${NC} $BASENAME"
    
    # Extrair com Python
    if python3 scripts/extract_ocr.py "$IMAGE_PATH" "$OUTPUT_FILE" 2>&1 | grep -q "✅"; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        echo -e "   ${RED}❌ Falhou${NC}"
    fi
    
    INDEX=$((INDEX + 1))
    echo ""
done <<< "$IMAGES"

echo "================================================================================"
echo -e "${GREEN}✅ Extraídos: $SUCCESS_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Falharam: $FAILED_COUNT${NC}"
fi
echo "================================================================================"
echo ""

if [ $SUCCESS_COUNT -eq 0 ]; then
    echo -e "${RED}❌ Nenhum grafo foi extraído com sucesso${NC}"
    echo ""
    exit 1
fi

# Executar testes
echo "🎯 Executando testes em massa..."
echo ""

npx tsx scripts/test_batch.ts "$OUTPUT_DIR" "$PROFILE"

echo ""
echo "================================================================================"
echo -e "${GREEN}✅ PROCESSO COMPLETO!${NC}"
echo "================================================================================"
echo ""
echo "Próximos passos:"
echo "  1. Analise o relatório gerado"
echo "  2. Ajuste pesos/threshold se necessário"
echo "  3. Re-teste com: npx tsx scripts/test_batch.ts $OUTPUT_DIR $PROFILE"
echo ""
