# 🚀 Como Rodar o HVDC Simulator

## Índice Rápido

| Ambiente | Arquivo | Comando |
| --- | --- | --- |
| **Desenvolvimento Local** | `QUICKSTART_GCLOUD.md` | `pnpm dev` |
| **Google Cloud Shell** | `COMANDOS_GOOGLE_CLOUD.md` | `bash deploy-gcloud.sh` |
| **Docker Container** | `DOCKER_REBUILD.md` | `docker build && docker run` |
| **Dashboard Supervisório** | `COMO_USAR_DASHBOARD.md` | `http://localhost:3000/supervisory` |

---

## 1️⃣ Desenvolvimento Local (Mais Rápido )

### Pré-requisitos

- Node.js 22+

- PNPM

- Python 3.8+

- Pandapower instalado

### Comandos

```bash
# 1. Entrar no diretório
cd /home/ubuntu/hvdc_simulator

# 2. Instalar dependências
pnpm install

# 3. Instalar Pandapower (se não tiver)
sudo pip3 install --break-system-packages pandapower numpy scipy matplotlib

# 4. Iniciar servidor de desenvolvimento
pip3 install --break-system-packages pandapower numpy scipy matplotlib

# 5. Abrir navegador
# Simulação: http://localhost:3000/
# Dashboard: http://localhost:3000/supervisory
```

**Tempo:** ~30 segundos para iniciar**Arquivo de referência:** `QUICKSTART_GCLOUD.md`

---

## 2️⃣ Google Cloud Shell

### Pré-requisitos

- Conta Google Cloud

- Cloud Shell aberto

### Comandos

```bash
# 1. Clonar repositório (se não tiver )
git clone <seu-repo> hvdc_simulator
cd hvdc_simulator

# 2. Executar script de deployment
bash deploy-gcloud.sh

# 3. Iniciar aplicação
pnpm dev

# 4. Abrir URL pública
# Será exibida uma URL como: https://8080-cs-xxxxx.cs-us-east1-vpcf.cloudshell.dev
```

**Tempo:** ~2-3 minutos para instalação completa**Arquivo de referência:** `COMANDOS_GOOGLE_CLOUD.md`

---

## 3️⃣ Docker Container (Produção )

### Pré-requisitos

- Docker instalado

- Acesso ao terminal

### Comandos

```bash
# 1. Entrar no diretório
cd /home/ubuntu/hvdc_simulator

# 2. Fazer build da imagem
docker build -t hvdc-simulator .

# 3. Executar container
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  --name hvdc-sim \
  hvdc-simulator

# 4. Verificar logs
docker logs -f hvdc-sim

# 5. Abrir navegador
# http://localhost:8080/supervisory
```

**Tempo:** ~3-5 minutos para build (primeira vez )**Arquivo de referência:** `DOCKER_REBUILD.md`

---

## 4️⃣ Acessar Dashboard Supervisório

### Opção A: Rota Direta (Recomendado)

```
http://localhost:3000/supervisory
```

### Opção B: Página Home com Link

```
http://localhost:3000/
# Clique em "Dashboard Supervisório" no canto superior direito
```

### Opção C: Docker

```
http://localhost:8080/supervisory
```

**Arquivo de referência:** `COMO_USAR_DASHBOARD.md`

---

## 📋 Checklist de Verificação

Após iniciar a aplicação, verifique:

- [ ] **Servidor iniciando** - Deve aparecer `Server running on http://localhost:3000/`

- [ ] **WebSocket ativo** - Deve aparecer `[Monitoring] WebSocket service initialized`

- [ ] **Página Home carrega** - `http://localhost:3000/` exibe dashboard

- [ ] **Dashboard supervisório carrega** - `http://localhost:3000/supervisory` exibe métricas

- [ ] **Métricas atualizam** - Valores mudam a cada 2 segundos

- [ ] **Sem erros no console** - F12 > Console não mostra erros vermelhos

- [ ] **WebSocket conectado** - Console mostra `WebSocket connected`

---

## 🔧 Troubleshooting Rápido

### Problema: `pnpm: command not found`

**Solução:** Instalar PNPM

```bash
npm install -g pnpm
```

### Problema: `ModuleNotFoundError: No module named 'pandapower'`

**Solução:** Instalar Pandapower

```bash
sudo pip3 install --break-system-packages pandapower numpy scipy matplotlib
```

### Problema: Porta 3000 já em uso

**Solução:** Usar porta diferente

```bash
PORT=3001 pnpm dev
# Acessar: http://localhost:3001
```

### Problema: Dashboard não atualiza

**Solução:** Verificar console do navegador (F12 )

- Deve aparecer: `WebSocket connected`

- Deve aparecer: `Monitoring data received` a cada 2s

### Problema: Docker build falha

**Solução:** Verificar arquivo `DOCKER_REBUILD.md` seção Troubleshooting

