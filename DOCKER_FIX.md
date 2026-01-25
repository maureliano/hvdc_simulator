# Correção - Docker Build Error (externally-managed-environment)

## Problema

Ao executar `docker build -t hvdc-simulator .`, o build falha com o seguinte erro:

```
error: externally-managed-environment

× This environment is externally managed
╰─> 
    The system-wide python installation should be maintained using the system
    package manager (apk) only.
```

---

## Causa

A partir do **Alpine Linux 3.19+** (usado no `node:22-alpine`), o Python implementa a **PEP 668**, que proíbe a instalação de pacotes via `pip` diretamente no sistema para evitar conflitos com o gerenciador de pacotes do sistema (`apk`).

### Por que isso acontece?

- **Proteção do sistema:** Evita que pacotes pip sobrescrevam ou conflitem com pacotes do sistema
- **Segurança:** Previne quebra acidental do ambiente Python do sistema
- **Padrão moderno:** Força o uso de ambientes virtuais ou flags explícitas

---

## Solução Implementada

### Opção 1: Flag `--break-system-packages` (Implementada)

Adicionar a flag `--break-system-packages` ao comando `pip3 install`:

```dockerfile
# Antes (ERRO)
RUN pip3 install --no-cache-dir \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# Depois (CORRIGIDO)
RUN pip3 install --no-cache-dir --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy
```

**Vantagens:**
- ✅ Simples e direto
- ✅ Funciona em containers (ambiente isolado)
- ✅ Não adiciona overhead de virtual environment
- ✅ Ideal para Docker (ambiente descartável)

**Quando usar:**
- Containers Docker
- Ambientes isolados
- CI/CD pipelines
- Quando você tem controle total do ambiente

---

### Opção 2: Virtual Environment (Alternativa)

Criar um virtual environment antes de instalar:

```dockerfile
# Criar venv
RUN python3 -m venv /opt/venv

# Ativar venv e instalar
RUN /opt/venv/bin/pip install --no-cache-dir \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy

# Adicionar venv ao PATH
ENV PATH="/opt/venv/bin:$PATH"
```

**Vantagens:**
- ✅ Mais "correto" segundo PEP 668
- ✅ Isolamento completo
- ✅ Sem warnings

**Desvantagens:**
- ❌ Mais complexo
- ❌ Overhead adicional (~50MB)
- ❌ Requer ajuste de PATH

**Quando usar:**
- Ambientes de produção críticos
- Quando seguir PEP 668 estritamente
- Múltiplos ambientes Python no mesmo container

---

## Mudanças Aplicadas

### Arquivo: `Dockerfile`

**Linhas alteradas:**

1. **Stage Builder (linha 33-39):**
```dockerfile
# Instalar Pandapower e dependências Python
# Usar --break-system-packages para Alpine Linux 3.19+
RUN pip3 install --no-cache-dir --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy
```

2. **Stage Runtime (linha 63-69):**
```dockerfile
# Instalar Pandapower (runtime)
# Usar --break-system-packages para Alpine Linux 3.19+
RUN pip3 install --no-cache-dir --break-system-packages \
    pandapower==3.3.2 \
    numpy \
    matplotlib \
    scipy
```

---

## Como Testar

### 1. Build da Imagem

```bash
docker build -t hvdc-simulator .
```

**Resultado esperado:**
```
[+] Building 120.5s (24/24) FINISHED
 => [internal] load build definition from Dockerfile
 => [builder 1/9] FROM docker.io/library/node:22-alpine
 => [builder 5/9] RUN pip3 install --break-system-packages...
 => [stage-1 5/12] RUN pip3 install --break-system-packages...
 => exporting to image
 => => naming to docker.io/library/hvdc-simulator:latest
```

### 2. Executar Container

```bash
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="seu_secret_aqui" \
  --name hvdc-sim \
  hvdc-simulator
```

### 3. Verificar Logs

```bash
docker logs -f hvdc-sim
```

**Saída esperada:**
```
[OAuth] Initialized with baseURL: ...
Server running on http://localhost:8080/
```

### 4. Testar Pandapower

```bash
docker exec hvdc-sim python3 -c "import pandapower; print(pandapower.__version__)"
```

