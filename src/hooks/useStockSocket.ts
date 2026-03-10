import { useEffect } from 'react';
import { finnhubSocket } from '@api/websocket';
import { updateStockPrice } from '@store/Watchlistslice';
import { useAppDispatch, useAppSelector } from '@store/store';
import { getRealtimeSymbols } from '@utils/symbolSources';

export function useStockSocket(symbol: string): number | null {
  const dispatch = useAppDispatch();
  const price = useAppSelector((state) => state.watchlist.prices[symbol] ?? null);

  useEffect(() => {
    if (!symbol) return;

    const callback = (_sym: string, newPrice: number) => {
      dispatch(updateStockPrice({ symbol, price: newPrice }));
    };

    finnhubSocket.subscribe(symbol, callback);

    return () => {
      finnhubSocket.unsubscribe(symbol, callback);
    };
  }, [symbol, dispatch]);

  return price;
}

/**
 * Subscribes to the symbols needed across watchlist and chart sources.
 */
export function useWatchlistSocket(): void {
  const dispatch = useAppDispatch();
  const watchlistSymbols = useAppSelector((state) => state.watchlist.symbols);
  const alerts = useAppSelector((state) => state.alerts.list);
  const symbols = getRealtimeSymbols(watchlistSymbols, alerts);
  const symbolsKey = symbols.join('|');

  useEffect(() => {
    const callbacks: Record<string, (sym: string, price: number) => void> = {};

    symbols.forEach((symbol) => {
      const callback = (_sym: string, price: number) => {
        dispatch(updateStockPrice({ symbol, price }));
      };
      callbacks[symbol] = callback;
      finnhubSocket.subscribe(symbol, callback);
    });

    return () => {
      symbols.forEach((symbol) => {
        finnhubSocket.unsubscribe(symbol, callbacks[symbol]);
      });
    };
  }, [dispatch, symbolsKey]);
}
