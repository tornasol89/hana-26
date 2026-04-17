import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate, useSearchParams } from 'react-router-dom'

// ─── Texto del compromiso ─────────────────────────────────────────────────────
// (Ajusta el contenido legal según necesites, este es el placeholder estructurado)
const SECCIONES_COMPROMISO = [
  {
    titulo: '1. Quiénes somos',
    contenido: 'Hana es una plataforma digital que conecta mujeres que ofrecen servicios profesionales con mujeres que los necesitan. Nuestro propósito es crear un espacio seguro, confiable y empoderador para todas las partes.',
  },
  {
    titulo: '2. Compromiso de respeto',
    contenido: 'Todas las usuarias de Hana se comprometen a tratar a las demás con respeto, dignidad y cordialidad. Cualquier conducta discriminatoria, abusiva o irrespetuosa será motivo de suspensión inmediata de la cuenta.',
  },
  {
    titulo: '3. Veracidad de la información',
    contenido: 'Las trabajadoras se comprometen a proporcionar información veraz sobre sus habilidades, experiencia y disponibilidad. Las clientas se comprometen a describir correctamente sus necesidades y a respetar los tiempos acordados.',
  },
  {
    titulo: '4. Seguridad y privacidad',
    contenido: 'Hana protege los datos personales de sus usuarias conforme a la Ley 19.628 sobre protección de datos personales de Chile. No compartiremos tu información con terceros sin tu consentimiento explícito, salvo obligación legal.',
  },
  {
    titulo: '5. Sistema de verificación',
    contenido: 'Las trabajadoras pasan por un proceso de verificación de identidad (carnet por ambos lados) antes de ser publicadas como profesionales activas. El estado de verificación es visible para las clientas.',
  },
  {
    titulo: '6. Sistema de evaluaciones',
    contenido: 'Ambas partes pueden evaluarse mutuamente tras cada servicio. Las evaluaciones son públicas y contribuyen al Índice Hana de confianza. Está prohibido el intercambio de evaluaciones falsas o coaccionadas.',
  },
  {
    titulo: '7. Reservas y pagos',
    contenido: 'Las condiciones de pago se acuerdan directamente entre clienta y trabajadora. Hana no intermedia pagos en esta etapa. Las disputas deben reportarse a través de los canales de soporte de la plataforma.',
  },
  {
    titulo: '8. Cancelaciones',
    contenido: 'Se recomienda avisar con al menos 24 horas de anticipación ante una cancelación. Cancelaciones reiteradas sin aviso pueden afectar el Índice Hana de la usuaria.',
  },
  {
    titulo: '9. Uso aceptable',
    contenido: 'Hana es una plataforma exclusiva para mujeres. Está prohibido el uso de la plataforma para ofrecer servicios ilegales, eludir el sistema de evaluaciones, o contactar a otras usuarias con fines distintos al servicio contratado.',
  },
  {
    titulo: '10. Modificaciones',
    contenido: 'Hana puede actualizar estos términos. Las usuarias serán notificadas y deberán aceptar las nuevas condiciones para continuar usando la plataforma.',
  },
]

