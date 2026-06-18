import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { session } from "@/features/auth/session";
import type { Usuario } from "@/features/auth/types";

interface AuthContextValue {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Lo llaman los hooks useLogin/useRegister al éxito para sincronizar el contexto */
  refreshUser: (user: Usuario) => void;
  /** Lo llama useLogout y cualquier UI que ofrezca cerrar sesión */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hidratar desde sessionStorage al montar
  useEffect(() => {
    const stored = session.getUser();
    if (stored && session.isAuthenticated()) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const refreshUser = (updated: Usuario) => {
    session.updateUser(updated);
    setUser(updated);
  };

  const logout = () => {
    session.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        refreshUser,
        logout,
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