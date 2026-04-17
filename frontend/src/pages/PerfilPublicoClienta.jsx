import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const styles = `
  * { box-sizing: border-box; }
  .ppc-root { background: #F4EEED; min-height: 100vh; font-family: 'Montserrat', sans-serif; }
  .ppc-hero { background: #2D132C; padding: 48px 24px 40px; }
  .ppc-inner { max-width: 640px; margin: 0 auto; }
  .ppc-back { background: transparent; border: none; color: rgba(244,238,237,0.5); font-size: 13px; cursor: pointer; padding: 0 0 20px; font-family: 'Montserrat', sans-serif; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
  .ppc-back:hover { color: #F4EEED; }
  .ppc-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(212,163,115,0.5); object-fit: cover; display: block; }
  .ppc-avatar-iniciales { width: 96px; height: 96px; border-radius: 50%; border: 3px solid rgba(212,163,115,0.5); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white; background: #7a3aa8; }
  .ppc-nombre { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; color: #F4EEED; margin: 16px 0 4px; letter-spacing: -0.5px; }
  .ppc-subtitulo { font-size: 12px; color: rgba(244,238,237,0.45); text-transform: uppercase; letter-spacing: 1px; }
  .ppc-section { padding: 32px 24px; max-width: 640px; margin: 0 auto; }
  .ppc-card { background: white; border: 1px solid rgba(45,19,44,0.08); border-radius: 8px; padding: 20px; box-shadow: 0 1px 6px rgba(45,19,44,0.05); }
  .ppc-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(45,19,44,0.07); }
  .ppc-row:last-child { border-bottom: none; }
  .ppc-label { font-size: 12px; color: rgba(45,19,44,0.5); }
  .ppc-valor { font-size: 13px; color: #2D132C; font-weight: 600; }
  .ppc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .ppc-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #F4EEED; font-family: 'Montserrat', sans-serif; font-size: 14px; color: rgba(45,19,44,0.5); }
`

const coloresAvatar = ['#d4537e', '#c4892a', '#7a3aa8', '#5DCAA5']

export default function PerfilPublicoClienta() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [clienta, setClienta]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    if (!['trabajadora', 'admin'].includes(usuario.tipo)) {
      navigate('/'); return
    }

    axios.get(`http://localhost:5000/api/auth/clienta/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setClienta(res.data))
      .catch(err => setError(err.response?.data?.mensaje || 'Error al cargar perfil'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="ppc-loading"><style>{styles}</style>Cargando perfil…</div>

  if (error) return (
    <>
      <style>{styles}</style>
      <div className="ppc-root">
        <Navbar />
        <div className="ppc-section">
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(45,19,44,0.45)', fontSize: '14px' }}>
            {error}
          </div>
        </div>
        <Footer />
      </div>
    </>
  )

  if (!clienta) return null

  const nombre       = `${clienta.nombre} ${clienta.apellido}`
  const inicial      = clienta.nombre?.charAt(0).toUpperCase() || '?'
  const colorAvatar  = coloresAvatar[clienta._id?.charCodeAt(0) % coloresAvatar.length] || '#7a3aa8'
  const ubicacion    = [clienta.comuna, clienta.region].filter(Boolean).join(', ') || 'No especificada'
  const miembro      = new Date(clienta.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })

  return (
    <>
      <style>{styles}</style>
      <div className="ppc-root">
        <Navbar />

        <div className="ppc-hero">
          <div className="ppc-inner">
            <button className="ppc-back" onClick={() => navigate(-1)}>← Volver</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {clienta.foto
                ? <img src={clienta.foto} alt={nombre} className="ppc-avatar" />
                : <div className="ppc-avatar-iniciales" style={{ background: colorAvatar }}>{inicial}</div>
              }
              <div>
                <h1 className="ppc-nombre">{nombre}</h1>
                <p className="ppc-subtitulo">Clienta Hana</p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {clienta.verificada ? (
                    <span className="ppc-badge" style={{ background: 'rgba(93,202,165,0.15)', color: '#5DCAA5', border: '1px solid rgba(93,202,165,0.3)' }}>
                      ✓ Verificada
                    </span>
                  ) : (
                    <span className="ppc-badge" style={{ background: 'rgba(232,184,109,0.12)', color: '#e8b86d', border: '1px solid rgba(232,184,109,0.25)' }}>
                      {clienta.estadoVerificacion === 'enviado' ? '🕐 En revisión' : 'Sin verificar'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ppc-section">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '900', color: '#2D132C', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            Información
          </h2>
          <div className="ppc-card">
            <div className="ppc-row">
              <span className="ppc-label">Nombre</span>
              <span className="ppc-valor">{nombre}</span>
            </div>
            <div className="ppc-row">
              <span className="ppc-label">Ubicación</span>
              <span className="ppc-valor">{ubicacion}</span>
            </div>
            <div className="ppc-row">
              <span className="ppc-label">Miembro desde</span>
              <span className="ppc-valor">{miembro}</span>
            </div>
            <div className="ppc-row">
              <span className="ppc-label">Estado</span>
              <span className="ppc-valor">
                {clienta.verificada
                  ? <span style={{ color: '#5DCAA5' }}>✓ Verificada</span>
                  : <span style={{ color: '#e8b86d' }}>Sin verificar</span>
                }
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(45,19,44,0.04)', border: '1px solid rgba(45,19,44,0.08)', borderRadius: '8px', fontSize: '12px', color: 'rgba(45,19,44,0.5)', lineHeight: '1.6' }}>
            🔒 Por seguridad, solo se muestran los datos necesarios para establecer confianza. El correo y datos sensibles no son visibles.
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
