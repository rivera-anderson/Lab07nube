import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Heart, ArrowLeft } from 'lucide-react';

export default function RouteDetail({ user, setNodo }) {
  const { id } = useParams();
  const [ruta, setRuta] = useState(null);

  const load = async () => {
    const res = await fetch(`/api/rutas/${id}`, {
      headers: { 'Authorization': localStorage.getItem('token') }
    });
    if (res.ok) {
      const data = await res.json();
      setRuta(data);
    }
  };

  useEffect(() => { load(); }, [id]);

  const toggleFav = async () => {
    if (!user) return alert('Inicia sesión primero para guardar en favoritos.');
    // Optimistic update para que la animación sea instantánea
    setRuta({...ruta, isFav: !ruta.isFav});
    await fetch(`/api/fav/${id}`, { method:'POST', headers: { 'Authorization': localStorage.getItem('token') } });
  };

  if (!ruta) return <div className="min-h-screen bg-sorrel-light flex items-center justify-center font-serif text-2xl text-sorrel-dark animate-pulse">Cargando la magia...</div>;

  return (
    <motion.div animate={{ backgroundColor: ruta.isFav ? '#e6f4ca' : '#f5f5f0' }} transition={{ duration: 0.8 }} className="min-h-screen pb-32">
      {/* Hero Image */}
      <div className="relative h-[80vh] w-full">
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1 }} src={ruta.imagen} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <Link to="/feed" className="absolute top-28 left-8 md:left-24 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white/30 transition">
          <ArrowLeft className="w-5 h-5"/>
        </Link>

        <div className="absolute bottom-16 left-8 md:left-24 text-white max-w-5xl">
          <motion.div initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.2 }}>
            <span className="bg-sorrel-green text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 inline-block shadow-lg">{ruta.tipo}</span>
            <h1 className="text-6xl md:text-[5.5rem] font-serif mb-8 leading-[1.1]">{ruta.titulo}</h1>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-base text-gray-300 font-medium">
              <span className="flex items-center gap-3"><MapPin className="w-6 h-6 text-sorrel-green"/> Ubicación: {ruta.provincias || 'Perú'}</span>
              <span className="flex items-center gap-3"><Navigation className="w-6 h-6 text-sorrel-green"/> Punto de Inicio: {ruta.punto_inicio || 'Por definir'}</span>
            </div>
          </motion.div>
        </div>

        <button onClick={toggleFav} className={`absolute bottom-16 right-8 md:right-24 backdrop-blur-md p-6 rounded-full transition-all duration-500 shadow-2xl hover:scale-110 ${ruta.isFav ? 'bg-red-500 text-white' : 'bg-white/10 border border-white/20 text-white hover:bg-white/30'}`}>
           <Heart className={`w-10 h-10 ${ruta.isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 lg:px-0 mt-20">
        <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-4xl font-serif text-sorrel-dark mb-8">Acerca de la Experiencia</h2>
          <p className="text-gray-600 text-xl leading-relaxed whitespace-pre-wrap">{ruta.descripcion}</p>
        </motion.div>
        
        {/* Massive Itinerary Section */}
        <motion.div initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.6 }} className="mt-32">
          <h2 className="text-[4rem] font-serif text-sorrel-dark mb-16 text-center border-b border-gray-300 pb-12">El Gran Itinerario</h2>
          
          <div className="space-y-16">
            {ruta.waypoints && ruta.waypoints.length > 0 ? ruta.waypoints.map((wp, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 lg:gap-16 group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-sorrel-dark text-sorrel-green flex items-center justify-center font-bold font-serif text-3xl shadow-xl group-hover:scale-110 group-hover:bg-sorrel-green group-hover:text-black transition-all duration-500 z-10 shrink-0">{i+1}</div>
                  {i !== ruta.waypoints.length - 1 && <div className="w-1 h-full bg-gray-200 my-4 group-hover:bg-sorrel-green transition-colors duration-500"></div>}
                </div>
                
                <div className="flex-1 pb-16 pt-2">
                  <h3 className="text-4xl md:text-5xl font-serif text-sorrel-dark mb-6 group-hover:text-sorrel-green transition-colors">{wp.nombre}</h3>
                  {wp.descripcion && <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-3xl">{wp.descripcion}</p>}
                  {wp.imagen && <img src={wp.imagen} className="w-full h-80 lg:h-[450px] object-cover rounded-[2.5rem] shadow-xl group-hover:shadow-2xl transition-all duration-700 group-hover:scale-[1.02]"/>}
                </div>
              </div>
            )) : (
              <div className="text-center bg-white p-16 rounded-[3rem] shadow-sm">
                <Navigation className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <p className="text-gray-500 text-2xl font-serif">Esta ruta es de estilo libre y no tiene paradas predefinidas.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Call to action at bottom */}
        <div className="mt-32 bg-sorrel-dark text-white p-12 lg:p-20 rounded-[3rem] flex flex-col md:flex-row items-center justify-between shadow-2xl">
          <div className="mb-8 md:mb-0">
            <h4 className="font-serif text-5xl mb-4 text-sorrel-green">¿Listo para la aventura?</h4>
            <p className="text-gray-400 text-xl">Guárdala en tus favoritos y comienza a hacer las maletas.</p>
          </div>
          <button onClick={toggleFav} className={`px-10 py-6 rounded-2xl font-bold text-xl transition shadow-2xl hover:scale-105 ${ruta.isFav ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-sorrel-green text-black hover:bg-sorrel-greenHover shadow-[0_0_30px_rgba(181,232,83,0.3)]'}`}>
            {ruta.isFav ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
