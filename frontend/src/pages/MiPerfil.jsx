import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ─────────────────────────────────────────
   ESTILOS
───────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.mp-root {
  background: #0f0508;
  min-height: 100vh;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
}

/* ── HERO HEADER ── */
.mp-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #1a0a10 0%, #2d0a1e 60%, #1a0a10 100%);
  border-bottom: 1px solid rgba(212,83,126,0.2);
  padding: 52px 24px 40px;
}
.mp-hero::before {
  content: '';
  position: absolute;
  top: -40px; right: -80px;
  width: 340px; height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,83,126,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.mp-hero-inner {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 28px;
  flex-wrap: wrap;
}

/* Avatar */
.mp-avatar-zona {
  position: relative;
  flex-shrink: 0;
}
.mp-avatar {
  width: 100px; height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(212,83,126,0.5);
  object-fit: cover;
  display: block;
  background: #2d0a1e;
}
.mp-avatar-iniciales {
  width: 100px; height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(212,83,126,0.5);
  display: flex; align-items: center; justify-content: center;
  font-size: 34px; font-weight: 700; color: #fff;
}
.mp-avatar-btn {
  position: absolute;
  bottom: 0; right: 0;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #d4537e;
  border: 2px solid #0f0508;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s, transform 0.2s;
}
.mp-avatar-btn:hover { background: #b83060; transform: scale(1.1); }
.mp-avatar-cargando {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: rgba(15,5,8,0.7);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #d4537e;
}

/* Info */
.mp-hero-info { flex: 1; min-width: 200px; }
.mp-nombre {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px; font-weight: 700;
  color: #fff; margin: 0 0 4px;
  line-height: 1.1;
}
.mp-email { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
.mp-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.mp-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 50px;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.3px;
}

/* ── VERIFICACION BANNER ── */
.mp-verificacion-banner {
  max-width: 780px; margin: 24px auto 0;
  border-radius: 14px; padding: 16px 20px;
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
}
.mp-ver-icon { font-size: 22px; flex-shrink: 0; }
.mp-ver-titulo { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.mp-ver-desc { font-size: 12px; color: rgba(255,255,255,0.5); }

/* ── TABS ── */
.mp-tabs {
  max-width: 780px; margin: 32px auto 0;
  display: flex; gap: 4px; padding: 0 24px;
  border-bottom: 1px solid rgba(212,83,126,0.12);
}
.mp-tab {
  padding: 10px 18px;
  background: transparent; border: none;
  color: rgba(255,255,255,0.4);
  font-size: 13px; font-weight: 500;
  cursor: pointer; position: relative;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.mp-tab:hover { color: rgba(255,255,255,0.7); }
.mp-tab.activo {
  color: #fff;
  border-bottom-color: #d4537e;
}

/* ── CONTENIDO ── */
.mp-contenido {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* ── CARDS ── */
.mp-card {
  background: #1a0a10;
  border: 1px solid rgba(212,83,126,0.18);
  border-radius: 16px; padding: 24px;
  margin-bottom: 20px;
  transition: border-color 0.2s;
}
.mp-card:hover { border-color: rgba(212,83,126,0.35); }
.mp-card-titulo {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 18px;
  display: flex; align-items: center; gap: 8px;
}
.mp-card-titulo span { color: rgba(255,255,255,0.25); font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; }

/* ── CAMPO DE DATO ── */
.mp-dato-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.mp-dato-row:last-child { border-bottom: none; }
.mp-dato-label { font-size: 13px; color: rgba(255,255,255,0.35); }
.mp-dato-valor { font-size: 13px; font-weight: 500; color: #fff; }

/* ── FORM INPUTS ── */
.mp-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,83,126,0.25);
  border-radius: 10px;
  padding: 11px 14px;
  color: #fff; font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.mp-input:focus { border-color: #d4537e; background: rgba(212,83,126,0.06); }
.mp-input::placeholder { color: rgba(255,255,255,0.2); }
.mp-label {
  font-size: 11px; color: rgba(255,255,255,0.4);
  letter-spacing: 0.5px; text-transform: uppercase;
  display: block; margin-bottom: 6px;
}
.mp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media(max-width: 520px) { .mp-form-grid { grid-template-columns: 1fr; } }

/* ── BOTONES ── */
.mp-btn-rosa {
  background: linear-gradient(135deg, #d4537e, #b83060);
  color: #fff; border: none; border-radius: 50px;
  padding: 11px 28px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: transform 0.2s, box-shadow 0.2s;
  display: inline-flex; align-items: center; gap: 6px;
}
.mp-btn-rosa:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,83,126,0.35); }
.mp-btn-rosa:disabled { opacity: 0.5; cursor: not-allowed; }
.mp-btn-ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.45);
  border-radius: 50px; padding: 11px 24px;
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  cursor: pointer; transition: all 0.2s;
}
.mp-btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.7); }
.mp-btn-dorado {
  background: rgba(232,184,109,0.12);
  border: 1px solid rgba(232,184,109,0.4);
  color: #e8b86d; border-radius: 50px;
  padding: 11px 28px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 6px;
}
.mp-btn-dorado:hover:not(:disabled) { background: rgba(232,184,109,0.2); }
.mp-btn-dorado:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── CARNET ZONA ── */
.mp-carnet-zona {
  border: 2px dashed rgba(212,83,126,0.3);
  border-radius: 14px; padding: 32px 20px;
  text-align: center; cursor: pointer;
  transition: all 0.25s;
  background: rgba(212,83,126,0.03);
}
.mp-carnet-zona:hover, .mp-carnet-zona.dragover {
  border-color: #d4537e;
  background: rgba(212,83,126,0.08);
}
.mp-carnet-preview {
  width: 100%; max-width: 320px;
  border-radius: 10px; border: 1px solid rgba(212,83,126,0.3);
  margin: 0 auto 14px; display: block;
  object-fit: cover; max-height: 200px;
}

