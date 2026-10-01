import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-sorrel-light text-sorrel-dark">
      {/* Hero */}
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2 }} src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-32 z-10 text-white">
          <motion.h1 initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} className="text-6xl md:text-8xl font-serif font-light leading-[1.1] max-w-4xl">
            Rutas that<br />hold the <span className="text-sorrel-green relative inline-block">magia.<span className="absolute bottom-2 left-0 w-full h-[3px] bg-sorrel-green"></span></span>
          </motion.h1>
          <motion.p initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.2 }} className="mt-8 max-w-md text-lg text-gray-300 font-light">
            Una colección pequeña, considerada y curada de destinos. Sin ruido, solo experiencias auténticas y exclusivas.
          </motion.p>
          <motion.div initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.3 }}>
            <Link to="/feed" className="mt-10 bg-sorrel-green text-black w-fit px-8 py-4 rounded-full font-semibold hover:bg-sorrel-greenHover transition hover:scale-105 flex items-center gap-3">
              Descubrir Colección <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="px-8 lg:px-32 py-32 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif mb-4">From first look to journey.</h2>
        <p className="text-gray-500 mb-16 max-w-lg">Tres pasos sencillos. Sin presiones, sin jerga. Solo un camino tranquilo hacia tu próxima aventura inolvidable.</p>
        
        <div className="border-t border-gray-300 pt-10 flex flex-col md:flex-row gap-8 md:gap-32 group hover:bg-white/50 p-4 transition rounded-2xl">
          <h3 className="text-5xl font-serif text-sorrel-green w-24">01</h3>
          <div>
            <h4 className="text-2xl font-medium mb-2">Descubrir</h4>
            <p className="text-gray-500 max-w-md">Dinos qué buscas y te mostraremos solo las rutas que valen tu tiempo. Filtramos el ruido del turismo masivo.</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-10 mt-4 flex flex-col md:flex-row gap-8 md:gap-32 group hover:bg-white/50 p-4 transition rounded-2xl">
          <h3 className="text-5xl font-serif text-sorrel-green w-24">02</h3>
          <div>
            <h4 className="text-2xl font-medium mb-2">Planificar</h4>
            <p className="text-gray-500 max-w-md">Organizamos todo el itinerario, hoteles y paradas secretas a tu propio ritmo. Sin apuros.</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-10 mt-4 flex flex-col md:flex-row gap-8 md:gap-32 border-b pb-10 group hover:bg-white/50 p-4 transition rounded-2xl">
          <h3 className="text-5xl font-serif text-sorrel-green w-24">03</h3>
          <div>
            <h4 className="text-2xl font-medium mb-2">Viajar</h4>
            <p className="text-gray-500 max-w-md">Nosotros manejamos la logística y los detalles pesados. Tú simplemente haces las maletas y disfrutas.</p>
          </div>
        </div>
      </div>

      {/* Dark Testimonial Section */}
      <div className="bg-sorrel-dark text-white px-8 lg:px-32 py-32 flex flex-col lg:flex-row gap-20 rounded-t-[3rem]">
        <div className="flex-1">
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-12">
            Peru Vibe nos encontró una ruta por la que habíamos caminado años sin saber que era nuestra. <span className="text-sorrel-green border-b border-sorrel-green pb-1">Un secreto revelado.</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-500 rounded-full overflow-hidden">
               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" className="w-full h-full object-cover"/>
            </div>
            <div><p className="font-bold">Anderson & Team</p><p className="text-sm text-gray-400">Exploradores frecuentes</p></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-10 lg:border-l border-white/10 lg:pl-16">
          <div>
             <h3 className="text-6xl font-serif text-sorrel-green mb-2">4.9 <Star className="inline w-8 h-8 fill-current relative -top-2"/></h3>
             <p className="text-gray-400 text-sm tracking-widest uppercase">Calificación promedio</p>
          </div>
          <div className="border-t border-white/10 pt-10">
             <h3 className="text-6xl font-serif text-sorrel-green mb-2">100%</h3>
             <p className="text-gray-400 text-sm tracking-widest uppercase">Garantía de Aventura</p>
          </div>
        </div>
      </div>
    </div>
  );
}
