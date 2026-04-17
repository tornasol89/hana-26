import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { CATEGORIAS, getSubcategorias } from '../data/categorias'

const regiones = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
  'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins",
  'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos',
  'Los Lagos', 'Aysén', 'Magallanes',
]

const modalidades = ['A domicilio', 'Remoto', 'Retiro y entrega']
const nivelesExperiencia = ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años']

export default function RegisterWorker() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmar: '',
    rut: '', region: '', comuna: '',
    // Datos de perfil profesional
    categoria: '', subcategoria: '', descripcion: '',
    tarifaHora: '', modalidad: '', nivelExperiencia: '',
  })
  const [error, setError]     = useState('')
  const [cargando, setCargando] = useState(false)

  // Subcategorías disponibles según la categoría elegida
  const subcategorias = getSubcategorias(form.categoria)

  // Guard: si no aceptó compromiso, redirigir
  useEffect(() => {
    const acepto = localStorage.getItem('aceptoCompromiso')
    if (!acepto) navigate('/compromiso?destino=trabajadora')
  }, [])

  // Al cambiar categoría, resetear subcategoría
  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'categoria') {
      setForm(f => ({ ...f, categoria: value, subcategoria: '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  async function handleSubmit() {
    setError('')

    // Validaciones básicas
    if (!form.nombre || !form.apellido || !form.email || !form.password) {
      return setError('Completa todos los campos obligatorios.')
    }
    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden.')
    }
    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.')
    }
    if (!form.categoria) {
      return setError('Selecciona una categoría de servicio.')
    }

    try {
      setCargando(true)

      // 1. Crear usuario
      const resAuth = await axios.post('http://localhost:5000/api/auth/register', {
        nombre:           form.nombre,
        apellido:         form.apellido,
        email:            form.email,
        password:         form.password,
        tipo:             'trabajadora',
        rut:              form.rut,
        region:           form.region,
        comuna:           form.comuna,
        aceptoCompromiso: true,
        fechaAceptacion:  localStorage.getItem('fechaAceptacion'),
      })

      const { token, usuario } = resAuth.data

      // Guardar sesión
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      localStorage.removeItem('aceptoCompromiso')
      localStorage.removeItem('fechaAceptacion')

      // 2. Crear perfil de trabajadora
      await axios.post(
        'http://localhost:5000/api/workers',
        {
          categoria:        form.categoria,
          subcategoria:     form.subcategoria,
          descripcion:      form.descripcion,
          tarifaHora:       form.tarifaHora ? Number(form.tarifaHora) : 0,
          modalidad:        form.modalidad,
          nivelExperiencia: form.nivelExperiencia,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      navigate('/perfil/trabajadora')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={s.page}>

      {/* Navbar mínimo */}
      <nav style={s.nav}>
        <Link to="/" style={s.navLogo}>
          <div style={s.navLogoCircle}>🌸</div>
          <span style={s.navLogoText}>HANA</span>
        </Link>
        <Link to="/login" style={s.navLink}>
          ¿Ya tienes cuenta? <span style={{ color: '#d4537e', fontWeight: '700' }}>Ingresar</span>
        </Link>
      </nav>

      {/* Contenido */}
      <div style={s.wrapper}>
        <div style={s.card}>

          {/* Cabecera */}
          <div style={s.cardHeader}>
            <div style={s.cardIcon}>💼</div>
            <h1 style={s.cardTitulo}>Crea tu perfil profesional</h1>
            <p style={s.cardSub}>Ofrece tus servicios en la comunidad Hana</p>
          </div>

          {/* Selector clienta / trabajadora */}
          <div style={s.tipoSelector}>
            <Link to="/compromiso?destino=clienta" style={s.tipoOpcionInactiva}>
              <div style={s.tipoLabel}>👩 Busco servicios</div>
            </Link>
            <div style={s.tipoOpcionActiva}>
              <div style={s.tipoLabel}>💼 Ofrezco servicios</div>
            </div>
          </div>

          {/* Error */}
          {error && <div style={s.errorBox}>{error}</div>}

          {/* ── SECCIÓN 1: Datos personales ── */}
          <p style={s.seccionLabel}>Datos personales</p>

          <div style={s.row2}>
            <div style={s.campo}>
              <label style={s.label}>Nombre *</label>
              <input name="nombre" type="text" placeholder="Ana" value={form.nombre} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Apellido *</label>
              <input name="apellido" type="text" placeholder="González" value={form.apellido} onChange={handleChange} style={s.input} />
            </div>
          </div>

          <div style={s.campo}>
            <label style={s.label}>Correo electrónico *</label>
            <input name="email" type="email" placeholder="tu@correo.com" value={form.email} onChange={handleChange} style={s.input} />
          </div>

          <div style={s.campo}>
            <label style={s.label}>RUT</label>
            <input name="rut" type="text" placeholder="12.345.678-9" value={form.rut} onChange={handleChange} style={s.input} />
          </div>

          <div style={s.row2}>
            <div style={s.campo}>
              <label style={s.label}>Región</label>
              <select name="region" value={form.region} onChange={handleChange} style={s.select}>
                <option value="">Selecciona tu región</option>
                {regiones.map(r => <option key={r} value={r} style={{ backgroundColor: '#1a0a10' }}>{r}</option>)}
              </select>
            </div>
            <div style={s.campo}>
              <label style={s.label}>Comuna</label>
              <input name="comuna" type="text" placeholder="Ej: Providencia" value={form.comuna} onChange={handleChange} style={s.input} />
            </div>
          </div>

          <div style={s.campo}>
            <label style={s.label}>Contraseña * (mínimo 8 caracteres)</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} style={s.input} />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Confirmar contraseña *</label>
            <input name="confirmar" type="password" placeholder="••••••••" value={form.confirmar} onChange={handleChange} style={s.input} />
          </div>

          {/* ── SECCIÓN 2: Datos del servicio ── */}
          <p style={{ ...s.seccionLabel, marginTop: '28px' }}>Tu servicio profesional</p>

          {/* Categoría */}
          <div style={s.campo}>
            <label style={s.label}>Categoría *</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} style={s.select}>
              <option value="">Selecciona una categoría</option>
              <optgroup label="── Tradicionales ──" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {CATEGORIAS.filter(c => c.tipo === 'tradicional').map(c => (
                  <option key={c.id} value={c.nombre} style={{ backgroundColor: '#1a0a10' }}>
                    {c.icono} {c.nombre}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Empoderamiento ──" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {CATEGORIAS.filter(c => c.tipo === 'empoderamiento').map(c => (
                  <option key={c.id} value={c.nombre} style={{ backgroundColor: '#1a0a10' }}>
                    {c.icono} {c.nombre}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Subcategoría — aparece solo cuando hay categoría elegida */}
          {form.categoria && (
            <div style={s.campo}>
              <label style={s.label}>Especialidad dentro de {form.categoria}</label>
              <select name="subcategoria" value={form.subcategoria} onChange={handleChange} style={s.select}>
                <option value="">Selecciona tu especialidad (opcional)</option>
                {subcategorias.map(sub => (
                  <option key={sub} value={sub} style={{ backgroundColor: '#1a0a10' }}>{sub}</option>
                ))}
              </select>
              <p style={s.hint}>Esto ayuda a las clientas a encontrarte más fácilmente</p>
            </div>
          )}

          {/* Descripción */}
          <div style={s.campo}>
            <label style={s.label}>Descripción de tu servicio</label>
            <textarea
              name="descripcion"
              placeholder="Cuéntanos qué ofreces, tu experiencia y qué te hace especial..."
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              style={{ ...s.input, resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>

          <div style={s.row2}>
            <div style={s.campo}>
              <label style={s.label}>Tarifa por hora (CLP)</label>
              <input name="tarifaHora" type="number" placeholder="Ej: 15000" value={form.tarifaHora} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Modalidad</label>
              <select name="modalidad" value={form.modalidad} onChange={handleChange} style={s.select}>
                <option value="">Selecciona</option>
                {modalidades.map(m => <option key={m} value={m} style={{ backgroundColor: '#1a0a10' }}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={s.campo}>
            <label style={s.label}>Nivel de experiencia</label>
            <select name="nivelExperiencia" value={form.nivelExperiencia} onChange={handleChange} style={s.select}>
              <option value="">Selecciona</option>
              {nivelesExperiencia.map(n => <option key={n} value={n} style={{ backgroundColor: '#1a0a10' }}>{n}</option>)}
            </select>
          </div>

          {/* Aviso compromiso */}
          <div style={s.compromisoBox}>
            ✅ Ya aceptaste el{' '}
            <Link to="/compromiso" style={{ color: '#e8b86d' }}>Compromiso Hana</Link>.
            Tu aceptación quedará registrada al crear tu perfil.
          </div>

          {/* Botón */}
          <button onClick={handleSubmit} disabled={cargando} style={{ ...s.btnSubmit, opacity: cargando ? 0.6 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}>
            {cargando ? 'Creando tu perfil...' : 'Crear mi perfil profesional'}
          </button>

          <div style={s.loginLink}>
            <span style={{ color: '#cccccc', fontSize: '13px' }}>¿Ya tienes cuenta? </span>
            <Link to="/login" style={{ color: '#d4537e', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>Ingresar</Link>
          </div>

        </div>
      </div>

      <footer style={s.footer}>
        © 2025 Hana · Conectando mujeres, construyendo confianza
      </footer>
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  page: { backgroundColor: '#1a0a10', minHeight: '100vh', color: 'white', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', backgroundColor: '#000', borderBottom: '3px solid #d4537e' },
  navLogo: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' },
  navLogoCircle: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#d4537e,#e8b86d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  navLogoText: { fontSize: '22px', fontWeight: '800', color: '#e8b86d', letterSpacing: '4px' },
  navLink: { color: '#fff', fontSize: '14px', textDecoration: 'none' },

  wrapper: { flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', background: 'radial-gradient(ellipse at 30% 50%, rgba(232,184,109,0.08) 0%, transparent 60%), #1a0a10' },
  card: { background: '#2d0a1e', border: '1px solid rgba(232,184,109,0.3)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '14px' },

  cardHeader: { textAlign: 'center', marginBottom: '8px' },
  cardIcon: { width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#e8b86d,#c4892a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px' },
  cardTitulo: { fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 6px' },
  cardSub: { fontSize: '14px', color: '#cccccc', margin: 0 },

  tipoSelector: { display: 'flex', gap: '10px' },
  tipoOpcionActiva: { flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#e8b86d', border: '2px solid #e8b86d', borderRadius: '10px' },
  tipoOpcionInactiva: { flex: 1, textAlign: 'center', padding: '10px', backgroundColor: 'transparent', border: '2px solid rgba(212,83,126,0.4)', borderRadius: '10px', textDecoration: 'none' },
  tipoLabel: { fontSize: '13px', fontWeight: '700', color: 'white' },

  errorBox: { background: 'rgba(226,75,74,0.15)', border: '1px solid #E24B4A', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#F09595' },

  seccionLabel: { fontSize: '11px', color: '#e8b86d', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 0' },

  row2: { display: 'flex', gap: '12px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '13px', color: '#d4537e', fontWeight: '600' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#1a0a10', border: '1.5px solid rgba(212,83,126,0.4)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  select: { width: '100%', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#1a0a10', border: '1.5px solid rgba(212,83,126,0.4)', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  hint: { fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' },

  compromisoBox: { background: 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' },

  btnSubmit: { background: 'linear-gradient(135deg,#e8b86d,#c4892a)', color: '#1a0a10', padding: '14px', borderRadius: '50px', border: 'none', fontSize: '15px', fontWeight: '800', marginTop: '8px', fontFamily: 'inherit', transition: 'transform 0.2s, box-shadow 0.2s' },

  loginLink: { textAlign: 'center' },

  footer: { textAlign: 'center', padding: '20px', backgroundColor: '#000', borderTop: '2px solid #d4537e', fontSize: '12px', color: '#cccccc' },
}
