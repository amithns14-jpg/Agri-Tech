import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Api } from '../services/api';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  state?: string;
  district?: string;
  village?: string;
  preferred_language?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      // Check for saved demo or real session
      const savedUser = localStorage.getItem('agroguide_user');
      const token = localStorage.getItem('agroguide_token');

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            localStorage.setItem('agroguide_token', session.access_token);
            // Fetch profile
            try {
              const res: any = await Api.getProfile();
              if (res.data) {
                setUser(res.data);
                localStorage.setItem('agroguide_user', JSON.stringify(res.data));
              } else {
                setUser({
                  id: session.user.id,
                  email: session.user.email || ''
                });
              }
            } catch {
              setUser({
                id: session.user.id,
                email: session.user.email || ''
              });
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[AuthContext] Supabase session retrieval error:', err);
        }
      }

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        // Default to demo farmer for immediate exploration if not logged in
        loginAsDemo();
      }
      setLoading(false);
    }

    initSession();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          localStorage.setItem('agroguide_token', session.access_token);
          try {
            const res: any = await Api.getProfile();
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('agroguide_user', JSON.stringify(res.data));
            }
          } catch {
            setUser({ id: session.user.id, email: session.user.email || '' });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('agroguide_token');
          localStorage.removeItem('agroguide_user');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session) {
        localStorage.setItem('agroguide_token', data.session.access_token);
        const res: any = await Api.getProfile();
        const profile = res.data || { id: data.user.id, email: data.user.email };
        setUser(profile);
        localStorage.setItem('agroguide_user', JSON.stringify(profile));
        return { success: true };
      }
    }

    // Demo / local fallback login
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: email || 'ramesh.patel@farmer.in',
      full_name: 'Ramesh Patel',
      phone: '+91 98765 43210',
      state: 'Karnataka',
      district: 'Dharwad',
      village: 'Navalgund',
      preferred_language: 'en'
    };
    setUser(demoUser);
    localStorage.setItem('agroguide_token', 'demo-token-1234567890');
    localStorage.setItem('agroguide_user', JSON.stringify(demoUser));
    return { success: true };
  };

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
            state: data.state,
            district: data.district,
            preferred_language: data.preferred_language || 'en'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData.session) {
        localStorage.setItem('agroguide_token', authData.session.access_token);
        const newUser: User = {
          id: authData.user!.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          state: data.state,
          district: data.district,
          preferred_language: data.preferred_language
        };
        setUser(newUser);
        localStorage.setItem('agroguide_user', JSON.stringify(newUser));
      }
      return { success: true };
    }

    // Local fallback registration
    const newUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      state: data.state,
      district: data.district,
      preferred_language: data.preferred_language || 'en'
    };
    setUser(newUser);
    localStorage.setItem('agroguide_token', 'demo-token-1234567890');
    localStorage.setItem('agroguide_user', JSON.stringify(newUser));
    return { success: true };
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'ramesh.patel@farmer.in',
      full_name: 'Ramesh Patel',
      phone: '+91 98765 43210',
      state: 'Karnataka',
      district: 'Dharwad',
      village: 'Navalgund',
      preferred_language: 'en'
    };
    setUser(demoUser);
    localStorage.setItem('agroguide_token', 'demo-token-1234567890');
    localStorage.setItem('agroguide_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('agroguide_token');
    localStorage.removeItem('agroguide_user');
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const res: any = await Api.updateProfile(data);
      if (res.data) {
        const updated = { ...user, ...res.data };
        setUser(updated);
        localStorage.setItem('agroguide_user', JSON.stringify(updated));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginAsDemo, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
