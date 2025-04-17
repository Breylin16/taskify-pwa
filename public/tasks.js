/**
 * Módulo de gestión de tareas para Taskify (versión mejorada)
 */

// Constantes
const TASKS_STORAGE_KEY = "taskify_tasks";
const STATUS = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
};

// Variables globales
let currentEditingId = null;

// Elementos del DOM
const app = document.getElementById('app');

/**
 * Renderiza la pantalla principal de tareas
 */
export function renderTasksScreen() {
  const user = JSON.parse(localStorage.getItem('taskify_user'));
  
  app.innerHTML = `
    <div class="tasks-container fade-in">
      <!-- Header centrado -->
      <div class="d-flex justify-content-center mb-4">
        <h2 class="text-center">Gestión de Tareas</h2>
      </div>
      
      <div class="row g-4">
        <!-- Columna izquierda - Crear/Editar tarea -->
        <div class="col-lg-4">
          <div class="card card-custom h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0" id="formTitle">Crear Nueva Tarea</h5>
            </div>
            <div class="card-body">
              <form id="taskForm">
                <input type="hidden" id="taskId">
                <div class="mb-3">
                  <label for="taskTitle" class="form-label">Título</label>
                  <input 
                    type="text" 
                    id="taskTitle" 
                    class="form-control" 
                    placeholder="Nombre de la tarea"
                    required
                    maxlength="50"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="taskDescription" class="form-label">Descripción corta</label>
                  <textarea 
                    id="taskDescription" 
                    class="form-control" 
                    rows="3"
                    placeholder="Breve descripción de la tarea"
                    maxlength="200"
                  ></textarea>
                </div>
                
                <div class="row g-2">
                  <div class="col-md-6 mb-3">
                    <label for="taskDate" class="form-label">Fecha</label>
                    <input 
                      type="date" 
                      id="taskDate" 
                      class="form-control"
                      required
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="taskTime" class="form-label">Hora</label>
                    <input 
                      type="time" 
                      id="taskTime" 
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mt-2" id="submitBtn">
                  <i class="bi bi-plus-circle"></i> Crear Tarea
                </button>
                <button type="button" class="btn btn-outline-secondary w-100 mt-2 d-none" id="cancelEditBtn">
                  Cancelar Edición
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Columna derecha - Listado de tareas (más ancha) -->
        <div class="col-lg-8">
          <div class="card card-custom h-100">
            <div class="card-header bg-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Listado de Tareas</h5>
                <div class="d-flex">
                  <input 
                    type="text" 
                    id="searchInput" 
                    class="form-control form-control-sm me-2" 
                    placeholder="Buscar..."
                    style="width: 150px;"
                  >
                  <select id="filterSelect" class="form-select form-select-sm" style="width: 120px;">
                    <option value="all">Todas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Completada">Completadas</option>
                    <option value="Cancelada">Canceladas</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="alert alert-warning py-2 mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <small>Importante: Las tareas se listan dependiendo de la fecha programada.</small>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th width="50">No.</th>
                      <th>Título</th>
                      <th>Descripción</th>
                      <th width="150">Programada</th>
                      <th width="100">Estado</th>
                      <th width="120">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="tasksTableBody">
                    <!-- Las tareas se cargarán aquí -->
                  </tbody>
                </table>
              </div>
              
              <div id="emptyState" class="text-center py-5 text-muted">
                <i class="bi bi-check-all" style="font-size: 2rem;"></i>
                <p class="mt-2">No hay tareas registradas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupTasksEvents();
  loadAndRenderTasks();
}

/**
 * Muestra el perfil del estudiante con diseño mejorado
 */
export function renderProfile() {
  const user = JSON.parse(localStorage.getItem('taskify_user'));
  const users = JSON.parse(localStorage.getItem('taskify_users')) || [];
  const userData = users.find(u => u.email === user.email) || {};
  
  // Valores por defecto
  userData.matricula = userData.matricula || '';
  userData.institucion = userData.institucion || '';
  userData.carrera = userData.carrera || '';
  userData.semestre = userData.semestre || '';

  app.innerHTML = `
    <div class="profile-container fade-in">
      <div class="card card-custom">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Perfil del Estudiante</h3>
          <button class="btn btn-sm btn-outline-light" id="backToTasksBtn">
            <i class="bi bi-arrow-left"></i> Volver
          </button>
        </div>
        <div class="card-body">
          <div class="d-flex flex-column align-items-center mb-4">
            <div class="profile-avatar mb-3">
              <i class="bi bi-person-circle"></i>
            </div>
            <h4 class="text-center">${user.name}</h4>
            <small class="text-muted">${user.email}</small>
          </div>
          
          <!-- Información Académica -->
          <div class="card mb-4">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Información Académica</h5>
              <button class="btn btn-sm btn-outline-primary" id="editAcademicBtn">
                <i class="bi bi-pencil"></i> Editar
              </button>
            </div>
            <div class="card-body">
              <div id="academicInfoView">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-1">Institución</h6>
                    <p id="institutionView">${userData.institucion || 'No especificada'}</p>
                  </div>
                  <div class="col-md-6">
                    <h6 class="text-muted mb-1">Matrícula</h6>
                    <p id="matriculaView">${userData.matricula || 'No especificada'}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-1">Carrera</h6>
                    <p id="careerView">${userData.carrera || 'No especificada'}</p>
                  </div>
                  <div class="col-md-6">
                    <h6 class="text-muted mb-1">Cuatrimestre</h6>
                    <p id="semesterView">${userData.Cuatrimestre ? userData.cuatrimestre + (userData.Cuatrimestre == 1 ? 'er' : 'to') + ' Cuatrimestre' : 'No especificado'}</p>
                  </div>
                </div>
              </div>
              
              <form id="academicForm" class="d-none">
                <div class="mb-3">
                  <label for="institutionInput" class="form-label">Institución Académica</label>
                  <input 
                    type="text" 
                    id="institutionInput" 
                    class="form-control" 
                    value="${userData.institucion}"
                    placeholder="Nombre de tu universidad/instituto"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="matriculaInput" class="form-label">Matrícula</label>
                  <input 
                    type="text" 
                    id="matriculaInput" 
                    class="form-control" 
                    value="${userData.matricula}"
                    placeholder="Tu número de matrícula"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="careerInput" class="form-label">Carrera</label>
                  <input 
                    type="text" 
                    id="careerInput" 
                    class="form-control" 
                    value="${userData.carrera}"
                    placeholder="Tu carrera de estudio"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="semesterInput" class="form-label">Cuatrimestre</label>
                  <select id="semesterInput" class="form-select">
                    <option value="">Seleccione un Cuatrimeste</option>
                    ${Array.from({length: 12}, (_, i) => `
                      <option value="${i+1}" ${userData.Cuatrimestre == i+1 ? 'selected' : ''}>
                        ${i+1}${i+1 === 1 ? 'er' : 'to'} Cuatrimeste
                      </option>
                    `).join('')}
                  </select>
                </div>
                
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" id="cancelAcademicEditBtn">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" id="saveAcademicBtn">
                    <i class="bi bi-save"></i> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Seguridad - Acordeón -->
          <div class="accordion" id="securityAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#securityCollapse">
                  <i class="bi bi-shield-lock me-2"></i> Seguridad y Cuenta
                </button>
              </h2>
              <div id="securityCollapse" class="accordion-collapse collapse" data-bs-parent="#securityAccordion">
                <div class="accordion-body">
                  <form id="passwordForm">
                    <div class="mb-3">
                      <label for="currentPassword" class="form-label">Contraseña Actual</label>
                      <div class="input-group">
                        <input 
                          type="password" 
                          id="currentPassword" 
                          class="form-control" 
                          required
                          minlength="6"
                        >
                        <button class="btn btn-outline-secondary toggle-password" type="button">
                          <i class="bi bi-eye"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <label for="newPassword" class="form-label">Nueva Contraseña</label>
                      <div class="input-group">
                        <input 
                          type="password" 
                          id="newPassword" 
                          class="form-control" 
                          required
                          minlength="6"
                        >
                        <button class="btn btn-outline-secondary toggle-password" type="button">
                          <i class="bi bi-eye"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
                      <div class="input-group">
                        <input 
                          type="password" 
                          id="confirmPassword" 
                          class="form-control" 
                          required
                          minlength="6"
                        >
                        <button class="btn btn-outline-secondary toggle-password" type="button">
                          <i class="bi bi-eye"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="d-grid gap-2">
                      <button type="submit" class="btn btn-primary">
                        <i class="bi bi-key"></i> Cambiar Contraseña
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Configurar eventos
  setupProfileEvents();
}

