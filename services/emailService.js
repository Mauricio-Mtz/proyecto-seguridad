const nodemailer = require('nodemailer')

class EmailService {
  constructor() {
    // Configuración del transporter de nodemailer
    // Nota: En producción, usa variables de entorno para las credenciales
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'maurimtz07@gmail.com',
        pass: 'ncae utqk hqro rglx',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  // Método para enviar correo de verificación
  async sendVerificationEmail(to, username, verificationLink) {
    console.log('hola1')
    try {
      const info = await this.transporter.sendMail({
        from: '"Proyecto Seguridad" maurimtz07@gmail.com',
        to: to,
        subject: 'Verifica tu cuenta',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #3b82f6; text-align: center;">¡Bienvenido a Tu Aplicación!</h2>
            <p>Hola ${username},</p>
            <p>Gracias por registrarte. Para completar tu registro y activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar mi cuenta</a>
            </div>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
            <p>Saludos,<br>El equipo de Tu Aplicación</p>
          </div>
        `,
      })

      console.log(
        `${new Date().toISOString()} - Correo de verificación enviado a: ${to}`
      )
      return info
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error al enviar correo de verificación:`,
        error
      )
      throw error
    }
  }

  // Método para enviar correo de restablecimiento de contraseña
  async sendPasswordResetEmail(to, username, resetLink) {
    console.log('hola2')
    try {
      const info = await this.transporter.sendMail({
        from: '"Tu Aplicación" <noreply@tuaplicacion.com>',
        to: to,
        subject: 'Restablecimiento de contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #3b82f6; text-align: center;">Restablecimiento de contraseña</h2>
            <p>Hola ${username},</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar, haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
            </div>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Saludos,<br>El equipo de Tu Aplicación</p>
          </div>
        `,
      })

      console.log(
        `${new Date().toISOString()} - Correo de restablecimiento enviado a: ${to}`
      )
      return info
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error al enviar correo de restablecimiento:`,
        error
      )
      throw error
    }
  }
}

// Exportar una instancia única del servicio
module.exports = new EmailService()
