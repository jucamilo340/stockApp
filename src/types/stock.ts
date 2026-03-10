export interface Stock {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  percentChange: number;
}

export interface PricePoint {
  time: number;
  price: number;
}

export interface StockHistory {
  [symbol: string]: PricePoint[];
}

export interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  triggered: boolean;
  createdAt: number;
}

export interface WatchlistState {
  symbols: string[];
  prices: Record<string, number>;
  previousPrices: Record<string, number>;
  history: StockHistory;
  names: Record<string, string>;
  hasSeededDefaults: boolean;
}

export interface AlertsState {
  list: Alert[];
}

export interface RootState {
  watchlist: WatchlistState;
  alerts: AlertsState;
}
