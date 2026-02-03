# 🔧 Corrigir SSL no PostgreSQL Windows

O erro `ECONNRESET` persiste porque o PostgreSQL está forçando SSL. Siga os passos abaixo para desabilitar SSL:

## Opção 1: Verificar arquivo postgresql.conf

1. Abra o arquivo de configuração do PostgreSQL:
   - Caminho típico: `C:\Program Files\PostgreSQL\15\data\postgresql.conf`
   - Ou procure por "postgresql.conf" no seu computador

2. Procure pela linha `ssl = on` e mude para `ssl = off`

3. Salve o arquivo

4. Reinicie o serviço PostgreSQL:
   ```powershell
   # No PowerShell (Admin):
   Restart-Service PostgreSQL
   ```

## Opção 2: Verificar arquivo pg_hba.conf

1. Abra o arquivo:
   - Caminho típico: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

2. Procure por linhas que começam com `hostssl` e mude para `host`:
   ```
   # Antes:
   hostssl    all             all             127.0.0.1/32            md5
   
   # Depois:
   host       all             all             127.0.0.1/32            md5
   ```

3. Salve o arquivo

4. Reinicie o PostgreSQL

## Opção 3: Usar psql para verificar SSL

Execute no PowerShell:
```powershell
psql -U hvdc_user -d hvdc_simulator -h localhost -c "SHOW ssl;"
```

Se retornar `on`, você precisa desabilitar.

## Opção 4: Reinstalar PostgreSQL sem SSL

Se as opções acima não funcionarem, desinstale e reinstale o PostgreSQL:

1. Desinstale PostgreSQL
2. Reinstale SEM marcar a opção "Initialize Database Cluster with Encoding"
3. Após instalação, execute:
   ```powershell
   initdb -D "C:\Program Files\PostgreSQL\15\data" -U postgres -W
   ```

## ✅ Verificar se funcionou

Após fazer as mudanças:

1. Reinicie o PostgreSQL
2. Teste a conexão:
   ```bash
   node test-connection-ssl.mjs
   ```
3. Reinicie a aplicação:
   ```bash
   pm2 restart hvdc-app
   ```

Você deve ver:
```
[Database] Connected to PostgreSQL
[IFF DB] Test history retrieved successfully
```

E NÃO deve ver mais:
```
Error: read ECONNRESET
```