/**
 * Configura los eventos de la interfaz de tareas
 */
function setupTasksEvents() {
  // Formulario de tarea
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  
  // Cancelar edición
  document.getElementById('cancelEditBtn')?.addEventListener('click', cancelEdit);
  
  // Filtros y búsqueda
  document.getElementById('searchInput').addEventListener('input', debounce(loadAndRenderTasks, 300));
  document.getElementById('filterSelect').addEventListener('change', loadAndRenderTasks);
}

/**
 * Configura los eventos del perfil
 */
function setupProfileEvents() {
  // Volver a tareas
  document.getElementById('backToTasksBtn').addEventListener('click', () => {
    window.location.hash = '#tasks';
  });
  
  // Toggle para mostrar/ocultar contraseña
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
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
  
  // Editar información académica
  document.getElementById('editAcademicBtn').addEventListener('click', () => {
    document.getElementById('academicInfoView').classList.add('d-none');
    document.getElementById('academicForm').classList.remove('d-none');
    document.getElementById('editAcademicBtn').classList.add('d-none');
  });
  
  // Cancelar edición académica
  document.getElementById('cancelAcademicEditBtn').addEventListener('click', () => {
    document.getElementById('academicInfoView').classList.remove('d-none');
    document.getElementById('academicForm').classList.add('d-none');
    document.getElementById('editAcademicBtn').classList.remove('d-none');
  });
  
  // Guardar información académica
  document.getElementById('academicForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveAcademicInfo();
  });
  
  // Cambiar contraseña
  document.getElementById('passwordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handlePasswordChange();
  });
}

