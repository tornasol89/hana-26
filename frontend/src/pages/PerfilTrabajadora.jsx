import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChatModal from '../components/ChatModal'
import EvaluarModal from '../components/EvaluarModal'

const styles = `
  * { box-sizing: border-box; }
  .pt-root { background: #F4EEED; min-height: 100vh; color: #4A4A4A; font-family: 'Montserrat', sans-serif; }
  .pt-hero { background: #2D132C; border-bottom: none; padding: 48px 24px 0; }
  .pt-avatar-wrap { position: relative; display: inline-block; margin-bottom: 16px; }
  .pt-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(212,163,115,0.5); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white; object-fit: cover; }
  .pt-avatar-badge { position: absolute; bottom: 2px; right: 2px; background: #D4A373; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid #2D132C; cursor: pointer; }
  .pt-nombre { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; margin: 0 0 4px; color: #F4EEED; letter-spacing: -1px; }
  .pt-email { font-size: 13px; color: rgba(244,238,237,0.5); margin-bottom: 16px; }
  .pt-tabs { display: flex; gap: 0; margin-top: 24px; overflow-x: auto; }
  .pt-tab { padding: 10px 20px 14px; background: transparent; border: none; border-bottom: 3px solid transparent; color: rgba(244,238,237,0.45); font-size: 11px; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: all 0.2s; white-space: nowrap; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .pt-tab.activo { border-bottom-color: #C72C41; color: #F4EEED; }
  .pt-section { padding: 32px 24px; max-width: 760px; margin: 0 auto; }
  .pt-section-titulo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #2D132C; margin: 0 0 20px; letter-spacing: -0.5px; }
  .pt-card { background: white; border: 1px solid rgba(45,19,44,0.08); border-radius: 8px; padding: 20px; margin-bottom: 12px; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 1px 6px rgba(45,19,44,0.05); }
  .pt-card:hover { border-color: rgba(199,44,65,0.2); box-shadow: 0 4px 16px rgba(45,19,44,0.08); }
  .pt-reserva-estado { display: inline-block; font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase; }
  .pt-input { width: 100%; background: #F4EEED; border: 1.5px solid rgba(45,19,44,0.12); border-radius: 6px; padding: 12px 16px; color: #2D132C; font-size: 14px; font-family: 'Montserrat', sans-serif; outline: none; transition: border-color 0.2s; }
  .pt-input:focus { border-color: #C72C41; }
  .pt-btn-save { background: #C72C41; color: white; border: none; border-radius: 6px; padding: 12px 32px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: background 0.2s, transform 0.2s; letter-spacing: 1.5px; text-transform: uppercase; }
  .pt-btn-save:hover { background: #a01f30; transform: translateY(-1px); }
  .pt-hci { height: 5px; border-radius: 2px; background: rgba(45,19,44,0.08); overflow: hidden; margin-top: 8px; }
  .pt-hci-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }
  .pt-doc-box { border: 1.5px dashed rgba(45,19,44,0.2); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(45,19,44,0.03); }
  .pt-doc-box:hover { border-color: #C72C41; background: rgba(199,44,65,0.04); }
  .pt-doc-img { width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px; display: block; }
  .pt-filtro-btn { padding: 6px 16px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; border: 1.5px solid rgba(45,19,44,0.12); background: transparent; color: rgba(45,19,44,0.5); transition: all 0.2s; letter-spacing: 0.5px; text-transform: uppercase; }
  .pt-filtro-btn.activo { background: #2D132C; border-color: #2D132C; color: white; }
  .divider { height: 1px; background: rgba(45,19,44,0.08); margin: 8px 0 32px; }
  .pt-vacio { text-align: center; padding: 40px 0; color: rgba(45,19,44,0.4); }
`

const coloresAvatar = ['#d4537e', '#c4892a', '#7a3aa8', '#5DCAA5']

