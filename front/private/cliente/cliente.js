// vendedores.js

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar el nombre de usuario y rol
    await verificarUsuario();
    
    // Cargar lista de vendedores para mostrarlos
    await cargarVendedores();
    
    // Event listener para reintentar
    document.getElementById('retryBtn').addEventListener('click', cargarVendedores);
});

async function verificarUsuario() {
    try {
        const response = await fetch('/auth/check', { //BACKEND: ruta para verificar usuario
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (result.user?.rol === 'cliente') {
            const h1 = document.getElementById('bienvenida');
            h1.textContent = `Hola ${result.user.nombre} - Vendedores Disponibles`;
        } else {
            // No es cliente o no está logueado: redirigir a login
            window.location.href = '/';
        }

    } catch (error) {
        console.error('Error al verificar usuario:', error);
        window.location.href = '/';
    }
}

async function cargarVendedores() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('vendedoresGrid');
    const errorMessage = document.getElementById('errorMessage');
    
    // Mostrar loading y ocultar otros elementos
    loading.style.display = 'flex';
    grid.style.display = 'none';
    errorMessage.style.display = 'none';
    
    try {
        // Hacer petición al backend para obtener vendedores
        const response = await fetch('/api/vendedores', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const vendedores = await response.json();
        
        // Ocultar loading
        loading.style.display = 'none';
        
        if (vendedores && vendedores.length > 0) {
            mostrarVendedores(vendedores);
            grid.style.display = 'grid';
        } else {
            mostrarMensajeVacio();
        }

    } catch (error) {
        console.error('Error al cargar vendedores:', error);
        loading.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

function mostrarVendedores(vendedores) {
    const grid = document.getElementById('vendedoresGrid');

    grid.innerHTML = vendedores.map(vendedor => {
        // Obtener la primera letra del nombre de la tienda para el ícono
        const inicial = vendedor.nombreTienda ? vendedor.nombreTienda.charAt(0).toUpperCase() : 'V';
        
        return `
            <div class="vendedor-card" onclick="verProductosVendedor(${vendedor.id}, '${vendedor.nombreTienda}')">
                <div class="vendedor-info">
                    <div class="vendedor-icon">${inicial}</div>
                    <h3 class="vendedor-name">${vendedor.nombreTienda || 'Tienda sin nombre'}</h3>
                    <p class="vendedor-subtitle">Ver productos disponibles</p>
                    <button class="ver-productos-btn" onclick="event.stopPropagation(); verProductosVendedor(${vendedor.id}, '${vendedor.nombreTienda}')">
                        Ver Productos
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function mostrarMensajeVacio() {
    const grid = document.getElementById('vendedoresGrid');
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <div style="background: rgba(255, 255, 255, 0.9); padding: 40px; border-radius: 15px;">
                <h3 style="color: #ff6b1a; margin-bottom: 10px;">No hay vendedores disponibles</h3>
                <p style="color: #666;">Actualmente no hay vendedores registrados en el sistema.</p>
            </div>
        </div>
    `;
    grid.style.display = 'grid';
}

function verProductosVendedor(vendedorId, nombreTienda) {
    // Redirigir a la página de productos del vendedor
    // Puedes pasar el ID del vendedor como parámetro en la URL
    window.location.href = `/cliente/productos?vendedor=${vendedorId}&tienda=${encodeURIComponent(nombreTienda)}`;
}

// Función auxiliar para manejar errores de red
function manejarErrorRed(error) {
    console.error('Error de red:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    return 'Error al conectar con el servidor. Intenta de nuevo más tarde.';
}