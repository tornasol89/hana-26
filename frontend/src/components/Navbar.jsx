import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const css = `
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nav-root {
    position: sticky; top: 0; z-index: 100;
    display: flex; justify-content: space-between; align-items: center;
    height: 72px;
    background: #F4EEED;
    border-bottom: 1px solid rgba(45,19,44,0.10);
    box-shadow: 0 1px 0 rgba(45,19,44,0.05), 0 4px 20px rgba(45,19,44,0.06);
  }
  .nav-inner {
    width: 100%; display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 40px;
  }
  @media (max-width: 767px) { .nav-inner { padding: 0 20px; } }

  /* Logo */
  .nav-logo { text-decoration: none; display: flex; align-items: center; gap: 11px; }
  .nav-logo-circle {
    width: 46px; height: 46px; border-radius: 50%;
    background: #2D132C;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    box-shadow: 0 0 0 2px rgba(212,163,115,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .nav-logo:hover .nav-logo-circle {
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(212,163,115,0.6);
  }
  .nav-logo-texto { display: flex; flex-direction: column; line-height: 1.2; }
  .nav-logo-nombre {
    font-family: 'Playfair Display', serif;
    font-weight: 900; color: #2D132C; letter-spacing: 2px;
  }
  .nav-logo-tagline {
    font-size: 9px; color: #C72C41;
    letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;
  }

  /* Links centro */
  .nav-links { display: flex; align-items: center; gap: 4px; }
  .nav-btn {
    padding: 8px 16px; color: rgba(45,19,44,0.6);
    font-size: 12px; font-weight: 600; background: transparent;
    border: none; cursor: pointer; font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.5px;
    transition: color 0.2s;
    text-decoration: none; display: flex; align-items: center;
    text-transform: uppercase;
  }
  .nav-btn:hover { color: #2D132C; }
  .nav-btn-alianzas {
    padding: 7px 14px; color: #5DCAA5;
    font-size: 12px; font-weight: 700; background: rgba(93,202,165,0.08);
    border: 1.5px solid rgba(93,202,165,0.35); border-radius: 6px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; letter-spacing: 0.5px;
    transition: all 0.2s; text-decoration: none; display: flex; align-items: center;
    text-transform: uppercase; white-space: nowrap;
  }
  .nav-btn-alianzas:hover { background: rgba(93,202,165,0.15); border-color: #5DCAA5; color: #3ab88a; }
  .nav-sep { color: rgba(45,19,44,0.15); font-size: 14px; margin: 0 2px; }

  /* Botones CTA no logueado */
  .nav-cta-outline-rosa {
    padding: 8px 18px; border-radius: 6px;
    border: 1.5px solid rgba(199,44,65,0.4); background: transparent;
    font-size: 11px; font-weight: 700; color: #C72C41;
    text-decoration: none; transition: all 0.2s; white-space: nowrap;
    letter-spacing: 1px; text-transform: uppercase;
  }
  .nav-cta-outline-rosa:hover {
    border-color: #C72C41; background: rgba(199,44,65,0.06); color: #C72C41;
  }
  .nav-cta-outline-gold {
    padding: 8px 18px; border-radius: 6px;
    border: 1.5px solid rgba(212,163,115,0.5); background: transparent;
    font-size: 11px; font-weight: 700; color: #b07d45;
    text-decoration: none; transition: all 0.2s; white-space: nowrap;
    letter-spacing: 1px; text-transform: uppercase;
  }
  .nav-cta-outline-gold:hover {
    border-color: #D4A373; background: rgba(212,163,115,0.08); color: #b07d45;
  }
  .nav-cta-primary {
    padding: 9px 22px; border-radius: 6px;
    background: #2D132C;
    font-size: 11px; font-weight: 700; color: white;
    text-decoration: none; transition: background 0.2s, transform 0.2s;
    white-space: nowrap; letter-spacing: 1.5px; text-transform: uppercase;
  }
  .nav-cta-primary:hover {
    background: #3d1a3c;
    transform: translateY(-1px);
  }

  /* Avatar logueado */
  .nav-user-btn {
    display: flex; align-items: center; gap: 9px;
    background: transparent;
    border: 1.5px solid transparent;
    border-radius: 6px; padding: 5px 10px 5px 5px;
    cursor: pointer; transition: all 0.2s;
  }
  .nav-user-btn:hover, .nav-user-btn.abierto {
    background: rgba(45,19,44,0.05);
    border-color: rgba(45,19,44,0.15);
  }
  .nav-user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(212,163,115,0.4);
  }
  .nav-user-iniciales {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: #2D132C;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; color: white;
    box-shadow: 0 0 0 2px rgba(212,163,115,0.3);
  }
  .nav-user-info { display: flex; flex-direction: column; line-height: 1.2; text-align: left; }
  .nav-user-nombre { font-size: 13px; font-weight: 700; color: #2D132C; }
  .nav-user-rol { font-size: 10px; color: rgba(45,19,44,0.4); font-style: italic; }
  .nav-user-arrow {
    color: rgba(45,19,44,0.35); font-size: 10px;
    margin-left: 2px; transition: transform 0.2s;
  }

  /* Badge no leídos */
  .nav-badge {
    position: absolute; top: -4px; right: -4px;
    background: #C72C41; color: white;
    font-size: 9px; font-weight: 700;
    min-width: 16px; height: 16px;
    border-radius: 8px; padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #F4EEED;
    line-height: 1;
    pointer-events: none;
  }

  /* Dropdown menú */
  .nav-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: #FFFFFF;
    border: 1px solid rgba(45,19,44,0.12);
    border-radius: 10px; padding: 8px; min-width: 210px;
    box-shadow: 0 12px 40px rgba(45,19,44,0.15);
    z-index: 200;
    animation: fadeSlideDown 0.18s ease;
  }
  .nav-dropdown-header {
    padding: 10px 14px 13px;
    border-bottom: 1px solid rgba(45,19,44,0.07);
    margin-bottom: 6px;
  }
  .nav-dropdown-label { margin: 0; font-size: 11px; color: rgba(45,19,44,0.4); }
  .nav-dropdown-nombre { margin: 3px 0 0; font-size: 13px; font-weight: 700; color: #2D132C; }
  .nav-dropdown-badge {
    display: inline-block; margin-top: 5px;
    font-size: 9px; padding: 2px 9px; border-radius: 4px;
    font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  }
  .nav-dropdown-link {
    display: block; padding: 10px 14px;
    color: rgba(45,19,44,0.7);
    text-decoration: none; font-size: 12px; font-weight: 600;
    border-radius: 6px; transition: all 0.15s;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .nav-dropdown-link:hover {
    background: rgba(45,19,44,0.05);
    color: #2D132C;
  }
  .nav-dropdown-sep {
    height: 1px; background: rgba(45,19,44,0.07);
    margin: 6px 0;
  }
  .nav-dropdown-logout {
    width: 100%; text-align: left; padding: 10px 14px;
    background: transparent; border: none; border-radius: 6px;
    color: #C72C41; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: 'Montserrat', sans-serif; transition: all 0.15s;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .nav-dropdown-logout:hover {
    background: rgba(199,44,65,0.07);
    color: #a01f30;
  }
`

