'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

// Define what a User looks like
interface UserProfile {
  name: string;
  email: string;
  initials: string;
}

interface UserContextType {
  user: UserProfile | null;
  updateUser: (name: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      // 1. Try fetching real profile from backend
      const profile = await apiClient.auth.getProfile();
      const name = profile.username || profile.email.split('@')[0];
      setUser({
        name: name,
        email: profile.email,
        initials: name.substring(0, 2).toUpperCase()
      });
    } catch (err) {
      console.error("Failed to fetch profile, falling back to JWT decode", err);
      // 2. Fallback to JWT decode if backend fails
      try {
        const decoded: any = jwtDecode(token);
        const email = decoded.email || 'user@example.com';
        const nameFallback = email.split('@')[0];
        setUser({
          name: nameFallback,
          email: email,
          initials: nameFallback.substring(0, 2).toUpperCase()
        });
      } catch (decodeErr) {
        console.error("JWT decode also failed", decodeErr);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const updateUser = (newName: string) => {
    const initials = newName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    if (user) {
      setUser({ ...user, name: newName, initials });
    }
  };

  const logout = async () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    localStorage.removeItem('user_token');
    setUser(null);

    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
    } catch (e) {
      console.debug('Next-auth signout skipped', e);
    }

    window.location.href = '/signin';
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logout, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within UserProvider');
  return context;
};