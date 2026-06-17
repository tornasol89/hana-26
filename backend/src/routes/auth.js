import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import upload, { uploadDocumento } from '../config/cloudinary.js'
import protegerRuta from '../middleware/auth.js'
import { validarFechaNacimiento, calcularEdad } from '../utils/validators.js'

const router = express.Router()

// Helper: formato de usuario para devolver al frontend (sin password)
function formatearUsuario(u) {
  return {
    id:       u._id,
    nombre:   u.nombre,
    apellido: u.apellido,
    email:    u.email,
    tipo:     u.tipo,
    foto:     u.foto || null,
    region:   u.region  || '',
    comuna:   u.comuna  || '',
    rut:      u.rut     || '',
    fechaNacimiento:          u.fechaNacimiento,
    fechaNacimientoCorregida: u.fechaNacimientoCorregida,
    edad:                     u.fechaNacimiento ? calcularEdad(u.fechaNacimiento) : null,
    verificada:               u.verificada,
    estadoVerificacion:       u.estadoVerificacion,
    aceptoCompromiso:         u.aceptoCompromiso,
    carnetFrenteUrl:          u.carnetFrenteUrl || null,
    carnetDorsoUrl:           u.carnetDorsoUrl  || null,
  }
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra una nueva usuaria y devuelve un JWT
 *     description: >
 *       Crea la cuenta, hashea la contraseña y aplica los setters del modelo
 *       (capitalización de nombre y normalización de RUT). Requiere aceptar el
 *       Compromiso Hana y una fecha de nacimiento válida (edad mínima 18).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, email, password, tipo, rut, fechaNacimiento, aceptoCompromiso]
 *             properties:
 *               nombre:           { type: string, example: 'Ana' }
 *               apellido:         { type: string, example: 'Pérez' }
 *               email:            { type: string, format: email }
 *               password:         { type: string, format: password, minLength: 6 }
 *               tipo:             { type: string, enum: [clienta, trabajadora] }
 *               region:           { type: string, example: 'Región Metropolitana' }
 *               comuna:           { type: string, example: 'Providencia' }
 *               rut:              { type: string, example: '12.345.678-9' }
 *               fechaNacimiento:  { type: string, format: date, example: '1995-04-23' }
 *               aceptoCompromiso: { type: boolean, example: true }
 *               fechaAceptacion:  { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Usuaria creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:   { type: string }
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: Validación fallida (email duplicado, RUT inválido, edad < 18, compromiso no aceptado)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/register', async (req, res) => {
  try {
    const {
      nombre, apellido, email, password, tipo,
      region, comuna, rut,
      fechaNacimiento,
      aceptoCompromiso, fechaAceptacion,
    } = req.body

    // 1. Compromiso obligatorio
    if (!aceptoCompromiso) {
      return res.status(400).json({ mensaje: 'Debes aceptar el Compromiso Hana' })
    }

    // 2. Email único
    const usuarioExiste = await User.findOne({ email })
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' })
    }

    // 3. Validar fecha de nacimiento (incluye edad mínima 18)
    const resFecha = validarFechaNacimiento(fechaNacimiento)
    if (!resFecha.valida) {
      return res.status(400).json({ mensaje: resFecha.mensaje })
    }

    // 4. Hashear password
    const salt = await bcrypt.genSalt(10)
    const passwordEncriptada = await bcrypt.hash(password, salt)

    // 5. Crear usuario (los setters del modelo aplican capitalización y normalización de RUT)
    //    Si el RUT es inválido, falla aquí con error de validación de Mongoose
    const usuario = await User.create({
      nombre, apellido, email,
      password: passwordEncriptada,
      tipo, region, comuna, rut,
      fechaNacimiento: new Date(fechaNacimiento),
      fechaNacimientoCorregida: true, // registros nuevos siempre tienen fecha real
      aceptoCompromiso: true,
      fechaAceptacion:  fechaAceptacion ? new Date(fechaAceptacion) : new Date(),
      foto: '',
    })

    // 6. Generar JWT
    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(201).json({ token, usuario: formatearUsuario(usuario) })
  } catch (error) {
    console.error('Error en register:', error)

    // Errores de validación de Mongoose (RUT inválido, etc.)
    if (error.name === 'ValidationError') {
      const primerError = Object.values(error.errors)[0]
      return res.status(400).json({ mensaje: primerError.message })
    }

    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message })
  }
})

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Inicia sesión y devuelve un JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:   { type: string }
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: Email o contraseña incorrectos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const usuario = await User.findOne({ email })
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' })
    }

    if (usuario.activa === false) {
      return res.status(403).json({ mensaje: 'Esta cuenta ha sido desactivada. Contacta a soporte.' })
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password)
    if (!passwordCorrecta) {
      return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' })
    }

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({ token, usuario: formatearUsuario(usuario) })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message })
  }
})

