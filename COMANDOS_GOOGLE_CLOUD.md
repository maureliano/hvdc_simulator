# Comandos para Google Cloud Shell

## ⚠️ Erro Comum: `pnpm: command not found`

Se você recebeu este erro, significa que tentou executar `pnpm start` **antes** de instalar as dependências.

---

## ✅ Sequência Correta de Comandos

### Opção 1: Script Automatizado (Recomendado)

```bash
# 1. Fazer upload do projeto para Cloud Shell
# 2. Navegar até o diretório
cd hvdc_simulator

# 3. Tornar script executável
chmod +x deploy-gcloud.sh

# 4. Executar script de deployment (instala tudo automaticamente)
./deploy-gcloud.sh

# 5. Após conclusão, iniciar servidor
pnpm start
```

**O que o script faz:**
- ✅ Instala Node.js 22 via NVM
- ✅ Instala PNPM globalmente
- ✅ Instala Python e Pandapower
- ✅ Instala dependências Node.js
- ✅ Configura variáveis de ambiente
- ✅ Cria banco de dados SQLite
- ✅ Faz build do projeto

---

### Opção 2: Instalação Manual Passo a Passo

```bash
# 1. Instalar Node.js 22 via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Instalar Node 22
nvm install 22
nvm use 22
nvm alias default 22

# 4. Verificar instalação
node --version  # Deve mostrar v22.x.x

# 5. Instalar PNPM
npm install -g pnpm

# 6. Verificar PNPM
pnpm --version  # Deve mostrar versão do PNPM

# 7. Navegar até o projeto
cd hvdc_simulator

# 8. Instalar dependências
pnpm install

# 9. Instalar Pandapower
pip3 install --user pandapower numpy matplotlib scipy

# 10. Criar banco de dados
DATABASE_URL="file:./dev.db" pnpm db:push

# 11. Iniciar servidor
pnpm start
```

---

### Opção 3: Usar NPM (Se PNPM falhar)

```bash
# 1. Instalar dependências com NPM
npm install

# 2. Criar banco de dados
DATABASE_URL="file:./dev.db" npm run db:push

# 3. Iniciar servidor
npm start
```

---

## 🚀 Iniciando o Servidor

### Desenvolvimento (com hot-reload)

```bash
pnpm dev
```

### Produção

```bash
pnpm build
pnpm start
```

### Background (PM2)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar em background
pm2 start npm --name "hvdc-simulator" -- start

# Ver logs
pm2 logs hvdc-simulator

# Parar
pm2 stop hvdc-simulator

# Reiniciar
pm2 restart hvdc-simulator
```

---

## 🌐 Acessando a Aplicação

### Via Web Preview

1. Clicar no botão **Web Preview** no Cloud Shell
2. Selecionar **Preview on port 8080**
3. Uma nova aba abrirá com a aplicação

### Via URL Direta

```
https://8080-<cloud-shell-id>.cloudshell.dev
```

---

## 📝 Comandos Úteis

### Verificar Status

```bash
# Ver processos Node.js rodando
ps aux | grep node

# Ver porta 8080
lsof -i :8080

# Logs do servidor
tail -f logs/app.log
```

### Banco de Dados

```bash
# Aplicar migrações
DATABASE_URL="file:./dev.db" pnpm db:push

# Ver tabelas (requer sqlite3)
sqlite3 dev.db ".tables"

# Backup
cp dev.db backup_$(date +%Y%m%d_%H%M%S).db

# Limpar e recriar
rm -f dev.db
DATABASE_URL="file:./dev.db" pnpm db:push
```

### Testes

```bash
# Executar todos os testes
pnpm test

# Teste específico
pnpm test simulation.test.ts

# Com coverage
pnpm test --coverage
```

### Build

```bash
# Build completo
pnpm build

# Verificar tipos TypeScript
pnpm check

# Formatar código
pnpm format
```

---

## 🐛 Troubleshooting

### Erro: `pnpm: command not found`

**Solução:** Executar script de deployment primeiro

```bash
./deploy-gcloud.sh
```

### Erro: `node: command not found`

**Solução:** Instalar Node.js via NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
```

### Erro: `Cannot open database`

**Solução:** Criar banco de dados

```bash
DATABASE_URL="file:./dev.db" pnpm db:push
```

### Erro: `pandapower not found`

**Solução:** Instalar Pandapower

```bash
pip3 install --user pandapower
```

### Porta 8080 em uso

**Solução:** Matar processo

```bash
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Servidor não responde

**Solução:** Reiniciar

```bash
# Parar todos os processos Node
pkill -f node

# Iniciar novamente
pnpm start
```

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
# CPU e memória
top

# Espaço em disco
df -h

# Tamanho do projeto
du -sh hvdc_simulator/
```

### Logs em tempo real

```bash
# Servidor
tail -f logs/app.log

# PM2
pm2 logs --lines 100
```

---

## 🔄 Atualização

```bash
# Parar servidor
pm2 stop hvdc-simulator  # ou Ctrl+C

# Atualizar código (git ou upload)
git pull origin main

# Reinstalar dependências
pnpm install

# Aplicar migrações
DATABASE_URL="file:./dev.db" pnpm db:push

# Rebuild
pnpm build

# Reiniciar
pm2 restart hvdc-simulator  # ou pnpm start
```

---

## 💡 Dicas

### Manter sessão ativa

Cloud Shell desconecta após inatividade. Para manter rodando:

```bash
# Usar PM2 (recomendado)
pm2 start npm --name "hvdc-simulator" -- start
pm2 save
pm2 startup

# Ou usar screen
screen -S hvdc
pnpm start
# Pressionar Ctrl+A, depois D para desanexar
```

### Reconectar ao screen

```bash
screen -r hvdc
```

### Variáveis de ambiente persistentes

Adicionar ao `~/.bashrc`:

```bash
echo 'export DATABASE_URL="file:./dev.db"' >> ~/.bashrc
source ~/.bashrc
```

---

## ✅ Checklist de Deployment

- [ ] Upload do projeto para Cloud Shell
- [ ] Executar `chmod +x deploy-gcloud.sh`
- [ ] Executar `./deploy-gcloud.sh`
- [ ] Aguardar conclusão (5-10 minutos)
- [ ] Executar `pnpm start`
- [ ] Abrir Web Preview na porta 8080
- [ ] Testar simulação HVDC
- [ ] Configurar PM2 para background
- [ ] Fazer backup do dev.db

---

**Pronto! Agora você sabe a sequência correta de comandos.** 🎉

Para qualquer dúvida, consulte `DEPLOYMENT_GOOGLE_CLOUD.md` para documentação completa.
