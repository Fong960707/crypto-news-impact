/**
 * Test Data Seeder
 * Generates realistic crypto news for demonstration
 */

import { insertNews, insertCoinImpacts } from "./db";
import { InsertNews, InsertCoinImpact } from "../drizzle/schema";

const MOCK_NEWS: InsertNews[] = [
  {
    title: "美國 SEC 批准現貨比特幣 ETF，機構投資者湧入",
    summary: "美國證券交易委員會（SEC）正式批准首批現貨比特幣交易所交易基金（ETF），標誌著加密貨幣市場的重大里程碑。此舉預計將吸引大量機構資金進入比特幣市場。",
    source: "CoinDesk",
    sourceUrl: "https://coindesk.com/policy/sec-bitcoin-etf",
    category: "regulation",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    externalId: "coindesk::sec-btc-etf-2024",
    isAnalyzed: false,
  },
  {
    title: "以太坊 Dencun 升級成功完成，Gas 費用大幅下降",
    summary: "以太坊網絡成功完成 Dencun 升級，引入 Proto-Danksharding 技術。升級後 Layer 2 解決方案的 Gas 費用下降 90% 以上，大幅改善用戶體驗。",
    source: "Cointelegraph",
    sourceUrl: "https://cointelegraph.com/ethereum-dencun",
    category: "technology",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    externalId: "cointelegraph::eth-dencun-2024",
    isAnalyzed: false,
  },
  {
    title: "歐盟正式實施 MiCA 加密資產監管法規",
    summary: "歐盟 MiCA（加密資產市場監管法規）正式生效，成為全球首個全面的加密資產監管框架。該法規要求加密交易所和託管服務商進行牌照申請和合規審查。",
    source: "Bitcoin Magazine",
    sourceUrl: "https://bitcoinmagazine.com/eu-mica",
    category: "regulation",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    externalId: "bitcoinmagazine::eu-mica-2024",
    isAnalyzed: false,
  },
  {
    title: "Solana 網絡恢復穩定，驗證者數量創新高",
    summary: "Solana 區塊鏈在經歷數月的穩定性問題後，最近實現了連續 30 天無故障運行。網絡驗證者數量突破 3000，創歷史新高，表明社區信心回升。",
    source: "CryptoPanic",
    sourceUrl: "https://cryptopanic.com/solana-recovery",
    category: "technology",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    externalId: "cryptopanic::solana-stable-2024",
    isAnalyzed: false,
  },
  {
    title: "美聯儲暗示可能降息，加密市場應聲上漲",
    summary: "美國聯邦儲備委員會主席在最新新聞發布會上暗示，如果通脹持續下降，可能在年中開始降息。此消息發布後，比特幣、以太坊等主流加密資產應聲上漲。",
    source: "CoinDesk",
    sourceUrl: "https://coindesk.com/fed-rate-cut",
    category: "policy",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    externalId: "coindesk::fed-rate-2024",
    isAnalyzed: false,
  },
  {
    title: "俄烏戰爭升級，加密貨幣成為資金避險工具",
    summary: "地緣政治局勢緊張，烏克蘭報告遭受大規模網絡攻擊。投資者轉向比特幣等去中心化資產作為避險工具，導致 BTC 價格上升 5%。",
    source: "Cointelegraph",
    sourceUrl: "https://cointelegraph.com/geopolitics-crypto",
    category: "geopolitics",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    externalId: "cointelegraph::geopolitics-2024",
    isAnalyzed: false,
  },
  {
    title: "Ripple 與日本銀行合作推進跨境支付",
    summary: "Ripple 與日本主要銀行達成合作協議，利用 XRP 和 RippleNet 技術優化跨境支付流程。此舉被視為加密技術在傳統金融中應用的重要進展。",
    source: "Bitcoin Magazine",
    sourceUrl: "https://bitcoinmagazine.com/ripple-japan",
    category: "market",
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
    externalId: "bitcoinmagazine::ripple-japan-2024",
    isAnalyzed: false,
  },
  {
    title: "Cardano 智能合約生態加速發展，DeFi 應用增加 40%",
    summary: "Cardano 網絡上的 DeFi 應用數量在過去三個月內增加 40%，總鎖定價值（TVL）突破 10 億美元。社區對 ADA 的未來發展前景持樂觀態度。",
    source: "CryptoPanic",
    sourceUrl: "https://cryptopanic.com/cardano-defi",
    category: "technology",
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    externalId: "cryptopanic::cardano-defi-2024",
    isAnalyzed: false,
  },
];

