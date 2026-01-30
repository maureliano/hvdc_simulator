# Guia Completo: HVDC Simulator com PostgreSQL Local

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do PostgreSQL](#instalação-do-postgresql)
3. [Configuração da Aplicação](#configuração-da-aplicação)
4. [Execução e Testes](#execução-e-testes)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Você precisará instalar:
- **Node.js 18+** (https://nodejs.org)
- **PostgreSQL 14+** (https://www.postgresql.org)
- **Git** (opcional, para clonar repositório)

### Verificar instalações

```bash
node --version      # Deve mostrar v18.x.x ou superior
npm --version       # Deve mostrar 9.x.x ou superior
```

---

## 💾 Instalação do PostgreSQL

### Windows

#### Passo 1: Baixar e Instalar

1. Acesse https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Escolha a versão mais recente (ex: PostgreSQL 16)
4. Execute o instalador `.msi`

#### Passo 2: Configuração durante instalação

- **Superuser Password**: `postgres` (ou sua senha preferida)
- **Port**: `5432` (padrão)
- **Locale**: Portuguese (Brazil)
- **Data Directory**: Deixar padrão

#### Passo 3: Verificar instalação

Abra **PowerShell** e execute:

```powershell
# Verificar se PostgreSQL está rodando
Get-Service PostgreSQL*

# Conectar ao PostgreSQL
psql -U postgres -h localhost
```

Se conectou com sucesso, digite `\q` para sair.

---

### macOS

#### Passo 1: Instalar com Homebrew

```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar PostgreSQL
brew install postgresql@16

# Iniciar serviço
brew services start postgresql@16
```

#### Passo 2: Verificar instalação

```bash
psql --version
psql -U postgres
```

---

### Linux (Ubuntu/Debian)

#### Passo 1: Instalar

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Passo 2: Verificar instalação

```bash
sudo -u postgres psql --version
sudo -u postgres psql
```

---

## 🗄️ Criar Banco de Dados

### Windows/macOS

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, execute:
CREATE DATABASE hvdc_simulator;
CREATE USER hvdc_user WITH PASSWORD 'hvdc_password';
ALTER ROLE hvdc_user SET client_encoding TO 'utf8';
ALTER ROLE hvdc_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE hvdc_user SET default_transaction_deferrable TO on;
ALTER ROLE hvdc_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE hvdc_simulator TO hvdc_user;

# Sair
\q
```

### Linux

```bash
sudo -u postgres psql

# Dentro do psql, execute os mesmos comandos acima
```

---

## 🚀 Configuração da Aplicação

### Passo 1: Extrair e Navegar

```bash
# Extrair o arquivo ZIP
unzip hvdc_simulator.zip
cd hvdc_simulator
```

### Passo 2: Criar arquivo `.env`

Na raiz do projeto, crie um arquivo chamado `.env`:

```bash
# Windows (PowerShell)
@"
DATABASE_URL="postgresql://hvdc_user:hvdc_password@localhost:5432/hvdc_simulator"
JWT_SECRET="seu_secret_aleatorio_aqui_minimo_32_caracteres_aleatorios"
NODE_ENV="development"
"@ | Out-File -Encoding UTF8 .env
```

```bash
# macOS/Linux
cat > .env << EOF
DATABASE_URL="postgresql://hvdc_user:hvdc_password@localhost:5432/hvdc_simulator"
JWT_SECRET="seu_secret_aleatorio_aqui_minimo_32_caracteres_aleatorios"
NODE_ENV="development"
EOF
```

### Passo 3: Instalar Dependências

```bash
# Instalar pnpm globalmente (se não tiver)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### Passo 4: Criar Tabelas do Banco

```bash
# Executar migrações do Drizzle
pnpm db:push
```

Você verá output similar a:

```
✓ Applying migration 0001_initial_schema
✓ Database migrated successfully
```

---

## ▶️ Execução e Testes

### Passo 1: Compilar Frontend

```bash
pnpm build
```

### Passo 2: Iniciar Servidor

```bash
pnpm dev
```

Você verá:

```
Server running on http://localhost:5173/
```

### Passo 3: Acessar Aplicação

Abra seu navegador e acesse:

```
http://localhost:5173
```

### Verificar Funcionalidades

1. **Supervisório** - Dashboard HVDC
2. **IFF Analytics** - Análise de fidelidade
3. **Testes** - Executar testes IFF
4. **Tendências** - Análise de padrões
5. **Alarmes** - Histórico de alarmes
6. **Pesquisa** - Dados de pesquisa

---

## 🧪 Testar Persistência de Dados

### Passo 1: Executar uma Simulação

1. Clique em "Supervisório"
2. Clique em "Executar Simulação"
3. Aguarde resultado

### Passo 2: Verificar Banco de Dados

```bash
# Conectar ao banco
psql -U hvdc_user -d hvdc_simulator

# Dentro do psql, execute:
SELECT * FROM iff_test_results LIMIT 5;
SELECT * FROM iff_alarm_events LIMIT 5;

# Sair
\q
```

Você deve ver os dados salvos!

---

## 🔍 Troubleshooting

### Erro: "connection refused"

**Problema**: PostgreSQL não está rodando

**Solução**:

```bash
# Windows
Get-Service PostgreSQL* | Start-Service

# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql
```

### Erro: "database does not exist"

**Problema**: Banco não foi criado

**Solução**:

```bash
psql -U postgres
CREATE DATABASE hvdc_simulator;
\q
```

### Erro: "permission denied"

**Problema**: Usuário não tem permissões

**Solução**:

```bash
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE hvdc_simulator TO hvdc_user;
\q
```

### Erro: "port 5173 already in use"

**Problema**: Outra aplicação está usando a porta

**Solução**:

```bash
# Usar porta diferente
pnpm dev -- --port 3000

# Ou matar processo na porta 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### Erro: "pnpm not found"

**Problema**: pnpm não está instalado

**Solução**:

```bash
npm install -g pnpm
pnpm install
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `iff_test_results` | Resultados de testes IFF |
| `iff_test_events` | Eventos durante testes |
| `iff_alarm_thresholds` | Configuração de alarmes |
| `iff_alarm_events` | Histórico de alarmes |
| `users` | Usuários da aplicação |

### Visualizar Estrutura

```bash
psql -U hvdc_user -d hvdc_simulator

# Ver todas as tabelas
\dt

# Ver estrutura de uma tabela
\d iff_test_results

# Sair
\q
```

---

## 🔐 Segurança

### Mudar Senha do Usuário

```bash
psql -U postgres
ALTER USER hvdc_user WITH PASSWORD 'nova_senha_segura';
\q
```

### Backup do Banco

```bash
# Windows/macOS/Linux
pg_dump -U hvdc_user -d hvdc_simulator > backup_hvdc.sql
```

### Restaurar Backup

```bash
psql -U hvdc_user -d hvdc_simulator < backup_hvdc.sql
```

---

## 📝 Próximos Passos

1. **Explorar Dashboard** - Familiarize-se com a interface
2. **Executar Testes** - Teste a funcionalidade IFF
3. **Verificar Dados** - Confirme que dados estão sendo salvos no PostgreSQL
4. **Personalizar** - Ajuste thresholds de alarmes conforme necessário

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se PostgreSQL está rodando
2. Verifique o arquivo `.env`
3. Verifique logs do servidor em `.manus-logs/`
4. Tente reiniciar o servidor: `pnpm dev`

---

**Versão**: 1.0  
**Data**: Janeiro 2026  
**Compatibilidade**: Windows, macOS, Linux
