import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  CATEGORIAS_TRADICIONALES,
  CATEGORIAS_EMPODERAMIENTO,
  NOMBRES_CATEGORIAS,
} from '../data/categorias'

// ─── Datos estáticos ──────────────────────────────────────────────────────────

const slides = [
  { url: 'https://images.pexels.com/photos/7600944/pexels-photo-7600944.jpeg?auto=compress&cs=tinysrgb&w=1200', titulo: 'Mecánica automotriz', acento: '#e8b86d' },
  { url: 'https://images.pexels.com/photos/4099263/pexels-photo-4099263.jpeg?auto=compress&cs=tinysrgb&w=1200', titulo: 'Hogar y limpieza', acento: '#d4537e' },
  { url: 'https://images.pexels.com/photos/7496747/pexels-photo-7496747.jpeg?auto=compress&cs=tinysrgb&w=1200', titulo: 'Diseño y tecnología', acento: '#e8b86d' },
  { url: 'https://images.pexels.com/photos/5641761/pexels-photo-5641761.jpeg?auto=compress&cs=tinysrgb&w=1200', titulo: 'Construcción y pintura', acento: '#d4537e' },
]

const regiones = [
  'Arica y Parinacota','Tarapacá','Antofagasta','Atacama',
  'Coquimbo','Valparaíso','Metropolitana',"O'Higgins",
  'Maule','Ñuble','Biobío','La Araucanía','Los Ríos',
  'Los Lagos','Aysén','Magallanes',
]

const stats = [
  { num: '2.400+', label: 'Profesionales activas' },
  { num: '17', label: 'Categorías de servicio' },
  { num: '4.9★', label: 'Valoración promedio' },
]

const pasos = [
  { n: '01', titulo: 'Elige una categoría', desc: 'Explora los rubros disponibles y encuentra el servicio que necesitas.' },
  { n: '02', titulo: 'Revisa perfiles', desc: 'Lee reseñas, verifica credenciales y elige con confianza.' },
  { n: '03', titulo: 'Reserva en línea', desc: 'Agenda con la profesional según su disponibilidad.' },
  { n: '04', titulo: 'Evalúa el servicio', desc: 'Tu opinión ayuda a fortalecer y proteger la comunidad Hana.' },
]

const coloresAvatar = ['#2D132C','#C72C41','#7a3aa8','#4a7c5a','#b07d45','#5a3d72']

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

