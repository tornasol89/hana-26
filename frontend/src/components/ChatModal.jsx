import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const css = `
  .chat-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .chat-modal {
    width: 100%; max-width: 520px;
    height: 600px; max-height: 90vh;
    background: white;
    border: 1px solid rgba(45,19,44,0.12);
    border-radius: 10px;
    display: flex; flex-direction: column;
    box-shadow: 0 20px 60px rgba(45,19,44,0.2);
    animation: slideUp 0.22s ease;
    overflow: hidden;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .chat-header {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(45,19,44,0.08);
    background: #2D132C;
    flex-shrink: 0;
  }
  .chat-header-avatar {
    width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(212,163,115,0.4); flex-shrink: 0;
  }
  .chat-header-iniciales {
    width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
    background: #C72C41;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: white;
    border: 2px solid rgba(212,163,115,0.3);
  }
  .chat-header-info { flex: 1; min-width: 0; }
  .chat-header-nombre { font-size: 14px; font-weight: 700; color: #F4EEED; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chat-header-servicio { font-size: 11px; color: rgba(244,238,237,0.4); margin-top: 2px; }
  .chat-close {
    background: transparent; border: none; color: rgba(244,238,237,0.4);
    font-size: 20px; cursor: pointer; padding: 4px; line-height: 1;
    transition: color 0.2s; flex-shrink: 0;
  }
  .chat-close:hover { color: #D4A373; }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 10px;
    background: #F4EEED;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(45,19,44,0.2); border-radius: 4px; }

  .chat-burbuja-wrap { display: flex; flex-direction: column; }
  .chat-burbuja-wrap.yo { align-items: flex-end; }
  .chat-burbuja-wrap.otra { align-items: flex-start; }

  .chat-burbuja {
    max-width: 75%; padding: 10px 14px;
    border-radius: 16px; font-size: 13px; line-height: 1.5;
    word-break: break-word;
  }
  .chat-burbuja.yo {
    background: #C72C41;
    color: white;
    border-bottom-right-radius: 4px;
  }
  .chat-burbuja.otra {
    background: white;
    border: 1px solid rgba(45,19,44,0.10);
    color: #4A4A4A;
    border-bottom-left-radius: 4px;
  }
  .chat-hora {
    font-size: 10px; color: rgba(45,19,44,0.35);
    margin-top: 4px; padding: 0 4px;
  }

  .chat-vacio {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: rgba(45,19,44,0.35); text-align: center; gap: 10px;
  }
  .chat-vacio-icono { font-size: 36px; opacity: 0.5; }

  .chat-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(45,19,44,0.08);
    display: flex; gap: 10px; align-items: flex-end;
    background: white; flex-shrink: 0;
  }
  .chat-input {
    flex: 1; background: #F4EEED;
    border: 1.5px solid rgba(45,19,44,0.12);
    border-radius: 6px; padding: 10px 14px;
    color: #2D132C; font-size: 13px; font-family: 'Montserrat', sans-serif;
    outline: none; resize: none; max-height: 100px; min-height: 40px;
    transition: border-color 0.2s;
  }
  .chat-input:focus { border-color: #C72C41; }
  .chat-input::placeholder { color: rgba(45,19,44,0.3); }
  .chat-send {
    width: 40px; height: 40px; border-radius: 6px; flex-shrink: 0;
    background: #C72C41;
    border: none; cursor: pointer; color: white; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s; align-self: flex-end;
  }
  .chat-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 16px rgba(199,44,65,0.3); }
  .chat-send:disabled { opacity: 0.45; cursor: not-allowed; }

  .chat-estado-banner {
    padding: 8px 16px; text-align: center;
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    background: rgba(212,163,115,0.08);
    border-bottom: 1px solid rgba(212,163,115,0.2);
    color: #b07d45;
    flex-shrink: 0;
  }
`

export default function ChatModal({ reserva, miUsuario, otraPersona, onClose }) {
  const [mensajes,  setMensajes]  = useState([])
  const [texto,     setTexto]     = useState('')
  const [enviando,  setEnviando]  = useState(false)
  const [cargando,  setCargando]  = useState(true)
  const bottomRef  = useRef(null)
  const pollingRef = useRef(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    cargarMensajes()
    marcarLeidos()
    // Polling cada 4 segundos
    pollingRef.current = setInterval(() => {
      cargarMensajes()
      marcarLeidos()
    }, 4000)
    return () => clearInterval(pollingRef.current)
  }, [reserva._id])

  async function marcarLeidos() {
    try {
      await axios.put(`http://localhost:5000/api/messages/${reserva._id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function cargarMensajes() {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${reserva._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMensajes(res.data)
    } catch (err) {
      console.error('Error cargando mensajes:', err)
    } finally {
      setCargando(false)
    }
  }

  async function enviar() {
    const t = texto.trim()
    if (!t || enviando) return
    setEnviando(true)
    try {
      const res = await axios.post(
        `http://localhost:5000/api/messages/${reserva._id}`,
        { texto: t },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMensajes(prev => [...prev, res.data])
      setTexto('')
    } catch (err) {
      console.error('Error enviando mensaje:', err)
    } finally {
      setEnviando(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  const nombreOtra = otraPersona
    ? `${otraPersona.nombre} ${otraPersona.apellido}`
    : 'Participante'

  return (
    <>
      <style>{css}</style>
      <div className="chat-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="chat-modal">

          {/* Header */}
          <div className="chat-header">
            {otraPersona?.foto
              ? <img src={otraPersona.foto} className="chat-header-avatar" alt={nombreOtra} />
              : <div className="chat-header-iniciales">{nombreOtra.charAt(0).toUpperCase()}</div>
            }
            <div className="chat-header-info">
              <div className="chat-header-nombre">{nombreOtra}</div>
              <div className="chat-header-servicio">📋 {reserva.servicio}</div>
            </div>
            <button className="chat-close" onClick={onClose}>✕</button>
          </div>

          {/* Banner estado */}
          <div className="chat-estado-banner">
            Chat habilitado · Reserva {reserva.estado === 'completada' ? 'completada' : 'aceptada'}
          </div>

          {/* Mensajes */}
          <div className="chat-messages">
            {cargando ? (
              <div className="chat-vacio">
                <div className="chat-vacio-icono">⏳</div>
                <span style={{ fontSize: '13px' }}>Cargando mensajes…</span>
              </div>
            ) : mensajes.length === 0 ? (
              <div className="chat-vacio">
                <div className="chat-vacio-icono">💬</div>
                <span style={{ fontSize: '13px' }}>Aún no hay mensajes.</span>
                <span style={{ fontSize: '12px' }}>¡Sé la primera en escribir!</span>
              </div>
            ) : (
              mensajes.map(msg => {
                const esMio = msg.autor._id === miUsuario._id || msg.autor._id === miUsuario.id
                const hora  = new Date(msg.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={msg._id} className={`chat-burbuja-wrap ${esMio ? 'yo' : 'otra'}`}>
                    <div className={`chat-burbuja ${esMio ? 'yo' : 'otra'}`}>
                      {msg.texto}
                    </div>
                    <span className="chat-hora">{hora}</span>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-footer">
            <textarea
              className="chat-input"
              placeholder="Escribe un mensaje…"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              maxLength={1000}
            />
            <button className="chat-send" onClick={enviar} disabled={!texto.trim() || enviando}>
              {enviando ? '⏳' : '➤'}
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
