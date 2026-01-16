import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import api, { setAuthToken } from '@/services/api-client';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  dailyExpenseTarget?: number;
  dailyIncomeTarget?: number;
  monthlyExpenseBudget?: number;
  monthlyIncomeGoal?: number;
  profileImage?: string | null;
};

export type AuthContextState = {
  user: AuthUser | null;
  token: string | null;
  status: 'loading' | 'ready';
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateTargets: (targets: {
    dailyExpenseTarget?: number;
    dailyIncomeTarget?: number;
    monthlyExpenseBudget?: number;
    monthlyIncomeGoal?: number;
  }) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; profileImage?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule token refresh (refresh 1 minute before expiry)
  const scheduleTokenRefresh = (expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Refresh 1 minute before expiry (or at minimum 30 seconds)
    const refreshTime = Math.max((expiresIn - 60) * 1000, 30000);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        await refreshAccessToken();
      } catch (err) {
        console.error('Auto token refresh failed:', err);
      }
    }, refreshTime);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (storedToken) {
          setAuthToken(storedToken);
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          
          try {
            await fetchProfile();
            // Schedule refresh (assume 15 min token, refresh in 14 min)
            scheduleTokenRefresh(14 * 60);
          } catch (err: any) {
            // Token might be expired, try to refresh
            if (storedRefreshToken && err.response?.status === 401) {
              const refreshed = await refreshAccessToken();
              if (!refreshed) {
                await clearSession();
              }
            } else {
              await clearSession();
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore session', err);
      } finally {
        setStatus('ready');
      }
    };

    bootstrap();
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const fetchProfile = async () => {
    const res = await api.get<AuthUser>('/auth/me');
    setUser(res.data);
  };

  const clearSession = async () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setAuthToken(null);
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };

  const persistSession = async (accessToken: string, refreshTkn: string, nextUser: AuthUser, expiresIn?: number) => {
    setAuthToken(accessToken);
    setToken(accessToken);
    setRefreshToken(refreshTkn);
    setUser(nextUser);
    await AsyncStorage.multiSet([
      ['auth_token', accessToken],
      ['refresh_token', refreshTkn],
    ]);
    
    // Schedule token refresh
    if (expiresIn) {
      scheduleTokenRefresh(expiresIn);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    await persistSession(
      res.data.accessToken || res.data.token,
      res.data.refreshToken,
      {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        isVerified: res.data.isVerified,
        dailyExpenseTarget: res.data.dailyExpenseTarget,
        dailyIncomeTarget: res.data.dailyIncomeTarget,
        monthlyExpenseBudget: res.data.monthlyExpenseBudget,
        monthlyIncomeGoal: res.data.monthlyIncomeGoal,
        profileImage: res.data.profileImage,
      },
      res.data.expiresIn
    );
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    await persistSession(
      res.data.accessToken || res.data.token,
      res.data.refreshToken,
      {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        isVerified: res.data.isVerified,
        dailyExpenseTarget: res.data.dailyExpenseTarget,
        dailyIncomeTarget: res.data.dailyIncomeTarget,
        monthlyExpenseBudget: res.data.monthlyExpenseBudget,
        monthlyIncomeGoal: res.data.monthlyIncomeGoal,
        profileImage: res.data.profileImage,
      },
      res.data.expiresIn
    );
  };

  const logout = async () => {
    try {
      // Notify server to invalidate refresh token
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      // Ignore errors during logout
    }
    await clearSession();
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (!storedRefreshToken) return false;

      const res = await api.post('/auth/refresh-token', { 
        refreshToken: storedRefreshToken 
      });
      
      const newAccessToken = res.data.accessToken;
      setAuthToken(newAccessToken);
      setToken(newAccessToken);
      await AsyncStorage.setItem('auth_token', newAccessToken);
      
      // Schedule next refresh
      if (res.data.expiresIn) {
        scheduleTokenRefresh(res.data.expiresIn);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      await clearSession();
      return false;
    }
  };

  const updateTargets = async (targets: {
    dailyExpenseTarget?: number;
    dailyIncomeTarget?: number;
    monthlyExpenseBudget?: number;
    monthlyIncomeGoal?: number;
  }) => {
    const res = await api.put('/auth/targets', targets);
    setUser(res.data);
  };

  const updateProfile = async (data: { name?: string; email?: string; profileImage?: string }) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data);
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  const value = useMemo(
    () => ({ user, token, status, login, register, logout, updateTargets, updateProfile, refreshUser, refreshAccessToken }),
    [user, token, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