---

## 📚 Documentação Completa

| Arquivo | Descrição | Quando Usar |
| --- | --- | --- |
| **QUICKSTART_GCLOUD.md** | Guia rápido de 5 minutos | Primeira vez no Google Cloud Shell |
| **COMANDOS_GOOGLE_CLOUD.md** | Instruções completas + troubleshooting | Deployment no Google Cloud Shell |
| **DOCKER_REBUILD.md** | Como fazer rebuild do Docker | Após atualizar código |
| **COMO_USAR_DASHBOARD.md** | 4 formas de acessar o dashboard | Entender arquitetura |
| **DEPLOYMENT_GOOGLE_CLOUD.md** | Documentação detalhada (60+ páginas) | Referência completa |
| **STANDALONE_MODE.md** | Explicação do modo sem autenticação | Entender modo standalone |
| **SQLITE_MIGRATION.md** | Por que usamos SQLite | Entender banco de dados |
| **DOCKERFILE_DASHBOARD.md** | Por que Dockerfile já suporta dashboard | Entender Docker |

---

## 🎯 Fluxo Recomendado

### Primeira Vez

1. Ler este arquivo (`COMO_RODAR.md`)

1. Escolher ambiente (local, cloud shell, ou docker)

1. Seguir instruções do arquivo correspondente

1. Verificar checklist de verificação

### Desenvolvimento Contínuo

1. `pnpm dev` para iniciar

1. Editar código

1. Servidor recarrega automaticamente (HMR)

1. Testar no navegador

### Deploy em Produção

1. Fazer rebuild do Docker: `docker build -t hvdc-simulator .`

1. Executar container: `docker run -d -p 8080:8080 ... hvdc-simulator`

1. Verificar logs: `docker logs -f hvdc-sim`

1. Acessar: `http://localhost:8080/supervisory`

---

## 💡 Dicas Úteis

### Monitorar Logs em Tempo Real

```bash
# Desenvolvimento
pnpm dev  # Logs aparecem no terminal

# Docker
docker logs -f hvdc-sim
```

### Acessar Console do Navegador

```
F12 > Console
# Deve aparecer:
# - "WebSocket connected"
# - "Monitoring data received" (a cada 2s )
```

### Testar Simulação Manualmente

```bash
# Executar script Python diretamente
python3 server/hvdc_simulator.py 345 230 422.84 1000

# Deve retornar JSON com resultados da simulação
```

### Limpar Cache e Reconstruir

```bash
# Desenvolvimento
rm -rf node_modules dist
pnpm install
pnpm build

# Docker
docker system prune -a
docker build -t hvdc-simulator .
```

---

## 📞 Suporte Rápido

| Problema | Solução | Arquivo |
| --- | --- | --- |
| Não sabe por onde começar | Ler este arquivo | `COMO_RODAR.md` |
| Erros no Google Cloud Shell | Consultar | `COMANDOS_GOOGLE_CLOUD.md` |
| Erros no Docker | Consultar | `DOCKER_REBUILD.md` |
| Não entende o dashboard | Consultar | `COMO_USAR_DASHBOARD.md` |
| Precisa de referência completa | Consultar | `DEPLOYMENT_GOOGLE_CLOUD.md` |

---

## ✅ Status da Aplicação

**Versão:** 6363cb8b**Status:** ✅ Pronto para rodar**Ambiente testado:** Desenvolvimento local**Próximo passo:** Escolher ambiente e seguir instruções

---

## 🚀 Começar Agora

### Opção 1: Local (Mais Rápido)

```bash
cd /home/ubuntu/hvdc_simulator
pnpm dev
# Abrir: http://localhost:3000/supervisory
```

### Opção 2: Google Cloud Shell

```bash
bash deploy-gcloud.sh
pnpm dev
# Abrir URL pública fornecida
```

### Opção 3: Docker

```bash
docker build -t hvdc-simulator .
docker run -d -p 8080:8080 -e DATABASE_URL="file:./dev.db" --name hvdc-sim hvdc-simulator
# Abrir: http://localhost:8080/supervisory
```

---

**Dúvidas?** Consulte o arquivo correspondente ao seu ambiente na tabela acima.



---

## ⚠️ Nota sobre Pandapower

Se você ver mensagens de erro como `ModuleNotFoundError: No module named 'pandapower'` no console, **não se preocupe!** O sistema possui um **fallback automático** que gera dados simulados realistas quando Pandapower não está disponível. O dashboard funcionará normalmente com dados dinâmicos atualizando em tempo real.

### Instalar Pandapower (Opcional)

Se quiser usar a simulação real do Pandapower:

```bash
sudo pip3 install --break-system-packages pandapower numpy scipy matplotlib
```

Após instalar, reinicie o servidor:

```bash
pnpm dev
```

O sistema detectará automaticamente e usará a simulação real do Pandapower.
