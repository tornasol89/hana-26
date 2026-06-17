import express from 'express'
import User from '../models/User.js'
import protegerRuta from '../middleware/auth.js'
import { enviarVerificacion } from '../services/email/index.js'
import { generarTokenVerificacion } from '../utils/tokens.js'

const router = express.Router()

/**
 * @openapi
 * /api/email-verification/verify:
 *   get:
 *     tags: [EmailVerification]
 *     summary: Verifica el email mediante el token del link
 *     description: >
 *       Endpoint público. Busca un usuario con el token aún vigente, marca
 *       emailVerificado = true y limpia el token. El link caduca por expiración.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Token de verificación recibido por correo
 *     responses:
 *       200:
 *         description: Email verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Email verificado correctamente' }
 *                 email:   { type: string, format: email }
 *       400:
 *         description: Falta el token, o el link es inválido o está expirado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/email-verification/resend:
 *   post:
 *     tags: [EmailVerification]
 *     summary: Reenvía el correo de verificación a la usuaria logueada
 *     description: >
 *       Genera un nuevo token, lo guarda con su expiración y dispara el envío
 *       del correo. Falla si el email ya está verificado.
 *     responses:
 *       200:
 *         description: Email reenviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Email reenviado' }
 *       400:
 *         description: Tu email ya está verificado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuaria no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: No se pudo enviar el email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @openapi
 * /api/email-verification/resend-public:
 *   post:
 *     tags: [EmailVerification]
 *     summary: Reenvía la verificación desde el login (público)
 *     description: >
 *       Endpoint público (no requiere JWT). Responde siempre con el mismo mensaje
 *       genérico exista o no la cuenta, para evitar la enumeración de emails.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: >
 *           Respuesta genérica. No revela si la cuenta existe ni si fue enviado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: 'Si la cuenta existe y no está verificada, te enviamos un nuevo link.'
 *       400:
 *         description: Falta el email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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