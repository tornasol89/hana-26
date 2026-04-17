import { useState, useEffect } from 'react'
import axios from 'axios'

const css = `
  .eval-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: evalFadeIn 0.18s ease;
    overflow-y: auto;
  }
  @keyframes evalFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .eval-modal {
    width: 100%; max-width: 480px;
    background: white;
    border: 1px solid rgba(45,19,44,0.12);
    border-radius: 10px;
    box-shadow: 0 20px 60px rgba(45,19,44,0.2);
    animation: evalSlideUp 0.22s ease;
    overflow: hidden;
    margin: auto;
  }
  @keyframes evalSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .eval-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(45,19,44,0.08);
    background: #2D132C;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .eval-titulo {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700; color: #F4EEED; margin: 0 0 4px;
    letter-spacing: -0.5px;
  }
  .eval-subtitulo { font-size: 12px; color: rgba(244,238,237,0.4); margin: 0; }
  .eval-close {
    background: transparent; border: none; color: rgba(244,238,237,0.4);
    font-size: 20px; cursor: pointer; padding: 4px; line-height: 1;
    transition: color 0.2s; flex-shrink: 0; margin-left: 12px;
  }
  .eval-close:hover { color: #D4A373; }

  .eval-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 20px; background: white; }

  /* Perfil destinataria */
  .eval-perfil { display: flex; align-items: center; gap: 12px; }
  .eval-perfil-avatar {
    width: 48px; height: 48px; border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(45,19,44,0.15); flex-shrink: 0;
  }
  .eval-perfil-iniciales {
    width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
    background: #2D132C;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 18px; color: white;
    border: 2px solid rgba(45,19,44,0.15);
  }
  .eval-perfil-nombre { font-size: 15px; font-weight: 600; color: #2D132C; font-family: 'Montserrat', sans-serif; }
  .eval-perfil-servicio { font-size: 12px; color: rgba(45,19,44,0.45); margin-top: 2px; }

  /* Estrellas globales */
  .eval-estrellas-label {
    font-size: 10px; color: rgba(45,19,44,0.5); text-transform: uppercase;
    letter-spacing: 1px; font-weight: 700; margin-bottom: 8px;
    font-family: 'Montserrat', sans-serif;
  }
  .eval-estrellas { display: flex; gap: 6px; }
  .eval-estrella {
    font-size: 28px; cursor: pointer; transition: transform 0.12s;
    filter: grayscale(1); opacity: 0.25;
    background: none; border: none; padding: 0; line-height: 1;
  }
  .eval-estrella.activa { filter: none; opacity: 1; color: #D4A373; }
  .eval-estrella:hover { transform: scale(1.15); opacity: 0.8; }

  /* Métricas */
  .eval-metricas { display: flex; flex-direction: column; gap: 12px; }
  .eval-metrica { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .eval-metrica-nombre { font-size: 13px; color: #4A4A4A; min-width: 110px; font-family: 'Montserrat', sans-serif; }
  .eval-metrica-estrellas { display: flex; gap: 4px; }
  .eval-metrica-star {
    font-size: 18px; cursor: pointer; transition: transform 0.1s;
    filter: grayscale(1); opacity: 0.25;
    background: none; border: none; padding: 0; line-height: 1;
  }
  .eval-metrica-star.activa { filter: none; opacity: 1; color: #D4A373; }
  .eval-metrica-star:hover { transform: scale(1.1); opacity: 0.8; }

  /* Comentario */
  .eval-textarea {
    width: 100%; background: #F4EEED;
    border: 1.5px solid rgba(45,19,44,0.12);
    border-radius: 6px; padding: 12px 14px;
    color: #2D132C; font-size: 13px; font-family: 'Montserrat', sans-serif;
    outline: none; resize: vertical; min-height: 80px; max-height: 160px;
    transition: border-color 0.2s;
  }
  .eval-textarea:focus { border-color: #C72C41; }
  .eval-textarea::placeholder { color: rgba(45,19,44,0.3); }

  /* Botón enviar */
  .eval-btn {
    width: 100%; padding: 13px;
    background: #C72C41;
    color: white; border: none; border-radius: 6px;
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer; transition: background 0.2s, transform 0.2s;
  }
  .eval-btn:hover:not(:disabled) { background: #a01f30; transform: translateY(-1px); }
  .eval-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .eval-success {
    text-align: center; padding: 40px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    background: white;
  }
  .eval-success-icono { font-size: 48px; }
  .eval-success-titulo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: #2D132C; letter-spacing: -0.5px;
  }
  .eval-success-sub { font-size: 13px; color: rgba(45,19,44,0.45); }

  .eval-ya-evaluo {
    text-align: center; padding: 40px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    background: white;
  }

  .eval-error-box {
    background: rgba(199,44,65,0.07);
    border: 1px solid rgba(199,44,65,0.25);
    border-radius: 6px; padding: 10px 14px;
    font-size: 13px; color: #C72C41;
    font-family: 'Montserrat', sans-serif;
  }

  .eval-close-btn {
    margin-top: 8px; background: transparent;
    border: 1.5px solid rgba(45,19,44,0.15);
    color: rgba(45,19,44,0.6); padding: 10px 28px;
    border-radius: 6px; cursor: pointer; font-size: 12px;
    font-family: 'Montserrat', sans-serif; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    transition: border-color 0.2s, color 0.2s;
  }
  .eval-close-btn:hover { border-color: #C72C41; color: #C72C41; }
`

