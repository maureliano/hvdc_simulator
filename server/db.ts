import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, circuitConfigs, simulationResults, InsertCircuitConfig, InsertSimulationResult } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
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
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
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

// Circuit configuration queries
export async function createCircuitConfig(config: InsertCircuitConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(circuitConfigs).values(config);
  return result;
}

export async function getCircuitConfigsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(circuitConfigs).where(eq(circuitConfigs.userId, userId)).orderBy(desc(circuitConfigs.updatedAt));
}

export async function getCircuitConfigById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(circuitConfigs).where(eq(circuitConfigs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCircuitConfig(id: number, config: Partial<InsertCircuitConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(circuitConfigs).set(config).where(eq(circuitConfigs.id, id));
}

export async function deleteCircuitConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(circuitConfigs).where(eq(circuitConfigs.id, id));
}

// Simulation results queries
export async function createSimulationResult(result: InsertSimulationResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(simulationResults).values(result);
}

export async function getSimulationResultsByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(simulationResults).where(eq(simulationResults.userId, userId)).orderBy(desc(simulationResults.createdAt)).limit(limit);
}

export async function getSimulationResultsByConfig(configId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(simulationResults).where(eq(simulationResults.configId, configId)).orderBy(desc(simulationResults.createdAt)).limit(limit);
}
