import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const css = `
  * { box-sizing: border-box; }

  .login-page {
    background: #F4EEED;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Montserrat', sans-serif;
    color: #4A4A4A;
  }

  .login-bg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background: white;
    border: 1px solid rgba(45,19,44,0.10);
    border-radius: 10px;
    padding: 44px 40px 40px;
    box-shadow: 0 8px 40px rgba(45,19,44,0.10);
    animation: cardIn 0.35s ease;
  }
  @media (max-width: 480px) { .login-card { padding: 36px 24px 32px; } }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .login-header { text-align: center; margin-bottom: 32px; }
  .login-logo {
    width: 64px; height: 64px; border-radius: 50%;
    background: #2D132C;
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; margin: 0 auto 18px;
    box-shadow: 0 0 0 4px rgba(212,163,115,0.25);
  }
  .login-titulo {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 900; color: #2D132C;
    margin: 0 0 8px; line-height: 1.1; letter-spacing: -1px;
  }
  .login-subtitulo { font-size: 13px; color: rgba(45,19,44,0.45); margin: 0; }

  /* Error */
  .login-error {
    background: rgba(199,44,65,0.07);
    border: 1px solid rgba(199,44,65,0.25);
    border-radius: 6px; padding: 11px 14px;
    margin-bottom: 20px; font-size: 13px; color: #C72C41;
    display: flex; align-items: center; gap: 8px;
  }

  /* Campos */
  .login-form { display: flex; flex-direction: column; gap: 18px; }
  .login-campo { display: flex; flex-direction: column; gap: 7px; }
  .login-label { font-size: 10px; color: rgba(45,19,44,0.5); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .login-input-wrap { position: relative; }
  .login-input {
    width: 100%; padding: 12px 16px;
    border-radius: 6px;
    background: #F4EEED;
    border: 1.5px solid rgba(45,19,44,0.12);
    color: #2D132C; font-size: 14px;
    outline: none; font-family: 'Montserrat', sans-serif;
    transition: border-color 0.2s;
  }
  .login-input:focus { border-color: #C72C41; }
  .login-input::placeholder { color: rgba(45,19,44,0.25); }
  .login-input-pass { padding-right: 48px; }
  .login-eye {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%);
    background: transparent; border: none;
    cursor: pointer; font-size: 16px; padding: 4px;
    line-height: 1; opacity: 0.4; transition: opacity 0.2s;
  }
  .login-eye:hover { opacity: 0.8; }

  /* Olvidé contraseña */
  .login-forgot {
    text-align: right; margin-top: -6px;
    font-size: 11px; color: rgba(45,19,44,0.35);
  }

  /* Botón */
  .login-btn {
    width: 100%; padding: 13px;
    background: #C72C41;
    color: white; border: none; border-radius: 6px;
    font-size: 12px; font-weight: 700;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer; transition: background 0.2s, transform 0.2s;
    margin-top: 4px;
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .login-btn:hover:not(:disabled) {
    background: #a01f30;
    transform: translateY(-1px);
  }
  .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Separador */
  .login-sep {
    display: flex; align-items: center; gap: 12px;
    margin: 4px 0;
  }
  .login-sep-line { flex: 1; height: 1px; background: rgba(45,19,44,0.08); }
  .login-sep-txt { font-size: 10px; color: rgba(45,19,44,0.3); white-space: nowrap; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }

  /* Registro */
  .login-reg { display: flex; flex-direction: column; gap: 9px; }
  .login-reg-clienta {
    display: block; text-align: center; padding: 12px;
    border-radius: 6px;
    border: 1.5px solid rgba(45,19,44,0.12);
    color: rgba(45,19,44,0.6);
    text-decoration: none; font-size: 12px; font-weight: 700;
    transition: all 0.18s; background: #F4EEED;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .login-reg-clienta:hover {
    border-color: #C72C41;
    background: rgba(199,44,65,0.05);
    color: #C72C41;
  }
  .login-reg-trab {
    display: block; text-align: center; padding: 12px;
    border-radius: 6px;
    border: 1.5px solid rgba(212,163,115,0.35);
    color: #b07d45;
    text-decoration: none; font-size: 12px; font-weight: 700;
    transition: all 0.18s; background: rgba(212,163,115,0.06);
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .login-reg-trab:hover {
    border-color: #D4A373;
    background: rgba(212,163,115,0.12);
    color: #8a5e28;
  }

  /* Footer inline */
  .login-footer {
    text-align: center; padding: 18px 24px;
    background: #2D132C;
    font-size: 12px; color: rgba(244,238,237,0.3);
  }
  .login-footer span { color: rgba(199,44,65,0.6); }
`

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [verPass, setVerPass]   = useState(false)
  const [error, setError]       = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleKey    = e => { if (e.key === 'Enter') handleSubmit() }

  async function handleSubmit() {
    setError('')
    if (!form.email || !form.password) return setError('Ingresa tu email y contraseña.')
    try {
      setCargando(true)
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
      const tipo = res.data.usuario?.tipo
      if (tipo === 'trabajadora') navigate('/perfil/trabajadora')
      else if (tipo === 'admin')  navigate('/perfil/admin')
      else                        navigate('/perfil/clienta')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Email o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-page">
        <Navbar />

        <div className="login-bg">
          <div className="login-card">

            <div className="login-header">
              <div className="login-logo">🌸</div>
              <h1 className="login-titulo">Bienvenida de vuelta</h1>
              <p className="login-subtitulo">Ingresa a tu cuenta Hana</p>
            </div>

            {error && (
              <div className="login-error">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="login-form">

              <div className="login-campo">
                <label className="login-label">Correo electrónico</label>
                <input
                  name="email" type="email"
                  placeholder="tu@correo.cl"
                  value={form.email}
                  onChange={handleChange}
                  onKeyDown={handleKey}
                  className="login-input"
                  autoComplete="email"
                />
              </div>

              <div className="login-campo">
                <label className="login-label">Contraseña</label>
                <div className="login-input-wrap">
                  <input
                    name="password"
                    type={verPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    onKeyDown={handleKey}
                    className="login-input login-input-pass"
                    autoComplete="current-password"
                  />
                  <button type="button" className="login-eye" onClick={() => setVerPass(v => !v)} tabIndex={-1}>
                    {verPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="login-forgot">
                ¿Olvidaste tu contraseña? <span style={{ color: '#e8b86d' }}>(Próximamente)</span>
              </div>

              <button onClick={handleSubmit} disabled={cargando} className="login-btn">
                {cargando ? 'Ingresando…' : 'Ingresar'}
              </button>

              <div className="login-sep">
                <div className="login-sep-line" />
                <span className="login-sep-txt">¿primera vez?</span>
                <div className="login-sep-line" />
              </div>

              <div className="login-reg">
                <Link to="/compromiso?destino=clienta" className="login-reg-clienta">
                  👩 Registrarme como clienta
                </Link>
                <Link to="/compromiso?destino=trabajadora" className="login-reg-trab">
                  💼 Ofrecer mis servicios
                </Link>
              </div>

            </div>
          </div>
        </div>

        <div className="login-footer">
          © 2025 <span>Hana</span> · Conectando mujeres, construyendo confianza
        </div>
      </div>
    </>
  )
}
