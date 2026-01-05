#!/usr/bin/env python3
"""
Análise Profunda de Padrões - Aviator
Objetivo: Identificar padrões ocultos e calcular estimativa de valores para próxima rosa
"""

import os
import glob
from collections import Counter, defaultdict
import statistics

def load_graphs():
    """Carrega todos os grafos de teste"""
    graphs = []
    files = sorted(glob.glob('GRAFOS_TESTE/*.txt'))
    for filepath in files:
        if 'RELATORIO' in filepath:
            continue
        with open(filepath, 'r') as f:
            values = [float(line.strip()) for line in f if line.strip()]
            graphs.append({'file': os.path.basename(filepath), 'values': values})
    return graphs

def analyze_pink_context(graphs):
    """Analisa o contexto completo ao redor de cada rosa"""
    contexts = {
        'before_1': [],  # Vela imediatamente antes
        'before_2': [],  # 2 velas antes
        'before_3': [],  # 3 velas antes
        'after_1': [],   # Vela imediatamente depois
        'after_2': [],   # 2 velas depois
        'sequence_before': [],  # Sequência de 5 velas antes
    }
    
    pink_values = []  # Valores das rosas
    
    for graph in graphs:
        values = graph['values']
        for i, val in enumerate(values):
            if val >= 10.0:
                pink_values.append(val)
                
                if i > 0:
                    contexts['before_1'].append(values[i-1])
                if i > 1:
                    contexts['before_2'].append(values[i-2])
                if i > 2:
                    contexts['before_3'].append(values[i-3])
                if i < len(values) - 1:
                    contexts['after_1'].append(values[i+1])
                if i < len(values) - 2:
                    contexts['after_2'].append(values[i+2])
                if i >= 5:
                    seq = values[i-5:i]
                    contexts['sequence_before'].append(seq)
    
    return contexts, pink_values

def analyze_intervals_deep(graphs):
    """Análise profunda de intervalos entre rosas"""
    all_intervals = []
    interval_to_next_pink = defaultdict(list)  # intervalo -> valores das próximas rosas
    
    for graph in graphs:
        values = graph['values']
        pink_indices = [i for i, v in enumerate(values) if v >= 10.0]
        
        for i in range(len(pink_indices) - 1):
            interval = pink_indices[i+1] - pink_indices[i] - 1
            next_pink_value = values[pink_indices[i+1]]
            
            all_intervals.append(interval)
            interval_to_next_pink[interval].append(next_pink_value)
    
    return all_intervals, interval_to_next_pink

def analyze_volatility_correlation(graphs):
    """Analisa correlação entre volatilidade e valor da próxima rosa"""
    volatility_to_pink = []
    
    for graph in graphs:
        values = graph['values']
        for i, val in enumerate(values):
            if val >= 10.0 and i >= 10:
                # Calcular volatilidade das 10 velas anteriores
                prev_10 = values[i-10:i]
                volatility = statistics.stdev(prev_10) if len(prev_10) > 1 else 0
                volatility_to_pink.append((volatility, val))
    
    return volatility_to_pink

def categorize_pink_value(value):
    """Categoriza valor da rosa"""
    if value < 20:
        return 'BAIXA'
    elif value < 50:
        return 'MÉDIA'
    else:
        return 'ALTA'

