# Migração MySQL → SQLite

## Problema Identificado

Durante o deployment no Google Cloud Shell, o sistema apresentou erro de conexão com MySQL:

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Causa:** O template original estava configurado para MySQL, mas o Google Cloud Shell não possui MySQL instalado por padrão.

---

## Solução Implementada

Migração completa para **SQLite** usando `better-sqlite3`, que é:
- ✅ Mais simples (arquivo local, sem servidor)
- ✅ Zero configuração necessária
- ✅ Ideal para desenvolvimento e testes
- ✅ Compatível com Google Cloud Shell
- ✅ Portável (arquivo único `dev.db`)

---

## Alterações Realizadas

### 1. Schema do Banco de Dados

**Arquivo:** `drizzle/schema.ts`

- Migrado de `mysql-core` para `sqlite-core`
- Alterado tipos de dados:
  - `varchar` → `text`
  - `double` → `real`
  - `timestamp` → `integer` (Unix timestamp)
  - `mysqlEnum` → `text` com enum
- Ajustado defaults e constraints para SQLite

### 2. Configuração do Drizzle

**Arquivo:** `drizzle.config.ts`

- Adicionado detecção automática do tipo de banco
- Suporte para `file:` (SQLite) e `mysql://` (MySQL)
- Configuração dinâmica baseada em `DATABASE_URL`

### 3. Funções de Banco de Dados

**Arquivo:** `server/db.ts`

- Migrado de `drizzle-orm/mysql2` para `drizzle-orm/better-sqlite3`
- Implementado `upsert` manual (SQLite não tem `ON DUPLICATE KEY UPDATE`)
- Ajustado queries para sintaxe SQLite
- Adicionado log de conexão

### 4. Dependências

**Adicionado ao `package.json`:**

```json
{
  "devDependencies": {
    "better-sqlite3": "^12.6.2",
    "@types/better-sqlite3": "^7.6.13"
  }
}
```

### 5. Scripts de Deployment

**Arquivo:** `deploy-gcloud.sh`

- Atualizado para usar `DATABASE_URL=file:./dev.db`
- Comando de migração com variável inline:
  ```bash
  DATABASE_URL="file:./dev.db" pnpm db:push
  ```

---

## Como Usar

### Desenvolvimento Local

```bash
# 1. Instalar dependências
pnpm install

# 2. Criar banco de dados SQLite
DATABASE_URL="file:./dev.db" pnpm db:push

# 3. Iniciar servidor
pnpm dev
```

### Google Cloud Shell

```bash
# Usar script automatizado
./deploy-gcloud.sh

# Ou manualmente
DATABASE_URL="file:./dev.db" pnpm install
DATABASE_URL="file:./dev.db" pnpm db:push
DATABASE_URL="file:./dev.db" pnpm start
```

---

## Estrutura do Banco SQLite

```
dev.db (arquivo único ~32KB inicial)
├── users (9 colunas)
├── circuit_configs (11 colunas)
└── simulation_results (11 colunas)
```

---

## Comparação: MySQL vs SQLite

| Aspecto | MySQL | SQLite |
|---------|-------|--------|
| **Instalação** | Requer servidor MySQL | Arquivo local |
| **Configuração** | Host, porta, usuário, senha | Apenas caminho do arquivo |
| **Deployment** | Complexo (Cloud SQL) | Simples (arquivo incluído) |
| **Performance** | Excelente para produção | Suficiente para dev/teste |
| **Custo** | Cloud SQL ~$10/mês | Gratuito |
| **Backup** | Dump SQL | Copiar arquivo |
| **Ideal para** | Produção, múltiplos acessos | Desenvolvimento, protótipos |

---

## Migração de Volta para MySQL (Opcional)

Se precisar usar MySQL em produção:

### 1. Atualizar `drizzle/schema.ts`

```typescript
import { mysqlTable, int, varchar, text, timestamp, double, mysqlEnum } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  // ... resto dos campos
});
```

### 2. Atualizar `server/db.ts`

```typescript
import { drizzle } from "drizzle-orm/mysql2";
// ... resto do código
```

### 3. Configurar `DATABASE_URL`

```bash
DATABASE_URL="mysql://user:pass@host:3306/database"
```

### 4. Aplicar Migrações

```bash
pnpm db:push
```

---

## Troubleshooting

### Erro: "Cannot open database because the directory does not exist"

**Solução:** Criar o diretório antes:

```bash
mkdir -p $(dirname ./dev.db)
DATABASE_URL="file:./dev.db" pnpm db:push
```

### Erro: "near 'enum': syntax error"

**Causa:** Sintaxe MySQL em schema SQLite

**Solução:** Usar `text` com enum em vez de `mysqlEnum`:

```typescript
role: text("role", { enum: ["user", "admin"] })
```

### Erro: "drizzle/meta/_journal.json not found"

**Solução:** Criar arquivo vazio:

```bash
echo '{"version":"6","dialect":"sqlite","entries":[]}' > drizzle/meta/_journal.json
```

### Banco de dados corrompido

**Solução:** Deletar e recriar:

```bash
rm -f dev.db
DATABASE_URL="file:./dev.db" pnpm db:push
```

---

## Backup e Restore

### Backup

```bash
# Copiar arquivo
cp dev.db backup_$(date +%Y%m%d).db

# Ou exportar para SQL
sqlite3 dev.db .dump > backup.sql
```

### Restore

```bash
# Restaurar de arquivo
cp backup_20260125.db dev.db

# Ou importar de SQL
sqlite3 dev.db < backup.sql
```

---

## Performance

### Otimizações SQLite

```sql
-- Habilitar WAL mode (melhor concorrência)
PRAGMA journal_mode=WAL;

-- Aumentar cache
PRAGMA cache_size=-64000;  -- 64MB

-- Sincronização normal
PRAGMA synchronous=NORMAL;
```

Adicionar ao `server/db.ts`:

```typescript
_sqlite = new Database(dbPath);
_sqlite.pragma('journal_mode = WAL');
_sqlite.pragma('cache_size = -64000');
```

---

## Conclusão

A migração para SQLite simplificou significativamente o deployment no Google Cloud Shell, eliminando a necessidade de configurar e manter um servidor MySQL separado. O sistema agora funciona "out of the box" com zero configuração de banco de dados.

Para produção com alto volume de acessos simultâneos, considere migrar para MySQL/PostgreSQL usando Cloud SQL.

---

**Status:** ✅ Migração concluída e testada  
**Data:** 25/01/2026  
**Banco de dados:** SQLite 3 com better-sqlite3  
**Tamanho inicial:** 32KB  
**Tabelas:** 3 (users, circuit_configs, simulation_results)
