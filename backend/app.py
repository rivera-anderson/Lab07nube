from flask import Flask, request, jsonify, send_from_directory
import sqlite3, jwt, datetime, sys, os, json, uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'gaaaaa_secreto'
app.config['UPLOAD_FOLDER'] = 'data/uploads'
PORT = sys.argv[1] if len(sys.argv) > 1 else "8080"
DB_FILE = 'data/rutas.db'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS usuarios (user TEXT PRIMARY KEY, pass TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS rutas (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, titulo TEXT, tipo TEXT, descripcion TEXT, imagen TEXT, provincias TEXT, punto_inicio TEXT, waypoints TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS favoritos (user TEXT, ruta_id INTEGER, PRIMARY KEY(user, ruta_id))''')
    try: c.execute("INSERT INTO usuarios (user, pass) VALUES ('admin', '1234')")
    except: pass
    
    # Seeder - Agregando rutas de ejemplo brutales si la tabla está vacía
    if c.execute('SELECT COUNT(*) FROM rutas').fetchone()[0] == 0:
        img_inca = "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800"
        img_colca = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800"
        img_lima = "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800"

        wps1 = json.dumps([
            {"nombre":"Plaza de Armas", "descripcion":"Punto de encuentro y aclimatación. Aquí empieza la magia con una rica chicha morada.", "imagen": img_inca},
            {"nombre":"Ollantaytambo", "descripcion":"La fortaleza viviente. Tomaremos el tren rodeados de montañas imponentes.", "imagen": img_inca},
            {"nombre":"Machu Picchu", "descripcion":"El destino final. Una de las maravillas del mundo envuelta en neblina y misterio.", "imagen": img_inca}
        ])
        wps2 = json.dumps([
            {"nombre":"Mirador Cruz del Cóndor", "descripcion":"Observaremos el majestuoso vuelo del ave voladora más grande del mundo en su hábitat natural.", "imagen": img_colca},
            {"nombre":"Oasis Sangalle", "descripcion":"Un refugio verde en medio de la aridez del cañón. Perfecto para un chapuzón relajante.", "imagen": img_colca}
        ])
        wps3 = json.dumps([
            {"nombre":"Centro de Lima", "descripcion":"Degustación de frutas exóticas peruanas y ceviche de carretilla fresco.", "imagen": img_lima},
            {"nombre":"Barranco Bohemio", "descripcion":"Paseo por el Puente de los Suspiros y cena en un restaurante de autor.", "imagen": img_lima}
        ])
        
        rutas = [
            ("admin", "Camino Inca a Machu Picchu", "Cultura", "La ruta de senderismo más famosa de Sudamérica. Atraviesa montañas, selva nubosa y ruinas incas increíbles. Una experiencia que cambiará tu vida.", img_inca, "Cusco", "Km 82", wps1),
            ("admin", "Cañón del Colca", "Aventura", "Un trekking profundo hacia uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino y paisajes de otro planeta.", img_colca, "Arequipa", "Chivay", wps2),
            ("admin", "Lima Gastronómica y Bohemia", "Gastronomía", "Un recorrido por los mejores restaurantes y huariques de la capital culinaria de América. Sabores, historia y tradición en cada bocado.", img_lima, "Lima", "Miraflores", wps3)
        ]
        c.executemany('INSERT INTO rutas (user, titulo, tipo, descripcion, imagen, provincias, punto_inicio, waypoints) VALUES (?,?,?,?,?,?,?,?)', rutas)
        
    conn.commit()
    conn.close()

init_db()

def get_user(req):
    try: return jwt.decode(req.headers.get('Authorization'), app.config['SECRET_KEY'], algorithms=["HS256"])['user']
    except: return None

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files: return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({'url': f'/api/uploads/{filename}'})

@app.route('/api/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = sqlite3.connect(DB_FILE)
    try:
        conn.execute('INSERT INTO usuarios (user, pass) VALUES (?, ?)', (data['user'], data['pass']))
        conn.commit()
        return jsonify({'msg': 'OK'})
    except: return jsonify({'error': 'Ya existe'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB_FILE)
    if conn.execute('SELECT * FROM usuarios WHERE user=? AND pass=?', (data['user'], data['pass'])).fetchone():
        token = jwt.encode({'user': data['user'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
        return jsonify({'token': token})
    return jsonify({'error': 'Falso'}), 401

@app.route('/api/rutas', methods=['GET', 'POST'])
def rutas_api():
    conn = sqlite3.connect(DB_FILE)
    user = get_user(request)
    if request.method == 'GET':
        filtro = request.args.get('filter', 'all')
        if filtro == 'me' and user:
            rows = conn.execute('SELECT * FROM rutas WHERE user=? ORDER BY id DESC', (user,)).fetchall()
        elif filtro == 'favs' and user:
            rows = conn.execute('SELECT r.* FROM rutas r JOIN favoritos f ON r.id = f.ruta_id WHERE f.user=? ORDER BY r.id DESC', (user,)).fetchall()
        else:
            rows = conn.execute('SELECT * FROM rutas ORDER BY id DESC').fetchall()
        
        favs = []
        if user: favs = [r[0] for r in conn.execute('SELECT ruta_id FROM favoritos WHERE user=?', (user,)).fetchall()]
        
        rutas = []
        for r in rows:
            rutas.append({'id': r[0], 'user': r[1], 'titulo': r[2], 'tipo': r[3], 'descripcion': r[4], 'imagen': r[5], 'provincias': r[6], 'punto_inicio': r[7], 'waypoints': json.loads(r[8] or '[]'), 'isFav': r[0] in favs})
        return jsonify({'nodo': PORT, 'rutas': rutas})
    
    if not user: return jsonify({'error': 'Auth'}), 401
    data = request.json
    conn.execute('INSERT INTO rutas (user, titulo, tipo, descripcion, imagen, provincias, punto_inicio, waypoints) VALUES (?,?,?,?,?,?,?,?)',
                 (user, data['titulo'], data['tipo'], data['descripcion'], data['imagen'], data.get('provincias',''), data.get('punto_inicio',''), json.dumps(data.get('waypoints', []))))
    conn.commit()
    return jsonify({'msg': 'OK'})

@app.route('/api/rutas/<id>', methods=['GET', 'DELETE'])
def ruta_by_id(id):
    conn = sqlite3.connect(DB_FILE)
    user = get_user(request)
    if request.method == 'GET':
        r = conn.execute('SELECT * FROM rutas WHERE id=?', (id,)).fetchone()
        if not r: return jsonify({'error': 'No existe'}), 404
        isFav = False
        if user: isFav = bool(conn.execute('SELECT 1 FROM favoritos WHERE user=? AND ruta_id=?', (user, id)).fetchone())
        ruta = {'id': r[0], 'user': r[1], 'titulo': r[2], 'tipo': r[3], 'descripcion': r[4], 'imagen': r[5], 'provincias': r[6], 'punto_inicio': r[7], 'waypoints': json.loads(r[8] or '[]'), 'isFav': isFav}
        return jsonify(ruta)
    
    if not user: return jsonify({'error': 'Auth'}), 401
    conn.execute('DELETE FROM rutas WHERE id=? AND user=?', (id, user))
    conn.commit()
    return jsonify({'msg': 'OK'})

@app.route('/api/fav/<id>', methods=['POST'])
def toggle_fav(id):
    user = get_user(request)
    if not user: return jsonify({'error': 'Auth'}), 401
    conn = sqlite3.connect(DB_FILE)
    exists = conn.execute('SELECT 1 FROM favoritos WHERE user=? AND ruta_id=?', (user, id)).fetchone()
    if exists: conn.execute('DELETE FROM favoritos WHERE user=? AND ruta_id=?', (user, id))
    else: conn.execute('INSERT INTO favoritos (user, ruta_id) VALUES (?, ?)', (user, id))
    conn.commit()
    return jsonify({'msg': 'OK'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(PORT))
