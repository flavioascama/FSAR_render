document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (result.loggedIn && result.user?.rol === 'vendedor') {
            const h1 = document.getElementById('bienvenida');
            h1.textContent = `Hola ${result.user.nombreTienda || result.user.nombre}`;
        } else {
            // No es vendedor o no está logueado: redirigir a login
            window.location.href = '/';
        }

    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        window.location.href = '/';
    }
});