/**
 * Maneja el envío del formulario (crear/editar tarea)
 */
function handleTaskSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  
  if (!title || !date || !time) {
    showAlert('Error', 'Debes completar los campos requeridos', 'danger');
    return;
  }
  
  if (currentEditingId) {
    // Editar tarea existente
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === currentEditingId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        date,
        time
      };
      
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      showAlert('Éxito', 'Tarea actualizada correctamente', 'success');
    }
  } else {
    // Crear nueva tarea
    const newTask = {
      id: Date.now(),
      title,
      description,
      date,
      time,
      status: STATUS.PENDING,
      createdAt: new Date().toISOString()
    };
    
    saveTask(newTask);
    showAlert('Éxito', 'Tarea creada correctamente', 'success');
  }
  
  resetForm();
  loadAndRenderTasks();
}

/**
 * Guarda la información académica del usuario
 */
function saveAcademicInfo() {
  const user = JSON.parse(localStorage.getItem('taskify_user'));
  const users = JSON.parse(localStorage.getItem('taskify_users')) || [];
  const userIndex = users.findIndex(u => u.email === user.email);
  
  if (userIndex !== -1) {
    const saveBtn = document.getElementById('saveAcademicBtn');
    const originalText = saveBtn.innerHTML;
    
    // Mostrar estado de carga
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      Guardando...
    `;
    
    // Simular tiempo de guardado
    setTimeout(() => {
      const newInstitution = document.getElementById('institutionInput').value;
      const newMatricula = document.getElementById('matriculaInput').value;
      const newCareer = document.getElementById('careerInput').value;
      const newSemester = document.getElementById('semesterInput').value;
      
      users[userIndex] = {
        ...users[userIndex],
        institucion: newInstitution,
        matricula: newMatricula,
        carrera: newCareer,
        semestre: newSemester
      };
      
      localStorage.setItem('taskify_users', JSON.stringify(users));
      
      // Actualizar datos en la sesión actual
      const currentUser = JSON.parse(localStorage.getItem('taskify_user'));
      currentUser.institucion = newInstitution;
      currentUser.matricula = newMatricula;
      currentUser.carrera = newCareer;
      currentUser.semestre = newSemester;
      localStorage.setItem('taskify_user', JSON.stringify(currentUser));
      
      // Actualizar la vista
      document.getElementById('institutionView').textContent = newInstitution || 'No especificada';
      document.getElementById('matriculaView').textContent = newMatricula || 'No especificada';
      document.getElementById('careerView').textContent = newCareer || 'No especificada';
      document.getElementById('semesterView').textContent = newSemester ? 
        `${newSemester}${newSemester == 1 ? 'er' : 'to'} Semestre` : 'No especificado';
      
      // Volver al modo de visualización
      document.getElementById('academicInfoView').classList.remove('d-none');
      document.getElementById('academicForm').classList.add('d-none');
      document.getElementById('editAcademicBtn').classList.remove('d-none');
      
      // Mostrar confirmación
      showSuccessToast('Información académica actualizada correctamente');
      
      // Restaurar botón
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }, 800);
  }
}

/**
 * Maneja el cambio de contraseña
 */
function handlePasswordChange() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validaciones
  if (newPassword !== confirmPassword) {
    showAlert('Error', 'Las contraseñas no coinciden', 'danger');
    return;
  }
  
  if (newPassword.length < 6) {
    showAlert('Error', 'La contraseña debe tener al menos 6 caracteres', 'danger');
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('taskify_user'));
  const users = JSON.parse(localStorage.getItem('taskify_users')) || [];
  const userIndex = users.findIndex(u => u.email === user.email);
  
  if (userIndex === -1) {
    showAlert('Error', 'Usuario no encontrado', 'danger');
    return;
  }
  
  // Verificar contraseña actual
  if (users[userIndex].password !== currentPassword) {
    showAlert('Error', 'Contraseña actual incorrecta', 'danger');
    return;
  }
  
  // Actualizar contraseña
  users[userIndex].password = newPassword;
  localStorage.setItem('taskify_users', JSON.stringify(users));
  
  // Actualizar token de sesión
  const updatedUser = {
    ...user,
    token: btoa(`${user.email}:${newPassword}`)
  };
  localStorage.setItem('taskify_user', JSON.stringify(updatedUser));
  
  // Limpiar formulario
  document.getElementById('passwordForm').reset();
  
  // Mostrar notificación de éxito
  showSuccessToast('Contraseña actualizada correctamente');
}

/**
 * Muestra un toast de éxito
 */
function showSuccessToast(message) {
  const toastHtml = `
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-success text-white">
          <strong class="me-auto">Éxito</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <i class="bi bi-check-circle-fill me-2"></i> ${message}
        </div>
      </div>
    </div>
  `;
  
  // Insertar toast en el DOM
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  
  // Eliminar toast después de 5 segundos
  setTimeout(() => {
    const toast = document.querySelector('.toast');
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

/**
 * Carga y renderiza las tareas con filtros
 */
function loadAndRenderTasks() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filterValue = document.getElementById('filterSelect').value;
  
  let tasks = getTasks();
  
  // Ordenar por fecha más cercana primero
  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Aplicar filtros
  tasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                         task.description.toLowerCase().includes(searchTerm);
    const matchesFilter = filterValue === 'all' || task.status === filterValue;
    
    return matchesSearch && matchesFilter;
  });
  
  renderTasks(tasks);
}

/**
 * Renderiza las tareas en la tabla
 */
function renderTasks(tasks) {
  const tableBody = document.getElementById('tasksTableBody');
  const emptyState = document.getElementById('emptyState');
  
  if (tasks.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }
  
  emptyState.classList.add('d-none');
  
  tableBody.innerHTML = tasks.map((task, index) => `
    <tr data-id="${task.id}">
      <td>${index + 1}</td>
      <td>${task.title}</td>
      <td class="text-truncate" style="max-width: 200px;" title="${task.description}">
        ${task.description || '-'}
      </td>
      <td>
        ${formatDate(task.date)}<br>
        <small class="text-muted">${task.time}</small>
      </td>
      <td>
        <span class="badge ${getStatusBadgeClass(task.status)}">
          ${task.status}
        </span>
      </td>
      <td>
        <div class="d-flex action-buttons">
          ${task.status === STATUS.PENDING ? `
            <button class="btn btn-sm btn-link p-0 me-1 complete-btn" title="Realizar" data-id="${task.id}">
              <i class="bi bi-check-circle-fill text-success"></i>
            </button>
            <button class="btn btn-sm btn-link p-0 me-1 cancel-btn" title="Cancelar" data-id="${task.id}">
              <i class="bi bi-x-circle-fill text-danger"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-link p-0 me-1 edit-btn" title="Editar" data-id="${task.id}">
            <i class="bi bi-pencil-fill text-primary"></i>
          </button>
          <button class="btn btn-sm btn-link p-0 delete-btn" title="Eliminar" data-id="${task.id}">
            <i class="bi bi-trash-fill text-danger"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  // Configurar eventos de los botones
  setupActionButtons();
}

/**
 * Configura los eventos de los botones de acción
 */
function setupActionButtons() {
  // Completar tarea
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.currentTarget.dataset.id);
      updateTaskStatus(taskId, STATUS.COMPLETED);
    });
  });
  
  // Cancelar tarea
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.currentTarget.dataset.id);
      updateTaskStatus(taskId, STATUS.CANCELLED);
    });
  });
  
  // Editar tarea
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.currentTarget.dataset.id);
      editTask(taskId);
    });
  });
  
  // Eliminar tarea
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.currentTarget.dataset.id);
      showDeleteConfirmation(taskId);
    });
  });
}

/**
 * Actualiza el estado de una tarea
 */
function updateTaskStatus(taskId, newStatus) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    loadAndRenderTasks();
    
    const statusText = newStatus === STATUS.COMPLETED ? 'completada' : 'cancelada';
    showAlert('Éxito', `Tarea ${statusText} correctamente`, 'success');
  }
}

/**
 * Prepara el formulario para editar una tarea
 */
function editTask(taskId) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    currentEditingId = taskId;
    
    // Llenar el formulario
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskTime').value = task.time;
    
    // Cambiar el texto del formulario
    document.getElementById('formTitle').textContent = 'Editar Tarea';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-save"></i> Guardar Cambios';
    document.getElementById('cancelEditBtn').classList.remove('d-none');
    
    // Desplazar al formulario
    document.getElementById('taskTitle').focus();
  }
}

/**
 * Cancela el modo de edición
 */
function cancelEdit() {
  resetForm();
}

/**
 * Muestra confirmación para eliminar tarea
 */
function showDeleteConfirmation(taskId) {
  const modalHtml = `
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar esta tarea?</p>
            <p class="text-muted small">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Insertar modal en el DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
  
  // Configurar evento de eliminación
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    deleteTask(taskId);
    modal.hide();
  });
  
  // Limpiar modal al cerrar
  document.getElementById('deleteModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('deleteModal').remove();
  });
}

