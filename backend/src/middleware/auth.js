import jwt from 'jsonwebtoken'

const protegerRuta = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado, token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' })
  }
}

export default protegerRuta