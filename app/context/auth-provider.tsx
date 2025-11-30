'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useMemo,
} from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';
import { AuthUser } from '../types/auth-user';
import { usePathname } from 'next/navigation';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Stable supabase instance across re-renders
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  async function fetchUserWithRole(supabaseUser: User) {
    try {
      // Fetch user role from database
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      const role = (data?.role as 'user' | 'admin') || 'user';

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role,
      };

      setUser(authUser);
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Default to 'user' role if error
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'user',
      };
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserWithRole(session.user);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserWithRole(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathnameRef.current === pathname) {
      return;
    }
    pathnameRef.current = pathname;

    const timer = setTimeout(() => {
      checkSession();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value: AuthContextValue = {
    user,
    isLoading,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
