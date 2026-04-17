import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }
  .wc-root { background: #0f0508; min-height: 100vh; color: white; font-family: 'DM Sans', sans-serif; }
  .wc-container { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
  .wc-titulo { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: white; margin: 0 0 6px; }
  .wc-subtitulo { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 32px; }
  .wc-card { background: #1a0a10; border: 1px solid rgba(212,83,126,0.2); border-radius: 16px; padding: 28px; margin-bottom: 24px; }
  .wc-mes-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .wc-mes-titulo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: white; }
  .wc-nav-btn { background: rgba(212,83,126,0.12); border: 1px solid rgba(212,83,126,0.3); color: #d4537e; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .wc-nav-btn:hover { background: rgba(212,83,126,0.25); }
  .wc-dias-semana { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px; }
  .wc-dia-label { text-align: center; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; text-transform: uppercase; padding: 4px; }
  .wc-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .wc-celda { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; position: relative; }
  .wc-celda.vacia { cursor: default; }
  .wc-celda.pasado { color: rgba(255,255,255,0.15); cursor: not-allowed; }
  .wc-celda.disponible { background: rgba(93,202,165,0.12); border-color: rgba(93,202,165,0.3); color: #5DCAA5; }
  .wc-celda.disponible:hover { background: rgba(93,202,165,0.25); }
  .wc-celda.no-disponible { background: rgba(212,83,126,0.08); border-color: rgba(212,83,126,0.2); color: rgba(255,255,255,0.35); }
  .wc-celda.no-disponible:hover { background: rgba(212,83,126,0.15); border-color: rgba(212,83,126,0.4); color: rgba(255,255,255,0.6); }
  .wc-celda.hoy { border-color: #e8b86d !important; color: #e8b86d !important; font-weight: 700; }
  .wc-celda.reservado { background: rgba(232,184,109,0.12); border-color: rgba(232,184,109,0.3); color: #e8b86d; cursor: not-allowed; }
  .wc-celda.reservado::after { content: '●'; position: absolute; top: 2px; right: 3px; font-size: 6px; color: #e8b86d; }
  .wc-leyenda { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
  .wc-ley-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.45); }
  .wc-ley-dot { width: 10px; height: 10px; border-radius: 3px; }
  .wc-seccion-titulo { font-size: 15px; font-weight: 600; color: white; margin-bottom: 16px; }
  .wc-horario-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
  .wc-hora-btn { padding: 9px 6px; border-radius: 8px; border: 1px solid rgba(212,83,126,0.2); background: transparent; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; text-align: center; }
  .wc-hora-btn.activo { background: rgba(93,202,165,0.15); border-color: #5DCAA5; color: #5DCAA5; }
  .wc-hora-btn:hover:not(.activo) { border-color: rgba(212,83,126,0.5); color: rgba(255,255,255,0.8); }
  .wc-btn-save { background: linear-gradient(135deg, #d4537e, #b83060); color: white; border: none; border-radius: 50px; padding: 13px 36px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: transform 0.2s, box-shadow 0.2s; }
  .wc-btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,83,126,0.35); }
  .wc-reserva-card { background: #0f0508; border: 1px solid rgba(232,184,109,0.2); border-radius: 12px; padding: 16px 18px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .wc-accion-btn { padding: 7px 16px; border-radius: 50px; border: none; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
  .wc-accion-btn:hover { opacity: 0.85; }
`

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getDiasEnMes(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getPrimerDiaSemana(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function WorkerCalendar() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const hoy = new Date()
  const [mesActual, setMesActual] = useState(hoy.getMonth())
  const [anioActual, setAnioActual] = useState(hoy.getFullYear())

  const [diasDisponibles, setDiasDisponibles] = useState(new Set())
  const [horasDisponibles, setHorasDisponibles] = useState(new Set(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']))

  useEffect(() => {
    const token = localStorage.getItem('token')
    // ✅ FIX: clave unificada 'usuario' (antes era 'user', que nunca se seteaba)
    const userGuardado = localStorage.getItem('usuario')
    if (!token || !userGuardado) { navigate('/login'); return }
    const u = JSON.parse(userGuardado)
    if (u.tipo !== 'trabajadora') { navigate('/'); return }
    setUsuario(u)
    fetchReservas(token)

    // Cargar disponibilidad guardada localmente
    const dispGuardada = localStorage.getItem('hana_disponibilidad')
    if (dispGuardada) {
      const data = JSON.parse(dispGuardada)
      if (data.dias) setDiasDisponibles(new Set(data.dias))
      if (data.horas) setHorasDisponibles(new Set(data.horas))
    }
  }, [])

  async function fetchReservas(token) {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/mis-reservas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservas(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function toggleDia(fecha) {
    setDiasDisponibles(prev => {
      const next = new Set(prev)
      next.has(fecha) ? next.delete(fecha) : next.add(fecha)
      return next
    })
  }

  function toggleHora(hora) {
    setHorasDisponibles(prev => {
      const next = new Set(prev)
      next.has(hora) ? next.delete(hora) : next.add(hora)
      return next
    })
  }

  function guardarDisponibilidad() {
    setGuardando(true)
    // Guardado local — cuando integres backend, reemplaza por axios.put a /api/workers/:id
    localStorage.setItem('hana_disponibilidad', JSON.stringify({
      dias: [...diasDisponibles],
      horas: [...horasDisponibles]
    }))
    setTimeout(() => {
      setGuardando(false)
      setMensaje('¡Disponibilidad guardada!')
      setTimeout(() => setMensaje(''), 3000)
    }, 600)
  }

  async function responderReserva(reservaId, accion) {
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
    } catch (err) {
      console.error(err)
    }
  }

  const diasMes = getDiasEnMes(anioActual, mesActual)
  const primerDia = getPrimerDiaSemana(anioActual, mesActual)
  const celdas = Array(primerDia).fill(null).concat(Array.from({ length: diasMes }, (_, i) => i + 1))

  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente')

  if (loading) return (
    <div style={{ background: '#0f0508', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#d4537e', fontSize: '14px' }}>Cargando calendario…</div>
    </div>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="wc-root">
        <Navbar />
        <div className="wc-container">
          <h1 className="wc-titulo">Mi calendario</h1>
          <p className="wc-subtitulo">Define tus días y horarios disponibles para recibir reservas</p>

          {/* RESERVAS PENDIENTES */}
          {reservasPendientes.length > 0 && (
            <div className="wc-card" style={{ borderColor: 'rgba(232,184,109,0.3)' }}>
              <div className="wc-seccion-titulo" style={{ color: '#e8b86d' }}>
                🔔 Reservas pendientes ({reservasPendientes.length})
              </div>
              {reservasPendientes.map(r => {
                const clientaNombre = r.clienta?.nombre
                  ? `${r.clienta.nombre} ${r.clienta.apellido}`
                  : 'Clienta'
                return (
                  <div key={r._id} className="wc-reserva-card">
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '3px' }}>{r.servicio}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        {clientaNombre} · {r.fecha ? new Date(r.fecha).toLocaleDateString('es-CL') : 'Fecha por confirmar'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        className="wc-accion-btn"
                        style={{ background: 'rgba(93,202,165,0.15)', color: '#5DCAA5', border: '1px solid rgba(93,202,165,0.4)' }}
                        onClick={() => responderReserva(r._id, 'aceptar')}
                      >
                        Aceptar
                      </button>
                      <button
                        className="wc-accion-btn"
                        style={{ background: 'rgba(212,83,126,0.12)', color: '#d4537e', border: '1px solid rgba(212,83,126,0.35)' }}
                        onClick={() => responderReserva(r._id, 'rechazar')}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* CALENDARIO */}
          <div className="wc-card">
            <div className="wc-mes-nav">
              <button className="wc-nav-btn" onClick={() => {
                if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1) }
                else setMesActual(m => m - 1)
              }}>‹</button>
              <span className="wc-mes-titulo">{MESES[mesActual]} {anioActual}</span>
              <button className="wc-nav-btn" onClick={() => {
                if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1) }
                else setMesActual(m => m + 1)
              }}>›</button>
            </div>

            <div className="wc-dias-semana">
              {DIAS_SEMANA.map(d => <div key={d} className="wc-dia-label">{d}</div>)}
            </div>

            <div className="wc-grid">
              {celdas.map((dia, idx) => {
                if (!dia) return <div key={`v-${idx}`} className="wc-celda vacia" />
                const fecha = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                const fechaObj = new Date(anioActual, mesActual, dia)
                const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear()
                const esPasado = fechaObj < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
                const tieneReserva = reservas.some(r => r.fecha && r.fecha.startsWith(fecha) && r.estado !== 'rechazada')
                const esDisponible = diasDisponibles.has(fecha)

                let clases = 'wc-celda'
                if (esPasado) clases += ' pasado'
                else if (tieneReserva) clases += ' reservado'
                else if (esDisponible) clases += ' disponible'
                else clases += ' no-disponible'
                if (esHoy) clases += ' hoy'

                return (
                  <div
                    key={fecha}
                    className={clases}
                    onClick={() => !esPasado && !tieneReserva && toggleDia(fecha)}
                    title={tieneReserva ? 'Reserva agendada' : esDisponible ? 'Click para quitar disponibilidad' : 'Click para marcar disponible'}
                  >
                    {dia}
                  </div>
                )
              })}
            </div>

            <div className="wc-leyenda">
              {[
                { color: 'rgba(93,202,165,0.3)',  borde: '#5DCAA5',                  texto: 'Disponible'   },
                { color: 'rgba(232,184,109,0.15)', borde: '#e8b86d',                  texto: 'Con reserva'  },
                { color: 'rgba(212,83,126,0.08)',  borde: 'rgba(212,83,126,0.3)',     texto: 'No disponible'},
              ].map(l => (
                <div key={l.texto} className="wc-ley-item">
                  <div className="wc-ley-dot" style={{ background: l.color, border: `1px solid ${l.borde}` }} />
                  {l.texto}
                </div>
              ))}
            </div>
          </div>

          {/* HORARIOS */}
          <div className="wc-card">
            <div className="wc-seccion-titulo">Horarios disponibles</div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
              Selecciona los bloques horarios en que puedes atender
            </p>
            <div className="wc-horario-grid">
              {HORAS.map(h => (
                <button
                  key={h}
                  className={`wc-hora-btn ${horasDisponibles.has(h) ? 'activo' : ''}`}
                  onClick={() => toggleHora(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* GUARDAR */}
          {mensaje && (
            <div style={{ background: 'rgba(93,202,165,0.12)', border: '1px solid rgba(93,202,165,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#5DCAA5', textAlign: 'center' }}>
              {mensaje}
            </div>
          )}
          <div style={{ textAlign: 'center', paddingBottom: '48px' }}>
            <button className="wc-btn-save" onClick={guardarDisponibilidad} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar disponibilidad'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
