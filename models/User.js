const Database = require('../config/database')
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')

class User {
  // Función para crear un usuario
  static async createUser(userData) {
    const db = Database.getInstance().getDb()
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = {
      username: userData.username,
      email: userData.email || null,
      password: hashedPassword,
      role: userData.role || 'usuario',
      verified: userData.verified !== undefined ? userData.verified : true,
      createdAt: new Date(),
      createdBy: userData.createdBy || 'system',
    }

    // Solo agregar tokens de verificación si el usuario no está verificado
    if (!user.verified) {
      user.verificationToken = userData.verificationToken
      user.verificationExpires = userData.verificationExpires
    }

    return db.collection('users').insertOne(user)
  }

  // Función para buscar un usuario por nombre de usuario
  static async findUserByUsername(username) {
    const db = Database.getInstance().getDb()
    return db.collection('users').findOne({ username })
  }

  // Función para buscar un usuario por correo electrónico
  static async findUserByEmail(email) {
    const db = Database.getInstance().getDb()
    return db.collection('users').findOne({ email })
  }

  // Función para buscar un usuario por token de verificación
  static async findUserByVerificationToken(token) {
    const db = Database.getInstance().getDb()
    return db.collection('users').findOne({ verificationToken: token })
  }

  // Función para verificar la cuenta de un usuario
  static async verifyUser(userId) {
    const db = Database.getInstance().getDb()
    return db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { verified: true },
        $unset: { verificationToken: '', verificationExpires: '' },
      }
    )
  }

  // Función para buscar un usuario por ID
  static async findUserById(userId) {
    const db = Database.getInstance().getDb()
    return db.collection('users').findOne({ _id: new ObjectId(userId) })
  }

  // Función para actualizar la contraseña de un usuario
  static async updateUserPassword(username, newPassword) {
    const db = Database.getInstance().getDb()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    return db
      .collection('users')
      .updateOne({ username }, { $set: { password: hashedPassword } })
  }

  // Función para verificar la contraseña de un usuario
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  // Función para configurar usuarios iniciales
  static async setupInitialUsers() {
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'user123',
        role: 'usuario',
      },
      {
        username: 'invitado',
        email: 'invitado@example.com',
        password: 'guest123',
        role: 'invitado',
      },
    ]

    for (const user of defaultUsers) {
      const existingUser = await User.findUserByUsername(user.username)
      if (!existingUser) {
        // Los usuarios iniciales siempre están verificados
        await User.createUser({
          ...user,
          verified: true,
        })
        console.log(`Usuario ${user.username} creado`)
      }
    }
  }

  // Función para obtener todos los usuarios
  static async findAllUsers() {
    const db = Database.getInstance().getDb()
    return db.collection('users').find({}).toArray()
  }
}

module.exports = User