const METRICAS_CLIENTA = [
  { key: 'puntualidad',   label: 'Puntualidad'  },
  { key: 'comunicacion',  label: 'Comunicación' },
  { key: 'confiabilidad', label: 'Respeto'       },
]

const METRICAS_TRABAJADORA = [
  { key: 'puntualidad',   label: 'Puntualidad'  },
  { key: 'calidad',       label: 'Calidad'      },
  { key: 'comunicacion',  label: 'Comunicación' },
  { key: 'confiabilidad', label: 'Confiabilidad'},
  { key: 'precio',        label: 'Precio justo' },
]

function Estrellas({ valor, onChange, size = 'grande' }) {
  const [hover, setHover] = useState(0)
  const cls   = size === 'grande' ? 'eval-estrella' : 'eval-metrica-star'
  const total = 5
  return (
    <div className={size === 'grande' ? 'eval-estrellas' : 'eval-metrica-estrellas'}>
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          className={`${cls}${n <= (hover || valor) ? ' activa' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function EvaluarModal({ reserva, miUsuario, destinataria, tipo, onClose, onExito }) {
  const [estrellas,  setEstrellas]  = useState(0)
  const [metricas,   setMetricas]   = useState({ puntualidad: 5, confiabilidad: 5, calidad: 5, comunicacion: 5, precio: 5 })
  const [comentario, setComentario] = useState('')
  const [enviando,   setEnviando]   = useState(false)
  const [error,      setError]      = useState('')
  const [exito,      setExito]      = useState(false)
  const [yaEvaluo,   setYaEvaluo]   = useState(false)
  const [verificando,setVerificando]= useState(true)

  const token = localStorage.getItem('token')

  const esTrabajadora = tipo === 'clienta_a_trabajadora'
  const listadoMetricas = esTrabajadora ? METRICAS_TRABAJADORA : METRICAS_CLIENTA

  useEffect(() => {
    verificarEvaluacion()
  }, [])

  async function verificarEvaluacion() {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/reserva/${reserva._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setYaEvaluo(res.data.yaEvaluo)
    } catch {
      // ignorar
    } finally {
      setVerificando(false)
    }
  }

  async function enviarEvaluacion() {
    if (estrellas === 0) return setError('Selecciona al menos una estrella.')
    setError(''); setEnviando(true)
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        reserva:      reserva._id,
        destinataria: destinataria._id || destinataria.id,
        tipo,
        estrellas,
        comentario,
        metricas,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setExito(true)
      onExito?.()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al enviar la evaluación.')
    } finally {
      setEnviando(false)
    }
  }

  const nombreDest = destinataria ? `${destinataria.nombre} ${destinataria.apellido}` : 'Participante'

  return (
    <>
      <style>{css}</style>
      <div className="eval-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="eval-modal">

          <div className="eval-header">
            <div>
              <h2 className="eval-titulo">
                {esTrabajadora ? 'Evaluar profesional' : 'Evaluar clienta'}
              </h2>
              <p className="eval-subtitulo">📋 {reserva.servicio}</p>
            </div>
            <button className="eval-close" onClick={onClose}>✕</button>
          </div>

          {verificando ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(45,19,44,0.4)', fontSize: '13px', background: 'white' }}>Verificando…</div>
          ) : exito ? (
            <div className="eval-success">
              <div className="eval-success-icono">🌸</div>
              <div className="eval-success-titulo">¡Evaluación enviada!</div>
              <div className="eval-success-sub">Gracias por contribuir a la comunidad Hana.</div>
              <button className="eval-close-btn" onClick={onClose}>Cerrar</button>
            </div>
          ) : yaEvaluo ? (
            <div className="eval-ya-evaluo">
              <div style={{ fontSize: '36px' }}>✅</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#2D132C', fontFamily: 'Montserrat, sans-serif' }}>Ya evaluaste esta reserva</div>
              <div style={{ fontSize: '13px', color: 'rgba(45,19,44,0.45)', fontFamily: 'Montserrat, sans-serif' }}>Solo se puede enviar una evaluación por reserva.</div>
              <button className="eval-close-btn" onClick={onClose}>Cerrar</button>
            </div>
          ) : (
            <div className="eval-body">

              {/* Perfil */}
              <div className="eval-perfil">
                {destinataria?.foto
                  ? <img src={destinataria.foto} className="eval-perfil-avatar" alt={nombreDest} />
                  : <div className="eval-perfil-iniciales">{nombreDest.charAt(0).toUpperCase()}</div>
                }
                <div>
                  <div className="eval-perfil-nombre">{nombreDest}</div>
                  <div className="eval-perfil-servicio">
                    {esTrabajadora ? '🛠️ Profesional' : '👩 Clienta'}
                  </div>
                </div>
              </div>

              {/* Calificación global */}
              <div>
                <div className="eval-estrellas-label">Calificación general</div>
                <Estrellas valor={estrellas} onChange={setEstrellas} size="grande" />
              </div>

              {/* Métricas */}
              <div>
                <div className="eval-estrellas-label" style={{ marginBottom: '12px' }}>Detalles</div>
                <div className="eval-metricas">
                  {listadoMetricas.map(m => (
                    <div key={m.key} className="eval-metrica">
                      <span className="eval-metrica-nombre">{m.label}</span>
                      <Estrellas
                        valor={metricas[m.key]}
                        onChange={v => setMetricas(prev => ({ ...prev, [m.key]: v }))}
                        size="pequena"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <div className="eval-estrellas-label" style={{ marginBottom: '8px' }}>Comentario (opcional)</div>
                <textarea
                  className="eval-textarea"
                  placeholder={esTrabajadora ? 'Describe tu experiencia con esta profesional…' : 'Describe cómo fue trabajar con esta clienta…'}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  maxLength={500}
                />
              </div>

              {error && (
                <div className="eval-error-box">⚠ {error}</div>
              )}

              <button className="eval-btn" onClick={enviarEvaluacion} disabled={enviando || estrellas === 0}>
                {enviando ? 'Enviando…' : 'Enviar evaluación'}
              </button>

            </div>
          )}

        </div>
      </div>
    </>
  )
}
