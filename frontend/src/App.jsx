import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Create from './pages/Create';
import Auth from './pages/Auth';
import RouteDetail from './pages/RouteDetail';

export default function App() {
  const [nodo, setNodo] = useState('...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.user);
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <Navbar nodo={nodo} user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth setUser={setUser} />} />
        <Route path="/feed" element={<Feed user={user} setNodo={setNodo} filter="all" />} />
        <Route path="/me" element={<Feed user={user} setNodo={setNodo} filter="me" />} />
        <Route path="/favs" element={<Feed user={user} setNodo={setNodo} filter="favs" />} />
        <Route path="/create" element={<Create user={user} />} />
        <Route path="/ruta/:id" element={<RouteDetail user={user} setNodo={setNodo} />} />
      </Routes>
    </BrowserRouter>
  );
}
