import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '@store/store';
import {
  removeSymbol,
  seedDefaultSymbols,
  updateStockPrice,
} from '@store/Watchlistslice';
import { finnhubApi } from '@api/Finnhub';
import StockCard from '@components/StockCard';

export default function WatchlistScreen() {
  const symbols = useAppSelector((state) => state.watchlist.symbols);
  const hasSeededDefaults = useAppSelector(
    (state) => state.watchlist.hasSeededDefaults
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (symbols.length === 0 && !hasSeededDefaults) {
      dispatch(seedDefaultSymbols());
    }
  }, [dispatch, hasSeededDefaults, symbols.length]);

  useEffect(() => {
    if (symbols.length === 0) return;

    symbols.forEach(async (symbol) => {
      try {
        const quote = await finnhubApi.getQuote(symbol);
        if (quote?.c && quote.c > 0) {
          dispatch(updateStockPrice({ symbol, price: quote.c }));
        }
      } catch (err) {
        console.warn(`[WatchlistScreen] Could not fetch quote for ${symbol}:`, err);
      }
    });
  }, [symbols, dispatch]);

  const handleRemove = (symbol: string) => {
    Alert.alert(
      'Remove Stock',
      `Remove ${symbol} from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeSymbol(symbol)),
        },
      ]
    );
  };

  if (symbols.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Watchlist</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No stocks yet</Text>
          <Text style={styles.emptySubtitle}>
            Go to "Add Alert" to start tracking stocks
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watchlist</Text>
        <Text style={styles.headerCount}>{symbols.length} stocks</Text>
      </View>
      <FlatList
        data={symbols}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <StockCard
            symbol={item}
            onPress={() => handleRemove(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: 14,
    color: '#555',
  },
  list: {
    paddingVertical: 12,
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
});
