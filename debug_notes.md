# Debug Notes - HVDC Simulator

## Status Atual (25/01/2026)

### Interface Carregada
- Dashboard principal está renderizando
- Cards de métricas visíveis (Geração Total, Carga Total, Eficiência, Perdas Totais)
- Tabs funcionando (Diagrama Unifilar, Controles, Análise)
- Tema dark elegante aplicado com sucesso

### Erro Identificado
**Erro na simulação Python:**
```
Python script failed: Traceback (most recent call last): File '/home/ubuntu/hvdc_simulator/server/hvdc_simulator.py', line 7, in <module> import pandapower as pp ModuleNotFoundError: No module named 'pandapower'
```

### Causa
O módulo pandapower foi instalado globalmente com `sudo pip3 install`, mas o servidor Node.js está executando Python em um contexto onde o módulo não está disponível.

### Solução
Verificar o caminho de instalação do Python e garantir que o pandapower esteja acessível para o processo do servidor.
