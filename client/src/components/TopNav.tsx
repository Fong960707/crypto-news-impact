import { useState } from "react";
import { RefreshCw, Settings2, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CoinManager from "./CoinManager";
import { useWatchlist } from "@/hooks/useWatchlist";

interface TopNavProps {
  onRefresh?: () => void;
}

export default function TopNav({ onRefresh }: TopNavProps) {
  const [showCoinManager, setShowCoinManager] = useState(false);
  const watchlist = useWatchlist();

  const refreshMutation = trpc.news.refresh.useMutation({
    onSuccess: (data) => {
      toast.success(`已更新 ${data.fetched} 則新聞，分析 ${data.analyzed} 則`, {
        description: "新聞資料已同步至最新狀態",
      });
      onRefresh?.();
    },
    onError: () => {
      toast.error("刷新失敗，請稍後再試");
    },
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full" style={{ background: "oklch(0.09 0.01 265 / 0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid oklch(0.18 0.015 265)" }}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "oklch(0.16 0.02 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
                <Zap className="w-4 h-4" style={{ color: "oklch(0.78 0.12 75)" }} />
                <div className="absolute inset-0 rounded-lg" style={{ boxShadow: "0 0 12px oklch(0.78 0.12 75 / 0.2)" }} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight leading-none" style={{ fontFamily: "var(--font-display)", color: "oklch(0.93 0.01 80)" }}>
                  Crypto Radar
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.02 265)", letterSpacing: "0.08em" }}>
                  AI NEWS INTELLIGENCE
                </p>
              </div>
            </div>

            {/* Center: live indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "oklch(0.13 0.01 265)", border: "1px solid oklch(0.20 0.015 265)" }}>
              <div className="pulse-dot" />
              <span className="text-xs font-medium" style={{ color: "oklch(0.60 0.02 265)", letterSpacing: "0.06em" }}>
                LIVE ANALYSIS
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs font-medium h-8 px-3"
                    style={{ color: "oklch(0.65 0.02 265)", border: "1px solid oklch(0.20 0.015 265)", background: "oklch(0.13 0.01 265)" }}
                    onClick={() => refreshMutation.mutate()}
                    disabled={refreshMutation.isPending}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">{refreshMutation.isPending ? "更新中..." : "手動刷新"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>手動抓取最新新聞並進行 AI 分析</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs font-medium h-8 px-3"
                    style={{ color: "oklch(0.78 0.12 75)", border: "1px solid oklch(0.30 0.06 75 / 0.4)", background: "oklch(0.14 0.02 75 / 0.3)" }}
                    onClick={() => setShowCoinManager(true)}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">幣種管理</span>
                    {watchlist.coins.length > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold" style={{ background: "oklch(0.78 0.12 75)", color: "oklch(0.09 0.01 265)" }}>
                        {watchlist.coins.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>管理您關注的幣種</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <CoinManager open={showCoinManager} onClose={() => setShowCoinManager(false)} watchlist={watchlist} />
    </>
  );
}
