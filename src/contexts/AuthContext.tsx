'use client';

import { createContext, useContext, useState } from 'react';

export type AuthUser = { userId: string; email: string };

type AuthContextType = {
  user: AuthUser | null;
  isLoaded: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  signOut: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user] = useState<AuthUser | null>(initialUser);

  const signOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded: true, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
