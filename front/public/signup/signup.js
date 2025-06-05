// Variables globales
let selectedUserType = null;
let isLoading = false;
let validationTimeouts = {};

// Configuración de la aplicación
const CONFIG = {
    API_BASE_URL: '/api',
    REDIRECT_URLS: {
        login: '/login.html',
        dashboard: '/dashboard',
        completeProfile: '/complete-profile.html'
    },
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 8,
        PHONE_REGEX: /^[\+]?[0-9\s\-\(\)]+$/,
        TAX_ID_REGEX: /^[0-9]{8,11}$/
    }
};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Inicializar la aplicación
function initializeApp() {
    // Verificar si hay datos OAuth temporales
    const oauthData = localStorage.getItem('tempOAuthData');
    if (oauthData) {
        populateOAuthData(JSON.parse(oauthData));
    }
    // Mostrar animación de entrada
    animateSignupCard();
}

// Configurar event listeners
function setupEventListeners() {
    const form = document.getElementById('signupForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Validación en tiempo real para cada campo
    inputs.forEach(input => {
        switch(input.type) {
            case 'email':
                input.addEventListener('blur', validateEmail);
                break;
            case 'password':
                input.addEventListener('input', validatePassword);
                break;
            case 'tel':
                input.addEventListener('blur', validatePhone);
                break;
            case 'text':
                if (input.id === 'taxId') {
                    input.addEventListener('blur', validateTaxId);
                }
                break;
        }
        
        // Validación general al perder foco
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Validación de confirmación de contraseña
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordConfirmation);
    
    // Checkbox de términos y condiciones
    document.getElementById('terms').addEventListener('change', updateSubmitButton);
    
    // Envío del formulario
    form.addEventListener('submit', debounce(handleSignUp, 300));
}

// Selección de tipo de usuario
function selectUserType(type) {
    selectedUserType = type;
    
    // Actualizar UI
    document.querySelectorAll('.user-type-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    
    // Mostrar/ocultar campos específicos
    toggleConditionalFields(type);
    
    // Actualizar estado del botón
    updateSubmitButton();
}

// Mostrar/ocultar campos condicionales
function toggleConditionalFields(type) {
    const buyerFields = document.getElementById('buyerFields');
    const sellerFields = document.getElementById('sellerFields');
    
    // Ocultar ambos primero
    buyerFields.classList.remove('show');
    sellerFields.classList.remove('show');
    
    // Mostrar el correspondiente
    setTimeout(() => {
        if (type === 'comprador') {
            buyerFields.classList.add('show');
            setRequiredFields('comprador');
        } else if (type === 'vendedor') {
            sellerFields.classList.add('show');
            setRequiredFields('vendedor');
        }
    }, 100);
}

// Establecer campos requeridos según tipo de usuario
function setRequiredFields(userType) {
    // Limpiar todos los requeridos condicionales
    document.querySelectorAll('.conditional-fields input, .conditional-fields select').forEach(field => {
        field.removeAttribute('required');
    });
    
    if (userType === 'vendedor') {
        // Campos requeridos para vendedores
        document.getElementById('businessName').setAttribute('required', '');
        document.getElementById('businessType').setAttribute('required', '');
        document.getElementById('taxId').setAttribute('required', '');
        document.getElementById('businessAddress').setAttribute('required', '');
        document.getElementById('category').setAttribute('required', '');
    }
}

// Manejo del registro tradicional
async function handleSignUp(event) {
    event.preventDefault();
    
    if (isLoading) return;

    if (!validateCompleteForm()) {
        showError('Por favor corrige los errores en el formulario');
        return;
    }

    try {
        setLoadingState(true);

        const formData = collectFormData();

        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showSuccessMessage('¡Cuenta creada exitosamente!');
            setTimeout(() => {
                if (formData.rol === 'cliente') {
                    window.location.href = '/private/cliente/cliente.html';
                } else {
                    window.location.href = '/private/vendedor/vendedor.html';
                }
            }, 1500);
        } else {
            showError(data.message || 'Error al registrar usuario.');
        }

    } catch (error) {
        console.error('Error en registro:', error);
        showError('Error de conexión o del servidor.');
    } finally {
        setLoadingState(false);
    }
}


function collectFormData() {
    const formData = {
        rol: selectedUserType === 'comprador' ? 'cliente' : 'vendedor', 
        nombre: document.getElementById('fullName').value.trim(), 
        correo: document.getElementById('email').value.trim().toLowerCase(), 
        telefono: document.getElementById('phone').value.trim(), 
        contraseña: document.getElementById('password').value 
    };

    // Agregar campos específicos según tipo de usuario
    if (selectedUserType === 'comprador') {
        formData.direccionEntrega = document.getElementById('address').value.trim(); 
        formData.fechaNacimiento = document.getElementById('birthDate').value; 

    } else if (selectedUserType === 'vendedor') {
        formData.nombreTienda = document.getElementById('businessName').value.trim(); 
        formData.tipoNegocio = document.getElementById('businessType').value; 
        formData.rucDni = document.getElementById('taxId').value.trim(); 
        formData.direccionNegocio = document.getElementById('businessAddress').value.trim(); 
        formData.categoriaPrincipal = document.getElementById('category').value; 

    }

    return formData;
}


// Validaciones
function validateCompleteForm() {
    let isValid = true;
    
    // Verificar que se haya seleccionado tipo de usuario
    if (!selectedUserType) {
        showError('Por favor selecciona si eres comprador o vendedor');
        return false;
    }
    
    // Validar campos básicos
    const requiredFields = ['fullName', 'email', 'phone', 'password', 'confirmPassword'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validar campos específicos según tipo de usuario
    if (selectedUserType === 'vendedor') {
        const sellerFields = ['businessName', 'businessType', 'taxId', 'businessAddress', 'category'];
        sellerFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!validateField(field)) {
                isValid = false;
            }
        });
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    let isValid = true;
    let message = '';
    
    // Validaciones específicas por tipo de campo
    switch (fieldId) {
        case 'fullName':
            isValid = value.length >= 2;
            message = isValid ? '' : 'El nombre debe tener al menos 2 caracteres';
            break;
            
        case 'email':
            return validateEmail({ target: field });
            
        case 'phone':
            return validatePhone({ target: field });
            
        case 'password':
            return validatePassword({ target: field });
            
        case 'confirmPassword':
            return validatePasswordConfirmation({ target: field });
            
        case 'taxId':
            return validateTaxId({ target: field });
            
        case 'businessName':
            isValid = value.length >= 2;
            message = isValid ? '' : 'El nombre del negocio debe tener al menos 2 caracteres';
            break;
            
        case 'businessType':
        case 'category':
            isValid = value !== '';
            message = isValid ? '' : 'Por favor selecciona una opción';
            break;
            
        case 'businessAddress':
            isValid = value.length >= 5;
            message = isValid ? '' : 'La dirección debe tener al menos 5 caracteres';
            break;
            
        default:
            // Para campos no requeridos o validaciones básicas
            if (field.hasAttribute('required')) {
                isValid = value.length > 0;
                message = isValid ? '' : 'Este campo es requerido';
            }
    }
    
    setFieldValidation(fieldId, isValid, message);
    return isValid;
}

function validateEmail(event) {
    const email = event.target.value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    setFieldValidation('email', isValid, isValid ? '' : 'Por favor ingresa un email válido');
    return isValid;
}

function validatePhone(event) {
    const phone = event.target.value.trim();
    const isValid = CONFIG.VALIDATION.PHONE_REGEX.test(phone) && phone.length >= 8;
    
    setFieldValidation('phone', isValid, isValid ? '' : 'Por favor ingresa un teléfono válido');
    return isValid;
}

function validatePassword(event) {
    const password = event.target.value;
    const minLength = CONFIG.VALIDATION.PASSWORD_MIN_LENGTH;
    
    let isValid = true;
    let message = '';
    
    if (password.length < minLength) {
        isValid = false;
        message = `La contraseña debe tener al menos ${minLength} caracteres`;
    } else if (!/(?=.*[a-z])/.test(password)) {
        isValid = false;
        message = 'La contraseña debe incluir al menos una letra minúscula';
    } else if (!/(?=.*[A-Z])/.test(password)) {
        isValid = false;
        message = 'La contraseña debe incluir al menos una letra mayúscula';
    } else if (!/(?=.*\d)/.test(password)) {
        isValid = false;
        message = 'La contraseña debe incluir al menos un número';
    }
    
    setFieldValidation('password', isValid, message);
    
    // También validar confirmación si existe
    const confirmField = document.getElementById('confirmPassword');
    if (confirmField.value) {
        validatePasswordConfirmation({ target: confirmField });
    }
    
    return isValid;
}

function validatePasswordConfirmation(event) {
    const confirmation = event.target.value;
    const password = document.getElementById('password').value;
    const isValid = confirmation === password && confirmation.length > 0;
    
    setFieldValidation('confirmPassword', isValid, isValid ? '' : 'Las contraseñas no coinciden');
    return isValid;
}

function validateTaxId(event) {
    const taxId = event.target.value.trim();
    const isValid = CONFIG.VALIDATION.TAX_ID_REGEX.test(taxId);
    
    setFieldValidation('taxId', isValid, isValid ? '' : 'Ingresa un RUC/DNI válido (8-11 dígitos)');
    return isValid;
}




// Manejo de estados de UI
function setFieldValidation(fieldId, isValid, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Remover clases previas
    formGroup.classList.remove('error', 'success');
    
    // Remover mensaje de error previo
    const prevError = formGroup.querySelector('.error-message');
    if (prevError) {
        prevError.remove();
    }
    
    if (!isValid && message) {
        // Agregar clase de error
        formGroup.classList.add('error');
        
        // Agregar mensaje de error
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        formGroup.appendChild(errorElement);
    } else if (isValid && field.value.trim()) {
        formGroup.classList.add('success');
    }
    
    // Actualizar estado del botón
    updateSubmitButton();
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

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

function updateSubmitButton() {
    const button = document.getElementById('signupBtn');
    const termsChecked = document.getElementById('terms').checked;
    const hasUserType = selectedUserType !== null;
    
    button.disabled = !termsChecked || !hasUserType || isLoading;
}

function showError(message) {
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-alert';
    errorDiv.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span>${message}</span>
    `;
    
    const form = document.getElementById('signupForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Scroll al top para mostrar el error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-remover después de 7 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 7000);
}

function showSuccessMessage(message) {
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-alert';
    successDiv.innerHTML = `
        <span class="success-icon">✅</span>
        <span>${message}</span>
    `;
    
    const form = document.getElementById('signupForm');
    form.insertBefore(successDiv, form.firstChild);
    
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeMessages() {
    const alerts = document.querySelectorAll('.error-alert, .success-alert');
    alerts.forEach(alert => alert.remove());
}

function handleRegistrationError(response) {
    if (response.errors && Array.isArray(response.errors)) {
        // Errores específicos de campos
        response.errors.forEach(error => {
            if (error.field) {
                setFieldValidation(error.field, false, error.message);
            }
        });
        showError('Por favor corrige los errores marcados');
    } else {
        // Error general
        showError(response.message || 'Error al crear la cuenta');
    }
}

// Manejo de autenticación
function saveAuthData(data) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userType', data.userType);
    localStorage.setItem('userName', data.name);
    
    // Guardar tiempo de expiración
    const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 horas
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    
    // Limpiar datos temporales de OAuth
    localStorage.removeItem('tempOAuthData');
}

function isValidToken(token) {
    if (!token) return false;
    
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return false;
    
    return new Date().getTime() < parseInt(expiration);
}

// Navegación
function goBack() {
    window.location.href = "https://fsar-render.onrender.com/login/login.html";
}


// Poblar datos OAuth si existen
function populateOAuthData(oauthData) {
    document.getElementById('fullName').value = oauthData.name || '';
    document.getElementById('email').value = oauthData.email || '';
    
    // Hacer readonly los campos que vienen de OAuth
    document.getElementById('email').setAttribute('readonly', true);
    document.getElementById('fullName').setAttribute('readonly', true);
    
    // Mostrar mensaje informativo
    showSuccessMessage('Datos de Google cargados. Completa la información restante.');
}

// Utilidades
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function animateSignupCard() {
    const card = document.querySelector('.signup-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.8s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
}

// Manejo de errores globales y conectividad
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
});

window.addEventListener('online', function() {
    removeMessages();
    showSuccessMessage('Conexión restaurada');
});

window.addEventListener('offline', function() {
    showError('Sin conexión a internet. Algunos datos no se guardarán.');
});

// Exportar funciones para testing (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePhone,
        validatePassword,
        validatePasswordConfirmation,
        validateTaxId,
        collectFormData
    };
}