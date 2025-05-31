
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include' // Necesario si usas sesiones
        });

        if (response.ok) {
            window.location.href = '/'; // Redirige al index
        } else {
            alert('Error al cerrar sesión.');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error de conexión.');
    }
});


