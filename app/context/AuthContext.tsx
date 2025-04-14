"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UserType = {
  id: string;
  name: string;
  username: string;
  email: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: UserType | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(storedLogin);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUser(data.user);
        window.location.href = "/dashboard";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong.");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
