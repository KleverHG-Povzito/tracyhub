from flask import Flask, jsonify
from query import query_server, parse_server_info
import json
import os

app = Flask(__name__)

# Cargar servidores desde el archivo JSON
def cargar_servidores():
    with open("static/servers.json", "r") as f:
        data = json.load(f)
    # Convertir claves a minúsculas para evitar errores de comparación
    return {grupo.lower(): lista for grupo, lista in data.items()}

SERVIDORES = cargar_servidores()

@app.route("/api/<grupo>")
def obtener_servidores(grupo):
    grupo = grupo.lower()
    if grupo not in SERVIDORES:
        return jsonify([])

    resultado = []
    for ip, port in SERVIDORES[grupo]:
        data, _ = query_server(ip, port)
        info = parse_server_info(data)
        if info:
            resultado.append(info)
    return jsonify(resultado)

# Servir index.html si se accede a la raíz
@app.route("/")
def index():
    return app.send_static_file("index.html")

# Servir archivos estáticos (JS, CSS, etc.)
@app.route("/<path:archivo>")
def static_files(archivo):
    return app.send_static_file(archivo)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))