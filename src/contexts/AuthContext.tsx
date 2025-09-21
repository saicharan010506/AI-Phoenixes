import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  primaryCraft: string;
  profilePicture?: string;
  story?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string) => Promise<boolean>;
  sendOTP: (email: string, mobile?: string) => Promise<boolean>;
  createAccount: (userData: Omit<User, 'id'>, otp: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [sentOTPs, setSentOTPs] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('kalahasta_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async (email: string, mobile?: string): Promise<boolean> => {
    try {
      const otp = generateOTP();
      setSentOTPs(prev => new Map(prev.set(email, otp)));
      
      // Simulate sending OTP (in real app, this would call an API)
      console.log(`OTP sent to ${email}: ${otp}`);
      alert(`OTP sent to ${email}: ${otp} (This is for demo purposes)`);
      
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  };

  const createAccount = async (userData: Omit<User, 'id'>, otp: string): Promise<boolean> => {
    try {
      const correctOTP = sentOTPs.get(userData.email);
      if (!correctOTP || correctOTP !== otp) {
        throw new Error('Invalid OTP');
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      };

      // Save to localStorage (in real app, this would be a database)
      const existingUsers = JSON.parse(localStorage.getItem('kalahasta_users') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('kalahasta_users', JSON.stringify(existingUsers));
      localStorage.setItem('kalahasta_user', JSON.stringify(newUser));

      setUser(newUser);
      setSentOTPs(prev => {
        const newMap = new Map(prev);
        newMap.delete(userData.email);
        return newMap;
      });

      return true;
    } catch (error) {
      console.error('Account creation failed:', error);
      return false;
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('kalahasta_users') || '[]');
      const foundUser = existingUsers.find((u: User) => u.email === email);
      
      if (!foundUser) {
        throw new Error('User not found');
      }

      localStorage.setItem('kalahasta_user', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const loginWithOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const correctOTP = sentOTPs.get(email);
      if (!correctOTP || correctOTP !== otp) {
        throw new Error('Invalid OTP');
      }

      const existingUsers = JSON.parse(localStorage.getItem('kalahasta_users') || '[]');
      const foundUser = existingUsers.find((u: User) => u.email === email);
      
      if (!foundUser) {
        throw new Error('User not found');
      }

      localStorage.setItem('kalahasta_user', JSON.stringify(foundUser));
      setUser(foundUser);
      setSentOTPs(prev => {
        const newMap = new Map(prev);
        newMap.delete(email);
        return newMap;
      });

      return true;
    } catch (error) {
      console.error('OTP login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('kalahasta_user');
    setUser(null);
  };

  const deleteAccount = async (): Promise<void> => {
    if (!user) return;

    try {
      const existingUsers = JSON.parse(localStorage.getItem('kalahasta_users') || '[]');
      const updatedUsers = existingUsers.filter((u: User) => u.id !== user.id);
      localStorage.setItem('kalahasta_users', JSON.stringify(updatedUsers));
      localStorage.removeItem('kalahasta_user');
      
      // Clear all user data
      localStorage.removeItem(`kalahasta_products_${user.id}`);
      localStorage.removeItem(`kalahasta_recordings_${user.id}`);
      localStorage.removeItem(`kalahasta_certifications_${user.id}`);
      
      setUser(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      
      // Update in users array
      const existingUsers = JSON.parse(localStorage.getItem('kalahasta_users') || '[]');
      const userIndex = existingUsers.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('kalahasta_users', JSON.stringify(existingUsers));
      }
      
      localStorage.setItem('kalahasta_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithOTP,
    sendOTP,
    createAccount,
    logout,
    deleteAccount,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};