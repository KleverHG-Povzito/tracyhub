document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("consultarBtn");

  btn.addEventListener("click", () => {
    const ip = document.getElementById("ipInput").value.trim();
    const port = document.getElementById("portInput").value.trim();

    if (!ip || !port) {
      alert("Por favor, ingresa una IP y un puerto.");
      return;
    }

    // Mostrar estado de carga
    const info = document.getElementById("infoContenedor");
    const playersContainer = document.getElementById("jugadores-lista");
    info.innerHTML = '<div class="loading">Consultando servidor...</div>';
    playersContainer.innerHTML = '<div class="loading">Cargando jugadores...</div>';

    // Consultar información del servidor
    fetch(`/api/query/${ip}/${port}`)
      .then(res => res.json())
      .then(serverData => {
        if (serverData.error) {
          info.innerHTML = `<p class="error">${serverData.error}</p>`;
          playersContainer.innerHTML = '<div class="error">No se pueden cargar jugadores</div>';
          return;
        }

        // Mostrar información básica del servidor
        info.innerHTML = `
          <div class="server-info">
            <div class="col nombre">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
                <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
                <line x1="6" x2="6.01" y1="6" y2="6"/>
                <line x1="6" x2="6.01" y1="18" y2="18"/>
              </svg>
              ${serverData.name || "Desconocido"}
            </div>
            <div class="col mapa">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>
                <path d="M15 5.764v15"/>
                <path d="M9 3.236v15"/>
              </svg>
              ${serverData.map || "?"}
            </div>
            <div class="col jugadores">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              ${serverData.player_count || 0} jugadores
            </div>
          </div>
        `;

        // Cargar jugadores automáticamente
        cargarJugadores(ip, port);
      })
      .catch(err => {
        info.innerHTML = `<p class="error">Error al consultar el servidor</p>`;
        playersContainer.innerHTML = '<div class="error">Error al cargar jugadores</div>';
      });
  });
});

async function cargarJugadores(ip, port) {
  const contenedor = document.getElementById("jugadores-lista");

  try {
    const response = await fetch(`/api/players/${ip}/${port}`);
    if (!response.ok) throw new Error('Error en la respuesta');
    
    const data = await response.json();

    if (data.error) {
      contenedor.innerHTML = `<p class="error">${data.error}</p>`;
      return;
    }

    if (!data.players || data.players.length === 0) {
      contenedor.innerHTML = '<p class="no-players">No hay jugadores conectados</p>';
      return;
    }

    // Crear lista de jugadores
    let html = '<ul class="players-list">';
    
    data.players.forEach(player => {
      html += `
        <li class="player-item">
          <span class="player-name">${player.name || 'Desconocido'}</span>
          <span class="player-stats">Frags: ${player.score || 0}</span>
        </li>
      `;
    });

    html += '</ul>';
    contenedor.innerHTML = html;
  } catch (error) {
    console.error("Error:", error);
    contenedor.innerHTML = `<p class="error">Error al cargar jugadores</p>`;
  }
}