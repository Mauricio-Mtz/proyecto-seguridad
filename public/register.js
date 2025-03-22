// Verificar si hay parámetros en la URL
const urlParams = new URLSearchParams(window.location.search)
const messageContainer = document.getElementById('messageContainer')

// Mostrar mensajes según los parámetros
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

// Validación de formulario
document
  .getElementById('registerForm')
  .addEventListener('submit', function (e) {
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      e.preventDefault()
      messageContainer.innerHTML =
        '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Las contraseñas no coinciden.</p></div>'
      return false
    }

    // Validar requisitos de contraseña (al menos 8 caracteres, letras y números)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      e.preventDefault()
      messageContainer.innerHTML =
        '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>La contraseña debe tener al menos 8 caracteres e incluir letras y números.</p></div>'
      return false
    }

    return true
  })
