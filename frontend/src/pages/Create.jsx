import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Create() {
  const [form, setForm] = useState({ titulo: '', tipo: 'Turismo', descripcion: '', imagen: '', provincias: '', punto_inicio: '', waypoints: [] });
  const [uploading, setUploading] = useState(false);
  const nav = useNavigate();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setForm({...form, imagen: data.url});
    setUploading(false);
  };

  const handleWpUpload = async (e, i) => {
    const file = e.target.files[0];
    if(!file) return;
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    updateWp(i, 'imagen', data.url);
  }

  const addWp = () => setForm({...form, waypoints: [...form.waypoints, {nombre: '', descripcion: '', imagen: ''}]});
  const updateWp = (i, field, val) => {
    const nw = [...form.waypoints]; nw[i][field] = val; setForm({...form, waypoints: nw});
  };
  const removeWp = (i) => {
    const nw = [...form.waypoints]; nw.splice(i, 1); setForm({...form, waypoints: nw});
  };

  const submit = async (e) => {
    e.preventDefault();
    await fetch('/api/rutas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') }, body: JSON.stringify(form) });
    nav('/me');
  };

  return (
    <div className="min-h-screen bg-sorrel-dark text-white pt-32 px-8 lg:px-32 pb-32">
      <motion.div initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-serif mb-12">Publicar nueva <span className="text-sorrel-green italic">Ruta</span>.</h2>
        <form onSubmit={submit} className="space-y-12">
          
          {/* Main Details */}
          <div className="space-y-6 bg-white/5 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-serif border-b border-white/10 pb-4 text-sorrel-green">1. Detalles Principales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block font-bold">Título de la Experiencia</label>
                <input required type="text" className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-sorrel-green focus:bg-black/50 outline-none transition" onChange={e => setForm({...form, titulo: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block font-bold">Categoría</label>
                <select className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-sorrel-green outline-none text-white [&>option]:text-black transition" onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option>Turismo</option><option>Gastronomía</option><option>Aventura</option><option>Cultura</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block font-bold">Descripción Completa</label>
                <textarea required className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-sorrel-green focus:bg-black/50 outline-none h-32 resize-none transition" onChange={e => setForm({...form, descripcion: e.target.value})} />
              </div>
            </div>
            
            <div className="pt-4">
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-4 block font-bold">Imagen Principal</label>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {form.imagen && <img src={form.imagen} className="w-48 h-32 object-cover rounded-xl shadow-lg border border-white/10" />}
                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-dashed border-gray-500 p-8 rounded-xl flex flex-col items-center justify-center gap-3 transition w-full md:w-auto flex-1">
                  <Camera className="w-8 h-8 text-sorrel-green" />
                  <span className="text-sm font-medium">{uploading ? 'Subiendo imagen...' : 'Subir foto principal'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} required={!form.imagen} />
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6 bg-white/5 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-serif border-b border-white/10 pb-4 text-sorrel-green">2. Ubicación y Logística</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block font-bold">Departamentos / Provincias</label>
                <input type="text" placeholder="Ej: Cusco, Valle Sagrado" className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-sorrel-green outline-none transition" onChange={e => setForm({...form, provincias: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block font-bold">Punto de Inicio</label>
                <input type="text" placeholder="Ej: Plaza de Armas" className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-sorrel-green outline-none transition" onChange={e => setForm({...form, punto_inicio: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Waypoints */}
          <div className="space-y-6 bg-white/5 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-serif text-sorrel-green">3. El Gran Itinerario</h3>
              <button type="button" onClick={addWp} className="bg-sorrel-green/20 text-sorrel-green px-4 py-2 rounded-full text-sm font-bold hover:bg-sorrel-green/30 flex gap-2 items-center transition"><Plus className="w-4 h-4"/> Añadir Parada</button>
            </div>
            
            <div className="space-y-8">
              {form.waypoints.map((wp, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-8 items-start bg-black/40 p-6 rounded-2xl border border-white/5 relative">
                  <div className="flex items-start gap-4 w-full md:w-2/3">
                    <div className="w-10 h-10 rounded-full bg-sorrel-green text-black flex items-center justify-center font-bold text-lg shrink-0 mt-1">{i+1}</div>
                    <div className="flex-1 space-y-4">
                      <input type="text" placeholder="Título de la parada (Ej: Mirador Cóndor)" className="w-full bg-transparent border-b border-gray-600 p-2 text-xl font-serif focus:border-sorrel-green outline-none" value={wp.nombre} onChange={e => updateWp(i, 'nombre', e.target.value)} required />
                      <textarea placeholder="Describe lo que se hará en esta parada..." className="w-full bg-black/20 border border-white/10 p-4 rounded-xl focus:border-sorrel-green outline-none h-24 resize-none" value={wp.descripcion} onChange={e => updateWp(i, 'descripcion', e.target.value)} required />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                    {wp.imagen ? (
                      <div className="relative w-full">
                        <img src={wp.imagen} className="w-full h-32 rounded-xl object-cover" />
                        <button type="button" onClick={() => updateWp(i, 'imagen', '')} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black/80"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-white/10 w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 text-sm hover:bg-white/20 transition">
                        <Camera className="w-6 h-6"/> Subir foto de parada
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleWpUpload(e, i)} />
                      </label>
                    )}
                    <button type="button" onClick={() => removeWp(i)} className="text-red-500 hover:text-red-400 flex items-center gap-2 text-sm font-bold"><Trash2 className="w-4 h-4"/> Eliminar parada completa</button>
                  </div>
                </div>
              ))}
              {form.waypoints.length === 0 && <p className="text-gray-500 text-sm italic text-center">Tu itinerario está vacío. Haz que tu ruta destaque agregando paradas detalladas.</p>}
            </div>
          </div>

          <button type="submit" className="w-full bg-sorrel-green text-black font-bold py-6 rounded-2xl text-xl hover:bg-sorrel-greenHover transition shadow-[0_0_30px_rgba(181,232,83,0.2)] hover:scale-[1.02]">
            Publicar Experiencia Oficial
          </button>
        </form>
      </motion.div>
    </div>
  );
}