/**
 * Elimina una tarea
 */
function deleteTask(taskId) {
  const tasks = getTasks().filter(task => task.id !== taskId);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  loadAndRenderTasks();
  showAlert('Éxito', 'Tarea eliminada correctamente', 'success');
}

/**
 * Resetea el formulario
 */
function resetForm() {
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('formTitle').textContent = 'Crear Nueva Tarea';
  document.getElementById('submitBtn').innerHTML = '<i class="bi bi-plus-circle"></i> Crear Tarea';
  document.getElementById('cancelEditBtn').classList.add('d-none');
  currentEditingId = null;
}

/**
 * Guarda una tarea en localStorage
 */
function saveTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Obtiene todas las tareas de localStorage
 */
function getTasks() {
  const tasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
  return tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Formatea la fecha a dd/mm/aaaa
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Obtiene la clase CSS para el badge de estado
 */
function getStatusBadgeClass(status) {
  const classes = {
    [STATUS.PENDING]: 'bg-warning text-dark',
    [STATUS.COMPLETED]: 'bg-success',
    [STATUS.CANCELLED]: 'bg-danger'
  };
  return classes[status] || 'bg-secondary';
}

/**
 * Muestra alertas con animación
 */
function showAlert(title, text, type) {
  // Eliminar alertas anteriores
  const existingAlert = document.querySelector('.alert:not(.alert-warning)');
  if (existingAlert) {
    existingAlert.classList.add('fade-out');
    setTimeout(() => existingAlert.remove(), 300);
  }
  
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show slide-in" role="alert">
      <strong>${title}</strong> ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  // Insertar alerta en el contenedor principal
  app.insertAdjacentHTML('afterbegin', alertHtml);
  
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
 * Debounce para optimizar búsquedas
 */
function debounce(func, wait) {
  let timeout; 
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const navigateTo = (view) => {
  const app = document.getElementById('app');
  app.classList.add('fade-out');
  
  setTimeout(() => {
    app.innerHTML = '';
    switch(view) {
      // ... casos anteriores
    }
    app.classList.remove('fade-out');
    updateActiveButton(view);
  }, 300);
};