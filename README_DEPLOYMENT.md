# 📦 HVDC Simulator - Deployment Package

Pacote completo para deployment do HVDC Simulator no Google Cloud Shell.

---

## 📁 Conteúdo do Pacote

```
hvdc_simulator/
├── 📄 DEPLOYMENT_GOOGLE_CLOUD.md    # Guia completo de deployment
├── 📄 QUICKSTART_GCLOUD.md          # Guia rápido (5 minutos)
├── 🔧 deploy-gcloud.sh              # Script de instalação automatizada
├── 🐳 Dockerfile                    # Container Docker otimizado
├── 📄 .dockerignore                 # Arquivos ignorados no build
├── 📂 client/                       # Frontend React + Tailwind
├── 📂 server/                       # Backend Node.js + tRPC
├── 📂 drizzle/                      # Schema e migrações do banco
└── 📄 package.json                  # Dependências do projeto
```

---

## 🚀 Início Rápido

### Opção 1: Script Automatizado (Recomendado)

```bash
# 1. Upload do projeto para Cloud Shell
# 2. Executar:
cd hvdc_simulator
chmod +x deploy-gcloud.sh
./deploy-gcloud.sh

# 3. Iniciar:
pnpm start

# 4. Acessar via Web Preview na porta 8080
```

### Opção 2: Docker

```bash
cd hvdc_simulator
docker build -t hvdc-simulator .
docker run -d -p 8080:8080 hvdc-simulator
```

---

## 📚 Documentação

### Para Começar
- **QUICKSTART_GCLOUD.md** - Guia rápido de 5 minutos
- **DEPLOYMENT_GOOGLE_CLOUD.md** - Documentação completa

### Arquivos de Configuração
- **.env** - Variáveis de ambiente (criar após deployment)
- **Dockerfile** - Configuração do container
- **deploy-gcloud.sh** - Script de instalação

---

## 🔧 Requisitos

### Google Cloud Shell (Incluído)
- ✅ Linux (Debian)
- ✅ 5GB de espaço em disco
- ✅ Acesso à internet

### Instalado pelo Script
- Node.js 22
- PNPM
- Python 3
- Pandapower 3.3.2

---

## 📊 Funcionalidades

### Backend
- ✅ API tRPC para simulação HVDC
- ✅ Pandapower 3.3.2 integrado
- ✅ Banco de dados MySQL/SQLite
- ✅ Sistema de autenticação
- ✅ Salvamento de configurações
- ✅ Histórico de simulações

### Frontend
- ✅ Dashboard interativo
- ✅ Diagrama unifilar SVG
- ✅ Gráficos Recharts
- ✅ Controles com sliders
- ✅ Tema dark elegante
- ✅ Responsive design

### Simulação
- ✅ Circuito HVDC 1196 MVA
- ✅ Conversores 12-pulse
- ✅ Filtros harmônicos
- ✅ Cálculo de perdas
- ✅ Análise de eficiência
- ✅ Fluxo de potência

---

## 🎯 Comandos Principais

```bash
# Instalação
./deploy-gcloud.sh          # Setup completo

# Desenvolvimento
pnpm install                # Instalar dependências
pnpm dev                    # Servidor dev (hot-reload)
pnpm build                  # Build produção
pnpm start                  # Servidor produção
pnpm test                   # Executar testes

# Banco de Dados
pnpm db:push                # Aplicar migrações

# Docker
docker build -t hvdc .      # Build imagem
docker run -p 8080:8080 hvdc # Executar container

# PM2 (Background)
pm2 start npm -- start      # Iniciar em background
pm2 logs                    # Ver logs
pm2 restart all             # Reiniciar
```

---

## 🌐 Acesso

### Cloud Shell Web Preview
1. Botão **Web Preview** no Cloud Shell
2. Selecionar **Preview on port 8080**

### URL Direta
```
https://8080-<cloud-shell-id>.cloudshell.dev
```

### API Endpoints
```
GET  /api/health                    # Health check
POST /api/trpc/simulation.run      # Executar simulação
GET  /api/trpc/config.list          # Listar configurações
POST /api/trpc/config.create        # Criar configuração
```

---

## 🔒 Segurança

### Configurações Importantes

**Arquivo .env (criar após deployment):**

```env
# Banco de Dados
DATABASE_URL=mysql://user:pass@host:3306/hvdc_simulator

# Servidor
NODE_ENV=production
PORT=8080

# Segurança (ALTERAR!)
JWT_SECRET=<gerar_com_openssl_rand_base64_32>

# OAuth (opcional)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

### Gerar JWT Secret Seguro

```bash
openssl rand -base64 32
```

---

## 🐛 Troubleshooting

### Problema: Porta em uso
```bash
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Problema: Pandapower não encontrado
```bash
pip3 install --user --force-reinstall pandapower
```

### Problema: Banco de dados
```bash
rm -f dev.db
pnpm db:push
```

### Ver Logs
```bash
# Aplicação
tail -f logs/app.log

# PM2
pm2 logs

# Docker
docker logs <container-id>
```

---

## 📈 Performance

### Recursos Necessários
- **CPU**: 1-2 vCPUs
- **RAM**: 2-4 GB
- **Disco**: 2 GB
- **Rede**: 1 Mbps

### Otimizações
- Build de produção otimizado
- Compressão Gzip habilitada
- Cache de assets estáticos
- Lazy loading de componentes

---

## 🔄 Atualização

```bash
cd hvdc_simulator

# Backup
cp -r . ../hvdc_simulator_backup

# Atualizar código (git ou upload)
git pull origin main

# Reinstalar e rebuild
pnpm install
pnpm db:push
pnpm build

# Reiniciar
pm2 restart all
```

---

## 📦 Backup

### Banco de Dados
```bash
# MySQL
mysqldump -u user -p hvdc_simulator > backup.sql

# SQLite
cp dev.db backup_$(date +%Y%m%d).db
```

### Projeto Completo
```bash
tar -czf hvdc_simulator_backup.tar.gz hvdc_simulator/
```

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Testes específicos
pnpm test simulation.test.ts

# Com coverage
pnpm test --coverage
```

**Testes Incluídos:**
- ✅ 7 testes de API
- ✅ Simulação com parâmetros padrão
- ✅ Simulação com carga customizada
- ✅ Validação de dados de barramentos
- ✅ Validação de transformadores
- ✅ Validação de link DC
- ✅ Diferentes níveis de tensão

---

## 📞 Suporte

### Documentação
- `DEPLOYMENT_GOOGLE_CLOUD.md` - Guia completo
- `QUICKSTART_GCLOUD.md` - Início rápido
- Comentários inline no código

### Recursos Externos
- [Pandapower Docs](https://pandapower.readthedocs.io)
- [Google Cloud Shell](https://cloud.google.com/shell/docs)
- [Node.js Docs](https://nodejs.org/docs)
- [tRPC Docs](https://trpc.io/docs)

---

## 📝 Licença

Este projeto é fornecido como está para fins educacionais e de pesquisa.

---

## ✅ Checklist de Deployment

- [ ] Upload do projeto para Cloud Shell
- [ ] Executar `deploy-gcloud.sh`
- [ ] Criar arquivo `.env` com configurações
- [ ] Executar `pnpm start`
- [ ] Acessar via Web Preview
- [ ] Testar simulação no dashboard
- [ ] Configurar PM2 para background
- [ ] Configurar backups automáticos
- [ ] Documentar credenciais de acesso
- [ ] Testar todos os endpoints da API

---

**Pronto para deployment! 🚀**

Para começar, siga o **QUICKSTART_GCLOUD.md**
