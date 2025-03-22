const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Configuración de middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar rutas
app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Middleware para manejo de errores 404
app.use((req, res, next) => {
  res.status(404).send('404 - Página no encontrada');
});

// Middleware para manejo de errores
app.use(errorHandler);

module.exports = app;