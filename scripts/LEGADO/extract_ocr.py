#!/usr/bin/env python3
"""
OCR Extractor - Extrai números de screenshots do Aviator
Usa easyocr (mais preciso que tesseract para números)
"""

import os
import sys
import re
from pathlib import Path

def extract_numbers_simple(image_path):
    """
    Extração simples sem OCR - você fornece os números
    Temporário até OCR estar funcionando
    """
    print(f"\n📸 Imagem: {os.path.basename(image_path)}")
    print("⚠️  OCR automático ainda não disponível")
    print("\nPor favor, digite os números da imagem (separados por espaço ou Enter):")
    print("Quando terminar, pressione Ctrl+D (Linux/Mac) ou Ctrl+Z (Windows)\n")
    
    lines = []
    try:
        while True:
            line = input()
            if line.strip():
                lines.append(line)
    except EOFError:
        pass
    
    # Juntar e extrair números
    text = ' '.join(lines)
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

def try_ocr_extraction(image_path):
    """
    Tenta usar OCR (easyocr ou tesseract)
    """
    # Tentar easyocr
    try:
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False)
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
        
        if len(values) >= 60:
            return values
    except ImportError:
        pass
    except Exception as e:
        print(f"   Erro no easyocr: {e}")
    
    # Tentar tesseract
    try:
        import pytesseract
        from PIL import Image
        
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, config='--psm 6')
        
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
        
        if len(values) >= 60:
            return values
    except ImportError:
        pass
    except Exception as e:
        print(f"   Erro no tesseract: {e}")
    
    return None

def main():
    if len(sys.argv) < 3:
        print("Uso: python3 extract_ocr.py <imagem.png> <saida.txt>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(image_path):
        print(f"❌ Imagem não encontrada: {image_path}")
        sys.exit(1)
    
    # Tentar OCR automático primeiro
    values = try_ocr_extraction(image_path)
    
    # Se OCR falhar, usar entrada manual
    if not values or len(values) < 60:
        if values:
            print(f"⚠️  OCR extraiu apenas {len(values)} valores (mínimo: 60)")
        values = extract_numbers_simple(image_path)
    
    if not values:
        print("❌ Nenhum valor extraído")
        sys.exit(1)
    
    if len(values) < 60:
        print(f"⚠️  AVISO: Apenas {len(values)} valores (mínimo recomendado: 60)")
    
    # Salvar
    with open(output_path, 'w') as f:
        for val in values:
            f.write(f"{val:.2f}\n")
    
    print(f"✅ Extraídos {len(values)} valores → {output_path}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
