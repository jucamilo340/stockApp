import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@store/store';
import { addAlert, removeAlert } from '@store/alertsSlice';
import { addSymbol, updateStockPrice } from '@store/Watchlistslice';
import { finnhubApi, SymbolSearchResult } from '@api/Finnhub';

type StockOption = { label: string; value: string };


const alertSchema = z.object({
  symbol: z.string(),
  targetPrice: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Enter a valid price greater than 0',
    }),
});

type AlertFormData = z.infer<typeof alertSchema>;

export default function AddAlertScreen() {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector((state) => state.alerts.list);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: { symbol: '', targetPrice: '' },
  });

  const selectedSymbol = watch('symbol');

  // Debounced search — calls Finnhub after 400ms of no typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    // If nothing typed show defaults
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results: SymbolSearchResult[] = await finnhubApi.searchSymbol(trimmed);
        const options = results
          .filter((r) => r.symbol && r.description)
          .slice(0, 10)
          .map((r) => ({
            label: r.description,
            value: r.symbol,
          }));
        setSuggestions(options.length > 0 ? options : []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (option: StockOption) => {
    setValue('symbol', option.value, { shouldValidate: true });
    setQuery(`${option.label} (${option.value})`);
    setShowSuggestions(false);
  };

  const handleRemoveAlert = (alertId: string, symbol: string) => {
    Alert.alert(
      'Delete alert',
      `Remove the alert for ${symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeAlert(alertId)),
        },
      ]
    );
  };

  const onSubmit = async (data: AlertFormData) => {
    const price = parseFloat(data.targetPrice);
    const symbol = data.symbol.trim().toUpperCase();

    dispatch(addSymbol(symbol));

    try {
      const quote = await finnhubApi.getQuote(symbol);
      if (quote?.c && quote.c > 0) {
        dispatch(updateStockPrice({ symbol, price: quote.c }));
      }
    } catch {}

    dispatch(addAlert({ symbol, targetPrice: price }));

    Alert.alert(
      '✅ Alert Created',
      `You'll be notified when ${symbol} reaches $${price.toFixed(2)}`,
      [{
        text: 'OK',
        onPress: () => {
          reset();
          setQuery('');
          setSuggestions([]);
        },
      }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Add Alert</Text>
          <Text style={styles.subtitle}>
            Get notified when a stock hits your target price
          </Text>

          {/* Field 1 — Stock search input + dropdown suggestions */}
          <Text style={styles.label}>Stock</Text>
          <View style={styles.autocompleteWrapper}>
            <View style={[styles.inputRow, errors.symbol && styles.fieldError]}>
              <TextInput
                style={styles.stockInput}
                placeholder="Search ticker or company..."
                placeholderTextColor="#444"
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setValue('symbol', '', { shouldValidate: false });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#00C805" style={styles.spinner} />
              )}
              {!!selectedSymbol && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{selectedSymbol}</Text>
                </View>
              )}
            </View>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <View style={styles.suggestions}>
                {suggestions.map((item, index) => (
                  <React.Fragment key={item.value}>
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionSymbol}>{item.value}</Text>
                      <Text style={styles.suggestionLabel} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                    {index < suggestions.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
          {errors.symbol && (
            <Text style={styles.errorText}>{errors.symbol.message}</Text>
          )}

          {/* Field 2 — Price alert */}
          <Text style={styles.label}>Price Alert (USD)</Text>
          <Controller
            name="targetPrice"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.priceInput, errors.targetPrice && styles.fieldError]}
                placeholder="e.g. 180.00"
                placeholderTextColor="#444"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.targetPrice && (
            <Text style={styles.errorText}>{errors.targetPrice.message}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Create Alert</Text>
          </TouchableOpacity>

          {alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <Text style={styles.alertsTitle}>Active Alerts ({alerts.length})</Text>
              {alerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.alertItem}
                  activeOpacity={0.8}
                  onPress={() => handleRemoveAlert(alert.id, alert.symbol)}
                >
                  <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                  <Text style={styles.alertPrice}>${alert.targetPrice.toFixed(2)}</Text>
                  {alert.triggered && (
                    <Text style={styles.alertTriggered}>✓ Triggered</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14' },
  scroll: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 32, lineHeight: 20 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  autocompleteWrapper: {
    zIndex: 999,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderColor: '#2E2E3E',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  stockInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    paddingVertical: 12,
  },
  spinner: { marginLeft: 8 },
  selectedBadge: {
    backgroundColor: '#00C80522',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  selectedBadgeText: {
    color: '#00C805',
    fontWeight: '700',
    fontSize: 12,
  },
  suggestions: {
    backgroundColor: '#1E1E2E',
    borderColor: '#2E2E3E',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 220,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionSymbol: {
    color: '#00C805',
    fontWeight: '700',
    fontSize: 14,
    width: 64,
  },
  suggestionLabel: {
    color: '#AAA',
    fontSize: 13,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#2E2E3E',
    marginHorizontal: 16,
  },
  priceInput: {
    backgroundColor: '#1E1E2E',
    borderColor: '#2E2E3E',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 4,
  },
  fieldError: { borderColor: '#FF453A' },
  errorText: { color: '#FF453A', fontSize: 12, marginTop: 4, marginBottom: 8 },
  button: {
    backgroundColor: '#00C805',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  alertsSection: { marginTop: 40 },
  alertsTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  alertSymbol: { color: '#FFF', fontWeight: '700', fontSize: 15, flex: 1 },
  alertPrice: { color: '#00C805', fontWeight: '600', fontSize: 15 },
  alertTriggered: { color: '#888', fontSize: 12, marginLeft: 12 },
});
