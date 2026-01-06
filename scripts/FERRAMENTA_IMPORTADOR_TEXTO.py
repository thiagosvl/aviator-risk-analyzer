import os
import sys
import re
import subprocess
import glob

def natural_keys(text):
    return [int(c) if c.isdigit() else c for c in re.split(r'(\d+)', text)]

def parse_aviator_data(raw_text):
    """
    Parseia o texto bruto linha a linha.
    Formato esperado:
    01/12/2025 00:59:34
    4,15x
    00:59
    ...
    Retorna lista de dicts: [{'timestamp': '...', 'value': 4.15}, ...]
    Lista revertida para ordem cronológica (Antigo -> Novo).
    """
    lines = raw_text.splitlines()
    data = []
    
    current_time = None
    
    # Regex para data completa: dd/mm/yyyy HH:MM:SS
    date_pattern = r'(\d{2}/\d{2}/\d{4}\s\d{2}:\d{2}:\d{2})'
    # Regex para valor: 1,23x
    val_pattern = r'(\d+(?:[.,]\d+)?)[xX]'
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        # 1. Tenta achar data
        m_date = re.search(date_pattern, line)
        if m_date:
            raw_date = m_date.group(1)
            # Converter BR (DD/MM/YYYY HH:MM:SS) para ISO (YYYY-MM-DD HH:MM:SS)
            try:
                # 01/12/2025 00:59:34 -> [01, 12, 2025] [00:59:34]
                d_part, t_part = raw_date.split(' ')
                day, month, year = d_part.split('/')
                current_time = f"{year}-{month}-{day} {t_part}"
            except:
                current_time = raw_date # Fallback
            continue
            
        # 2. Tenta achar valor
        m_val = re.search(val_pattern, line)
        if m_val:
            try:
                val_str = m_val.group(1).replace(',', '.')
                val = float(val_str)
                
                # Se temos um timestamp pendente, associamos.
                # Se não temos (ex: primeira linha é valor), usamos "Unknown"
                timestamp = current_time if current_time else "Unknown"
                
                data.append({
                    'timestamp': timestamp,
                    'value': val
                })
                
                # Reseta time para evitar reuso incorreto (embora o padrão seja Data -> Valor)
                # Mas se vier Timestamp -> Lixo -> Valor, o timestamp ainda é válido.
                # Vamos manter current_time até aparecer outro.
            except: pass
            continue
            
    # Inverter para Cronológico (Antigo -> Novo)
    data.reverse()
    return data

def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/FERRAMENTA_IMPORTADOR_TEXTO.py <DATASET>")
        return

    dataset_name = sys.argv[1]
    
    if 'DATASETS' not in dataset_name:
        dataset_path = os.path.join('DATASETS', dataset_name)
    else:
        dataset_path = dataset_name
        
    input_dir = os.path.join(dataset_path, 'TEXTO_SUJO')
    output_txt_dir = os.path.join(dataset_path, 'GRAFOS_TXT')
    output_csv_dir = os.path.join(dataset_path, 'GRAFOS_CSV') # Novo
    
    print(f"🚀 Iniciando Importador de Texto (COM METADADOS)")
    print(f"📂 Entrada: {input_dir}")
    print(f"📂 Saída TXT: {output_txt_dir}")
    print(f"📂 Saída CSV: {output_csv_dir}")
    print("-" * 50)
    
    if not os.path.exists(input_dir):
        print(f"❌ Erro: Pasta de entrada não existe: {input_dir}")
        return

    if not os.path.exists(output_txt_dir): os.makedirs(output_txt_dir)
    if not os.path.exists(output_csv_dir): os.makedirs(output_csv_dir)

    # Lógica de Limpeza (--limpar)
    if '--limpar' in sys.argv:
        print(f"🧹 Modo Limpeza ativado. Removendo arquivos antigos...")
        for d in [output_txt_dir, output_csv_dir]:
            for f in os.listdir(d):
                try: os.remove(os.path.join(d, f))
                except: pass
        print(f"✅ Limpeza concluída.\n")

    txt_files = glob.glob(os.path.join(input_dir, "*.txt"))
    txt_files.sort(key=lambda f: natural_keys(f))
    
    if not txt_files:
        print("⚠️  Nenhum arquivo .txt encontrado.")
        return

    total_extracted = 0
    
    for txt_file in txt_files:
        filename = os.path.basename(txt_file)
        base_name = os.path.splitext(filename)[0]
        
        # Caminhos de destino
        out_txt = os.path.join(output_txt_dir, base_name + ".txt")
        out_csv = os.path.join(output_csv_dir, base_name + ".csv")

        # Lógica de Pulo (Skip) - Se ambos existem, pular
        if os.path.exists(out_txt) and os.path.exists(out_csv):
            print(f"📄 Saltando: {filename} (já processado)")
            total_extracted += sum(1 for line in open(out_txt)) if os.path.exists(out_txt) else 0
            continue

        print(f"📄 Processando: {filename}...", end=" ")
        
        try:
            with open(txt_file, 'r', encoding='utf-8') as f:
                raw_content = f.read()
            
            # Parseia com Metadados
            data_points = parse_aviator_data(raw_content)
            
            if not data_points:
                print("⚠️  Nada extraído.")
                continue
                
            # 1. Salvar TXT (Legado / Analisador)
            with open(out_txt, 'w', encoding='utf-8') as f:
                for item in data_points:
                    f.write(f"{item['value']:.2f}\n")
            
            # 2. Salvar CSV (Novo / Futuro)
            with open(out_csv, 'w', encoding='utf-8') as f:
                f.write("Timestamp;Multiplier\n")
                for item in data_points:
                    f.write(f"{item['timestamp']};{item['value']:.2f}\n")
            
            print(f"✅ {len(data_points)} velas. (TXT + CSV gerados)")
            total_extracted += len(data_points)
            
        except Exception as e:
            print(f"❌ Erro: {e}")

    print("-" * 50)
    print(f"🏁 Importação Concluída! Total: {total_extracted} velas.")
    
    #Rodar Analisador
    script_path = os.path.join(os.path.dirname(__file__), 'ANALISADOR_PRINCIPAL_V9.cjs')
    print(f"\n🚀 Chamando Analisador Principal...")
    try:
        subprocess.run(['node', script_path, dataset_path], check=True)
    except Exception as e:
        print(f"❌ Erro ao rodar analisador: {e}")

if __name__ == "__main__":
    main()
