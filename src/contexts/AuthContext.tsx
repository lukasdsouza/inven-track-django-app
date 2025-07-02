import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, USERS } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('auth_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const canEdit = (): boolean => {
    return user?.role === 'admin' || user?.role === 'gestor';
  };

  const canDelete = (): boolean => {
    return user?.role === 'admin' || user?.role === 'gestor';
  };

  const canAdd = (): boolean => {
    return user?.role === 'admin' || user?.role === 'gestor';
  };

  const canManageUsers = (): boolean => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      canEdit,
      canDelete,
      canAdd,
      canManageUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};