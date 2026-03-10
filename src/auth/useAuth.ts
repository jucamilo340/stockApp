import { useState, useCallback } from 'react';
import { useAuth0 } from 'react-native-auth0';

const AUTH0_CUSTOM_SCHEME =  'stockapp';

export interface AuthUser {
  name: string;
  email: string;
  picture?: string;
  sub: string;
}

export function useAuth() {
  const { authorize, clearSession, user, isLoading, error } = useAuth0();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const login = useCallback(async () => {
    try {
      setIsAuthLoading(true);
      await authorize(
        { scope: 'openid profile email' },
        { customScheme: AUTH0_CUSTOM_SCHEME }
      );
    } catch (e) {
      console.error('[Auth] Login error:', e);
    } finally {
      setIsAuthLoading(false);
    }
  }, [authorize]);

  const logout = useCallback(async () => {
    try {
      setIsAuthLoading(true);
      await clearSession({}, { customScheme: AUTH0_CUSTOM_SCHEME });
    } catch (e) {
      console.error('[Auth] Logout error:', e);
    } finally {
      setIsAuthLoading(false);
    }
  }, [clearSession]);

  const mappedUser: AuthUser | null = user
    ? {
        name: user.name ?? 'User',
        email: user.email ?? '',
        picture: user.picture,
        sub: user.sub ?? '',
      }
    : null;

  return {
    user: mappedUser,
    isLoading: isLoading || isAuthLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
