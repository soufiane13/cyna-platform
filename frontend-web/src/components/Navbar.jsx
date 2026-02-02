import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react'; // Removed User icon, we make a custom avatar
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // 1. SAFE USER RETRIEVAL (Prevents crashes if localStorage is weird)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.error("Error parsing user data", e);
    // If corrupt, we clear it so the site works on reload
    localStorage.removeItem('user');
  }

  // 2. SAFE NAME LOGIC (Matches Dashboard logic)
  const getSafeName = () => {
    if (!user || !user.user_metadata) return 'Client';
    
    const nameData = user.user_metadata.full_name;
    
    // If string (Normal)
    if (typeof nameData === 'string') return nameData;
    
    // If object (Supabase weirdness)
    if (typeof nameData === 'object' && nameData?.full_name) return nameData.full_name;
    
    return 'Client';
  };

  const displayName = getSafeName();
  // Get initial or default to 'U'
  const displayInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <nav className="sticky top-0 z-50 w-full h-[80px] bg-cyna-navy/85 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        
        {/* === LEFT: LOGO === */}
        <Link to="/" className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-cyna-cyan rounded flex items-center justify-center text-cyna-navy font-black text-xs">C</div>
          <span>CYNA <span className="text-cyna-cyan">DEFENSE</span></span>
        </Link>

        {/* === CENTER: LINKS (Hidden on Mobile) === */}
        <div className="hidden lg:flex items-center gap-8">
          {['Accueil', 'Catégories', 'Recherche'].map((link) => (
            <Link key={link} to="/" className="text-cyna-white hover:text-cyna-cyan transition-colors text-sm font-medium">
              {link}
            </Link>
          ))}
        </div>

        {/* === RIGHT: ACTIONS === */}
        <div className="flex items-center gap-6">
          
          {/* Search Input */}
          <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-2 w-[240px] border border-transparent focus-within:border-cyna-cyan/50 transition-colors">
            <Search size={16} className="text-cyna-text mr-2" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-transparent border-none outline-none text-cyna-white text-sm w-full placeholder-gray-600"
            />
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="relative cursor-pointer hover:text-cyna-cyan text-cyna-white transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-cyna-cyan text-cyna-navy text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_#00F0FF]">
                {cartCount}
              </span>
            )}
          </Link>

          {/* === AUTH SECTION === */}
          {user ? (
            // LOGGED IN: Show Profile Link (Name + Avatar)
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
            >
              <div className="text-right hidden md:block">
                <span className="block text-xs text-cyna-text group-hover:text-cyna-cyan transition-colors">Opérateur</span>
                <span className="block text-sm font-bold text-cyna-white">{displayName}</span>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyna-cyan to-blue-600 flex items-center justify-center text-cyna-navy font-bold shadow-neon">
                {displayInitial}
              </div>
            </Link>
          ) : (
            // GUEST: Show Login Button
            <Link 
              to="/login" 
              className="w-[100px] h-[40px] flex items-center justify-center bg-cyber-gradient text-cyna-navy font-bold text-sm rounded-lg hover:shadow-neon transition-all"
            >
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;