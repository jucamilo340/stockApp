import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import { useAppSelector } from '@store/store';
import SymbolSourceDropdown from '@components/SymbolSourceDropdown';
import { useSymbolQuotes } from '@hooks/useSymbolQuotes';
import { getSymbolsForSource, SymbolSource } from '@utils/symbolSources';
import { formatCurrency, formatTime } from '@utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LINE_COLORS = [
  '#00C805',
  '#007AFF',
  '#FF9F0A',
  '#FF453A',
  '#BF5AF2',
  '#32D74B',
  '#5AC8FA',
  '#FF375F',
];
const CHART_WINDOW_MS = 3 * 60 * 1000;
const CHART_INTERVAL_MS = 10 * 1000;

function LegendList({ symbols, colors }: { symbols: string[]; colors: string[] }) {
  const prices = useAppSelector((state) => state.watchlist.prices);

  return (
    <>
      {symbols.map((symbol, index) => (
        <View key={symbol} style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors[index % colors.length] },
            ]}
          />
          <Text style={styles.legendSymbol}>{symbol}</Text>
          <Text style={styles.legendPrice}>
            {prices[symbol] ? formatCurrency(prices[symbol]) : '--'}
          </Text>
        </View>
      ))}
    </>
  );
}

export default function ChartScreen() {
  const alerts = useAppSelector((state) => state.alerts.list);
  const history = useAppSelector((state) => state.watchlist.history);

  const [source, setSource] = useState<SymbolSource>('popular');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const symbols = getSymbolsForSource(source, alerts);
  const symbolsKey = symbols.join('|');

  useSymbolQuotes(symbols);

  useEffect(() => {
    setSelectedSymbol((current) => {
      if (symbols.length === 0) {
        return null;
      }

      return current && symbols.includes(current) ? current : symbols[0];
    });
  }, [symbolsKey]);

  const selectedSymbolIndex = selectedSymbol ? symbols.indexOf(selectedSymbol) : -1;
  const selectedColor =
    selectedSymbolIndex >= 0
      ? LINE_COLORS[selectedSymbolIndex % LINE_COLORS.length]
      : LINE_COLORS[0];

  const allPrices = selectedSymbol
    ? (history[selectedSymbol] ?? []).map((point) => point.price)
    : [];
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 1;
  const yTickFormat = (tick: number) => {
    if (maxPrice < 0.01) return `$${tick.toFixed(6)}`;
    if (maxPrice < 1) return `$${tick.toFixed(4)}`;
    if (maxPrice < 100) return `$${tick.toFixed(2)}`;
    return `$${tick.toFixed(0)}`;
  };

  const selectedHistory = selectedSymbol ? history[selectedSymbol] ?? [] : [];
  const latestPointTime = selectedHistory[selectedHistory.length - 1]?.time ?? 0;
  const alignedNow =
    Math.floor(Date.now() / CHART_INTERVAL_MS) * CHART_INTERVAL_MS;
  const chartEndTime = Math.max(alignedNow, latestPointTime);
  const chartStartTime = chartEndTime - CHART_WINDOW_MS;
  const xTickValues = Array.from(
    { length: CHART_WINDOW_MS / CHART_INTERVAL_MS + 1 },
    (_, index) => chartStartTime + index * CHART_INTERVAL_MS
  );

  const chartData =
    selectedSymbol == null
      ? []
      : selectedHistory
          .filter((point) => point.time >= chartStartTime && point.time <= chartEndTime)
          .map((point) => ({
            x: point.time,
            y: point.price,
          }));

  if (symbols.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Chart</Text>
            <Text style={styles.headerSubtitle}>Live USD Value</Text>
          </View>
          <SymbolSourceDropdown value={source} onChange={setSource} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>CH</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            {source === 'popular'
              ? 'Popular symbols will appear here as soon as quotes arrive'
              : 'Create an alert to plot your alert symbols here'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chart</Text>
          <Text style={styles.headerSubtitle}>Live USD Value</Text>
        </View>
        <SymbolSourceDropdown value={source} onChange={setSource} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toggleRow}
        >
          {symbols.map((symbol, index) => {
            const isActive = selectedSymbol === symbol;
            const color = LINE_COLORS[index % LINE_COLORS.length];
            return (
              <TouchableOpacity
                key={symbol}
                style={[
                  styles.toggleChip,
                  { borderColor: color },
                  isActive && { backgroundColor: `${color}22` },
                ]}
                onPress={() => setSelectedSymbol(symbol)}
              >
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: isActive ? color : '#444' },
                  ]}
                />
                <Text style={[styles.chipText, { color: isActive ? color : '#555' }]}>
                  {symbol}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {chartData.length > 1 ? (
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
                tickFormat={(tick) => formatTime(tick)}
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
              <VictoryLine
                data={chartData}
                style={{ data: { stroke: selectedColor, strokeWidth: 2 } }}
                interpolation="monotoneX"
              />
            </VictoryChart>
          </View>
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>
              Waiting for price data...{'\n'}Keep the app open for prices to
              populate
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
