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

print("DEBUG: STARTING SCRIPT...", flush=True)

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
        
    # Variáveis para DEDUP Espacial
        last_val = None
        last_x = -999
        last_w = 0  # Largura aproximada do último item
        
        for idx in sorted(bands.keys()):
            band_items = bands[idx]
            if len(band_items) < 3: continue 
            
            x_count = sum(1 for i in band_items if 'x' in i['text'])
            colon_count = sum(1 for i in band_items if ':' in i['text'])
            avg_h = sum(i['h'] for i in band_items) / len(band_items)
            
            if colon_count > x_count or avg_h < median_h * 0.6:
                continue
                
            row_items = sorted(band_items, key=lambda i: i['x'])
            for d in row_items:
                text = d['text'].replace(' ', '')
                current_x = d['x']
                current_w = (d['bbox'][1][0] - d['bbox'][0][0])
                
                if ':' in text: continue
                
                candidate_val = None
                
                # PRIORIDADE 1: Match com 'x'
                m = re.search(multi_pattern, text)
                if m:
                    try:
                        candidate_val = float(m.group(1).replace(',', '.'))
                    except: pass
                
                # PRIORIDADE 2: Match sem 'x'
                if candidate_val is None:
                    is_trusted_band = (x_count > 0)
                    if x_count > 3 or (len(band_items) > 10 and avg_h > median_h * 0.9):
                        m = re.search(pure_num_pattern, text)
                        if m:
                            try:
                                val = float(m.group(1).replace(',', '.'))
                                if not is_trusted_band:
                                    if val < 25 and '.' in m.group(1) and len(m.group(1)) >= 4: continue
                                    if val.is_integer() and val > 10 and not (99 < val < 1000): continue
                                candidate_val = val
                            except: pass

                # ------ VALIDAÇÃO COMUM ------
                if candidate_val is not None:
                    val = candidate_val
                    
                    if val.is_integer() and 99 < val < 1000:
                        val = val / 100.0

                    if not (x_count > 0) and val > 100 and val.is_integer():
                        continue

                    if not (1.0 <= val <= 5000):
                        continue

                    # 4. DEDUP ESPACIAL (Crucial para não deletar 1.00 seguido de 1.00)
                    # Se o valor é IGUAL ao anterior E está MUITO PERTO (sobreposição), é duplicata de OCR.
                    # Se está longe (distância > largura do anterior), é uma nova vela com mesmo valor.
                    is_duplicate = False
                    if last_val is not None and val == last_val:
                        dist = abs(current_x - last_x)
                        # Threshold: Se a distância for menor que a largura do anterior (sobreposição), é dup
                        if dist < last_w * 0.8: 
                            is_duplicate = True
                    
                    if is_duplicate:
                        continue
                        
                    values.append(val)
                    last_val = val
                    last_x = current_x
                    last_w = current_w
                        
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
    if len(sys.argv) < 2:
        print("❌ Erro: Informe o nome da pasta raiz (ex: python script.py DEZ_26)")
        return 1

    root_folder = sys.argv[1]
    
    # Define paths based on standard structure
    # ROOT/GRAFOS_IMG -> Input
    # ROOT/GRAFOS_TXT -> Output
    
    base_path = os.path.abspath(root_folder)
    input_path = os.path.join(base_path, 'GRAFOS_IMG')
    output_dir = os.path.join(base_path, 'GRAFOS_TXT')
    
    print("\n" + "=" * 80)
    print(f"AUTO EXTRACT - OCR (Pasta: {root_folder})")
    print("=" * 80)
    print(f"📂 Entrada: {input_path}")
    print(f"📂 Saída:   {output_dir}")
    print("=" * 80 + "\n")
    
    if not os.path.exists(input_path):
        print(f"❌ Pasta de entrada não encontrada: {input_path}")
        print(f"   (Certifique-se que criou a pasta 'GRAFOS_IMG' dentro de '{root_folder}')")
        return 1
    
    # Criar pasta de saída
    os.makedirs(output_dir, exist_ok=True)
    
    # Lógica de Limpeza (--limpar)
    if '--limpar' in sys.argv:
        print(f"🧹 Modo Limpeza ativado. Removendo arquivos antigos de '{output_dir}'...")
        count_clean = 0
        for f in os.listdir(output_dir):
            if f.endswith('.txt'):
                try:
                    os.remove(os.path.join(output_dir, f))
                    count_clean += 1
                except: pass
        print(f"✅ Limpeza concluída ({count_clean} arquivos removidos).\n")
    
    # Encontrar imagens
    image_files_set = set()
    extensions = ['*.png', '*.jpg', '*.jpeg', '*.bmp']
    for ext in extensions:
        image_files_set.update(Path(input_path).glob(ext))
        image_files_set.update(Path(input_path).glob(ext.upper()))
    image_files = sorted(list(image_files_set))
    
    # Filtro por arquivo (--arquivo NAME)
    if '--arquivo' in sys.argv:
        try:
            idx = sys.argv.index('--arquivo')
            if idx + 1 < len(sys.argv):
                target = sys.argv[idx + 1]
                print(f"🎯 Filtrando por: '{target}'")
                image_files = [f for f in image_files if target in f.name]
        except: pass

    if not image_files:
        print(f"❌ Nenhuma imagem encontrada em {input_path}")
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
        
        # Check if exists
        if os.path.exists(output_file):
            print(f"   ⏭️  Arquivo {os.path.basename(output_file)} já existe. Pulando...\n")
            success_count += 1
            continue
        
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
    print("\n" + "=" * 80)
    print("🚀 INICIANDO ANÁLISE AUTOMÁTICA...")
    print("=" * 80 + "\n")
    
    # Executar Backtest Automaticamente
    # Caminho relativo ou absoluto para o script Node
    script_path = os.path.join(os.path.dirname(__file__), 'ANALISADOR_PRINCIPAL_V9.cjs')
    
    try:
        # Usando 'node' (assumindo que está no PATH). Se falhar, o usuário vê o erro.
        subprocess.run(['node', script_path, root_folder], check=True)
    except Exception as e:
        print(f"❌ Erro ao executar análise: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
