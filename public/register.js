// Verificar si hay parámetros en la URL
const urlParams = new URLSearchParams(window.location.search)
const messageContainer = document.getElementById('messageContainer')

// Mostrar mensajes según los parámetros (para la carga inicial de la página)
if (urlParams.get('error') === 'username') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>El nombre de usuario ya está en uso. Por favor, elige otro.</p></div>'
} else if (urlParams.get('error') === 'email') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Este correo electrónico ya está registrado.</p></div>'
} else if (urlParams.get('error') === 'password') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>La contraseña debe tener al menos 8 caracteres con letras y números.</p></div>'
} else if (urlParams.get('error') === 'match') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Las contraseñas no coinciden.</p></div>'
} else if (urlParams.get('message') === 'verification') {
  messageContainer.innerHTML =
    '<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert"><p>¡Registro exitoso! Hemos enviado un enlace de verificación a tu correo electrónico.</p></div>'
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
  const registerForm = document.getElementById('registerForm')
  
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault() // Prevenir el envío tradicional del formulario
      
      const username = document.getElementById('username').value
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      const confirmPassword = document.getElementById('confirmPassword').value

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        showMessage('error', 'Las contraseñas no coinciden.')
        return false
      }

      // Validar requisitos de contraseña (al menos 8 caracteres, letras y números)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(password)) {
        showMessage('error', 'La contraseña debe tener al menos 8 caracteres e incluir letras y números.')
        return false
      }
      
      // Preparar los datos para enviar
      const formData = {
        username,
        email,
        password,
        confirmPassword
      }
      
      // Enviar los datos mediante fetch
      fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Registro exitoso
          showMessage('success', data.details || '¡Registro exitoso! Hemos enviado un enlace de verificación a tu correo electrónico.')
          // Limpiar el formulario
          registerForm.reset()
        } else {
          // Error en el registro
          showMessage('error', data.message || 'Hubo un error en el registro. Por favor, inténtalo de nuevo.')
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