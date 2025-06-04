// Variables globales
let loadingElement, messageElement, messageText, productosGrid, vendedorIdElement;
let carritoModal, carritoContador, carritoItems, carritoTotal, totalPrecio;
let carrito = [];
let clienteId = null;
let vendedorIdGlobal = null;

/**
 * Función para inicializar las referencias del DOM
 */
function inicializarElementosDOM() {
    loadingElement = document.getElementById('loading');
    messageElement = document.getElementById('message');
    messageText = document.getElementById('message-text');
    productosGrid = document.getElementById('productos-grid');
    vendedorIdElement = document.getElementById('vendedor-id');
    carritoModal = document.getElementById('carrito-modal');
    carritoContador = document.getElementById('carrito-contador');
    carritoItems = document.getElementById('carrito-items');
    carritoTotal = document.getElementById('carrito-total');
    totalPrecio = document.getElementById('total-precio');
    btnComprar = document.getElementById('btn-comprar');

}

// ========================================
// FUNCIONES QUE CONSUMEN EL BACKEND
// ========================================

/**
 * Función para obtener datos del cliente desde el backend
 * REQUIERE BACKEND: GET /api/cliente/datos - retorna datos del cliente basado en su sesión
 */
async function obtenerDatosCliente() {
    try {
        const response = await fetch('/auth/cliente/datos', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const clienteData = await response.json();
            return clienteData.data;
        } else {
            console.log('Cliente no autenticado');
            return null;
        }
    } catch (error) {
        console.error('Error al obtener datos del cliente:', error);
        return null;
    }
}

/**
 * Función principal para obtener productos del backend
 * REQUIERE BACKEND: GET /api/cliente/productos/:vendedorId
 */
async function obtenerProductos(vendedorId) {
    try {
        showLoading();

        const apiUrl = `/api/cliente/productos/${encodeURIComponent(vendedorId)}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        hideLoading();

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

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showMessage('Error de conexión. Verifica tu conexión a internet.', 'error');
        } else {
            showMessage('Error inesperado. Por favor, intenta más tarde.', 'error');
        }
    }
}

// ========================================
// FUNCIONES DE MANEJO DE COOKIES DEL CARRITO
// ========================================

/**
 * Función para guardar carrito en cookie específica del cliente
 */

function guardarCarritoEnCookie() {
    try {
        if (!clienteId) {
            console.log('No hay cliente autenticado, no se guarda carrito');
            return;
        }

        const carritoData = {
            clienteId: clienteId,
            vendedorId: vendedorIdGlobal,
            productos: carrito,
            timestamp: Date.now()
        };

        // Guardar en cookie por 30 días
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        const nombreCookie = `carrito_${clienteId}`;
        const valorCookie = encodeURIComponent(JSON.stringify(carritoData));

        document.cookie = `${nombreCookie}=${valorCookie}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

        console.log(`Carrito guardado en cookie: ${nombreCookie}`);
    } catch (error) {
        console.error('Error al guardar carrito en cookie:', error);
    }
}

/**
 * Función para cargar carrito desde cookie específica del cliente
 */
