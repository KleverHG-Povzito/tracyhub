from flask import Flask, jsonify
from query import query_server, parse_server_info
import json
import os
import threading
import time

app = Flask(__name__)

# Cargar servidores desde el archivo JSON
def cargar_servidores():
    with open("static/servers.json", "r") as f:
        data = json.load(f)
    return {grupo.lower(): lista for grupo, lista in data.items()}

SERVIDORES = cargar_servidores()

# Diccionario global para almacenar la caché
server_cache = {}

# Inicializar timestamp con valor entero
ultimo_cache_timestamp = int(time.time())

# Función que actualiza la caché cada 30 segundos
def actualizar_cache():
    global server_cache, ultimo_cache_timestamp
    while True:
        nuevo_cache = {}
        for grupo, servidores in SERVIDORES.items():
            datos = []
            for ip, port in servidores:
                data, _ = query_server(ip, port)
                info = parse_server_info(data)
                if info:
                    datos.append(info)
            nuevo_cache[grupo] = datos
        
        server_cache = nuevo_cache
        ultimo_cache_timestamp = int(time.time())  # Usamos int() para quitar decimales
        print(f"✔ Caché actualizado (Timestamp: {ultimo_cache_timestamp})")
        time.sleep(30)

# Lanzar el hilo de actualización de caché
threading.Thread(target=actualizar_cache, daemon=True).start()

@app.route("/api/<grupo>")
def obtener_servidores(grupo):
    grupo = grupo.lower()
    return jsonify({
        "servidores": server_cache.get(grupo, []),
        "actualizado": ultimo_cache_timestamp  # Enviamos el timestamp como entero
    })

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/<path:archivo>")
def static_files(archivo):
    return app.send_static_file(archivo)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))