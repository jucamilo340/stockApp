import { Alert } from '@models/stock';
import { DEFAULT_WATCHLIST_SYMBOLS } from '@store/Watchlistslice';

export type SymbolSource = 'popular' | 'alerts';

export const SYMBOL_SOURCE_OPTIONS: Array<{
  label: string;
  value: SymbolSource;
}> = [
  { label: 'Populares', value: 'popular' },
  { label: 'Mis alertas', value: 'alerts' },
];

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

const uniqueSymbols = (symbols: string[]) =>
  Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));

export const getAlertSymbols = (alerts: Alert[]) =>
  uniqueSymbols(alerts.map((alert) => alert.symbol));

export const getSymbolsForSource = (
  source: SymbolSource,
  alerts: Alert[]
) => (source === 'popular' ? DEFAULT_WATCHLIST_SYMBOLS : getAlertSymbols(alerts));

export const getRealtimeSymbols = (
  watchlistSymbols: string[],
  alerts: Alert[]
) =>
  uniqueSymbols([
    ...watchlistSymbols,
    ...DEFAULT_WATCHLIST_SYMBOLS,
    ...getAlertSymbols(alerts),
  ]);
