import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Registro from "./pages/Registro.tsx";
import BuscarServicios from "./pages/BuscarServicios.tsx";
import MiPerfil from "./pages/MiPerfil";
import WorkerProfilePage from "./pages/WorkerProfile";
import Compromiso from "./pages/Compromiso";
import Impacto from "./pages/Impacto";
import NotFound from "./pages/NotFound.tsx";
import PerfilAdmin from "./pages/PerfilAdmin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/worker/:id" element={<WorkerProfilePage />} />
            <Route path="/compromiso" element={<Compromiso />} />
            <Route path="/impacto" element={<Impacto />} />

            {/* Requieren sesión */}
            <Route
              path="/buscar"
              element={
                <ProtectedRoute>
                  <BuscarServicios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-perfil"
              element={
                <ProtectedRoute>
                  <MiPerfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil/admin"
              element={
                <ProtectedRoute allowedTypes={["admin"]}>
                  <PerfilAdmin />
                </ProtectedRoute>
              }
            />

            {/* Redirects de URLs viejas del front anterior */}
            <Route path="/perfil/trabajadora" element={<Navigate to="/mi-perfil" replace />} />
            <Route path="/perfil/clienta" element={<Navigate to="/mi-perfil" replace />} />
            <Route path="/mi-perfil-profesional" element={<Navigate to="/mi-perfil" replace />} />

            {/* 404 - siempre al final */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;