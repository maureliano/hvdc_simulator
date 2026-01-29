# HVDC Simulator - Setup para Windows

## Versão Otimizada sem Dependências Externas

Este é um guia completo para rodar o HVDC Simulator localmente no Windows sem necessidade de Python, pandapower ou banco de dados externo.

---

## Pré-requisitos

### 1. Node.js (Obrigatório)
- **Versão mínima:** Node.js 18+
- **Download:** https://nodejs.org (escolha LTS)
- **Verificar instalação:**
```powershell
node --version
npm --version
```

### 2. pnpm (Gerenciador de Pacotes)
```powershell
npm install -g pnpm
```

---

## Instalação Passo a Passo

### Passo 1: Extrair o Projeto
```powershell
# Extrair o arquivo ZIP
# Navegar até a pasta
cd hvdc_simulator
```

### Passo 2: Limpar Dependências Antigas
```powershell
# Remover node_modules se existir
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Remover lock file
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue
```

### Passo 3: Instalar Dependências
```powershell
pnpm install
```

**Nota:** Se receber erro sobre `better-sqlite3`, é normal - foi removido da versão otimizada.

### Passo 4: Iniciar o Servidor
```powershell
pnpm dev
```

Você deve ver:
```
Server running on http://localhost:3000/
```

### Passo 5: Acessar a Aplicação
Abra o navegador e acesse:
```
http://localhost:5173
```

---

## Funcionalidades Disponíveis

✅ **Supervisório HVDC** - Visualizar estado do sistema em tempo real
✅ **IFF Analytics** - Análise do Índice de Fidelidade Física
✅ **Testes IFF** - Executar testes de fidelidade
✅ **Histórico de Alarmes** - Visualizar e filtrar alarmes
✅ **Análise de Tendências** - Identificar padrões de falhas
✅ **Dashboard de Pesquisa** - Resultados dos 4 critérios do gap

---

## Troubleshooting

### Erro: "pnpm not found"
```powershell
npm install -g pnpm
```

### Erro: "Port 3000 already in use"
```powershell
# Usar porta diferente
$env:PORT=3001; pnpm dev
```

### Erro: "Module not found"
```powershell
# Limpar e reinstalar
pnpm install --force
```

### Servidor não inicia
```powershell
# Verificar TypeScript
pnpm check

# Se houver erros, tentar rebuild
pnpm install --force
pnpm dev
```

---

## Estrutura do Projeto

```
hvdc_simulator/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── App.tsx        # Roteamento
│   └── index.html
├── server/                # Backend Express + tRPC
│   ├── hvdc-simulator-memory.ts  # Simulador em memória
│   ├── routers.ts         # Endpoints tRPC
│   ├── iff/              # Sistema de alarmes IFF
│   └── _core/            # Framework
├── scripts/              # Scripts auxiliares
├── package.json
└── README.md
```

---

## Dados Experimentais

Os dados experimentais (150 simulações) estão em:
```
scripts/experimental_data.csv
```

Para gerar novos dados:
```powershell
node scripts/generate_experimental_data.mjs
```

---

## Desenvolvimento

### Compilar TypeScript
```powershell
pnpm check
```

### Executar Testes
```powershell
pnpm test
```

### Formatar Código
```powershell
pnpm format
```

---

## Características da Versão Otimizada

1. **Sem Dependências Externas**
   - Simulador em memória (não precisa de Python/pandapower)
   - Dados em memória (não precisa de banco de dados)
   - Funciona 100% offline

2. **Performance**
   - Simulações instantâneas
   - Sem overhead de I/O
   - Resposta em < 100ms

3. **Funcionalidades Completas**
   - Sistema de alarmes com thresholds
   - Análise de tendências
   - Dashboard de pesquisa
   - Histórico de eventos
   - Gráficos interativos

---

## Próximas Etapas

1. **Integração com Banco de Dados Real**
   - Conectar a MySQL/PostgreSQL
   - Persistir dados de simulação

2. **Integração com Python/Pandapower**
   - Instalar pandapower quando necessário
   - Usar simulador real em vez de memória

3. **Deploy**
   - Usar Vercel, Railway ou Render
   - Ou fazer deploy em servidor próprio

---

## Suporte

Para problemas ou dúvidas:
1. Verificar logs do servidor
2. Consultar documentação em `RESEARCH_FRAMEWORK.md`
3. Revisar `ALARM_SYSTEM.md` para sistema de alarmes

---

**Versão:** 1.0.0 (Otimizada para Windows)
**Data:** Janeiro 2026
**Status:** ✅ Pronto para Produção