function cargarCarritoDesdeCookie() {
    try {
        if (!clienteId) {
            console.log('No hay cliente autenticado, carrito vacío');
            carrito = [];
            actualizarCarrito();
            return;
        }

        const nombreCookie = `carrito_${clienteId}`;
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${nombreCookie}=`));

        if (cookieValue) {
            const carritoData = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));

            // Verificar que la cookie sea del cliente correcto
            if (carritoData.clienteId === clienteId) {
                carrito = carritoData.productos || [];
                console.log(`Carrito cargado desde cookie: ${nombreCookie}`, carrito);
                actualizarCarrito();
            } else {
                console.log('Cookie de carrito no coincide con cliente actual');
                carrito = [];
                actualizarCarrito();
            }
        } else {
            console.log('No hay cookie de carrito para este cliente');
            carrito = [];
            actualizarCarrito();
        }
    } catch (error) {
        console.error('Error al cargar carrito desde cookie:', error);
        carrito = [];
        actualizarCarrito();
    }
}



// ========================================
// FUNCIONES DE MANEJO DEL CARRITO
// ========================================

/**
 * Función para agregar producto al carrito
 */
function agregarAlCarrito(producto) {
    console.log('Intentando agregar producto:', producto);
    console.log('Cliente ID actual:', clienteId);
    if (!clienteId) {
        mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito', 'error');
        return;
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
        console.log('Producto existente, nueva cantidad:', productoExistente.cantidad);
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    // Guardar en cookie inmediatamente
    guardarCarritoEnCookie();

    actualizarCarrito();
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
}

/**
 * Función para eliminar producto del carrito
 */
function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);

    // Actualizar cookie
    guardarCarritoEnCookie();

    actualizarCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

/**
 * Función para vaciar todo el carrito
 */
function vaciarCarrito() {
    carrito = [];
    guardarCarritoEnCookie();
    actualizarCarrito();
    mostrarNotificacion('Carrito vaciado');
}

// ========================================
// FUNCIONES DE INTERFAZ Y UTILIDADES
// ========================================

/**
 * Función para extraer parámetros de la URL
 */
function getVendedorIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('vendedor');
}

/**
 * Función para mostrar el estado de carga
 */
function showLoading() {
    if (loadingElement && messageElement && productosGrid) {
        loadingElement.classList.remove('hidden');
        messageElement.classList.add('hidden');
        productosGrid.innerHTML = '';
    }
}

/**
 * Función para ocultar el estado de carga
 */
function hideLoading() {
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}

/**
 * Función para mostrar mensajes al usuario
 */
function showMessage(message, type = 'info') {
    if (messageText && messageElement) {
        messageText.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.classList.remove('hidden');
    }
}

/**
 * Función para formatear el precio
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(precio);
}

/**
 * Función para actualizar la visualización del carrito
 */
function actualizarCarrito() {
    if (!carritoContador) return;

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    if (totalItems > 0) {
        carritoContador.textContent = totalItems;
        carritoContador.classList.remove('hidden');
        btnComprar.classList.remove('hidden');
    } else {
        btnComprar.classList.add('hidden');
        carritoContador.classList.add('hidden');
    }

    actualizarModalCarrito();
}

/**
 * Función para actualizar el contenido del modal del carrito
 */
function actualizarModalCarrito() {
    if (!carritoItems || !carritoTotal || !totalPrecio) return;

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<div class="carrito-vacio"><p>Tu carrito está vacío</p></div>';
        carritoTotal.classList.add('hidden');
        return;
    }

    let itemsHTML = '';
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        itemsHTML += `
            <div class="carrito-item">
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">${formatearPrecio(item.precio)} × ${item.cantidad}</div>
                </div>
                <div class="carrito-item-actions">
                    <div class="carrito-item-precio">${formatearPrecio(subtotal)}</div>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.id}')">🗑️</button>
                </div>
            </div>
        `;
    });

    carritoItems.innerHTML = itemsHTML;
    totalPrecio.textContent = formatearPrecio(total);
    carritoTotal.classList.remove('hidden');
}

/**
 * Función para mostrar/ocultar el modal del carrito
 */
function toggleCarrito() {
    if (!carritoModal) {
        console.error('carritoModal no está inicializado');
        return;
    }

    if (carritoModal.style.display === 'block') {
        carritoModal.style.display = 'none';
    } else {
        carritoModal.style.display = 'block';
        actualizarModalCarrito();
    }
}

/**
 * Función para volver atrás
 */
function volverAtras() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/';
    }
}

/**
 * Función para mostrar notificaciones
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    const color = tipo === 'error' ? '#e74c3c' : '#ff6b2c';

    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(255, 107, 44, 0.3);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
        notificacion.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)';
        notificacion.style.opacity = '0';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * Función para crear el HTML de una tarjeta de producto
 */
function crearProductoCard(producto) {
    // CORRECCIÓN: Usar _id si no hay id
    const productoId = producto.id || producto._id;
    console.log('Creando card para producto:', { id: producto.id, _id: producto._id, nombre: producto.nombre });

    const imagenHTML = producto.imagen
        ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="imagen-placeholder" style="display:none;">📦</div>`
        : `<div class="imagen-placeholder">📦</div>`;

    return `
        <div class="producto-card" data-producto-id="${productoId}">
            ${imagenHTML}
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion || 'Sin descripción disponible'}</p>
                <div class="producto-precio">${formatearPrecio(producto.precio)}</div>
                <button class="btn-agregar-carrito" data-producto-id="${productoId}">
                    🛒 Agregar al carrito
                </button>
            </div>
        </div>
    `;
}

