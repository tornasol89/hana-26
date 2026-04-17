import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas públicas
import Home           from './pages/Home'
import Login          from './pages/Login'
import RegisterClient from './pages/RegisterClient'
import RegisterWorker from './pages/RegisterWorker'
import WorkerProfile  from './pages/WorkerProfile'
import Impacto        from './pages/Impacto'
import Alianzas       from './pages/Alianzas'
import Compromiso     from './pages/Compromiso'

// Páginas privadas
import ClientProfile          from './pages/ClientProfile'
import PerfilTrabajadora      from './pages/PerfilTrabajadora'
import PerfilAdmin            from './pages/PerfilAdmin'
import MiPerfil               from './pages/MiPerfil'
import WorkerCalendar         from './pages/WorkerCalendar'
import PerfilPublicoClienta   from './pages/PerfilPublicoClienta'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Públicas ── */}
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/compromiso"  element={<Compromiso />} />
        <Route path="/impacto"     element={<Impacto />} />
        <Route path="/alianzas"    element={<Alianzas />} />
        <Route path="/worker/:id"  element={<WorkerProfile />} />

        {/* Registro — requieren haber aceptado compromiso (guard interno) */}
        <Route path="/register-client" element={<RegisterClient />} />
        <Route path="/register-worker" element={<RegisterWorker />} />

        {/* ── Privadas — cualquier usuaria logueada ── */}
        <Route path="/mi-perfil" element={
          <ProtectedRoute>
            <MiPerfil />
          </ProtectedRoute>
        } />

        {/* ── Privadas — por tipo de usuario ── */}
        <Route path="/perfil/clienta" element={
          <ProtectedRoute tipos={['clienta']}>
            <ClientProfile />
          </ProtectedRoute>
        } />

        <Route path="/perfil/trabajadora" element={
          <ProtectedRoute tipos={['trabajadora']}>
            <PerfilTrabajadora />
          </ProtectedRoute>
        } />

        <Route path="/perfil/admin" element={
          <ProtectedRoute tipos={['admin']}>
            <PerfilAdmin />
          </ProtectedRoute>
        } />

        <Route path="/mi-calendario" element={
          <ProtectedRoute tipos={['trabajadora', 'admin']}>
            <WorkerCalendar />
          </ProtectedRoute>
        } />

        {/* Perfil público de clienta — solo para trabajadoras y admin */}
        <Route path="/clienta/:id" element={
          <ProtectedRoute tipos={['trabajadora', 'admin']}>
            <PerfilPublicoClienta />
          </ProtectedRoute>
        } />

        {/* ── Catch-all — redirige a Home si la ruta no existe ── */}
        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
