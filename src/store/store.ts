import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import watchlistReducer from '@store/Watchlistslice';
import alertsReducer from '@store/alertsSlice';
import { RootState } from '@models/stock';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['watchlist', 'alerts'],
};

const watchlistPersistConfig = {
  key: 'watchlist',
  storage: AsyncStorage,
  whitelist: ['symbols', 'names', 'hasSeededDefaults'],
};

const rootReducer = combineReducers({
  watchlist: persistReducer(watchlistPersistConfig, watchlistReducer),
  alerts: alertsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Typed hooks
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
