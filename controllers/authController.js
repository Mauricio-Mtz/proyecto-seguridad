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

    try {
      // Verificar si las contraseñas coinciden
      if (password !== confirmPassword) {
        return res.redirect('/register?error=match')
      }

      // Validar requisitos de contraseña
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(password)) {
        return res.redirect('/register?error=password')
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findUserByUsername(username)
      if (existingUser) {
        return res.redirect('/register?error=username')
      }

      // Verificar si el correo ya está registrado
      const existingEmail = await User.findUserByEmail(email)
      if (existingEmail) {
        return res.redirect('/register?error=email')
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
      res.redirect('/register?message=verification')
    } catch (error) {
      console.error('Error en el registro:', error)
      res.status(500).send('Error interno del servidor')
    }
  }

  // Controlador para verificar email
  static async verifyEmail(req, res) {
    const { token } = req.params

    try {
      // Buscar usuario con el token de verificación
      const user = await User.findUserByVerificationToken(token)

      if (!user) {
        return res.redirect('/?error=invalid-token')
      }

      // Verificar si el token ha expirado
      if (user.verificationExpires < new Date()) {
        return res.redirect('/?error=expired-token')
      }

      // Actualizar estado del usuario
      await User.verifyUser(user._id)

      console.log(
        `${new Date().toISOString()} - Usuario verificado: ${user.username}`
      )
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

    try {
      // Verificar CAPTCHA
      if (!captchaResponse) {
        return res.redirect('/?error=captcha')
      }

      const isCaptchaValid = await AutController.verifyCaptcha(captchaResponse)
      if (!isCaptchaValid) {
        loginService.logLogin(username, false, null, 'CAPTCHA inválido')
        return res.redirect('/?error=captcha')
      }

      // Verificar si el usuario existe
      const user = await User.findUserByUsername(username)

      if (!user) {
        loginService.logLogin(username, false)
        return res.redirect('/?error=1')
      }

      // Verificar si el usuario está verificado
      if (!user.verified) {
        return res.redirect('/?error=not-verified')
      }

      // Verificar intentos fallidos
      const failedStatus = JWT.checkFailedAttempts(username)
      if (failedStatus.isLocked) {
        loginService.logBlockedAttempt(username)
        return res.redirect(
          `/?error=2&remainingTime=${failedStatus.remainingTime}`
        )
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
          return res.redirect(
            `/?error=2&remainingTime=${updatedStatus.remainingTime}`
          )
        }

        return res.redirect('/?error=1')
      }

      // Inicio de sesión exitoso
      // Generar JWT
      const token = JWT.generateToken(user)

      // Resetear intentos fallidos
      JWT.resetFailedAttempts(username)

      loginService.logLogin(username, true, user.role)

      // Establecer cookie y enviar token en respuesta
      res.cookie('token', token, { httpOnly: true, path: '/' })

      return res.redirect('/user/main')
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      res.status(500).send('Error interno del servidor')
    }
  }

  // Controlador para procesar el reset de contraseña
  static async processResetPassword(req, res) {
    const { username, newPassword } = req.body
    const captchaResponse = req.body['g-recaptcha-response']

    try {
      // Verificar CAPTCHA
      if (!captchaResponse) {
        return res.redirect('/reset-password?error=captcha')
      }

      const isCaptchaValid = await AutController.verifyCaptcha(captchaResponse)
      if (!isCaptchaValid) {
        return res.redirect('/reset-password?error=captcha')
      }

      const user = await User.findUserByUsername(username)

      if (!user) {
        return res.redirect('/reset-password?error=1')
      }

      // Actualizar contraseña
      await User.updateUserPassword(username, newPassword)

      // Resetear intentos fallidos
      JWT.resetFailedAttempts(username)

      console.log(
        `${new Date().toISOString()} - Contraseña restablecida para el usuario: ${username}`
      )
      res.redirect('/?message=password-reset')
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error)
      res.status(500).send('Error interno del servidor')
    }
  }

  // Controlador para cerrar sesión
  static logout(req, res) {
    res.clearCookie('token')
    res.redirect('/')
  }
}

module.exports = AutController
