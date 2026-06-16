import express from 'express'
import User from '../models/User.js'
import protegerRuta from '../middleware/auth.js'
import { enviarVerificacion } from '../services/email/index.js'
import { generarTokenVerificacion } from '../utils/tokens.js'

const router = express.Router()

// GET /api/email-verification/verify?token=...
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ mensaje: 'Falta el token' })

    const usuario = await User.findOne({
      tokenVerificacion: token,
      tokenVerificacionExpira: { $gt: new Date() },
    })

    if (!usuario) {
      return res.status(400).json({
        mensaje: 'Link inválido o expirado. Pedí uno nuevo desde tu perfil.',
      })
    }

    usuario.emailVerificado = true
    usuario.tokenVerificacion = null
    usuario.tokenVerificacionExpira = null
    await usuario.save()

    res.json({ mensaje: 'Email verificado correctamente', email: usuario.email })
  } catch (error) {
    console.error('Error en verify:', error)
    res.status(500).json({ mensaje: 'Error al verificar email' })
  }
})

// POST /api/email-verification/resend (protegido)
router.post('/resend', protegerRuta, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id)
    if (!usuario) return res.status(404).json({ mensaje: 'Usuaria no encontrada' })

    if (usuario.emailVerificado) {
      return res.status(400).json({ mensaje: 'Tu email ya está verificado' })
    }

    const { token, expira } = generarTokenVerificacion()
    usuario.tokenVerificacion = token
    usuario.tokenVerificacionExpira = expira
    await usuario.save()

    const resultado = await enviarVerificacion({
      email: usuario.email,
      nombre: usuario.nombre,
      token,
    })

    if (!resultado.ok) {
      return res.status(500).json({ mensaje: 'No se pudo enviar el email, intentá de nuevo' })
    }

    res.json({ mensaje: 'Email reenviado' })
  } catch (error) {
    console.error('Error en resend:', error)
    res.status(500).json({ mensaje: 'Error al reenviar email' })
  }
}) 

// POST /api/email-verification/resend-public
// Endpoint público (NO requiere JWT) para reenviar verificación desde el login.
// Responde igual exista o no la cuenta, para evitar enumeración de emails.
router.post('/resend-public', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ mensaje: 'Falta el email' })

    // Respuesta genérica: nunca revelamos si la cuenta existe o no
    const respuestaGenerica = {
      mensaje: 'Si la cuenta existe y no está verificada, te enviamos un nuevo link.',
    }

    const usuario = await User.findOne({ email: email.toLowerCase().trim() })

    if (!usuario || usuario.emailVerificado) {
      return res.json(respuestaGenerica)
    }

    const { token, expira } = generarTokenVerificacion()
    usuario.tokenVerificacion = token
    usuario.tokenVerificacionExpira = expira
    await usuario.save()

    await enviarVerificacion({
      email: usuario.email,
      nombre: usuario.nombre,
      token,
    })

    res.json(respuestaGenerica)
  } catch (error) {
    console.error('Error en resend-public:', error)
    res.status(500).json({ mensaje: 'Error al reenviar email' })
  }
})

export default router