// Referencias a elementos del DOM
const loadingElement = document.getElementById('loading');
const messageElement = document.getElementById('message');
const messageText = document.getElementById('message-text');
const productosGrid = document.getElementById('productos-grid');
const vendedorIdElement = document.getElementById('vendedor-id');

/**
 * Función para extraer parámetros de la URL
 * Lee el query parameter 'vendedor' de la URL actual
 */
function getVendedorIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('vendedor');
}

/**
 * Función para mostrar el estado de carga
 */
function showLoading() {
    loadingElement.classList.remove('hidden');
    messageElement.classList.add('hidden');
    productosGrid.innerHTML = '';
}

/**
 * Función para ocultar el estado de carga
 */
function hideLoading() {
    loadingElement.classList.add('hidden');
}

/**
 * Función para mostrar mensajes al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje ('error' o 'info')
 */
function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.classList.remove('hidden');
}

/**
 * Función para formatear el precio
 * @param {number} precio - Precio numérico
 * @returns {string} - Precio formateado
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(precio);
}

/**
 * Función para crear el HTML de una tarjeta de producto
 * @param {Object} producto - Objeto producto del backend
 * @returns {string} - HTML de la tarjeta
 */
function crearProductoCard(producto) {
    // Crear elemento de imagen o placeholder
    const imagenHTML = producto.imagen 
        ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="imagen-placeholder" style="display:none;">📦</div>`
        : `<div class="imagen-placeholder">📦</div>`;

    return `
        <div class="producto-card" data-producto-id="${producto.id}">
            ${imagenHTML}
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion || 'Sin descripción disponible'}</p>
                <div class="producto-precio">${formatearPrecio(producto.precio)}</div>
            </div>
        </div>
    `;
}

/**
 * Función para renderizar la lista de productos en el DOM
 * @param {Array} productos - Array de productos del backend
 */
function renderizarProductos(productos) {
    if (!productos || productos.length === 0) {
        showMessage('No se encontraron productos para este vendedor.', 'info');
        return;
    }

    // Crear HTML para todos los productos
    const productosHTML = productos.map(producto => crearProductoCard(producto)).join('');
    
    // Insertar en el grid
    productosGrid.innerHTML = productosHTML;

    // Agregar event listeners opcionales (para futuras funcionalidades)
    const productCards = document.querySelectorAll('.producto-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const productoId = card.getAttribute('data-producto-id');
            console.log('Producto clickeado:', productoId);
            // Aquí puedes agregar lógica para mostrar detalles del producto
        });
    });
}

/**
 * Función principal para obtener productos del backend
 * @param {string} vendedorId - ID del vendedor
 */
async function obtenerProductos(vendedorId) {
    try {
        showLoading();

        // Construir URL de la API
        const apiUrl = `/api/cliente/productos/${encodeURIComponent(vendedorId)}`;
        
        // Realizar petición HTTP GET
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        hideLoading();

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            if (response.status === 404) {
                showMessage('No se encontraron productos para este vendedor.', 'info');
            } else if (response.status >= 500) {
                showMessage('Error del servidor. Por favor, intenta más tarde.', 'error');
            } else {
                showMessage(`Error al obtener productos (${response.status}).`, 'error');
            }
            return;
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        renderizarProductos(data.productos);

    } catch (error) {
        hideLoading();
        console.error('Error al obtener productos:', error);
        
        // Manejar diferentes tipos de errores
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showMessage('Error de conexión. Verifica tu conexión a internet.', 'error');
        } else {
            showMessage('Error inesperado. Por favor, intenta más tarde.', 'error');
        }
    }
}

/**
 * Función de inicialización que se ejecuta cuando carga la página
 */
function inicializar() {
    // Obtener ID del vendedor de la URL
    const vendedorId = getVendedorIdFromURL();
    
    if (!vendedorId) {
        showMessage('No se especificó un vendedor válido en la URL.', 'error');
        return;
    }

    // Mostrar ID del vendedor en el header
    vendedorIdElement.textContent = `ID Vendedor: ${vendedorId}`;
    
    // Obtener y mostrar productos
    obtenerProductos(vendedorId);
}

// Event listener para cuando se carga completamente el DOM
document.addEventListener('DOMContentLoaded', inicializar);

// Event listener opcional para el botón de recarga (si decides agregarlo)
function recargarProductos() {
    const vendedorId = getVendedorIdFromURL();
    if (vendedorId) {
        obtenerProductos(vendedorId);
    }
}