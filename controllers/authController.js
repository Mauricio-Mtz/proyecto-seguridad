const User = require('../models/User')
const JWT = require('../config/jwt')
const loginService = require('../services/loginService')
const emailService = require('../services/emailService')
const crypto = require('crypto')
const axios = require('axios')

// Configuración del CAPTCHA
const RECAPTCHA_SECRET_KEY = '6LfKLvwqAAAAAIgRmIQwdK0VwKc1wPMspsqPI1tt'

class AutController {
  // Controlador para mostrar la página de login
  static showLoginPage(req, res) {
    res.sendFile(require('path').join(__dirname, '../views/login.html'))
  }

  // Controlador para mostrar la página de registro
  static showRegisterPage(req, res) {
    res.sendFile(require('path').join(__dirname, '../views/register.html'))
  }

  // Controlador para mostrar la página de reset de contraseña
  static showResetPasswordPage(req, res) {
    res.sendFile(
      require('path').join(__dirname, '../views/reset-password.html')
    )
  }

  // Función para verificar el reCAPTCHA
  static async verifyCaptcha(response) {
    try {
      const result = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response,
          },
        }
      )

      return result.data.success
    } catch (error) {
      console.error('Error al verificar CAPTCHA:', error)
      return false
    }
  }

  // Controlador para procesar el registro de usuario
  static async processRegistration(req, res) {
    const { username, email, password, confirmPassword } = req.body
    console.log(req.body)
    
    // Verificar si es una solicitud AJAX o tradicional
    const isAjaxRequest = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

    try {
      // Verificar si las contraseñas coinciden
      if (password !== confirmPassword) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'match',
            message: 'Las contraseñas no coinciden.'
          }) : 
          res.redirect('/register?error=match');
      }

      // Validar requisitos de contraseña
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'password',
            message: 'La contraseña debe tener al menos 8 caracteres con letras y números.'
          }) : 
          res.redirect('/register?error=password');
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findUserByUsername(username)
      console.log(existingUser)
      if (existingUser) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'username',
            message: 'El nombre de usuario ya está en uso. Por favor, elige otro.'
          }) : 
          res.redirect('/register?error=username');
      }

      // Verificar si el correo ya está registrado
      const existingEmail = await User.findUserByEmail(email)
      if (existingEmail) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'email',
            message: 'Este correo electrónico ya está registrado.'
          }) : 
          res.redirect('/register?error=email');
      }

      // Generar token de verificación
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const tokenExpiry = new Date()
      tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token válido por 24 horas

      // Crear usuario con estado no verificado
      await User.createUser({
        username,
        email,
        password,
        role: 'usuario',
        verified: false,
        verificationToken,
        verificationExpires: tokenExpiry,
      })

      // Enviar correo de verificación
      const verificationLink = `${req.protocol}://${req.get(
        'host'
      )}/verify-email/${verificationToken}`
      await emailService.sendVerificationEmail(
        email,
        username,
        verificationLink
      )

      console.log(
        `${new Date().toISOString()} - Usuario registrado: ${username}. Esperando verificación.`
      )
      
      return isAjaxRequest ? 
        res.status(200).json({
          success: true,
          message: 'verification',
          details: '¡Registro exitoso! Hemos enviado un enlace de verificación a tu correo electrónico.'
        }) : 
        res.redirect('/register?message=verification');
    } catch (error) {
      console.error('Error en el registro:', error)
      return isAjaxRequest ? 
        res.status(500).json({
          success: false,
          error: 'server',
          message: 'Error interno del servidor'
        }) : 
        res.status(500).send('Error interno del servidor');
    }
  }

  // Controlador para verificar email
  static async verifyEmail(req, res) {
    const { token } = req.params

    try {
      // Buscar usuario con el token de verificación
      const user = await User.findUserByVerificationToken(token)

      if (!user) {
        // Mantenemos la redirección en este caso ya que es una operación iniciada desde un correo electrónico
        return res.redirect('/?error=invalid-token')
      }

      // Verificar si el token ha expirado
      if (user.verificationExpires < new Date()) {
        // Mantenemos la redirección en este caso ya que es una operación iniciada desde un correo electrónico
        return res.redirect('/?error=expired-token')
      }

      // Actualizar estado del usuario
      await User.verifyUser(user._id)

      console.log(
        `${new Date().toISOString()} - Usuario verificado: ${user.username}`
      )
      // Mantenemos la redirección en este caso ya que es una operación iniciada desde un correo electrónico
      res.redirect('/?message=verified')
    } catch (error) {
      console.error('Error en la verificación:', error)
      res.status(500).send('Error interno del servidor')
    }
  }

  // Controlador para procesar el inicio de sesión
  static async processLogin(req, res) {
    const { username, password } = req.body
    const captchaResponse = req.body['g-recaptcha-response']

    // Verificar si es una solicitud AJAX o tradicional
    const isAjaxRequest = req.xhr || req.headers.accept.includes('application/json');

    try {
      // Verificar CAPTCHA
      if (!captchaResponse) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'captcha',
            message: 'Por favor, completa el captcha.'
          }) : 
          res.redirect('/?error=captcha');
      }

      const isCaptchaValid = await AutController.verifyCaptcha(captchaResponse)
      if (!isCaptchaValid) {
        loginService.logLogin(username, false, null, 'CAPTCHA inválido')
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'captcha',
            message: 'Verificación de CAPTCHA fallida. Por favor, inténtalo de nuevo.'
          }) : 
          res.redirect('/?error=captcha');
      }

      // Verificar si el usuario existe
      const user = await User.findUserByUsername(username)

      if (!user) {
        loginService.logLogin(username, false)
        return isAjaxRequest ? 
          res.status(401).json({
            success: false,
            error: '1',
            message: 'Nombre de usuario o contraseña incorrectos.'
          }) : 
          res.redirect('/?error=1');
      }

      // Verificar si el usuario está verificado
      if (!user.verified) {
        return isAjaxRequest ? 
          res.status(401).json({
            success: false,
            error: 'not-verified',
            message: 'Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.'
          }) : 
          res.redirect('/?error=not-verified');
      }

      // Verificar intentos fallidos
      const failedStatus = JWT.checkFailedAttempts(username)
      if (failedStatus.isLocked) {
        loginService.logBlockedAttempt(username)
        return isAjaxRequest ? 
          res.status(429).json({
            success: false,
            error: '2',
            message: 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.',
            remainingTime: failedStatus.remainingTime
          }) : 
          res.redirect(`/?error=2&remainingTime=${failedStatus.remainingTime}`);
      }

      // Verificar contraseña
      const passwordMatch = await User.verifyPassword(password, user.password)

      if (!passwordMatch) {
        // Contraseña incorrecta
        const attempts = JWT.registerFailedAttempt(username)
        loginService.logLogin(username, false)

        if (attempts >= 3) {
          const updatedStatus = JWT.checkFailedAttempts(username)
          loginService.logBlockedAttempt(username)
          return isAjaxRequest ? 
            res.status(429).json({
              success: false,
              error: '2',
              message: 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.',
              remainingTime: updatedStatus.remainingTime
            }) : 
            res.redirect(`/?error=2&remainingTime=${updatedStatus.remainingTime}`);
        }

        return isAjaxRequest ? 
          res.status(401).json({
            success: false,
            error: '1',
            message: 'Nombre de usuario o contraseña incorrectos.'
          }) : 
          res.redirect('/?error=1');
      }

      // Inicio de sesión exitoso
      // Generar JWT
      const token = JWT.generateToken(user)

      // Resetear intentos fallidos
      JWT.resetFailedAttempts(username)

      loginService.logLogin(username, true, user.role)

      // Establecer cookie y enviar token en respuesta
      res.cookie('token', token, { httpOnly: true, path: '/' })

      return isAjaxRequest ? 
        res.status(200).json({
          success: true,
          message: 'Inicio de sesión exitoso',
          redirectUrl: '/user/main',
          user: {
            username: user.username,
            role: user.role,
            email: user.email
          }
        }) : 
        res.redirect('/user/main');
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      return isAjaxRequest ? 
        res.status(500).json({
          success: false,
          error: 'server',
          message: 'Error interno del servidor'
        }) : 
        res.status(500).send('Error interno del servidor');
    }
  }

  // Controlador para procesar el reset de contraseña
  static async processResetPassword(req, res) {
    const { username, newPassword } = req.body
    const captchaResponse = req.body['g-recaptcha-response']
    
    // Verificar si es una solicitud AJAX o tradicional
    const isAjaxRequest = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

    try {
      // Verificar CAPTCHA
      if (!captchaResponse) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'captcha',
            message: 'Por favor, completa el captcha.'
          }) : 
          res.redirect('/reset-password?error=captcha');
      }

      const isCaptchaValid = await AutController.verifyCaptcha(captchaResponse)
      if (!isCaptchaValid) {
        return isAjaxRequest ? 
          res.status(400).json({
            success: false,
            error: 'captcha',
            message: 'Verificación de CAPTCHA fallida. Por favor, inténtalo de nuevo.'
          }) : 
          res.redirect('/reset-password?error=captcha');
      }

      const user = await User.findUserByUsername(username)

      if (!user) {
        return isAjaxRequest ? 
          res.status(404).json({
            success: false,
            error: '1',
            message: 'Usuario no encontrado.'
          }) : 
          res.redirect('/reset-password?error=1');
      }

      // Actualizar contraseña
      await User.updateUserPassword(username, newPassword)

      // Resetear intentos fallidos
      JWT.resetFailedAttempts(username)

      console.log(
        `${new Date().toISOString()} - Contraseña restablecida para el usuario: ${username}`
      )
      
      return isAjaxRequest ? 
        res.status(200).json({
          success: true,
          message: 'password-reset',
          details: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
        }) : 
        res.redirect('/?message=password-reset');
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error)
      return isAjaxRequest ? 
        res.status(500).json({
          success: false,
          error: 'server',
          message: 'Error interno del servidor'
        }) : 
        res.status(500).send('Error interno del servidor');
    }
  }

  // Controlador para cerrar sesión
  static async logout(req, res) {
    res.clearCookie('token')
    
    // Verificar si la solicitud espera JSON o HTML (basado en encabezados)
    const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
    
    if (acceptsJson || req.xhr) {
      return res.status(200).json({
        success: true,
        message: 'Sesión cerrada correctamente',
        redirectUrl: '/'
      });
    } else {
      // Para peticiones tradicionales, mantener la redirección
      return res.redirect('/');
    }
  }
}

module.exports = AutController