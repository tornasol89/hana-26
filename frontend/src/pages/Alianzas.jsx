import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const SERCOTEC_COLOR = '#5DCAA5'
const CHILEVALORA_COLOR = '#e8b86d'
const HANA_COLOR = '#d4537e'

const programasSercotec = [
  {
    nombre: 'Capital Abeja',
    descripcion: 'Subsidio de hasta $3.500.000 exclusivo para mujeres emprendedoras. Cubre herramientas, materiales, capacitación y equipamiento.',
    publico: 'Mujeres con negocio propio o que quieren formalizarse',
    como: 'Postulación online en sercotec.cl — convocatorias periódicas',
  },
  {
    nombre: 'Capital Semilla',
    descripcion: 'Hasta $3.000.000 para microempresas en etapa inicial. Incluye acompañamiento de un consultor durante 6 meses.',
    publico: 'Emprendedoras con menos de 3 años de actividad',
    como: 'Requiere RUT con inicio de actividades en SII',
  },
  {
    nombre: 'Fondo Mujer Trabajadora',
    descripcion: 'Talleres gratuitos de gestión de negocios, marketing digital, atención al cliente y fijación de precios.',
    publico: 'Cualquier mujer que trabaje de forma independiente',
    como: 'Cursos online y presenciales — sin postulación, cupos por orden de inscripción',
  },
  {
    nombre: 'Digitalización MIPE',
    descripcion: 'Apoyo para que pequeñas prestadoras de servicios usen herramientas digitales: pagos online, agenda virtual, presencia en web.',
    publico: 'Microempresarias de servicios formalizadas',
    como: 'Acompañamiento técnico gratuito + subsidio para herramientas digitales',
  },
]

const certificacionesChileValora = [
  { area: 'Limpieza y sanitización', descripcion: 'Técnicas profesionales de limpieza de espacios domésticos y comerciales', icono: '🧹' },
  { area: 'Atención a personas', descripcion: 'Cuidado de adultos mayores, niños y personas en situación de dependencia', icono: '🤝' },
  { area: 'Gastronomía y alimentación', descripcion: 'Preparación de alimentos, manipulación higiénica, catering', icono: '🍽️' },
  { area: 'Belleza y estética', descripcion: 'Peluquería, maquillaje, manicure, estética corporal', icono: '💅' },
  { area: 'Mantención del hogar', descripcion: 'Gasfitería básica, electricidad domiciliaria, pintura interior', icono: '🔧' },
  { area: 'Tecnología y soporte', descripcion: 'Soporte técnico básico, reparación de computadores, clases particulares', icono: '💻' },
]

const pasosCertificacion = [
  { num: '01', titulo: 'Elige tu área', detalle: 'Busca en chilevalora.cl las competencias disponibles en tu rubro. Hay más de 200 perfiles laborales certificables.' },
  { num: '02', titulo: 'Encuentra un OTEC', detalle: 'Los Organismos Técnicos de Capacitación (OTEC) aplican la evaluación. Hay centros en todas las regiones del país, muchos con modalidad online.' },
  { num: '03', titulo: 'Evaluación práctica', detalle: 'Se evalúa lo que ya sabes hacer — no es un examen escolar. Es demostrar tus habilidades en situaciones reales del trabajo.' },
  { num: '04', titulo: 'Certificado oficial', detalle: 'Recibes un certificado del Estado chileno que reconoce tus competencias laborales. Tiene validez nacional y es gratuito o subsidiado.' },
  { num: '05', titulo: 'Sube tu certificado a Hana', detalle: 'Agrega el certificado en tu perfil de Hana. Aparece la insignia CERTIFICADA y tu índice de confianza aumenta automáticamente.' },
]

function TarjetaPrograma({ programa }) {
  return (
    <div style={{
      background: '#2d0a1e',
      borderRadius: '14px',
      padding: '24px',
      border: `1px solid rgba(93,202,165,0.25)`,
      borderTop: `3px solid ${SERCOTEC_COLOR}`,
    }}>
      <p style={{ fontSize: '16px', fontWeight: '800', color: SERCOTEC_COLOR, margin: '0 0 10px' }}>{programa.nombre}</p>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 14px', lineHeight: '1.6' }}>{programa.descripcion}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ color: SERCOTEC_COLOR, fontWeight: '700' }}>Para quién: </span>{programa.publico}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ color: SERCOTEC_COLOR, fontWeight: '700' }}>Cómo acceder: </span>{programa.como}
        </div>
      </div>
    </div>
  )
}

