/**
 * Módulo de autenticación para Taskify (versión mejorada)
 * - Registro con nombre, correo y contraseña
 * - Login con correo + contraseña
 * - Perfil de estudiante completo
 */

// Constantes
const AUTH_STORAGE_KEY = "taskify_user";
const USERS_STORAGE_KEY = "taskify_users";
const MIN_LOADING_TIME = 1000;

// Elementos del DOM
const app = document.getElementById('app');

/**
 * Muestra la pantalla de login/registro
 */
export function renderAuthScreen() {
  app.innerHTML = `
    <div class="login-container fade-in">
      <div class="login-card card-custom">
        <div class="text-center mb-4">
          <h2>Bienvenido a Taskify</h2>
          <p class="text-muted small">Organiza tus tareas académicas</p>
        </div>
        
        <form id="authForm" class="needs-validation" novalidate>
          <!-- Campos de login -->
          <div id="loginFields">
            <div class="mb-3">
              <label for="email" class="form-label">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                class="form-control" 
                placeholder="tu@correo.com"
                required
                pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              >
              <div class="invalid-feedback">Ingresa un correo válido</div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <div class="input-group">
                <input 
                  type="password" 
                  id="password" 
                  class="form-control" 
                  placeholder="••••••••"
                  required
                  minlength="6"
                >
                <button class="btn btn-outline-secondary toggle-password" type="button">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
              <div class="invalid-feedback">La contraseña debe tener al menos 6 caracteres</div>
            </div>
          </div>
          
          <!-- Campos de registro (ocultos inicialmente) -->
          <div id="registerFields" style="display: none;">
            <div class="mb-3">
              <label for="name" class="form-label">Nombre Completo</label>
              <input 
                type="text" 
                id="name" 
                class="form-control" 
                placeholder="Juan Pérez"
                required
              >
              <div class="invalid-feedback">Ingresa tu nombre completo</div>
            </div>
            
            <div class="mb-3">
              <label for="regEmail" class="form-label">Correo electrónico</label>
              <input 
                type="email" 
                id="regEmail" 
                class="form-control" 
                placeholder="tu@correo.com"
                required
                pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              >
              <div class="invalid-feedback">Ingresa un correo válido</div>
            </div>
            
            <div class="mb-3">
              <label for="regPassword" class="form-label">Contraseña</label>
              <div class="input-group">
                <input 
                  type="password" 
                  id="regPassword" 
                  class="form-control" 
                  placeholder="••••••••"
                  required
                  minlength="6"
                >
                <button class="btn btn-outline-secondary toggle-password" type="button">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
              <div class="invalid-feedback">La contraseña debe tener al menos 6 caracteres</div>
            </div>
            
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="termsCheck" required>
              <label class="form-check-label small" for="termsCheck">
                Acepto los <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">términos y condiciones</a>
              </label>
            </div>
          </div>
          
          <button id="authBtn" type="submit" class="btn btn-primary w-100 btn-custom mt-3">
            Ingresar
          </button>
          
          <p id="toggleAuth" class="text-center mt-3 text-muted small">
            ¿No tienes cuenta? <a href="#" class="text-primary">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
    
    <!-- Modal de términos y condiciones -->
    <div class="modal fade" id="termsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Términos y Condiciones</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Al registrarte en Taskify aceptas nuestro uso de cookies y políticas de privacidad.</p>
            <p>Nos comprometemos a proteger tus datos personales y solo usaremos tu información para mejorar tu experiencia en la aplicación.</p>
            <p>No compartiremos tu información con terceros sin tu consentimiento explícito.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupAuthEvents();
}

/**
 * Configura los eventos del formulario
 */
function setupAuthEvents() {
  const authForm = document.getElementById('authForm');
  const toggleAuth = document.getElementById('toggleAuth');
  let isLoginMode = true;

  // Validación en tiempo real
  authForm.addEventListener('input', (e) => {
    if (e.target.matches('input')) {
      validateField(e.target);
    }
  });

  // Toggle para mostrar/ocultar contraseña
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });

  // Submit del formulario
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(authForm, isLoginMode)) return;
    
    if (isLoginMode) {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await handleLogin(email, password);
    } else {
      const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value
      };
      await handleRegister(userData);
    }
  });

  // Cambiar entre login/registro
  toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    updateAuthUI(isLoginMode);
  });
}

/**
 * Maneja el proceso de login
 */
async function handleLogin(email, password) {
  const authBtn = document.getElementById('authBtn');
  
  try {
    authBtn.disabled = true;
    authBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      Ingresando...
    `;
    
    // Simular tiempo de carga
    await Promise.all([
      mockApiRequest(),
      new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))
    ]);
    
    // Buscar usuario por correo
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }
    
    // Guardar sesión (sin guardar la contraseña por seguridad)
    const sessionData = {
      name: user.name,
      email: user.email,
      token: btoa(`${user.email}:${password}`),
      institucion: user.institucion || '',
      matricula: user.matricula || '',
      carrera: user.carrera || '',
      semestre: user.semestre || ''
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    
    // Actualizar navbar
    updateNavbar(sessionData);
    
    // Redirigir a tareas
    window.location.hash = '#tasks';
    
  } catch (error) {
    showAlert('Error', error.message || 'Ocurrió un problema al autenticar', 'danger');
    authBtn.disabled = false;
    authBtn.textContent = isLoginMode ? 'Ingresar' : 'Registrarse';
  }
}

