#!/usr/bin/env python3
"""
Script para análise estatística dos dados experimentais
Gera visualizações e relatório de pesquisa
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json

# Configurar estilo
sns.set_style("darkgrid")
plt.rcParams['figure.figsize'] = (14, 10)
plt.rcParams['font.size'] = 10

# Caminho dos dados
data_path = Path(__file__).parent.parent / 'experimental_data.csv'
output_dir = Path(__file__).parent.parent / 'analysis_results'
output_dir.mkdir(exist_ok=True)

print("📊 Carregando dados experimentais...")
df = pd.read_csv(data_path)

print(f"✅ Dados carregados: {len(df)} simulações")
print(f"📋 Colunas: {len(df.columns)}")

# ============================================================================
# 1. ANÁLISE DESCRITIVA DO IFF
# ============================================================================
print("\n" + "="*70)
print("1. ANÁLISE DESCRITIVA DO ÍNDICE DE FIDELIDADE FÍSICA (IFF)")
print("="*70)

iff_stats = {
    'Média': df['IFF_indice_fidelidade'].mean(),
    'Mediana': df['IFF_indice_fidelidade'].median(),
    'Desvio Padrão': df['IFF_indice_fidelidade'].std(),
    'Mínimo': df['IFF_indice_fidelidade'].min(),
    'Máximo': df['IFF_indice_fidelidade'].max(),
    'Q1': df['IFF_indice_fidelidade'].quantile(0.25),
    'Q3': df['IFF_indice_fidelidade'].quantile(0.75),
}

for metric, value in iff_stats.items():
    print(f"  {metric:.<20} {value:.6f}")

# ============================================================================
# 2. ANÁLISE DE INCERTEZAS
# ============================================================================
print("\n" + "="*70)
print("2. ANÁLISE DE INCERTEZAS (σ_IFF)")
print("="*70)

uncertainty_stats = {
    'Média': df['sigma_IFF_incerteza'].mean(),
    'Máxima': df['sigma_IFF_incerteza'].max(),
    'Mínima': df['sigma_IFF_incerteza'].min(),
}

for metric, value in uncertainty_stats.items():
    print(f"  {metric:.<20} {value:.6f}")

# ============================================================================
# 3. ANÁLISE DE DECISÕES AGÊNTICAS
# ============================================================================
print("\n" + "="*70)
print("3. ANÁLISE DE DECISÕES AGÊNTICAS")
print("="*70)

decisions = df['decisao_agentica'].value_counts()
for decision, count in decisions.items():
    percentage = (count / len(df)) * 100
    print(f"  {decision:.<20} {count:>3} ({percentage:>5.1f}%)")

# ============================================================================
# 4. ANÁLISE POR MODO DE FALHA
# ============================================================================
print("\n" + "="*70)
print("4. ANÁLISE POR MODO DE FALHA")
print("="*70)

failure_analysis = df.groupby('failure_mode').agg({
    'IFF_indice_fidelidade': ['mean', 'std', 'min', 'max'],
    'sigma_IFF_incerteza': 'mean',
    'decisao_agentica': lambda x: (x == 'BLOCKED').sum(),
}).round(6)

print("\nIFF por Modo de Falha:")
for mode in df['failure_mode'].unique():
    mode_data = df[df['failure_mode'] == mode]
    iff_mean = mode_data['IFF_indice_fidelidade'].mean()
    blocked_count = (mode_data['decisao_agentica'] == 'BLOCKED').sum()
    blocked_pct = (blocked_count / len(mode_data)) * 100
    print(f"  {mode:.<25} IFF={iff_mean:.4f}, Bloqueados={blocked_count} ({blocked_pct:.1f}%)")

# ============================================================================
# 5. ANÁLISE POR NÍVEL DE RUÍDO
# ============================================================================
print("\n" + "="*70)
print("5. ANÁLISE POR NÍVEL DE RUÍDO")
print("="*70)

print("\nImpacto do Ruído no IFF:")
for noise in sorted(df['noise_level_percent'].unique()):
    noise_data = df[df['noise_level_percent'] == noise]
    iff_mean = noise_data['IFF_indice_fidelidade'].mean()
    sigma_mean = noise_data['sigma_IFF_incerteza'].mean()
    blocked_count = (noise_data['decisao_agentica'] == 'BLOCKED').sum()
    blocked_pct = (blocked_count / len(noise_data)) * 100
    print(f"  Ruído {noise:>2}% - IFF={iff_mean:.4f}, σ={sigma_mean:.6f}, Bloqueados={blocked_pct:.1f}%")

# ============================================================================
# 6. ANÁLISE DE DIMENSÕES DE FIDELIDADE
# ============================================================================
print("\n" + "="*70)
print("6. ANÁLISE DE DIMENSÕES DE FIDELIDADE")
print("="*70)

dimensions = {
    'D1 (Estado)': 'D1_fidelidade_estado',
    'D2 (Dinâmica)': 'D2_fidelidade_dinamica',
    'D3 (Energia)': 'D3_fidelidade_energia',
    'D4 (Estabilidade)': 'D4_fidelidade_estabilidade',
}

for name, col in dimensions.items():
    mean_val = df[col].mean()
    std_val = df[col].std()
    print(f"  {name:.<25} Média={mean_val:.4f}, Desvio={std_val:.4f}")

# ============================================================================
# 7. ANÁLISE HIL
# ============================================================================
print("\n" + "="*70)
print("7. ANÁLISE HARDWARE-IN-THE-LOOP (HIL)")
print("="*70)

hil_synced = (df['hil_sincronizado'] == 'SIM').sum()
hil_sync_pct = (hil_synced / len(df)) * 100
latency_mean = df['latencia_hil_ms'].mean()
jitter_mean = df['jitter_hil_ms'].mean()

print(f"  Taxa de Sincronização:.... {hil_sync_pct:.1f}% ({hil_synced}/{len(df)})")
print(f"  Latência Média (ms):..... {latency_mean:.2f}")
print(f"  Jitter Médio (ms):....... {jitter_mean:.2f}")

# ============================================================================
# GERAR VISUALIZAÇÕES
# ============================================================================
print("\n" + "="*70)
print("GERANDO VISUALIZAÇÕES")
print("="*70)

# Figura 1: Distribuição de IFF
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Análise do Índice de Fidelidade Física (IFF)', fontsize=16, fontweight='bold')

# Histograma
axes[0, 0].hist(df['IFF_indice_fidelidade'], bins=30, color='#3b82f6', edgecolor='black', alpha=0.7)
axes[0, 0].axvline(df['IFF_indice_fidelidade'].mean(), color='red', linestyle='--', linewidth=2, label=f'Média: {df["IFF_indice_fidelidade"].mean():.4f}')
axes[0, 0].axvline(0.95, color='green', linestyle='--', linewidth=2, label='Threshold Operacional')
axes[0, 0].axvline(0.90, color='orange', linestyle='--', linewidth=2, label='Threshold Warning')
axes[0, 0].set_xlabel('IFF')
axes[0, 0].set_ylabel('Frequência')
axes[0, 0].set_title('Distribuição de IFF')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Box plot por decisão
df_plot = df.copy()
df_plot['decisao_agentica'] = pd.Categorical(df_plot['decisao_agentica'], categories=['OPERATIONAL', 'WARNING', 'BLOCKED'], ordered=True)
sns.boxplot(data=df_plot, x='decisao_agentica', y='IFF_indice_fidelidade', ax=axes[0, 1], palette=['green', 'orange', 'red'])
axes[0, 1].set_title('IFF por Decisão Agêntica')
axes[0, 1].set_ylabel('IFF')
axes[0, 1].set_xlabel('Decisão')
axes[0, 1].grid(True, alpha=0.3, axis='y')

# IFF vs Ruído
noise_data = df.groupby('noise_level_percent')['IFF_indice_fidelidade'].agg(['mean', 'std'])
axes[1, 0].errorbar(noise_data.index, noise_data['mean'], yerr=noise_data['std'], marker='o', capsize=5, capthick=2, linewidth=2, markersize=8, color='#3b82f6')
axes[1, 0].fill_between(noise_data.index, noise_data['mean'] - noise_data['std'], noise_data['mean'] + noise_data['std'], alpha=0.2, color='#3b82f6')
axes[1, 0].set_xlabel('Nível de Ruído (%)')
axes[1, 0].set_ylabel('IFF')
axes[1, 0].set_title('Impacto do Ruído no IFF')
axes[1, 0].grid(True, alpha=0.3)

# Incerteza vs Ruído
uncertainty_data = df.groupby('noise_level_percent')['sigma_IFF_incerteza'].mean()
axes[1, 1].plot(uncertainty_data.index, uncertainty_data.values, marker='s', linewidth=2, markersize=8, color='#ef4444')
axes[1, 1].set_xlabel('Nível de Ruído (%)')
axes[1, 1].set_ylabel('σ_IFF')
axes[1, 1].set_title('Propagação de Incerteza vs Ruído')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(output_dir / 'iff_analysis.png', dpi=300, bbox_inches='tight')
print("✅ Salvo: iff_analysis.png")
plt.close()

# Figura 2: Análise de Dimensões
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Análise das Dimensões de Fidelidade', fontsize=16, fontweight='bold')

for idx, (name, col) in enumerate(dimensions.items()):
    ax = axes[idx // 2, idx % 2]
    ax.hist(df[col], bins=25, color='#10b981', edgecolor='black', alpha=0.7)
    ax.axvline(df[col].mean(), color='red', linestyle='--', linewidth=2, label=f'Média: {df[col].mean():.4f}')
    ax.set_xlabel(name)
    ax.set_ylabel('Frequência')
    ax.set_title(f'Distribuição de {name}')
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(output_dir / 'dimensions_analysis.png', dpi=300, bbox_inches='tight')
print("✅ Salvo: dimensions_analysis.png")
plt.close()

# Figura 3: Análise de Modos de Falha
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle('Análise de Modos de Falha', fontsize=16, fontweight='bold')

# IFF por modo de falha
failure_iff = df.groupby('failure_mode')['IFF_indice_fidelidade'].mean().sort_values()
axes[0].barh(failure_iff.index, failure_iff.values, color='#8b5cf6', edgecolor='black', alpha=0.7)
axes[0].set_xlabel('IFF Médio')
axes[0].set_title('IFF Médio por Modo de Falha')
axes[0].grid(True, alpha=0.3, axis='x')

# Decisões por modo de falha
failure_decisions = pd.crosstab(df['failure_mode'], df['decisao_agentica'], normalize='index') * 100
failure_decisions = failure_decisions[['OPERATIONAL', 'WARNING', 'BLOCKED']]
failure_decisions.plot(kind='bar', ax=axes[1], color=['green', 'orange', 'red'], alpha=0.7, edgecolor='black')
axes[1].set_ylabel('Percentual (%)')
axes[1].set_xlabel('Modo de Falha')
axes[1].set_title('Distribuição de Decisões por Modo de Falha')
axes[1].legend(title='Decisão')
axes[1].grid(True, alpha=0.3, axis='y')
plt.setp(axes[1].xaxis.get_majorticklabels(), rotation=45, ha='right')

plt.tight_layout()
plt.savefig(output_dir / 'failure_modes_analysis.png', dpi=300, bbox_inches='tight')
print("✅ Salvo: failure_modes_analysis.png")
plt.close()

# Figura 4: Análise HIL
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Análise Hardware-in-the-Loop (HIL)', fontsize=16, fontweight='bold')

# Latência vs IFF
axes[0, 0].scatter(df['latencia_hil_ms'], df['IFF_indice_fidelidade'], alpha=0.6, s=50, color='#3b82f6')
axes[0, 0].set_xlabel('Latência (ms)')
axes[0, 0].set_ylabel('IFF')
axes[0, 0].set_title('Latência vs IFF')
axes[0, 0].grid(True, alpha=0.3)

# Jitter vs IFF
axes[0, 1].scatter(df['jitter_hil_ms'], df['IFF_indice_fidelidade'], alpha=0.6, s=50, color='#f59e0b')
axes[0, 1].set_xlabel('Jitter (ms)')
axes[0, 1].set_ylabel('IFF')
axes[0, 1].set_title('Jitter vs IFF')
axes[0, 1].grid(True, alpha=0.3)

# Distribuição de Latência
axes[1, 0].hist(df['latencia_hil_ms'], bins=25, color='#3b82f6', edgecolor='black', alpha=0.7)
axes[1, 0].axvline(df['latencia_hil_ms'].mean(), color='red', linestyle='--', linewidth=2, label=f'Média: {df["latencia_hil_ms"].mean():.2f} ms')
axes[1, 0].set_xlabel('Latência (ms)')
axes[1, 0].set_ylabel('Frequência')
axes[1, 0].set_title('Distribuição de Latência HIL')
axes[1, 0].legend()
axes[1, 0].grid(True, alpha=0.3)

# Sincronização HIL
hil_sync_counts = df['hil_sincronizado'].value_counts()
colors = ['green' if x == 'SIM' else 'red' for x in hil_sync_counts.index]
axes[1, 1].bar(hil_sync_counts.index, hil_sync_counts.values, color=colors, alpha=0.7, edgecolor='black')
axes[1, 1].set_ylabel('Contagem')
axes[1, 1].set_title('Status de Sincronização HIL')
for i, v in enumerate(hil_sync_counts.values):
    axes[1, 1].text(i, v + 2, str(v), ha='center', fontweight='bold')
axes[1, 1].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig(output_dir / 'hil_analysis.png', dpi=300, bbox_inches='tight')
print("✅ Salvo: hil_analysis.png")
plt.close()

# ============================================================================
# SALVAR RELATÓRIO JSON
# ============================================================================
print("\n" + "="*70)
print("SALVANDO RELATÓRIO JSON")
print("="*70)

report = {
    'metadata': {
        'total_simulations': len(df),
        'timestamp_gerado': pd.Timestamp.now().isoformat(),
    },
    'iff_statistics': {k: float(v) for k, v in iff_stats.items()},
    'uncertainty_statistics': {k: float(v) for k, v in uncertainty_stats.items()},
    'decisions_distribution': decisions.to_dict(),
    'failure_modes_distribution': df['failure_mode'].value_counts().to_dict(),
    'scenarios_distribution': df['scenario'].value_counts().to_dict(),
    'hil_metrics': {
        'sync_rate_percent': float(hil_sync_pct),
        'latency_mean_ms': float(latency_mean),
        'jitter_mean_ms': float(jitter_mean),
    },
    'dimensions_statistics': {
        name: {
            'mean': float(df[col].mean()),
            'std': float(df[col].std()),
            'min': float(df[col].min()),
            'max': float(df[col].max()),
        }
        for name, col in dimensions.items()
    },
}

with open(output_dir / 'experimental_report.json', 'w') as f:
    json.dump(report, f, indent=2)

print("✅ Salvo: experimental_report.json")

print("\n" + "="*70)
print("✨ ANÁLISE CONCLUÍDA COM SUCESSO!")
print("="*70)
print(f"\n📁 Resultados salvos em: {output_dir}")
print(f"   - iff_analysis.png")
print(f"   - dimensions_analysis.png")
print(f"   - failure_modes_analysis.png")
print(f"   - hil_analysis.png")
print(f"   - experimental_report.json")
