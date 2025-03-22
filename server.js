// server.js - Punto de entrada principal
const app = require('./app')
const Database = require('./config/database')
const User = require('./models/User')

const PORT = process.env.PORT || 8000

// Iniciar servidor y conectar a la base de datos
async function startServer() {
  try {
    // Obtener la instancia singleton de Database y conectar a la base de datos
    const dbInstance = Database.getInstance()
    await dbInstance.connect()

    // Inicializar usuarios aquí, después de conectar a la BD
    try {
      await User.setupInitialUsers()
      console.log('Usuarios iniciales configurados correctamente')
    } catch (error) {
      console.error('Error al configurar usuarios iniciales:', error)
    }

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

// Manejar cierre de la aplicación
process.on('SIGINT', async () => {
  // Usar la misma instancia para cerrar la conexión
  await Database.getInstance().close()
  console.log('Conexión a MongoDB cerrada')
  process.exit(0)
})

// Iniciar el servidor
startServer()
