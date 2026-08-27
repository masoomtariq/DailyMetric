import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setSessionExpiredHandler } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      const response = await apiRequest('/auth/validate', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const login = async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    }, { skipAuthRetry: true });

    if (response.ok) {
      return validateSession();
    }
    return false;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      }, { skipAuthRetry: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
