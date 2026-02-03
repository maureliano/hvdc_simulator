import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./drizzle/schema.js";

const DATABASE_URL = "postgresql://hvdc_user:hvdc_secure_password_123@localhost:5432/hvdc_simulator";

async function testDrizzleQuery() {
  const sql = postgres(DATABASE_URL);
  const db = drizzle(sql, { schema });

  try {
    console.log("🔍 Testando query com Drizzle...\n");

    // Teste 1: Query simples
    console.log("1️⃣  Teste 1: Query simples com select()");
    const result1 = await db.select().from(schema.iffTestResults).limit(1);
    console.log("✅ Sucesso! Resultado:", result1);

    // Teste 2: Query com where
    console.log("\n2️⃣  Teste 2: Query com where");
    const result2 = await db.select().from(schema.iffTestResults).where(
      sql`1=1`
    ).limit(1);
    console.log("✅ Sucesso! Resultado:", result2);

    // Teste 3: Insert
    console.log("\n3️⃣  Teste 3: Insert de teste");
    const result3 = await db.insert(schema.iffTestResults).values({
      testName: "Test from Drizzle",
      scenarioType: "TEST",
      stateFidelity: 0.95,
      dynamicsFidelity: 0.94,
      energyFidelity: 0.93,
      stabilityFidelity: 0.92,
      overallIFFScore: 0.93,
      systemTrustworthiness: "HIGH",
      agenticDecision: "PROCEED",
      executionTime: 1000,
      fullResults: JSON.stringify({ test: true }),
    });
    console.log("✅ Insert bem-sucedido!");

    // Teste 4: Query após insert
    console.log("\n4️⃣  Teste 4: Query após insert");
    const result4 = await db.select().from(schema.iffTestResults);
    console.log("✅ Sucesso! Total de registros:", result4.length);
    console.log("Último registro:", result4[result4.length - 1]);

  } catch (error) {
    console.error("❌ Erro:", error.message);
    console.error("\nDetalhes completos:");
    console.error(error);
  } finally {
    await sql.end();
  }
}

testDrizzleQuery();
