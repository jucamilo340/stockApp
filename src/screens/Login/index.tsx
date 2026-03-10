import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@auth/useAuth';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>📈</Text>
          <Text style={styles.title}>StockTracker</Text>
          <Text style={styles.subtitle}>Real-time market data at your fingertips</Text>
        </View>

        <View style={styles.features}>
          {['Live price tracking', 'Custom price alerts', 'Portfolio charts'].map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={login}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Sign in with Auth0</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Secure authentication powered by Auth0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    marginBottom: 48,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  featureDot: {
    color: '#00C805',
    fontSize: 18,
    marginRight: 12,
  },
  featureText: {
    color: '#CCC',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#00C805',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disclaimer: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
  },
});