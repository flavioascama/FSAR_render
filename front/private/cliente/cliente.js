// cliente.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

            const h1 = document.getElementById('bienvenida');
            h1.textContent = `Hola ${result.user.nombre}`;

    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        window.location.href = '/';
    }
});
