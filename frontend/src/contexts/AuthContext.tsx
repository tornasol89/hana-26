import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/features/auth/api";
import { session } from "@/features/auth/session";
import type {
  LoginPayload,
  RegisterPayload,
  Usuario,
} from "@/features/auth/types";

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
    const stored = session.getUser();
    if (stored && session.isAuthenticated()) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    session.save(response);
    setUser(response.usuario);
    return response.usuario;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    session.save(response);
    setUser(response.usuario);
    return response.usuario;
  };

  const logout = () => {
    session.clear();
    setUser(null);
  };

  const refreshUser = (updated: Usuario) => {
    session.updateUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
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