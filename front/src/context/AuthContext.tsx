import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';

// Define the shape of our AuthContext
export interface Permission {
  id?: number;
  name?: string;
  slug?: string;      
  can_update?: number | boolean; 
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone?: string | null;
  avatar?: string | null;
  username: string;
  role?: string | { id: number; name: string };
  permissions?: Permission[];
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  /**
   * Recharge l'utilisateur depuis GET /me. À appeler après une modification du
   * profil pour que l'en-tête affiche le nouveau nom sans recharger la page.
   */
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getCookie("TOKEN") || null);
  //   const navigate = useNavigate();

  // Fetch user data if token exists
  useEffect(() => {
    if (token) {
      fetchUserData(token);
    }
  }, [token]);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await axios.get(`${ApiBaseUrl}me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data.data);  // Store user data

    } catch {
      toast.error('Failed to fetch user data');
    }
  };

  const login = async (username: string, password: string, remember: boolean) => {
    try {
      const response = await axios.post(`${ApiBaseUrl}login`, {
        username,
        password,
      });

      const { token } = response.data;

      // Validate token exists
      if (!token) {
        toast.error("Invalid credentials");
        throw new Error("No token received from server");
      }
      toast.success("Login with Success");

      // Cookie settings
      const maxAge = remember ? 1296000 : 86400; // 15 days or 1 day in seconds
      const cookieValue = `TOKEN=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;

      // Set cookie
      if (typeof document !== 'undefined') {
        document.cookie = cookieValue;
      }

      // Update state and fetch user data
      setToken(token);
      fetchUserData(token);
      window.location.pathname = '/';

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credentials");
    }
  };

  const logout = () => {
    // Remove token from cookie by setting expiration date in the past
    if (typeof document !== 'undefined') {
      document.cookie = 'TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    setToken(null);
    setUser(null);
    window.location.pathname = '/signin'; // Redirect to login after logout
  };

  // Rechargement du profil après une mise à jour, sans recharger la page.
  const refreshUser = async () => {
    const authToken = token || getCookie("TOKEN");

    if (authToken) {
      await fetchUserData(authToken);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };  // Make sure the hook is exported correctly