/* ── ESTADO VERIFICACIÓN ── */
.mp-estado-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 50px;
  font-size: 11px; font-weight: 600;
}

/* ── RESERVAS ── */
.mp-reserva-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(212,83,126,0.15);
  border-radius: 12px; padding: 16px 18px;
  margin-bottom: 10px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; flex-wrap: wrap;
  transition: border-color 0.2s;
}
.mp-reserva-card:hover { border-color: rgba(212,83,126,0.35); }
.mp-reserva-estado {
  display: inline-block; font-size: 10px; font-weight: 600;
  padding: 3px 10px; border-radius: 50px;
  letter-spacing: 0.5px; text-transform: uppercase;
  flex-shrink: 0;
}

/* ── CONFIANZA BAR ── */
.mp-bar-bg { height: 6px; border-radius: 50px; background: rgba(255,255,255,0.07); overflow: hidden; }
.mp-bar-fill { height: 100%; border-radius: 50px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }

/* ── ALERTA ── */
.mp-alerta {
  border-radius: 10px; padding: 12px 16px;
  margin-bottom: 16px; font-size: 13px;
  display: flex; align-items: center; gap: 8px;
  animation: mp-fade-in 0.2s ease;
}
@keyframes mp-fade-in { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }
.mp-alerta.ok  { background: rgba(93,202,165,0.12);  border: 1px solid rgba(93,202,165,0.3);  color: #5DCAA5; }
.mp-alerta.err { background: rgba(212,83,126,0.12);  border: 1px solid rgba(212,83,126,0.3);  color: #ffb8d1; }
.mp-alerta.info{ background: rgba(232,184,109,0.1);  border: 1px solid rgba(232,184,109,0.3); color: #e8b86d; }

/* ── DIVIDER ── */
.mp-divider { height:1px; background: rgba(212,83,126,0.1); margin: 20px 0; }
`

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const COLORES_AVATAR = ['#d4537e','#c4892a','#7a3aa8','#5DCAA5','#b83060']

const ESTADO_CFG = {
  pendiente:  { color:'#e8b86d', bg:'rgba(232,184,109,0.12)', border:'rgba(232,184,109,0.3)', txt:'Pendiente'  },
  aceptada:   { color:'#5DCAA5', bg:'rgba(93,202,165,0.12)',  border:'rgba(93,202,165,0.3)',  txt:'Aceptada'   },
  rechazada:  { color:'#d4537e', bg:'rgba(212,83,126,0.12)',  border:'rgba(212,83,126,0.3)',  txt:'Rechazada'  },
  completada: { color:'#9b6fd4', bg:'rgba(155,111,212,0.12)', border:'rgba(155,111,212,0.3)', txt:'Completada' },
}

function calcConfianza(reservas) {
  if (!reservas.length) return { nivel:'Nueva usuaria', pct:8, color:'rgba(255,255,255,0.3)' }
  const comp = reservas.filter(r => r.estado === 'completada').length
  const pct = Math.min(Math.round((comp / reservas.length) * 75 + (reservas.length > 1 ? 15 : 5)), 100)
  if (pct >= 80) return { nivel:'Muy confiable', pct, color:'#5DCAA5' }
  if (pct >= 50) return { nivel:'Confiable',     pct, color:'#e8b86d' }
  return              { nivel:'En construcción', pct, color:'#d4537e' }
}

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
export default function MiPerfil() {
  const navigate = useNavigate()
  const fotoInputRef   = useRef()
  const carnetInputRef = useRef()
  const dropRef        = useRef()

  /* estado global */
  const [usuario,   setUsuario]   = useState(null)
  const [reservas,  setReservas]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('perfil')   // 'perfil' | 'verificacion' | 'reservas'
  const [alerta,    setAlerta]    = useState(null)

  /* subida de foto de perfil */
  const [fotoUrl,        setFotoUrl]        = useState(null)
  const [subiendoFoto,   setSubiendoFoto]   = useState(false)

  /* subida de carnet */
  const [carnetUrl,      setCarnetUrl]      = useState(null)
  const [carnetPreview,  setCarnetPreview]  = useState(null)
  const [subiendoCarnet, setSubiendoCarnet] = useState(false)
  const [estadoCarnet,   setEstadoCarnet]   = useState('sin_enviar')
  const [dragOver,       setDragOver]       = useState(false)

  /* edición de datos */
  const [editando,  setEditando]  = useState(false)
  const [form,      setForm]      = useState({ nombre:'', apellido:'', region:'', comuna:'' })
  const [guardando, setGuardando] = useState(false)

  /* ── carga inicial ── */
  useEffect(() => {
    const token = localStorage.getItem('token')
    // ✅ FIX: clave unificada 'usuario'
    const raw   = localStorage.getItem('usuario')
    if (!token || !raw) { navigate('/login'); return }

    const u = JSON.parse(raw)
    setUsuario(u)
    setForm({ nombre: u.nombre||'', apellido: u.apellido||'', region: u.region||'', comuna: u.comuna||'' })
    setFotoUrl(u.foto || null)

    /* estado carnet guardado localmente hasta tener backend de admin */
    const carnetGuardado = localStorage.getItem(`hana_carnet_${u._id}`)
    if (carnetGuardado) {
      const data = JSON.parse(carnetGuardado)
      setCarnetUrl(data.url || null)
      setCarnetPreview(data.preview || null)
      setEstadoCarnet(data.estado || 'sin_enviar')
    }

    fetchReservas(token)
  }, [])

  async function fetchReservas(token) {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/mis-reservas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservas(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  /* ── mostrar alerta temporal ── */
  function mostrarAlerta(tipo, msg, ms = 4000) {
    setAlerta({ tipo, msg })
    setTimeout(() => setAlerta(null), ms)
  }

  /* ── subir foto de perfil ── */
  async function subirFotoPerfil(file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { mostrarAlerta('err', 'La imagen no puede pesar más de 5 MB'); return }

    setSubiendoFoto(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('foto', file)

      const res = await axios.post('http://localhost:5000/api/upload/foto-perfil', fd, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const nuevaUrl = res.data.url
      setFotoUrl(nuevaUrl)

      // ✅ FIX: clave unificada 'usuario' (antes era 'user')
      const u = JSON.parse(localStorage.getItem('usuario'))
      const uActualizado = { ...u, foto: nuevaUrl }
      localStorage.setItem('usuario', JSON.stringify(uActualizado))
      setUsuario(uActualizado)

      mostrarAlerta('ok', '¡Foto de perfil actualizada!')
    } catch(e) {
      mostrarAlerta('err', e.response?.data?.message || 'Error al subir la foto. Intenta de nuevo.')
    } finally {
      setSubiendoFoto(false)
    }
  }

  /* ── subir carnet ── */
  async function subirCarnet(file) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { mostrarAlerta('err', 'El documento no puede pesar más de 10 MB'); return }

    /* preview local inmediata */
    const reader = new FileReader()
    reader.onload = ev => setCarnetPreview(ev.target.result)
    reader.readAsDataURL(file)

    setSubiendoCarnet(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('carnet', file)

      const res = await axios.post('http://localhost:5000/api/upload/carnet', fd, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const url = res.data.url
      setCarnetUrl(url)
      setEstadoCarnet('enviado')

      // ✅ FIX: clave unificada 'usuario' (antes era 'user')
      const u = JSON.parse(localStorage.getItem('usuario'))
      localStorage.setItem(`hana_carnet_${u._id}`, JSON.stringify({ url, estado: 'enviado', preview: null }))

      mostrarAlerta('info', 'Documento enviado. El equipo Hana lo revisará en 24–48 hrs.')
    } catch(e) {
      mostrarAlerta('err', e.response?.data?.message || 'Error al enviar el documento. Intenta de nuevo.')
    } finally {
      setSubiendoCarnet(false)
    }
  }

  /* ── guardar datos personales ── */
  async function handleGuardar() {
    if (!form.nombre.trim() || !form.apellido.trim()) {
      mostrarAlerta('err', 'Nombre y apellido son obligatorios')
      return
    }
    setGuardando(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put('http://localhost:5000/api/auth/me', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // ✅ FIX: clave unificada 'usuario' (antes era 'user')
      const u = JSON.parse(localStorage.getItem('usuario'))
      const uActualizado = { ...u, ...form }
      localStorage.setItem('usuario', JSON.stringify(uActualizado))
      setUsuario(uActualizado)
      setEditando(false)
      mostrarAlerta('ok', 'Datos guardados correctamente')
    } catch(e) {
      mostrarAlerta('err', 'Error al guardar. Revisa tu conexión.')
    } finally {
      setGuardando(false)
    }
  }

  /* ── drag & drop carnet ── */
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) subirCarnet(file)
  }

  /* ─── render ─── */
  if (loading) return (
    <div style={{ background:'#0f0508', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#d4537e', fontSize:'14px' }}>Cargando tu perfil…</div>
    </div>
  )
  if (!usuario) return null

  const iniciales    = `${usuario.nombre?.charAt(0)||''}${usuario.apellido?.charAt(0)||''}`
  const colorAvatar  = COLORES_AVATAR[(usuario._id?.charCodeAt(3)||0) % COLORES_AVATAR.length]
  const nombre       = `${usuario.nombre} ${usuario.apellido}`
  const esTrabajadora = usuario.tipo === 'trabajadora'
  const confianza    = calcConfianza(reservas)
  const verificada   = estadoCarnet === 'aprobado'
  const carnetEnviado = estadoCarnet === 'enviado'

  /* badge de verificación */
  const badgeVer = verificada
    ? { txt:'Verificada ✓',  bg:'rgba(93,202,165,0.15)',  border:'rgba(93,202,165,0.4)',  color:'#5DCAA5' }
    : carnetEnviado
    ? { txt:'En revisión…',  bg:'rgba(232,184,109,0.12)', border:'rgba(232,184,109,0.4)', color:'#e8b86d' }
    : { txt:'Sin verificar', bg:'rgba(212,83,126,0.12)',  border:'rgba(212,83,126,0.3)',  color:'#d4537e' }

  return (
    <>
      <style>{css}</style>
      <div className="mp-root">
        <Navbar />

        {/* ── HERO ── */}
        <div className="mp-hero">
          <div className="mp-hero-inner">

            {/* Avatar + botón cámara */}
            <div className="mp-avatar-zona">
              {fotoUrl
                ? <img src={fotoUrl} className="mp-avatar" alt="foto" />
                : <div className="mp-avatar-iniciales" style={{ background: colorAvatar }}>{iniciales}</div>
              }
              {subiendoFoto && (
                <div className="mp-avatar-cargando">⟳</div>
              )}
              <label htmlFor="foto-input">
                <div className="mp-avatar-btn" title="Cambiar foto">📷</div>
              </label>
              <input
                id="foto-input" ref={fotoInputRef} type="file"
                accept="image/*" style={{ display:'none' }}
                onChange={e => subirFotoPerfil(e.target.files[0])}
              />
            </div>

            {/* Info */}
            <div className="mp-hero-info">
              <h1 className="mp-nombre">{nombre}</h1>
              <div className="mp-email">{usuario.email}</div>
              <div className="mp-badges">
                <span className="mp-badge" style={{ background: badgeVer.bg, border:`1px solid ${badgeVer.border}`, color: badgeVer.color }}>
                  {badgeVer.txt}
                </span>
                <span className="mp-badge" style={{ background:'rgba(212,83,126,0.12)', border:'1px solid rgba(212,83,126,0.3)', color:'#ffb8d1' }}>
                  🌸 {esTrabajadora ? 'Trabajadora' : 'Clienta'}
                </span>
                {usuario.region && (
                  <span className="mp-badge" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.45)' }}>
                    📍 {usuario.region}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Banner verificación pendiente */}
          {!verificada && (
            <div className="mp-verificacion-banner" style={{ background: carnetEnviado ? 'rgba(232,184,109,0.08)' : 'rgba(212,83,126,0.08)', border: `1px solid ${carnetEnviado ? 'rgba(232,184,109,0.25)' : 'rgba(212,83,126,0.25)'}`, borderRadius:'12px' }}>
              <span className="mp-ver-icon">{carnetEnviado ? '⏳' : '⚠️'}</span>
              <div style={{ flex:1 }}>
                <div className="mp-ver-titulo" style={{ color: carnetEnviado ? '#e8b86d' : '#ffb8d1' }}>
                  {carnetEnviado ? 'Verificación en proceso' : 'Verificación de identidad pendiente'}
                </div>
                <div className="mp-ver-desc">
                  {carnetEnviado
                    ? 'Tu documento fue recibido. Te avisaremos en 24–48 hrs.'
                    : 'Sube tu cédula de identidad para contratar o publicar servicios.'}
                </div>
              </div>
              {!carnetEnviado && (
                <button className="mp-btn-rosa" style={{ fontSize:'12px', padding:'8px 18px' }} onClick={() => setTab('verificacion')}>
                  Verificarme →
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div className="mp-tabs">
          {[
            { key:'perfil',       icon:'👤', label:'Mi perfil'      },
            { key:'verificacion', icon:'🪪', label:'Verificación'   },
            { key:'reservas',     icon:'📅', label:`Reservas (${reservas.length})` },
          ].map(t => (
            <button key={t.key} className={`mp-tab ${tab === t.key ? 'activo' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── CONTENIDO ── */}
        <div className="mp-contenido">

          {/* alerta global */}
          {alerta && (
            <div className={`mp-alerta ${alerta.tipo}`}>
              {alerta.tipo === 'ok' ? '✓' : alerta.tipo === 'err' ? '✕' : 'ℹ'} {alerta.msg}
            </div>
          )}

          {/* ──────────── TAB: PERFIL ──────────── */}
          {tab === 'perfil' && (
            <>
              {/* Datos personales */}
              <div className="mp-card">
                <div className="mp-card-titulo">
                  Datos personales
                  {!editando && (
                    <button onClick={() => setEditando(true)} style={{ marginLeft:'auto', background:'transparent', border:'1px solid rgba(212,83,126,0.3)', color:'#d4537e', padding:'4px 14px', borderRadius:'50px', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                      Editar
                    </button>
                  )}
                </div>

                {editando ? (
                  <>
                    <div className="mp-form-grid" style={{ marginBottom:'14px' }}>
                      {[
                        { key:'nombre',   label:'Nombre',   ph:'Tu nombre'        },
                        { key:'apellido', label:'Apellido', ph:'Tu apellido'      },
                        { key:'region',   label:'Región',   ph:'Ej: Metropolitana'},
                        { key:'comuna',   label:'Comuna',   ph:'Ej: Santiago'     },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="mp-label">{f.label}</label>
                          <input
                            className="mp-input"
                            placeholder={f.ph}
                            value={form[f.key]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:'10px' }}>
                      <button className="mp-btn-rosa" onClick={handleGuardar} disabled={guardando}>
                        {guardando ? 'Guardando…' : '✓ Guardar'}
                      </button>
                      <button className="mp-btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { label:'Nombre completo', valor: nombre },
                      { label:'Email',           valor: usuario.email },
                      { label:'Región',          valor: usuario.region  || '—' },
                      { label:'Comuna',          valor: usuario.comuna  || '—' },
                      { label:'Tipo de cuenta',  valor: esTrabajadora ? 'Trabajadora' : 'Clienta' },
                      { label:'Compromiso Hana', valor: usuario.aceptoCompromiso ? '✓ Aceptado' : '✗ Pendiente' },
                    ].map(item => (
                      <div key={item.label} className="mp-dato-row">
                        <span className="mp-dato-label">{item.label}</span>
                        <span className="mp-dato-valor">{item.valor}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Índice de confianza */}
              <div className="mp-card">
                <div className="mp-card-titulo">Índice de confianza Hana</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)' }}>{confianza.nivel}</span>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'26px', fontWeight:'700', color: confianza.color }}>{confianza.pct}%</span>
                </div>
                <div className="mp-bar-bg">
                  <div className="mp-bar-fill" style={{ width:`${confianza.pct}%`, background:`linear-gradient(90deg,${confianza.color},#e8b86d)` }} />
                </div>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'10px', lineHeight:'1.7' }}>
                  Aumenta completando servicios, verificando tu identidad y recibiendo buenas evaluaciones.
                </p>
                <div className="mp-divider" />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                  {[
                    { n: reservas.length,                                          l:'Reservas'    },
                    { n: reservas.filter(r=>r.estado==='completada').length,       l:'Completadas' },
                    { n: reservas.filter(r=>r.estado==='pendiente').length,        l:'Pendientes'  },
                  ].map(s => (
                    <div key={s.l} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'14px', textAlign:'center' }}>
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'26px', fontWeight:'700', color:'#e8b86d' }}>{s.n}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'3px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acceso al calendario si es trabajadora */}
              {esTrabajadora && (
                <div style={{ textAlign:'center' }}>
                  <Link
                    to="/mi-calendario"
                    style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'11px 28px', background:'rgba(212,83,126,0.1)', border:'1px solid rgba(212,83,126,0.3)', borderRadius:'50px', color:'#d4537e', textDecoration:'none', fontSize:'14px', fontWeight:'500', transition:'all 0.2s' }}
                  >
                    📅 Gestionar mi calendario de disponibilidad
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ──────────── TAB: VERIFICACIÓN ──────────── */}
          {tab === 'verificacion' && (
            <>
              {/* Estado actual */}
              <div className="mp-card" style={{ borderColor: verificada ? 'rgba(93,202,165,0.3)' : carnetEnviado ? 'rgba(232,184,109,0.3)' : 'rgba(212,83,126,0.18)' }}>
                <div className="mp-card-titulo">Estado de verificación</div>
                <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                  <div style={{ fontSize:'36px' }}>
                    {verificada ? '✅' : carnetEnviado ? '⏳' : '🪪'}
                  </div>
                  <div>
                    <div style={{ fontSize:'16px', fontWeight:'600', color:'#fff', marginBottom:'4px' }}>
                      {verificada ? 'Identidad verificada' : carnetEnviado ? 'En revisión' : 'Sin verificar'}
                    </div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', lineHeight:'1.6' }}>
                      {verificada
                        ? 'Tu identidad fue confirmada por el equipo Hana. Puedes usar la plataforma con plenos permisos.'
                        : carnetEnviado
                        ? 'Tu documento está siendo revisado. Te notificaremos al correo registrado en 24–48 hrs hábiles.'
                        : 'Sube una foto de tu cédula de identidad (RUT) para que el equipo Hana confirme tu identidad.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Por qué verificarse */}
              {!verificada && (
                <div className="mp-card">
                  <div className="mp-card-titulo">¿Por qué es obligatorio?</div>
                  {[
                    { icon:'🔒', txt:'Garantiza que todas las usuarias son personas reales' },
                    { icon:'🤝', txt:'Genera confianza entre clientas y trabajadoras' },
                    { icon:'⚠️', txt:'Protege a la comunidad de perfiles falsos o abusivos' },
                    { icon:'✓',  txt:'Es requisito para contratar o publicar servicios en Hana' },
                  ].map(item => (
                    <div key={item.txt} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize:'16px', marginTop:'1px', flexShrink:0 }}>{item.icon}</span>
                      <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:'1.6' }}>{item.txt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Zona subida de carnet */}
              {!verificada && (
                <div className="mp-card">
                  <div className="mp-card-titulo">
                    Subir cédula de identidad
                    <span>· Solo el equipo Hana accede a esta imagen</span>
                  </div>

                  {carnetPreview && (
                    <img src={carnetPreview} className="mp-carnet-preview" alt="Vista previa carnet" />
                  )}

                  <div
                    ref={dropRef}
                    className={`mp-carnet-zona ${dragOver ? 'dragover' : ''}`}
                    onClick={() => carnetInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div style={{ fontSize:'32px', marginBottom:'12px' }}>
                      {subiendoCarnet ? '⟳' : carnetPreview ? '🔄' : '📄'}
                    </div>
                    <div style={{ fontSize:'14px', fontWeight:'500', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
                      {subiendoCarnet
                        ? 'Subiendo documento…'
                        : carnetPreview
                        ? 'Haz clic para cambiar la imagen'
                        : 'Arrastra aquí o haz clic para seleccionar'}
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>
                      JPG, PNG o PDF · máx. 10 MB
                    </div>
                  </div>
                  <input
                    ref={carnetInputRef} type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    style={{ display:'none' }}
                    onChange={e => subirCarnet(e.target.files[0])}
                  />

                  {carnetPreview && !carnetEnviado && !subiendoCarnet && (
                    <div style={{ marginTop:'14px' }}>
                      <button
                        className="mp-btn-dorado"
                        onClick={() => carnetInputRef.current?.click()}
                        disabled={subiendoCarnet}
                      >
                        📤 Enviar para verificación
                      </button>
                    </div>
                  )}

                  {carnetEnviado && (
                    <div className="mp-alerta info" style={{ marginTop:'14px', marginBottom:0 }}>
                      ✓ Documento enviado. Revisión en 24–48 hrs hábiles.
                    </div>
                  )}
                </div>
              )}

              {/* Tips */}
              <div className="mp-card" style={{ borderColor:'rgba(232,184,109,0.15)' }}>
                <div className="mp-card-titulo" style={{ color:'rgba(232,184,109,0.6)' }}>Consejos para una buena foto</div>
                {[
                  'Fotografía solo el frontal de la cédula (con tu foto y nombre)',
                  'Asegúrate de que el texto sea legible y sin reflejos',
                  'Fondo claro y buena iluminación',
                  'No cubras ningún dato con los dedos',
                ].map((tip,i) => (
                  <div key={i} style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'10px' }}>
                    <span style={{ color:'#e8b86d', flexShrink:0 }}>0{i+1}</span>
                    {tip}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ──────────── TAB: RESERVAS ──────────── */}
          {tab === 'reservas' && (
            <>
              {reservas.length === 0 ? (
                <div className="mp-card" style={{ textAlign:'center', padding:'52px 24px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'14px' }}>📅</div>
                  <div style={{ fontSize:'16px', fontWeight:'600', color:'#fff', marginBottom:'8px' }}>
                    Aún no tienes reservas
                  </div>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', maxWidth:'300px', margin:'0 auto 24px', lineHeight:'1.7' }}>
                    Busca una profesional y agenda tu primer servicio hoy.
                  </p>
                  <Link to="/" style={{ display:'inline-block', padding:'11px 28px', background:'linear-gradient(135deg,#d4537e,#b83060)', color:'#fff', borderRadius:'50px', textDecoration:'none', fontSize:'14px', fontWeight:'600' }}>
                    Buscar servicios →
                  </Link>
                </div>
              ) : (
                <>
                  {['pendiente','aceptada','completada','rechazada'].map(estado => {
                    const grupo = reservas.filter(r => r.estado === estado)
                    if (!grupo.length) return null
                    const cfg = ESTADO_CFG[estado]
                    return (
                      <div key={estado}>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'10px' }}>
                          {cfg.txt} ({grupo.length})
                        </div>
                        {grupo.map(r => {
                          const contraparte = esTrabajadora
                            ? (r.clienta ? `${r.clienta.nombre} ${r.clienta.apellido}` : 'Clienta')
                            : (r.trabajadora?.usuario ? `${r.trabajadora.usuario.nombre} ${r.trabajadora.usuario.apellido}` : 'Profesional')
                          return (
                            <div key={r._id} className="mp-reserva-card">
                              <div style={{ flex:1, minWidth:'180px' }}>
                                <div style={{ fontSize:'14px', fontWeight:'600', color:'#fff', marginBottom:'4px' }}>{r.servicio}</div>
                                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
                                  {esTrabajadora ? 'Clienta:' : 'Con:'} {contraparte}
                                </div>
                                {r.fecha && (
                                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'3px' }}>
                                    📅 {new Date(r.fecha).toLocaleDateString('es-CL',{ weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="mp-reserva-estado" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                                  {cfg.txt}
                                </span>
                                {estado === 'completada' && !esTrabajadora && (
                                  <div style={{ marginTop:'8px' }}>
                                    <Link to={`/worker/${r.trabajadora?._id}`} style={{ fontSize:'11px', color:'#e8b86d', textDecoration:'none', borderBottom:'1px solid rgba(232,184,109,0.3)' }}>
                                      Evaluar →
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        <div className="mp-divider" />
                      </div>
                    )
                  })}
                </>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  )
}
