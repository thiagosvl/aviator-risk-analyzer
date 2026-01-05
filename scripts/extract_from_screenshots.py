#!/usr/bin/env python3
"""
Script de Extração Automática de Dados de Screenshots
Extrai valores de multiplicadores de screenshots do histórico do Aviator
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("⚠️  OCR não disponível. Instale com: pip3 install pytesseract pillow")
    print("    Você ainda pode usar o modo manual.")


def extract_values_from_image(image_path: str) -> List[float]:
    """
    Extrai valores de multiplicadores de uma imagem usando OCR
    """
    if not HAS_OCR:
        raise RuntimeError("OCR não disponível")
    
    print(f"📸 Processando: {image_path}")
    
    try:
        img = Image.open(image_path)
        
        # OCR para extrair texto
        text = pytesseract.image_to_string(img, config='--psm 6')
        
        # Regex para encontrar valores tipo "2.35x", "10.07x", "1.00x"
        # Aceita formatos: 2.35x, 2.35, 2,35x, 2,35
        pattern = r'(\d+[.,]\d+)x?'
        matches = re.findall(pattern, text)
        
        # Converter para float (substituir vírgula por ponto)
        values = []
        for match in matches:
            try:
                val = float(match.replace(',', '.'))
                # Validar range (0.5 a 200)
                if 0.5 <= val <= 200:
                    values.append(val)
            except ValueError:
                continue
        
        print(f"   ✅ Extraídos {len(values)} valores")
        return values
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return []


def validate_values(values: List[float]) -> Tuple[bool, str]:
    """
    Valida se os valores extraídos fazem sentido
    """
    if len(values) < 60:
        return False, f"Poucos valores ({len(values)}/60 mínimo)"
    
    if len(values) > 200:
        return False, f"Muitos valores ({len(values)}/200 máximo)"
    
    # Verificar se tem pinks e blues
    has_pinks = any(v >= 10.0 for v in values)
    has_blues = any(v < 2.0 for v in values)
    
    if not has_pinks:
        return False, "Sem valores >= 10x (pinks)"
    
    if not has_blues:
        return False, "Sem valores < 2x (blues)"
    
    return True, "OK"


def save_to_file(values: List[float], output_path: str):
    """
    Salva valores em arquivo .txt (um por linha)
    """
    with open(output_path, 'w') as f:
        for val in values:
            f.write(f"{val:.2f}\n")
    print(f"💾 Salvo em: {output_path}")


def manual_input_mode():
    """
    Modo manual: usuário cola os valores
    """
    print("\n" + "="*60)
    print("MODO MANUAL - EXTRAÇÃO DE DADOS")
    print("="*60)
    print("\nCole os valores do histórico (um por linha ou separados por espaço)")
    print("Quando terminar, pressione Ctrl+D (Linux/Mac) ou Ctrl+Z (Windows)\n")
    
    lines = sys.stdin.readlines()
    text = ' '.join(lines)
    
    # Extrair números
    pattern = r'(\d+[.,]\d+)'
    matches = re.findall(pattern, text)
    
    values = []
    for match in matches:
        try:
            val = float(match.replace(',', '.'))
            if 0.5 <= val <= 200:
                values.append(val)
        except ValueError:
            continue
    
    return values


def process_directory(input_dir: str, output_dir: str):
    """
    Processa todos os screenshots em um diretório
    """
    if not HAS_OCR:
        print("❌ OCR não disponível. Use modo manual.")
        return
    
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Procurar imagens
    image_extensions = ['.png', '.jpg', '.jpeg', '.bmp']
    images = []
    for ext in image_extensions:
        images.extend(input_path.glob(f'*{ext}'))
    
    if not images:
        print(f"❌ Nenhuma imagem encontrada em {input_dir}")
        return
    
    print(f"\n📊 Encontradas {len(images)} imagens")
    print("="*60)
    
    success_count = 0
    for i, img_path in enumerate(sorted(images), 1):
        values = extract_values_from_image(str(img_path))
        
        if not values:
            print(f"   ⚠️  Nenhum valor extraído, pulando...")
            continue
        
        # Validar
        is_valid, msg = validate_values(values)
        if not is_valid:
            print(f"   ⚠️  Validação falhou: {msg}")
            continue
        
        # Salvar
        output_file = output_path / f"grafo_{i:03d}.txt"
        save_to_file(values, str(output_file))
        success_count += 1
    
    print("\n" + "="*60)
    print(f"✅ Processados: {success_count}/{len(images)} grafos")
    print(f"📁 Salvos em: {output_dir}")


def main():
    """
    Função principal
    """
    print("\n" + "="*60)
    print("EXTRATOR DE DADOS - AVIATOR ANALYZER")
    print("="*60)
    
    if len(sys.argv) > 1:
        # Modo: processar diretório
        input_dir = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else "GRAFOS_EXTRAIDOS"
        process_directory(input_dir, output_dir)
    else:
        # Modo: entrada manual
        print("\nModos disponíveis:")
        print("1. OCR automático: python3 extract_from_screenshots.py <pasta_screenshots> [pasta_saida]")
        print("2. Manual: python3 extract_from_screenshots.py manual")
        print()
        
        choice = input("Escolha o modo (1/2): ").strip()
        
        if choice == '2' or sys.argv[1:2] == ['manual']:
            values = manual_input_mode()
            
            if not values:
                print("❌ Nenhum valor válido encontrado")
                return
            
            print(f"\n✅ Extraídos {len(values)} valores")
            
            # Validar
            is_valid, msg = validate_values(values)
            if not is_valid:
                print(f"⚠️  Aviso: {msg}")
            
            # Salvar
            output_file = input("\nNome do arquivo de saída (ex: grafo_001.txt): ").strip()
            if not output_file:
                output_file = "grafo_manual.txt"
            
            save_to_file(values, output_file)
        else:
            print("\nUso:")
            print("  python3 extract_from_screenshots.py <pasta_screenshots> [pasta_saida]")
            print("  python3 extract_from_screenshots.py manual")


if __name__ == '__main__':
    main()
