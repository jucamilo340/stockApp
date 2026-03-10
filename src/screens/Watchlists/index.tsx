import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '@store/store';
import { seedDefaultSymbols } from '@store/Watchlistslice';
import StockCard from '@components/StockCard';
import SymbolSourceDropdown from '@components/SymbolSourceDropdown';
import { useSymbolQuotes } from '@hooks/useSymbolQuotes';
import { getSymbolsForSource, SymbolSource } from '@utils/symbolSources';

export default function WatchlistScreen() {
  const alerts = useAppSelector((state) => state.alerts.list);
  const hasSeededDefaults = useAppSelector(
    (state) => state.watchlist.hasSeededDefaults
  );
  const dispatch = useAppDispatch();
  const [source, setSource] = useState<SymbolSource>('popular');

  const symbols = getSymbolsForSource(source, alerts);

  useSymbolQuotes(symbols);

  useEffect(() => {
    if (!hasSeededDefaults) {
      dispatch(seedDefaultSymbols());
    }
  }, [dispatch, hasSeededDefaults]);

  const emptyTitle =
    source === 'popular' ? 'No popular stocks available' : 'No alert stocks yet';
  const emptySubtitle =
    source === 'popular'
      ? 'The default popular symbols could not be loaded'
      : 'Create an alert to see your tracked symbols here';

  if (symbols.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Watchlist</Text>
            <Text style={styles.headerCount}>0 stocks</Text>
          </View>
          <SymbolSourceDropdown value={source} onChange={setSource} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>WL</Text>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Watchlist</Text>
          <Text style={styles.headerCount}>{symbols.length} stocks</Text>
        </View>
        <SymbolSourceDropdown value={source} onChange={setSource} />
      </View>
      <FlatList
        data={symbols}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <StockCard symbol={item} />}
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
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
    zIndex: 20,
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
    marginTop: 2,
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
    color: '#00C805',
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
