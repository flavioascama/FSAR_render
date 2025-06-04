// Referencias del DOM
const loadingElement = document.getElementById('loading');
const messageElement = document.getElementById('message');
const messageText = document.getElementById('message-text');
const pedidosLista = document.getElementById('pedidos-lista');
const filtroEstado = document.getElementById('filtro-estado');
const btnActualizar = document.getElementById('btn-actualizar');

/**
 * Mostrar/ocultar loading
 */
function showLoading() {
    loadingElement.classList.remove('hidden');
    messageElement.classList.add('hidden');
    pedidosLista.innerHTML = '';
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
 * Formatear fecha
 */
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
 * Crear HTML para un pedido
 */
function crearPedidoCard(pedido) {
    const productosHTML = pedido.productos?.map(producto => `
        <div class="producto-item">
            <span>${producto.nombre} (x${producto.cantidad})</span>
            <span>${formatearPrecio(producto.precio * producto.cantidad)}</span>
        </div>
    `).join('') || '<div class="producto-item">No hay productos</div>';

    return `
        <div class="pedido-card">
            <div class="pedido-header">
                <div>
                    <div class="pedido-id">Pedido #${pedido.id}</div>
                    <div class="pedido-fecha">${formatearFecha(pedido.fecha)}</div>
                </div>
                <div class="pedido-estado estado-${pedido.estado}">
                    ${pedido.estado}
                </div>
            </div>
            
            <div class="pedido-cliente">
                <strong>Cliente:</strong> ${pedido.clienteNombre || 'No especificado'}
            </div>
            
            <div class="pedido-productos">
                <strong>Productos:</strong>
                ${productosHTML}
            </div>
            
            <div class="pedido-total">
                Total: ${formatearPrecio(pedido.total)}
            </div>
        </div>
    `;
}

/**
 * Renderizar lista de pedidos
 */
function renderizarPedidos(pedidos) {
    if (!pedidos || pedidos.length === 0) {
        showMessage('No hay pedidos para mostrar.', 'info');
        return;
    }

    const pedidosHTML = pedidos.map(pedido => crearPedidoCard(pedido)).join('');
    pedidosLista.innerHTML = pedidosHTML;
}

/**
 * Obtener pedidos del backend
 */
async function obtenerPedidos() {
    try {
        showLoading();

        const estado = filtroEstado.value;
        const url = estado 
            ? `/api/pedidos/vendedor?estado=${encodeURIComponent(estado)}`
            : '/api/pedidos/vendedor';

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        hideLoading();

        if (!response.ok) {
            if (response.status === 404) {
                showMessage('No se encontraron pedidos.', 'info');
            } else {
                showMessage('Error al obtener pedidos.', 'error');
            }
            return;
        }

        const pedidos = await response.json();
        renderizarPedidos(pedidos);

    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        showMessage('Error de conexión.', 'error');
    }
}

// Event listeners
btnActualizar.addEventListener('click', obtenerPedidos);
filtroEstado.addEventListener('change', obtenerPedidos);

// Verificar autenticación y cargar pedidos
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.loggedIn || result.user?.rol !== 'vendedor') {
            window.location.href = '/';
            return;
        }

        // Cargar pedidos
        obtenerPedidos();

    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/';
    }
});