const MOCK_IMPACTS: Record<string, InsertCoinImpact[]> = {
  "coindesk::sec-btc-etf-2024": [
    {
      newsId: 0, // Will be updated
      coinSymbol: "BTC",
      coinName: "Bitcoin",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "SEC 批准現貨比特幣 ETF 是重大利多。這將大幅降低機構投資者進入比特幣市場的門檻，預計將吸引數十億美元的機構資金。",
    },
    {
      newsId: 0,
      coinSymbol: "ETH",
      coinName: "Ethereum",
      sentiment: "bullish",
      impactLevel: "medium",
      analysis: "整個加密市場情緒改善，以太坊作為第二大加密資產也將受益。預期資金會流向以太坊及其生態應用。",
    },
  ],
  "cointelegraph::eth-dencun-2024": [
    {
      newsId: 0,
      coinSymbol: "ETH",
      coinName: "Ethereum",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "Dencun 升級是以太坊技術發展的重要里程碑。Gas 費用大幅下降將提升以太坊的競爭力，吸引更多用戶和開發者。",
    },
    {
      newsId: 0,
      coinSymbol: "ARB",
      coinName: "Arbitrum",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "Arbitrum 作為以太坊 Layer 2 解決方案，將直接受益於 Dencun 升級帶來的 Gas 費用下降。",
    },
    {
      newsId: 0,
      coinSymbol: "OP",
      coinName: "Optimism",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "Optimism 同樣是以太坊 Layer 2 方案，將從 Dencun 升級中獲得顯著性能提升。",
    },
  ],
  "cointelegraph::eu-mica-2024": [
    {
      newsId: 0,
      coinSymbol: "BTC",
      coinName: "Bitcoin",
      sentiment: "neutral",
      impactLevel: "medium",
      analysis: "MiCA 法規提供了明確的監管框架，有利於加密市場長期發展。短期可能導致部分交易所調整業務，但長期利好。",
    },
    {
      newsId: 0,
      coinSymbol: "ETH",
      coinName: "Ethereum",
      sentiment: "neutral",
      impactLevel: "medium",
      analysis: "歐盟監管框架的建立將規範以太坊生態中的 DeFi 應用。部分應用可能需要調整，但整體利好合規發展。",
    },
  ],
  "cryptopanic::solana-stable-2024": [
    {
      newsId: 0,
      coinSymbol: "SOL",
      coinName: "Solana",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "Solana 網絡穩定性改善是重大利多。連續 30 天無故障運行證明了網絡的可靠性，將吸引更多開發者和用戶。",
    },
  ],
  "coindesk::fed-rate-2024": [
    {
      newsId: 0,
      coinSymbol: "BTC",
      coinName: "Bitcoin",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "美聯儲降息預期對比特幣有利。降息通常導致流動性增加，投資者尋求高風險資產，利好比特幣。",
    },
    {
      newsId: 0,
      coinSymbol: "ETH",
      coinName: "Ethereum",
      sentiment: "bullish",
      impactLevel: "medium",
      analysis: "降息預期改善整體風險資產前景，以太坊將受益於市場流動性增加。",
    },
  ],
  "cointelegraph::geopolitics-2024": [
    {
      newsId: 0,
      coinSymbol: "BTC",
      coinName: "Bitcoin",
      sentiment: "bullish",
      impactLevel: "medium",
      analysis: "地緣政治風險上升時，比特幣通常作為避險資產受歡迎。投資者轉向去中心化資產以規避政治風險。",
    },
  ],
  "bitcoinmagazine::ripple-japan-2024": [
    {
      newsId: 0,
      coinSymbol: "XRP",
      coinName: "XRP",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "Ripple 與日本銀行的合作是 XRP 實際應用的重要進展。這將推動 XRP 在跨境支付領域的採用。",
    },
  ],
  "bitcoinmagazine::cardano-defi-2024": [
    {
      newsId: 0,
      coinSymbol: "ADA",
      coinName: "Cardano",
      sentiment: "bullish",
      impactLevel: "high",
      analysis: "Cardano DeFi 生態的快速增長表明社區對平台的信心。TVL 突破 10 億美元是重要里程碑，利好 ADA。",
    },
  ],
};

export async function seedTestData() {
  console.log("[Seed] Inserting mock news articles...");
  await insertNews(MOCK_NEWS);

  // Get the inserted news IDs and create impacts
  console.log("[Seed] Creating coin impacts...");
  for (let i = 0; i < MOCK_NEWS.length; i++) {
    const externalId = MOCK_NEWS[i].externalId!;
    const impacts = MOCK_IMPACTS[externalId] || [];
    for (const impact of impacts) {
      impact.newsId = i + 1; // Assuming IDs start from 1
    }
    if (impacts.length > 0) {
      await insertCoinImpacts(impacts);
    }
  }

  console.log("[Seed] ✓ Test data seeded successfully!");
  console.log(`[Seed] Inserted ${MOCK_NEWS.length} news articles with impacts`);
}
