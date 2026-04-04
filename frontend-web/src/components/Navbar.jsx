import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Shield, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ==========================================
  // 1. LOGIQUE BACK-END (SAFE USER RETRIEVAL)
  // ==========================================
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.error("Error parsing user data", e);
    // If corrupt, we clear it so the site works on reload
    localStorage.removeItem('user');
  }

  // 2. SAFE NAME LOGIC
  const getSafeName = () => {
    const fallback = user?.user_metadata?.role === 'admin' ? 'Admin' : 'Client';
    if (!user || !user.user_metadata) return fallback;
    
    const nameData = user.user_metadata.full_name;
    
    // If string (Normal)
    if (typeof nameData === 'string' && nameData.trim() !== '') return nameData;
    
    // If object (Supabase weirdness)
    if (typeof nameData === 'object' && nameData?.full_name) return nameData.full_name;
    
    return fallback;
  };

  const displayName = getSafeName();
  // Get initial or default to 'U'
  const displayInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const isAdmin = user?.user_metadata?.role === 'admin';

  // ==========================================
  // 3. AFFICHAGE (UI / FRONT-END)
  // ==========================================
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 h-20 lg:h-28 flex items-center justify-between">
        
        {/* === LOGO === */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg border-2 border-cyna-cyan flex items-center justify-center text-cyna-cyan group-hover:bg-cyna-cyan group-hover:text-black transition-all">
            <Shield className="w-4 h-4 lg:w-6 lg:h-6" />
          </div>
          <span className="text-xl lg:text-2xl font-black text-white tracking-wider italic">
            CYNA<span className="text-cyna-cyan">DEFENSE</span>
          </span>
        </Link>

        {/* === BUREAU : LIENS === */}
        <div className="hidden lg:flex items-center gap-10">
          <Link to="/" className="text-sm font-bold text-white hover:text-cyna-cyan transition-colors uppercase tracking-widest">
            Accueil
          </Link>
          <Link to="/category/all" className="text-sm font-bold text-gray-300 hover:text-cyna-cyan transition-colors uppercase tracking-widest">
            Catégories
          </Link>
        </div>

        {/* === BUREAU : ACTIONS & AUTH === */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/search" className="text-gray-300 hover:text-cyna-cyan transition-colors flex items-center gap-2">
            <Search size={22} />
            <span className="text-sm font-bold uppercase tracking-widest">Recherche</span>
          </Link>

          {/* Vrai Panier Connecté */}
          <Link to="/cart" className="relative text-gray-300 hover:text-cyna-cyan transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-cyna-cyan text-[#0B0E14] text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Vraie Gestion de Connexion */}
          <div className="flex items-center gap-4 border-l border-white/10 pl-6 ml-2">
            {user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white leading-tight">{displayName}</span>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-xs text-cyna-cyan hover:text-white transition-colors">
                    {isAdmin ? 'Mon Espace Admin' : 'Mon Espace Client'}
                  </Link>
                </div>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="w-10 h-10 rounded-xl bg-cyna-cyan/10 border border-cyna-cyan/30 flex items-center justify-center text-cyna-cyan font-black hover:bg-cyna-cyan hover:text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] relative group">
                  {displayInitial}
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00FF94] border-2 border-[#0B0E14] rounded-full"></span>
                </Link>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2.5 bg-cyna-cyan hover:bg-white text-[#0B0E14] font-black rounded-lg transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] text-sm uppercase tracking-wider">
                Se connecter
              </Link>
            )}
          </div>
        </div>

        {/* === MOBILE : ICONS === */}
        <div className="flex items-center gap-6 lg:hidden">
          <Link to="/cart" className="relative text-gray-300 hover:text-cyna-cyan transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-cyna-cyan text-[#0B0E14] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-white hover:text-cyna-cyan transition-colors p-1"
          >
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

      </div>

      {/* === MOBILE : MENU DÉROULANT === */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 w-full bg-[#0B0E14]/95 backdrop-blur-xl border-t border-b border-white/10 flex flex-col px-6 py-8 shadow-2xl">
          
          {/* Vraie Gestion Auth Mobile */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
            {user ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-cyna-cyan/10 border border-cyna-cyan/30 flex items-center justify-center text-cyna-cyan font-black text-lg">
                  {displayInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{displayName}</span>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-cyna-cyan">
                    {isAdmin ? 'Mon Espace Admin' : 'Mon Espace Client'}
                  </Link>
                </div>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center px-6 py-3 bg-cyna-cyan text-[#0B0E14] font-black rounded-lg text-sm uppercase tracking-wider">
                Se connecter
              </Link>
            )}
          </div>
          
          <div className="flex bg-[#1C2128] border border-white/10 rounded-xl h-14 px-4 items-center gap-3 mb-8">
             <Search size={20} className="text-gray-400" />
             <input type="text" placeholder="Recherche de services..." className="bg-transparent text-white w-full focus:outline-none text-base" />
          </div>

          <div className="flex flex-col gap-6">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-white uppercase tracking-widest hover:text-cyna-cyan">Accueil</Link>
            <Link to="/category/all" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-gray-300 uppercase tracking-widest hover:text-cyna-cyan">Catégories</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
