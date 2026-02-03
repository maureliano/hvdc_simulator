# 🔧 Configurar NODE_ENV no Windows

O erro `ECONNRESET` está acontecendo porque o `NODE_ENV` não está definido como `development`. Siga os passos abaixo:

## Opção 1: Usando .env.local (Recomendado)

1. **Copie o arquivo `.env.local` para seu projeto**
   - Já foi criado no repositório
   - Execute `git pull` para atualizar

2. **Verifique se o arquivo existe**
   ```bash
   dir .env.local
   ```

3. **Reinicie a aplicação**
   ```bash
   pm2 restart hvdc-app
   ```

## Opção 2: Definir NODE_ENV no PowerShell (Temporário)

```powershell
$env:NODE_ENV = "development"
npm start
```

## Opção 3: Definir NODE_ENV Permanentemente no Windows

### Via PowerShell (Admin):
```powershell
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "User")
```

### Via Variáveis de Ambiente do Windows:
1. Abra "Editar as variáveis de ambiente do sistema"
2. Clique em "Variáveis de Ambiente"
3. Em "Variáveis do usuário", clique "Novo"
4. Nome: `NODE_ENV`
5. Valor: `development`
6. Clique OK e reinicie o terminal

## Opção 4: Modificar PM2 Config

Se usar PM2, edite o arquivo `ecosystem.config.js` (ou crie um):

```javascript
module.exports = {
  apps: [
    {
      name: "hvdc-app",
      script: "./dist/server/index.js",
      env: {
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://hvdc_user:hvdc_secure_password_123@localhost:5432/hvdc_simulator"
      }
    }
  ]
};
```

Depois execute:
```bash
pm2 start ecosystem.config.js
```

## ✅ Verificar se Funcionou

Após configurar, você deve ver nos logs:
```
[Database] Connected to PostgreSQL
[IFF DB] Test history retrieved successfully
```

E NÃO deve ver mais:
```
Error: read ECONNRESET
```
