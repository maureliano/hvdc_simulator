# 💻 Guia Completo: Rodar HVDC Simulator Localmente no Windows 11

Este guia fornece instruções passo a passo para rodar a aplicação HVDC Simulator localmente no Windows 11 com Visual Studio Code, incluindo banco de dados PostgreSQL.

---

## 📋 Pré-requisitos

Você precisará instalar:

| Software | Versão | Download |
|----------|--------|----------|
| **Node.js** | 20.x LTS | https://nodejs.org |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/windows/ |
| **Visual Studio Code** | Última | https://code.visualstudio.com |
| **Git** | Última | https://git-scm.com/download/win |

---

## 🚀 Passo 1: Instalar Node.js

1. Acesse **https://nodejs.org**
2. Baixe **LTS (20.x ou superior)**
3. Execute o instalador `.msi`
4. Marque as opções:
   - ✅ Add to PATH
   - ✅ Automatically install necessary tools
5. Clique **Next** até terminar

### Verificar Instalação

Abra **PowerShell** ou **Cmd** e execute:

```bash
node --version
npm --version
```

Deve aparecer algo como:
```
v20.11.0
10.2.4
```

---

## 🗄️ Passo 2: Instalar PostgreSQL

1. Acesse **https://www.postgresql.org/download/windows/**
2. Baixe o instalador **PostgreSQL 14 ou superior**
3. Execute o instalador `.exe`
4. Configure:
   - **Installation Directory**: `C:\Program Files\PostgreSQL\15` (padrão)
   - **Password**: Defina uma senha forte (ex: `postgres123`)
   - **Port**: `5432` (padrão)
   - **Locale**: `Portuguese, Brazil`
5. Clique **Finish**

### Verificar Instalação

Abra **PowerShell** e execute:

```bash
psql --version
```

Deve aparecer:
```
psql (PostgreSQL) 15.x
```

---

## 🎯 Passo 3: Criar Banco de Dados

1. Abra **pgAdmin** (instalado com PostgreSQL)
   - Acesse **http://localhost:5050**
   - Login: `postgres` / sua senha
2. Clique em **Servers** → **PostgreSQL 15**
3. Clique em **Databases** → **Create** → **Database**
4. Nome: `hvdc_simulator`
5. Clique **Save**

### Alternativa: Usar PowerShell

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, criar banco
CREATE DATABASE hvdc_simulator;

# Sair
\q
```

---

## 📥 Passo 4: Clonar Repositório

1. Abra **PowerShell** ou **Cmd**
2. Navegue para onde quer clonar:

```bash
# Exemplo: Desktop
cd Desktop

# Clonar repositório
git clone https://github.com/SEU_USUARIO/hvdc_simulator.git

# Entrar na pasta
cd hvdc_simulator
```

---

## ⚙️ Passo 5: Configurar Variáveis de Ambiente

1. Na pasta do projeto, crie arquivo `.env`:

```bash
# Abrir editor
notepad .env
```

2. Cole o conteúdo abaixo (substitua os valores):

```env
# Database PostgreSQL Local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hvdc_simulator

# OAuth (Manus) - deixe como está ou deixe em branco para modo standalone
JWT_SECRET=seu-secret-key-aqui-pode-ser-qualquer-coisa
VITE_APP_ID=seu-app-id-aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Application
NODE_ENV=development
PORT=3000
```

3. Salve o arquivo (Ctrl+S)

---

## 📦 Passo 6: Instalar Dependências

No **PowerShell**, dentro da pasta do projeto:

```bash
# Instalar dependências
npm install --legacy-peer-deps
```

⏱️ Isso pode levar 2-5 minutos...

---

## 🗃️ Passo 7: Executar Migrations do Banco

```bash
# Gerar e executar migrations
npm run db:push
```

Deve aparecer algo como:
```
✓ Migrations executed successfully
```

---

## 🚀 Passo 8: Rodar Aplicação Localmente

### Opção A: Terminal PowerShell

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

Deve aparecer:
```
Server running on http://localhost:3000
```

### Opção B: Visual Studio Code

1. Abra a pasta do projeto no VS Code
2. Pressione `Ctrl + ~` para abrir terminal integrado
3. Execute:

```bash
npm run dev
```

---

## 🌐 Passo 9: Acessar Aplicação

Abra no navegador:

```
http://localhost:3000
```

Você deve ver a aplicação HVDC Simulator rodando! 🎉

---

## 📝 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Iniciar servidor em desenvolvimento |
| `npm run build` | Fazer build para produção |
| `npm run db:push` | Executar migrations |
| `npm test` | Rodar testes |
| `npm run lint` | Verificar código |

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'drizzle-kit'"

```bash
npm install --save-dev drizzle-kit --legacy-peer-deps
```

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL não está rodando. Abra Services (services.msc) e inicie:
- `postgresql-x64-15` (ou sua versão)

### Erro: "password authentication failed"

Verifique se a senha no `.env` está correta:
```env
DATABASE_URL=postgresql://postgres:SENHA_CORRETA@localhost:5432/hvdc_simulator
```

### Porta 3000 já está em uso

```bash
# Usar outra porta
PORT=3001 npm run dev
```

### Erro ao fazer build

```bash
# Limpar cache e reinstalar
rm -r node_modules
npm install --legacy-peer-deps
npm run build
```

---

## 🔄 Atualizar Código do GitHub

Quando houver atualizações:

```bash
# Puxar últimas mudanças
git pull origin main

# Reinstalar dependências se necessário
npm install --legacy-peer-deps

# Rodar migrations se houver mudanças no banco
npm run db:push

# Reiniciar servidor
npm run dev
```

---

## 💡 Dicas

### 1. Usar VS Code Extensions Recomendadas

Instale no VS Code:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Thunder Client** (para testar API)

### 2. Debugar no VS Code

Crie arquivo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### 3. Salvar Automaticamente

No VS Code:
- Arquivo → Preferências → Configurações
- Procure por "Auto Save"
- Selecione "afterDelay"

---

## 📊 Estrutura do Projeto

```
hvdc_simulator/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── components/  # Componentes reutilizáveis
│   │   └── App.tsx      # Arquivo principal
│   └── index.html
├── server/              # Backend Node.js
│   ├── routers.ts       # API tRPC
│   ├── db.ts            # Funções de banco
│   └── index.ts         # Servidor principal
├── drizzle/             # Migrações do banco
├── package.json         # Dependências
├── .env                 # Variáveis de ambiente
└── README.md
```

---

## 🎯 Próximos Passos

1. **Explorar a aplicação** - Teste os dashboards e funcionalidades
2. **Fazer alterações** - Edite código e veja mudanças em tempo real (hot reload)
3. **Criar dados** - Use a aplicação para gerar simulações e dados
4. **Deploy** - Quando pronto, siga LIGHTSAIL_DEPLOY.md para publicar

---

## 📞 Suporte

Se tiver problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme que PostgreSQL está rodando
3. Verifique o arquivo `.env` está correto
4. Veja os logs no terminal para mensagens de erro
5. Consulte a documentação do projeto

---

**Sucesso! Divirta-se desenvolvendo! 🚀**
