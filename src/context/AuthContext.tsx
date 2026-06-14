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

const DEFAULT_ADMIN: IUser = {
  id: "admin-default-id",
  name: "System Admin",
  email: "admin@crm.com",
  createdAt: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>("bypass-token");
  const [user, setUser] = useState<IUser | null>(DEFAULT_ADMIN);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Instantly bypassed authentication
    setLoading(false);
  }, []);

  const loginUser = (newToken: string, userData: IUser) => {
    setToken("bypass-token");
    setUser(DEFAULT_ADMIN);
  };

  const logoutUser = () => {
    // Remain permanently authenticated since login is removed
    console.log("Logout action bypassed because login is disabled.");
  };

  const getAuthHeaders = (): Record<string, string> => {
    return {
      Authorization: `Bearer bypass-token`,
      "Content-Type": "application/json",
    };
  };

  const isAuthenticated = true;

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
