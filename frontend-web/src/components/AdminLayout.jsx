import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Box, LogOut, User } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex font-sans selection:bg-cyna-cyan selection:text-black">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-[#1C2128] border-r border-[#2D333B] flex flex-col">
        <div className="p-6 border-b border-[#2D333B]">
          <h2 className="text-xl font-black text-cyna-cyan tracking-widest uppercase">Backoffice</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 font-bold">
          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#A0A0A0] hover:text-white"><LayoutDashboard size={20} /> Vue d'ensemble</Link>
          <Link to="/admin/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#A0A0A0] hover:text-white"><ShoppingCart size={20} /> Commandes</Link>
          <Link to="/admin/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#A0A0A0] hover:text-white"><Box size={20} /> Produits</Link>
          <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#A0A0A0] hover:text-white"><Users size={20} /> Utilisateurs</Link>
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