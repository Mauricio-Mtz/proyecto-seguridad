const express = require('express');
const router = express.Router();
const AutController = require('../controllers/authController');

// Rutas front
router.get('/', AutController.showLoginPage);
router.get('/reset-password', AutController.showResetPasswordPage);
router.get('/register', AutController.showRegisterPage);
router.get('/verify-email/:token', AutController.verifyEmail);

// Rutas back
router.post('/login', AutController.processLogin);
router.post('/register', AutController.processRegistration);
router.post('/reset-password', AutController.processResetPassword);
router.get('/logout', AutController.logout);

module.exports = router;