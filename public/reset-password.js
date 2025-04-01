// Vali// Verificar si hay parámetros en la URL
const urlParams = new URLSearchParams(window.location.search)
const messageContainer = document.getElementById('messageContainer')

// Mostrar mensajes según los parámetros (para la carga inicial de la página)
if (urlParams.get('error') === '1') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Usuario no encontrado. Por favor, verifica el nombre de usuario.</p></div>'
} else if (urlParams.get('error') === 'captcha') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Por favor, completa el CAPTCHA para continuar.</p></div>'
}

// Mostrar mensaje de error o éxito
function showMessage(type, message) {
  if (type === 'error') {
    messageContainer.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>${message}</p></div>`
  } else if (type === 'success') {
    messageContainer.innerHTML = `<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert"><p>${message}</p></div>`
  }
  
  // Desplazar hacia arriba para mostrar el mensaje
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Mostrar mensaje de error o éxito
function showMessage(type, message) {
  if (type === 'error') {
    messageContainer.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>${message}</p></div>`
  } else if (type === 'success') {
    messageContainer.innerHTML = `<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert"><p>${message}</p></div>`
  }
  
  // Desplazar hacia arriba para mostrar el mensaje
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Validación de formulario
document.addEventListener('DOMContentLoaded', function() {
  const resetPasswordForm = document.getElementById('resetPasswordForm')
  
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', function (e) {
      e.preventDefault() // Prevenir el envío tradicional del formulario
      
      const username = document.getElementById('username').value
      const newPassword = document.getElementById('newPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value

      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        showMessage('error', 'Las contraseñas no coinciden.')
        return false
      }

      // Validar requisitos de contraseña (al menos 8 caracteres, letras y números)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(newPassword)) {
        showMessage('error', 'La contraseña debe tener al menos 8 caracteres e incluir letras y números.')
        return false
      }
      
      // Obtener los valores del formulario
      const formData = new FormData(this)
      
      // Convertir FormData a objeto para enviar como JSON
      const jsonData = {}
      formData.forEach((value, key) => {
          jsonData[key] = value
      })
      
      // Enviar la solicitud mediante fetch
      fetch('/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(jsonData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Restablecimiento exitoso
          showMessage('success', data.details || 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.')
          
          // Opcionalmente, redirigir al usuario después de unos segundos
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
        } else {
          // Error en el restablecimiento
          showMessage('error', data.message || 'Hubo un error al restablecer la contraseña. Por favor, inténtalo de nuevo.')
        }
      })
      .catch(error => {
        console.error('Error:', error)
        showMessage('error', 'Error de conexión. Por favor, inténtalo más tarde.')
      })
      
      return false
    })
  }
})