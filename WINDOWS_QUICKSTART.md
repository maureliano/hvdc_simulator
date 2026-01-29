# HVDC Simulator - Windows Quick Start Guide

## ⚠️ IMPORTANTE: Você tem um download ANTIGO!

Se você baixou o projeto antes de **29 de Janeiro de 2026 às 10:44 AM**, você tem uma versão antiga que não funciona no Windows.

---

## ✅ Passo 1: Baixar a Versão Correta

1. Clique em **"View"** do projeto no Management UI
2. Vá para **"Dashboard"**
3. Procure pelo checkpoint **`29be79c9`** (o mais recente)
4. Clique em **"Download"**

Ou acesse diretamente: **manus-webdev://29be79c9**

---

## ✅ Passo 2: Extrair o Arquivo

```powershell
# Extrair o ZIP
# Navegar para a pasta
cd hvdc_simulator_novo
```

---

## ✅ Passo 3: Instalar Dependências

```powershell
# Instalar todas as dependências
pnpm install
```

**Nota:** Pode levar 2-3 minutos. Ignore avisos sobre `better-sqlite3` - foi removido propositalmente.

---

## ✅ Passo 4: Compilar o Frontend

```powershell
# Compilar React para produção
pnpm build
```

Isso vai criar a pasta `dist/public/` com o HTML compilado.

---

## ✅ Passo 5: Iniciar o Servidor

```powershell
# Iniciar o servidor de desenvolvimento
pnpm dev
```

Você deve ver:
```
Server running on http://localhost:3000/
```

---

## ✅ Passo 6: Acessar a Aplicação

Abra o navegador e acesse:
```
http://localhost:3000/
```

---

## 🎯 Funcionalidades Disponíveis

Você terá acesso a:

- ✅ **Supervisório** - Dashboard HVDC em tempo real
- ✅ **IFF Analytics** - Análise do Índice de Fidelidade Física
- ✅ **Testes** - Executar testes de fidelidade
- ✅ **Tendências** - Análise de padrões de falhas
- ✅ **Pesquisa** - Dashboard com 4 critérios do gap (Fidelidade, Incertezas, HIL, Decisão Agêntica)
- ✅ **Alarmes** - Sistema de monitoramento com thresholds
- ✅ **Histórico** - Visualizar e filtrar eventos

---

## 🔧 Troubleshooting

### Erro: "pnpm not found"
```powershell
npm install -g pnpm
```

### Erro: "Port 3000 already in use"
```powershell
# Usar porta diferente
$env:PORT=3001; pnpm dev
```

### Erro: "Could not find the build directory"
```powershell
# Compilar novamente
pnpm build

# Depois copiar para o local correto
Copy-Item -Path "dist\public\*" -Destination "server\_core\public" -Recurse -Force

# Reiniciar
pnpm dev
```

### Erro: "No procedure found on path simulation.run"
- Significa que você tem um checkpoint antigo
- Baixe o checkpoint **29be79c9** novamente

---

## 📁 Estrutura do Projeto

```
hvdc_simulator/
├── client/                    # Frontend React
│   └── src/pages/            # Páginas principais
├── server/                   # Backend Express + tRPC
│   ├── hvdc-simulator-memory.ts  # Simulador (sem Python!)
│   └── routers.ts            # Endpoints tRPC
├── scripts/                  # Scripts auxiliares
├── dist/                     # Build compilado
├── package.json
└── WINDOWS_QUICKSTART.md     # Este arquivo
```

---

## 🚀 Próximas Etapas

1. **Testar as funcionalidades** - Clique em cada abas (Supervisório, Tendências, Pesquisa)
2. **Executar simulação** - Clique em "Executar Simulação" no Supervisório
3. **Ver alarmes** - Vá para a aba "Alarmes" para ver histórico
4. **Análise de tendências** - Clique em "Tendências" para ver padrões

---

## 💡 Dicas

- **Sem dependências externas** - Não precisa de Python, pandapower ou banco de dados
- **Dados em memória** - Tudo é simulado e rápido
- **Funciona offline** - Não precisa de internet após iniciar
- **Pronto para pesquisa** - Todos os dados para seu artigo de doutorado estão inclusos

---

## ❓ Problemas?

Se ainda tiver problemas:

1. Verifique se está usando o checkpoint **29be79c9**
2. Execute `pnpm install --force` para limpar cache
3. Delete a pasta `node_modules` e `dist`, depois `pnpm install` novamente
4. Reinicie o PowerShell

---

**Versão:** 1.0.0 (Windows Otimizada)
**Data:** Janeiro 2026
**Status:** ✅ Pronto para Produção
