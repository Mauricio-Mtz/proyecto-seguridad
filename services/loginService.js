const fs = require('fs')

class loginService {
  // Función para registrar inicios de sesión
  static logLogin(username, success, role = 'N/A') {
    const status = success ? 'EXITOSO' : 'FALLIDO'
    // Estructura del log
    const logEntry = `${new Date().toISOString()} - Intento de inicio de sesión: ${status} - Usuario: ${username} - Rol: ${role}\n`

    if (success) {
      // Almacenamiento del log en el archivo login_log.txt
      fs.appendFile('login_log.txt', logEntry, (err) => {
        if (err) {
          console.error('Error al escribir en el log:', err)
        }
      })
    }

    // Imprimir en terminal
    console.log(logEntry)
  }

  // Método específico para registrar intentos bloqueados
  static logBlockedAttempt(username) {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp} - BLOQUEO DE CUENTA - Usuario: ${username} - Ha excedido el número máximo de intentos. Cuenta bloqueada por 5 minutos.\n`

    // Imprimir en la terminal (con formato destacado)
    console.log('\x1b[31m%s\x1b[0m', logMessage.trim()) // Texto en rojo

    // Guardar en archivo de log - usando el mismo archivo que logLogin para consistencia
    fs.appendFile('login_log.txt', logMessage, (err) => {
      if (err) {
        console.error('Error al escribir en el log:', err)
      }
    })
  }
}

module.exports = loginService
