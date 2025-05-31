// Variables globales
let isLoading = false;

// Al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initGoogleAuth();
    animateLoginCard();
});

// Eventos
function setupEventListeners() {
    const form = document.getElementById('loginForm');

    form.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleLogin(e);
    });

    form.addEventListener('submit', debounce(handleLogin, 300));
}

// Login tradicional
async function handleLogin(event) {
    event.preventDefault();
    if (isLoading) return;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        setLoadingState(true);

        const response = await fetch('/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const { success, data, message } = await response.json();
        
        if (response.ok && success) {
            showSuccessMessage('¡Bienvenido de vuelta!');
            setTimeout(() => {
                if (data.rol === 'cliente') {
                    window.location.href = '/private/cliente/cliente.html';
                } else if (data.rol === 'vendedor') {
                    window.location.href = '/private/vendedor/vendedor.html';
                }
            }, 1500);
        } else {
            showError(message || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
        setLoadingState(false);
    }
}

// Login con Google
function handleGoogleLogin() {
    window.location.href = "http://localhost:8000/auth/google";
}



// Estados visuales
function setLoadingState(loading, buttonClass = 'btn-primary') {
    isLoading = loading;
    const button = document.querySelector(`.${buttonClass}`);
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Animación
function animateLoginCard() {
    const card = document.querySelector('.login-card');
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';

    setTimeout(() => {
        card.style.transition = 'all 0.6s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
}

// Mensajes de éxito/error
function showSuccessMessage(message) {
    removeMessages();
    const div = document.createElement('div');
    div.className = 'success-alert';
    div.innerHTML = `<span class="success-icon">✅</span><span>${message}</span>`;
    document.getElementById('loginForm').prepend(div);
}

function showError(message) {
    removeMessages();
    const div = document.createElement('div');
    div.className = 'error-alert';
    div.innerHTML = `<span class="error-icon">⚠️</span><span>${message}</span>`;
    document.getElementById('loginForm').prepend(div);
}

function removeMessages() {
    document.querySelectorAll('.success-alert, .error-alert').forEach(el => el.remove());
}

// Utilidad
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