/**
 * Actualiza el navbar con los datos del usuario
 */
function updateNavbar(userData) {
  const navUserName = document.getElementById('navUserName');
  const navProfileBtn = document.getElementById('navProfileBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');
  
  if (navUserName) navUserName.textContent = userData.name;
  if (navProfileBtn) navProfileBtn.classList.remove('d-none');
  if (navLogoutBtn) navLogoutBtn.classList.remove('d-none');
  
  // Configurar evento del botón de perfil
  navProfileBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#profile';
  });
}

/**
 * Maneja el proceso de registro
 */
async function handleRegister(userData) {
  const authBtn = document.getElementById('authBtn');
  
  try {
    authBtn.disabled = true;
    authBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      Registrando...
    `;
    
    await Promise.all([
      mockApiRequest(),
      new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))
    ]);
    
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Este correo ya está registrado');
    }
    
    // Guardar nuevo usuario con campos académicos iniciales
    const completeUserData = {
      ...userData,
      matricula: '', // Se agregará en el perfil
      institucion: '',
      carrera: '',
      semestre: ''
    };
    
    users.push(completeUserData);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    await handleLogin(userData.email, userData.password);
    
  } catch (error) {
    showAlert('Error', error.message || 'Ocurrió un problema al registrarse', 'danger');
    authBtn.disabled = false;
    authBtn.textContent = 'Registrarse';
  }
}

/**
 * Actualiza la UI entre login/registro
 */
function updateAuthUI(isLoginMode) {
  const authBtn = document.getElementById('authBtn');
  const toggleAuth = document.getElementById('toggleAuth');
  const loginFields = document.getElementById('loginFields');
  const registerFields = document.getElementById('registerFields');
  
  if (isLoginMode) {
    loginFields.style.display = 'block';
    registerFields.style.display = 'none';
    authBtn.textContent = 'Ingresar';
    toggleAuth.innerHTML = '¿No tienes cuenta? <a href="#" class="text-primary">Regístrate</a>';
  } else {
    loginFields.style.display = 'none';
    registerFields.style.display = 'block';
    authBtn.textContent = 'Registrarse';
    toggleAuth.innerHTML = '¿Ya tienes cuenta? <a href="#" class="text-primary">Ingresa aquí</a>';
  }
}

/**
 * Valida un campo individual
 */
function validateField(field) {
  if (field.validity.valid) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
  } else {
    field.classList.remove('is-valid');
  }
}

/**
 * Valida todo el formulario
 */
function validateForm(form, isLoginMode) {
  let isValid = true;
  
  if (isLoginMode) {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    if (!email.validity.valid) {
      email.classList.add('is-invalid');
      isValid = false;
    }
    
    if (password.value.length < 6) {
      password.classList.add('is-invalid');
      isValid = false;
    }
  } else {
    const fields = form.querySelectorAll('#registerFields input[required]');
    
    fields.forEach(field => {
      if (!field.validity.valid) {
        field.classList.add('is-invalid');
        isValid = false;
      }
    });
    
    // Validar términos y condiciones
    const termsCheck = document.getElementById('termsCheck');
    if (!termsCheck.checked) {
      termsCheck.classList.add('is-invalid');
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Muestra alertas con animación
 */
function showAlert(title, text, type) {
  // Eliminar alertas anteriores
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.classList.add('fade-out');
    setTimeout(() => existingAlert.remove(), 300);
  }
  
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show slide-in" role="alert">
      <div class="d-flex align-items-center">
        <i class="bi ${type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2"></i>
        <div>
          <strong>${title}</strong> ${text}
        </div>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  // Insertar alerta en el formulario
  const form = document.getElementById('authForm');
  form.insertAdjacentHTML('afterbegin', alertHtml);
  
  // Eliminar alerta después de 5 segundos
  setTimeout(() => {
    const alert = document.querySelector('.alert.slide-in');
    if (alert) {
      alert.classList.remove('slide-in');
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 300);
    }
  }, 5000);
}

/**
 * Simula una petición API
 */
function mockApiRequest() {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}