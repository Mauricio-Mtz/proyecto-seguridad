// Función para mostrar alertas
function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container')
  const alertDiv = document.createElement('div')

  // Determinar la clase según el tipo
  let alertClass = ''
  if (type === 'success') {
    alertClass = 'bg-green-100 border-l-4 border-green-500 text-green-700'
  } else if (type === 'danger') {
    alertClass = 'bg-red-100 border-l-4 border-red-500 text-red-700'
  } else if (type === 'warning') {
    alertClass = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
  } else {
    alertClass = 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
  }

  alertDiv.className = `${alertClass} p-4 rounded`
  alertDiv.textContent = message

  alertContainer.innerHTML = ''
  alertContainer.appendChild(alertDiv)

  // Ocultar después de 5 segundos
  setTimeout(() => {
    alertDiv.remove()
  }, 5000)
}

// Registrar nuevo usuario
document
  .getElementById('register-form')
  .addEventListener('submit', async function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const data = new URLSearchParams()

    for (const pair of formData) {
      data.append(pair[0], pair[1])
    }

    try {
      const response = await fetch('/admin/register', {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.ok) {
        showAlert('Usuario registrado correctamente', 'success')
        this.reset()
        // Recargar la lista de usuarios
        loadUsers()
      } else if (response.status === 401) {
        window.location.href = '/?error=auth'
      } else {
        const text = await response.text()
        showAlert('Error al registrar usuario: ' + text, 'danger')
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      showAlert('Error al registrar usuario', 'danger')
    }
  })

// Verificar parámetros de URL
window.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search)

  if (params.has('error')) {
    if (params.get('error') === 'user-exists') {
      showAlert('Error: El nombre de usuario ya existe', 'danger')
    } else if (params.get('error') === 'email-exists') {
      showAlert('Error: El correo electrónico ya está registrado', 'danger')
    }
  }

  if (params.has('message')) {
    if (params.get('message') === 'user-created') {
      showAlert('Usuario creado exitosamente', 'success')
    }
  }

  // Obtener información del usuario
  getUserInfo()
})

// Cargar y mostrar usuarios
async function loadUsers() {
  const usersContainer = document.getElementById('users-container')

  try {
    const response = await fetch('/admin/getAllUsers')

    if (response.status === 403) {
      usersContainer.innerHTML =
        '<p class="text-red-500 text-center py-2">No tienes permisos para ver usuarios</p>'
      return
    }

    if (!response.ok) {
      throw new Error('Error al cargar usuarios')
    }

    const users = await response.json()

    if (users.length === 0) {
      usersContainer.innerHTML =
        '<p class="text-gray-500 text-center py-2">No hay usuarios registrados</p>'
      return
    }

    // Crear tabla de usuarios
    let tableHTML = `
                <table class="min-w-full">
                    <thead>
                    <tr class="bg-gray-200">
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Usuario</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Rol</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Estado</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Creado por</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                    </tr>
                    </thead>
                    <tbody>
                `

    users.forEach((user) => {
      const createdAt = new Date(user.createdAt).toLocaleDateString('es-ES')
      const verified = user.verified
        ? '<span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Verificado</span>'
        : '<span class="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pendiente</span>'

      tableHTML += `
                        <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm">${user.username}</td>
                        <td class="px-4 py-2 text-sm">${user.email || '-'}</td>
                        <td class="px-4 py-2 text-sm">
                            <span class="px-2 py-1 rounded-full text-xs ${getRoleColor(
                              user.role
                            )}">
                            ${user.role}
                            </span>
                        </td>
                        <td class="px-4 py-2 text-sm">${verified}</td>
                        <td class="px-4 py-2 text-sm">${
                          user.createdBy || 'Sistema'
                        }</td>
                        <td class="px-4 py-2 text-sm">${createdAt}</td>
                        </tr>
                    `
    })

    tableHTML += `
                    </tbody>
                </table>
                `

    usersContainer.innerHTML = tableHTML
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    usersContainer.innerHTML =
      '<p class="text-red-500 text-center py-2">Error al cargar usuarios</p>'
  }
}

// Función para obtener el color de fondo según el rol
function getRoleColor(role) {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800'
    case 'usuario':
      return 'bg-blue-100 text-blue-800'
    case 'invitado':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Cargar usuarios al iniciar la página
window.addEventListener('DOMContentLoaded', function () {
  // Cargar usuarios
  loadUsers()
})
