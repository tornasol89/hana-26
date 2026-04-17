import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const estadisticas = [
  { num: '50%', label: 'De los hogares en Chile está liderado por una mujer', fuente: 'Fundación Sol, 2024', color: '#d4537e' },
  { num: '8/10', label: 'Hogares monoparentales tienen jefatura femenina', fuente: 'Censo INE, 2024', color: '#d4537e' },
  { num: '21,8%', label: 'De los hogares son unipersonales — y sigue subiendo', fuente: 'Censo INE, 2024', color: '#e8b86d' },
  { num: '77%', label: 'De las mujeres se ha sentido insegura en espacios públicos', fuente: 'Encuesta Humanas, 2025', color: '#e8b86d' },
]

const estadisticas2 = [
  { num: '92%', label: 'De las mujeres valora el trabajo como fuente de autonomía e independencia', fuente: 'Humanas, 2025', color: '#5DCAA5' },
  { num: '59%', label: 'De las mujeres empleadas en el mundo trabaja en el sector servicios', fuente: 'Banco Mundial, 2024', color: '#5DCAA5' },
  { num: '2M', label: 'De hogares liderados por mujeres en Chile hoy vs 642 mil en los 90s', fuente: 'Fundación Sol, 2024', color: '#d4537e' },
  { num: '30+', label: 'Años de transformación sostenida en la estructura familiar chilena', fuente: 'INE / CASEN', color: '#e8b86d' },
]

function BarraComparativa({ label, valor, color, max = 100 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', width: '140px', flexShrink: 0, textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '50px', height: '10px' }}>
        <div style={{ width: `${(valor / max) * 100}%`, height: '10px', borderRadius: '50px', background: color }} />
      </div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: color, width: '44px', textAlign: 'right' }}>{valor}%</div>
    </div>
  )
}

function DonutChart({ porcentaje, color, label, total, labelTotal }) {
  const circunferencia = 2 * Math.PI * 54
  const dash = (porcentaje / 100) * circunferencia
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px' }}>
        <svg viewBox="0 0 140 140" width="140" height="140">
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="20" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="20"
            strokeDasharray={`${dash} ${circunferencia}`}
            strokeDashoffset="0"
            transform="rotate(-90 70 70)" />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: color }}>{porcentaje}%</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: color }}>{porcentaje}%</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: 'rgba(255,255,255,0.3)' }}>{total}%</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{labelTotal}</div>
        </div>
      </div>
    </div>
  )
}

