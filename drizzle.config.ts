import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Detectar tipo de banco de dados pela string de conexão
const isPostgres = connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://");
const isSQLite = connectionString.startsWith("file:");
const isMySQL = !isPostgres && !isSQLite;

// Configuração unificada
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: isPostgres ? "postgresql" : isSQLite ? "sqlite" : "mysql",
  dbCredentials: isPostgres
    ? { url: connectionString }
    : isSQLite
    ? { url: connectionString.replace("file:", "") }
    : { url: connectionString },
});
