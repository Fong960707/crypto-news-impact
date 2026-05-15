import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { SENTIMENT_LABELS, IMPACT_LABELS, CATEGORY_LABELS, Sentiment, ImpactLevel } from "@/lib/types";
import { ArrowLeft, ExternalLink, Clock, TrendingUp, TrendingDown, Minus, AlertCircle, Zap } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Streamdown } from "streamdown";

function SentimentIcon({ sentiment }: { sentiment: Sentiment }) {
  if (sentiment === "bullish") return <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.65 0.18 145)" }} />;
  if (sentiment === "bearish") return <TrendingDown className="w-4 h-4" style={{ color: "oklch(0.60 0.20 25)" }} />;
  return <Minus className="w-4 h-4" style={{ color: "oklch(0.55 0.04 265)" }} />;
}

function ImpactCard({ impact }: { impact: any }) {
  const isBullish = impact.sentiment === "bullish";
  const isBearish = impact.sentiment === "bearish";

  const accentColor = isBullish ? "oklch(0.65 0.18 145)" : isBearish ? "oklch(0.60 0.20 25)" : "oklch(0.55 0.04 265)";
  const bgColor = isBullish ? "oklch(0.16 0.04 145 / 0.3)" : isBearish ? "oklch(0.14 0.04 25 / 0.3)" : "oklch(0.14 0.02 265 / 0.3)";
  const borderColor = isBullish ? "oklch(0.28 0.08 145 / 0.5)" : isBearish ? "oklch(0.26 0.08 25 / 0.5)" : "oklch(0.22 0.02 265)";

  const impactLevelColors: Record<ImpactLevel, string> = {
    high: "oklch(0.60 0.20 25)",
    medium: "oklch(0.78 0.12 75)",
    low: "oklch(0.50 0.04 265)",
  };

  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold font-mono" style={{ color: accentColor }}>
            {impact.coinSymbol}
          </span>
          {impact.coinName && (
            <span className="text-xs" style={{ color: "oklch(0.50 0.02 265)" }}>{impact.coinName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
            <SentimentIcon sentiment={impact.sentiment} />
            <span className="text-xs font-semibold" style={{ color: accentColor }}>
              {SENTIMENT_LABELS[impact.sentiment as Sentiment]}
            </span>
          </div>
          <div className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)", color: impactLevelColors[impact.impactLevel as ImpactLevel] }}>
            {IMPACT_LABELS[impact.impactLevel as ImpactLevel]}
          </div>
        </div>
      </div>

      {/* Analysis */}
      {impact.analysis && (
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.72 0.01 265)" }}>
          {impact.analysis}
        </p>
      )}

      {/* Impact bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "oklch(0.40 0.02 265)" }}>影響程度</span>
        <div className="flex-1 h-1 rounded-full" style={{ background: "oklch(0.18 0.02 265)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: impact.impactLevel === "high" ? "100%" : impact.impactLevel === "medium" ? "60%" : "30%",
              background: accentColor,
              boxShadow: `0 0 6px ${accentColor}60`,
            }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: accentColor }}>
          {impact.impactLevel === "high" ? "HIGH" : impact.impactLevel === "medium" ? "MED" : "LOW"}
        </span>
      </div>
    </div>
  );
}

export default function NewsDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = parseInt(params.id || "0");

  const { data: news, isLoading, error } = trpc.news.detail.useQuery(
    { id },
    { enabled: !!id && id > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="skeleton h-6 w-24 rounded-md" />
            <div className="skeleton h-8 w-full rounded" />
            <div className="skeleton h-8 w-4/5 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-4 w-full rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto" style={{ color: "oklch(0.55 0.15 25)" }} />
          <p className="text-sm" style={{ color: "oklch(0.55 0.02 265)" }}>找不到此新聞</p>
          <button onClick={() => navigate("/")} className="text-sm" style={{ color: "oklch(0.78 0.12 75)" }}>返回首頁</button>
        </div>
      </div>
    );
  }

  const bullishImpacts = news.impacts.filter((i) => i.sentiment === "bullish");
  const bearishImpacts = news.impacts.filter((i) => i.sentiment === "bearish");
  const neutralImpacts = news.impacts.filter((i) => i.sentiment === "neutral");

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: zhTW }); }
    catch { return ""; }
  })();

  const publishedDate = (() => {
    try { return format(new Date(news.publishedAt), "yyyy年MM月dd日 HH:mm", { locale: zhTW }); }
    catch { return ""; }
  })();

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-50" style={{ background: "oklch(0.09 0.01 265 / 0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.18 0.015 265)" }}>
        <div className="container">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "oklch(0.60 0.02 265)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              返回新聞列表
            </button>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.12 75)" }} />
              <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.02 265)", letterSpacing: "0.06em" }}>
                AI ANALYSIS REPORT
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Category & meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {news.category && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: "oklch(0.16 0.02 265)", color: "oklch(0.60 0.04 265)", border: "1px solid oklch(0.22 0.02 265)" }}>
                {CATEGORY_LABELS[news.category]}
              </span>
            )}
            {news.source && (
              <span className="text-xs font-medium" style={{ color: "oklch(0.50 0.02 265)" }}>{news.source}</span>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" style={{ color: "oklch(0.40 0.02 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.40 0.02 265)" }}>{publishedDate}</span>
              <span className="text-xs" style={{ color: "oklch(0.35 0.02 265)" }}>（{timeAgo}）</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug mb-4" style={{ fontFamily: "var(--font-display)", color: "oklch(0.93 0.01 80)" }}>
            {news.title}
          </h1>

              {/* Summary */}
              {news.summary && (
                <p className="text-sm leading-relaxed mb-4 p-4 rounded-xl" style={{ background: "oklch(0.13 0.01 265)", border: "1px solid oklch(0.20 0.015 265)", color: "oklch(0.68 0.02 265)" }}>
                  {news.summary}
                </p>
              )}

              {/* AI Overall Summary */}
              {news.content && news.isAnalyzed && (
                <div className="mb-4 p-4 rounded-xl" style={{ background: "oklch(0.14 0.02 75 / 0.15)", border: "1px solid oklch(0.30 0.06 75 / 0.3)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.12 75)" }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "oklch(0.65 0.08 75)" }}>AI 整體市場分析</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.72 0.01 265)" }}>{news.content}</p>
                </div>
              )}

          {/* Source link */}
          {news.sourceUrl && (
            <a
              href={news.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 transition-colors"
              style={{ color: "oklch(0.65 0.08 265)" }}
            >
              <ExternalLink className="w-3 h-3" />
              查看原始來源
            </a>
          )}

          <div className="gold-line mb-8" />

          {/* AI Analysis section */}
          {news.isAnalyzed && news.impacts.length > 0 ? (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.16 0.04 75 / 0.4)", border: "1px solid oklch(0.35 0.08 75 / 0.4)" }}>
                  <Zap className="w-4 h-4" style={{ color: "oklch(0.78 0.12 75)" }} />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "oklch(0.90 0.01 80)" }}>
                    AI 智能分析報告
                  </h2>
                  <p className="text-xs" style={{ color: "oklch(0.45 0.02 265)" }}>
                    共分析 {news.impacts.length} 個幣種 · {bullishImpacts.length} 利多 · {bearishImpacts.length} 利空
                    {neutralImpacts.length > 0 && ` · ${neutralImpacts.length} 中性`}
                  </p>
                </div>
              </div>

              {/* Overall sentiment bar */}
              {(bullishImpacts.length > 0 || bearishImpacts.length > 0) && (
                <div className="mb-6 p-4 rounded-xl" style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.18 0.015 265)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.18 145)" }}>
                      利多 {bullishImpacts.length} 個幣種
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "oklch(0.60 0.20 25)" }}>
                      {bearishImpacts.length} 個幣種 利空
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.16 0.02 265)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(bullishImpacts.length / news.impacts.length) * 100}%`,
                        background: "linear-gradient(90deg, oklch(0.65 0.18 145), oklch(0.70 0.15 145))",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs" style={{ color: "oklch(0.40 0.02 265)" }}>
                      整體偏向：{bullishImpacts.length > bearishImpacts.length ? "利多" : bullishImpacts.length < bearishImpacts.length ? "利空" : "中性"}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "oklch(0.45 0.02 265)" }}>
                      {Math.round((bullishImpacts.length / news.impacts.length) * 100)}% 利多
                    </span>
                  </div>
                </div>
              )}

              {/* Bullish impacts */}
              {bullishImpacts.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.65 0.18 145)" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "oklch(0.65 0.18 145)" }}>利多幣種</h3>
                  </div>
                  <div className="space-y-3">
                    {bullishImpacts.map((impact) => <ImpactCard key={impact.id} impact={impact} />)}
                  </div>
                </div>
              )}

              {/* Bearish impacts */}
              {bearishImpacts.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4" style={{ color: "oklch(0.60 0.20 25)" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "oklch(0.60 0.20 25)" }}>利空幣種</h3>
                  </div>
                  <div className="space-y-3">
                    {bearishImpacts.map((impact) => <ImpactCard key={impact.id} impact={impact} />)}
                  </div>
                </div>
              )}

              {/* Neutral impacts */}
              {neutralImpacts.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Minus className="w-4 h-4" style={{ color: "oklch(0.55 0.04 265)" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "oklch(0.55 0.04 265)" }}>中性影響</h3>
                  </div>
                  <div className="space-y-3">
                    {neutralImpacts.map((impact) => <ImpactCard key={impact.id} impact={impact} />)}
                  </div>
                </div>
              )}
            </section>
          ) : !news.isAnalyzed ? (
            <div className="rounded-xl p-8 text-center" style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.20 0.015 265)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "oklch(0.16 0.04 75 / 0.3)", border: "1px solid oklch(0.30 0.06 75 / 0.3)" }}>
                <Zap className="w-5 h-5 animate-pulse" style={{ color: "oklch(0.78 0.12 75)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "oklch(0.65 0.02 265)" }}>AI 分析進行中</p>
              <p className="text-xs" style={{ color: "oklch(0.40 0.02 265)" }}>此新聞正在進行 AI 分析，請稍後再查看</p>
            </div>
          ) : (
            <div className="rounded-xl p-8 text-center" style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.20 0.015 265)" }}>
              <p className="text-sm" style={{ color: "oklch(0.50 0.02 265)" }}>此新聞對所追蹤幣種無顯著影響</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
