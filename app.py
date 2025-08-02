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

# Función que actualiza la caché cada 30 segundos
def actualizar_cache():
    global server_cache
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
        print("✔ Caché actualizado")
        time.sleep(30)

@app.route("/api/<grupo>")
def obtener_servidores(grupo):
    grupo = grupo.lower()
    return jsonify(server_cache.get(grupo, []))

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/<path:archivo>")
def static_files(archivo):
    return app.send_static_file(archivo)

if __name__ == "__main__":
    threading.Thread(target=actualizar_cache, daemon=True).start()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
