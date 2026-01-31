# ⚡ Guia Rápido: Deploy em AWS Lightsail

Quer fazer deploy em 10 minutos? Siga este guia simplificado!

---

## 📋 O que você precisa

1. Conta AWS (com créditos gratuitos)
2. Código do projeto no GitHub
3. Terminal/SSH

---

## 🚀 Passo 1: Criar Instância Lightsail

1. Acesse **https://lightsail.aws.amazon.com**
2. Clique **"Create instance"**
3. Escolha:
   - **Platform**: Linux/Unix
   - **Blueprint**: Ubuntu 22.04 LTS
   - **Plan**: $5/mês (1GB RAM)
   - **Name**: `hvdc-simulator`
4. Clique **"Create instance"**

⏱️ Aguarde 2-3 minutos...

---

## 🗄️ Passo 2: Criar Banco de Dados

1. No menu, clique **"Databases"**
2. Clique **"Create database"**
3. Configure:
   - **Engine**: PostgreSQL 14
   - **Plan**: $15/mês
   - **Name**: `hvdc_simulator`
   - **Username**: `postgres`
   - **Password**: (gere uma senha forte)
4. Clique **"Create database"**

⏱️ Aguarde 5-10 minutos...

---

## 💻 Passo 3: Conectar e Fazer Deploy

### 3.1 Conectar via SSH

Clique em **"Connect using SSH"** na página da instância.

### 3.2 Executar Script de Setup

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/hvdc_simulator.git
cd hvdc_simulator

# Executar script de setup (ele faz tudo automaticamente!)
bash scripts/lightsail-setup.sh
```

O script vai pedir:
- **URL do repositório** (já está clonado, então pode deixar em branco)
- **DATABASE_URL** (copie do Lightsail Databases)
- **VITE_APP_ID** (seu app ID do Manus)
- **Domínio** (deixe em branco para usar IP)

---

## 🎉 Pronto!

Sua aplicação está rodando em:
- **http://SEU_IP_PUBLICO**

Ou acesse via domínio se configurou.

---

## 📝 Comandos Úteis Depois

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs hvdc-simulator

# Reiniciar
pm2 restart hvdc-simulator

# Atualizar código
cd /home/ubuntu/hvdc_simulator
git pull
pnpm install
pnpm build
pm2 restart hvdc-simulator
```

---

## 🔐 Próximos Passos (Opcional)

### Configurar Domínio Personalizado

1. Compre um domínio (ex: hvdc.com)
2. Aponte DNS para o IP da instância Lightsail
3. Configure SSL com Let's Encrypt:

```bash
sudo certbot certonly --nginx -d seu-dominio.com
```

### Manter Aplicação Online 24/7

Use Uptime Robot (gratuito):
1. Acesse https://uptimerobot.com
2. Crie conta
3. Adicione monitor: `http://seu-ip:3000/health`
4. Intervalo: 5 minutos

---

## 🆘 Problemas Comuns

### "Connection refused"
```bash
pm2 status
pm2 logs hvdc-simulator
```

### "Cannot connect to database"
```bash
# Verificar DATABASE_URL
cat /home/ubuntu/hvdc_simulator/.env

# Testar conexão
psql postgresql://postgres:SENHA@endpoint:5432/hvdc_simulator -c "SELECT 1;"
```

### "502 Bad Gateway"
```bash
sudo systemctl restart nginx
sudo nginx -t
```

---

## 📚 Documentação Completa

Para guia detalhado, consulte **LIGHTSAIL_DEPLOY.md**

---

**Dúvidas?** Consulte a [documentação oficial do Lightsail](https://lightsail.aws.amazon.com/ls/docs/pt_BR/articles/amazon-lightsail-overview)
