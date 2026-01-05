#!/usr/bin/env python3
"""
Auto Extract - OCR Automático para extrair números das imagens
Usa easyocr (mais preciso que tesseract para números)
"""

import os
import sys
import re
from pathlib import Path
import subprocess

def install_easyocr():
    """Instala easyocr se não estiver disponível"""
    try:
        import easyocr
        return True
    except ImportError:
        print("📦 Instalando easyocr...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "easyocr", "--quiet"])
            print("✅ easyocr instalado!")
            return True
        except:
            print("❌ Erro ao instalar easyocr")
            return False

def extract_with_easyocr(image_path):
    """Extrai números usando easyocr"""
    try:
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        result = reader.readtext(image_path)
        
        # Extrair texto
        text = ' '.join([item[1] for item in result])
        
        # Extrair números
        pattern = r'(\d+[.,]\d+)x?'
        matches = re.findall(pattern, text)
        
        values = []
        for match in matches:
            try:
                val = float(match.replace(',', '.'))
                if 0.5 <= val <= 1000:
                    values.append(val)
            except:
                continue
        
        return values
    except Exception as e:
        print(f"   Erro no easyocr: {e}")
        return None

def extract_with_tesseract(image_path):
    """Extrai números usando tesseract"""
    try:
        import pytesseract
        from PIL import Image
        
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, config='--psm 6 digits')
        
        # Extrair números
        pattern = r'(\d+[.,]\d+)x?'
        matches = re.findall(pattern, text)
        
        values = []
        for match in matches:
            try:
                val = float(match.replace(',', '.'))
                if 0.5 <= val <= 1000:
                    values.append(val)
            except:
                continue
        
        return values
    except Exception as e:
        return None

def main():
    screenshots_dir = sys.argv[1] if len(sys.argv) > 1 else 'GRAFOS_SCREENSHOTS'
    output_dir = 'GRAFOS_TESTE'
    
    print("\n" + "=" * 80)
    print("AUTO EXTRACT - OCR AUTOMÁTICO")
    print("=" * 80)
    print(f"Pasta: {screenshots_dir}")
    print("=" * 80 + "\n")
    
    # Verificar pasta
    if not os.path.exists(screenshots_dir):
        print(f"❌ Pasta não encontrada: {screenshots_dir}")
        return 1
    
    # Criar pasta de saída
    os.makedirs(output_dir, exist_ok=True)
    
    # Encontrar imagens
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']:
        image_files.extend(Path(screenshots_dir).glob(ext))
    
    image_files = sorted(image_files)
    
    if not image_files:
        print(f"❌ Nenhuma imagem encontrada em {screenshots_dir}")
        return 1
    
    print(f"📸 Encontradas {len(image_files)} imagens\n")
    
    # Tentar instalar easyocr
    has_easyocr = install_easyocr()
    
    if not has_easyocr:
        print("\n⚠️  OCR não disponível. Opções:")
        print("   1. Instale easyocr: pip install easyocr")
        print("   2. Ou use: npx tsx scripts/extract_and_test.ts\n")
        return 1
    
    print("🔄 Processando imagens...\n")
    
    success_count = 0
    failed_count = 0
    
    for i, image_path in enumerate(image_files, 1):
        output_file = os.path.join(output_dir, f"grafo_{i:03d}.txt")
        
        print(f"[{i}/{len(image_files)}] {image_path.name}")
        
        # Tentar extrair
        values = extract_with_easyocr(str(image_path))
        
        if not values or len(values) < 60:
            print(f"   ⚠️  OCR extraiu apenas {len(values) if values else 0} valores")
            print(f"   ❌ Falhou (mínimo: 60)\n")
            failed_count += 1
            continue
        
        # Salvar
        with open(output_file, 'w') as f:
            for val in values:
                f.write(f"{val:.2f}\n")
        
        print(f"   ✅ Extraídos {len(values)} valores → {output_file}\n")
        success_count += 1
    
    print("=" * 80)
    print(f"✅ Extraídos: {success_count}")
    print(f"❌ Falharam: {failed_count}")
    print("=" * 80 + "\n")
    
    if success_count == 0:
        print("❌ Nenhum grafo foi extraído com sucesso")
        print("\n💡 ALTERNATIVA: Use extração manual")
        print("   npx tsx scripts/extract_and_test.ts\n")
        return 1
    
    print("✅ Extração completa!")
    print("\n🎯 Próximo passo:")
    print(f"   npx tsx scripts/test_batch.ts {output_dir} balanced\n")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
