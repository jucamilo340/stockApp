import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface PriceAlertParams {
  symbol: string;
  currentPrice: number;
  targetPrice: number;
}

export const NotificationService = {

  async init(): Promise<string | null> {
    console.log('aquii')
    if (!Device.isDevice) {
      console.warn('[Notifications] Push notifications require a physical device.');
      return null;
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('[Notifications] Permission denied');
      return null;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[Notifications] Expo permission denied');
      return null;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('stock-alerts', {
        name: 'Stock Price Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00C805',
      });
    }

    const fcmToken = await messaging().getToken();
    console.log('[Notifications] FCM Token:', fcmToken);
    return fcmToken;
  },
  async sendPriceAlert({ symbol, currentPrice, targetPrice }: PriceAlertParams): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📈 ${symbol} hit your target!`,
        body: `Current: $${currentPrice.toFixed(2)} | Target: $${targetPrice.toFixed(2)}`,
        data: { symbol, currentPrice, targetPrice },
        sound: true,
      },
      trigger: null,
    });
  },

  onBackgroundMessage(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('[Notifications] Background message:', remoteMessage);
    });
  },
  onForegroundMessage(callback: (message: any) => void): () => void {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      callback(remoteMessage);
    });
    return unsubscribe;
  },
};
