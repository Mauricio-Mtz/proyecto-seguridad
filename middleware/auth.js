const JWT = require('../config/jwt')

class Auth {
  // Middleware para verificar autenticación con JWT
  static isAuthenticated(req, res, next) {
    // Obtener el token del encabezado de autorización o de las cookies
    const authHeader = req.headers.authorization
    const token = authHeader ? authHeader.split(' ')[1] : req.cookies.token

    if (!token) {
      return res.redirect('/?error=auth')
    }

    // Verificar el token
    const decoded = JWT.verifyToken(token)
    if (!decoded) {
      return res.redirect('/?error=auth')
    }

    // Establecer los datos del usuario en la solicitud
    req.user = decoded
    next()
  }

  // Middleware para verificar si es administrador
  static async isAdmin(req, res, next) {
    if (!req.user) {
      return res.redirect('/?error=auth')
    }

    if (req.user.role === 'admin') {
      return next()
    }

    return res.redirect('/?error=auth')
  }
}

module.exports = Auth
