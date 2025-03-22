function errorHandler(err, req, res, next) {
  console.error('Error en la aplicación:', err)

  // Determinar el código de estado
  const statusCode = err.statusCode || 500

  // Determinar el mensaje de error
  const message = err.message || 'Error interno del servidor'

  // Enviar respuesta de error
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
    },
  })
}

module.exports = errorHandler