const opcionesMenu = {
  clienta:    [{ label: '👤 Mi perfil',    ruta: '/perfil/clienta' }],
  trabajadora:[{ label: '👤 Mi perfil',    ruta: '/perfil/trabajadora' }, { label: '📅 Mi calendario', ruta: '/mi-calendario' }],
  admin:      [{ label: '🛡️ Panel admin',  ruta: '/perfil/admin' }],
}
// En qué pestañas mostrar "mensajes" en el dropdown (trabajadoras y clientas)
const ROLES_CON_MENSAJES = ['clienta', 'trabajadora']

function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [usuario, setUsuario]         = useState(null)
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768)
  const [abierto, setAbierto]         = useState(false)
  const [noLeidos, setNoLeidos]       = useState(0)
  const menuRef = useRef(null)
  const intervaloRef = useRef(null)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    const data = localStorage.getItem('usuario')
    try { setUsuario(data ? JSON.parse(data) : null) } catch { setUsuario(null) }
  }, [location])

  // Polling de mensajes no leídos cada 30 segundos
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !usuario) { setNoLeidos(0); return }

    const fetchNoLeidos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages/no-leidos', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setNoLeidos(res.data.count || 0)
      } catch { /* silencioso */ }
    }

    fetchNoLeidos()
    intervaloRef.current = setInterval(fetchNoLeidos, 30000)
    return () => clearInterval(intervaloRef.current)
  }, [usuario])

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [location])

  const cerrarSesion = () => {
    ['token','usuario','aceptoCompromiso','fechaAceptacion'].forEach(k => localStorage.removeItem(k))
    setUsuario(null); setAbierto(false); navigate('/')
  }

  const irASeccion = id => {
    if (location.pathname !== '/') { navigate(`/#${id}`); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const opciones = usuario ? (opcionesMenu[usuario.tipo] ?? opcionesMenu.clienta) : []
  const rolTexto = usuario?.tipo === 'trabajadora' ? 'Trabajadora' : usuario?.tipo === 'admin' ? 'Administradora' : 'Clienta'

  return (
    <>
      <style>{css}</style>
      <nav className="nav-root">
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-circle">🌸</div>
            <div className="nav-logo-texto">
              <span className="nav-logo-nombre" style={{ fontSize: isMobile ? '18px' : '24px' }}>HANA</span>
              {!isMobile && <span className="nav-logo-tagline">Hecho por mujeres, para mujeres</span>}
            </div>
          </Link>

          {/* Centro — solo desktop */}
          {!isMobile && (
            <div className="nav-links">
              <button onClick={() => irASeccion('categorias')} className="nav-btn">Servicios</button>
              <span className="nav-sep">·</span>
              <button onClick={() => irASeccion('profesionales')} className="nav-btn">Profesionales</button>
              <span className="nav-sep">·</span>
              <Link to="/impacto" className="nav-btn">Por qué Hana</Link>
              <span className="nav-sep">·</span>
              <Link to="/alianzas" className="nav-btn-alianzas">Alianzas</Link>
            </div>
          )}

          {/* Derecha */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {usuario ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setAbierto(v => !v)}
                  className={`nav-user-btn${abierto ? ' abierto' : ''}`}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {usuario.foto
                      ? <img src={usuario.foto} alt="foto" className="nav-user-avatar" />
                      : <div className="nav-user-iniciales">{usuario.nombre?.charAt(0).toUpperCase()}</div>
                    }
                    {noLeidos > 0 && (
                      <span className="nav-badge">{noLeidos > 9 ? '9+' : noLeidos}</span>
                    )}
                  </div>
                  {!isMobile && (
                    <div className="nav-user-info">
                      <span className="nav-user-nombre">Hola, {usuario.nombre} 🌸</span>
                      <span className="nav-user-rol">{rolTexto}</span>
                    </div>
                  )}
                  <span className="nav-user-arrow" style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>

                {abierto && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <p className="nav-dropdown-label">Conectada como</p>
                      <p className="nav-dropdown-nombre">{usuario.nombre}</p>
                      <span
                        className="nav-dropdown-badge"
                        style={{
                          background: usuario.tipo === 'admin' ? 'rgba(199,44,65,0.12)' : 'rgba(212,163,115,0.15)',
                          color: usuario.tipo === 'admin' ? '#C72C41' : '#b07d45',
                        }}
                      >
                        {rolTexto}
                      </span>
                    </div>

                    {opciones.map(op => (
                      <Link key={op.ruta} to={op.ruta} onClick={() => setAbierto(false)} className="nav-dropdown-link">
                        {op.label}
                      </Link>
                    ))}

                    {/* Indicador de mensajes no leídos en el dropdown */}
                    {ROLES_CON_MENSAJES.includes(usuario?.tipo) && noLeidos > 0 && (
                      <div style={{ padding: '8px 14px', fontSize: '12px', color: '#C72C41', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        💬 <span>{noLeidos} mensaje{noLeidos > 1 ? 's' : ''} sin leer</span>
                      </div>
                    )}

                    <div className="nav-dropdown-sep" />
                    <button onClick={cerrarSesion} className="nav-dropdown-logout">
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <Link to="/compromiso?destino=clienta" className="nav-cta-outline-rosa">
                      Contratar servicios
                    </Link>
                    <Link to="/compromiso?destino=trabajadora" className="nav-cta-outline-gold">
                      Ofrecer servicios
                    </Link>
                  </>
                )}
                <Link to="/login" className="nav-cta-primary">Ingresar</Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  )
}

export default Navbar
