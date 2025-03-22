const path = require('path')
const User = require('../models/User')

class AdminController {
  // Controlador para mostrar la página de administrador
  static showAdminPage(req, res) {
    res.sendFile(path.join(__dirname, '../views/admin.html'))
  }

  // Controlador para registrar un nuevo usuario
  static async registerUser(req, res) {
    const { username, email, password, role, verified } = req.body

    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findUserByUsername(username)

      if (existingUser) {
        return res.status(400).send('El nombre de usuario ya existe')
      }

      // Verificar si el email ya existe (solo si se proporcionó un email)
      if (email) {
        const existingEmail = await User.findUserByEmail(email)
        if (existingEmail) {
          return res
            .status(400)
            .send('El correo electrónico ya está registrado')
        }
      }

      // Determinar si el usuario estará verificado
      const isVerified =
        verified === 'on' || verified === true || verified === 'true'

      // Crear nuevo usuario
      await User.createUser({
        username,
        email,
        password,
        role,
        verified: isVerified,
        createdBy: req.user.username,
      })

      console.log(
        `${new Date().toISOString()} - Usuario registrado: ${username} con rol: ${role} por: ${
          req.user.username
        }`
      )
      return res.status(200).send('Usuario creado correctamente')
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      return res.status(500).send('Error interno del servidor')
    }
  }

  // Controlador para obtener todos los usuarios
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAllUsers()
      res.json(users)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      res.status(500).send('Error interno del servidor')
    }
  }
}

module.exports = AdminController
