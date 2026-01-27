# 🚀 Deploy Rápido no Google Cloud Shell

## Resumo em 5 Passos

```bash
# 1. Clonar/baixar projeto
git clone <seu-repositorio> hvdc_simulator
cd hvdc_simulator

# 2. Executar script de deployment
bash deploy-gcloud.sh

# 3. Instalar dependências Node
pnpm install

# 4. Iniciar servidor
pnpm dev

# 5. Abrir URL pública
# Copie a URL exibida no terminal (ex: https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev)
# Acesse: https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev/supervisory
```

---

## Instruções Detalhadas

### Passo 1: Abrir Google Cloud Shell

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique no ícone **Cloud Shell** (terminal) no canto superior direito
3. Aguarde o terminal carregar

### Passo 2: Clonar o Projeto

Se você tem um repositório Git:

```bash
git clone https://github.com/seu-usuario/hvdc_simulator.git
cd hvdc_simulator
```

Se não tem repositório, faça download manual:

```bash
# Criar diretório
mkdir hvdc_simulator
cd hvdc_simulator

# Copiar arquivos (você precisa ter os arquivos localmente)
# Ou use: gsutil cp gs://seu-bucket/* .
```

### Passo 3: Executar Script de Deployment

```bash
bash deploy-gcloud.sh
```

**O que este script faz:**
- ✅ Instala Node.js 22
- ✅ Instala PNPM
- ✅ Instala Python 3 e Pandapower
- ✅ Instala todas as dependências Node

**Tempo estimado:** 2-3 minutos

### Passo 4: Instalar Dependências do Projeto

```bash
pnpm install
```

**Tempo estimado:** 1-2 minutos

### Passo 5: Iniciar Servidor

```bash
pnpm dev
```

**Saída esperada:**
```
[OAuth] Standalone mode - OAuth disabled
[Monitoring] WebSocket service initialized
Server running on http://localhost:3000/
```

### Passo 6: Acessar Aplicação

O Cloud Shell automaticamente expõe a porta 3000. Você verá uma notificação:

```
Web preview is available at https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev
```

**Clique no link ou acesse manualmente:**
```
https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev/supervisory
```

---

## Alternativa: Usar Docker no Cloud Shell

Se preferir usar Docker:

```bash
# 1. Clonar projeto
git clone <seu-repositorio> hvdc_simulator
cd hvdc_simulator

# 2. Fazer build
docker build -t hvdc-simulator .

# 3. Executar container
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  --name hvdc-sim \
  hvdc-simulator

# 4. Acessar
# https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev/supervisory
```

---

## Troubleshooting Rápido

### Erro: `bash: deploy-gcloud.sh: Permission denied`
```bash
chmod +x deploy-gcloud.sh
bash deploy-gcloud.sh
```

### Erro: `pnpm: command not found`
```bash
# Script não foi executado completamente
bash deploy-gcloud.sh

# Ou instalar manualmente
npm install -g pnpm
```

### Erro: `ModuleNotFoundError: No module named 'pandapower'`
```bash
# Normal! Dashboard funciona com dados simulados
# Ou instalar Pandapower:
sudo pip3 install --break-system-packages pandapower numpy scipy matplotlib
```

### Porta 3000 já em uso
```bash
PORT=3001 pnpm dev
# Acessar: https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev:3001/supervisory
```

### Sessão expirou
```bash
# Cloud Shell desconecta após 20 minutos de inatividade
# Reconecte e execute:
cd hvdc_simulator
pnpm dev
```

---

## Manter Servidor Rodando

### Opção 1: Usar `screen` (Recomendado)

```bash
# Iniciar em background
screen -S hvdc -d -m bash -c "cd hvdc_simulator && pnpm dev"

# Ver logs
screen -S hvdc -r

# Desconectar (Ctrl+A, depois D)

# Reconectar depois
screen -S hvdc -r
```

### Opção 2: Usar `nohup`

```bash
nohup pnpm dev > server.log 2>&1 &

# Ver logs
tail -f server.log
```

### Opção 3: Usar `tmux`

```bash
tmux new-session -d -s hvdc -c hvdc_simulator "pnpm dev"

# Ver logs
tmux capture-pane -S -100 -p -t hvdc

# Reconectar
tmux attach -t hvdc
```

---

## Checklist Final

- [ ] Cloud Shell aberto
- [ ] Projeto clonado/baixado
- [ ] Script `deploy-gcloud.sh` executado
- [ ] `pnpm install` completado
- [ ] `pnpm dev` rodando
- [ ] URL pública acessível
- [ ] Dashboard carregando em `/supervisory`
- [ ] Métricas atualizando a cada 2 segundos

---

## URLs Importantes

| Componente | URL |
|-----------|-----|
| **Home (Simulação)** | `https://8080-cs-xxxxx.../` |
| **Dashboard Supervisório** | `https://8080-cs-xxxxx.../supervisory` |
| **API tRPC** | `https://8080-cs-xxxxx.../api/trpc` |
| **WebSocket** | `wss://8080-cs-xxxxx.../socket.io/` |

---

## Próximos Passos

Após o deploy estar funcionando:

1. **Compartilhar URL** - Envie o link para outras pessoas acessarem
2. **Configurar domínio customizado** - Use um domínio próprio em vez de `cs-xxxxx`
3. **Fazer backup** - Exporte o banco de dados SQLite
4. **Monitorar** - Configure alertas para quando o servidor cair

---

## Dúvidas?

Consulte os outros arquivos de documentação:
- `COMO_RODAR.md` - Guia geral de execução
- `COMANDOS_GOOGLE_CLOUD.md` - Comandos detalhados
- `DOCKER_REBUILD.md` - Deploy com Docker

---

**Pronto para deploy!** 🚀
