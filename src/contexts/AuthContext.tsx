import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing different roles
const demoUsers: Record<string, User> = {
  'admin@hadhudhu.org': {
    id: '1',
    email: 'admin@hadhudhu.org',
    firstName: 'Admin',
    lastName: 'User',
    role: 'super_admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'treasurer@hadhudhu.org': {
    id: '2',
    email: 'treasurer@hadhudhu.org',
    firstName: 'John',
    lastName: 'Treasurer',
    role: 'treasurer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'secretary@hadhudhu.org': {
    id: '3',
    email: 'secretary@hadhudhu.org',
    firstName: 'Mary',
    lastName: 'Secretary',
    role: 'secretary',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'pastor@hadhudhu.org': {
    id: '4',
    email: 'pastor@hadhudhu.org',
    firstName: 'Pastor',
    lastName: 'James',
    role: 'pastor',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'member@hadhudhu.org': {
    id: '5',
    email: 'member@hadhudhu.org',
    firstName: 'Jane',
    lastName: 'Member',
    role: 'member',
    membershipNumber: 'HDH-2024-001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('churchUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser = demoUsers[email.toLowerCase()];
      if (demoUser && password === 'password123') {
        setUser(demoUser);
        localStorage.setItem('churchUser', JSON.stringify(demoUser));
      } else {
        throw new Error('Invalid credentials. Try demo accounts with password: password123');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'member',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(newUser);
      localStorage.setItem('churchUser', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('churchUser');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data, updatedAt: new Date() };
      setUser(updatedUser);
      localStorage.setItem('churchUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
