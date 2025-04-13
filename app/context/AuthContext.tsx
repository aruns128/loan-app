"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(storedLogin);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Cookie must be included
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        window.location.href = "/dashboard"; // Redirect on success
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
        credentials: "include", // Include cookie
      });

      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
