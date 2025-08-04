from flask import Flask, jsonify
from query import query_server, parse_server_info, query_players
import json
import os
import threading
import time

app = Flask(__name__)

# Cargar servidores desde el archivo JSON
def cargar_servidores():
    with open("static/js/servers.json", "r") as f:
        data = json.load(f)
    return {grupo.lower(): lista for grupo, lista in data.items()}

SERVIDORES = cargar_servidores()

# Diccionario global para almacenar la caché
server_cache = {}

# Inicializar timestamp con valor entero
ultimo_cache_timestamp = int(time.time())

# Función interna para cargar y actualizar la caché una vez
def _cargar_y_actualizar_cache_una_vez():
    global server_cache, ultimo_cache_timestamp
    nuevo_cache = {}
    for grupo, servidores in SERVIDORES.items():
        datos = []
        for ip, port in servidores:
            data, _ = query_server(ip, port)
            # MODIFICACIÓN CLAVE: Pasar ip y port a parse_server_info
            info = parse_server_info(data, ip, port) 
            if info:
                datos.append(info)
        nuevo_cache[grupo] = datos
    
    server_cache = nuevo_cache
    ultimo_cache_timestamp = int(time.time())
    print(f"✔ Caché actualizado (Timestamp: {ultimo_cache_timestamp})")

# Función que actualiza la caché cada 30 segundos (el bucle)
def actualizar_cache_loop():
    # Primero, actualizamos la caché inmediatamente al inicio del hilo
    _cargar_y_actualizar_cache_una_vez() 
    
    # Luego, entramos al bucle para actualizaciones periódicas
    while True:
        time.sleep(30) # Espera 30 segundos antes de la siguiente actualización
        _cargar_y_actualizar_cache_una_vez()

# Lanzar el hilo de actualización de caché
threading.Thread(target=actualizar_cache_loop, daemon=True).start()

@app.route("/api/<grupo>")
def obtener_servidores(grupo):
    grupo = grupo.lower()
    return jsonify({
        "servidores": server_cache.get(grupo, []),
        "actualizado": ultimo_cache_timestamp
    })

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/<path:archivo>")
def static_files(archivo):
    return app.send_static_file(archivo)

@app.route("/api/query/<ip>/<int:port>")
def consultar_servidor(ip, port):
    data, _ = query_server(ip, port)
    # Aquí parse_server_info no necesita ip/port en el retorno si esta ruta es solo para info básica
    info = parse_server_info(data) 
    if info:
        return jsonify(info)
    else:
        return jsonify({"error": "No se pudo consultar el servidor"}), 404
    
@app.route("/api/players/<ip>/<int:port>")
def obtener_jugadores(ip, port):
    try:
        players = query_players(ip, port)
        return jsonify({"players": players})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))