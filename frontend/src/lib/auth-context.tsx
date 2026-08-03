// ============================================
// Solo IA — Auth Context & Provider
// ============================================

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import soloIA from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      if (!soloIA.isAuthenticated) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await soloIA.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
      soloIA.setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await soloIA.login(email, password);
    setUser(data.user);
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await soloIA.register(email, password, name);
    soloIA.setToken(data.token);
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    soloIA.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}