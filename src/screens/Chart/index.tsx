import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import { useAppSelector } from '@store/store';
import { formatCurrency, formatTime } from '@utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LINE_COLORS = ['#00C805', '#007AFF', '#FF9F0A', '#FF453A', '#BF5AF2', '#32D74B', '#5AC8FA', '#FF375F'];
const CHART_WINDOW_MS = 3 * 60 * 1000;
const CHART_INTERVAL_MS = 10 * 1000;

// ─── Bug 1: Hook called inside map() — extracted into its own component ───────
function LegendList({ symbols, colors }: { symbols: string[]; colors: string[] }) {
  const prices = useAppSelector((state) => state.watchlist.prices);

  return (
    <>
      {symbols.map((symbol, index) => (
        <View key={symbol} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors[index % colors.length] }]} />
          <Text style={styles.legendSymbol}>{symbol}</Text>
          <Text style={styles.legendPrice}>
            {prices[symbol] ? formatCurrency(prices[symbol]) : '—'}
          </Text>
        </View>
      ))}
    </>
  );
}

export default function ChartScreen() {
  const symbols = useAppSelector((state) => state.watchlist.symbols);
  const history = useAppSelector((state) => state.watchlist.history);

  const [hiddenSymbols, setHiddenSymbols] = useState<Set<string>>(new Set());

  const toggleSymbol = (symbol: string) => {
    setHiddenSymbols((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  };

  const allPrices = symbols.flatMap((s) => (history[s] ?? []).map((p) => p.price));
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 1;
  const yTickFormat = (t: number) => {
    if (maxPrice < 0.01) return `$${t.toFixed(6)}`;
    if (maxPrice < 1)    return `$${t.toFixed(4)}`;
    if (maxPrice < 100)  return `$${t.toFixed(2)}`;
    return `$${t.toFixed(0)}`;
  };

  const latestPointTime = symbols.reduce((latest, symbol) => {
    const symbolHistory = history[symbol] ?? [];
    const lastPoint = symbolHistory[symbolHistory.length - 1];
    return lastPoint ? Math.max(latest, lastPoint.time) : latest;
  }, 0);
  const alignedNow = Math.floor(Date.now() / CHART_INTERVAL_MS) * CHART_INTERVAL_MS;
  const chartEndTime = Math.max(alignedNow, latestPointTime);
  const chartStartTime = chartEndTime - CHART_WINDOW_MS;
  const xTickValues = Array.from(
    { length: CHART_WINDOW_MS / CHART_INTERVAL_MS + 1 },
    (_, index) => chartStartTime + index * CHART_INTERVAL_MS
  );

  const chartData = symbols
    .filter((s) => !hiddenSymbols.has(s) && (history[s]?.length ?? 0) > 1)
    .map((symbol, index) => ({
      symbol,
      color: LINE_COLORS[index % LINE_COLORS.length],
      data: (history[symbol] ?? [])
        .filter((point) => point.time >= chartStartTime && point.time <= chartEndTime)
        .map((point) => ({
          x: point.time,
          y: point.price,
        })),
    }))
    .filter(({ data }) => data.length > 1);

  if (symbols.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chart</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📉</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Add stocks to your watchlist to see them plotted here in real time
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chart</Text>
        <Text style={styles.headerSubtitle}>Live USD Value</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toggleRow}
        >
          {symbols.map((symbol, index) => {
            const isActive = !hiddenSymbols.has(symbol);
            const color = LINE_COLORS[index % LINE_COLORS.length];
            return (
              <TouchableOpacity
                key={symbol}
                style={[
                  styles.toggleChip,
                  { borderColor: color },
                  isActive && { backgroundColor: color + '22' },
                ]}
                onPress={() => toggleSymbol(symbol)}
              >
                <View style={[styles.chipDot, { backgroundColor: isActive ? color : '#444' }]} />
                <Text style={[styles.chipText, { color: isActive ? color : '#555' }]}>
                  {symbol}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <VictoryChart
              width={SCREEN_WIDTH - 24}
              height={340}
              theme={VictoryTheme.material}
              padding={{ top: 20, bottom: 50, left: 80, right: 20 }}
              domain={{ x: [chartStartTime, chartEndTime] }}
            >
              <VictoryAxis
                fixLabelOverlap
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#555', fontSize: 9 },
                  grid: { stroke: 'transparent' },
                }}
                tickValues={xTickValues}
                tickFormat={(t) => formatTime(t)}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#555', fontSize: 9 },
                  grid: { stroke: '#1E1E2E' },
                }}
                tickFormat={yTickFormat}
              />
              {chartData.map(({ symbol, color, data }) => (
                <VictoryLine
                  key={symbol}
                  data={data}
                  style={{ data: { stroke: color, strokeWidth: 2 } }}
                  interpolation="monotoneX"
                />
              ))}
            </VictoryChart>
          </View>
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>
              Waiting for price data...{'\n'}Keep the app open for prices to populate
            </Text>
          </View>
        )}

        <View style={styles.legendContainer}>
          <LegendList symbols={symbols} colors={LINE_COLORS} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  toggleRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: 12,
    backgroundColor: '#111120',
    borderRadius: 16,
    paddingTop: 8,
    overflow: 'hidden',
  },
  noData: {
    margin: 16,
    backgroundColor: '#111120',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  legendContainer: {
    margin: 16,
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    padding: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  legendSymbol: {
    flex: 1,
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  legendPrice: {
    color: '#888',
    fontSize: 14,
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