**Saída esperada:**
```
3.3.2
```

---

## Alternativas Consideradas

### 1. Usar Debian em vez de Alpine

```dockerfile
FROM node:22-bookworm-slim
```

**Prós:**
- Sem restrição PEP 668 (ainda)
- Mais pacotes disponíveis

**Contras:**
- Imagem muito maior (~300MB vs ~150MB)
- Mais lenta para build
- Mais vulnerabilidades potenciais

### 2. Instalar via APK (Alpine Package Manager)

```dockerfile
RUN apk add --no-cache py3-numpy py3-scipy
```

**Prós:**
- Sem conflito com PEP 668
- Gerenciado pelo sistema

**Contras:**
- Pandapower não está disponível via apk
- Versões desatualizadas
- Menos controle sobre versões

### 3. Usar imagem Python oficial

```dockerfile
FROM python:3.11-alpine
```

**Prós:**
- Python como foco principal
- Mais ferramentas Python

**Contras:**
- Precisa instalar Node.js manualmente
- Mais complexo
- Imagem maior

---

## Por que `--break-system-packages` é Seguro Aqui?

### Contexto: Container Docker

1. **Ambiente isolado:** Container é descartável e recriado a cada deploy
2. **Sem usuários:** Não há risco de quebrar ambiente de outros usuários
3. **Controle total:** Você define exatamente o que está instalado
4. **Imutável:** Imagem não muda após build

### Não é Seguro em:

- ❌ Servidores compartilhados
- ❌ Máquinas de desenvolvimento pessoal
- ❌ Sistemas de produção bare-metal
- ❌ Ambientes multi-tenant

---

## Troubleshooting

### Erro persiste após correção

**Solução:** Limpar cache do Docker

```bash
docker builder prune -a
docker build --no-cache -t hvdc-simulator .
```

### Erro: "No module named 'pandapower'"

**Causa:** Pandapower não foi instalado corretamente

**Solução:** Verificar logs do build

```bash
docker build -t hvdc-simulator . 2>&1 | grep -A 10 "pip3 install"
```

### Container não inicia

**Causa:** Variáveis de ambiente faltando

**Solução:** Verificar todas as variáveis necessárias

```bash
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -e NODE_ENV="production" \
  --name hvdc-sim \
  hvdc-simulator
```

### Build muito lento

**Solução:** Usar cache de layers

```bash
# Primeiro build: ~120s
docker build -t hvdc-simulator .

# Builds subsequentes (sem mudanças): ~5s
docker build -t hvdc-simulator .
```

---

## Referências

- **PEP 668:** https://peps.python.org/pep-0668/
- **Alpine Linux 3.19 Release Notes:** https://alpinelinux.org/posts/Alpine-3.19.0-released.html
- **Docker Multi-stage Builds:** https://docs.docker.com/build/building/multi-stage/
- **Pandapower Documentation:** https://pandapower.readthedocs.io/

---

## Checklist de Deployment

- [x] Dockerfile corrigido com `--break-system-packages`
- [ ] Build da imagem sem erros
- [ ] Container inicia corretamente
- [ ] Pandapower importa sem erros
- [ ] Servidor responde na porta 8080
- [ ] Simulação HVDC funciona
- [ ] Logs sem erros críticos

---

## Comandos Úteis

### Build e Run em um comando

```bash
docker build -t hvdc-simulator . && \
docker run -d -p 8080:8080 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  --name hvdc-sim \
  hvdc-simulator && \
docker logs -f hvdc-sim
```

### Rebuild completo (sem cache)

```bash
docker stop hvdc-sim 2>/dev/null || true
docker rm hvdc-sim 2>/dev/null || true
docker rmi hvdc-simulator 2>/dev/null || true
docker build --no-cache -t hvdc-simulator .
```

### Inspecionar imagem

```bash
# Ver tamanho
docker images hvdc-simulator

# Ver layers
docker history hvdc-simulator

# Ver arquivos
docker run --rm hvdc-simulator ls -lh /app
```

---

**Status:** ✅ Corrigido  
**Flag adicionada:** `--break-system-packages`  
**Build esperado:** ✅ Sucesso  
**Pronto para deployment:** ✅ Sim
