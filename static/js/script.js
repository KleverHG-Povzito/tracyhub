const grupos = ["lalohlz", "unknown", "heizemod", "sirplease"];

let timestampUltimaActualizacion = 0; // Se actualizará desde el servidor

function actualizarContador() {
  if (timestampUltimaActualizacion > 0) {
    const ahora = Math.floor(Date.now() / 1000);
    const segundos = ahora - timestampUltimaActualizacion;
    const elemento = document.getElementById("ultima-actualizacion");
    
    // <<< ESTE console.log TE AYUDARÁ A VER EL CONTADOR EN TIEMPO REAL
    console.log(`Contador: Ahora=${ahora}, UltimaActualizacion=${timestampUltimaActualizacion}, Segundos=${segundos}`); 
    
    if (elemento) {
      const texto = `Actualizado hace ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
      elemento.textContent = texto;
    }
  }
}


function actualizarTodo() {
  grupos.forEach(actualizarGrupo);
}

// Función para mostrar el modal con la IP
function mostrarModalIP(serverName, ipCompleta) {
  // Crear el modal si no existe
  let modal = document.getElementById('modal-ip');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-ip';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📡 Información del Servidor</h3>
          <div class="server-name" id="modal-server-name"></div>
        </div>
        <div class="ip-container">
          <div class="ip-text" id="modal-ip-text"></div>
          <button class="copy-button" onclick="copiarIP()">
            📋 Copiar IP
          </button>
          <button class="copy-button" onclick="copiarConexion()">
            🎮 Copiar connect
          </button>
        </div>
        <button class="close-button" onclick="cerrarModal()">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Actualizar contenido del modal
  document.getElementById('modal-server-name').textContent = serverName;
  document.getElementById('modal-ip-text').textContent = ipCompleta;

  // Guardar la IP actual para las funciones de copiado
  window.currentIP = ipCompleta;

  // Mostrar el modal
  modal.style.display = 'block';

  // Cerrar modal al hacer clic fuera de él
  modal.onclick = function(e) {
    if (e.target === modal) {
      cerrarModal();
    }
  };
}

function cerrarModal() {
  const modal = document.getElementById('modal-ip');
  if (modal) {
    modal.style.display = 'none';
  }
}

function copiarIP() {
  navigator.clipboard.writeText(window.currentIP).then(() => {
    mostrarNotificacion('IP copiada al portapapeles! 📋');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = window.currentIP;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    mostrarNotificacion('IP copiada al portapapeles! 📋');
  });
}

function copiarConexion() {
  const comando = `connect ${window.currentIP}`;
  navigator.clipboard.writeText(comando).then(() => {
    mostrarNotificacion('Comando connect copiado! 🎮');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = comando;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    mostrarNotificacion('Comando connect copiado! 🎮');
  });
}

function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4ecdc4;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 2000;
    font-weight: bold;
    animation: slideInRight 0.3s ease;
  `;
  notif.textContent = mensaje;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

function crearTablaEncabezado() {
  return `
    <div class="fila encabezado">
      <div class="col nombre">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
          <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
          <line x1="6" x2="6.01" y1="6" y2="6"/>
          <line x1="6" x2="6.01" y1="18" y2="18"/>
        </svg>
        SERVER NAME
      </div>
      <div class="col mapa">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>
          <path d="M15 5.764v15"/>
          <path d="M9 3.236v15"/>
        </svg>
        MAP
      </div>
      <div class="col jugadores">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        PLAYERS
      </div>
    </div>
  `;
}

function actualizarGrupo(nombre) {
  const contenedor = document.getElementById(nombre);

  if (!contenedor.dataset.inicializado) {
    contenedor.innerHTML = `<h2>${nombre.toUpperCase()}</h2>` + crearTablaEncabezado();
    contenedor.dataset.inicializado = "true";
  }

  fetch(`/api/${nombre}`)
    .then(res => {
      if (!res.ok) { // Verifica si la respuesta HTTP es exitosa
        console.error(`Error HTTP al obtener servidores para ${nombre}: ${res.status} ${res.statusText}`);
        throw new Error('Error de red o servidor');
      }
      return res.json();
    })
    .then(data => {
      // <<< ESTE console.log TE AYUDARÁ A VER SI LOS DATOS LLEGAN DEL BACKEND
      console.log(`Datos recibidos para ${nombre}:`, data); 
      const servidores = data.servidores || [];
      
      // VERIFICAR QUE data.actualizado EXISTE Y SE ACTUALIZA
      if (data.actualizado !== undefined) {
        timestampUltimaActualizacion = data.actualizado; 
        console.log(`Timestamp del servidor para ${nombre}: ${data.actualizado}`);
        console.log(`timestampUltimaActualizacion global después de la actualización: ${timestampUltimaActualizacion}`);
      } else {
        console.warn(`'actualizado' no encontrado en la respuesta para ${nombre}`);
      }

      const fragment = document.createDocumentFragment();

      servidores.forEach((s, i) => {
        let jugadores = "?";
        if (s.players !== undefined && s.max_players !== undefined) {
          jugadores = `${s.players}/${s.max_players}`;
        } else if (s.player_count) {
          jugadores = s.player_count;
        }

        const filaDiv = document.createElement('div');
        filaDiv.className = 'fila';
        filaDiv.innerHTML = `
          <div class="col nombre">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
              <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
              <line x1="6" x2="6.01" y1="6" y2="6"/>
              <line x1="6" x2="6.01" y1="18" y2="18"/>
            </svg>
            ${s.name || "Unknown"}
          </div>
          <div class="col mapa">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>
              <path d="M15 5.764v15"/>
              <path d="M9 3.236v15"/>
            </svg>
            ${s.map || "?"}
          </div>
          <div class="col jugadores">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            ${jugadores}
          </div>
        `;

        filaDiv.addEventListener('click', () => {
          mostrarModalIP(s.name || "Unknown", `${s.ip}:${s.port}`);
        });

        fragment.appendChild(filaDiv);
      });

      contenedor.querySelectorAll('.fila:not(.encabezado)').forEach(f => f.remove());
      contenedor.appendChild(fragment);

    })
    .catch(error => {
      console.error("Error al obtener servidores:", error);
      mostrarNotificacion('⚠️ Error al cargar datos del servidor para ' + nombre);
    });
}


function actualizarTodo() {
  grupos.forEach(actualizarGrupo);
}

// Inicializar la aplicación
async function inicializar() {
  try {
    await actualizarTodo(); // La primera actualización al iniciar
    
    // Iniciar contador inmediatamente con verificación
    if (typeof actualizarContador === 'function') {
      actualizarContador();
    } else {
      console.error('Error: actualizarContador no está definido');
    }
    
    // Configurar intervalos con verificación de funciones
    if (typeof actualizarContador === 'function') {
      setInterval(actualizarContador, 1000);
    }
    
    if (typeof actualizarTodo === 'function') {
      setInterval(actualizarTodo, 30000);
    }
    
    // Configurar evento de teclado para cerrar modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && typeof cerrarModal === 'function') {
        cerrarModal();
      }
    });
    
    console.log('Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    mostrarNotificacion('⚠️ Error al iniciar la aplicación');
  }
}

// Ejecutar inicialización con verificación de carga del DOM
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(inicializar, 100);
} else {
  document.addEventListener('DOMContentLoaded', inicializar);
}