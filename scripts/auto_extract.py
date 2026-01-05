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
    """Extrai números usando easyocr com escala 4x e agrupamento por grid"""
    try:
        import easyocr
        from PIL import Image
        import numpy as np
        
        # 0. Abrir e Escalar Imagem (4x para não perder pontos/vírgulas minúsculos)
        img = Image.open(image_path).convert('RGB')
        w, h = img.size
        img = img.resize((w*4, h*4), Image.Resampling.LANCZOS)
        
        # Configuração do Reader
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        img_np = np.array(img)
        # allowlist estrito ajuda a evitar lixo, mas incluímos ':' para detectar horas
        result = reader.readtext(img_np, allowlist='0123456789.,xX:')
        
        if not result:
            return []

        # 1. Coletar detecções
        detections = []
        for (bbox, text, prob) in result:
            text = text.strip().lower()
            if not text: continue
            
            h_det = abs(bbox[0][1] - bbox[2][1])
            detections.append({
                'text': text,
                'bbox': bbox,
                'h': h_det,
                'y': (bbox[0][1] + bbox[2][1]) / 2, # Usar centro vertical
                'x': (bbox[0][0] + bbox[2][0]) / 2  # Usar centro horizontal
            })
            
        if not detections:
            return []

        # 2. Agrupar em faixas horizontais (Grid Rows)
        h_values = sorted([d['h'] for d in detections])
        median_h = h_values[len(h_values)//2]
        
        # Snap maior (0.7 da altura) para evitar que a mesma linha quebre em duas bandas
        line_snap = median_h * 0.7
        bands = {}
        for d in detections:
            # Agrupar pelo centro Y
            band_idx = round(d['y'] / line_snap)
            if band_idx not in bands: bands[band_idx] = []
            bands[band_idx].append(d)
            
        # 3. Classificar bandas e extrair
        values = []
        multi_pattern = r'(\d+(?:[.,]\d+)?)\s*[xX*+»_%!]'
        pure_num_pattern = r'(\d+(?:[.,]\d+)?)'
        
        for idx in sorted(bands.keys()):
            band_items = bands[idx]
            # Linhas de multiplicadores no Aviator são densas (até 32 itens)
            # Linhas de horas também. Mas queremos apenas as de multiplicadores.
            if len(band_items) < 3: continue 
            
            x_count = sum(1 for i in band_items if 'x' in i['text'])
            colon_count = sum(1 for i in band_items if ':' in i['text'])
            avg_h = sum(i['h'] for i in band_items) / len(band_items)
            
            # FILTRO DE BANDA (Linha): 
            # Se tem mais ':' que 'x', ou se a altura média é muito baixa (<60% da mediana), é hora.
            if colon_count > x_count or avg_h < median_h * 0.6:
                continue
                
            # Banda válida -> Ordenar por X e extrair
            row_items = sorted(band_items, key=lambda i: i['x'])
            for d in row_items:
                text = d['text'].replace(' ', '')
                if ':' in text: continue
                
                # Prioridade 1: Match com 'x'
                m = re.search(multi_pattern, text)
                if m:
                    val_str = m.group(1).replace(',', '.')
                    try:
                        val = float(val_str)
                        if 1.0 <= val <= 5000:
                            values.append(val)
                            continue
                    except: pass
                
                # Prioridade 2: Match sem 'x' (apenas se a banda for muito confiável)
                if x_count > 3 or (len(band_items) > 10 and avg_h > median_h * 0.9):
                    m = re.search(pure_num_pattern, text)
                    if m:
                        val_str = m.group(1).replace(',', '.')
                        try:
                            val = float(val_str)
                            # Se for um valor baixo e puramente inteiro lido como decimal HH.MM
                            if val < 25 and '.' in val_str and len(val_str) >= 4:
                                continue
                            if 1.0 <= val <= 3000:
                                values.append(val)
                        except: pass
                        
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
    
    # Converter para path absoluto
    screenshots_dir = os.path.abspath(screenshots_dir)
    output_dir = os.path.abspath(output_dir)
    
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
    
    # Encontrar imagens (usando set para evitar duplicatas em sistemas case-insensitive como Windows)
    image_files_set = set()
    extensions = ['*.png', '*.jpg', '*.jpeg', '*.bmp']
    for ext in extensions:
        # Pega tanto minusculo quanto maiusculo
        image_files_set.update(Path(screenshots_dir).glob(ext))
        image_files_set.update(Path(screenshots_dir).glob(ext.upper()))
    
    image_files = sorted(list(image_files_set))
    
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
        # Usar o mesmo nome da imagem para facilitar conferência
        output_file = os.path.join(output_dir, f"{image_path.stem}.txt")
        
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