function useCarrusel(total, intervalo = 4500) {
  const [actual, setActual] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActual(p => (p + 1) % total), intervalo)
    return () => clearInterval(t)
  }, [total, intervalo])
  return [actual, setActual]
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Home() {
  const isMobile = useIsMobile()
  const [slideActual, setSlideActual] = useCarrusel(slides.length)
  const [trabajadoras, setTrabajadoras] = useState([])
  const [catActiva, setCatActiva] = useState('todas')
  const [mostrarTodas, setMostrarTodas] = useState(false)

  // Buscador
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [busquedaRegion, setBusquedaRegion] = useState('')
  const [buscando, setBuscando] = useState(false)

  // Modal de subcategorías
  const [catModal, setCatModal] = useState(null) // objeto categoría completo o null

  useEffect(() => { cargarTrabajadoras() }, [])

  async function cargarTrabajadoras(categoria = '', region = '') {
    try {
      setBuscando(true)
      const params = new URLSearchParams()
      if (categoria) params.append('categoria', categoria)
      if (region) params.append('region', region)
      const url = `http://localhost:5000/api/workers${params.toString() ? '?' + params.toString() : ''}`
      const res = await axios.get(url)
      setTrabajadoras(res.data || [])
      setMostrarTodas(false)
    } catch (err) {
      console.error('Error cargando trabajadoras:', err)
      setTrabajadoras([])
    } finally {
      setBuscando(false)
    }
  }

  function handleBuscar() {
    cargarTrabajadoras(busquedaCategoria, busquedaRegion)
    setTimeout(() => {
      document.getElementById('profesionales')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  function handleLimpiarBusqueda() {
    setBusquedaCategoria('')
    setBusquedaRegion('')
    cargarTrabajadoras()
  }

  const scrollToId = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Al hacer click en una tarjeta de categoría → abrir modal de subcategorías
  function handleClickCategoria(cat) {
    setCatModal(cat)
  }

  // Al elegir subcategoría desde el modal → filtrar profesionales y cerrar modal
  function handleElegirSubcategoria(subcategoria) {
    setCatModal(null)
    // Buscar por categoría padre (el backend filtra por categoria, no subcategoria aún)
    setBusquedaCategoria(catModal.nombre)
    cargarTrabajadoras(catModal.nombre, busquedaRegion)
    setTimeout(() => {
      document.getElementById('profesionales')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  // Al elegir "Ver todas de esta categoría" sin subcategoría específica
  function handleVerTodasCategoria() {
    setBusquedaCategoria(catModal.nombre)
    cargarTrabajadoras(catModal.nombre, busquedaRegion)
    setCatModal(null)
    setTimeout(() => {
      document.getElementById('profesionales')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  const trabajadorasVisibles = mostrarTodas ? trabajadoras : trabajadoras.slice(0, 3)

  // ─── Tarjeta de categoría ─────────────────────────────────────────────────

  function CatCard({ cat, esEmpod }) {
    return (
      <div
        className={`cat-card ${esEmpod ? 'empod' : ''}`}
        onClick={() => handleClickCategoria(cat)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClickCategoria(cat)}
      >
        <span className="cat-icono">{cat.icono}</span>
        <div className="cat-nombre">{cat.nombre}</div>
        <div className="cat-sub-hint">{cat.subcategorias.length} especialidades</div>
        {esEmpod && <div className="cat-badge">Nuevo</div>}
      </div>
    )
  }

  // ─── Modal de subcategorías ───────────────────────────────────────────────

  function ModalSubcategorias() {
    if (!catModal) return null
    return (
      <div
        className="modal-overlay"
        onClick={() => setCatModal(null)}
      >
        <div
          className="modal-box"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <span className="modal-icono">{catModal.icono}</span>
            <div>
              <h3 className="modal-titulo">{catModal.nombre}</h3>
              <p className="modal-subtitulo">¿Qué servicio específico necesitas?</p>
            </div>
            <button className="modal-cerrar" onClick={() => setCatModal(null)}>✕</button>
          </div>

          <div className="modal-subs">
            {catModal.subcategorias.map(sub => (
              <button
                key={sub}
                className="modal-sub-btn"
                onClick={() => handleElegirSubcategoria(sub)}
              >
                {sub}
              </button>
            ))}
          </div>

          <button
            className="modal-todas-btn"
            onClick={handleVerTodasCategoria}
          >
            Ver todas las profesionales de {catModal.nombre} →
          </button>
        </div>
      </div>
    )
  }

  // ─── CSS ──────────────────────────────────────────────────────────────────

  const styles = `
    * { box-sizing: border-box; }

    .hana-root { background-color: #F4EEED; min-height: 100vh; color: #4A4A4A; font-family: 'Montserrat', sans-serif; }

    /* Banner */
    .banner-compromiso {
      background: #2D132C;
      padding: 10px 24px;
      display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
    }
    .banner-texto { font-size: 11px; color: rgba(244,238,237,0.55); letter-spacing: 0.5px; font-weight: 500; }
    .banner-link {
      font-size: 11px; font-weight: 700; color: #D4A373;
      text-decoration: none; letter-spacing: 1px; text-transform: uppercase;
      transition: color 0.2s;
    }
    .banner-link:hover { color: #e8c48e; }

    /* Hero */
    .hero { position: relative; overflow: hidden; height: ${isMobile ? '500px' : '680px'}; }
    .hero-slide { position: absolute; inset: 0; background-size: cover; background-position: center; transition: opacity 1.2s ease-in-out; opacity: 0; }
    .hero-slide.activo { opacity: 1; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(160deg,rgba(45,19,44,0.55),rgba(45,19,44,0.75)); }
    .hero-content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 24px; height: 100%; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(212,163,115,0.15); border: 1px solid rgba(212,163,115,0.4);
      color: #D4A373; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
      padding: 7px 20px; border-radius: 4px; margin-bottom: 24px;
      font-weight: 700;
    }
    .hero-titulo {
      font-family: 'Playfair Display', serif; font-weight: 900;
      line-height: 1.05; color: #F4EEED;
      font-size: ${isMobile ? '36px' : '62px'};
      margin: 0 0 16px;
      max-width: ${isMobile ? '320px' : '640px'};
      letter-spacing: -1px;
    }
    .hero-subtitulo {
      font-size: ${isMobile ? '14px' : '17px'};
      color: rgba(244,238,237,0.7); margin-bottom: 36px;
      max-width: ${isMobile ? '280px' : '460px'}; line-height: 1.6;
      font-weight: 400;
    }
    .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 40px; }
    .hero-dots { display: flex; justify-content: center; gap: 8px; }
    .hero-dot { height: 4px; border-radius: 2px; cursor: pointer; transition: all 0.3s; }

    /* Botones base */
    .btn-primary { background: #C72C41; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'Montserrat', sans-serif; transition: background 0.2s, transform 0.2s; font-size: 13px; padding: ${isMobile ? '12px 26px' : '13px 32px'}; letter-spacing: 1.5px; text-transform: uppercase; }
    .btn-primary:hover { background: #a01f30; transform: translateY(-1px); }
    .btn-outline-gold { background: transparent; color: #D4A373; border: 1.5px solid rgba(212,163,115,0.5); border-radius: 6px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'Montserrat', sans-serif; transition: all 0.2s; font-size: 13px; padding: ${isMobile ? '12px 26px' : '13px 32px'}; letter-spacing: 1.5px; text-transform: uppercase; }
    .btn-outline-gold:hover { border-color: #D4A373; background: rgba(212,163,115,0.1); }
    .btn-blanco { background: #F4EEED; color: #2D132C; border: none; border-radius: 6px; padding: 13px 36px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'Montserrat', sans-serif; transition: all 0.2s; letter-spacing: 1.5px; text-transform: uppercase; font-size: 13px; }
    .btn-blanco:hover { background: white; transform: translateY(-1px); }

    /* Stats */
    .hero-stats {
      display: flex; justify-content: center;
      flex-wrap: wrap; position: relative; z-index: 2;
      background: #2D132C;
      border-bottom: none;
    }
    .hero-stat {
      text-align: center;
      padding: ${isMobile ? '20px 28px' : '28px 56px'};
      border-right: 1px solid rgba(212,163,115,0.15);
      flex: 1; min-width: 120px;
    }
    .hero-stat:last-child { border-right: none; }
    .hero-stat-num {
      color: #D4A373; font-weight: 700; margin-bottom: 5px;
      font-family: 'Playfair Display', serif;
      font-size: ${isMobile ? '26px' : '34px'};
      line-height: 1;
    }
    .hero-stat-label { font-size: 10px; color: rgba(212,163,115,0.55); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }

    /* Secciones genéricas */
    .seccion-titulo { font-family: 'Playfair Display', serif; font-weight: 900; color: #2D132C; margin: 0 0 16px; text-align: center; letter-spacing: -1px; }
    .seccion-subtitulo { font-size: 14px; color: #4A4A4A; text-align: center; margin-bottom: 36px; }
    .seccion-linea { width: 40px; height: 3px; background: #C72C41; margin: 0 auto 28px; }

    /* Pasos */
    .seccion-pasos { background: white; }
    .pasos-grid { display: grid; grid-template-columns: ${isMobile ? '1fr' : 'repeat(2, 1fr)'}; gap: 16px; max-width: 900px; margin: 0 auto; }
    .paso-card {
      background: #2D132C;
      border: 1px solid rgba(212,163,115,0.12);
      border-radius: 8px; padding: 28px 26px;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .paso-card:hover { border-color: rgba(212,163,115,0.4); transform: translateY(-3px); box-shadow: 0 8px 28px rgba(45,19,44,0.25); }
    .paso-numero {
      font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900;
      color: rgba(199,44,65,0.45); margin-bottom: 14px; line-height: 1;
    }
    .paso-titulo { color: #F4EEED; margin: 0 0 10px; font-weight: 700; font-size: 15px; letter-spacing: -0.2px; }
    .paso-desc { font-size: 13px; color: rgba(244,238,237,0.6); line-height: 1.7; margin: 0; }

    /* Banner CTA profesional */
    .banner-cta {
      background: #2D132C;
      border-radius: 8px; text-align: center; margin: 0 auto;
      max-width: 760px; padding: ${isMobile ? '52px 28px' : '72px 64px'};
    }
    .banner-cta-label {
      font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
      color: #D4A373; margin-bottom: 14px;
      display: inline-flex; align-items: center; gap: 8px; font-weight: 700;
    }
    .banner-cta-label::before, .banner-cta-label::after {
      content: ''; display: block; width: 24px; height: 1px; background: rgba(212,163,115,0.4);
    }
    .banner-cta-titulo {
      font-family: 'Playfair Display', serif; font-weight: 900;
      color: #F4EEED; margin: 0 0 16px; font-size: ${isMobile ? '30px' : '44px'};
      line-height: 1.1; letter-spacing: -1px;
    }
    .banner-cta-desc { font-size: 14px; color: rgba(244,238,237,0.55); margin-bottom: 32px; line-height: 1.65; max-width: 460px; margin-left: auto; margin-right: auto; }

    /* Categorías */
    .seccion-cats { padding-top: 52px; }
    .cats-tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 36px; flex-wrap: wrap; }
    .cat-tab { background: transparent; border: 1.5px solid rgba(45,19,44,0.15); color: rgba(45,19,44,0.5); padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700; font-family: 'Montserrat', sans-serif; transition: all 0.2s; letter-spacing: 1px; text-transform: uppercase; }
    .cat-tab:hover { border-color: rgba(45,19,44,0.35); color: #2D132C; }
    .cat-tab.activo { background: #2D132C; border-color: #2D132C; color: white; }

    /* Grid de categorías */
    .cats-grid { display: grid; grid-template-columns: ${isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'}; gap: 12px; margin-bottom: 32px; }

    .cat-card {
      background: white;
      border: 1px solid rgba(45,19,44,0.08);
      border-radius: 8px; padding: 22px 16px;
      text-align: center; cursor: pointer;
      transition: all 0.22s; position: relative; user-select: none;
      box-shadow: 0 1px 6px rgba(45,19,44,0.05);
    }
    .cat-card:hover {
      border-color: rgba(199,44,65,0.3);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(45,19,44,0.10);
    }
    .cat-card:active { transform: translateY(-1px); }
    .cat-card.empod { border-left: 3px solid #D4A373; }
    .cat-card.empod:hover { border-color: rgba(212,163,115,0.5); border-left-color: #D4A373; }
    .cat-icono { font-size: 32px; display: block; margin-bottom: 10px; line-height: 1; }
    .cat-nombre { font-size: 12px; font-weight: 700; color: #2D132C; margin-bottom: 5px; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.5px; }
    .cat-sub-hint { font-size: 11px; color: rgba(45,19,44,0.4); }
    .cat-badge { position: absolute; top: 10px; right: 10px; background: #C72C41; color: white; font-size: 8px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; }

    /* Modal subcategorías */
    .modal-overlay { position: fixed; inset: 0; background: rgba(45,19,44,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; }
    .modal-box { background: white; border: 1px solid rgba(45,19,44,0.12); border-radius: 10px; padding: 28px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(45,19,44,0.2); animation: slideUp 0.2s ease; }
    .modal-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
    .modal-icono { font-size: 36px; line-height: 1; flex-shrink: 0; }
    .modal-titulo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #2D132C; margin: 0 0 4px; letter-spacing: -0.5px; }
    .modal-subtitulo { font-size: 13px; color: #4A4A4A; margin: 0; }
    .modal-cerrar { margin-left: auto; background: transparent; border: 1px solid rgba(45,19,44,0.15); color: #2D132C; font-size: 16px; cursor: pointer; padding: 4px 10px; border-radius: 6px; transition: all 0.15s; flex-shrink: 0; }
    .modal-cerrar:hover { background: rgba(45,19,44,0.06); }
    .modal-subs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .modal-sub-btn { background: #F4EEED; border: 1px solid rgba(45,19,44,0.1); color: #2D132C; border-radius: 6px; padding: 12px 14px; font-size: 12px; font-weight: 600; cursor: pointer; text-align: left; font-family: 'Montserrat', sans-serif; transition: all 0.15s; }
    .modal-sub-btn:hover { background: rgba(199,44,65,0.07); border-color: rgba(199,44,65,0.3); color: #C72C41; }
    .modal-todas-btn { width: 100%; background: #2D132C; border: none; color: #F4EEED; border-radius: 6px; padding: 12px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: background 0.15s; letter-spacing: 1px; text-transform: uppercase; }
    .modal-todas-btn:hover { background: #3d1a3c; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* Buscador */
    .buscador-box {
      background: white;
      border: 1px solid rgba(45,19,44,0.10);
      border-radius: 8px; padding: 20px 24px;
      max-width: 760px; margin: 0 auto 36px;
      display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;
      box-shadow: 0 2px 12px rgba(45,19,44,0.07);
    }
    .buscador-campo { display: flex; flex-direction: column; gap: 7px; flex: 1; min-width: 160px; }
    .buscador-label { font-size: 9px; color: rgba(45,19,44,0.45); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; }
    .buscador-select {
      background: #F4EEED; border: 1.5px solid rgba(45,19,44,0.12);
      border-radius: 6px; padding: 10px 14px; color: #2D132C; font-size: 13px;
      font-family: 'Montserrat', sans-serif; outline: none; cursor: pointer; -webkit-appearance: none;
      transition: border-color 0.2s; font-weight: 500;
    }
    .buscador-select option { background: white; color: #2D132C; }
    .buscador-select:focus { border-color: #C72C41; }
    .buscador-btn {
      background: #C72C41;
      color: white; border: none; border-radius: 6px; padding: 10px 24px;
      font-size: 11px; font-weight: 700; cursor: pointer;
      font-family: 'Montserrat', sans-serif; transition: background 0.2s, transform 0.2s; white-space: nowrap;
      letter-spacing: 1.5px; text-transform: uppercase;
    }
    .buscador-btn:hover { background: #a01f30; transform: translateY(-1px); }
    .buscador-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .buscador-clear {
      background: transparent; border: 1.5px solid rgba(45,19,44,0.12);
      color: rgba(45,19,44,0.45); border-radius: 6px; padding: 10px 16px;
      font-size: 11px; cursor: pointer; font-family: 'Montserrat', sans-serif; transition: all 0.2s; white-space: nowrap;
      font-weight: 600; letter-spacing: 0.5px;
    }
    .buscador-clear:hover { border-color: rgba(45,19,44,0.3); color: #2D132C; }

    /* Worker cards */
    .worker-card {
      background: white;
      border: 1px solid rgba(45,19,44,0.08);
      border-radius: 8px; padding: 22px; display: block;
      text-decoration: none; color: inherit; transition: all 0.22s;
      box-shadow: 0 1px 8px rgba(45,19,44,0.06);
    }
    .worker-card:hover { border-color: rgba(199,44,65,0.25); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(45,19,44,0.12); }
    .worker-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .worker-nombre { font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #2D132C; }
    .worker-cat { font-size: 12px; color: #4A4A4A; margin-bottom: 14px; }
    .worker-stars { color: #D4A373; font-size: 13px; margin-bottom: 10px; letter-spacing: 2px; }
    .worker-desc { font-size: 13px; color: #4A4A4A; line-height: 1.55; margin-bottom: 14px; min-height: 38px; }
    .worker-footer { display: flex; align-items: center; justify-content: space-between; }
    .worker-dispo { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; color: #4A4A4A; text-transform: uppercase; letter-spacing: 0.5px; }
    .worker-dispo-dot { width: 7px; height: 7px; border-radius: 50%; display: block; }
    .worker-ver { font-size: 11px; color: #C72C41; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  `

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{styles}</style>
      <div className="hana-root">
        <Navbar />

        {/* Banner */}
        <div className="banner-compromiso">
          <p className="banner-texto">🛡️ Hana es el lugar seguro para mujeres que buscan y ofrecen servicios</p>
          <Link to="/compromiso" className="banner-link">Ver nuestro compromiso →</Link>
        </div>

        {/* Hero */}
        <section className="hero">
          {slides.map((slide, i) => (
            <div key={i} className={`hero-slide ${i === slideActual ? 'activo' : ''}`} style={{ backgroundImage: `url(${slide.url})` }} />
          ))}
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-badge">⭐ Confianza y calidad</div>
            <h1 className="hero-titulo">Hecho por mujeres, para mujeres</h1>
            <p className="hero-subtitulo">Conecta con profesionales verificadas en tu área</p>
            <div className="hero-btns">
              <button onClick={() => scrollToId('categorias')} className="btn-primary">Buscar servicios</button>
              <button onClick={() => scrollToId('como-funciona')} className="btn-outline-gold">Cómo funciona</button>
            </div>
            <div className="hero-dots">
              {slides.map((_, i) => (
                <div key={i} className="hero-dot" onClick={() => setSlideActual(i)}
                  style={{ width: i === slideActual ? '28px' : '7px', backgroundColor: i === slideActual ? slides[slideActual].acento : 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="hero-stats">
          {stats.map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-num">{s.num}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cómo funciona */}
        <section id="como-funciona" className="seccion-pasos" style={{ padding: isMobile ? '52px 24px' : '72px 64px' }}>
          <p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C72C41', marginBottom: '12px', fontWeight: '700' }}>¿Cómo funciona?</p>
          <h2 className="seccion-titulo" style={{ fontSize: isMobile ? '28px' : '38px' }}>Simple, seguro y rápido</h2>
          <div className="seccion-linea" />
          <div className="pasos-grid">
            {pasos.map(p => (
              <div key={p.n} className="paso-card">
                <div className="paso-numero">{p.n}</div>
                <h3 className="paso-titulo">{p.titulo}</h3>
                <p className="paso-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA profesional — sin el botón duplicado, solo el del header */}
        <section style={{ padding: isMobile ? '0 20px 40px' : '0 48px 52px' }}>
          <div className="banner-cta">
            <p className="banner-cta-label">¿Eres profesional?</p>
            <h2 className="banner-cta-titulo">Únete a Hana y haz<br />crecer tu negocio</h2>
            <p className="banner-cta-desc">Crea tu perfil, revisa los requisitos y comienza tu proceso de verificación.</p>
            {/* ✅ Apunta al compromiso con destino, NO directo a register-worker */}
            <Link to="/compromiso?destino=trabajadora" className="btn-blanco">
              Comenzar ahora →
            </Link>
          </div>
        </section>

        {/* Categorías */}
        <section id="categorias" className="seccion-cats" style={{ padding: isMobile ? '52px 20px' : '72px 48px' }}>
          <p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C72C41', marginBottom: '12px', fontWeight: '700' }}>Categorías</p>
          <h2 className="seccion-titulo" style={{ fontSize: isMobile ? '28px' : '38px' }}>¿Qué servicio necesitas?</h2>
          <div className="seccion-linea" />
          <p className="seccion-subtitulo">Haz clic en una categoría para ver sus especialidades</p>

          <div className="cats-tabs">
            {['todas', 'tradicionales', 'empoderamiento'].map(tab => (
              <button key={tab} className={`cat-tab ${catActiva === tab ? 'activo' : ''}`} onClick={() => setCatActiva(tab)}>
                {tab === 'todas' ? 'Todas' : tab === 'tradicionales' ? 'Tradicionales' : '★ Empoderamiento'}
              </button>
            ))}
          </div>

          {(catActiva === 'todas' || catActiva === 'tradicionales') && (
            <>
              {catActiva === 'todas' && (
                <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(45,19,44,0.4)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>Tradicionales</p>
              )}
              <div className="cats-grid">
                {CATEGORIAS_TRADICIONALES.map(cat => <CatCard key={cat.id} cat={cat} esEmpod={false} />)}
              </div>
            </>
          )}

          {(catActiva === 'todas' || catActiva === 'empoderamiento') && (
            <>
              {catActiva === 'todas' && (
                <p style={{ textAlign: 'center', fontSize: '10px', color: '#b07d45', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', marginTop: '8px', fontWeight: '700' }}>★ Empoderamiento</p>
              )}
              <div className="cats-grid">
                {CATEGORIAS_EMPODERAMIENTO.map(cat => <CatCard key={cat.id} cat={cat} esEmpod={true} />)}
              </div>
            </>
          )}
        </section>

        {/* Profesionales */}
        <section id="profesionales" style={{ padding: isMobile ? '52px 20px 72px' : '72px 48px' }}>
          <p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C72C41', marginBottom: '12px', fontWeight: '700' }}>Comunidad</p>
          <h2 className="seccion-titulo" style={{ fontSize: isMobile ? '28px' : '38px' }}>Profesionales destacadas</h2>
          <div className="seccion-linea" />
          <p className="seccion-subtitulo">Verificadas y valoradas por la comunidad Hana</p>

          <div className="buscador-box">
            <div className="buscador-campo">
              <label className="buscador-label">Categoría</label>
              <select className="buscador-select" value={busquedaCategoria} onChange={e => setBusquedaCategoria(e.target.value)}>
                <option value="">Todas las categorías</option>
                {NOMBRES_CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="buscador-campo">
              <label className="buscador-label">Región</label>
              <select className="buscador-select" value={busquedaRegion} onChange={e => setBusquedaRegion(e.target.value)}>
                <option value="">Todas las regiones</option>
                {regiones.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button className="buscador-btn" onClick={handleBuscar} disabled={buscando}>
              {buscando ? '⟳ Buscando…' : '🔍 Buscar'}
            </button>
            {(busquedaCategoria || busquedaRegion) && (
              <button className="buscador-clear" onClick={handleLimpiarBusqueda}>Limpiar</button>
            )}
          </div>

          {(busquedaCategoria || busquedaRegion) && !buscando && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#b07d45', marginBottom: '20px', fontWeight: '600' }}>
              {trabajadoras.length === 0 ? 'Sin resultados para estos filtros.' : `${trabajadoras.length} profesional${trabajadoras.length !== 1 ? 'es' : ''} encontrada${trabajadoras.length !== 1 ? 's' : ''}`}
              {busquedaCategoria ? ` · ${busquedaCategoria}` : ''}
              {busquedaRegion ? ` · ${busquedaRegion}` : ''}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', maxWidth: '960px', margin: '0 auto' }}>
            {trabajadoras.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(45,19,44,0.4)', gridColumn: '1/-1', fontSize: '14px' }}>
                {buscando ? 'Buscando profesionales…' : 'Aún no hay profesionales registradas. ¡Sé la primera en ofrecer tus servicios!'}
              </p>
            ) : (
              trabajadorasVisibles.map((w, idx) => {
                const nombre = `${w.usuario?.nombre || ''} ${w.usuario?.apellido || ''}`.trim()
                const iniciales = `${w.usuario?.nombre?.charAt(0) || ''}${w.usuario?.apellido?.charAt(0) || ''}` || 'H'
                const region = w.usuario?.region || ''
                const color = coloresAvatar[idx % coloresAvatar.length]
                return (
                  <Link key={w._id} to={`/worker/${w._id}`} className="worker-card">
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                      {w.usuario?.foto
                        ? <img src={w.usuario.foto} alt={nombre} className="worker-avatar" style={{ objectFit: 'cover' }} />
                        : <div className="worker-avatar" style={{ background: color }}>{iniciales}</div>
                      }
                      <div style={{ minWidth: 0 }}>
                        <div className="worker-nombre">{nombre || 'Profesional Hana'}</div>
                        <div className="worker-cat">{w.categoria}{region ? ` · ${region}` : ''}</div>
                      </div>
                    </div>
                    <div className="worker-stars">★★★★★</div>
                    <div className="worker-desc">{w.descripcion || 'Profesional verificada en Hana.'}</div>
                    <div className="worker-footer">
                      <div className="worker-dispo">
                        <span className="worker-dispo-dot" style={{ backgroundColor: w.disponible ? '#3a9a6a' : '#C72C41' }} />
                        {w.disponible ? 'Disponible' : 'No disponible'}
                      </div>
                      <span className="worker-ver">Ver perfil →</span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {trabajadoras.length > 3 && !mostrarTodas && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button onClick={() => setMostrarTodas(true)} className="btn-outline-gold">Ver todas las profesionales →</button>
            </div>
          )}
        </section>

        <Footer />
      </div>

      {/* Modal subcategorías — fuera del scroll, fixed */}
      <ModalSubcategorias />
    </>
  )
}
