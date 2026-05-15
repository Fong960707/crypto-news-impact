/**
 * News Fetcher Service
 * Fetches crypto news from multiple RSS/API sources
 */

import { InsertNews } from "../drizzle/schema";
import { getExistingExternalIds, insertNews } from "./db";

interface RawNewsItem {
  externalId: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  category: "policy" | "regulation" | "geopolitics" | "market" | "technology" | "other";
}


// Parse RSS XML manually (no external deps)
function parseRssItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string; source?: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string; source?: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(block);
      return m ? (m[1] ?? m[2] ?? "").trim() : "";
    };
    const title = get("title");
    const link = get("link") || get("guid");
    const description = get("description");
    const pubDate = get("pubDate");
    if (title && link) {
      items.push({ title, link, description, pubDate, source: get("source") });
    }
  }
  return items;
}

function detectCategory(title: string, desc: string): "policy" | "regulation" | "geopolitics" | "market" | "technology" | "other" {
  const text = (title + " " + desc).toLowerCase();
  if (/sec|regulation|law|ban|legal|court|policy|government|congress|senate|bill|act|compliance/.test(text)) return "regulation";
  if (/fed|central bank|policy|rate|inflation|treasury/.test(text)) return "policy";
  if (/war|sanction|geopolit|nato|china|russia|iran|north korea/.test(text)) return "geopolitics";
  if (/etf|launch|listing|exchange|trading|volume|price|market|fund|invest|whale|liquidat/.test(text)) return "market";
  if (/upgrade|fork|protocol|layer|blockchain|defi|nft|smart contract|zk|rollup/.test(text)) return "technology";
  return "other";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

const RSS_SOURCES = [
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
  },
  {
    name: "CryptoPanic",
    url: "https://cryptopanic.com/news/rss/",
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
  },
  {
    name: "Bitcoin Magazine",
    url: "https://bitcoinmagazine.com/.rss/full/",
  },
];

async function fetchRssSource(source: { name: string; url: string }): Promise<RawNewsItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { "User-Agent": "CryptoNewsRadar/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const rawItems = parseRssItems(xml);
    return rawItems.slice(0, 15).map((item) => ({
      externalId: `${source.name}::${item.link}`,
      title: stripHtml(item.title),
      summary: stripHtml(item.description).slice(0, 500),
      source: source.name,
      sourceUrl: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: detectCategory(item.title, item.description),
    }));
  } catch (e) {
    console.warn(`[NewsFetcher] Failed to fetch ${source.name}:`, e);
    return [];
  }
}

export async function fetchAndStoreNews(): Promise<number> {
  console.log("[NewsFetcher] Starting news fetch...");
  const existingIds = await getExistingExternalIds();
  const existingSet = new Set(existingIds);

  const allItems: RawNewsItem[] = [];
  for (const source of RSS_SOURCES) {
    const items = await fetchRssSource(source);
    allItems.push(...items);
  }

  const newItems = allItems.filter((item) => !existingSet.has(item.externalId));
  if (newItems.length === 0) {
    console.log("[NewsFetcher] No new items found.");
    return 0;
  }

  const toInsert: InsertNews[] = newItems.map((item) => ({
    title: item.title,
    summary: item.summary,
    source: item.source,
    sourceUrl: item.sourceUrl,
    category: item.category,
    publishedAt: item.publishedAt,
    externalId: item.externalId,
    isAnalyzed: false,
  }));

  await insertNews(toInsert);
  console.log(`[NewsFetcher] Inserted ${toInsert.length} new articles.`);
  return toInsert.length;
}
