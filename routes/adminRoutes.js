const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const UserController = require('../controllers/userController');
const Admin = require('../middleware/auth');

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(Admin.isAuthenticated);
router.use(Admin.isAdmin);

// Ruta para mostrar la página de administrador
router.get('/', AdminController.showAdminPage);

// Ruta para registrar un nuevo usuario
router.post('/register', AdminController.registerUser);
router.get('/getAllUsers', UserController.getAllUsers);

module.exports = router;