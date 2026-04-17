import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }
  .pa-root { background: #0a0015; min-height: 100vh; color: white; font-family: 'DM Sans', sans-serif; }
  .pa-hero { background: linear-gradient(135deg, #0d0020 0%, #1a003a 100%); border-bottom: 1px solid rgba(138,43,226,0.25); padding: 48px 24px 0; }
  .pa-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(138,43,226,0.5); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white; margin-bottom: 16px; background: linear-gradient(135deg, #7a1fa2, #d4537e); }
  .pa-nombre { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 700; margin: 0 0 4px; }
  .pa-email { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 16px; }
  .pa-tabs { display: flex; gap: 4px; margin-top: 24px; }
  .pa-tab { padding: 10px 20px 14px; background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .pa-tab.activo { border-bottom-color: #c084fc; color: #c084fc; font-weight: 700; }
  .pa-section { padding: 32px 24px; max-width: 900px; margin: 0 auto; }
  .pa-section-titulo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: white; margin: 0 0 20px; }
  .pa-card { background: #110025; border: 1px solid rgba(138,43,226,0.2); border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; transition: border-color 0.2s; }
  .pa-card:hover { border-color: rgba(138,43,226,0.4); }
  .pa-card.expandida { border-color: rgba(138,43,226,0.55); }
  .pa-badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 50px; letter-spacing: 0.5px; text-transform: uppercase; }
  .pa-doc-img { width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; display: block; border: 1px solid rgba(138,43,226,0.25); cursor: pointer; transition: opacity 0.2s; }
  .pa-doc-img:hover { opacity: 0.85; }
  .pa-doc-vacio { height: 100px; border-radius: 8px; background: rgba(138,43,226,0.04); border: 1.5px dashed rgba(138,43,226,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
  .pa-foto-u { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(138,43,226,0.4); flex-shrink: 0; }
  .pa-foto-u-placeholder { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg,#d4537e,#e8b86d); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: white; flex-shrink: 0; border: 2px solid rgba(138,43,226,0.3); }
  .divider { height: 1px; background: rgba(138,43,226,0.1); margin: 8px 0 32px; }
  .pa-vacio { text-align: center; padding: 40px 0; }
  .pa-grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 28px; }
  @media (max-width: 600px) { .pa-grid4 { grid-template-columns: repeat(2,1fr); } }
`

export default function PerfilAdmin() {
  const navigate = useNavigate()
  const [usuario,          setUsuario]          = useState(null)
  const [usuarias,         setUsuarias]         = useState([])
  const [stats,            setStats]            = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [pestana,          setPestana]          = useState('panel')
  const [filtro,           setFiltro]           = useState('todos')
  const [busqueda,         setBusqueda]         = useState('')
  const [accion,           setAccion]           = useState('')
  const [expandidaUsuarios,     setExpandidaUsuarios]     = useState(null)
  const [expandidaVerificacion, setExpandidaVerificacion] = useState(null)
  const [fotoAmpliada,          setFotoAmpliada]          = useState(null)

  useEffect(() => {
    const token        = localStorage.getItem('token')
    const userGuardado = localStorage.getItem('usuario')
    if (!token || !userGuardado) { navigate('/login'); return }
    const u = JSON.parse(userGuardado)
    if (u.tipo !== 'admin') { navigate('/'); return }
    setUsuario(u)
    fetchDatos(token)
  }, [])

  async function fetchDatos(token) {
    try {
      const [resUsuarias, resStats] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/admin/usuarias', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/stats',    { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (resUsuarias.status === 'fulfilled') setUsuarias(resUsuarias.value.data)
      if (resStats.status    === 'fulfilled') setStats(resStats.value.data)
    } catch (err) {
      console.error('Error cargando datos admin:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerificar(id, decision) {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `http://localhost:5000/api/admin/usuarias/${id}/verificar`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAccion(`✅ Verificación ${decision} correctamente`)
      fetchDatos(token)
      setTimeout(() => setAccion(''), 3000)
    } catch {
      setAccion('❌ Error al verificar')
      setTimeout(() => setAccion(''), 3000)
    }
  }

  async function handleDesactivar(id) {
    if (!confirm('¿Desactivar esta cuenta? La usuaria no podrá ingresar.')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/admin/usuarias/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAccion('✅ Cuenta desactivada')
      fetchDatos(token)
      setTimeout(() => setAccion(''), 3000)
    } catch {
      setAccion('❌ Error al desactivar')
      setTimeout(() => setAccion(''), 3000)
    }
  }

  if (loading) return (
    <div style={{ background: '#0a0015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c084fc', fontSize: '14px' }}>Cargando panel…</div>
    </div>
  )
  if (!usuario) return null

  const iniciales       = `${usuario.nombre?.charAt(0) || ''}${usuario.apellido?.charAt(0) || ''}`
  const nombre          = `${usuario.nombre} ${usuario.apellido}`
  const clientas        = usuarias.filter(u => u.tipo === 'clienta')
  const trabajadoras    = usuarias.filter(u => u.tipo === 'trabajadora')
  const pendientesVerif = usuarias.filter(u => u.estadoVerificacion !== 'aprobado')

  const usuariasFiltradas = usuarias
    .filter(u => filtro === 'todos' ? true : u.tipo === filtro.replace('clientas', 'clienta').replace('trabajadoras', 'trabajadora'))
    .filter(u => {
      if (!busqueda) return true
      const q = busqueda.toLowerCase()
      return `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q)
    })

  const tabs = [
    { id: 'panel',        label: '🛡️ Panel' },
    { id: 'usuarios',     label: `👥 Usuarios (${usuarias.length})` },
    { id: 'verificacion', label: `🪪 Verificación ${pendientesVerif.length > 0 ? `(${pendientesVerif.length})` : ''}` },
  ]

  // Componente interno reutilizable: detalle expandido de una usuaria
  function DetalleUsuaria({ u }) {
    return (
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(138,43,226,0.12)' }}>

        {/* Foto de perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {u.foto
              ? <img
                  src={u.foto}
                  alt="foto"
                  className="pa-foto-u"
                  style={{ width: '64px', height: '64px', cursor: 'zoom-in' }}
                  onClick={() => setFotoAmpliada(u.foto)}
                  title="Click para ampliar"
                />
              : <div className="pa-foto-u-placeholder" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                  {u.nombre?.charAt(0).toUpperCase()}
                </div>
            }
            {u.foto && (
              <div
                onClick={() => setFotoAmpliada(u.foto)}
                style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.65)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'zoom-in' }}
                title="Ampliar foto"
              >🔍</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '13px', color: u.foto ? '#5DCAA5' : 'rgba(255,255,255,0.25)', marginBottom: '2px' }}>
              {u.foto ? '✓ Foto de perfil subida' : '⚠ Sin foto de perfil'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
              RUT: {u.rut || 'No ingresado'} · {u.region || 'Sin región'}{u.comuna ? `, ${u.comuna}` : ''}
            </div>
          </div>
        </div>

        {/* Documentos de identidad */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Cédula de identidad
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { url: u.carnetFrenteUrl, label: 'Frente' },
              { url: u.carnetDorsoUrl,  label: 'Dorso'  },
            ].map(({ url, label }) => (
              <div key={label}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                {url
                  ? <a href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={label} className="pa-doc-img" title="Click para ver en grande" />
                    </a>
                  : <div className="pa-doc-vacio">
                      <span style={{ fontSize: '20px' }}>🪪</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>No subido aún</span>
                    </div>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {u.estadoVerificacion !== 'aprobado' && (
            <button
              onClick={() => handleVerificar(u._id, 'aprobado')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(93,202,165,0.15)', border: '1px solid rgba(93,202,165,0.4)', color: '#5DCAA5', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              ✓ Aprobar verificación
            </button>
          )}
          {u.estadoVerificacion === 'aprobado' && (
            <button
              onClick={() => handleVerificar(u._id, 'rechazado')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              ✕ Revocar verificación
            </button>
          )}
          {u.estadoVerificacion !== 'aprobado' && u.estadoVerificacion !== 'rechazado' && (
            <button
              onClick={() => handleVerificar(u._id, 'rechazado')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              ✕ Rechazar
            </button>
          )}
          {u.activa !== false && (
            <button
              onClick={() => handleDesactivar(u._id)}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              Desactivar cuenta
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pa-root">
        <Navbar />

        {/* HERO */}
        <div className="pa-hero">
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="pa-avatar">{iniciales || '🛡️'}</div>
            <h1 className="pa-nombre">{nombre}</h1>
            <p className="pa-email">{usuario.email}</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', background: 'rgba(138,43,226,0.2)', color: '#c084fc', border: '1px solid rgba(138,43,226,0.4)' }}>
              🛡️ Administradora del sistema
            </span>
          </div>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="pa-tabs">
              {tabs.map(t => (
                <button key={t.id} className={`pa-tab${pestana === t.id ? ' activo' : ''}`} onClick={() => setPestana(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pa-section">

          {/* Feedback */}
          {accion && (
            <div style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: '#c084fc' }}>
              {accion}
            </div>
          )}

          {/* ── PANEL ── */}
          {pestana === 'panel' && (
            <div>
              <h2 className="pa-section-titulo">Resumen del sistema</h2>
              <div className="divider" />

              {/* KPIs principales */}
              <div className="pa-grid4">
                {[
                  { num: stats?.totalUsuarias      ?? usuarias.length,        label: 'Usuarias totales',      color: '#c084fc' },
                  { num: stats?.totalClientas      ?? clientas.length,        label: 'Clientas',              color: '#e8b86d' },
                  { num: stats?.totalTrabajadoras  ?? trabajadoras.length,    label: 'Trabajadoras',          color: '#d4537e' },
                  { num: stats?.pendientesVerif    ?? pendientesVerif.length, label: 'Pend. verificación',    color: '#f87171' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#110025', border: `1px solid ${s.color}30`, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '700', color: s.color }}>{s.num}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Segunda fila KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
                {[
                  { num: stats?.totalReservas     ?? '—', label: 'Total reservas',         color: '#5DCAA5' },
                  { num: stats?.reservasUltimos30 ?? '—', label: 'Reservas últimos 30d',   color: '#a5f3fc' },
                  { num: (stats?.reservasPorEstado?.find(r => r._id === 'completada')?.count) ?? '—', label: 'Completadas', color: '#86efac' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#110025', border: `1px solid ${s.color}25`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: '700', color: s.color }}>{s.num}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Categorías más activas + Regiones */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="pa-card">
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', margin: '0 0 14px', color: '#c084fc' }}>
                    Categorías con más trabajadoras
                  </h3>
                  {(stats?.categoriasTrabajadoras || []).length === 0
                    ? <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Sin datos</p>
                    : (stats.categoriasTrabajadoras).map((c, i) => (
                      <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{i + 1}. {c._id}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#c084fc' }}>{c.count}</span>
                      </div>
                    ))
                  }
                </div>

                <div className="pa-card">
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', margin: '0 0 14px', color: '#e8b86d' }}>
                    Regiones con más clientas
                  </h3>
                  {(stats?.regionesDemanda || []).length === 0
                    ? <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Sin datos</p>
                    : (stats.regionesDemanda).map((r, i) => (
                      <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{i + 1}. {r._id}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#e8b86d' }}>{r.count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Estado de reservas + Acciones rápidas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="pa-card">
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', margin: '0 0 14px', color: '#5DCAA5' }}>
                    Reservas por estado
                  </h3>
                  {(stats?.reservasPorEstado || []).length === 0
                    ? <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Sin datos</p>
                    : (stats.reservasPorEstado).map(r => {
                      const colores = { pendiente: '#e8b86d', aceptada: '#5DCAA5', rechazada: '#f87171', completada: '#c084fc' }
                      return (
                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize' }}>{r._id}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: colores[r._id] || '#fff' }}>{r.count}</span>
                        </div>
                      )
                    })
                  }
                </div>
                <div className="pa-card">
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', margin: '0 0 14px', color: '#c084fc' }}>Acciones rápidas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: '👥 Ver todos los usuarios',  onClick: () => setPestana('usuarios') },
                      { label: '🪪 Revisar verificaciones',  onClick: () => setPestana('verificacion') },
                    ].map(btn => (
                      <button key={btn.label} onClick={btn.onClick} style={{ padding: '12px 18px', borderRadius: '10px', textAlign: 'left', background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    {[
                      { label: 'Base de datos',  valor: '✅ Conectada'  },
                      { label: 'Backend',        valor: '✅ Activo'     },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                        <span style={{ fontSize: '12px', color: '#5DCAA5', fontWeight: '600' }}>{item.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {pestana === 'usuarios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h2 className="pa-section-titulo" style={{ margin: 0 }}>Gestión de usuarias</h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['todos', 'clientas', 'trabajadoras'].map(f => (
                    <button key={f} onClick={() => setFiltro(f)} style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', background: filtro === f ? 'rgba(192,132,252,0.15)' : 'transparent', border: filtro === f ? '1px solid rgba(192,132,252,0.4)' : '1px solid rgba(255,255,255,0.1)', color: filtro === f ? '#c084fc' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ width: '100%', margin: '16px 0', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(138,43,226,0.2)', color: 'white', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
              />
              <div className="divider" />

              {usuariasFiltradas.length === 0 ? (
                <div className="pa-vacio">
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>Sin resultados.</p>
                </div>
              ) : (
                usuariasFiltradas.map(u => {
                  const abierta = expandidaUsuarios === u._id
                  return (
                    <div key={u._id} className={`pa-card${abierta ? ' expandida' : ''}`}>
                      {/* Cabecera clickeable */}
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => setExpandidaUsuarios(abierta ? null : u._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {u.foto
                            ? <img src={u.foto} alt="foto" className="pa-foto-u" />
                            : <div className="pa-foto-u-placeholder">{u.nombre?.charAt(0).toUpperCase()}</div>
                          }
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: u.activa === false ? 'rgba(255,255,255,0.3)' : 'white' }}>
                              {u.nombre} {u.apellido} {u.activa === false ? <span style={{ fontSize: '11px', color: '#f87171' }}>(desactivada)</span> : ''}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{u.email}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span className="pa-badge" style={{ background: u.tipo === 'trabajadora' ? 'rgba(212,83,126,0.15)' : 'rgba(232,184,109,0.15)', color: u.tipo === 'trabajadora' ? '#d4537e' : '#e8b86d', border: `1px solid ${u.tipo === 'trabajadora' ? 'rgba(212,83,126,0.3)' : 'rgba(232,184,109,0.3)'}` }}>
                            {u.tipo}
                          </span>
                          <span className="pa-badge" style={{
                            background: u.estadoVerificacion === 'aprobado' ? 'rgba(93,202,165,0.15)' : u.estadoVerificacion === 'rechazado' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)',
                            color: u.estadoVerificacion === 'aprobado' ? '#5DCAA5' : u.estadoVerificacion === 'rechazado' ? '#f87171' : 'rgba(255,255,255,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}>
                            {u.estadoVerificacion || 'sin_enviar'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{abierta ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Detalle expandido */}
                      {abierta && <DetalleUsuaria u={u} />}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── VERIFICACIÓN ── */}
          {pestana === 'verificacion' && (
            <div>
              <h2 className="pa-section-titulo">🪪 Verificación de usuarias</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '-12px', marginBottom: '20px' }}>
                Usuarias que aún no han sido aprobadas. Click en una card para ver foto y documentos.
              </p>
              <div className="divider" />
              {pendientesVerif.length === 0 ? (
                <div className="pa-vacio">
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>Todas las usuarias están verificadas.</p>
                </div>
              ) : (
                pendientesVerif.map(u => {
                  const abierta = expandidaVerificacion === u._id
                  return (
                    <div key={u._id} className={`pa-card${abierta ? ' expandida' : ''}`}>
                      {/* Cabecera clickeable */}
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => setExpandidaVerificacion(abierta ? null : u._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {u.foto
                            ? <img src={u.foto} alt="foto" className="pa-foto-u" />
                            : <div className="pa-foto-u-placeholder">{u.nombre?.charAt(0).toUpperCase()}</div>
                          }
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{u.nombre} {u.apellido}</span>
                              <span className="pa-badge" style={{ background: u.tipo === 'trabajadora' ? 'rgba(212,83,126,0.15)' : 'rgba(232,184,109,0.15)', color: u.tipo === 'trabajadora' ? '#d4537e' : '#e8b86d', border: `1px solid ${u.tipo === 'trabajadora' ? 'rgba(212,83,126,0.3)' : 'rgba(232,184,109,0.3)'}` }}>
                                {u.tipo}
                              </span>
                              <span className="pa-badge" style={{ background: u.estadoVerificacion === 'enviado' ? 'rgba(232,184,109,0.12)' : u.estadoVerificacion === 'rechazado' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)', color: u.estadoVerificacion === 'enviado' ? '#e8b86d' : u.estadoVerificacion === 'rechazado' ? '#f87171' : 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                {u.estadoVerificacion === 'enviado' ? '🕐 doc. enviado' : u.estadoVerificacion === 'rechazado' ? '✕ rechazado' : 'sin enviar'}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>{u.email}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{abierta ? '▲' : '▼'}</span>
                      </div>

                      {/* Detalle expandido */}
                      {abierta && <DetalleUsuaria u={u} />}
                    </div>
                  )
                })
              )}
            </div>
          )}

        </div>
        <Footer />
      </div>

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