function TarjetaCertificacion({ cert }) {
  return (
    <div style={{
      background: '#2d0a1e',
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid rgba(232,184,109,0.2)`,
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: '28px', flexShrink: 0 }}>{cert.icono}</span>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '700', color: CHILEVALORA_COLOR, margin: '0 0 5px' }}>{cert.area}</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: '1.5' }}>{cert.descripcion}</p>
      </div>
    </div>
  )
}

function PasoCertificacion({ paso }) {
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'rgba(232,184,109,0.1)',
        border: `2px solid ${CHILEVALORA_COLOR}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: '900',
        fontSize: '14px',
        color: CHILEVALORA_COLOR,
      }}>
        {paso.num}
      </div>
      <div style={{ paddingTop: '8px' }}>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 5px' }}>{paso.titulo}</p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: '1.6' }}>{paso.detalle}</p>
      </div>
    </div>
  )
}

function Alianzas() {
  return (
    <div style={{ backgroundColor: '#1a0a10', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>

      <Navbar />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px' }}>

        {/* ENCABEZADO */}
        <p style={{ fontSize: '13px', color: HANA_COLOR, textAlign: 'center', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 10px' }}>
          Formación · Certificación · Crecimiento
        </p>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', textAlign: 'center', margin: '0 0 14px', lineHeight: '1.2' }}>
          Hana + SERCOTEC + ChileValora
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', textAlign: 'center', margin: '0 0 16px', lineHeight: '1.7', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
          Dos instituciones del Estado chileno que respaldan a las mujeres trabajadoras.
          Si eres profesional en Hana, esto te interesa directamente.
        </p>

        {/* LOGOS CONCEPTUALES */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '56px', flexWrap: 'wrap' }}>
          {[
            { nombre: 'SERCOTEC', subtitulo: 'Emprendimiento', color: SERCOTEC_COLOR },
            { nombre: '+', subtitulo: '', color: 'rgba(255,255,255,0.2)', esOperador: true },
            { nombre: 'ChileValora', subtitulo: 'Certificación', color: CHILEVALORA_COLOR },
            { nombre: '=', subtitulo: '', color: 'rgba(255,255,255,0.2)', esOperador: true },
            { nombre: 'HANA', subtitulo: 'Confianza', color: HANA_COLOR },
          ].map((item, i) => item.esOperador ? (
            <span key={i} style={{ fontSize: '32px', fontWeight: '100', color: item.color }}>
              {item.nombre}
            </span>
          ) : (
            <div key={i} style={{
              background: '#2d0a1e',
              borderRadius: '14px',
              padding: '18px 28px',
              textAlign: 'center',
              border: `2px solid ${item.color}`,
              minWidth: '130px',
            }}>
              <p style={{ fontSize: '17px', fontWeight: '900', color: item.color, margin: '0 0 4px', letterSpacing: '1px' }}>{item.nombre}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{item.subtitulo}</p>
            </div>
          ))}
        </div>

        {/* —— SECCIÓN CHILEVALORA —— */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 36px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '28px', alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: '12px', color: CHILEVALORA_COLOR, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              El Estado certifica lo que tú ya sabes hacer
            </p>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '0 0 16px', lineHeight: '1.2' }}>
              ChileValora
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8', margin: '0 0 14px' }}>
              ChileValora es el sistema nacional de certificación de competencias laborales del gobierno de Chile. Su propósito es reconocer oficialmente las habilidades de trabajadoras y trabajadores, incluso cuando esas habilidades se aprendieron en la práctica y no en una sala de clases.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8', margin: '0 0 20px' }}>
              Para las profesionales de Hana esto significa una cosa concreta: puedes obtener un certificado del Estado chileno que avala que sabes limpiar, cuidar, cocinar, instalar o diseñar de forma profesional. Sin importar dónde o cómo lo aprendiste.
            </p>
            <div style={{ background: 'rgba(232,184,109,0.08)', borderLeft: `3px solid ${CHILEVALORA_COLOR}`, borderRadius: '0 10px 10px 0', padding: '16px 20px' }}>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', margin: '0 0 6px', fontStyle: 'italic' }}>
                "No evalúa lo que sabes en teoría. Evalúa lo que demuestras que puedes hacer."
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                Sistema Nacional de Certificación de Competencias Laborales — chilevalora.cl
              </p>
            </div>
          </div>

          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: `1px solid rgba(232,184,109,0.25)` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 16px' }}>¿Por qué importa en Hana?</p>
            {[
              { label: 'Insignia CERTIFICADA en tu perfil', desc: 'Visible para todas las clientas que visiten tu perfil', color: CHILEVALORA_COLOR },
              { label: 'Aumenta el Índice de Confianza', desc: 'La certificación se suma al cálculo del indiceConfianza automáticamente', color: CHILEVALORA_COLOR },
              { label: 'Diferenciación real', desc: 'Las clientas pueden filtrar trabajadoras certificadas', color: CHILEVALORA_COLOR },
              { label: 'Costo: gratuito o subsidiado', desc: 'El Estado financia la mayoría de las evaluaciones', color: SERCOTEC_COLOR },
              { label: 'Válido a nivel nacional', desc: 'El certificado te sirve fuera de Hana también', color: SERCOTEC_COLOR },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, marginTop: '6px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ÁREAS DE CERTIFICACIÓN */}
        <p style={{ fontSize: '13px', color: CHILEVALORA_COLOR, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Áreas certificables relevantes para Hana
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '48px' }}>
          {certificacionesChileValora.map((cert) => (
            <TarjetaCertificacion key={cert.area} cert={cert} />
          ))}
        </div>

        {/* —— SECCIÓN SERCOTEC —— */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 36px' }} />

        <p style={{ fontSize: '12px', color: SERCOTEC_COLOR, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px', textAlign: 'center' }}>
          Apoyo para crecer como emprendedora
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', textAlign: 'center', margin: '0 0 12px' }}>
          SERCOTEC
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textAlign: 'center', margin: '0 0 32px', lineHeight: '1.7', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
          El Servicio de Cooperación Técnica del Ministerio de Economía tiene programas específicos para mujeres que trabajan de forma independiente.
          Si ofreces servicios en Hana, puedes acceder a subsidios reales para formalizarte, capacitarte y crecer.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {programasSercotec.map((prog) => (
            <TarjetaPrograma key={prog.nombre} programa={prog} />
          ))}
        </div>

        {/* —— CÓMO CONECTAR —— */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 36px' }} />
        <p style={{ fontSize: '12px', color: HANA_COLOR, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px', textAlign: 'center' }}>
          Del certificado al perfil
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', textAlign: 'center', margin: '0 0 12px' }}>
          Cómo se ve en tu perfil de Hana
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textAlign: 'center', margin: '0 0 32px', lineHeight: '1.7', maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
          Una vez que tienes tu certificado ChileValora, lo subes en la sección "Mis certificados" de tu perfil y queda visible así para las clientas:
        </p>

        {/* MOCKUP DE PERFIL */}
        <div style={{ background: '#2d0a1e', borderRadius: '16px', padding: '28px', border: '1px solid rgba(212,83,126,0.2)', marginBottom: '48px', maxWidth: '540px', margin: '0 auto 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,83,126,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👩</div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 2px' }}>María García</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Hogar y limpieza · Santiago</p>
            </div>
            <div style={{ marginLeft: 'auto', background: 'rgba(232,184,109,0.15)', border: `1px solid ${CHILEVALORA_COLOR}`, borderRadius: '20px', padding: '4px 12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: CHILEVALORA_COLOR, letterSpacing: '0.5px' }}>✓ CERTIFICADA</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { label: '4.9★ índice Hana', color: HANA_COLOR },
              { label: 'ChileValora · Limpieza', color: CHILEVALORA_COLOR },
              { label: 'SERCOTEC · Cap. Abeja', color: SERCOTEC_COLOR },
            ].map((tag) => (
              <span key={tag.label} style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${tag.color}40`,
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                color: tag.color,
                fontWeight: '600',
              }}>
                {tag.label}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center', fontStyle: 'italic' }}>
            Así se verá tu perfil cuando sumes certificaciones
          </p>
        </div>

        {/* —— PASOS —— */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 36px' }} />
        <p style={{ fontSize: '12px', color: CHILEVALORA_COLOR, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px', textAlign: 'center' }}>
          5 pasos
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', textAlign: 'center', margin: '0 0 36px' }}>
          Cómo obtener tu certificación
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '680px', margin: '0 auto 56px' }}>
          {pasosCertificacion.map((paso) => (
            <PasoCertificacion key={paso.num} paso={paso} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, rgba(93,202,165,0.1), rgba(232,184,109,0.1))', border: '1px solid rgba(232,184,109,0.25)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '0 0 14px', lineHeight: '1.4' }}>
            Tu experiencia ya tiene valor.<br />
            <span style={{ color: CHILEVALORA_COLOR }}>Ahora el Estado puede certificarlo.</span>
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: '0 0 28px', lineHeight: '1.8', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
            Si ya trabajas como profesional independiente, tienes derecho a que el Estado reconozca lo que sabes hacer.
            Y en Hana, ese reconocimiento se traduce directamente en más confianza y más contratos.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <a
              href="https://chilevalora.cl"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: CHILEVALORA_COLOR, color: '#1a0a10', padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '14px', fontWeight: '800' }}
            >
              Ver certificaciones ChileValora
            </a>
            <a
              href="https://sercotec.cl"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: 'transparent', color: SERCOTEC_COLOR, border: `2px solid ${SERCOTEC_COLOR}`, padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}
            >
              Programas SERCOTEC
            </a>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            ¿Ya tienes tu certificación?{' '}
            <Link to="/compromiso?destino=trabajadora" style={{ color: HANA_COLOR, textDecoration: 'none', fontWeight: '600' }}>
              Únete a Hana y muéstrasela a las clientas →
            </Link>
          </p>
        </div>

      </div>

      <Footer />

    </div>
  )
}

export default Alianzas