const estadoConfig = {
  pendiente:  { color: '#b07d45', bg: 'rgba(212,163,115,0.12)', texto: 'Pendiente'  },
  aceptada:   { color: '#2a7a56', bg: 'rgba(42,122,86,0.10)',   texto: 'Aceptada'   },
  rechazada:  { color: '#C72C41', bg: 'rgba(199,44,65,0.10)',   texto: 'Rechazada'  },
  completada: { color: '#2D132C', bg: 'rgba(45,19,44,0.10)',    texto: 'Completada' },
}

function calcularHCI(reservas) {
  const total = reservas.length
  if (total === 0) return { nivel: 'Sin datos aún', pct: 0, color: '#888' }
  const completadas = reservas.filter(r => r.estado === 'completada').length
  const pct = Math.min(Math.round((completadas / Math.max(total, 1)) * 80 + (total > 2 ? 20 : 0)), 100)
  if (pct >= 80) return { nivel: 'Muy confiable',   pct, color: '#5DCAA5' }
  if (pct >= 50) return { nivel: 'Confiable',        pct, color: '#e8b86d' }
  return               { nivel: 'En construcción',  pct, color: '#d4537e' }
}

export default function PerfilTrabajadora() {
  const navigate = useNavigate()
  const [usuario,         setUsuario]         = useState(null)
  const [perfil,          setPerfil]          = useState(null)
  const [reservas,        setReservas]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [pestana,         setPestana]         = useState('perfil')
  const [editando,        setEditando]        = useState(false)
  const [formData,        setFormData]        = useState({ nombre: '', apellido: '', region: '', comuna: '' })
  const [guardando,       setGuardando]       = useState(false)
  const [mensaje,         setMensaje]         = useState('')
  const [reservaAbierta,  setReservaAbierta]  = useState(null)
  const [respondiendo,    setRespondiendo]    = useState(false)
  const [subiendoFoto,    setSubiendoFoto]    = useState(false)
  const [subiendoCarnet,  setSubiendoCarnet]  = useState({ frente: false, dorso: false })
  const [filtroReservas,  setFiltroReservas]  = useState('todas')
  const [fotoAmpliada,    setFotoAmpliada]    = useState(null)
  const [chatReserva,     setChatReserva]     = useState(null)
  const [evaluarReserva,  setEvaluarReserva]  = useState(null)
  const [resenas,         setResenas]         = useState({ promedio: 0, total: 0, reviews: [] })

  useEffect(() => {
    const token        = localStorage.getItem('token')
    const userGuardado = localStorage.getItem('usuario')
    if (!token || !userGuardado) { navigate('/login'); return }
    const u = JSON.parse(userGuardado)
    if (u.tipo === 'clienta') { navigate('/perfil/clienta'); return }
    if (u.tipo === 'admin')   { navigate('/perfil/admin');   return }
    setUsuario(u)
    setFormData({ nombre: u.nombre || '', apellido: u.apellido || '', region: u.region || '', comuna: u.comuna || '' })
    fetchDatos(token)
  }, [])

  async function fetchDatos(token) {
    try {
      const [resReservas, resPerfil] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/bookings/mis-reservas', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/workers/mi-perfil',     { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (resReservas.status === 'fulfilled') setReservas(resReservas.value.data)
      if (resPerfil.status   === 'fulfilled') setPerfil(resPerfil.value.data)
      const u = JSON.parse(localStorage.getItem('usuario') || '{}')
      if (u._id) {
        const resResenas = await axios.get(`http://localhost:5000/api/reviews/${u._id}`)
        setResenas(resResenas.data)
      }
    } catch (err) {
      console.error('Error cargando datos trabajadora:', err)
    } finally {
      setLoading(false)
    }
  }

  async function responderReserva(reservaId, accion) {
    setRespondiendo(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:5000/api/bookings/${reservaId}/${accion}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservas(prev => prev.map(r =>
        r._id === reservaId
          ? { ...r, estado: accion === 'aceptar' ? 'aceptada' : 'rechazada' }
          : r
      ))
      setReservaAbierta(null)
    } catch (err) {
      console.error('Error al responder reserva:', err)
    } finally {
      setRespondiendo(false)
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoFoto(true)
    try {
      const token = localStorage.getItem('token')
      const fd    = new FormData()
      fd.append('image', file)
      const res = await axios.post('http://localhost:5000/api/auth/upload-photo', fd, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userActualizado = { ...usuario, foto: res.data.foto }
      localStorage.setItem('usuario', JSON.stringify(userActualizado))
      setUsuario(userActualizado)
      setMensaje('¡Foto de perfil actualizada!')
      setTimeout(() => setMensaje(''), 3000)
    } catch {
      setMensaje('Error al subir la foto.')
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
      const token = localStorage.getItem('token')
      const fd    = new FormData()
      fd.append('image', file)
      const res = await axios.post(
        `http://localhost:5000/api/auth/upload-carnet?lado=${lado}`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const campo          = lado === 'frente' ? 'carnetFrenteUrl' : 'carnetDorsoUrl'
      const userActualizado = { ...usuario, [campo]: res.data.url, estadoVerificacion: 'enviado' }
      localStorage.setItem('usuario', JSON.stringify(userActualizado))
      setUsuario(userActualizado)
      setMensaje(`Documento (${lado}) subido. Tu verificación está en revisión.`)
      setTimeout(() => setMensaje(''), 4000)
    } catch {
      setMensaje('Error al subir el documento.')
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
  const colorAvatar = coloresAvatar[usuario._id?.charCodeAt(0) % coloresAvatar.length] || '#d4537e'
  const hci         = calcularHCI(reservas)
  const nombre      = `${usuario.nombre} ${usuario.apellido}`

  const tabs = [
    { id: 'perfil',       label: '👤 Mi perfil'    },
    { id: 'servicios',    label: '🛠️ Mis servicios' },
    { id: 'reservas',     label: '📅 Reservas'      },
    { id: 'verificacion', label: '🪪 Verificación'  },
    { id: 'resenas',      label: '⭐ Reseñas'       },
  ]

  const reservasFiltradas = filtroReservas === 'todas'
    ? reservas
    : filtroReservas === 'activas'
      ? reservas.filter(r => r.estado === 'pendiente' || r.estado === 'aceptada')
      : reservas.filter(r => r.estado === 'completada' || r.estado === 'rechazada')

  return (
    <>
      <style>{styles}</style>
      <div className="pt-root">
        <Navbar />

        {/* HERO */}
        <div className="pt-hero">
          <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="pt-avatar-wrap">
              {usuario.foto
                ? <img src={usuario.foto} className="pt-avatar" alt="foto" style={{ borderRadius: '50%' }} />
                : <div className="pt-avatar" style={{ background: colorAvatar }}>{iniciales || '?'}</div>
              }
              <label htmlFor="foto-trabajadora" className="pt-avatar-badge" title={subiendoFoto ? 'Subiendo…' : 'Cambiar foto'}>
                {subiendoFoto ? '⏳' : '📷'}
              </label>
              <input id="foto-trabajadora" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} disabled={subiendoFoto} />
            </div>
            <h1 className="pt-nombre">{nombre}</h1>
            <p className="pt-email">{usuario.email}</p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px',
              borderRadius: '4px', fontSize: '11px', fontWeight: '700',
              background: 'rgba(212,163,115,0.15)', color: '#b07d45', border: '1px solid rgba(212,163,115,0.35)',
              letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
            }}>
              🛠️ Trabajadora
            </span>

            {/* HCI */}
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '24px', background: 'white', border: '1px solid rgba(45,19,44,0.1)', borderRadius: '8px', padding: '16px 20px', boxShadow: '0 2px 10px rgba(45,19,44,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(45,19,44,0.5)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>Hana Confidence Index</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: hci.color }}>{hci.nivel}</span>
              </div>
              <div className="pt-hci">
                <div className="pt-hci-fill" style={{ width: `${hci.pct}%`, background: hci.color }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(45,19,44,0.4)', marginTop: '8px', marginBottom: 0, lineHeight: '1.6', fontFamily: 'Montserrat, sans-serif' }}>
                Tu índice sube con cada servicio completado y bien evaluado.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '16px', width: '100%' }}>
              {[
                { num: reservas.length,                                              label: 'Recibidas'  },
                { num: reservas.filter(r => r.estado === 'completada').length,       label: 'Completadas'},
                { num: reservas.filter(r => r.estado === 'pendiente').length,        label: 'Pendientes' },
              ].map(s => (
                <div key={s.label} style={{ background: '#2D132C', border: '1px solid rgba(212,163,115,0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(45,19,44,0.15)' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '900', color: '#D4A373' }}>{s.num}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(212,163,115,0.6)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="pt-tabs">
              {tabs.map(t => (
                <button key={t.id} className={`pt-tab${pestana === t.id ? ' activo' : ''}`} onClick={() => setPestana(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="pt-section">

          {/* ── PERFIL ── */}
          {pestana === 'perfil' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="pt-section-titulo" style={{ margin: 0 }}>Mis datos</h2>
                {!editando && (
                  <button onClick={() => setEditando(true)} style={{ background: 'transparent', border: '1.5px solid rgba(45,19,44,0.2)', color: 'rgba(45,19,44,0.6)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Editar
                  </button>
                )}
              </div>
              <div className="divider" />

              {mensaje && (
                <div style={{ background: mensaje.includes('Error') ? 'rgba(199,44,65,0.07)' : 'rgba(42,122,86,0.07)', border: `1px solid ${mensaje.includes('Error') ? 'rgba(199,44,65,0.3)' : 'rgba(42,122,86,0.3)'}`, borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: mensaje.includes('Error') ? '#C72C41' : '#2a7a56', fontFamily: 'Montserrat, sans-serif' }}>
                  {mensaje}
                </div>
              )}

              {editando ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'nombre',   label: 'Nombre',   placeholder: 'Tu nombre'          },
                    { key: 'apellido', label: 'Apellido', placeholder: 'Tu apellido'         },
                    { key: 'region',   label: 'Región',   placeholder: 'Ej: Metropolitana'  },
                    { key: 'comuna',   label: 'Comuna',   placeholder: 'Ej: Santiago'        },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '10px', color: 'rgba(45,19,44,0.5)', display: 'block', marginBottom: '6px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>{f.label}</label>
                      <input className="pt-input" placeholder={f.placeholder} value={formData[f.key]}
                        onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button className="pt-btn-save" onClick={handleGuardar} disabled={guardando}>
                      {guardando ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    <button onClick={() => setEditando(false)} style={{ background: 'transparent', border: '1px solid rgba(45,19,44,0.2)', color: 'rgba(45,19,44,0.55)', padding: '12px 24px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-card">
                  {[
                    { label: 'Nombre completo', valor: nombre },
                    { label: 'Email',            valor: usuario.email },
                    { label: 'Región',           valor: usuario.region  || 'No especificada' },
                    { label: 'Comuna',           valor: usuario.comuna  || 'No especificada' },
                    { label: 'Categoría',        valor: perfil?.categoria || 'Sin configurar' },
                    { label: 'Compromiso Hana',  valor: usuario.aceptoCompromiso ? '✓ Aceptado' : '✗ Pendiente' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(45,19,44,0.07)' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(45,19,44,0.5)' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: '#2D132C', fontWeight: '500' }}>{item.valor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SERVICIOS ── */}
          {pestana === 'servicios' && (
            <div>
              <h2 className="pt-section-titulo">Mis servicios</h2>
              <div className="divider" />
              {perfil ? (
                <div className="pt-card">
                  {[
                    { label: 'Categoría',   valor: perfil.categoria   || 'Sin configurar' },
                    { label: 'Descripción', valor: perfil.descripcion || 'Sin descripción' },
                    { label: 'Precio base', valor: perfil.precio ? `$${perfil.precio.toLocaleString('es-CL')}` : 'Sin configurar' },
                    { label: 'Disponible',  valor: perfil.disponible ? '✅ Sí' : '❌ No' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(45,19,44,0.07)' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(45,19,44,0.5)' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: '#2D132C', fontWeight: '500' }}>{item.valor}</span>
                    </div>
                  ))}
                  <Link to={`/worker/${perfil._id}`} style={{ display: 'inline-block', marginTop: '16px', fontSize: '13px', color: '#e8b86d', textDecoration: 'none', borderBottom: '1px solid rgba(232,184,109,0.3)' }}>
                    Ver mi perfil público →
                  </Link>
                </div>
              ) : (
                <div className="pt-vacio">
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛠️</div>
                  <p style={{ color: 'rgba(45,19,44,0.45)', fontSize: '14px' }}>Aún no tienes un perfil profesional creado.</p>
                  <Link to="/register-worker" style={{ display: 'inline-block', marginTop: '20px', background: 'rgba(212,83,126,0.15)', border: '1px solid #d4537e', color: '#d4537e', padding: '10px 24px', borderRadius: '50px', textDecoration: 'none', fontSize: '13px' }}>
                    Crear perfil profesional →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── RESERVAS ── */}
          {pestana === 'reservas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h2 className="pt-section-titulo" style={{ margin: 0 }}>Reservas recibidas</h2>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'todas',     label: `Todas (${reservas.length})` },
                    { id: 'activas',   label: `Activas (${reservas.filter(r => r.estado === 'pendiente' || r.estado === 'aceptada').length})` },
                    { id: 'historial', label: 'Historial' },
                  ].map(f => (
                    <button key={f.id} className={`pt-filtro-btn${filtroReservas === f.id ? ' activo' : ''}`} onClick={() => setFiltroReservas(f.id)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divider" />
              {reservas.length === 0 ? (
                <div className="pt-vacio">
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                  <p style={{ color: 'rgba(45,19,44,0.45)', fontSize: '14px' }}>Aún no tienes reservas recibidas.</p>
                </div>
              ) : reservasFiltradas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(45,19,44,0.4)', fontSize: '13px' }}>
                  No hay reservas en esta categoría.
                </div>
              ) : (
                reservasFiltradas.map(r => {
                  const cfg          = estadoConfig[r.estado] || estadoConfig.pendiente
                  const clientaNombre = r.clienta ? `${r.clienta.nombre} ${r.clienta.apellido}` : 'Clienta'
                  const abierta      = reservaAbierta === r._id

                  const clientaVerificada  = r.clienta?.verificada
                  const clientaEstado      = r.clienta?.estadoVerificacion

                  return (
                    <div key={r._id} className="pt-card" style={{ borderColor: abierta ? 'rgba(212,83,126,0.5)' : undefined }}>
                      {/* Cabecera — siempre visible */}
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
                        onClick={() => setReservaAbierta(abierta ? null : r._id)}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D132C', marginBottom: '4px' }}>{r.servicio}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(45,19,44,0.55)' }}>Solicitado por {clientaNombre}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(45,19,44,0.45)', marginTop: '4px' }}>
                            📅 {r.fecha ? new Date(r.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha por confirmar'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span className="pt-reserva-estado" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50` }}>
                            {cfg.texto}
                          </span>
                          <span style={{ fontSize: '12px', color: 'rgba(45,19,44,0.35)' }}>{abierta ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Detalle expandido */}
                      {abierta && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>

                          {/* Info de la clienta */}
                          <div style={{ background: '#0f0205', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Clienta</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                              {/* Foto clienta con zoom */}
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                {r.clienta?.foto ? (
                                  <img
                                    src={r.clienta.foto}
                                    alt={clientaNombre}
                                    onClick={e => { e.stopPropagation(); setFotoAmpliada(r.clienta.foto) }}
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,83,126,0.4)', cursor: 'zoom-in', display: 'block' }}
                                    title="Click para ampliar"
                                  />
                                ) : (
                                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#7a3aa8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: 'white', border: '2px solid rgba(212,83,126,0.3)' }}>
                                    {clientaNombre.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                {r.clienta?.foto && (
                                  <div
                                    onClick={e => { e.stopPropagation(); setFotoAmpliada(r.clienta.foto) }}
                                    style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'zoom-in' }}
                                    title="Ampliar foto"
                                  >🔍</div>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{clientaNombre}</div>
                                  {r.clienta?._id && (
                                    <Link
                                      to={`/clienta/${r.clienta._id}`}
                                      onClick={e => e.stopPropagation()}
                                      style={{ fontSize: '10px', color: '#e8b86d', border: '1px solid rgba(232,184,109,0.35)', borderRadius: '4px', padding: '2px 8px', textDecoration: 'none', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}
                                    >
                                      Ver perfil
                                    </Link>
                                  )}
                                </div>
                                {r.clienta?.email && (
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{r.clienta.email}</div>
                                )}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                  {clientaVerificada ? (
                                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '50px', background: 'rgba(93,202,165,0.15)', color: '#5DCAA5', border: '1px solid rgba(93,202,165,0.3)' }}>
                                      ✓ Verificada
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '50px', background: 'rgba(232,184,109,0.12)', color: '#e8b86d', border: '1px solid rgba(232,184,109,0.25)' }}>
                                      {clientaEstado === 'enviado' ? '🕐 En revisión' : '⚠ Sin verificar'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notas de la clienta */}
                          {r.descripcion ? (
                            <div style={{ background: '#0f0205', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Mensaje de la clienta</div>
                              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>{r.descripcion}</p>
                            </div>
                          ) : (
                            <div style={{ background: '#0f0205', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0, fontStyle: 'italic' }}>La clienta no dejó comentarios adicionales.</p>
                            </div>
                          )}

                          {/* Botones aceptar / rechazar solo para pendientes */}
                          {r.estado === 'pendiente' && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => responderReserva(r._id, 'aceptar')}
                                disabled={respondiendo}
                                style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'rgba(93,202,165,0.15)', border: '1px solid rgba(93,202,165,0.4)', color: '#5DCAA5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                              >
                                ✓ Aceptar reserva
                              </button>
                              <button
                                onClick={() => responderReserva(r._id, 'rechazar')}
                                disabled={respondiendo}
                                style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'rgba(212,83,126,0.12)', border: '1px solid rgba(212,83,126,0.35)', color: '#d4537e', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                              >
                                ✕ Rechazar
                              </button>
                            </div>
                          )}

                          {/* Chat y evaluar para reservas aceptadas o completadas */}
                          {(r.estado === 'aceptada' || r.estado === 'completada') && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => setChatReserva(r)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(93,202,165,0.1)', border: '1px solid rgba(93,202,165,0.35)', color: '#5DCAA5', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                              >
                                💬 Chat con clienta
                              </button>
                              <button
                                onClick={() => setEvaluarReserva(r)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.35)', color: '#e8b86d', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                              >
                                ⭐ Evaluar clienta
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
          )}

          {/* ── VERIFICACIÓN ── */}
          {pestana === 'verificacion' && (
            <div>
              <h2 className="pt-section-titulo">Verificación de identidad</h2>
              <div className="divider" />
              <p style={{ fontSize: '13px', color: 'rgba(45,19,44,0.55)', marginBottom: '20px', lineHeight: '1.7' }}>
                Sube una foto de tu cédula de identidad por ambos lados. El equipo Hana revisará tu documentación para verificar tu cuenta.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { lado: 'frente', label: 'Frente de la cédula', campo: 'carnetFrenteUrl' },
                  { lado: 'dorso',  label: 'Dorso de la cédula',  campo: 'carnetDorsoUrl'  },
                ].map(({ lado, label, campo }) => (
                  <div key={lado}>
                    <p style={{ fontSize: '12px', color: 'rgba(45,19,44,0.55)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <label htmlFor={`carnet-t-${lado}`} style={{ display: 'block' }}>
                      <div className="pt-doc-box">
                        {subiendoCarnet[lado] ? (
                          <div style={{ padding: '24px 0', color: '#e8b86d', fontSize: '13px' }}>⏳ Subiendo…</div>
                        ) : usuario[campo] ? (
                          <img src={usuario[campo]} className="pt-doc-img" alt={label} />
                        ) : (
                          <div style={{ padding: '24px 0' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🪪</div>
                            <p style={{ fontSize: '12px', color: 'rgba(45,19,44,0.45)', margin: 0 }}>Click para subir imagen</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id={`carnet-t-${lado}`}
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
                <div style={{ marginTop: '16px', background: 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.25)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#e8b86d' }}>
                  🕐 Tu documentación está siendo revisada por el equipo Hana.
                </div>
              )}
              {usuario.estadoVerificacion === 'aprobado' && (
                <div style={{ marginTop: '16px', background: 'rgba(93,202,165,0.08)', border: '1px solid rgba(93,202,165,0.25)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#5DCAA5' }}>
                  ✓ Tu identidad ha sido verificada exitosamente.
                </div>
              )}
              {usuario.estadoVerificacion === 'rechazado' && (
                <div style={{ marginTop: '16px', background: 'rgba(212,83,126,0.08)', border: '1px solid rgba(212,83,126,0.25)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#d4537e' }}>
                  ✕ Tu verificación fue rechazada. Vuelve a subir tus documentos con mejor calidad.
                </div>
              )}
            </div>
          )}

          {/* ── RESEÑAS ── */}
          {pestana === 'resenas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="pt-section-titulo" style={{ margin: 0 }}>Reseñas recibidas</h2>
                {resenas.total > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#2D132C', fontFamily: 'Playfair Display, serif' }}>{resenas.promedio}</span>
                    <div>
                      <div style={{ fontSize: '14px', letterSpacing: '2px', color: '#D4A373' }}>
                        {'★'.repeat(Math.round(resenas.promedio))}{'☆'.repeat(5 - Math.round(resenas.promedio))}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(45,19,44,0.45)', marginTop: '1px' }}>{resenas.total} reseña{resenas.total !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="divider" />
              {resenas.reviews.length === 0 ? (
                <div className="pt-vacio">
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
                  <p style={{ color: 'rgba(45,19,44,0.45)', fontSize: '14px' }}>Las reseñas de tus clientas aparecerán aquí.</p>
                </div>
              ) : (
                resenas.reviews.map(rev => (
                  <div key={rev._id} className="pt-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {rev.autor?.foto ? (
                          <img src={rev.autor.foto} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,163,115,0.3)' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#d4537e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white' }}>
                            {rev.autor?.nombre?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#2D132C' }}>
                            {rev.autor?.nombre} {rev.autor?.apellido}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(45,19,44,0.4)', marginTop: '1px' }}>
                            {new Date(rev.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', letterSpacing: '2px', color: '#D4A373' }}>
                        {'★'.repeat(rev.estrellas)}{'☆'.repeat(5 - rev.estrellas)}
                      </div>
                    </div>
                    {rev.comentario && (
                      <p style={{ fontSize: '13px', color: 'rgba(45,19,44,0.7)', lineHeight: '1.65', margin: 0, paddingTop: '10px', borderTop: '1px solid rgba(45,19,44,0.07)' }}>
                        "{rev.comentario}"
                      </p>
                    )}
                  </div>
                ))
              )}
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
          otraPersona={chatReserva.clienta}
          onClose={() => setChatReserva(null)}
        />
      )}

      {/* Evaluar modal */}
      {evaluarReserva && usuario && (
        <EvaluarModal
          reserva={evaluarReserva}
          miUsuario={usuario}
          destinataria={evaluarReserva.clienta}
          tipo="trabajadora_a_clienta"
          onClose={() => setEvaluarReserva(null)}
          onExito={() => fetchDatos(localStorage.getItem('token'))}
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
