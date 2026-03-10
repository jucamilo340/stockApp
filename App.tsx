import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Auth0Provider } from 'react-native-auth0';
import { store, persistor } from '@store/store';
import { NotificationService } from '@notifications/NotificationService';
import RootNavigator from '@navigation/Rootnavigator';
import * as AuthSession from 'expo-auth-session';

const AUTH0_DOMAIN = 'dev-q3iovmz1jr2qmt06.us.auth0.com';
const AUTH0_CLIENT_ID = 'filib1L8ceL5xDOZWNDrULas7rvDjcWv';

NotificationService.onBackgroundMessage();

export default function App() {
  useEffect(() => {
    NotificationService.init().catch(console.error);
    console.log("COPY THIS TO AUTH0 DASHBOARD:");
  }, []);

  const redirectUri = AuthSession.makeRedirectUri();

// Log this and look at your terminal/flipper/debugger
console.log("COPY THIS TO AUTH0 DASHBOARD:", redirectUri);
  

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
          <RootNavigator />
        </Auth0Provider>
      </PersistGate>
    </Provider>
  );
}
