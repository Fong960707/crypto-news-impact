import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Sentiment } from "@/lib/types";
import TopNav from "@/components/TopNav";
import FilterBar from "@/components/FilterBar";
import NewsCard from "@/components/NewsCard";
import NewsCardSkeleton from "@/components/NewsCardSkeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { BarChart2, Newspaper, TrendingUp, TrendingDown } from "lucide-react";

const PAGE_SIZE = 20;

export default function Home() {
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | null>(null);
  const [offset, setOffset] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const watchlist = useWatchlist();

  const { data, isLoading, refetch } = trpc.news.list.useQuery(
    {
      coinSymbols: selectedCoins.length > 0 ? selectedCoins : undefined,
      sentiment: selectedSentiment ?? undefined,
      limit: PAGE_SIZE,
      offset,
    },
    { refetchInterval: 60_000, refetchOnWindowFocus: false }
  );

  const handleCoinToggle = useCallback((symbol: string) => {
    setSelectedCoins((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
    setOffset(0);
  }, []);

  const handleSentimentChange = useCallback((s: Sentiment | null) => {
    setSelectedSentiment(s);
    setOffset(0);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refetch();
  }, [refetch]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  // Stats
  const bullishCount = items.flatMap((n) => n.impacts).filter((i) => i.sentiment === "bullish").length;
  const bearishCount = items.flatMap((n) => n.impacts).filter((i) => i.sentiment === "bearish").length;

  return (
    <div className="min-h-screen">
      <TopNav onRefresh={handleRefresh} />

      <main className="container py-8">
        {/* Hero section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "oklch(0.93 0.01 80)" }}>
                全球加密貨幣新聞雷達
              </h2>
              <p className="text-sm" style={{ color: "oklch(0.48 0.02 265)" }}>
                AI 即時分析政策、法規、地緣政治與市場事件對各幣種的影響
              </p>
            </div>
          </div>
          <div className="gold-line" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Newspaper, label: "本頁新聞", value: items.length, color: "oklch(0.78 0.12 75)" },
            { icon: BarChart2, label: "AI 已分析", value: items.filter((n) => n.isAnalyzed).length, color: "oklch(0.65 0.10 265)" },
            { icon: TrendingUp, label: "利多訊號", value: bullishCount, color: "oklch(0.65 0.18 145)" },
            { icon: TrendingDown, label: "利空訊號", value: bearishCount, color: "oklch(0.60 0.20 25)" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.18 0.015 265)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <div className="text-lg font-bold font-mono leading-none" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.02 265)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div
                className="rounded-xl p-4"
                style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.18 0.015 265)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "oklch(0.45 0.02 265)" }}>
                  篩選條件
                </h3>
                <FilterBar
                  watchedCoins={watchlist.coins}
                  selectedCoins={selectedCoins}
                  selectedSentiment={selectedSentiment}
                  onCoinToggle={handleCoinToggle}
                  onSentimentChange={handleSentimentChange}
                  totalCount={total}
                />
              </div>

              {/* Watchlist summary */}
              {watchlist.coins.length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.18 0.015 265)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.45 0.02 265)" }}>
                    關注清單
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {watchlist.coins.map((coin) => (
                      <span key={coin.coinSymbol} className="coin-chip">{coin.coinSymbol}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main: news list */}
          <div className="lg:col-span-3 space-y-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)
            ) : items.length === 0 ? (
              <div
                className="rounded-xl p-12 text-center"
                style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.18 0.015 265)" }}
              >
                <Newspaper className="w-10 h-10 mx-auto mb-4" style={{ color: "oklch(0.30 0.02 265)" }} />
                <p className="text-sm font-medium mb-1" style={{ color: "oklch(0.55 0.02 265)" }}>
                  {selectedCoins.length > 0 || selectedSentiment ? "目前沒有符合篩選條件的新聞" : "尚無新聞資料"}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.38 0.02 265)" }}>
                  {selectedCoins.length > 0 || selectedSentiment ? "請嘗試調整篩選條件" : "點擊「手動刷新」以抓取最新新聞"}
                </p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <NewsCard key={item.id} news={item as any} />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                      style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)", color: "oklch(0.65 0.02 265)" }}
                    >
                      上一頁
                    </button>
                    <span className="text-sm px-3" style={{ color: "oklch(0.50 0.02 265)" }}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setOffset(offset + PAGE_SIZE)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                      style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)", color: "oklch(0.65 0.02 265)" }}
                    >
                      下一頁
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8" style={{ borderTop: "1px solid oklch(0.16 0.015 265)" }}>
        <div className="container">
          <div className="gold-line mb-6" />
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "oklch(0.35 0.02 265)" }}>
              Crypto Radar · AI News Intelligence Platform
            </p>
            <p className="text-xs" style={{ color: "oklch(0.35 0.02 265)" }}>
              新聞資料每小時自動更新
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
