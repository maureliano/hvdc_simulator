# 🚀 Quick Start - HVDC Simulator no Google Cloud Shell

Guia rápido de 5 minutos para colocar o HVDC Simulator rodando no Google Cloud Shell.

---

## ⚡ Método 1: Script Automatizado (Recomendado)

### Passo 1: Acessar Cloud Shell

1. Acesse https://console.cloud.google.com
2. Clique no ícone do Cloud Shell (canto superior direito)

### Passo 2: Upload do Projeto

```bash
# Fazer upload dos arquivos do projeto para o Cloud Shell
# Use o botão "Upload" no menu (três pontos verticais)
# Ou arraste e solte o arquivo ZIP do projeto
```

### Passo 3: Extrair e Executar

```bash
# Extrair arquivos (se fez upload de ZIP)
unzip hvdc_simulator.zip
cd hvdc_simulator

# Dar permissão de execução ao script
chmod +x deploy-gcloud.sh

# Executar script de deployment
./deploy-gcloud.sh
```

### Passo 4: Iniciar Aplicação

```bash
# Modo desenvolvimento (com hot-reload)
pnpm dev

# OU modo produção
pnpm start
```

### Passo 5: Acessar

1. Clique em **Web Preview** no Cloud Shell
2. Selecione **Preview on port 8080**
3. Pronto! 🎉

---

## 🔧 Método 2: Manual (Passo a Passo)

### 1. Instalar Node.js 22

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node 22
nvm install 22
nvm use 22

# Instalar PNPM
npm install -g pnpm
```

### 2. Instalar Pandapower

```bash
pip3 install --user pandapower numpy matplotlib scipy
```

### 3. Configurar Projeto

```bash
cd hvdc_simulator

# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Build
pnpm build
```

### 4. Iniciar

```bash
pnpm start
```

---

## 🐳 Método 3: Docker

### Build e Run

```bash
cd hvdc_simulator

# Build da imagem
docker build -t hvdc-simulator .

# Executar
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="seu_secret_aqui" \
  --name hvdc-sim \
  hvdc-simulator

# Ver logs
docker logs -f hvdc-sim
```

---

## 📱 Acessar a Aplicação

### Via Web Preview (Cloud Shell)

1. Botão **Web Preview** → **Preview on port 8080**

### Via URL Direta

```
https://8080-<seu-cloud-shell-id>.cloudshell.dev
```

### Testar API

```bash
# Health check
curl http://localhost:8080/api/health

# Executar simulação
curl -X POST http://localhost:8080/api/trpc/simulation.run \
  -H "Content-Type: application/json" \
  -d '{"load_mw": 1000}'
```

---

## 🔄 Manter Rodando em Background

### Usando PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "hvdc-simulator" -- start

# Configurar para reiniciar automaticamente
pm2 startup
pm2 save

# Comandos úteis
pm2 list              # Listar processos
pm2 logs hvdc-simulator  # Ver logs
pm2 restart hvdc-simulator  # Reiniciar
pm2 stop hvdc-simulator     # Parar
```

---

## ⚙️ Configurações Importantes

### Arquivo .env

```bash
# Criar/editar .env
nano .env
```

Conteúdo mínimo:

```env
DATABASE_URL=file:./dev.db
NODE_ENV=production
PORT=8080
JWT_SECRET=change_this_secret_key
```

### Portas Disponíveis

Cloud Shell suporta Web Preview nas portas:
- 8080 (recomendado)
- 8081, 8082, 8083, 8084
- 3000, 4200, 9000

---

## 🐛 Problemas Comuns

### Erro: "Port already in use"

```bash
# Matar processo na porta 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Ou usar outra porta
PORT=8081 pnpm start
```

### Erro: "Module not found: pandapower"

```bash
# Reinstalar Pandapower
pip3 install --user --force-reinstall pandapower
```

### Erro: "Database connection failed"

```bash
# Recriar banco de dados
rm -f dev.db
pnpm db:push
```

### Aplicação não carrega

```bash
# Verificar logs
tail -f logs/app.log

# Verificar processo
ps aux | grep node

# Reiniciar
pm2 restart hvdc-simulator
```

---

## 📊 Verificar Status

```bash
# Status do servidor
curl http://localhost:8080/api/health

# Processos Node
ps aux | grep node

# Uso de recursos
top

# Logs em tempo real
tail -f logs/app.log
```

---

## 🔒 Segurança

### Antes de ir para produção:

1. **Alterar JWT_SECRET** no .env
2. **Configurar banco de dados MySQL** (não usar SQLite)
3. **Habilitar HTTPS**
4. **Configurar firewall** adequadamente
5. **Implementar rate limiting**

---

## 📚 Próximos Passos

Após deployment bem-sucedido:

1. **Testar simulação**: Acesse o dashboard e execute uma simulação
2. **Criar configurações**: Salve diferentes cenários de circuito
3. **Explorar gráficos**: Analise tensões, correntes e perdas
4. **Ajustar parâmetros**: Use os controles para diferentes cargas

---

## 💡 Dicas

- Use `pm2 monit` para monitoramento em tempo real
- Configure backups automáticos do banco de dados
- Monitore uso de memória (Cloud Shell tem limite de 8GB)
- Use `tmux` ou `screen` para sessões persistentes

---

## 📞 Ajuda

**Documentação completa**: Ver `DEPLOYMENT_GOOGLE_CLOUD.md`

**Logs**: 
```bash
# Aplicação
tail -f logs/app.log

# PM2
pm2 logs hvdc-simulator

# Docker
docker logs hvdc-sim
```

---

**Deployment rápido concluído! ⚡**

Acesse via Web Preview e comece a simular circuitos HVDC!
