import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { PRESET_COINS, UserCoin } from "@/lib/types";
import { nanoid } from "nanoid";

const SESSION_KEY = "crypto_radar_session";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = nanoid(32);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useWatchlist() {
  const [sessionId] = useState(() => getSessionId());

  const { data: coins = [], refetch, isLoading } = trpc.coins.list.useQuery(
    { sessionId },
    { staleTime: 30_000 }
  );

  const addMutation = trpc.coins.add.useMutation({
    onSuccess: () => refetch(),
  });

  const removeMutation = trpc.coins.remove.useMutation({
    onSuccess: () => refetch(),
  });

  const addCoin = useCallback(
    (symbol: string, name: string, isCustom = false) => {
      addMutation.mutate({ coinSymbol: symbol, coinName: name, isCustom, sessionId });
    },
    [addMutation, sessionId]
  );

  const removeCoin = useCallback(
    (symbol: string) => {
      removeMutation.mutate({ coinSymbol: symbol, sessionId });
    },
    [removeMutation, sessionId]
  );

  const hasCoin = useCallback(
    (symbol: string) => coins.some((c) => c.coinSymbol === symbol.toUpperCase()),
    [coins]
  );

  // Initialize with default coins on first load (only once)
  const initialized = sessionId ? localStorage.getItem(`${SESSION_KEY}_init`) : null;
  useEffect(() => {
    if (!isLoading && coins.length === 0 && !initialized) {
      localStorage.setItem(`${SESSION_KEY}_init`, "1");
      const defaults = ["BTC", "ETH", "SOL"];
      defaults.forEach((sym) => {
        const preset = PRESET_COINS.find((p) => p.symbol === sym);
        if (preset) {
          addMutation.mutate({ coinSymbol: preset.symbol, coinName: preset.name, isCustom: false, sessionId });
        }
      });
    }
  }, [isLoading]);

  return {
    coins: coins as UserCoin[],
    sessionId,
    isLoading,
    addCoin,
    removeCoin,
    hasCoin,
  };
}
