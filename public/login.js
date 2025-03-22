// Función que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  // Verificar si hay parámetros en la URL
  const urlParams = new URLSearchParams(window.location.search)
  const messageContainer = document.getElementById('messageContainer')

  // Log para depuración
  console.log(urlParams.get('error'))

  // Mostrar mensajes según los errores de verificación
  if (urlParams.get('error') === 'not-verified') {
    messageContainer.innerHTML =
      '<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert"><p>Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.</p></div>'
  } else if (urlParams.get('error') === 'invalid-token') {
    messageContainer.innerHTML =
      '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>El enlace de verificación no es válido o ha expirado.</p></div>'
  } else if (urlParams.get('error') === 'expired-token') {
    messageContainer.innerHTML =
      '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>El enlace de verificación ha expirado. Por favor, contacta con soporte.</p></div>'
  } else if (urlParams.get('message') === 'verified') {
    messageContainer.innerHTML =
      '<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert"><p>¡Tu cuenta ha sido verificada con éxito! Ya puedes iniciar sesión.</p></div>'
  } else if (urlParams.get('error') === 'captcha') {
    messageContainer.innerHTML =
      '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Por favor, completa el CAPTCHA para continuar.</p></div>'
  }

  // Mostrar mensajes según errores de inicio de sesión
  if (urlParams.get('error') === '1') {
    messageContainer.innerHTML =
      '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Credenciales incorrectas. Por favor, intente de nuevo.</p></div>'
  } else if (urlParams.get('error') === '2') {
    const remainingTime = urlParams.get('remainingTime') || 300 // Por defecto 5 minutos (300 segundos)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60

    // Crear el mensaje con el tiempo restante
    const message = `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p>Has excedido el número máximo de intentos.</p>
            <p>Por favor, restablece tu contraseña o espera <span id="lockTimer">${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}</span> minutos.</p>
        </div>`

    messageContainer.innerHTML = message

    // Iniciar el contador regresivo
    let timeLeft = parseInt(remainingTime)
    const timerElement = document.getElementById('lockTimer')

    if (timeLeft > 0 && timerElement) {
      const countdownTimer = setInterval(() => {
        timeLeft -= 1
        if (timeLeft <= 0) {
          clearInterval(countdownTimer)
          timerElement.textContent = '0:00'
          // Opcional: Recargar la página cuando el tiempo expire
          setTimeout(() => location.reload(), 1000)
        } else {
          const min = Math.floor(timeLeft / 60)
          const sec = timeLeft % 60
          timerElement.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`
        }
      }, 1000)
    }
  } else if (urlParams.get('error') === 'auth') {
    messageContainer.innerHTML =
      '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Necesitas iniciar sesión para acceder a esa página.</p></div>'
  } else if (urlParams.get('message') === 'password-reset') {
    messageContainer.innerHTML =
      '<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert"><p>Contraseña restablecida con éxito. Ya puedes iniciar sesión.</p></div>'
  }
})
