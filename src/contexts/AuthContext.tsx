import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './ToastContext';
import { useActivity } from './ActivityContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { logActivity } = useActivity();

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('nexsaas_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        nom: 'John',
        prenom: 'Doe',
        email,
        type: 'entreprise',
        companyName: 'Tech Solutions Inc.',
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      localStorage.setItem('nexsaas_user', JSON.stringify(mockUser));
      
      logActivity({
        type: 'login',
        module: 'Auth',
        description: `Connexion réussie pour ${mockUser.nom} ${mockUser.prenom}`,
        userId: mockUser.id,
        metadata: { email }
      });

      showToast({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue ${mockUser.nom} !`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Email ou mot de passe incorrect'
      });
      throw new Error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      setUser(newUser);
      localStorage.setItem('nexsaas_user', JSON.stringify(newUser));
      
      logActivity({
        type: 'create',
        module: 'Auth',
        description: `Nouveau compte créé pour ${newUser.nom} ${newUser.prenom}`,
        userId: newUser.id,
        metadata: { 
          email: newUser.email, 
          type: newUser.type,
          companyName: newUser.companyName 
        }
      });

      showToast({
        type: 'success',
        title: 'Inscription réussie',
        message: `Bienvenue ${newUser.nom} ! Votre compte a été créé avec succès.`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        message: 'Une erreur est survenue lors de la création de votre compte'
      });
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      logActivity({
        type: 'logout',
        module: 'Auth',
        description: `Déconnexion de ${user.nom} ${user.prenom}`,
        userId: user.id
      });

      showToast({
        type: 'info',
        title: 'Déconnexion',
        message: 'À bientôt !'
      });
    }

    setUser(null);
    localStorage.removeItem('nexsaas_user');
    localStorage.removeItem("token");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};