// Referencias del DOM
const form = document.getElementById('producto-form');
const messageElement = document.getElementById('message');
const messageText = document.getElementById('message-text');
var id_vendedor;
/**
 * Mostrar mensaje al usuario
 */
function showMessage(message, type = 'success') {
    messageText.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.classList.remove('hidden');
    
    // Scroll al mensaje
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Ocultar mensaje
 */
function hideMessage() {
    messageElement.classList.add('hidden');
}

/**
 * Limpiar formulario
 */
function limpiarFormulario() {
    form.reset();
}

/**
 * Enviar producto al backend
 */
async function guardarProducto(datosProducto) {
    try {
        const response = await fetch('/api/vendedor/guardarProducto', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
           // credentials: 'include', // Para enviar cookies de sesión
            body: JSON.stringify(datosProducto)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('¡Producto guardado exitosamente!', 'success');
            limpiarFormulario();
            
            // Opcional: redirigir después de unos segundos
            setTimeout(() => {
                window.location.href = 'vendedor.html';
            }, 2000);
            
        } else {
            showMessage(result.message || 'Error al guardar el producto', 'error');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión. Intenta nuevamente.', 'error');
    }
}

/**
 * Manejar envío del formulario
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    // Obtener datos del formulario
    const formData = new FormData(form);
    const datosProducto = {
        nombre: formData.get('nombre').trim(),
        descripcion: formData.get('descripcion').trim(),
        precio: parseFloat(formData.get('precio')),
        categoria: formData.get('categoria'),
        imagen: formData.get('imagen') ? formData.get('imagen').name : null,
        vendedorId: id_vendedor // Asignar ID del vendedor
    };

    // Validaciones básicas
    if (!datosProducto.nombre) {
        showMessage('El nombre del producto es obligatorio', 'error');
        return;
    }

    if (!datosProducto.precio || datosProducto.precio <= 0) {
        showMessage('El precio debe ser mayor a 0', 'error');
        return;
    }

    // Deshabilitar botón mientras se guarda
    const submitBtn = form.querySelector('.btn-guardar');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    // Enviar al backend
    await guardarProducto(datosProducto);

    // Rehabilitar botón
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
});
// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        id_vendedor = result.user.id;
        if (!result.loggedIn || result.user?.rol !== 'vendedor') {
            window.location.href = '/';
        }

    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/';
    }
});