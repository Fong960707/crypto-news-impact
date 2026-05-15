/**
 * AI Analyzer Service
 * Uses LLM to analyze crypto news impact on coins
 */

import { invokeLLM } from "./_core/llm";
import { getUnanalyzedNews, markNewsAnalyzed, insertCoinImpacts } from "./db";
import { InsertCoinImpact } from "../drizzle/schema";

// Default coins to always analyze
const DEFAULT_COINS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "AVAX", name: "Avalanche" },
];

interface CoinAnalysisResult {
  coinSymbol: string;
  coinName: string;
  sentiment: "bullish" | "bearish" | "neutral";
  impactLevel: "high" | "medium" | "low";
  analysis: string;
  relevant: boolean;
}

interface AIAnalysisResponse {
  coins: CoinAnalysisResult[];
  overallSummary: string;
}

export async function analyzeNewsItem(newsId: number, title: string, summary: string, extraCoins?: Array<{ symbol: string; name: string }>): Promise<void> {
  const allCoins = [...DEFAULT_COINS, ...(extraCoins || [])];
  const coinList = allCoins.map((c) => `${c.symbol} (${c.name})`).join(", ");

  const prompt = `You are a professional cryptocurrency market analyst. Analyze the following crypto news article and determine its impact on various cryptocurrencies.

News Title: ${title}
News Summary: ${summary || "(No summary available)"}

Analyze the impact on these cryptocurrencies: ${coinList}

For each coin, determine:
1. Whether the news is relevant to this coin (relevant: true/false)
2. If relevant, the sentiment: "bullish" (利多), "bearish" (利空), or "neutral"
3. Impact level: "high", "medium", or "low"
4. A concise analysis in Traditional Chinese (繁體中文) explaining why this news affects this coin

Only include coins that are actually relevant to the news. For coins with no relevance, set relevant: false.

Respond with valid JSON only, no markdown:
{
  "coins": [
    {
      "coinSymbol": "BTC",
      "coinName": "Bitcoin",
      "sentiment": "bullish",
      "impactLevel": "high",
      "analysis": "此新聞對比特幣的影響分析...",
      "relevant": true
    }
  ],
  "overallSummary": "整體市場影響摘要..."
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional crypto market analyst. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "crypto_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              coins: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    coinSymbol: { type: "string" },
                    coinName: { type: "string" },
                    sentiment: { type: "string", enum: ["bullish", "bearish", "neutral"] },
                    impactLevel: { type: "string", enum: ["high", "medium", "low"] },
                    analysis: { type: "string" },
                    relevant: { type: "boolean" },
                  },
                  required: ["coinSymbol", "coinName", "sentiment", "impactLevel", "analysis", "relevant"],
                  additionalProperties: false,
                },
              },
              overallSummary: { type: "string" },
            },
            required: ["coins", "overallSummary"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty LLM response");

    const parsed: AIAnalysisResponse = typeof content === "string" ? JSON.parse(content) : content;
    const relevantCoins = parsed.coins.filter((c) => c.relevant);

    if (relevantCoins.length === 0) {
      // Still mark as analyzed even if no relevant coins
      await markNewsAnalyzed(newsId);
      return;
    }

    const impacts: InsertCoinImpact[] = relevantCoins.map((c) => ({
      newsId,
      coinSymbol: c.coinSymbol,
      coinName: c.coinName,
      sentiment: c.sentiment,
      impactLevel: c.impactLevel,
      analysis: c.analysis,
    }));

    await insertCoinImpacts(impacts);
    // Store overall summary in news content field
    if (parsed.overallSummary) {
      const db = await (await import('./db')).getDb();
      if (db) {
        const { news } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await db.update(news).set({ content: parsed.overallSummary }).where(eq(news.id, newsId));
      }
    }
    await markNewsAnalyzed(newsId);
    console.log(`[AIAnalyzer] Analyzed news #${newsId}: ${relevantCoins.length} coin impacts`);
  } catch (e) {
    console.error(`[AIAnalyzer] Failed to analyze news #${newsId}:`, e);
    // Mark as analyzed to avoid retry loop on persistent errors
    await markNewsAnalyzed(newsId);
  }
}

export async function runAnalysisBatch(batchSize = 5): Promise<number> {
  const unanalyzed = await getUnanalyzedNews(batchSize);
  if (unanalyzed.length === 0) return 0;

  console.log(`[AIAnalyzer] Analyzing ${unanalyzed.length} news items...`);
  let count = 0;
  for (const item of unanalyzed) {
    await analyzeNewsItem(item.id, item.title, item.summary || "");
    count++;
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }
  return count;
}
