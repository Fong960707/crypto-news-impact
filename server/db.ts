import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { coinImpacts, news, userCoins, users, InsertUser, InsertNews, InsertCoinImpact, InsertUserCoin } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── News ─────────────────────────────────────────────────────────────────────

export async function insertNews(items: InsertNews[]): Promise<void> {
  const db = await getDb();
  if (!db || items.length === 0) return;
  for (const item of items) {
    try {
      await db.insert(news).values(item).onDuplicateKeyUpdate({ set: { fetchedAt: new Date() } });
    } catch (e) {
      console.warn("[DB] insertNews skip:", e);
    }
  }
}

export async function getNewsList(opts: {
  coinSymbols?: string[];
  sentiment?: "bullish" | "bearish" | "neutral";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { coinSymbols, sentiment, limit = 20, offset = 0 } = opts;

  // If filtering by coin or sentiment, join with coin_impacts
  if (coinSymbols?.length || sentiment) {
    const impactRows = await db
      .select()
      .from(coinImpacts)
      .where(
        and(
          coinSymbols?.length ? inArray(coinImpacts.coinSymbol, coinSymbols) : undefined,
          sentiment ? eq(coinImpacts.sentiment, sentiment) : undefined
        )
      );

    if (impactRows.length === 0) return { items: [], total: 0 };

    const newsIds = Array.from(new Set(impactRows.map((r) => r.newsId)));
    const newsRows = await db
      .select()
      .from(news)
      .where(inArray(news.id, newsIds))
      .orderBy(desc(news.publishedAt))
      .limit(limit)
      .offset(offset);

    const impacts = await db
      .select()
      .from(coinImpacts)
      .where(inArray(coinImpacts.newsId, newsRows.map((n) => n.id)));

    return {
      items: newsRows.map((n) => ({
        ...n,
        impacts: impacts.filter((i) => i.newsId === n.id),
      })),
      total: newsIds.length,
    };
  }

  const newsRows = await db
    .select()
    .from(news)
    .orderBy(desc(news.publishedAt))
    .limit(limit)
    .offset(offset);

  if (newsRows.length === 0) return { items: [], total: 0 };

  const impacts = await db
    .select()
    .from(coinImpacts)
    .where(inArray(coinImpacts.newsId, newsRows.map((n) => n.id)));

  // total count
  const countRows = await db.select({ id: news.id }).from(news);

  return {
    items: newsRows.map((n) => ({
      ...n,
      impacts: impacts.filter((i) => i.newsId === n.id),
    })),
    total: countRows.length,
  };
}

export async function getNewsById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (rows.length === 0) return null;
  const impacts = await db.select().from(coinImpacts).where(eq(coinImpacts.newsId, id));
  return { ...rows[0], impacts };
}

export async function getUnanalyzedNews(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).where(eq(news.isAnalyzed, false)).limit(limit);
}

export async function markNewsAnalyzed(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(news).set({ isAnalyzed: true }).where(eq(news.id, id));
}

export async function insertCoinImpacts(items: InsertCoinImpact[]) {
  const db = await getDb();
  if (!db || items.length === 0) return;
  await db.insert(coinImpacts).values(items);
}

export async function getExistingExternalIds(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ externalId: news.externalId }).from(news);
  return rows.map((r) => r.externalId).filter(Boolean) as string[];
}

// ─── User Coins ───────────────────────────────────────────────────────────────

export async function getUserCoins(userId: number | null, sessionId: string | null) {
  const db = await getDb();
  if (!db) return [];
  const condition = userId
    ? eq(userCoins.userId, userId)
    : sessionId
    ? eq(userCoins.sessionId, sessionId)
    : null;
  if (!condition) return [];
  return db.select().from(userCoins).where(condition);
}

export async function addUserCoin(coin: InsertUserCoin) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userCoins).values(coin).onDuplicateKeyUpdate({ set: { coinName: coin.coinName } });
}

export async function removeUserCoin(opts: { userId: number | null; sessionId: string | null; coinSymbol: string }) {
  const db = await getDb();
  if (!db) return;
  const { userId, sessionId, coinSymbol } = opts;
  const condition = userId
    ? and(eq(userCoins.userId, userId), eq(userCoins.coinSymbol, coinSymbol))
    : sessionId
    ? and(eq(userCoins.sessionId, sessionId), eq(userCoins.coinSymbol, coinSymbol))
    : null;
  if (!condition) return;
  await db.delete(userCoins).where(condition);
}
