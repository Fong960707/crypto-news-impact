import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 新聞文章主表
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"),
  source: varchar("source", { length: 255 }),
  sourceUrl: text("sourceUrl"),
  category: mysqlEnum("category", ["policy", "regulation", "geopolitics", "market", "technology", "other"]).default("other"),
  publishedAt: timestamp("publishedAt").notNull(),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  isAnalyzed: boolean("isAnalyzed").default(false).notNull(),
  externalId: varchar("externalId", { length: 255 }).unique(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

// 每則新聞對各幣種的 AI 分析影響
export const coinImpacts = mysqlTable("coin_impacts", {
  id: int("id").autoincrement().primaryKey(),
  newsId: int("newsId").notNull(),
  coinSymbol: varchar("coinSymbol", { length: 20 }).notNull(),
  coinName: varchar("coinName", { length: 100 }),
  sentiment: mysqlEnum("sentiment", ["bullish", "bearish", "neutral"]).notNull(),
  impactLevel: mysqlEnum("impactLevel", ["high", "medium", "low"]).notNull(),
  analysis: text("analysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoinImpact = typeof coinImpacts.$inferSelect;
export type InsertCoinImpact = typeof coinImpacts.$inferInsert;

// 用戶關注的幣種（匿名用 sessionId，登入用 userId）
export const userCoins = mysqlTable("user_coins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 128 }),
  coinSymbol: varchar("coinSymbol", { length: 20 }).notNull(),
  coinName: varchar("coinName", { length: 100 }).notNull(),
  isCustom: boolean("isCustom").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserCoin = typeof userCoins.$inferSelect;
export type InsertUserCoin = typeof userCoins.$inferInsert;
