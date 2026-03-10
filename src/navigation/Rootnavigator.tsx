import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@auth/useAuth';
import { useWatchlistSocket } from '@hooks/useStockSocket';
import { useAlertChecker } from '@hooks/useAlerts';
import { FINNHUB_API_KEY } from '@api/Finnhub';
import { finnhubSocket } from '@api/websocket';

import LoginScreen from '@screens/Login';
import WatchlistScreen from '@screens/Watchlists';
import AddAlertScreen from '@screens/AddAlert';
import ChartScreen from '@screens/Chart';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Watchlist: '📊',
    'Add Alert': '🔔',
    Chart: '📈',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {icons[name] ?? '•'}
    </Text>
  );
}

function MainTabs() {
  useEffect(() => {
    finnhubSocket.connect(FINNHUB_API_KEY);

    return () => {
      finnhubSocket.disconnect();
    };
  }, []);

  useWatchlistSocket();
  useAlertChecker();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D1A',
          borderTopColor: '#1E1E2E',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#00C805',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Add Alert" component={AddAlertScreen} />
      <Tab.Screen name="Chart" component={ChartScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00C805" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A14',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
