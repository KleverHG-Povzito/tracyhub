from flask import Flask, jsonify, redirect
from query import query_server, parse_server_info, query_players
import json
import os
import threading
import time

app = Flask(__name__, static_folder="static")

# Cargar servidores desde el archivo JSON
def cargar_servidores():
    with open("static/js/servers.json", "r") as f:
        data = json.load(f)
    return {grupo.lower(): lista for grupo, lista in data.items()}

SERVIDORES = cargar_servidores()

# Diccionario global para almacenar la caché
server_cache = {}
ultimo_cache_timestamp = int(time.time())

def _cargar_y_actualizar_cache_una_vez():
    global server_cache, ultimo_cache_timestamp
    nuevo_cache = {}
    for grupo, servidores in SERVIDORES.items():
        datos = []
        for ip, port in servidores:
            data, _ = query_server(ip, port)
            info = parse_server_info(data, ip, port)
            if info:
                datos.append(info)
        nuevo_cache[grupo] = datos
    server_cache = nuevo_cache
    ultimo_cache_timestamp = int(time.time())
    print(f"✔ Caché actualizado (Timestamp: {ultimo_cache_timestamp})")

def actualizar_cache_loop():
    _cargar_y_actualizar_cache_una_vez()
    while True:
        time.sleep(30)
        _cargar_y_actualizar_cache_una_vez()

threading.Thread(target=actualizar_cache_loop, daemon=True).start()

# APIs
@app.route("/api/<grupo>")
def obtener_servidores(grupo):
    grupo = grupo.lower()
    return jsonify({
        "servidores": server_cache.get(grupo, []),
        "actualizado": ultimo_cache_timestamp
    })

@app.route("/api/query/<ip>/<int:port>")
def consultar_servidor(ip, port):
    data, _ = query_server(ip, port)
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

# Redirección de raíz
@app.route("/")
def root():
    return redirect("/inicio")

# Rutas limpias para las páginas
@app.route("/inicio")
def ruta_inicio():
    return app.send_static_file("index.html")

@app.route("/gameip")
def ruta_gameip():
    return app.send_static_file("gameip.html")

# Para archivos estáticos (CSS, JS, imágenes, etc.)
@app.route("/<path:archivo>")
def static_files(archivo):
    return app.send_static_file(archivo)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
