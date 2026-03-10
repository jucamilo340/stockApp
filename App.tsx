import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Auth0Provider } from 'react-native-auth0';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from '@store/store';
import { NotificationService } from '@notifications/NotificationService';
import RootNavigator from '@navigation/Rootnavigator';

const AUTH0_DOMAIN = 'dev-q3iovmz1jr2qmt06.us.auth0.com';
const AUTH0_CLIENT_ID = 'filib1L8ceL5xDOZWNDrULas7rvDjcWv';

NotificationService.onBackgroundMessage();

export default function App() {
  useEffect(() => {
    NotificationService.init().catch(console.error);
  }, []);

  

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
            <RootNavigator />
          </Auth0Provider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
