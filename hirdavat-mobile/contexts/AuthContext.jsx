import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import { fetchMe, login as loginRequest } from '../api/auth';
import { setSessionExpiredHandler, tokenStorage } from '../api/axiosClient';

export const AuthContext = createContext(null);

function isTokenValid(token) {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));

    const bootstrap = async () => {
      const access = await tokenStorage.getAccess();
      const refresh = await tokenStorage.getRefresh();
      if (isTokenValid(access) || refresh) {
        try {
          const me = await fetchMe();
          setUser(me);
        } catch {
          await tokenStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    await tokenStorage.setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, logout, setUser }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
