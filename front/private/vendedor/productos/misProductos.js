// Referencias del DOM
const loadingElement = document.getElementById('loading');
const messageElement = document.getElementById('message');
const messageText = document.getElementById('message-text');
const productosGrid = document.getElementById('productos-grid');
const filtroCategoria = document.getElementById('filtro-categoria');
const btnActualizar = document.getElementById('btn-actualizar');
const modalEliminar = document.getElementById('modal-eliminar');
const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');

let productoAEliminar = null;

/**
 * Mostrar/ocultar loading
 */
function showLoading() {
    loadingElement.classList.remove('hidden');
    messageElement.classList.add('hidden');
    productosGrid.innerHTML = '';
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}

/**
 * Mostrar mensaje
 */
function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.classList.remove('hidden');
}

/**
 * Formatear precio
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(precio);
}

/**
 * Crear HTML para tarjeta de producto
 */
function crearProductoCard(producto) {
    const imagenHTML = producto.imagen 
        ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="imagen-placeholder" style="display:none;">📦</div>`
        : `<div class="imagen-placeholder">📦</div>`;

    return `
        <div class="producto-card" data-producto-id="${producto.id}">
            ${imagenHTML}
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</p>
                ${producto.categoria ? `<span class="producto-categoria">${producto.categoria}</span>` : ''}
                <div class="producto-precio">${formatearPrecio(producto.precio)}</div>
                <div class="producto-acciones">
                    <button class="btn-editar" onclick="editarProducto(${producto.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn-eliminar" onclick="confirmarEliminar(${producto.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderizar productos
 */
function renderizarProductos(productos) {
    if (!productos || productos.length === 0) {
        showMessage('No tienes productos registrados. ¡Agrega tu primer producto!', 'info');
        return;
    }

    const productosHTML = productos.map(producto => crearProductoCard(producto)).join('');
    productosGrid.innerHTML = productosHTML;
}

/**
 * Obtener productos del backend
 */
async function obtenerProductos() {
    try {
        showLoading();

        //const categoria = filtroCategoria.value;
        const url = `/api/vendedor/misProductos`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        hideLoading();

        if (!response.ok) {
            if (response.status === 404) {
                showMessage('No se encontraron productos.', 'info');
            } else {
                showMessage('Error al obtener productos.', 'error');
            }
            return;
        }
        const data = await response.json();
        console.log('Datos recibidos:', data);
        renderizarProductos(data.productos);

    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        showMessage('Error de conexión.', 'error');
    }
}

/**
 * Editar producto (redirigir a página de edición)
 */
function editarProducto(productoId) {
    // Puedes crear una página editarProducto.html o reutilizar agregarProducto.html
    window.location.href = `editarProducto.html?id=${productoId}`;
}

/**
 * Confirmar eliminación
 */
function confirmarEliminar(productoId) {
    console.log('Confirmar eliminar producto:', productoId); // Debug
    productoAEliminar = productoId;
    modalEliminar.classList.remove('hidden');
}

/**
 * Eliminar producto
 */
async function eliminarProducto(productoId) {
    try {
        const response = await fetch(`/api/vendedor/eliminarProducto/${productoId}`, {
            method: 'DELETE',
            //credentials: 'include'
        });

        if (response.ok) {
            showMessage('Producto eliminado correctamente.', 'info');
            obtenerProductos(); // Recargar lista
        } else {
            showMessage('Error al eliminar producto.', 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión.', 'error');
    }
}

// Event listeners
btnActualizar.addEventListener('click', obtenerProductos);
filtroCategoria.addEventListener('change', obtenerProductos);

// Modal de eliminación
btnCancelarEliminar.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Cancelando eliminación'); // Debug
    modalEliminar.classList.add('hidden');
    productoAEliminar = null;
});

btnConfirmarEliminar.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Confirmando eliminación'); // Debug
    if (productoAEliminar) {
        modalEliminar.classList.add('hidden');
        await eliminarProducto(productoAEliminar);
        productoAEliminar = null;
    }
});

// Cerrar modal al hacer click fuera
modalEliminar.addEventListener('click', (e) => {
    if (e.target === modalEliminar) {
        console.log('Cerrando modal por click fuera'); // Debug
        modalEliminar.classList.add('hidden');
        productoAEliminar = null;
    }
});

// Prevenir que el modal se abra accidentalmente
document.addEventListener('click', (e) => {
    // Si el click no es en un botón de eliminar, asegurar que el modal esté cerrado
    if (!e.target.classList.contains('btn-eliminar') && 
        !modalEliminar.contains(e.target)) {
        modalEliminar.classList.add('hidden');
        productoAEliminar = null;
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        console.log('Cerrando modal con Escape'); // Debug
        modalEliminar.classList.add('hidden');
        productoAEliminar = null;
    }
});

// Verificar autenticación y cargar productos
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Asegurar que el modal esté cerrado al cargar
        modalEliminar.classList.add('hidden');
        productoAEliminar = null;
        
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.loggedIn || result.user?.rol !== 'vendedor') {
            window.location.href = '/';
            return;
        }

        // Cargar productos
        obtenerProductos();

    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/';
    }
});