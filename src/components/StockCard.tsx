import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSelector } from '@store/store';
import { formatCurrency, formatPercent, calcPercentChange } from '@utils/formatters';

interface StockCardProps {
  symbol: string;
  onPress?: () => void;
}

const StockCard = memo(({ symbol, onPress }: StockCardProps) => {
  const price = useAppSelector((state) => state.watchlist.prices[symbol]);
  const previousPrice = useAppSelector((state) => state.watchlist.previousPrices[symbol]);
  const name = useAppSelector((state) => state.watchlist.names[symbol] ?? symbol);

  const percentChange =
    price && previousPrice ? calcPercentChange(price, previousPrice) : 0;

  const isPositive = percentChange >= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.left}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>
          {price ? formatCurrency(price) : '—'}
        </Text>
        <View style={[styles.badge, isPositive ? styles.badgeGreen : styles.badgeRed]}>
          <Text style={[styles.badgeText, { color: isPositive ? '#00C805' : '#FF453A' }]}>
            {formatPercent(percentChange)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

StockCard.displayName = 'StockCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  symbol: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  price: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    marginTop: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeGreen: {
    backgroundColor: '#0D2B1A',
  },
  badgeRed: {
    backgroundColor: '#2B0D0D',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StockCard;
