import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid'
import BookingModal from './BookingModal'
import './WorkerProfile.css'

const API_URL = 'http://localhost:5000/api'

function WorkerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState(null)
  const [reviews, setReviews] = useState([])
  const [promedio, setPromedio] = useState(0)
  const [metricasPromedio, setMetricasPromedio] = useState({ puntualidad: 0, confiabilidad: 0, calidad: 0, comunicacion: 0, precio: 0 })
  const [serviciosCompletados, setServiciosCompletados] = useState(0)
  const [tasaRespuesta, setTasaRespuesta] = useState(100)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const usuarioLogueadoJSON = localStorage.getItem('usuario')
  const usuarioLogueado = usuarioLogueadoJSON ? JSON.parse(usuarioLogueadoJSON) : null

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true)
        setError(null)

        const response = await fetch(`${API_URL}/workers/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.mensaje || 'No se pudo cargar el perfil')
        }

        // El backend devuelve { perfil, reviews, promedio, metricasPromedio, serviciosCompletados, tasaRespuesta }
        setPerfil(data.perfil || data)
        setReviews(Array.isArray(data.reviews) ? data.reviews : [])
        setPromedio(Number(data.promedio) || 0)
        setMetricasPromedio(data.metricasPromedio || { puntualidad: 0, confiabilidad: 0, calidad: 0, comunicacion: 0, precio: 0 })
        setServiciosCompletados(Number(data.serviciosCompletados) || 0)
        setTasaRespuesta(Number(data.tasaRespuesta) ?? 100)
      } catch (err) {
        console.error('Error cargando perfil:', err)
        setError(err.message || 'Error al cargar perfil')
      } finally {
        setCargando(false)
      }
    }

    cargarPerfil()
  }, [id])

  const nombreCompleto = useMemo(() => {
    if (!perfil) return ''
    const nombre = perfil.usuario?.nombre || ''
    const apellido = perfil.usuario?.apellido || ''
    return `${nombre} ${apellido}`.trim() || 'Profesional Hana'
  }, [perfil])

  const iniciales = useMemo(() => {
    if (!perfil) return 'H'
    const nombre = perfil.usuario?.nombre?.charAt(0) || ''
    const apellido = perfil.usuario?.apellido?.charAt(0) || ''
    return `${nombre}${apellido}`.toUpperCase() || 'H'
  }, [perfil])

  const categoria = perfil?.categoria || 'Especialidad no definida'
  const ubicacion =
    [perfil?.usuario?.comuna, perfil?.usuario?.region].filter(Boolean).join(', ') ||
    'Ubicación no disponible'

  const descripcion =
    perfil?.descripcion?.trim() || 'La trabajadora no ha añadido una descripción de su servicio.'

  const foto = perfil?.foto || perfil?.photoUrl || ''

  const indiceHana = promedio > 0 ? Math.round(promedio * 20) : 0

  const esMiPerfil =
    usuarioLogueado &&
    (usuarioLogueado.id === perfil?.usuario?._id ||
      usuarioLogueado._id === perfil?.usuario?._id)

  const valoraciones = [
    { nombre: 'Puntualidad',        valor: metricasPromedio.puntualidad   || 0 },
    { nombre: 'Confiabilidad',      valor: metricasPromedio.confiabilidad || 0 },
    { nombre: 'Calidad del trabajo',valor: metricasPromedio.calidad       || 0 },
    { nombre: 'Comunicación',       valor: metricasPromedio.comunicacion  || 0 },
    { nombre: 'Precio justo',       valor: metricasPromedio.precio        || 0 },
  ]

  const tarifa = perfil?.tarifaHora > 0
    ? `$${perfil.tarifaHora.toLocaleString('es-CL')}/hr`
    : 'A convenir'

  if (cargando) {
    return <div className="worker-profile-state">Cargando perfil...</div>
  }

  if (error) {
    return <div className="worker-profile-state error">Error: {error}</div>
  }

  if (!perfil) {
    return <div className="worker-profile-state error">No se encontró la profesional.</div>
  }

  return (
    <div className="worker-profile-page">
      <div className="worker-profile-container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Volver
        </button>

        <header className="profile-header">
          <div className="profile-avatar-block">
            <div className="profile-photo-wrapper">
              {foto ? (
                <img src={foto} alt={nombreCompleto} className="profile-image" />
              ) : (
                <div className="profile-initials">{iniciales}</div>
              )}

              <span
                className={`status-dot ${perfil?.disponible ? 'available' : 'unavailable'}`}
                title={perfil?.disponible ? 'Disponible' : 'No disponible'}
              />
            </div>
          </div>

          <div className="profile-main-info">
            <h1>{nombreCompleto}</h1>
            <p className="specialty">{categoria.toUpperCase()}</p>

            <div className="location">
              <MapPinIcon className="icon-map" />
              <span>{ubicacion}</span>
            </div>

            <div className="rating-info">
              <StarIcon className="icon-star" />
              <span className="stars-text">★★★★★</span>
              <span className="rating-number">{promedio.toFixed(1)}</span>
              <span className="reviews-count">({reviews.length} reseñas)</span>
            </div>
          </div>

          <div className="hana-index-box">
            <p className="hana-label">ÍNDICE HANA</p>
            <span className="hana-value">{indiceHana}</span>
            <p className="hana-status">{indiceHana >= 70 ? 'Confiable' : 'Por evaluar'}</p>
          </div>
        </header>

        <section className="profile-sections">
          <div className="services-details">
            <h2>Valoraciones detalladas</h2>

            {valoraciones.map((item) => (
              <div key={item.nombre} className="detail-row">
                <div className="detail-row-top">
                  <span>{item.nombre}</span>
                  <span>{item.valor}%</span>
                </div>

                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${item.valor}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="booking-info">
            <div className="stat-card">
              <span>Servicios completados</span>
              <span className="value">{serviciosCompletados}</span>
            </div>

            <div className="stat-card">
              <span>Tasa de respuesta</span>
              <span className="value">{tasaRespuesta}%</span>
            </div>

            <div className="stat-card">
              <span>Tarifa</span>
              <span className="value">{tarifa}</span>
            </div>

            <div className="stat-card">
              <span>Reseñas recibidas</span>
              <span className="value">{reviews.length}</span>
            </div>
          </div>
        </section>

        <section className="about-service">
          <h2>Sobre mi servicio</h2>
          <p>{descripcion}</p>
        </section>

        <section className="client-reviews">
          <h2>
            Reseñas de clientas
            {reviews.length > 0 && (
              <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '10px', color: '#e8b86d' }}>
                ★ {promedio} ({reviews.length})
              </span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <p className="no-reviews">Aún no hay reseñas.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {review.autor?.foto ? (
                        <img src={review.autor.foto} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,163,115,0.3)' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d4537e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white' }}>
                          {review.autor?.nombre?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>
                          {review.autor?.nombre} {review.autor?.apellido}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.5 }}>
                          {new Date(review.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '16px', letterSpacing: '2px', color: '#D4A373', flexShrink: 0 }}>
                      {'★'.repeat(review.estrellas)}{'☆'.repeat(5 - review.estrellas)}
                    </div>
                  </div>
                  {review.comentario && (
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', opacity: 0.8, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      "{review.comentario}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="profile-actions">
          {!esMiPerfil && (
            <button className="booking-button" onClick={() => setMostrarModal(true)}>
              Solicitar reserva
            </button>
          )}

          <button onClick={() => navigate(-1)} className="back-outline-button">
            ← Volver
          </button>
        </footer>
      </div>

      {mostrarModal && (
        <BookingModal
          trabajadoraId={perfil._id}
          trabajadoraNombre={nombreCompleto}
          categoria={categoria}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  )
}

export default WorkerProfile