const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const Admin = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas de usuario
router.use(Admin.isAuthenticated);

// Ruta para mostrar la página principal
router.get('/main', UserController.showMainPage);

// Ruta para obtener información del usuario
router.get('/info', UserController.getUserInfo);

module.exports = router;