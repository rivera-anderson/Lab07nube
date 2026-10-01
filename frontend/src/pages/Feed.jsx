import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, MapPin, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Feed({ user, setNodo, filter }) {
  const [rutas, setRutas] = useState([]);
  const nav = useNavigate();

  const load = async () => {
    const res = await fetch(`/api/rutas?filter=${filter}`, {
      headers: { 'Authorization': localStorage.getItem('token') }
    });
    const data = await res.json();
    setRutas(data.rutas);
    setNodo(data.nodo);
  };
  useEffect(() => { load(); }, [filter]);

  const toggleFav = async (e, id) => {
    e.stopPropagation();
    await fetch(`/api/fav/${id}`, { method:'POST', headers: { 'Authorization': localStorage.getItem('token') } });
    load();
  };
  const del = async (e, id) => {
    e.stopPropagation();
    if(confirm('¿Eliminar definitivamente esta ruta?')) {
      await fetch(`/api/rutas/${id}`, { method:'DELETE', headers: { 'Authorization': localStorage.getItem('token') } });
      load();
    }
  };

  const titles = { 'all': 'Explorar Colección.', 'me': 'Tus Publicaciones.', 'favs': 'Tus Favoritos.' };

  return (
    <div className="min-h-screen bg-sorrel-light pt-32 px-8 lg:px-24 pb-24">
      <div className="flex justify-between items-end mb-16 border-b border-gray-300 pb-6">
        <h2 className="text-5xl font-serif text-sorrel-dark">{titles[filter]}</h2>
        {user && filter === 'me' && (
          <Link to="/create" className="bg-sorrel-dark text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-black transition flex items-center gap-2 shadow-xl hover:scale-105">
            Añadir Ruta <Plus className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
          {rutas.map((r, i) => (
            <motion.div key={r.id} onClick={() => nav(`/ruta/${r.id}`)} initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ scale:0.9, opacity:0 }} transition={{ delay: i*0.1 }} className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] relative mb-6 shadow-lg bg-black">
                <img src={r.imagen} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 ease-out" />
                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-sorrel-dark shadow-sm">
                  {r.tipo}
                </div>
                {user && (
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={(e) => toggleFav(e, r.id)} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition hover:scale-110 ${r.isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}>
                      <Heart className={`w-5 h-5 ${r.isFav ? 'fill-current' : ''}`} />
                    </button>
                    {filter === 'me' && (
                      <button onClick={(e) => del(e, r.id)} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg hover:scale-110 transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
                <div className="absolute bottom-5 left-5 text-white drop-shadow-md flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-sorrel-green"/> {r.provincias || 'Perú'}
                </div>
              </div>
              <h3 className="text-2xl font-serif text-sorrel-dark mb-2 group-hover:text-sorrel-green transition-colors">{r.titulo}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{r.descripcion}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {rutas.length === 0 && <p className="text-gray-500 text-lg">No hay rutas aquí aún.</p>}
      </div>
    </div>
  );
}
