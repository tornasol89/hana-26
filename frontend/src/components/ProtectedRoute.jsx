import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute
 * Uso en App.jsx:
 *   <Route path="/perfil/clienta"     element={<ProtectedRoute tipos={['clienta']}><ClientProfile /></ProtectedRoute>} />
 *   <Route path="/perfil/trabajadora" element={<ProtectedRoute tipos={['trabajadora']}><PerfilTrabajadora /></ProtectedRoute>} />
 *   <Route path="/perfil/admin"       element={<ProtectedRoute tipos={['admin']}><PerfilAdmin /></ProtectedRoute>} />
 *   <Route path="/mi-calendario"      element={<ProtectedRoute tipos={['trabajadora','admin']}><WorkerCalendar /></ProtectedRoute>} />
 *
 * Si no hay token → redirige a /login
 * Si el tipo no coincide → redirige al perfil correcto de la usuaria
 */
export default function ProtectedRoute({ children, tipos = [] }) {
  const token    = localStorage.getItem('token')
  const rawUser  = localStorage.getItem('usuario')

  // Sin sesión → login
  if (!token || !rawUser) {
    return <Navigate to="/login" replace />
  }

  let usuario = null
  try { usuario = JSON.parse(rawUser) } catch { return <Navigate to="/login" replace /> }

  // Sin restricción de tipo → dejar pasar
  if (tipos.length === 0) return children

  // Tipo no permitido → redirigir al perfil propio
  if (!tipos.includes(usuario.tipo)) {
    const destino =
      usuario.tipo === 'admin'       ? '/perfil/admin'       :
      usuario.tipo === 'trabajadora' ? '/perfil/trabajadora' :
                                       '/perfil/clienta'
    return <Navigate to={destino} replace />
  }

  return children
}
