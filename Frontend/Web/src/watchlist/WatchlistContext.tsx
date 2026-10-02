import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useCurrentUser } from "../auth/auth";
import { watchlistApi } from "../api/watchlistApi";

interface WatchlistContextValue {
  isSaved: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    let ignore = false;
    watchlistApi
      .list()
      .then((items) => !ignore && setSavedIds(new Set(items.map((item) => item.productId))))
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [user]);

  const isSaved = useCallback((productId: number) => savedIds.has(productId), [savedIds]);

  // Optimistic: flips immediately, reverts if the request fails.
  const toggle = useCallback(async (productId: number) => {
    const wasSaved = savedIds.has(productId);
    setSavedIds((current) => {
      const next = new Set(current);
      if (wasSaved) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      if (wasSaved) await watchlistApi.remove(productId);
      else await watchlistApi.add(productId);
    } catch {
      setSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds]);

  return <WatchlistContext.Provider value={{ isSaved, toggle }}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error("useWatchlist must be used within a WatchlistProvider");
  return context;
}
