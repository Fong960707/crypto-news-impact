import { TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import { Sentiment } from "@/lib/types";

interface FilterBarProps {
  watchedCoins: Array<{ coinSymbol: string; coinName: string }>;
  selectedCoins: string[];
  selectedSentiment: Sentiment | null;
  onCoinToggle: (symbol: string) => void;
  onSentimentChange: (s: Sentiment | null) => void;
  totalCount: number;
}

const SENTIMENT_OPTIONS: Array<{ value: Sentiment; label: string; icon: React.ElementType; color: string; bg: string; border: string }> = [
  { value: "bullish", label: "利多", icon: TrendingUp, color: "oklch(0.70 0.18 145)", bg: "oklch(0.18 0.05 145 / 0.5)", border: "oklch(0.35 0.10 145 / 0.6)" },
  { value: "bearish", label: "利空", icon: TrendingDown, color: "oklch(0.65 0.20 25)", bg: "oklch(0.16 0.05 25 / 0.5)", border: "oklch(0.35 0.12 25 / 0.6)" },
  { value: "neutral", label: "中性", icon: Minus, color: "oklch(0.60 0.04 265)", bg: "oklch(0.16 0.02 265 / 0.5)", border: "oklch(0.30 0.03 265 / 0.6)" },
];

export default function FilterBar({
  watchedCoins,
  selectedCoins,
  selectedSentiment,
  onCoinToggle,
  onSentimentChange,
  totalCount,
}: FilterBarProps) {
  const hasFilters = selectedCoins.length > 0 || selectedSentiment !== null;

  return (
    <div className="space-y-3">
      {/* Sentiment filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: "oklch(0.40 0.02 265)" }}>
          影響類型
        </span>
        <div className="flex items-center gap-1.5">
          {SENTIMENT_OPTIONS.map(({ value, label, icon: Icon, color, bg, border }) => {
            const active = selectedSentiment === value;
            return (
              <button
                key={value}
                onClick={() => onSentimentChange(active ? null : value)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  background: active ? bg : "oklch(0.13 0.01 265)",
                  border: `1px solid ${active ? border : "oklch(0.20 0.015 265)"}`,
                  color: active ? color : "oklch(0.50 0.02 265)",
                }}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coin filter */}
      {watchedCoins.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: "oklch(0.40 0.02 265)" }}>
            幣種篩選
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {watchedCoins.map((coin) => {
              const active = selectedCoins.includes(coin.coinSymbol);
              return (
                <button
                  key={coin.coinSymbol}
                  onClick={() => onCoinToggle(coin.coinSymbol)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all duration-150"
                  style={{
                    background: active ? "oklch(0.18 0.04 75 / 0.4)" : "oklch(0.13 0.01 265)",
                    border: `1px solid ${active ? "oklch(0.40 0.08 75 / 0.5)" : "oklch(0.20 0.015 265)"}`,
                    color: active ? "oklch(0.78 0.12 75)" : "oklch(0.50 0.02 265)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {coin.coinSymbol}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "oklch(0.45 0.02 265)" }}>
            顯示 <span style={{ color: "oklch(0.78 0.12 75)" }}>{totalCount}</span> 則符合條件的新聞
          </span>
          <button
            onClick={() => { onSentimentChange(null); selectedCoins.forEach((s) => onCoinToggle(s)); }}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors"
            style={{ color: "oklch(0.55 0.15 25)", background: "oklch(0.14 0.03 25 / 0.3)", border: "1px solid oklch(0.25 0.08 25 / 0.4)" }}
          >
            <X className="w-3 h-3" />
            清除篩選
          </button>
        </div>
      )}
    </div>
  );
}
