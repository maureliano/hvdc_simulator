# 📋 Instruções de Configuração para Windows 11

## Arquivo .env - Variáveis de Ambiente

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
# ============================================================================
# BANCO DE DADOS (OBRIGATÓRIO)
# ============================================================================
# Para rodar LOCALMENTE no Windows com PostgreSQL:
# Substitua "sua_senha" pela senha que você definiu ao instalar PostgreSQL
# Substitua "hvdc_simulator" pelo nome do banco de dados que criou

DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/hvdc_simulator

# Exemplo real:
# DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/hvdc_simulator

# ============================================================================
# AUTENTICAÇÃO E OAUTH (OPCIONAL)
# ============================================================================
# Se você tiver uma aplicação registrada no Manus, preencha:
# Se deixar em branco, a aplicação rodará em modo STANDALONE (sem OAuth)

JWT_SECRET=sua-chave-secreta-aqui-pode-ser-qualquer-coisa-aleatoria
VITE_APP_ID=seu-app-id-manus-aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# ============================================================================
# AMBIENTE E PORTA
# ============================================================================

NODE_ENV=development
PORT=3000
```

---

## ⚠️ IMPORTANTE

1. **Nunca compartilhe o arquivo `.env`** com suas credenciais reais
2. **Nunca commite o arquivo `.env` no Git** - ele já está no `.gitignore`
3. O arquivo `.env` é apenas para desenvolvimento local
4. Para produção, use variáveis de ambiente seguras (ex: AWS Secrets Manager, Lightsail Secrets)

---

## 🔑 Valores Necessários

### DATABASE_URL

**Formato:**
```
postgresql://usuario:senha@host:porta/banco_de_dados
```

**Exemplo para Windows local:**
```
postgresql://postgres:postgres@localhost:5432/hvdc_simulator
```

**Componentes:**
- `postgres` = usuário padrão do PostgreSQL
- `postgres` = senha que você definiu ao instalar
- `localhost` = seu computador
- `5432` = porta padrão do PostgreSQL
- `hvdc_simulator` = nome do banco de dados

### JWT_SECRET

Pode ser qualquer string aleatória. Exemplos:
```
my-super-secret-key-12345
abc123xyz789
qualquer-coisa-aqui-funciona
```

### VITE_APP_ID

Deixe em branco ou use um valor fictício para desenvolvimento local:
```
VITE_APP_ID=dev-app-local
```

---

## ✅ Checklist de Setup

- [ ] Node.js 20+ instalado
- [ ] PostgreSQL 14+ instalado
- [ ] Banco de dados `hvdc_simulator` criado
- [ ] Arquivo `.env` criado com valores corretos
- [ ] `npm install --legacy-peer-deps` executado
- [ ] `npm run db:push` executado com sucesso
- [ ] `npm run dev` iniciado
- [ ] Aplicação acessível em `http://localhost:3000`

---

## 🚀 Próximos Passos

1. Siga o guia **WINDOWS_LOCAL_SETUP.md** para instruções passo a passo
2. Execute `npm run dev` para iniciar o servidor
3. Acesse `http://localhost:3000` no navegador
4. Explore a aplicação e teste as funcionalidades

---

**Sucesso! 🎉**
