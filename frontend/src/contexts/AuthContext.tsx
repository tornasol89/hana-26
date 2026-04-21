import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/lib/auth";
import type { LoginPayload, RegisterPayload, Usuario } from "@/types/auth";

interface AuthContextValue {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<Usuario>;
  register: (payload: RegisterPayload) => Promise<Usuario>;
  logout: () => void;
  refreshUser: (user: Usuario) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored && authService.isAuthenticated()) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    const { usuario } = await authService.login(payload);
    setUser(usuario);
    return usuario;
  };

  const register = async (payload: RegisterPayload) => {
    const { usuario } = await authService.register(payload);
    setUser(usuario);
    return usuario;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = (updated: Usuario) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}