import { useState } from "react";
import { Plus, X, Check, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRESET_COINS } from "@/lib/types";
import { toast } from "sonner";

interface CoinManagerProps {
  open: boolean;
  onClose: () => void;
  watchlist: {
    coins: Array<{ coinSymbol: string; coinName: string; isCustom: boolean }>;
    addCoin: (symbol: string, name: string, isCustom?: boolean) => void;
    removeCoin: (symbol: string) => void;
    hasCoin: (symbol: string) => boolean;
  };
}

export default function CoinManager({ open, onClose, watchlist }: CoinManagerProps) {
  const [search, setSearch] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");

  const filteredPresets = PRESET_COINS.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustom = () => {
    const sym = customSymbol.trim().toUpperCase();
    const name = customName.trim();
    if (!sym || !name) {
      toast.error("請填寫幣種代號與名稱");
      return;
    }
    if (watchlist.hasCoin(sym)) {
      toast.error(`${sym} 已在關注清單中`);
      return;
    }
    watchlist.addCoin(sym, name, true);
    setCustomSymbol("");
    setCustomName("");
    toast.success(`已新增 ${sym} 至關注清單`);
  };

  const customCoins = watchlist.coins.filter((c) => c.isCustom);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        style={{
          background: "oklch(0.11 0.01 265)",
          border: "1px solid oklch(0.22 0.02 265)",
          borderRadius: "1rem",
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid oklch(0.18 0.015 265)" }}>
          <DialogTitle className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "oklch(0.93 0.01 80)" }}>
            幣種關注清單
          </DialogTitle>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.02 265)" }}>
            選擇您想追蹤的幣種，AI 將自動分析新聞對其影響
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "oklch(0.45 0.02 265)" }} />
            <Input
              placeholder="搜尋幣種..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
              style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)", color: "oklch(0.85 0.01 80)" }}
            />
          </div>

          {/* Preset coins grid */}
          <div>
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "oklch(0.45 0.02 265)" }}>
              主流幣種
            </p>
            <div className="grid grid-cols-3 gap-2">
              {filteredPresets.map((coin) => {
                const active = watchlist.hasCoin(coin.symbol);
                return (
                  <button
                    key={coin.symbol}
                    onClick={() => {
                      if (active) {
                        watchlist.removeCoin(coin.symbol);
                        toast.success(`已移除 ${coin.symbol}`);
                      } else {
                        watchlist.addCoin(coin.symbol, coin.name, false);
                        toast.success(`已新增 ${coin.symbol}`);
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                    style={{
                      background: active ? "oklch(0.18 0.04 75 / 0.4)" : "oklch(0.14 0.01 265)",
                      border: `1px solid ${active ? "oklch(0.40 0.08 75 / 0.5)" : "oklch(0.22 0.02 265)"}`,
                      color: active ? "oklch(0.78 0.12 75)" : "oklch(0.75 0.01 265)",
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold font-mono">{coin.symbol}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: active ? "oklch(0.65 0.08 75)" : "oklch(0.50 0.02 265)", fontSize: "0.65rem" }}>
                        {coin.name}
                      </div>
                    </div>
                    {active && <Check className="w-3 h-3 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom coins */}
          {customCoins.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "oklch(0.45 0.02 265)" }}>
                自訂幣種
              </p>
              <div className="space-y-2">
                {customCoins.map((coin) => (
                  <div
                    key={coin.coinSymbol}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono" style={{ color: "oklch(0.78 0.12 75)" }}>{coin.coinSymbol}</span>
                      <span className="text-xs" style={{ color: "oklch(0.55 0.02 265)" }}>{coin.coinName}</span>
                    </div>
                    <button
                      onClick={() => { watchlist.removeCoin(coin.coinSymbol); toast.success(`已移除 ${coin.coinSymbol}`); }}
                      className="p-1 rounded transition-colors hover:bg-red-500/10"
                      style={{ color: "oklch(0.55 0.15 25)" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom coin */}
          <div>
            <div className="gold-line mb-4" />
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "oklch(0.45 0.02 265)" }}>
              新增自訂幣種
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="代號 (如 PEPE)"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                className="h-9 text-sm font-mono uppercase flex-1"
                style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)", color: "oklch(0.85 0.01 80)" }}
                maxLength={20}
              />
              <Input
                placeholder="名稱 (如 Pepe)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-9 text-sm flex-1"
                style={{ background: "oklch(0.14 0.01 265)", border: "1px solid oklch(0.22 0.02 265)", color: "oklch(0.85 0.01 80)" }}
                maxLength={100}
              />
              <Button
                size="sm"
                className="h-9 px-3 flex-shrink-0"
                style={{ background: "oklch(0.78 0.12 75)", color: "oklch(0.09 0.01 265)" }}
                onClick={handleAddCustom}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderTop: "1px solid oklch(0.18 0.015 265)" }}>
          <Button
            className="w-full h-9 text-sm font-medium"
            style={{ background: "oklch(0.78 0.12 75)", color: "oklch(0.09 0.01 265)" }}
            onClick={onClose}
          >
            完成設定（已選 {watchlist.coins.length} 個幣種）
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
