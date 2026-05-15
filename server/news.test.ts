import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  getNewsList: vi.fn().mockResolvedValue({
    items: [
      {
        id: 1,
        title: "SEC Approves Bitcoin ETF",
        summary: "The SEC has approved the first spot Bitcoin ETF.",
        source: "CoinDesk",
        sourceUrl: "https://coindesk.com/test",
        category: "regulation",
        publishedAt: new Date("2024-01-10T10:00:00Z"),
        fetchedAt: new Date("2024-01-10T10:05:00Z"),
        isAnalyzed: true,
        externalId: "coindesk::test1",
        impacts: [
          {
            id: 1,
            newsId: 1,
            coinSymbol: "BTC",
            coinName: "Bitcoin",
            sentiment: "bullish",
            impactLevel: "high",
            analysis: "比特幣 ETF 獲批對 BTC 是重大利多",
            createdAt: new Date(),
          },
        ],
      },
    ],
    total: 1,
  }),
  getNewsById: vi.fn().mockResolvedValue({
    id: 1,
    title: "SEC Approves Bitcoin ETF",
    summary: "The SEC has approved the first spot Bitcoin ETF.",
    source: "CoinDesk",
    sourceUrl: "https://coindesk.com/test",
    category: "regulation",
    publishedAt: new Date("2024-01-10T10:00:00Z"),
    fetchedAt: new Date("2024-01-10T10:05:00Z"),
    isAnalyzed: true,
    externalId: "coindesk::test1",
    impacts: [
      {
        id: 1,
        newsId: 1,
        coinSymbol: "BTC",
        coinName: "Bitcoin",
        sentiment: "bullish",
        impactLevel: "high",
        analysis: "比特幣 ETF 獲批對 BTC 是重大利多",
        createdAt: new Date(),
      },
    ],
  }),
  getUserCoins: vi.fn().mockResolvedValue([]),
  addUserCoin: vi.fn().mockResolvedValue(undefined),
  removeUserCoin: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./newsFetcher", () => ({
  fetchAndStoreNews: vi.fn().mockResolvedValue(5),
}));

vi.mock("./aiAnalyzer", () => ({
  runAnalysisBatch: vi.fn().mockResolvedValue(3),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("news.list", () => {
  it("returns news list with impacts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.news.list({});
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("SEC Approves Bitcoin ETF");
    expect(result.items[0].impacts).toHaveLength(1);
    expect(result.items[0].impacts[0].sentiment).toBe("bullish");
    expect(result.total).toBe(1);
  });

  it("accepts coin filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.news.list({ coinSymbols: ["BTC"], limit: 10, offset: 0 });
    expect(result).toBeDefined();
  });

  it("accepts sentiment filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.news.list({ sentiment: "bullish" });
    expect(result).toBeDefined();
  });
});

describe("news.detail", () => {
  it("returns full news with impacts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.news.detail({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.impacts[0].coinSymbol).toBe("BTC");
    expect(result.impacts[0].impactLevel).toBe("high");
    expect(result.impacts[0].analysis).toContain("利多");
  });
});

describe("news.refresh", () => {
  it("triggers fetch and analysis", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.news.refresh();
    expect(result.fetched).toBe(5);
    expect(result.analyzed).toBe(3);
  });
});

describe("coins.add and coins.remove", () => {
  it("adds a coin to watchlist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coins.add({
      coinSymbol: "BTC",
      coinName: "Bitcoin",
      isCustom: false,
      sessionId: "test-session",
    });
    expect(result.success).toBe(true);
  });

  it("removes a coin from watchlist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coins.remove({ coinSymbol: "BTC", sessionId: "test-session" });
    expect(result.success).toBe(true);
  });
});
