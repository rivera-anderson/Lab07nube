import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Server, User, LogOut, Compass, Heart, Map } from 'lucide-react';

export default function Navbar({ nodo, user, onLogout }) {
  const loc = useLocation();
  const isDark = loc.pathname === '/' || loc.pathname === '/create';
  
  return (
    <motion.nav initial={{y:-50}} animate={{y:0}} className={`fixed top-0 w-full p-6 lg:px-12 flex justify-between items-center z-50 transition-colors duration-500 ${isDark ? 'text-white bg-black/30 backdrop-blur-md' : 'text-sorrel-dark bg-sorrel-light/80 backdrop-blur-md border-b border-gray-200'}`}>
      <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight hover:scale-105 transition">
        <div className="w-8 h-8 bg-sorrel-green rounded-full flex items-center justify-center text-black">
          <Leaf className="w-4 h-4" />
        </div>
        <span className="font-serif">Peru Vibe</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-10 font-medium text-sm">
        <Link to="/feed" className="hover:text-sorrel-green transition flex items-center gap-2"><Compass className="w-4 h-4"/> Feed Principal</Link>
        {user && (
          <>
            <Link to="/me" className="hover:text-sorrel-green transition flex items-center gap-2"><Map className="w-4 h-4"/> Mis Rutas</Link>
            <Link to="/favs" className="hover:text-sorrel-green transition flex items-center gap-2"><Heart className="w-4 h-4"/> Favoritos</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 ${isDark ? 'bg-black/50 border-white/20' : 'bg-white border-gray-300'}`}>
          <Server className="w-3 h-3 text-sorrel-green animate-pulse" /> NODO {nodo}
        </span>
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5 text-sorrel-dark'}`}>
              <div className="w-5 h-5 bg-sorrel-green rounded-full flex items-center justify-center text-black"><User className="w-3 h-3"/></div>
              {user}
            </span>
            <button onClick={onLogout} className="hover:text-red-500 transition"><LogOut className="w-5 h-5"/></button>
          </div>
        ) : (
          <Link to="/auth" className="bg-sorrel-green text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-sorrel-greenHover transition shadow-lg">
            Ingresar
          </Link>
        )}
      </div>
    </motion.nav>
  );
}
