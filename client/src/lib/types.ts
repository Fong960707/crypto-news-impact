export type Sentiment = "bullish" | "bearish" | "neutral";
export type ImpactLevel = "high" | "medium" | "low";
export type NewsCategory = "policy" | "regulation" | "geopolitics" | "market" | "technology" | "other";

export interface CoinImpact {
  id: number;
  newsId: number;
  coinSymbol: string;
  coinName: string | null;
  sentiment: Sentiment;
  impactLevel: ImpactLevel;
  analysis: string | null;
  createdAt: Date;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  source: string | null;
  sourceUrl: string | null;
  category: NewsCategory | null;
  publishedAt: Date;
  fetchedAt: Date;
  isAnalyzed: boolean;
  externalId: string | null;
  impacts: CoinImpact[];
}

export interface UserCoin {
  id: number;
  coinSymbol: string;
  coinName: string;
  isCustom: boolean;
  createdAt: Date;
}

export const PRESET_COINS: Array<{ symbol: string; name: string }> = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "UNI", name: "Uniswap" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "FIL", name: "Filecoin" },
  { symbol: "SUI", name: "Sui" },
  { symbol: "ARB", name: "Arbitrum" },
  { symbol: "OP", name: "Optimism" },
];

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  policy: "政策",
  regulation: "法規",
  geopolitics: "地緣政治",
  market: "市場事件",
  technology: "技術",
  other: "其他",
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  bullish: "利多",
  bearish: "利空",
  neutral: "中性",
};

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  high: "高度影響",
  medium: "中度影響",
  low: "低度影響",
};
