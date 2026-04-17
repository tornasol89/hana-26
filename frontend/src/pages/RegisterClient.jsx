import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { CATEGORIAS } from '../data/categorias'

const regiones = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
  'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins",
  'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos',
  'Los Lagos', 'Aysén', 'Magallanes',
]

export default function RegisterClient() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '',
    password: '', confirmar: '',
    rut: '', region: '', comuna: '',
    categoriasInteres: [], // opcional — preferencias de búsqueda
  })
  const [verPassword, setVerPassword]       = useState(false)
  const [verConfirmar, setVerConfirmar]     = useState(false)
  const [error, setError]                   = useState('')
  const [cargando, setCargando]             = useState(false)

  // Guard: si no aceptó el compromiso, redirigir
  useEffect(() => {
    const acepto = localStorage.getItem('aceptoCompromiso')
    if (!acepto) navigate('/compromiso?destino=clienta')
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function toggleCategoria(nombre) {
    setForm(f => ({
      ...f,
      categoriasInteres: f.categoriasInteres.includes(nombre)
        ? f.categoriasInteres.filter(c => c !== nombre)
        : [...f.categoriasInteres, nombre],
    }))
  }

  async function handleSubmit() {
    setError('')

    if (!form.nombre || !form.apellido || !form.email || !form.password) {
      return setError('Completa todos los campos obligatorios.')
    }
    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden.')
    }
    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.')
    }

    try {
      setCargando(true)
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        nombre:           form.nombre,
        apellido:         form.apellido,
        email:            form.email,
        password:         form.password,
        tipo:             'clienta',
        rut:              form.rut,
        region:           form.region,
        comuna:           form.comuna,
        aceptoCompromiso: true,
        fechaAceptacion:  localStorage.getItem('fechaAceptacion'),
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
      localStorage.removeItem('aceptoCompromiso')
      localStorage.removeItem('fechaAceptacion')

      // ✅ CORREGIDO: va a perfil de clienta, no al Home
      navigate('/perfil/clienta')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={s.page}>
      {/* ✅ CORREGIDO: usa el Navbar global, no uno hardcodeado */}
      <Navbar />

      <div style={s.wrapper}>
        <div style={s.card}>

          {/* Cabecera */}
          <div style={s.header}>
            <div style={s.headerIcon}>👩</div>
            <h1 style={s.titulo}>Busca servicios de confianza</h1>
            <p style={s.subtitulo}>Crea tu cuenta como clienta en Hana</p>
          </div>

          {/* Selector tipo — simétrico con RegisterWorker */}
          <div style={s.tipoSelector}>
            <div style={s.tipoActivo}>
              <span style={s.tipoLabel}>👩 Busco servicios</span>
            </div>
            <Link to="/compromiso?destino=trabajadora" style={s.tipoInactivo}>
              <span style={s.tipoLabel}>💼 Ofrezco servicios</span>
            </Link>
          </div>

          {/* Error */}
          {error && <div style={s.errorBox}>{error}</div>}

          {/* ── Sección 1: Datos personales ── */}
          <p style={s.seccionLabel}>Datos personales</p>

          <div style={s.row2}>
            <Campo label="Nombre *">
              <input name="nombre" type="text" placeholder="Ana" value={form.nombre} onChange={handleChange} style={s.input} />
            </Campo>
            <Campo label="Apellido *">
              <input name="apellido" type="text" placeholder="González" value={form.apellido} onChange={handleChange} style={s.input} />
            </Campo>
          </div>

          <Campo label="Correo electrónico *">
            <input name="email" type="email" placeholder="tu@correo.cl" value={form.email} onChange={handleChange} style={s.input} />
          </Campo>

          <Campo label="RUT (opcional)">
            <input name="rut" type="text" placeholder="12.345.678-9" value={form.rut} onChange={handleChange} style={s.input} />
          </Campo>

          <div style={s.row2}>
            <Campo label="Región">
              <select name="region" value={form.region} onChange={handleChange} style={s.select}>
                <option value="">Selecciona</option>
                {regiones.map(r => <option key={r} value={r} style={{ background: '#1a0a10' }}>{r}</option>)}
              </select>
            </Campo>
            <Campo label="Comuna">
              <input name="comuna" type="text" placeholder="Ej: Providencia" value={form.comuna} onChange={handleChange} style={s.input} />
            </Campo>
          </div>

          {/* ✅ NUEVO: toggle mostrar/ocultar contraseña */}
          <Campo label="Contraseña * (mínimo 8 caracteres)">
            <div style={s.inputWrap}>
              <input
                name="password" type={verPassword ? 'text' : 'password'}
                placeholder="••••••••" value={form.password} onChange={handleChange}
                style={{ ...s.input, paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setVerPassword(v => !v)} style={s.eyeBtn}>
                {verPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </Campo>

          <Campo label="Confirmar contraseña *">
            <div style={s.inputWrap}>
              <input
                name="confirmar" type={verConfirmar ? 'text' : 'password'}
                placeholder="••••••••" value={form.confirmar} onChange={handleChange}
                style={{ ...s.input, paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setVerConfirmar(v => !v)} style={s.eyeBtn}>
                {verConfirmar ? '🙈' : '👁️'}
              </button>
            </div>
          </Campo>

          {/* ── Sección 2: Categorías de interés (opcional) ── */}
          <p style={{ ...s.seccionLabel, marginTop: '24px' }}>
            ¿Qué servicios te interesan?{' '}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>
              opcional
            </span>
          </p>
          <p style={s.hint}>Selecciona las categorías que más necesitas — te ayudaremos a encontrar profesionales relevantes.</p>

          <div style={s.catsGrid}>
            {CATEGORIAS.map(cat => {
              const seleccionada = form.categoriasInteres.includes(cat.nombre)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategoria(cat.nombre)}
                  style={{
                    ...s.catChip,
                    background: seleccionada
                      ? cat.tipo === 'empoderamiento' ? 'rgba(232,184,109,0.18)' : 'rgba(212,83,126,0.18)'
                      : 'rgba(255,255,255,0.03)',
                    border: seleccionada
                      ? cat.tipo === 'empoderamiento' ? '1.5px solid #e8b86d' : '1.5px solid #d4537e'
                      : '1.5px solid rgba(255,255,255,0.1)',
                    color: seleccionada ? 'white' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {cat.icono} {cat.nombre}
                </button>
              )
            })}
          </div>

          {/* Aviso compromiso */}
          <div style={s.compromisoBox}>
            ✅ Ya aceptaste el{' '}
            <Link to="/compromiso" style={{ color: '#d4537e' }}>Compromiso Hana</Link>.
            Tu aceptación quedará registrada al crear tu cuenta.
          </div>

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={cargando}
            style={{
              ...s.btnSubmit,
              opacity: cargando ? 0.6 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Creando cuenta…' : 'Crear mi cuenta'}
          </button>

          <p style={s.loginLink}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#d4537e', fontWeight: '700', textDecoration: 'none' }}>
              Ingresar
            </Link>
          </p>

        </div>
      </div>

      <footer style={s.footer}>
        © 2025 Hana · Conectando mujeres, construyendo confianza
      </footer>
    </div>
  )
}

// ── Subcomponente Campo ────────────────────────────────────────────────────────
function Campo({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
  page: { backgroundColor: '#1a0a10', minHeight: '100vh', color: 'white', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' },

  wrapper: { flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 60px', background: 'radial-gradient(ellipse at 70% 30%, rgba(212,83,126,0.08) 0%, transparent 60%), #1a0a10' },
  card: { background: '#2d0a1e', border: '1px solid rgba(212,83,126,0.25)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '14px' },

  header: { textAlign: 'center', marginBottom: '6px' },
  headerIcon: { width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#d4537e,#b83060)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px' },
  titulo: { fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 6px' },
  subtitulo: { fontSize: '14px', color: '#cccccc', margin: 0 },

  tipoSelector: { display: 'flex', gap: '10px' },
  tipoActivo: { flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#d4537e', border: '2px solid #d4537e', borderRadius: '10px' },
  tipoInactivo: { flex: 1, textAlign: 'center', padding: '10px', backgroundColor: 'transparent', border: '2px solid rgba(232,184,109,0.35)', borderRadius: '10px', textDecoration: 'none' },
  tipoLabel: { fontSize: '13px', fontWeight: '700', color: 'white' },

  errorBox: { background: 'rgba(226,75,74,0.15)', border: '1px solid #E24B4A', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#F09595' },

  seccionLabel: { fontSize: '11px', color: '#d4537e', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 0' },
  hint: { fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '-8px 0 0', lineHeight: '1.5' },

  row2: { display: 'flex', gap: '12px' },
  label: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  // ✅ CORREGIDO: borde sutil por defecto, no rosa constante
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#1a0a10', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  select: { width: '100%', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#1a0a10', border: '1.5px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' },

  inputWrap: { position: 'relative', width: '100%' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', lineHeight: 1 },

  catsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  catChip: { padding: '7px 13px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' },

  compromisoBox: { background: 'rgba(212,83,126,0.08)', border: '1px solid rgba(212,83,126,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6' },

  btnSubmit: { background: 'linear-gradient(135deg,#d4537e,#b83060)', color: 'white', padding: '14px', borderRadius: '50px', border: 'none', fontSize: '15px', fontWeight: '700', marginTop: '4px', fontFamily: 'inherit', transition: 'transform 0.2s, box-shadow 0.2s' },

  loginLink: { textAlign: 'center', fontSize: '13px', color: '#cccccc', margin: 0 },

  footer: { textAlign: 'center', padding: '20px', backgroundColor: '#000', borderTop: '2px solid #d4537e', fontSize: '12px', color: '#cccccc' },
}
