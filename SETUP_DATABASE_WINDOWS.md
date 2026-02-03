# 🗄️ Configurar Banco de Dados PostgreSQL no Windows

O erro `relação "iff_test_results" não existe` significa que as tabelas não foram criadas no seu banco de dados PostgreSQL local. Siga os passos abaixo para resolver:

## Opção 1: Usando pgAdmin (Mais Fácil)

1. **Abra o pgAdmin** no navegador (geralmente em `http://localhost:5050`)
   - Faça login com suas credenciais

2. **Navegue até seu banco de dados**
   - Expanda "Servers" → "PostgreSQL 15" (ou sua versão)
   - Clique com botão direito em "hvdc_simulator" → "Query Tool"

3. **Copie e cole o script SQL**
   - Abra o arquivo `CREATE_TABLES.sql` do projeto
   - Copie TODO o conteúdo
   - Cole na janela de Query do pgAdmin
   - Pressione **F5** ou clique em "Execute"

4. **Verifique se funcionou**
   - Você deve ver uma mensagem de sucesso
   - Expanda "Tables" e veja as 7 tabelas criadas

## Opção 2: Usando Terminal (psql)

1. **Abra o PowerShell ou CMD**

2. **Conecte ao PostgreSQL**
   ```bash
   psql -U hvdc_user -d hvdc_simulator -h localhost
   ```
   - Digite sua senha quando solicitado

3. **Execute o script**
   ```bash
   \i 'D:/Documentos/hvdc_iff/CREATE_TABLES.sql'
   ```
   - Substitua o caminho se necessário

4. **Verifique as tabelas**
   ```bash
   \dt
   ```
   - Você deve ver as 7 tabelas listadas

## Opção 3: Usando VS Code com PostgreSQL Extension

1. **Instale a extensão PostgreSQL** no VS Code
   - Procure por "PostgreSQL" no marketplace

2. **Conecte ao seu banco de dados**
   - Clique no ícone PostgreSQL na barra lateral
   - Configure a conexão com seus dados

3. **Abra o arquivo `CREATE_TABLES.sql`**
   - Clique com botão direito → "Run Query"

## ✅ Verificar se Funcionou

Após executar o script, você deve ver:

```
 table_name
────────────────────────────
 circuit_configs
 iff_alarm_events
 iff_alarm_thresholds
 iff_test_events
 iff_test_results
 simulation_results
 users
(7 rows)
```

## 🔧 Se Ainda Não Funcionar

1. **Verifique a conexão do banco**
   ```bash
   psql -U hvdc_user -d hvdc_simulator -h localhost -c "SELECT 1"
   ```

2. **Verifique se o banco existe**
   ```bash
   psql -U hvdc_user -h localhost -l
   ```
   - Procure por "hvdc_simulator" na lista

3. **Se o banco não existir, crie-o**
   ```bash
   psql -U hvdc_user -h localhost -c "CREATE DATABASE hvdc_simulator"
   ```

## 🚀 Próximos Passos

Após criar as tabelas:

1. **Reinicie a aplicação**
   ```bash
   pm2 restart hvdc-app
   ```

2. **Verifique os logs**
   ```bash
   pm2 logs hvdc-app
   ```
   - Não deve haver mais erro de "relação não existe"

3. **Teste a aplicação**
   - Acesse http://localhost:3000/tests
   - Execute uma simulação
   - Os dados devem ser salvos no banco
