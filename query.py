# query.py
# Se encarga de consultar la información básica (A2S_INFO) de servidores Source Engine (como L4D2)

import socket
import time
import struct

# Tiempo de vida de la caché por servidor en segundos
CACHE_TTL = 60

# Diccionario global para guardar respuestas en caché
cache = {}

def read_string(data, offset):
    """
    Lee una cadena terminada en byte nulo desde la respuesta binaria del servidor.
    Retorna la cadena leída y el nuevo offset.
    """
    end = data.find(b'\x00', offset)
    if end == -1:
        return "", len(data)
    try:
        return data[offset:end].decode('utf-8', errors='ignore'), end + 1
    except:
        return "", end + 1

def query_server(ip, port, max_retries=3):
    """
    Realiza una consulta A2S_INFO a un servidor (IP, puerto).
    Usa caché si la respuesta es reciente.
    Retorna los datos binarios recibidos y la cantidad de intentos usados.
    """
    key = f"{ip}:{port}"
    now = time.time()

    # Verificar caché
    if key in cache and now - cache[key]["time"] < CACHE_TTL:
        return cache[key]["data"], 1

    request_info = b'\xFF\xFF\xFF\xFFTSource Engine Query\x00'
    attempts = 0
    data = None

    for _ in range(max_retries):
        attempts += 1
        try:
            # Crear socket UDP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(3)
            s.sendto(request_info, (ip, port))
            data, _ = s.recvfrom(4096)
            s.close()

            # Verificar si el servidor requiere un challenge (muy raro en A2S_INFO)
            if len(data) > 4 and data[4] == 0x41:
                challenge = data[5:9]
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.settimeout(3)
                s.sendto(request_info + challenge, (ip, port))
                data, _ = s.recvfrom(4096)
                s.close()

            # Guardar en caché
            cache[key] = {"data": data, "time": now}
            return data, attempts
        except Exception as e:
            if 's' in locals():
                s.close()
            continue

    # Si falla tras los reintentos
    return None, attempts

# LA CLAVE: Asegúrate de que esta línea esté así en tu archivo query.py
def parse_server_info(data, ip=None, port=None):
    """
    Parsea la respuesta binaria del servidor y extrae información del protocolo A2S_INFO.
    Retorna un diccionario con la info o None si falla.
    """
    if not data or len(data) < 6:
        return None
    
    try:
        # Verificar que sea una respuesta A2S_INFO válida
        if data[:4] != b'\xFF\xFF\xFF\xFF' or data[4] != 0x49:
            return None
        
        offset = 5  # Empezar después del header
        
        # Leer Protocol (byte)
        if offset >= len(data):
            return None
        protocol = data[offset]
        offset += 1
        
        # Leer strings básicas
        name, offset = read_string(data, offset)
        map_name, offset = read_string(data, offset)
        folder, offset = read_string(data, offset)
        game, offset = read_string(data, offset)
        
        # Leer Steam Application ID (2 bytes, little endian)
        if offset + 1 >= len(data):
            return None
        app_id = struct.unpack('<H', data[offset:offset+2])[0]
        offset += 2
        
        # Leer Players y Max Players
        if offset + 1 >= len(data):
            return None
        players = data[offset]
        max_players = data[offset + 1]
        offset += 2
        
        # Leer Bots
        if offset >= len(data):
            bots = 0
        else:
            bots = data[offset]
            offset += 1
        
        # Leer Server type
        if offset >= len(data):
            server_type = 'd'
        else:
            server_type = chr(data[offset])
            offset += 1
        
        # Leer Environment
        if offset >= len(data):
            environment = 'l'
        else:
            environment = chr(data[offset])
            offset += 1
        
        # Leer Visibility
        if offset >= len(data):
            visibility = 0
        else:
            visibility = data[offset]
            offset += 1
        
        # Leer VAC
        if offset >= len(data):
            vac = 0
        else:
            vac = data[offset]
            offset += 1

        # Crear el formato "jugadores/máximo" que esperan las webs
        player_count = f"{players}/{max_players}"
        
        info = {
            "name": name,
            "map": map_name,
            "folder": folder,
            "game": game,
            "players": players,
            "max_players": max_players,
            "player_count": player_count,  # Formato "X/Y"
            "bots": bots,
            "server_type": server_type,
            "environment": environment,
            "visibility": visibility,
            "vac": vac,
            "protocol": protocol,
            "app_id": app_id
        }
        
        # Añadir IP y puerto a la información parseada
        if ip is not None:
            info['ip'] = ip
        if port is not None:
            info['port'] = port

        return info
    except Exception as e:
        print(f"Error parsing server info: {e}")
        return None
    
def query_players(ip, port, timeout=3):
    """
    Consulta los jugadores conectados a un servidor Source Engine.
    Retorna una lista de diccionarios con nombre y frags de cada jugador.
    """
    challenge_request = b'\xFF\xFF\xFF\xFF\x55\xFF\xFF\xFF\xFF'
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(timeout)

        # Paso 1: Solicitar challenge
        s.sendto(challenge_request, (ip, port))
        data, _ = s.recvfrom(4096)

        if len(data) < 9 or data[4] != 0x41:
            return []

        challenge = data[5:9]

        # Paso 2: Enviar consulta con challenge
        player_request = b'\xFF\xFF\xFF\xFF\x55' + challenge
        s.sendto(player_request, (ip, port))
        data, _ = s.recvfrom(4096)
        s.close()

        if data[4] != 0x44:
            return []

        offset = 5
        num_players = data[offset]
        offset += 1

        players = []
        for _ in range(num_players):
            index = data[offset]
            offset += 1

            name, offset = read_string(data, offset)
            score = struct.unpack('<i', data[offset:offset+4])[0]
            offset += 4

            duration = struct.unpack('<f', data[offset:offset+4])[0]
            offset += 4

            players.append({
                "name": name,
                "score": score,
                "time": round(duration, 1)
            })

        return players
    except Exception as e:
        print(f"Error al consultar jugadores: {e}")
        return []