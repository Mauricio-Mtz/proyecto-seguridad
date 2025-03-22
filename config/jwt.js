const jwt = require('jsonwebtoken')
const failedAttempts = {}

// Esto debería estar en variables de entorno
const JWT_SECRET = 'tu_clave_secreta_muy_segura'
const JWT_EXPIRES_IN = '24h'

class JWT {
  // Función para generar un token JWT
  static generateToken(userData) {
    return jwt.sign(
      {
        userId: userData._id.toString(),
        username: userData.username,
        role: userData.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  // Función para verificar un token JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  // Las funciones de manejo de intentos fallidos pueden permanecer igual
  static registerFailedAttempt(username) {
    if (!failedAttempts[username]) {
      failedAttempts[username] = { count: 0, timestamp: null }
    }

    failedAttempts[username].count += 1
    failedAttempts[username].timestamp = new Date()

    return failedAttempts[username].count
  }

  // Función para verificar intentos fallidos
  static checkFailedAttempts(username) {
    if (!failedAttempts[username]) {
      return { count: 0, isLocked: false, remainingTime: 0 }
    }

    const attempts = failedAttempts[username]
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // Verificar si el bloqueo expiró
    if (attempts.count >= 3 && attempts.timestamp < fiveMinutesAgo) {
      attempts.count = 0
      return { count: 0, isLocked: false, remainingTime: 0 }
    }

    // Calcular tiempo restante en segundos
    const remainingTime =
      attempts.count >= 3 ? this.calculateRemainingTime(attempts.timestamp) : 0

    return {
      count: attempts.count,
      isLocked: attempts.count >= 3,
      remainingTime: remainingTime,
    }
  }

  // Calcular tiempo restante de bloqueo en segundos
  static calculateRemainingTime(timestamp) {
    const now = new Date()
    const unlockTime = new Date(timestamp.getTime() + 5 * 60 * 1000)
    const remainingMs = unlockTime - now
    return Math.max(0, Math.floor(remainingMs / 1000))
  }

  // Función para resetear intentos fallidos
  static resetFailedAttempts(username) {
    if (failedAttempts[username]) {
      failedAttempts[username].count = 0
    }
  }
}

module.exports = JWT
