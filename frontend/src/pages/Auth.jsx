import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ user: '', pass: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(isLogin ? '/api/login' : '/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    if (res.ok) {
      if (isLogin) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        setUser(payload.user);
        window.location.href = '/feed';
      } else {
        alert('Registrado con éxito. Ahora inicia sesión.');
        setIsLogin(true);
      }
    } else alert('Error en credenciales o usuario existente');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sorrel-light pt-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[2rem] w-full max-w-md shadow-2xl border border-gray-100">
        <h2 className="text-4xl font-serif text-sorrel-dark mb-2">{isLogin ? 'Welcome back.' : 'Join Sorrel.'}</h2>
        <p className="text-gray-500 mb-8">{isLogin ? 'Ingresa para continuar.' : 'Dos simples campos, acceso total.'}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Usuario</label>
            <input type="text" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:border-sorrel-green focus:bg-white outline-none transition" onChange={e => setForm({...form, user: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Contraseña</label>
            <input type="password" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:border-sorrel-green focus:bg-white outline-none transition" onChange={e => setForm({...form, pass: e.target.value})} required />
          </div>
          <button className="bg-sorrel-green text-black font-bold py-4 rounded-xl mt-4 hover:bg-sorrel-greenHover transition flex justify-center items-center gap-2 shadow-lg">
            {isLogin ? 'Ingresar al sistema' : 'Registrarse ahora'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-500 cursor-pointer hover:text-black transition" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Crear una cuenta nueva' : 'Ya tengo cuenta, iniciar sesión'}
        </p>
      </motion.div>
    </div>
  );
}