def main():
    print("=" * 80)
    print("ANÁLISE PROFUNDA DE PADRÕES - AVIATOR")
    print("=" * 80)
    print()
    
    graphs = load_graphs()
    print(f"📊 Carregados {len(graphs)} grafos")
    print()
    
    # 1. ANÁLISE DE CONTEXTO
    print("=" * 80)
    print("1. CONTEXTO DAS ROSAS")
    print("=" * 80)
    contexts, pink_values = analyze_pink_context(graphs)
    
    print(f"\n📌 Total de Rosas Analisadas: {len(pink_values)}")
    print(f"   Valor Médio: {statistics.mean(pink_values):.2f}x")
    print(f"   Mediana: {statistics.median(pink_values):.2f}x")
    print(f"   Mínimo: {min(pink_values):.2f}x")
    print(f"   Máximo: {max(pink_values):.2f}x")
    
    print(f"\n🔍 VELA IMEDIATAMENTE ANTES DA ROSA:")
    before_1 = contexts['before_1']
    blue_before = sum(1 for v in before_1 if v < 2.0)
    purple_before = sum(1 for v in before_1 if 2.0 <= v < 10.0)
    pink_before = sum(1 for v in before_1 if v >= 10.0)
    
    print(f"   Azul (<2x):     {blue_before} ({blue_before/len(before_1)*100:.1f}%)")
    print(f"   Roxa (2-10x):   {purple_before} ({purple_before/len(before_1)*100:.1f}%)")
    print(f"   Rosa (>=10x):   {pink_before} ({pink_before/len(before_1)*100:.1f}%) - Rosas Coladas")
    
    # Análise de sequências antes da rosa
    print(f"\n🔍 PADRÃO DAS 5 VELAS ANTES DA ROSA:")
    sequences = contexts['sequence_before']
    
    # Contar padrões comuns
    pattern_counts = defaultdict(int)
    for seq in sequences:
        pattern = ''.join(['A' if v < 2.0 else 'R' if v < 10.0 else 'P' for v in seq])
        pattern_counts[pattern] += 1
    
    top_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    print("   Top 10 Padrões (A=Azul, R=Roxa, P=Rosa):")
    for pattern, count in top_patterns:
        print(f"      {pattern}: {count}x ({count/len(sequences)*100:.1f}%)")
    
    # 2. ANÁLISE DE INTERVALOS
    print("\n" + "=" * 80)
    print("2. INTERVALOS ENTRE ROSAS")
    print("=" * 80)
    all_intervals, interval_to_next_pink = analyze_intervals_deep(graphs)
    
    print(f"\n📊 Estatísticas de Intervalos:")
    print(f"   Total de Intervalos: {len(all_intervals)}")
    print(f"   Média: {statistics.mean(all_intervals):.1f} velas")
    print(f"   Mediana: {statistics.median(all_intervals):.0f} velas")
    print(f"   Mínimo: {min(all_intervals)} velas")
    print(f"   Máximo: {max(all_intervals)} velas")
    
    # Distribuição de intervalos
    interval_dist = Counter(all_intervals)
    print(f"\n📍 Distribuição de Intervalos Mais Comuns:")
    for interval, count in sorted(interval_dist.items())[:20]:
        pct = count / len(all_intervals) * 100
        print(f"   {interval:2d} velas: {count:3d}x ({pct:5.1f}%)")
    
    # Correlação intervalo -> valor da próxima rosa
    print(f"\n🎯 CORRELAÇÃO: INTERVALO → VALOR DA PRÓXIMA ROSA:")
    for interval in sorted(interval_to_next_pink.keys())[:15]:
        values = interval_to_next_pink[interval]
        if len(values) >= 3:  # Só mostrar se tiver dados suficientes
            avg = statistics.mean(values)
            median = statistics.median(values)
            
            # Categorizar
            baixa = sum(1 for v in values if v < 20)
            media = sum(1 for v in values if 20 <= v < 50)
            alta = sum(1 for v in values if v >= 50)
            
            print(f"   {interval:2d} velas: Média {avg:6.1f}x | Mediana {median:6.1f}x | B:{baixa} M:{media} A:{alta}")
    
    # 3. ANÁLISE DE VOLATILIDADE
    print("\n" + "=" * 80)
    print("3. VOLATILIDADE vs VALOR DA ROSA")
    print("=" * 80)
    volatility_data = analyze_volatility_correlation(graphs)
    
    # Dividir em faixas de volatilidade
    low_vol = [(v, p) for v, p in volatility_data if v < 2.0]
    med_vol = [(v, p) for v, p in volatility_data if 2.0 <= v < 5.0]
    high_vol = [(v, p) for v, p in volatility_data if v >= 5.0]
    
    print(f"\n📊 Volatilidade BAIXA (<2.0):")
    if low_vol:
        pinks = [p for _, p in low_vol]
        print(f"   Rosas: {len(pinks)}")
        print(f"   Valor Médio: {statistics.mean(pinks):.2f}x")
        print(f"   Mediana: {statistics.median(pinks):.2f}x")
        baixa = sum(1 for p in pinks if p < 20)
        media = sum(1 for p in pinks if 20 <= p < 50)
        alta = sum(1 for p in pinks if p >= 50)
        print(f"   Distribuição: BAIXA {baixa} ({baixa/len(pinks)*100:.1f}%) | MÉDIA {media} ({media/len(pinks)*100:.1f}%) | ALTA {alta} ({alta/len(pinks)*100:.1f}%)")
    
    print(f"\n📊 Volatilidade MÉDIA (2.0-5.0):")
    if med_vol:
        pinks = [p for _, p in med_vol]
        print(f"   Rosas: {len(pinks)}")
        print(f"   Valor Médio: {statistics.mean(pinks):.2f}x")
        print(f"   Mediana: {statistics.median(pinks):.2f}x")
        baixa = sum(1 for p in pinks if p < 20)
        media = sum(1 for p in pinks if 20 <= p < 50)
        alta = sum(1 for p in pinks if p >= 50)
        print(f"   Distribuição: BAIXA {baixa} ({baixa/len(pinks)*100:.1f}%) | MÉDIA {media} ({media/len(pinks)*100:.1f}%) | ALTA {alta} ({alta/len(pinks)*100:.1f}%)")
    
    print(f"\n📊 Volatilidade ALTA (>=5.0):")
    if high_vol:
        pinks = [p for _, p in high_vol]
        print(f"   Rosas: {len(pinks)}")
        print(f"   Valor Médio: {statistics.mean(pinks):.2f}x")
        print(f"   Mediana: {statistics.median(pinks):.2f}x")
        baixa = sum(1 for p in pinks if p < 20)
        media = sum(1 for p in pinks if 20 <= p < 50)
        alta = sum(1 for p in pinks if p >= 50)
        print(f"   Distribuição: BAIXA {baixa} ({baixa/len(pinks)*100:.1f}%) | MÉDIA {media} ({media/len(pinks)*100:.1f}%) | ALTA {alta} ({alta/len(pinks)*100:.1f}%)")
    
    # 4. MODELO PREDITIVO
    print("\n" + "=" * 80)
    print("4. MODELO PREDITIVO DE VALORES")
    print("=" * 80)
    
    print(f"\n🎯 REGRAS PARA PREDIÇÃO:")
    print(f"\n   ROSA BAIXA (10-20x):")
    print(f"      - Volatilidade baixa (<2.0)")
    print(f"      - Intervalo curto (0-5 velas)")
    print(f"      - Vela anterior: Azul ou Roxa baixa")
    
    print(f"\n   ROSA MÉDIA (20-50x):")
    print(f"      - Volatilidade média (2.0-5.0)")
    print(f"      - Intervalo médio (6-12 velas)")
    print(f"      - Vela anterior: Roxa ou Rosa")
    
    print(f"\n   ROSA ALTA (50x+):")
    print(f"      - Volatilidade alta (>=5.0)")
    print(f"      - Intervalo longo (13+ velas)")
    print(f"      - Padrão de acúmulo (muitas roxas antes)")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
