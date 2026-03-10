import { useEffect } from 'react';
import { finnhubSocket } from '@api/websocket';
import { updateStockPrice } from '@store/Watchlistslice';
import { useAppDispatch, useAppSelector } from '@store/store';

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
 * Subscribes to real-time updates for all watchlist symbols at once.
 */
export function useWatchlistSocket(): void {
  const dispatch = useAppDispatch();
  const symbols = useAppSelector((state) => state.watchlist.symbols);

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
  }, [symbols, dispatch]);
}
