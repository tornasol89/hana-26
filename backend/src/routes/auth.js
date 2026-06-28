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
    rolesAdicionales:         u.rolesAdicionales || [],
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Reemplazo del POST /api/auth/register en backend/src/routes/auth.js
// (los imports de arriba y el resto del archivo NO cambian — solo se
//  reemplaza el handler de register completo)
// ─────────────────────────────────────────────────────────────────────────

// POST /api/auth/register
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

    // 2. ✅ MODIFICADO: unicidad de email + rut centralizada en el modelo.
    //    Si en el futuro agregamos otro campo único (teléfono, etc.) se añade
    //    en User.verificarUnicidad y este código no cambia.
    const conflicto = await User.verificarUnicidad({ email, rut })
    if (conflicto) {
      return res.status(400).json({ mensaje: conflicto.mensaje })
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

    // ✅ NUEVO: error de índice único (race condition entre verificarUnicidad y create).
    //    Es defensa en profundidad: si dos requests llegan a la vez, una pasa el
    //    verificarUnicidad y choca contra el índice único de Mongo. Devolvemos
    //    el mismo mensaje que devolvería la verificación previa.
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0]
      if (campo === 'rut')   return res.status(400).json({ mensaje: 'El RUT ya está registrado' })
      if (campo === 'email') return res.status(400).json({ mensaje: 'El email ya está registrado' })
      return res.status(400).json({ mensaje: 'Ya existe una cuenta con esos datos' })
    }

    // Errores de validación de Mongoose (RUT inválido, fecha de nacimiento, etc.)
    if (error.name === 'ValidationError') {
      const primerError = Object.values(error.errors)[0]
      return res.status(400).json({ mensaje: primerError.message })
    }

    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message })
  }
})

// POST /api/auth/login
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

// PUT /api/auth/me — actualizar datos propios
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

// POST /api/auth/upload-photo — subir foto de perfil
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

// POST /api/auth/upload-carnet — subir frente o dorso de cédula
// Query param: ?lado=frente | ?lado=dorso
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

// POST /api/auth/agregar-rol — agrega un rol adicional a la usuaria autenticada
router.post('/agregar-rol', protegerRuta, async (req, res) => {
  try {
    const { rol } = req.body

    if (!['clienta', 'trabajadora'].includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol inválido' })
    }

    const usuario = await User.findById(req.usuario.id)
    if (!usuario) return res.status(404).json({ mensaje: 'Usuaria no encontrada' })

    if (usuario.tipo === rol || (usuario.rolesAdicionales || []).includes(rol)) {
      return res.status(400).json({ mensaje: `Ya tienes el rol ${rol}` })
    }

    usuario.rolesAdicionales = [...(usuario.rolesAdicionales || []), rol]
    await usuario.save()

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, usuario: formatearUsuario(usuario) })
  } catch (error) {
    console.error('Error al agregar rol:', error)
    res.status(500).json({ mensaje: 'Error al agregar rol' })
  }
})

// GET /api/auth/clienta/:id — perfil público seguro de una clienta
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