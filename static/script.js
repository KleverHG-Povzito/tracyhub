const grupos = ["lalohlz", "unknown", "heizemod", "sirplease"];
let segundosDesdeActualizacion = 0;

function actualizarContador() {
  const texto = `Actualizado hace ${segundosDesdeActualizacion} segundo${segundosDesdeActualizacion !== 1 ? 's' : ''}`;
  document.getElementById("ultima-actualizacion").textContent = texto;
  segundosDesdeActualizacion++;
}

function actualizarTodo() {
  grupos.forEach(actualizarGrupo);
}

// Variable para almacenar las IPs cargadas desde el JSON
let serversIPs = {};

// Cargar IPs desde servers.json
async function cargarServersIPs() {
  try {
    const response = await fetch('servers.json');
    const data = await response.json();
    
    // Convertir las claves a minúsculas para que coincidan con los nombres de grupo
    serversIPs = {
      'lalohlz': data.LaloHlz || [],
      'heizemod': data.Heizemod || [],
      'sirplease': data.sirplease || [],
      'unknown': data.unknown || []
    };
    
    console.log('IPs de servidores cargadas correctamente');
  } catch (error) {
    console.error('Error al cargar servers.json:', error);
    // Fallback en caso de error - mantener vacío para evitar errores
    serversIPs = {
      'lalohlz': [],
      'heizemod': [],
      'sirplease': [],
      'unknown': []
    };
  }
}

// Función para mostrar el modal con la IP
function mostrarModalIP(serverName, grupo, indice) {
  const ips = serversIPs[grupo];
  if (!ips || !ips[indice]) {
    console.error('IP no encontrada para:', grupo, indice);
    mostrarNotificacion('❌ IP no disponible');
    return;
  }
  
  const [ip, puerto] = ips[indice];
  const ipCompleta = `${ip}:${puerto}`;
  
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

// Función para cerrar el modal
function cerrarModal() {
  const modal = document.getElementById('modal-ip');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Función para copiar solo la IP
function copiarIP() {
  navigator.clipboard.writeText(window.currentIP).then(() => {
    mostrarNotificacion('IP copiada al portapapeles! 📋');
  }).catch(() => {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = window.currentIP;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    mostrarNotificacion('IP copiada al portapapeles! 📋');
  });
}

// Función para copiar comando connect
function copiarConexion() {
  const comando = `connect ${window.currentIP}`;
  navigator.clipboard.writeText(comando).then(() => {
    mostrarNotificacion('Comando connect copiado! 🎮');
  }).catch(() => {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = comando;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    mostrarNotificacion('Comando connect copiado! 🎮');
  });
}

// Función para mostrar notificaciones
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

// Agregar estilos de animación para la notificación
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

  // Solo inicializa el contenedor si es la primera vez
  if (!contenedor.dataset.inicializado) {
    contenedor.innerHTML = `<h2>${nombre.toUpperCase()}</h2>` + crearTablaEncabezado();
    contenedor.dataset.inicializado = "true";
  }

  fetch(`/api/${nombre}`)
    .then(res => res.json())
    .then(servidores => {
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
          mostrarModalIP(s.name || "Unknown", nombre, i);
        });

        fragment.appendChild(filaDiv);
      });

      contenedor.querySelectorAll('.fila:not(.encabezado)').forEach(f => f.remove());
      contenedor.appendChild(fragment);

      // Reinicia el contador al recibir nueva información
      segundosDesdeActualizacion = 0;
    })
    .catch(error => {
      console.error("Error al obtener servidores:", error);
    });
}


function actualizarTodo() {
  grupos.forEach(actualizarGrupo);
}

// Inicializar la aplicación
async function inicializar() {
  await cargarServersIPs();
  actualizarTodo();
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    cerrarModal();
  }
});

// Ejecutar inicialización
inicializar();

// Actualizar cada 30 segundos
setInterval(actualizarTodo, 30000);
setInterval(actualizarContador, 1000);
