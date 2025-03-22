// Verificar si hay parámetros en la URL
const urlParams = new URLSearchParams(window.location.search)
const messageContainer = document.getElementById('messageContainer')
const form = document.querySelector('form')

// Mostrar mensajes según los parámetros
if (urlParams.get('error') === '1') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Usuario no encontrado. Por favor, verifica el nombre de usuario.</p></div>'
} else if (urlParams.get('error') === 'captcha') {
  messageContainer.innerHTML =
    '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Por favor, completa el CAPTCHA para continuar.</p></div>'
}

// Validar que las contraseñas coincidan antes de enviar el formulario
form.addEventListener('submit', function (event) {
  const newPassword = document.querySelector('input[name="newPassword"]').value
  const confirmPassword = document.querySelector(
    'input[name="confirmPassword"]'
  ).value

  if (newPassword !== confirmPassword) {
    event.preventDefault()
    messageContainer.innerHTML =
      '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>Las contraseñas no coinciden.</p></div>'
  }
})
