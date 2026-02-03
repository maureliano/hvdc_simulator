import postgres from "postgres";

const DATABASE_URL = "postgresql://hvdc_user:hvdc_secure_password_123@localhost:5432/hvdc_simulator";

async function testConnection() {
  console.log("🔍 Testando diferentes configurações de conexão...\n");

  // Teste 1: Com sslmode=disable na URL
  console.log("1️⃣  Teste 1: Com sslmode=disable na URL");
  try {
    const url1 = DATABASE_URL + "?sslmode=disable";
    console.log("   URL:", url1);
    const sql1 = postgres(url1, { ssl: false });
    const result1 = await sql1`SELECT 1 as test`;
    console.log("   ✅ Sucesso!");
    await sql1.end();
  } catch (error) {
    console.log("   ❌ Erro:", error.message);
  }

  // Teste 2: Com ssl: false
  console.log("\n2️⃣  Teste 2: Com ssl: false");
  try {
    const sql2 = postgres(DATABASE_URL, { ssl: false });
    const result2 = await sql2`SELECT 1 as test`;
    console.log("   ✅ Sucesso!");
    await sql2.end();
  } catch (error) {
    console.log("   ❌ Erro:", error.message);
  }

  // Teste 3: Com ssl: { rejectUnauthorized: false }
  console.log("\n3️⃣  Teste 3: Com ssl: { rejectUnauthorized: false }");
  try {
    const sql3 = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false } });
    const result3 = await sql3`SELECT 1 as test`;
    console.log("   ✅ Sucesso!");
    await sql3.end();
  } catch (error) {
    console.log("   ❌ Erro:", error.message);
  }

  // Teste 4: Com ambos sslmode=disable e ssl: false
  console.log("\n4️⃣  Teste 4: Com sslmode=disable e ssl: false");
  try {
    const url4 = DATABASE_URL + "?sslmode=disable";
    const sql4 = postgres(url4, { ssl: false });
    const result4 = await sql4`SELECT 1 as test`;
    console.log("   ✅ Sucesso!");
    await sql4.end();
  } catch (error) {
    console.log("   ❌ Erro:", error.message);
  }

  console.log("\n✅ Testes concluídos!");
}

testConnection();
