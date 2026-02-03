# 📝 Criar arquivo .env.local

O arquivo `.env.local` está no `.gitignore` por segurança (não deve ser commitado). Você precisa criar manualmente:

## Passo 1: Criar o arquivo

No seu projeto (`D:\Documentos\hvdc_iff`), crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```
NODE_ENV=development
DATABASE_URL=postgresql://hvdc_user:hvdc_secure_password_123@localhost:5432/hvdc_simulator
```

## Passo 2: Salvar o arquivo

- Salve na raiz do projeto (mesmo nível que `package.json`)
- Certifique-se de que o nome é exatamente `.env.local` (com o ponto no início)

## Passo 3: Reiniciar a aplicação

```bash
pm2 restart hvdc-app
```

## ✅ Verificar se funcionou

Você deve ver nos logs:
```
[Database] Connected to PostgreSQL
```

E NÃO deve ver mais:
```
Error: read ECONNRESET
```

## 💡 Dica: Criar arquivo no PowerShell

Se tiver dificuldade em criar o arquivo, use o PowerShell:

```powershell
@"
NODE_ENV=development
DATABASE_URL=postgresql://hvdc_user:hvdc_secure_password_123@localhost:5432/hvdc_simulator
"@ | Out-File -Encoding UTF8 .env.local
```

Ou use o Notepad:
```powershell
notepad .env.local
```

Copie e cole o conteúdo acima, depois salve.
