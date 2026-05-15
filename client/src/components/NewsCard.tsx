import { Link } from "wouter";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { NewsItem, SENTIMENT_LABELS, IMPACT_LABELS, CATEGORY_LABELS, Sentiment, ImpactLevel } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

interface NewsCardProps {
  news: NewsItem;
}

function SentimentBadge({ sentiment, impactLevel }: { sentiment: Sentiment; impactLevel: ImpactLevel }) {
  const isBullish = sentiment === "bullish";
  const isBearish = sentiment === "bearish";

  const Icon = isBullish ? TrendingUp : isBearish ? TrendingDown : Minus;
  const className = isBullish ? "badge-bullish" : isBearish ? "badge-bearish" : "badge-neutral";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${className}`}>
      <Icon className="w-3 h-3" />
      {SENTIMENT_LABELS[sentiment]}
      <span className="opacity-70 text-xs">·</span>
      <span className="opacity-80 text-xs">{IMPACT_LABELS[impactLevel]}</span>
    </span>
  );
}

function ImpactDots({ level }: { level: ImpactLevel }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{
            background: i <= filled
              ? level === "high" ? "oklch(0.60 0.20 25)" : level === "medium" ? "oklch(0.78 0.12 75)" : "oklch(0.55 0.05 265)"
              : "oklch(0.22 0.02 265)",
          }}
        />
      ))}
    </div>
  );
}

export default function NewsCard({ news }: NewsCardProps) {
  const dominantImpact = news.impacts.length > 0
    ? news.impacts.reduce((prev, curr) => {
        const order = { high: 3, medium: 2, low: 1 };
        return order[curr.impactLevel] > order[prev.impactLevel] ? curr : prev;
      })
    : null;

  const bullishCount = news.impacts.filter((i) => i.sentiment === "bullish").length;
  const bearishCount = news.impacts.filter((i) => i.sentiment === "bearish").length;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: zhTW });
    } catch {
      return "未知時間";
    }
  })();

  return (
    <Link href={`/news/${news.id}`}>
      <article
        className="news-card glass-card rounded-xl p-5 cursor-pointer block"
        style={{ borderColor: "oklch(0.20 0.015 265)" }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {news.category && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "oklch(0.16 0.02 265)", color: "oklch(0.55 0.04 265)", border: "1px solid oklch(0.22 0.02 265)" }}>
                {CATEGORY_LABELS[news.category]}
              </span>
            )}
            {!news.isAnalyzed && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "oklch(0.16 0.03 75 / 0.3)", color: "oklch(0.65 0.08 75)", border: "1px solid oklch(0.30 0.06 75 / 0.3)" }}>
                分析中...
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.35 0.02 265)" }} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2" style={{ color: "oklch(0.90 0.01 80)", fontFamily: "var(--font-display)" }}>
          {news.title}
        </h3>

        {/* Summary */}
        {news.summary && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "oklch(0.52 0.02 265)" }}>
            {news.summary}
          </p>
        )}

        {/* Coin impacts */}
        {news.impacts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {news.impacts.slice(0, 5).map((impact) => (
              <div key={impact.id} className="flex items-center gap-1">
                <span className="coin-chip">{impact.coinSymbol}</span>
                <SentimentBadge sentiment={impact.sentiment} impactLevel={impact.impactLevel} />
              </div>
            ))}
            {news.impacts.length > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ color: "oklch(0.45 0.02 265)", background: "oklch(0.14 0.01 265)" }}>
                +{news.impacts.length - 5} 更多
              </span>
            )}
          </div>
        )}

        {/* Summary sentiment bar */}
        {news.impacts.length > 0 && (bullishCount > 0 || bearishCount > 0) && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 265)" }}>
              <div
                className="h-full rounded-full transition-all"
              style={{
                width: `${(bullishCount / (bullishCount + bearishCount)) * 100}%`,
                background: bullishCount > bearishCount ? "oklch(0.65 0.18 145)" : "oklch(0.60 0.20 25)",
              }}
              />
            </div>
            <span className="text-xs" style={{ color: "oklch(0.45 0.02 265)" }}>
              {bullishCount > 0 && <span style={{ color: "oklch(0.65 0.18 145)" }}>{bullishCount} 利多</span>}
              {bullishCount > 0 && bearishCount > 0 && <span className="mx-1">·</span>}
              {bearishCount > 0 && <span style={{ color: "oklch(0.60 0.20 25)" }}>{bearishCount} 利空</span>}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {news.source && (
              <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.03 265)" }}>
                {news.source}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" style={{ color: "oklch(0.40 0.02 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.40 0.02 265)" }}>{timeAgo}</span>
            </div>
          </div>
          {dominantImpact && <ImpactDots level={dominantImpact.impactLevel} />}
        </div>
      </article>
    </Link>
  );
}
