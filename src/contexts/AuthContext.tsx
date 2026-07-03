import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState } from "../types";

interface AuthContextType {
  auth: AuthState;
  login: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("campus_token");
    const savedUser = localStorage.getItem("campus_user");

    if (savedToken && savedUser) {
      setAuth({
        token: savedToken,
        user: JSON.parse(savedUser),
      });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, user: AuthState["user"]) => {
    localStorage.setItem("campus_token", token);
    localStorage.setItem("campus_user", JSON.stringify(user));
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem("campus_token");
    localStorage.removeItem("campus_user");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