function Impacto() {
  return (
    <div style={{ backgroundColor: '#1a0a10', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>

      <Navbar />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px' }}>

        {/* ENCABEZADO */}
        <p style={{ fontSize: '13px', color: '#d4537e', textAlign: 'center', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 10px' }}>Datos que lo demuestran</p>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', textAlign: 'center', margin: '0 0 10px', lineHeight: '1.2' }}>Por qué Hana existe</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 48px', lineHeight: '1.6' }}>
          Cifras reales de Chile · INE · CASEN · Fundación Sol · Corporación Humanas · ChileMujeres 2024–2025
        </p>

        {/* STATS PRINCIPALES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '48px' }}>
          {estadisticas.map((e) => (
            <div key={e.num} style={{ background: '#2d0a1e', borderRadius: '14px', padding: '22px 14px', textAlign: 'center', borderTop: `3px solid ${e.color}` }}>
              <div style={{ fontSize: '38px', fontWeight: '900', color: e.color, lineHeight: 1, marginBottom: '8px' }}>{e.num}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{e.label}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '6px', fontStyle: 'italic' }}>{e.fuente}</div>
            </div>
          ))}
        </div>

        {/* SECCIÓN 1 — CHILE CAMBIA */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 28px' }} />
        <p style={{ fontSize: '12px', color: '#e8b86d', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 20px', textAlign: 'center' }}>Chile está cambiando — y las mujeres lideran ese cambio</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(212,83,126,0.3)' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Hogares con jefatura femenina en Chile</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 20px' }}>Evolución 1990–2024 · Fuente: CASEN / INE / Fundación Sol</p>
            {[
              { año: '1990', val: 20, op: 0.3 },
              { año: '2000', val: 30, op: 0.5 },
              { año: '2010', val: 38, op: 0.7 },
              { año: '2017', val: 42, op: 0.85 },
              { año: '2024', val: 50, op: 1 },
            ].map((r) => (
              <div key={r.año} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', width: '40px', textAlign: 'right' }}>{r.año}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '50px', height: '10px' }}>
                  <div style={{ width: `${r.val}%`, height: '10px', borderRadius: '50px', background: `rgba(232,184,109,${r.op})` }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: `rgba(232,184,109,${r.op})`, width: '40px' }}>{r.val}%</div>
              </div>
            ))}
            <p style={{ fontSize: '13px', color: '#e8b86d', margin: '14px 0 0', fontWeight: '600' }}>De 642 mil a 2 millones de hogares — se triplicaron en 30 años</p>
          </div>

          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(212,83,126,0.3)' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Hogares unipersonales en Chile</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 20px' }}>Mujeres viviendo solas, una tendencia en alza · Fuente: Censo INE</p>
            {[
              { año: '2006', val: 8.7, op: 0.3 },
              { año: '2017', val: 15.4, op: 0.6 },
              { año: '2024', val: 21.8, op: 1 },
            ].map((r) => (
              <div key={r.año} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', width: '40px', textAlign: 'right' }}>{r.año}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '50px', height: '10px' }}>
                  <div style={{ width: `${(r.val / 25) * 100}%`, height: '10px', borderRadius: '50px', background: `rgba(232,184,109,${r.op})` }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: `rgba(232,184,109,${r.op})`, width: '44px' }}>{r.val}%</div>
              </div>
            ))}
            <p style={{ fontSize: '13px', color: '#e8b86d', margin: '14px 0 0', fontWeight: '600' }}>Más de 1 de cada 5 hogares chilenos tiene una sola persona</p>
          </div>
        </div>

        {/* SECCIÓN 2 — DESIGUALDAD LABORAL */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />
        <p style={{ fontSize: '12px', color: '#e8b86d', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 20px', textAlign: 'center' }}>La desigualdad laboral que Hana combate</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Participación laboral — donut */}
          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(212,83,126,0.3)' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Participación laboral</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 20px' }}>Tasa de participación · INE oct–dic 2024</p>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 140 140" width="140" height="140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="20" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="#5DCAA5" strokeWidth="20"
                  strokeDasharray="239.4 339.3" strokeDashoffset="0" transform="rotate(-90 70 70)" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="#d4537e" strokeWidth="20"
                  strokeDasharray="174.2 339.3" strokeDashoffset="-239.4" transform="rotate(-90 70 70)" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>brecha</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#d4537e' }}>19,3</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>puntos</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#5DCAA5' }}>71,4%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Hombres</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#d4537e' }}>52,1%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Mujeres</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#d4537e', margin: '0', fontWeight: '600' }}>Casi 1 de cada 5 mujeres fuera del mercado laboral</p>
          </div>

          {/* Quién cuida — donut */}
          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(212,83,126,0.3)' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>¿Quién deja de trabajar por cuidar?</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 20px' }}>No pudo trabajar por cuidado de hijos · CASEN 2020</p>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 140 140" width="140" height="140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="#d4537e" strokeWidth="20"
                  strokeDasharray="333.5 339.3" strokeDashoffset="0" transform="rotate(-90 70 70)" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#d4537e' }}>98%</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>mujeres</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#d4537e' }}>98,3%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Mujeres</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'rgba(255,255,255,0.3)' }}>1,7%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Hombres</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#d4537e', margin: '0', fontWeight: '600' }}>Casi la totalidad del sacrificio laboral recae en ellas</p>
          </div>

          {/* Brecha salarial */}
          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(212,83,126,0.3)' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Brecha salarial</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 16px' }}>Ingreso promedio · ChileMujeres 2024</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px 16px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Hombres</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#5DCAA5' }}>$500K</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ background: 'rgba(212,83,126,0.2)', border: '1px solid #d4537e', borderRadius: '50px', padding: '5px 16px', fontSize: '13px', fontWeight: '700', color: '#d4537e' }}>−23,3% brecha</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,83,126,0.08)', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(212,83,126,0.2)' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>Mujeres</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#d4537e' }}>$450K</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#d4537e', margin: '8px 0 0', fontWeight: '600' }}>En empleos informales la brecha sube a 29,2%</p>
          </div>
        </div>

        {/* SECCIÓN 3 — SEGURIDAD */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />
        <p style={{ fontSize: '12px', color: '#e8b86d', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 20px', textAlign: 'center' }}>Seguridad y autonomía — la razón más profunda de Hana</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(232,184,109,0.08)', borderLeft: '3px solid #e8b86d', borderRadius: '0 10px 10px 0', padding: '20px 24px' }}>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', margin: '0 0 8px', fontStyle: 'italic' }}>
                "Un 92% de las mujeres valora el trabajo remunerado como fuente de autonomía económica y desarrollo personal."
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Corporación Humanas, Encuesta 2025 · 1.301 mujeres encuestadas en Chile</p>
            </div>
            <div style={{ background: 'rgba(212,83,126,0.08)', borderLeft: '3px solid #d4537e', borderRadius: '0 10px 10px 0', padding: '20px 24px' }}>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', margin: '0 0 8px', fontStyle: 'italic' }}>
                "Un 77% de las mujeres chilenas declara haberse sentido insegura en espacios públicos. Un 69% en el transporte. Un 67% en plazas y parques."
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Corporación Humanas, Encuesta 2025</p>
            </div>
          </div>

          <div style={{ background: '#2d0a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(212,83,126,0.3)' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>¿Dónde se sienten inseguras las mujeres?</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 20px' }}>Chile · Corporación Humanas 2025</p>
            <BarraComparativa label="Espacio público" valor={77} color="#d4537e" />
            <BarraComparativa label="Transporte público" valor={69} color="#d4537e" />
            <BarraComparativa label="Plazas y parques" valor={67} color="#d4537e" />
            <BarraComparativa label="Redes sociales" valor={63} color="#d4537e" />
            <p style={{ fontSize: '13px', color: '#d4537e', margin: '14px 0 0', fontWeight: '600' }}>Elegir a quién abres tu puerta no es un detalle es una decisión</p>
          </div>
        </div>

        {/* STATS FINALES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '36px' }}>
          {estadisticas2.map((e) => (
            <div key={e.num} style={{ background: '#2d0a1e', borderRadius: '14px', padding: '22px 14px', textAlign: 'center', borderTop: `3px solid ${e.color}` }}>
              <div style={{ fontSize: '38px', fontWeight: '900', color: e.color, lineHeight: 1, marginBottom: '8px' }}>{e.num}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{e.label}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '6px', fontStyle: 'italic' }}>{e.fuente}</div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div style={{ background: 'linear-gradient(135deg, rgba(212,83,126,0.15), rgba(232,184,109,0.1))', border: '1px solid rgba(232,184,109,0.3)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '0 0 24px', lineHeight: '1.4' }}>
            Hana no es solo una app.<br />Es una decisión.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 14px', lineHeight: '1.8', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
            Chile tiene 2 millones de hogares liderados por mujeres. Mujeres que trabajan, que viven solas, que crían solas y que merecen elegir a quién abren su puerta.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 14px', lineHeight: '1.8', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
            Por eso en Hana cada trabajadora es verificada, maneja su propia agenda, fija sus tarifas y construye su reputación con datos reales. Porque su seguridad y su autonomía también importan.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 14px', lineHeight: '1.8', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
            Y cada clienta contrata con la certeza de saber exactamente a quién recibirá en su hogar, una profesional verificada, de confianza.
          </p>
          <p style={{ fontSize: '16px', color: '#e8b86d', margin: '0 0 32px', lineHeight: '1.8', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto', fontWeight: '600' }}>
            Usar Hana no es solo resolver una necesidad. Es apoyar el trabajo femenino, fortalecer la economía de otras mujeres y construir una comunidad donde todas estamos más seguras.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register-client" style={{ backgroundColor: '#d4537e', color: 'white', padding: '14px 36px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px', fontWeight: '700' }}>
              Quiero contratar servicios
            </Link>
            <Link to="/register-worker" style={{ backgroundColor: 'transparent', color: '#e8b86d', border: '2px solid #e8b86d', padding: '14px 36px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px', fontWeight: '600' }}>
              Quiero ofrecer mis servicios
            </Link>
          </div>
        </div>

      </div>

      <Footer />

    </div>
  )
}

export default Impacto