import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, circuitConfigs, simulationResults, InsertCircuitConfig, InsertSimulationResult } from "../drizzle/schema";
import { ENV } from './_core/env';
import { desc, eq } from "drizzle-orm";

let _db: any = null;
let _connection: postgres.Sql | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Disable SSL verification for local development
      // In production, use proper SSL certificates
      const isProduction = process.env.NODE_ENV === 'production';
      _connection = postgres(process.env.DATABASE_URL, {
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        max: 10, // Connection pool size
        idle_timeout: 30, // Close idle connections after 30 seconds
        connect_timeout: 10, // 10 second connection timeout
        onnotice: () => {}, // Suppress notices
      });
      _db = drizzle(_connection);
      
      console.log(`[Database] Connected to PostgreSQL`);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _connection = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized as any;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // MySQL: usar INSERT ... ON DUPLICATE KEY UPDATE
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      // Update
      await db.update(users)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      // Insert
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Circuit Configuration Functions
 */

export async function createCircuitConfig(config: InsertCircuitConfig) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(circuitConfigs).values(config);
    // PostgreSQL suporta returning
  const inserted = await db.select().from(circuitConfigs).orderBy(desc(circuitConfigs.id)).limit(1);
  return inserted[0];
}

export async function getCircuitConfigsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(circuitConfigs).where(eq(circuitConfigs.userId, userId));
}

export async function getCircuitConfigById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(circuitConfigs).where(eq(circuitConfigs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteCircuitConfig(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(circuitConfigs).where(eq(circuitConfigs.id, id));
}

/**
 * Simulation Results Functions
 */

export async function saveSimulationResult(result: InsertSimulationResult) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(simulationResults).values(result);
    // PostgreSQL suporta returning
  const inserted = await db.select().from(simulationResults).orderBy(desc(simulationResults.id)).limit(1);
  return inserted[0];
}

export async function getSimulationResultsByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(simulationResults)
    .where(eq(simulationResults.userId, userId))
    .limit(limit)
    .orderBy(simulationResults.createdAt);
}

export async function getSimulationResultById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(simulationResults).where(eq(simulationResults.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
