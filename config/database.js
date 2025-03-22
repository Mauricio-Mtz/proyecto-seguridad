const { MongoClient } = require('mongodb')

class Database {
  constructor() {
    this.mongoUrl = process.env.MONGO_URL || 'mongodb+srv://2022371199:BTEU4sBy1MLTAXjm@task-manager.1z4y8.mongodb.net/?retryWrites=true&w=majority&appName=task-manager'
    this.dbName = process.env.DB_NAME || 'loginApp'
    this.client = new MongoClient(this.mongoUrl)
    this.db = null
  }

  // Método para conectar a la base de datos
  async connect() {
    try {
      await this.client.connect()
      console.log('Conectado a MongoDB')

      this.db = this.client.db(this.dbName)

      // Crear índice único para nombre de usuario
      await this.db
        .collection('users')
        .createIndex({ username: 1 }, { unique: true })

      return this.db
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error)
      throw error
    }
  }

  // Método para cerrar la conexión
  async close() {
    await this.client.close()
  }

  // Método para obtener la instancia de la base de datos
  getDb() {
    if (!this.db) {
      throw new Error('Base de datos no inicializada')
    }
    return this.db
  }

  // Método estático para crear y obtener una instancia singleton
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

// Instancia singleton
Database.instance = null

module.exports = Database
