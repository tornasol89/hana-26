import { Link } from 'react-router-dom'

const css = `
  .footer-root {
    background: #2D132C;
    border-top: none;
    font-family: 'Montserrat', sans-serif;
    color: white;
  }
  .footer-top-bar {
    height: 3px;
    background: #C72C41;
  }
  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 64px 40px 40px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
  }
  @media (max-width: 900px) {
    .footer-inner { grid-template-columns: 1fr 1fr; gap: 36px; padding: 48px 24px 32px; }
  }
  @media (max-width: 560px) {
    .footer-inner { grid-template-columns: 1fr; gap: 28px; padding: 40px 24px 28px; }
  }
  .footer-brand-logo {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 18px; text-decoration: none;
  }
  .footer-brand-circle {
    width: 44px; height: 44px; border-radius: 50%;
    background: transparent;
    border: 2px solid rgba(212,163,115,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .footer-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900; color: #F4EEED;
    letter-spacing: 2px; line-height: 1; display: block;
  }
  .footer-brand-tagline {
    font-size: 9px; color: #C72C41;
    letter-spacing: 1.5px; text-transform: uppercase;
    font-weight: 700; display: block; margin-top: 4px;
  }
  .footer-brand-desc {
    font-size: 13px; color: rgba(244,238,237,0.45);
    line-height: 1.8; margin-bottom: 24px; max-width: 280px;
  }
  .footer-trust { display: flex; flex-direction: column; gap: 9px; }
  .footer-trust-item {
    display: flex; align-items: center; gap: 9px;
    font-size: 12px; color: rgba(244,238,237,0.4);
  }
  .footer-trust-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #C72C41; flex-shrink: 0;
  }
  .footer-col-titulo {
    font-size: 9px; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: rgba(244,238,237,0.3);
    margin-bottom: 20px;
  }
  .footer-links { display: flex; flex-direction: column; gap: 13px; }
  .footer-link {
    font-size: 13px; color: rgba(244,238,237,0.55);
    text-decoration: none; transition: color 0.2s;
    display: flex; align-items: center; gap: 7px;
    font-weight: 500;
  }
  .footer-link:hover { color: #D4A373; }
  .footer-link-badge {
    font-size: 9px; background: rgba(199,44,65,0.3);
    color: #f07080; padding: 1px 6px; border-radius: 4px;
    font-weight: 700; letter-spacing: 0.5px;
  }
  .footer-divider {
    border: none; border-top: 1px solid rgba(244,238,237,0.07);
    margin: 0 40px;
  }
  @media (max-width: 560px) { .footer-divider { margin: 0 24px; } }
  .footer-bottom {
    padding: 22px 40px;
    display: flex; align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
    max-width: 1100px; margin: 0 auto;
  }
  @media (max-width: 560px) {
    .footer-bottom { padding: 18px 24px; flex-direction: column; text-align: center; }
  }
  .footer-copy { font-size: 12px; color: rgba(244,238,237,0.22); margin: 0; }
  .footer-copy span { color: rgba(199,44,65,0.6); }
  .footer-legal { display: flex; gap: 20px; flex-wrap: wrap; }
  .footer-legal-link {
    font-size: 12px; color: rgba(244,238,237,0.25);
    text-decoration: none; transition: color 0.2s;
    letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;
  }
  .footer-legal-link:hover { color: rgba(244,238,237,0.6); }
`

export default function Footer() {
  return (
    <>
      <style>{css}</style>
      <footer className="footer-root">
        <div className="footer-top-bar" />

        <div className="footer-inner">

          {/* Marca */}
          <div>
            <Link to="/" className="footer-brand-logo">
              <div className="footer-brand-circle">🌸</div>
              <div>
                <span className="footer-brand-name">HANA</span>
                <span className="footer-brand-tagline">Hecho por mujeres, para mujeres</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Plataforma donde mujeres se conectan con profesionales verificadas.
              Confianza, seguridad y comunidad en un solo lugar.
            </p>
            <div className="footer-trust">
              <div className="footer-trust-item">
                <span className="footer-trust-dot" />
                Profesionales 100% verificadas
              </div>
              <div className="footer-trust-item">
                <span className="footer-trust-dot" style={{ background: '#e8b86d' }} />
                Comunidad exclusiva de mujeres
              </div>
              <div className="footer-trust-item">
                <span className="footer-trust-dot" style={{ background: '#5DCAA5' }} />
                Evaluaciones reales de la comunidad
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <p className="footer-col-titulo">Explorar</p>
            <div className="footer-links">
              <Link to="/#categorias" className="footer-link">Categorías</Link>
              <Link to="/#profesionales" className="footer-link">Profesionales</Link>
              <Link to="/#como-funciona" className="footer-link">Cómo funciona</Link>
              <Link to="/impacto" className="footer-link">Por qué Hana</Link>
            </div>
          </div>

          {/* Únete */}
          <div>
            <p className="footer-col-titulo">Únete</p>
            <div className="footer-links">
              <Link to="/compromiso?destino=clienta" className="footer-link">Soy clienta</Link>
              <Link to="/compromiso?destino=trabajadora" className="footer-link">
                Soy profesional
                <span className="footer-link-badge">Nuevo</span>
              </Link>
              <Link to="/login" className="footer-link">Iniciar sesión</Link>
              <Link to="/compromiso" className="footer-link">Compromiso Hana</Link>
            </div>
          </div>

          {/* Cifras */}
          <div>
            <p className="footer-col-titulo">Comunidad</p>
            <div className="footer-links">
              <span className="footer-link" style={{ cursor: 'default', pointerEvents: 'none' }}>2.400+ profesionales</span>
              <span className="footer-link" style={{ cursor: 'default', pointerEvents: 'none' }}>17 categorías</span>
              <span className="footer-link" style={{ cursor: 'default', pointerEvents: 'none' }}>4.9★ valoración media</span>
              <Link to="/impacto" className="footer-link">Nuestro impacto →</Link>
            </div>
          </div>

        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">© 2025 <span>Hana</span> · Conectando mujeres, construyendo confianza</p>
          <div className="footer-legal">
            <Link to="/compromiso" className="footer-legal-link">Compromiso</Link>
            <Link to="/impacto" className="footer-legal-link">Impacto</Link>
          </div>
        </div>

      </footer>
    </>
  )
}
