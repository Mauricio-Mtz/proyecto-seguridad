// Obtener información del usuario al cargar la página
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('/user/info')
    if (!response.ok) {
      throw new Error('Error al obtener información del usuario')
    }

    const userData = await response.json()
    const userInfoElement = document.getElementById('userInfo')
    const contentElement = document.getElementById('content')

    // Mostrar información del usuario
    userInfoElement.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="font-medium text-gray-700">Usuario:</p>
                    <p class="text-gray-800 text-lg">${userData.username}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="font-medium text-gray-700">Rol:</p>
                    <p class="text-gray-800 text-lg">${userData.role}</p>
                </div>
            </div>
        `

    // Contenido específico según el rol
    if (userData.role === 'admin') {
      contentElement.innerHTML = `
                <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Panel de Administrador</h2>
                <p class="text-gray-600 mb-4">Como administrador, tienes acceso a todas las funciones del sistema.</p>
                <a href="/admin" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300">Acceder al panel de administración</a>
            `
    } else if (userData.role === 'usuario') {
      contentElement.innerHTML = `
                <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Panel de Usuario</h2>
                <p class="text-gray-600">Como usuario regular, puedes acceder a las funciones básicas del sistema.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <h3 class="font-medium text-gray-700 mb-2">Gestión de perfil</h3>
                        <p class="text-gray-600 text-sm">Actualiza tu información personal y preferencias</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <h3 class="font-medium text-gray-700 mb-2">Mis documentos</h3>
                        <p class="text-gray-600 text-sm">Accede a tus archivos y documentos</p>
                    </div>
                </div>
            `
    } else if (userData.role === 'invitado') {
      contentElement.innerHTML = `
                <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Acceso de Invitado</h2>
                <p class="text-gray-600 mb-4">Como invitado, tu acceso al sistema es limitado.</p>
                <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-4">
                    <p class="flex items-center">
                        <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Para solicitar acceso completo, contacte al administrador del sistema.
                    </p>
                </div>
            `
    }
  } catch (error) {
    console.error('Error:', error)
    document.getElementById('userInfo').innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p class="font-medium">Error al cargar la información del usuario.</p>
                <p class="text-sm">Por favor, intente recargar la página o contacte con soporte.</p>
            </div>
        `
  }
})