/**
 * Función para renderizar la lista de productos en el DOM
 */
function renderizarProductos(productos) {
    if (!productos || productos.length === 0) {
        showMessage('No se encontraron productos para este vendedor.', 'info');
        return;
    }

    console.log('Productos recibidos para renderizar:', productos);

    // Guardar productos globalmente para acceso posterior
    window.productosDisponibles = productos;

    const productosHTML = productos.map(producto => crearProductoCard(producto)).join('');

    if (productosGrid) {
        productosGrid.innerHTML = productosHTML;

        // Agregar event listeners a los botones - CORREGIDO
        const botonesAgregar = productosGrid.querySelectorAll('.btn-agregar-carrito');
        console.log('Botones encontrados:', botonesAgregar.length);

        botonesAgregar.forEach((boton, index) => {
            boton.addEventListener('click', function () {
                console.log('Botón clickeado, índice:', index);

                const productoId = this.getAttribute('data-producto-id');
                console.log('Producto ID del botón:', productoId);
                console.log('Productos disponibles:', window.productosDisponibles);

                // CORRECCIÓN: Buscar por string y por ObjectId
                let producto = window.productosDisponibles.find(p => {
                    // Convertir ambos a string para comparar
                    return p.id?.toString() === productoId?.toString() ||
                        p._id?.toString() === productoId?.toString();
                });

                console.log('Producto encontrado:', producto);

                if (producto) {
                    // Asegurar que el producto tenga un ID válido
                    if (!producto.id && producto._id) {
                        producto.id = producto._id;
                    }

                    agregarAlCarrito(producto);
                } else {
                    console.error('Producto no encontrado:', productoId);
                    console.log('IDs disponibles:', window.productosDisponibles.map(p => ({ id: p.id, _id: p._id })));
                    mostrarNotificacion('Error: Producto no encontrado', 'error');
                }
            });
        });
    }
}
/**
 * Función para configurar todos los event listeners
 */
function configurarEventListeners() {
    if (carritoModal) {
        carritoModal.addEventListener('click', function (e) {
            if (e.target === carritoModal) {
                toggleCarrito();
            }
        });
    }
}

/**
 * Función de inicialización principal
 */
async function inicializar() {
    inicializarElementosDOM();
    configurarEventListeners();

    // Obtener datos del cliente (solo si está autenticado)
    const datosCliente = await obtenerDatosCliente();
    if (datosCliente) {
        clienteId = datosCliente.id;
        console.log('Cliente autenticado:', clienteId);

        // Cargar carrito desde cookie del cliente
        cargarCarritoDesdeCookie();
    } else {
        console.log('No hay cliente autenticado');
        carrito = [];
        actualizarCarrito();
    }

    const vendedorId = getVendedorIdFromURL();
    vendedorIdGlobal = vendedorId; // Guardar globalmente para uso posterior
    if (!vendedorId) {
        showMessage('No se especificó un vendedor válido en la URL.', 'error');
        return;
    }

    if (vendedorIdElement) {
        vendedorIdElement.textContent = `ID Vendedor: ${vendedorId}`;
    }

    // Cargar productos
    obtenerProductos(vendedorId);
}
async function comprarProductos() {
    const totalPagarTexto = totalPrecio.textContent; // Ej: "S/ 1,700.00"
    const montoLimpio = totalPagarTexto.replace(/[^\d.-]/g, '').replace(',', ''); // "1700.00"
    const montoEntero = Math.round(parseFloat(montoLimpio) * 100); // 170000

    const body = {
        product: {
            name: "Productos del carrito",
            price: montoEntero,
            quantity: 1 // Asumiendo que es un solo pago por el total del carrito
        }
    };
    try {
        const resPago = await fetch('/api/pagos/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const data = await resPago.json();
        window.location.href = data.url;

    } catch (error) {
        console.error('Error al procesar el pago:', error);
        mostrarNotificacion('Error al procesar el pago. Por favor, intenta más tarde.', 'error');
    }
}
// Event listener para cuando se carga completamente el DOM
document.addEventListener('DOMContentLoaded', inicializar);

// Hacer las funciones accesibles globalmente
window.toggleCarrito = toggleCarrito;
window.volverAtras = volverAtras;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;