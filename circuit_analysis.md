# Análise do Circuito HVDC

## Componentes Identificados

### Sistema AC Lado Esquerdo (Retificador)
- **Fonte AC**: Sistema trifásico
- **Indutor**: 0.181 H
- **Resistência**: 3.737 Ω
- **Resistência paralela**: 2160.633 Ω
- **Capacitor**: 3.342 µF

### Filtro de Baixa Frequência (Lado Retificador)
- **Indutor**: 0.1364 H
- **Resistência**: 29.76 Ω
- **Capacitor**: 74.28 µF
- **Capacitor paralelo**: 6.685 µF
- **Resistência**: 261.87 Ω

### Filtro de Alta Frequência (Lado Retificador)
- **Indutor**: 0.0136 H
- **Capacitor**: 6.685 µF
- **Resistência**: 83.32 Ω

### Transformador e Retificador
- **Transformador**: 345 kV / 422.84 kV, 1196 MVA
- **Retificador**: 12-Pulse (12 pulsos)

### Link DC
- **Indutor**: 0.5968 H
- **Resistência**: 2.5 Ω (duas seções)
- **Capacitor**: 26.0 µF

### Transformador e Inversor
- **Transformador**: 422.84 kV / 230 kV, 1196 MVA
- **Inversor**: 12-Pulse (12 pulsos)
- **Capacitor**: 7.522 µF

### Filtro de Baixa Frequência (Lado Inversor)
- **Capacitor**: 15.04 µF
- **Capacitor paralelo**: 167.2 µF
- **Resistência**: 13.23 Ω
- **Resistência**: 116.38 Ω

### Filtro de Alta Frequência (Lado Inversor)
- **Capacitor**: 15.04 µF
- **Indutor**: 0.0061 H
- **Resistência**: 37.03 Ω

### Sistema AC Lado Direito (Inversor)
- **Resistência**: 0.7406 Ω (duas seções)
- **Indutor**: 0.0365 H
- **Indutor**: 0.0606 H
- **Resistência**: 24.81 Ω
- **Fonte AC**: Sistema trifásico

## Parâmetros Principais
- **Potência nominal**: 1196 MVA
- **Tensão DC**: ~422.84 kV
- **Configuração**: Back-to-back (retificador e inversor)
- **Tipo de conversores**: 12-pulse (reduz harmônicos)

## Topologia
Sistema HVDC back-to-back com conversores de 12 pulsos, filtros harmônicos em ambos os lados (baixa e alta frequência), e link DC com indutância suavizadora.