/**
 * @openapi
 * /api/auth/me:
 *   put:
 *     tags: [Auth]
 *     summary: Actualiza los datos del usuario autenticado
 *     description: >
 *       Permite editar nombre, apellido, región y comuna. Si se envía
 *       fechaNacimiento, se valida (edad mínima 18) y se marca como corregida.
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: Datos inválidos (p. ej. fecha de nacimiento)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/me', protegerRuta, async (req, res) => {
  try {
    const { nombre, apellido, region, comuna, fechaNacimiento } = req.body

    // Si la usuaria está enviando fechaNacimiento, validamos antes
    const actualizacion = { nombre, apellido, region, comuna }
    if (fechaNacimiento !== undefined) {
      const resFecha = validarFechaNacimiento(fechaNacimiento)
      if (!resFecha.valida) {
        return res.status(400).json({ mensaje: resFecha.mensaje })
      }
      actualizacion.fechaNacimiento = new Date(fechaNacimiento)
      // Al editar la fecha, marcamos como "corregida" → el banner desaparece
      actualizacion.fechaNacimientoCorregida = true
    }

    const usuario = await User.findByIdAndUpdate(
      req.usuario.id,
      actualizacion,
      { new: true, runValidators: true } // runValidators: para que se apliquen los validators del schema
    ).select('-password')

    res.json(formatearUsuario(usuario))
  } catch (error) {
    console.error('Error al actualizar perfil:', error)

    if (error.name === 'ValidationError') {
      const primerError = Object.values(error.errors)[0]
      return res.status(400).json({ mensaje: primerError.message })
    }

    res.status(500).json({ mensaje: 'Error al actualizar perfil' })
  }
})

/**
 * @openapi
 * /api/auth/upload-photo:
 *   post:
 *     tags: [Auth]
 *     summary: Sube la foto de perfil del usuario autenticado
 *     description: La imagen se almacena en Cloudinary; se guarda la URL pública en el documento.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Foto actualizada' }
 *                 foto:    { type: string, format: uri }
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: No se seleccionó ninguna imagen
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/upload-photo', protegerRuta, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se seleccionó ninguna imagen' })
    }

    const usuario = await User.findByIdAndUpdate(
      req.usuario.id,
      { foto: req.file.path },
      { new: true }
    ).select('-password')

    res.json({ mensaje: 'Foto actualizada', foto: usuario.foto, usuario: formatearUsuario(usuario) })
  } catch (error) {
    console.error('Error al subir foto:', error)
    res.status(500).json({ mensaje: 'Error al procesar la imagen', error: error.message })
  }
})

/**
 * @openapi
 * /api/auth/upload-carnet:
 *   post:
 *     tags: [Auth]
 *     summary: Sube el frente o dorso de la cédula de identidad
 *     description: >
 *       Almacena el documento en Cloudinary y pone estadoVerificacion en "enviado".
 *       El lado se indica por query param.
 *     parameters:
 *       - in: query
 *         name: lado
 *         required: true
 *         schema:
 *           type: string
 *           enum: [frente, dorso]
 *         description: Cara del documento que se está subiendo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documento subido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje: { type: string, example: 'Documento subido' }
 *                 url:     { type: string, format: uri }
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: Falta imagen o el parámetro lado es inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/upload-carnet', protegerRuta, uploadDocumento.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se seleccionó ninguna imagen' })
    }
    const lado = req.query.lado
    if (!['frente', 'dorso'].includes(lado)) {
      return res.status(400).json({ mensaje: 'Parámetro lado debe ser "frente" o "dorso"' })
    }

    const campo = lado === 'frente' ? 'carnetFrenteUrl' : 'carnetDorsoUrl'

    const usuario = await User.findByIdAndUpdate(
      req.usuario.id,
      { [campo]: req.file.path, estadoVerificacion: 'enviado' },
      { new: true }
    ).select('-password')

    res.json({ mensaje: 'Documento subido', url: req.file.path, usuario: formatearUsuario(usuario) })
  } catch (error) {
    console.error('Error al subir carnet:', error)
    res.status(500).json({ mensaje: 'Error al procesar el documento', error: error.message })
  }
})

/**
 * @openapi
 * /api/auth/clienta/{id}:
 *   get:
 *     tags: [Auth]
 *     summary: Perfil público seguro de una clienta
 *     description: >
 *       Devuelve datos limitados de una clienta. Solo accesible para usuarios
 *       de tipo trabajadora o admin.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de la clienta
 *     responses:
 *       200:
 *         description: Perfil de la clienta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:                { type: string }
 *                 nombre:             { type: string }
 *                 apellido:           { type: string }
 *                 foto:               { type: string, nullable: true }
 *                 region:             { type: string }
 *                 comuna:             { type: string }
 *                 verificada:         { type: boolean }
 *                 estadoVerificacion: { type: string }
 *                 createdAt:          { type: string, format: date-time }
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Sin permiso para ver este perfil
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Clienta no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/clienta/:id', protegerRuta, async (req, res) => {
  try {
    const clienta = await User.findOne({ _id: req.params.id, tipo: 'clienta' })
      .select('nombre apellido foto region comuna verificada estadoVerificacion createdAt')

    if (!clienta) return res.status(404).json({ mensaje: 'Clienta no encontrada' })

    if (!['trabajadora', 'admin'].includes(req.usuario.tipo)) {
      return res.status(403).json({ mensaje: 'Sin permiso para ver este perfil' })
    }

    res.json(clienta)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message })
  }
})

export default router