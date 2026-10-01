$AppDir = "C:\Users\ANDERSON\Downloads\lab06nube\lab07\peru_app"
mkdir -Force "$AppDir\frontend\src"
mkdir -Force "$AppDir\backend\data"

# Mover archivos backend viejos a su carpeta
Move-Item -Force "$AppDir\app.py" "$AppDir\backend\app.py" -ErrorAction SilentlyContinue
Move-Item -Force "$AppDir\requirements.txt" "$AppDir\backend\requirements.txt" -ErrorAction SilentlyContinue
Move-Item -Force "$AppDir\Dockerfile" "$AppDir\backend\Dockerfile" -ErrorAction SilentlyContinue

# Backend API
Set-Content -Path "$AppDir\backend\app.py" -Value @"
from flask import Flask, request, jsonify
import sqlite3, jwt, datetime, sys, os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'gaaaaa_secreto'
PORT = sys.argv[1] if len(sys.argv) > 1 else "8080"
DB_FILE = 'data/rutas.db'

def init_db():
    os.makedirs('data', exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS rutas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, tipo TEXT, descripcion TEXT, imagen TEXT)''')
    c.execute('SELECT COUNT(*) FROM rutas')
    if c.fetchone()[0] == 0:
        rutas_iniciales = [
            ("Ruta del Ceviche", "Gastronómica", "Descubre los mejores huariques de Lima.", "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80"),
            ("Camino Inca Mágico", "Aventura", "4 días de trekking hasta la maravilla del mundo.", "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=500&q=80"),
            ("Misterio de Nasca", "Cultural", "Vuelo sobre las enigmáticas líneas del desierto.", "https://images.unsplash.com/photo-1547288242-f3d375fc7b5f?w=500&q=80")
        ]
        c.executemany('INSERT INTO rutas (titulo, tipo, descripcion, imagen) VALUES (?, ?, ?, ?)', rutas_iniciales)
        conn.commit()
    conn.close()

init_db()

def check_token(token):
    try: return jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    except: return None

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data.get('user') == 'admin' and data.get('pass') == '1234':
        token = jwt.encode({'user': 'admin', 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'])
        return jsonify({'token': token})
    return jsonify({'error': 'Credenciales falsas'}), 401

@app.route('/api/rutas', methods=['GET', 'POST'])
def handle_rutas():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    if request.method == 'GET':
        c.execute('SELECT * FROM rutas')
        rutas = [{'id': r[0], 'titulo': r[1], 'tipo': r[2], 'descripcion': r[3], 'imagen': r[4]} for r in c.fetchall()]
        return jsonify({'nodo': PORT, 'rutas': rutas})
    
    if not check_token(request.headers.get('Authorization')): return jsonify({'error': 'No autorizado'}), 401
    
    data = request.json
    c.execute('INSERT INTO rutas (titulo, tipo, descripcion, imagen) VALUES (?, ?, ?, ?)', (data['titulo'], data['tipo'], data['descripcion'], data['imagen']))
    conn.commit()
    return jsonify({'msg': 'Ruta creada'})

@app.route('/api/rutas/<id>', methods=['DELETE'])
def delete_ruta(id):
    if not check_token(request.headers.get('Authorization')): return jsonify({'error': 'No autorizado'}), 401
    conn = sqlite3.connect(DB_FILE)
    conn.execute('DELETE FROM rutas WHERE id=?', (id,))
    conn.commit()
    return jsonify({'msg': 'Borrado'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(PORT))
"@

# Docker-compose central
Set-Content -Path "$AppDir\docker-compose.yml" -Value @"
version: '3.8'
services:
  node1:
    build: ./backend
    environment:
      - PORT=8081
    volumes:
      - ./backend/data:/app/data
    command: python app.py 8081

  node2:
    build: ./backend
    environment:
      - PORT=8082
    volumes:
      - ./backend/data:/app/data
    command: python app.py 8082

  node3:
    build: ./backend
    environment:
      - PORT=8083
    volumes:
      - ./backend/data:/app/data
    command: python app.py 8083

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - node1
      - node2
      - node3
"@

# Frontend Dockerfile
Set-Content -Path "$AppDir\frontend\Dockerfile" -Value @"
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
"@

# Frontend Nginx Config (El Balanceador oficial)
Set-Content -Path "$AppDir\frontend\nginx.conf" -Value @"
events {}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    upstream backend_pool {
        server node1:8081;
        server node2:8082;
        server node3:8083;
    }
    
    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        location /api/ {
            proxy_pass http://backend_pool;
        }

        location / {
            try_files `$uri `$uri/ /index.html;
        }
    }
}
"@

# Archivos de Vite y Tailwind
Set-Content -Path "$AppDir\frontend\package.json" -Value @"
{
  "name": "peru-rutas",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.263.1" },
  "devDependencies": { "@vitejs/plugin-react": "^4.0.3", "autoprefixer": "^10.4.14", "postcss": "^8.4.27", "tailwindcss": "^3.3.3", "vite": "^4.4.5" }
}
"@

Set-Content -Path "$AppDir\frontend\vite.config.js" -Value @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
"@

Set-Content -Path "$AppDir\frontend\tailwind.config.js" -Value @"
/** @type {import('tailwindcss').Config} */
export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] }
"@

Set-Content -Path "$AppDir\frontend\postcss.config.js" -Value @"
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
"@

Set-Content -Path "$AppDir\frontend\index.html" -Value @"
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Perú Vibe</title>
  </head>
  <body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-rose-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@

Set-Content -Path "$AppDir\frontend\src\index.css" -Value @"
@tailwind base; @tailwind components; @tailwind utilities;
"@

Set-Content -Path "$AppDir\frontend\src\main.jsx" -Value @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@

Set-Content -Path "$AppDir\frontend\src\App.jsx" -Value @"
import React, { useState, useEffect } from 'react';
import { Server, Shield, Trash2, Plus, LogOut, Compass } from 'lucide-react';

export default function App() {
  const [rutas, setRutas] = useState([]);
  const [nodo, setNodo] = useState('...');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({ user: '', pass: '', titulo: '', tipo: 'Gastronómica', descripcion: '', imagen: '' });

  const fetchData = async () => {
    const res = await fetch('/api/rutas');
    const data = await res.json();
    setRutas(data.rutas);
    setNodo(data.nodo);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: form.user, pass: form.pass })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setShowModal(false);
    } else alert('Credenciales incorrectas mrd');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const imgUrl = form.imagen || 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=500&q=80';
    await fetch('/api/rutas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({...form, imagen: imgUrl})
    });
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que quieres borrar esta ruta?')) {
      await fetch(`/api/rutas/` + id, { method: 'DELETE', headers: { 'Authorization': token } });
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navbar */}
      <nav className="flex justify-between items-center mb-16 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Compass className="w-8 h-8 text-rose-500" />
          <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">PERÚ VIBE</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-emerald-400 shadow-inner">
            <Server className="w-3 h-3 animate-pulse" /> NODO {nodo}
          </div>
          {!token ? (
            <button onClick={() => setShowModal('login')} className="flex items-center gap-2 text-sm font-semibold hover:text-rose-400 transition-colors">
              <Shield className="w-4 h-4" /> Admin
            </button>
          ) : (
            <button onClick={() => { setToken(null); localStorage.removeItem('token'); }} className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-light mb-2">Explora las <span className="font-bold text-white">Mejores Rutas</span></h2>
          <p className="text-slate-400">Descubre la magia, gastronomía y cultura del Perú.</p>
        </div>
        {token && (
          <button onClick={() => setShowModal('create')} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-transform active:scale-95 shadow-lg shadow-white/10">
            <Plus className="w-5 h-5" /> Nueva Ruta
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rutas.map(r => (
          <div key={r.id} className="group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300">
            <div className="h-56 overflow-hidden relative">
              <img src={r.imagen} alt={r.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                {r.tipo}
              </div>
              {token && (
                <button onClick={() => handleDelete(r.id)} className="absolute top-4 right-4 bg-rose-500/90 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-white">{r.titulo}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{r.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>
            <h3 className="text-2xl font-bold mb-6 text-white">{showModal === 'login' ? 'Acceso Seguro' : 'Nueva Ruta'}</h3>
            
            {showModal === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input type="text" placeholder="Usuario (admin)" className="bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:outline-none focus:border-rose-500 transition-colors" onChange={e => setForm({...form, user: e.target.value})} required />
                <input type="password" placeholder="Contraseña (1234)" className="bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:outline-none focus:border-rose-500 transition-colors" onChange={e => setForm({...form, pass: e.target.value})} required />
                <button className="bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold p-4 rounded-xl mt-2 hover:opacity-90 transition-opacity">Ingresar</button>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <input type="text" placeholder="Título" className="bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:outline-none focus:border-rose-500 transition-colors" onChange={e => setForm({...form, titulo: e.target.value})} required />
                <select className="bg-slate-950 border border-slate-800 text-slate-300 p-4 rounded-xl focus:outline-none focus:border-rose-500 transition-colors" onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option>Gastronómica</option><option>Cultural</option><option>Aventura</option>
                </select>
                <textarea placeholder="Descripción atractiva" className="bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:outline-none focus:border-rose-500 h-24 transition-colors" onChange={e => setForm({...form, descripcion: e.target.value})} required />
                <input type="text" placeholder="URL Imagen (Opcional)" className="bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:outline-none focus:border-rose-500 transition-colors" onChange={e => setForm({...form, imagen: e.target.value})} />
                <button className="bg-white text-black font-bold p-4 rounded-xl mt-2 hover:bg-slate-200 transition-colors">Publicar Ruta</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
"@
