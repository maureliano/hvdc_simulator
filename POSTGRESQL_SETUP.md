# Configuração do PostgreSQL para HVDC Simulator

## Windows

### Passo 1: Instalar PostgreSQL

1. Acesse https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Escolha a versão mais recente (ex: 16.x)
4. Execute o instalador
5. Na instalação:
   - **Superuser password**: `postgres` (ou sua senha)
   - **Port**: `5432` (padrão)
   - **Locale**: Portuguese (Brazil)

### Passo 2: Criar banco de dados

Abra o **pgAdmin** (instalado com PostgreSQL) ou use o terminal:

```bash
# Abra PowerShell como Admin
psql -U postgres

# Dentro do psql, execute:
CREATE DATABASE hvdc_simulator;
\c hvdc_simulator
```

### Passo 3: Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hvdc_simulator"
JWT_SECRET="seu_secret_aleatorio_aqui_minimo_32_caracteres"
```

### Passo 4: Executar migrações

```bash
cd hvdc_simulator
pnpm db:push
```

### Passo 5: Iniciar o servidor

```bash
pnpm dev
```

---

## macOS

### Passo 1: Instalar PostgreSQL com Homebrew

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Passo 2: Criar banco de dados

```bash
createdb hvdc_simulator
```

### Passo 3: Configurar `.env`

```bash
DATABASE_URL="postgresql://localhost/hvdc_simulator"
JWT_SECRET="seu_secret_aleatorio_aqui_minimo_32_caracteres"
```

### Passo 4: Executar migrações

```bash
pnpm db:push
```

### Passo 5: Iniciar

```bash
pnpm dev
```

---

## Linux (Ubuntu/Debian)

### Passo 1: Instalar PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Passo 2: Criar banco de dados

```bash
sudo -u postgres createdb hvdc_simulator
```

### Passo 3: Configurar `.env`

```bash
DATABASE_URL="postgresql://postgres@localhost/hvdc_simulator"
JWT_SECRET="seu_secret_aleatorio_aqui_minimo_32_caracteres"
```

### Passo 4: Executar migrações

```bash
pnpm db:push
```

### Passo 5: Iniciar

```bash
pnpm dev
```

---

## Verificar se PostgreSQL está rodando

### Windows (PowerShell)
```powershell
# Verificar se o serviço está ativo
Get-Service PostgreSQL*
```

### macOS/Linux
```bash
# Verificar se está rodando
pg_isready -h localhost -p 5432
```

---

## Troubleshooting

**Erro: "connection refused"**
- Verifique se PostgreSQL está rodando
- Verifique se a porta 5432 está correta
- Verifique se o DATABASE_URL está correto

**Erro: "database does not exist"**
```bash
# Recriar banco
psql -U postgres -c "CREATE DATABASE hvdc_simulator;"
```

**Erro: "permission denied"**
```bash
# Resetar senha do postgres
# Windows: Use pgAdmin
# Linux: sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'nova_senha';"
```

---

## Próximos passos

Depois de configurar PostgreSQL:

1. Execute `pnpm dev`
2. Acesse http://localhost:5173
3. Todos os dados serão persistidos no PostgreSQL
4. Alarmes, testes e análises serão salvos automaticamente
