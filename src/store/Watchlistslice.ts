import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WatchlistState } from '@models/stock';

const HISTORY_WINDOW_MS = 3 * 60 * 1000;
const HISTORY_BUCKET_MS = 10 * 1000;
const MAX_HISTORY_POINTS = HISTORY_WINDOW_MS / HISTORY_BUCKET_MS + 1;
export const DEFAULT_WATCHLIST_SYMBOLS = [ 'BINANCE:USDCSOL', 'BINANCE:ETHUSDT', 'BINANCE:BTCUSDT','AAPL', 'NVDA',];

const initialState: WatchlistState = {
  symbols: [],
  prices: {},
  previousPrices: {},
  history: {},
  names: {},
  hasSeededDefaults: false,
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    seedDefaultSymbols: (state) => {
      DEFAULT_WATCHLIST_SYMBOLS.forEach((symbol) => {
        if (!state.symbols.includes(symbol)) {
          state.symbols.push(symbol);
        }
        if (!state.history[symbol]) {
          state.history[symbol] = [];
        }
      });
      state.hasSeededDefaults = true;
    },
    addSymbol: (state, action: PayloadAction<string>) => {
      const symbol = action.payload.trim().toUpperCase();
      if (!state.symbols.includes(symbol)) {
        state.symbols.push(symbol);
        state.history[symbol] = [];
      }
    },
    removeSymbol: (state, action: PayloadAction<string>) => {
      const symbol = action.payload;
      state.symbols = state.symbols.filter((s) => s !== symbol);
      delete state.prices[symbol];
      delete state.previousPrices[symbol];
      delete state.history[symbol];
      delete state.names[symbol];
    },
    setSymbolName: (
      state,
      action: PayloadAction<{ symbol: string; name: string }>
    ) => {
      const symbol = action.payload.symbol.trim().toUpperCase();
      const name = action.payload.name.trim();
      if (!symbol || !name) return;
      state.names[symbol] = name;
    },
    updateStockPrice: (
      state,
      action: PayloadAction<{ symbol: string; price: number }>
    ) => {
      const symbol = action.payload.symbol.trim().toUpperCase();
      const { price } = action.payload;
      const bucketTime =
        Math.floor(Date.now() / HISTORY_BUCKET_MS) * HISTORY_BUCKET_MS;
      const minTime = bucketTime - HISTORY_WINDOW_MS;

      if (!symbol || !Number.isFinite(price)) return;
      if (state.prices[symbol] === price) return;

      if (state.prices[symbol] !== undefined) {
        state.previousPrices[symbol] = state.prices[symbol];
      }

      state.prices[symbol] = price;

      if (!state.history[symbol]) {
        state.history[symbol] = [];
      }

      const symbolHistory = state.history[symbol];
      const lastPoint = symbolHistory[symbolHistory.length - 1];

      if (lastPoint?.time === bucketTime) {
        lastPoint.price = price;
      } else {
        symbolHistory.push({ time: bucketTime, price });
      }

      while (symbolHistory.length > 0 && symbolHistory[0].time < minTime) {
        symbolHistory.shift();
      }

      while (symbolHistory.length > MAX_HISTORY_POINTS) {
        symbolHistory.shift();
      }
    },
  },
});

export const {
  addSymbol,
  removeSymbol,
  seedDefaultSymbols,
  setSymbolName,
  updateStockPrice,
} =
  watchlistSlice.actions;
export default watchlistSlice.reducer;