export default function Compromiso() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const destino = searchParams.get('destino') // 'clienta' | 'trabajadora' | null

  const [leido, setLeido] = useState(false)           // true cuando scrolleó hasta abajo
  const [aceptado, setAceptado] = useState(false)      // checkbox manual
  const [intentoSinLeer, setIntentoSinLeer] = useState(false)
  const contenidoRef = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Detectar scroll hasta el final del contenido
  function handleScroll() {
    const el = contenidoRef.current
    if (!el) return
    const margen = 40 // px de tolerancia
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - margen) {
      setLeido(true)
    }
  }

  function handleAceptar() {
    if (!leido) {
      setIntentoSinLeer(true)
      contenidoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (!aceptado) {
      setIntentoSinLeer(true)
      return
    }
    // Guardar en localStorage y redirigir
    localStorage.setItem('aceptoCompromiso', 'true')
    localStorage.setItem('fechaAceptacion', new Date().toISOString())
    setIntentoSinLeer(false)

    if (destino === 'trabajadora') navigate('/register-worker')
    else navigate('/register-client')
  }

  const textoContexto =
    destino === 'trabajadora'
      ? 'Antes de crear tu perfil profesional, lee y acepta este compromiso.'
      : destino === 'clienta'
      ? 'Antes de registrarte como clienta, lee y acepta este compromiso.'
      : 'Lee y acepta el Compromiso Hana para continuar.'

  const labelBoton =
    destino === 'trabajadora'
      ? 'Acepto y quiero crear mi perfil profesional'
      : destino === 'clienta'
      ? 'Acepto y quiero registrarme como clienta'
      : 'Acepto el Compromiso Hana'

  return (
    <div style={{ backgroundColor: '#1a0a10', minHeight: '100vh', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', color: '#d4537e', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Documento oficial
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: '900', color: '#fff', margin: '0 0 16px', lineHeight: '1.1' }}>
            Compromiso Hana
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', margin: '0 0 24px' }}>
            {textoContexto}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.3)', borderRadius: '50px', padding: '8px 18px', fontSize: '13px', color: '#e8b86d' }}>
            📜 Debes leer el documento completo para poder aceptar
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div
          ref={contenidoRef}
          onScroll={handleScroll}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${leido ? 'rgba(93,202,165,0.4)' : 'rgba(212,83,126,0.2)'}`,
            borderRadius: '16px',
            padding: '32px',
            maxHeight: '420px',
            overflowY: 'auto',
            marginBottom: '28px',
            transition: 'border-color 0.3s',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(212,83,126,0.4) transparent',
          }}
        >
          {SECCIONES_COMPROMISO.map((sec, i) => (
            <div key={i} style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#e8b86d', margin: '0 0 10px' }}>{sec.titulo}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>{sec.contenido}</p>
            </div>
          ))}

          {/* Firma final */}
          <div style={{ borderTop: '1px solid rgba(212,83,126,0.2)', paddingTop: '24px', marginTop: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              Hana — Hecho por mujeres, para mujeres · Santiago, Chile · {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Indicador de lectura */}
        {leido ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#5DCAA5', fontSize: '14px', fontWeight: '600' }}>
            ✅ Documento leído completo
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
            ↓ Desplázate hasta el final del documento para continuar
          </div>
        )}

        {/* Checkbox de aceptación — solo habilitado si ya leyó */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: leido ? 'pointer' : 'not-allowed',
          background: 'rgba(255,255,255,0.02)', border: `1px solid ${aceptado ? 'rgba(93,202,165,0.4)' : 'rgba(212,83,126,0.2)'}`,
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
          opacity: leido ? 1 : 0.45, transition: 'all 0.2s',
        }}>
          <input
            type="checkbox"
            checked={aceptado}
            disabled={!leido}
            onChange={e => { setAceptado(e.target.checked); setIntentoSinLeer(false) }}
            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#d4537e', cursor: leido ? 'pointer' : 'not-allowed', flexShrink: 0 }}
          />
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
            He leído y comprendido el Compromiso Hana en su totalidad, y acepto sus términos y condiciones para participar en la plataforma.
          </span>
        </label>

        {/* Mensaje de error si intenta avanzar sin cumplir requisitos */}
        {intentoSinLeer && (
          <div style={{ background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#f09595' }}>
            {!leido
              ? '⚠️ Debes leer el documento completo antes de aceptar. Desplázate hasta el final.'
              : '⚠️ Debes marcar la casilla de aceptación para continuar.'}
          </div>
        )}

        {/* Botón principal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleAceptar}
            style={{
              background: aceptado && leido
                ? 'linear-gradient(135deg,#d4537e,#b83060)'
                : 'rgba(255,255,255,0.06)',
              color: aceptado && leido ? 'white' : 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '50px',
              padding: '16px 48px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: aceptado && leido ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'all 0.25s',
              minWidth: '300px',
              boxShadow: aceptado && leido ? '0 8px 24px rgba(212,83,126,0.3)' : 'none',
            }}
          >
            {labelBoton}
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 12px' }}
          >
            ← Volver atrás
          </button>
        </div>

      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
