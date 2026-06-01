import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("crm-token"));
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyToken() {
      const savedToken = localStorage.getItem("crm-token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          // Token expired or invalid, purge immediately
          localStorage.removeItem("crm-token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to authenticate session token:", err);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, []);

  const loginUser = (newToken: string, userData: IUser) => {
    localStorage.setItem("crm-token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("crm-token");
    setToken(null);
    setUser(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        login: loginUser,
        logout: logoutUser,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be wrapped in an AuthProvider");
  }
  return context;
}
