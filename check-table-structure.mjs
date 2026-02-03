import postgres from "postgres";

const DATABASE_URL = "postgresql://hvdc_user:hvdc_secure_password_123@localhost:5432/hvdc_simulator";

async function checkTableStructure() {
  const sql = postgres(DATABASE_URL);

  try {
    console.log("🔍 Verificando estrutura da tabela iff_test_results...\n");

    // Obter informações sobre as colunas
    const columns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'iff_test_results'
      ORDER BY ordinal_position;
    `;

    console.log("📋 Colunas encontradas na tabela:");
    console.log("─".repeat(80));
    columns.forEach((col) => {
      console.log(`  ${col.column_name.padEnd(30)} | ${col.data_type.padEnd(20)} | Nullable: ${col.is_nullable} | Default: ${col.column_default || "N/A"}`);
    });

    console.log("\n✅ Total de colunas:", columns.length);

    // Tentar fazer uma query simples
    console.log("\n🧪 Tentando fazer uma query simples...");
    const result = await sql`SELECT COUNT(*) as count FROM iff_test_results;`;
    console.log("✅ Query bem-sucedida! Registros na tabela:", result[0].count);

  } catch (error) {
    console.error("❌ Erro:", error.message);
    console.error("\nDetalhes completos:");
    console.error(error);
  } finally {
    await sql.end();
  }
}

checkTableStructure();
