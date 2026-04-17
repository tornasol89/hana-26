import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChatModal from '../components/ChatModal'
import EvaluarModal from '../components/EvaluarModal'

const styles = `
  * { box-sizing: border-box; }
  .cp-root { background: #F4EEED; min-height: 100vh; color: #4A4A4A; font-family: 'Montserrat', sans-serif; }
  .cp-hero { background: #2D132C; border-bottom: none; padding: 48px 24px 40px; }
  .cp-avatar-wrap { position: relative; display: inline-block; margin-bottom: 16px; }
  .cp-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(212,163,115,0.5); object-fit: cover; display: block; }
  .cp-avatar-initials { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(212,163,115,0.5); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white; }
  .cp-avatar-badge { position: absolute; bottom: 2px; right: 2px; background: #D4A373; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid #2D132C; cursor: pointer; }
  .cp-nombre { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; margin: 0 0 4px; color: #F4EEED; letter-spacing: -1px; }
  .cp-email { font-size: 13px; color: rgba(244,238,237,0.5); margin-bottom: 16px; }
  .cp-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .cp-section { padding: 40px 24px; max-width: 760px; margin: 0 auto; }
  .cp-section-titulo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #2D132C; margin: 0 0 20px; letter-spacing: -0.5px; }
  .cp-card { background: white; border: 1px solid rgba(45,19,44,0.08); border-radius: 8px; padding: 20px; margin-bottom: 12px; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 1px 6px rgba(45,19,44,0.05); }
  .cp-card:hover { border-color: rgba(199,44,65,0.2); box-shadow: 0 4px 16px rgba(45,19,44,0.08); }
  .cp-reserva-estado { display: inline-block; font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase; }
  .cp-confianza-bar { height: 5px; border-radius: 2px; background: rgba(45,19,44,0.08); overflow: hidden; margin-top: 8px; }
  .cp-confianza-fill { height: 100%; border-radius: 2px; background: #C72C41; transition: width 1s ease; }
  .cp-input { width: 100%; background: #F4EEED; border: 1.5px solid rgba(45,19,44,0.12); border-radius: 6px; padding: 12px 16px; color: #2D132C; font-size: 14px; font-family: 'Montserrat', sans-serif; outline: none; transition: border-color 0.2s; }
  .cp-input:focus { border-color: #C72C41; }
  .cp-btn-save { background: #C72C41; color: white; border: none; border-radius: 6px; padding: 12px 32px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: background 0.2s, transform 0.2s; letter-spacing: 1.5px; text-transform: uppercase; }
  .cp-btn-save:hover { background: #a01f30; transform: translateY(-1px); }
  .cp-doc-box { border: 1.5px dashed rgba(45,19,44,0.2); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(45,19,44,0.03); }
  .cp-doc-box:hover { border-color: #C72C41; background: rgba(199,44,65,0.04); }
  .cp-doc-img { width: 100%; max-height: 160px; object-fit: cover; border-radius: 6px; display: block; }
  .cp-filtro-btn { padding: 6px 16px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; border: 1.5px solid rgba(45,19,44,0.12); background: transparent; color: rgba(45,19,44,0.5); transition: all 0.2s; letter-spacing: 0.5px; text-transform: uppercase; }
  .cp-filtro-btn.activo { background: #2D132C; border-color: #2D132C; color: white; }
  .divider { height: 1px; background: rgba(45,19,44,0.08); margin: 8px 0 32px; }
`

const coloresAvatar = ['#d4537e', '#c4892a', '#7a3aa8', '#5DCAA5']

function calcularNivelConfianza(reservas) {
  const total = reservas.length
  if (total === 0) return { nivel: 'Nueva', pct: 10, color: '#888' }
  const completadas = reservas.filter(r => r.estado === 'completada').length
  const pct = Math.min(Math.round((completadas / Math.max(total, 1)) * 80 + (total > 2 ? 20 : 0)), 100)
  if (pct >= 80) return { nivel: 'Muy confiable', pct, color: '#5DCAA5' }
  if (pct >= 50) return { nivel: 'Confiable', pct, color: '#e8b86d' }
  return { nivel: 'En construcción', pct, color: '#d4537e' }
}

