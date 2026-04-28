import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Box, LogOut, User, MessageSquareText } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Permet de mettre en surbrillance le lien actif
  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-28 bg-[#0B0E14] text-white flex flex-col lg:flex-row font-sans selection:bg-cyna-cyan selection:text-black">
      
      {/* === MENU MOBILE (TABS) === */}
      <div className="lg:hidden flex overflow-x-auto gap-3 p-4 border-b border-[#2D333B] bg-[#1C2128] scrollbar-hide sticky top-20 z-40">
         <Link to="/admin" className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${isActive('/admin') ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-[#0B0E14] text-[#A0A0A0] border-[#2D333B] hover:text-white'}`}>Vue d'ensemble</Link>
         <Link to="/admin/orders" className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${isActive('/admin/orders') ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-[#0B0E14] text-[#A0A0A0] border-[#2D333B] hover:text-white'}`}>Commandes</Link>
         <Link to="/admin/products" className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${isActive('/admin/products') ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-[#0B0E14] text-[#A0A0A0] border-[#2D333B] hover:text-white'}`}>Produits</Link>
         <Link to="/admin/users" className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${isActive('/admin/users') ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-[#0B0E14] text-[#A0A0A0] border-[#2D333B] hover:text-white'}`}>Utilisateurs</Link>
         <Link to="/admin/messages" className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${isActive('/admin/messages') ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-[#0B0E14] text-[#A0A0A0] border-[#2D333B] hover:text-white'}`}>Support</Link>
      </div>

      {/* === SIDEBAR ADMIN (DESKTOP) === */}
      <aside className="hidden lg:flex w-64 bg-[#1C2128] border-r border-[#2D333B] flex-col sticky top-28 h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="p-6 border-b border-[#2D333B]">
          <h2 className="text-xl font-black text-cyna-cyan tracking-widest uppercase">Backoffice</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 font-bold">
          <Link to="/admin" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive('/admin') ? 'bg-cyna-cyan/10 text-cyna-cyan' : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'}`}><LayoutDashboard size={20} /> Vue d'ensemble</Link>
          <Link to="/admin/orders" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive('/admin/orders') ? 'bg-cyna-cyan/10 text-cyna-cyan' : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'}`}><ShoppingCart size={20} /> Commandes</Link>
          <Link to="/admin/products" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive('/admin/products') ? 'bg-cyna-cyan/10 text-cyna-cyan' : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'}`}><Box size={20} /> Produits</Link>
          <Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive('/admin/users') ? 'bg-cyna-cyan/10 text-cyna-cyan' : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'}`}><Users size={20} /> Utilisateurs</Link>
          <Link to="/admin/messages" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive('/admin/messages') ? 'bg-cyna-cyan/10 text-cyna-cyan' : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'}`}><MessageSquareText size={20} /> Support & Chat</Link>
          <div className="my-2 border-t border-[#2D333B]"></div>
          <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-cyna-cyan/10 transition-colors text-cyna-cyan border border-cyna-cyan/20"><User size={20} /> Mon Profil</Link>
        </nav>
        <div className="p-4 border-t border-[#2D333B]">
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-xl text-[#FF3B3B] hover:bg-[#FF3B3B]/10 transition-colors font-bold">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU DYNAMIQUE (Les Vues) */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;