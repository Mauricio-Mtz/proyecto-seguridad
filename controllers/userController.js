const path = require('path')
const User = require('../models/User')

class UserController {
  // Controlador para mostrar la página principal
  static showMainPage(req, res) {
    res.sendFile(path.join(__dirname, '../views/main.html'))
  }

  // Controlador para obtener información del usuario
  static async getUserInfo(req, res) {
    try {
      const user = await User.findUserById(req.user.userId)

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }

      // No enviar la contraseña al cliente
      const { password, ...userInfo } = user

      res.json({
        username: userInfo.username,
        role: userInfo.role,
      })
    } catch (error) {
      console.error('Error al obtener información del usuario:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.findAllUsers()

      // Eliminar las contraseñas de la respuesta
      const safeUsers = users.map((user) => {
        const { password, ...safeUser } = user
        return safeUser
      })

      res.json(safeUsers)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

module.exports = UserController