const estadoConfig = {
  pendiente:  { color: '#b07d45', bg: 'rgba(212,163,115,0.12)', texto: 'Pendiente' },
  aceptada:   { color: '#2a7a56', bg: 'rgba(42,122,86,0.10)',   texto: 'Aceptada'  },
  rechazada:  { color: '#C72C41', bg: 'rgba(199,44,65,0.10)',   texto: 'Rechazada' },
  completada: { color: '#2D132C', bg: 'rgba(45,19,44,0.10)',    texto: 'Completada'},
}

export default function ClientProfile() {
  const navigate = useNavigate()
  const [usuario,         setUsuario]         = useState(null)
  const [reservas,        setReservas]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [editando,        setEditando]        = useState(false)
  const [formData,        setFormData]        = useState({ nombre: '', apellido: '', region: '', comuna: '' })
  const [guardando,       setGuardando]       = useState(false)
  const [mensaje,         setMensaje]         = useState('')
  const [subiendoFoto,    setSubiendoFoto]    = useState(false)
  const [subiendoCarnet,  setSubiendoCarnet]  = useState({ frente: false, dorso: false })
  const [filtroReservas,  setFiltroReservas]  = useState('todas')
  const [reservaAbierta,  setReservaAbierta]  = useState(null)
  const [fotoAmpliada,    setFotoAmpliada]    = useState(null)
  const [chatReserva,     setChatReserva]     = useState(null)
  const [evaluarReserva,  setEvaluarReserva]  = useState(null)

  useEffect(() => {
    const token        = localStorage.getItem('token')
    const userGuardado = localStorage.getItem('usuario')
    if (!token || !userGuardado) { navigate('/login'); return }
    const u = JSON.parse(userGuardado)
    setUsuario(u)
    setFormData({ nombre: u.nombre || '', apellido: u.apellido || '', region: u.region || '', comuna: u.comuna || '' })
    fetchReservas(token)
  }, [])

  async function fetchReservas(token) {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/mis-reservas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservas(res.data)
    } catch (err) {
      console.error('Error cargando reservas:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoFoto(true)
    try {
      const token    = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('image', file)
      const res = await axios.post('http://localhost:5000/api/auth/upload-photo', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userActualizado = { ...usuario, foto: res.data.foto }
      localStorage.setItem('usuario', JSON.stringify(userActualizado))
      setUsuario(userActualizado)
      setMensaje('¡Foto de perfil actualizada!')
      setTimeout(() => setMensaje(''), 3000)
    } catch (err) {
      setMensaje('Error al subir la foto. Intenta de nuevo.')
      setTimeout(() => setMensaje(''), 3000)
    } finally {
      setSubiendoFoto(false)
    }
  }

  async function handleCarnetChange(e, lado) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoCarnet(prev => ({ ...prev, [lado]: true }))
    try {
      const token    = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('image', file)
      const res = await axios.post(
        `http://localhost:5000/api/auth/upload-carnet?lado=${lado}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const campo          = lado === 'frente' ? 'carnetFrenteUrl' : 'carnetDorsoUrl'
      const userActualizado = { ...usuario, [campo]: res.data.url, estadoVerificacion: 'enviado' }
      localStorage.setItem('usuario', JSON.stringify(userActualizado))
      setUsuario(userActualizado)
      setMensaje(`Documento (${lado}) subido. Tu verificación está en revisión.`)
      setTimeout(() => setMensaje(''), 4000)
    } catch (err) {
      setMensaje('Error al subir el documento. Intenta de nuevo.')
      setTimeout(() => setMensaje(''), 3000)
    } finally {
      setSubiendoCarnet(prev => ({ ...prev, [lado]: false }))
    }
  }

  async function handleGuardar() {
    setGuardando(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put('http://localhost:5000/api/auth/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userActualizado = { ...usuario, ...formData }
      localStorage.setItem('usuario', JSON.stringify(userActualizado))
      setUsuario(userActualizado)
      setEditando(false)
      setMensaje('¡Perfil actualizado exitosamente!')
      setTimeout(() => setMensaje(''), 3000)
    } catch {
      setMensaje('Error al guardar. Intenta de nuevo.')
      setTimeout(() => setMensaje(''), 3000)
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return (
    <div style={{ background: '#F4EEED', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#C72C41', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>Cargando perfil…</div>
    </div>
  )
  if (!usuario) return null

  const iniciales   = `${usuario.nombre?.charAt(0) || ''}${usuario.apellido?.charAt(0) || ''}`
  const colorAvatar = coloresAvatar[usuario.id?.charCodeAt(0) % coloresAvatar.length] || '#d4537e'
  const confianza   = calcularNivelConfianza(reservas)
  const nombre      = `${usuario.nombre} ${usuario.apellido}`

  const reservasFiltradas = filtroReservas === 'todas'
    ? reservas
    : filtroReservas === 'activas'
      ? reservas.filter(r => r.estado === 'pendiente' || r.estado === 'aceptada')
      : reservas.filter(r => r.estado === 'completada' || r.estado === 'rechazada')

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">
        <Navbar />

        {/* HERO */}
        <div className="cp-hero">
          <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            {/* Avatar + cambio de foto */}
            <div className="cp-avatar-wrap">
              {usuario.foto
                ? <img src={usuario.foto} className="cp-avatar" alt="foto de perfil" />
                : <div className="cp-avatar-initials" style={{ background: colorAvatar }}>{iniciales}</div>
              }
              <label
                htmlFor="foto-clienta"
                className="cp-avatar-badge"
                title={subiendoFoto ? 'Subiendo…' : 'Cambiar foto'}
              >
                {subiendoFoto ? '⏳' : '📷'}
              </label>
              <input
                id="foto-clienta"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
                disabled={subiendoFoto}
              />
            </div>

            <h1 className="cp-nombre">{nombre}</h1>
            <p className="cp-email">{usuario.email}</p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="cp-badge" style={{ background: 'rgba(199,44,65,0.1)', border: '1px solid rgba(199,44,65,0.25)', color: '#C72C41' }}>
                👩 Clienta
              </span>
              {usuario.region && (
                <span className="cp-badge" style={{ background: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.3)', color: '#b07d45' }}>
                  📍 {usuario.region}
                </span>
              )}
              {usuario.verificada
                ? <span className="cp-badge" style={{ background: 'rgba(42,122,86,0.1)', border: '1px solid rgba(42,122,86,0.3)', color: '#2a7a56' }}>✓ Verificada</span>
                : usuario.estadoVerificacion === 'enviado'
                  ? <span className="cp-badge" style={{ background: 'rgba(212,163,115,0.1)', border: '1px solid rgba(212,163,115,0.3)', color: '#b07d45' }}>🕐 En revisión</span>
                  : <span className="cp-badge" style={{ background: 'rgba(45,19,44,0.06)', border: '1px solid rgba(45,19,44,0.15)', color: 'rgba(45,19,44,0.5)' }}>⚠ Sin verificar</span>
              }
            </div>
          </div>
        </div>

        {/* Mensaje global */}
        {mensaje && (
          <div style={{ maxWidth: '760px', margin: '16px auto 0', padding: '0 24px' }}>
            <div style={{ background: mensaje.includes('Error') ? 'rgba(199,44,65,0.07)' : 'rgba(42,122,86,0.07)', border: `1px solid ${mensaje.includes('Error') ? 'rgba(199,44,65,0.3)' : 'rgba(42,122,86,0.3)'}`, borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: mensaje.includes('Error') ? '#C72C41' : '#2a7a56', fontFamily: 'Montserrat, sans-serif' }}>
              {mensaje}
            </div>
          </div>
        )}

        {/* ÍNDICE DE CONFIANZA */}
        <div className="cp-section">
          <h2 className="cp-section-titulo">Tu índice de confianza</h2>
          <div className="divider" />
          <div className="cp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px', color: '#2D132C', fontWeight: '700' }}>{confianza.nivel}</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '900', color: '#C72C41' }}>{confianza.pct}%</span>
            </div>
            <div className="cp-confianza-bar">
              <div className="cp-confianza-fill" style={{ width: `${confianza.pct}%` }} />
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(45,19,44,0.4)', marginTop: '10px', lineHeight: '1.7' }}>
              Tu índice sube con cada servicio completado y evaluado.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            {[
              { num: reservas.length,                                                            label: 'Reservas totales' },
              { num: reservas.filter(r => r.estado === 'completada').length,                    label: 'Completadas'      },
              { num: reservas.filter(r => r.estado === 'pendiente' || r.estado === 'aceptada').length, label: 'Activas'   },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#2D132C', border: '1px solid rgba(212,163,115,0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(45,19,44,0.15)' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '900', color: '#D4A373' }}>{stat.num}</div>
                <div style={{ fontSize: '10px', color: 'rgba(212,163,115,0.6)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MIS RESERVAS */}
        <div className="cp-section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="cp-section-titulo" style={{ margin: 0 }}>Mis reservas</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'todas',     label: `Todas (${reservas.length})` },
                { id: 'activas',   label: `Activas (${reservas.filter(r => r.estado === 'pendiente' || r.estado === 'aceptada').length})` },
                { id: 'historial', label: 'Historial' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`cp-filtro-btn${filtroReservas === f.id ? ' activo' : ''}`}
                  onClick={() => setFiltroReservas(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="divider" />

          {reservas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
              <p style={{ color: 'rgba(45,19,44,0.5)', fontSize: '14px', marginBottom: '20px', fontFamily: 'Montserrat, sans-serif' }}>
                Aún no tienes reservas. ¡Busca una profesional y agenda hoy!
              </p>
              <Link
                to="/"
                style={{ display: 'inline-block', background: '#C72C41', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
              >
                Buscar servicios →
              </Link>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(45,19,44,0.4)', fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
              No hay reservas en esta categoría.
            </div>
          ) : (
            reservasFiltradas.map(r => {
              const cfg              = estadoConfig[r.estado] || estadoConfig.pendiente
              const trabUser         = r.trabajadora?.usuario
              const trabajadoraNombre = trabUser
                ? `${trabUser.nombre} ${trabUser.apellido}`
                : 'Profesional'
              const trabajadoraFoto  = trabUser?.foto || null
              const abierta          = reservaAbierta === r._id

              return (
                <div key={r._id} className="cp-card" style={{ borderColor: abierta ? 'rgba(212,83,126,0.5)' : undefined }}>
                  {/* Cabecera clickeable */}
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
                    onClick={() => setReservaAbierta(abierta ? null : r._id)}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D132C', marginBottom: '4px' }}>{r.servicio}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(45,19,44,0.55)' }}>con {trabajadoraNombre}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(45,19,44,0.45)', marginTop: '4px' }}>
                        📅 {r.fecha
                          ? new Date(r.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Fecha por confirmar'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className="cp-reserva-estado" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50` }}>
                        {cfg.texto}
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(45,19,44,0.35)' }}>{abierta ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {abierta && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(45,19,44,0.08)' }}>
                      <div style={{ background: '#F4EEED', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(45,19,44,0.45)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '700' }}>Profesional</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Foto con zoom */}
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            {trabajadoraFoto ? (
                              <img
                                src={trabajadoraFoto}
                                alt={trabajadoraNombre}
                                onClick={e => { e.stopPropagation(); setFotoAmpliada(trabajadoraFoto) }}
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,83,126,0.4)', cursor: 'zoom-in', display: 'block' }}
                                title="Click para ampliar"
                              />
                            ) : (
                              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#2D132C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: 'white', border: '2px solid rgba(45,19,44,0.2)' }}>
                                {trabajadoraNombre.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {trabajadoraFoto && (
                              <div
                                onClick={e => { e.stopPropagation(); setFotoAmpliada(trabajadoraFoto) }}
                                style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'zoom-in' }}
                                title="Ampliar foto"
                              >🔍</div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D132C' }}>{trabajadoraNombre}</div>
                            {trabUser?.email && (
                              <div style={{ fontSize: '12px', color: 'rgba(45,19,44,0.45)', marginTop: '2px' }}>{trabUser.email}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Botones de acción según estado */}
                      {(r.estado === 'aceptada' || r.estado === 'completada') && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                          <button
                            onClick={e => { e.stopPropagation(); setChatReserva(r) }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: '#2D132C', border: 'none', color: '#F4EEED', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', letterSpacing: '0.8px', textTransform: 'uppercase' }}
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEvaluarReserva(r) }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: 'transparent', border: '1.5px solid rgba(212,163,115,0.5)', color: '#b07d45', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', letterSpacing: '0.8px', textTransform: 'uppercase' }}
                          >
                            ⭐ Evaluar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* VERIFICACIÓN — CÉDULA DE IDENTIDAD */}
        <div className="cp-section" style={{ paddingTop: 0 }}>
          <h2 className="cp-section-titulo">Verificación de identidad</h2>
          <div className="divider" />
          <p style={{ fontSize: '13px', color: 'rgba(45,19,44,0.55)', marginBottom: '20px', lineHeight: '1.7', fontFamily: 'Montserrat, sans-serif' }}>
            Sube una foto de tu cédula de identidad por ambos lados. El equipo Hana revisará tu documentación para verificar tu cuenta.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { lado: 'frente', label: 'Frente de la cédula', campo: 'carnetFrenteUrl' },
              { lado: 'dorso',  label: 'Dorso de la cédula',  campo: 'carnetDorsoUrl'  },
            ].map(({ lado, label, campo }) => (
              <div key={lado}>
                <p style={{ fontSize: '10px', color: 'rgba(45,19,44,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', fontFamily: 'Montserrat, sans-serif' }}>{label}</p>
                <label htmlFor={`carnet-${lado}`} style={{ display: 'block' }}>
                  <div className="cp-doc-box">
                    {subiendoCarnet[lado] ? (
                      <div style={{ padding: '24px 0', color: '#e8b86d', fontSize: '13px' }}>⏳ Subiendo…</div>
                    ) : usuario[campo] ? (
                      <img src={usuario[campo]} className="cp-doc-img" alt={label} />
                    ) : (
                      <div style={{ padding: '24px 0' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🪪</div>
                        <p style={{ fontSize: '12px', color: 'rgba(45,19,44,0.4)', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>Click para subir imagen</p>
                      </div>
                    )}
                  </div>
                </label>
                <input
                  id={`carnet-${lado}`}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleCarnetChange(e, lado)}
                  disabled={subiendoCarnet[lado]}
                />
                {usuario[campo] && (
                  <p style={{ fontSize: '11px', color: '#5DCAA5', marginTop: '6px', textAlign: 'center' }}>✓ Imagen subida</p>
                )}
              </div>
            ))}
          </div>

          {usuario.estadoVerificacion === 'enviado' && (
            <div style={{ marginTop: '16px', background: 'rgba(212,163,115,0.08)', border: '1px solid rgba(212,163,115,0.25)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#b07d45', fontFamily: 'Montserrat, sans-serif' }}>
              🕐 Tu documentación está siendo revisada por el equipo Hana.
            </div>
          )}
          {usuario.estadoVerificacion === 'aprobado' && (
            <div style={{ marginTop: '16px', background: 'rgba(42,122,86,0.07)', border: '1px solid rgba(42,122,86,0.25)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#2a7a56', fontFamily: 'Montserrat, sans-serif' }}>
              ✓ Tu identidad ha sido verificada exitosamente.
            </div>
          )}
          {usuario.estadoVerificacion === 'rechazado' && (
            <div style={{ marginTop: '16px', background: 'rgba(199,44,65,0.07)', border: '1px solid rgba(199,44,65,0.25)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#C72C41', fontFamily: 'Montserrat, sans-serif' }}>
              ✕ Tu verificación fue rechazada. Vuelve a subir tus documentos con mejor calidad.
            </div>
          )}
        </div>

        {/* MIS DATOS */}
        <div className="cp-section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="cp-section-titulo" style={{ margin: 0 }}>Mis datos</h2>
            {!editando && (
              <button onClick={() => setEditando(true)} style={{ background: 'transparent', border: '1.5px solid rgba(45,19,44,0.2)', color: 'rgba(45,19,44,0.6)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Editar
              </button>
            )}
          </div>
          <div className="divider" />

          {editando ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'nombre',   label: 'Nombre',  placeholder: 'Tu nombre'          },
                { key: 'apellido', label: 'Apellido', placeholder: 'Tu apellido'         },
                { key: 'region',   label: 'Región',  placeholder: 'Ej: Metropolitana'  },
                { key: 'comuna',   label: 'Comuna',  placeholder: 'Ej: Santiago'        },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '10px', color: 'rgba(45,19,44,0.5)', display: 'block', marginBottom: '6px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>{f.label}</label>
                  <input
                    className="cp-input"
                    placeholder={f.placeholder}
                    value={formData[f.key]}
                    onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="cp-btn-save" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button onClick={() => setEditando(false)} style={{ background: 'transparent', border: '1.5px solid rgba(45,19,44,0.15)', color: 'rgba(45,19,44,0.5)', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="cp-card">
              {[
                { label: 'Nombre completo', valor: nombre },
                { label: 'Email',           valor: usuario.email },
                { label: 'Región',          valor: usuario.region  || 'No especificada' },
                { label: 'Comuna',          valor: usuario.comuna  || 'No especificada' },
                { label: 'Verificación',    valor: usuario.estadoVerificacion === 'aprobado' ? '✓ Verificada' : usuario.estadoVerificacion === 'enviado' ? '🕐 En revisión' : '⚠ Pendiente' },
                { label: 'Compromiso Hana', valor: usuario.aceptoCompromiso ? '✓ Aceptado' : '✗ Pendiente' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(45,19,44,0.07)' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(45,19,44,0.5)', fontFamily: 'Montserrat, sans-serif' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#2D132C', fontWeight: '600', fontFamily: 'Montserrat, sans-serif' }}>{item.valor}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Chat modal */}
      {chatReserva && usuario && (
        <ChatModal
          reserva={chatReserva}
          miUsuario={usuario}
          otraPersona={chatReserva.trabajadora?.usuario}
          onClose={() => setChatReserva(null)}
        />
      )}

      {/* Evaluar modal */}
      {evaluarReserva && usuario && (
        <EvaluarModal
          reserva={evaluarReserva}
          miUsuario={usuario}
          destinataria={evaluarReserva.trabajadora?.usuario}
          tipo="clienta_a_trabajadora"
          onClose={() => setEvaluarReserva(null)}
          onExito={() => fetchReservas(localStorage.getItem('token'))}
        />
      )}

      {/* Lightbox foto ampliada */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <img
            src={fotoAmpliada}
            alt="foto ampliada"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '88vw', maxHeight: '88vh', borderRadius: '14px', objectFit: 'contain', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}
          />
          <button
            onClick={() => setFotoAmpliada(null)}
            style={{ position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >×</button>
        </div>
      )}
    </>
  )
}
