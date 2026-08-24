import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAccessToken, setSessionExpiredHandler } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAccessToken(null);
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
        setAccessToken(data.access_token || data.accessToken || data.token);
        setUser(data.user || 'User');
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (_error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    }, { skipAuthRetry: true });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.access_token || data.accessToken || data.token);
      setUser(data.user || 'User');
      setIsAuthenticated(true);
      return true;
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
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
