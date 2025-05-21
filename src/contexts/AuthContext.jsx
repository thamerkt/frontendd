import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import authStore from '../redux/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage and cookies
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = Cookies.get('token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Validate session
          const isValid = await authStore.validateSession();
          if (!isValid) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await authStore.login(email, password);
      const userData = {
        email: response.user.email,
        role: response.user.role || 'customer',
        first_name: response.user.first_name,
        last_name: response.user.last_name
      };
      setUser(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    authStore.logout();
    setUser(null);
    localStorage.removeItem('user');
    Cookies.remove('token');
    Cookies.remove('keycloak_user_id');
  };

  const handleUpdateProfile = async (userData) => {
    try {
      const updatedUser = await authStore.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    isAuthenticated: () => !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 