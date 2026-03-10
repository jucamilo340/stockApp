import { useEffect } from 'react';
import { finnhubApi } from '@api/Finnhub';
import { updateStockPrice } from '@store/Watchlistslice';
import { useAppDispatch } from '@store/store';

export function useSymbolQuotes(symbols: string[]): void {
  const dispatch = useAppDispatch();
  const symbolsKey = symbols.join('|');

  useEffect(() => {
    if (symbols.length === 0) return;

    let cancelled = false;

    symbols.forEach(async (symbol) => {
      try {
        const quote = await finnhubApi.getQuote(symbol);

        if (!cancelled && quote?.c && quote.c > 0) {
          dispatch(updateStockPrice({ symbol, price: quote.c }));
        }
      } catch (err) {
        console.warn(`[useSymbolQuotes] Could not fetch quote for ${symbol}:`, err);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, symbolsKey]);
}
