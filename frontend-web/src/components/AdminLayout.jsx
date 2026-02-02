import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Box, FileText, Users, MessageSquare, 
  Bell, Search, ChevronRight, LogOut, Settings 
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Items
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Box size={20} />, label: 'Products', path: '/admin/products' },
    { icon: <FileText size={20} />, label: 'Orders', path: '/admin/orders' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/admin/messages' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user'); // Ou admin_token
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-[#00F0FF] selection:text-[#0B0E14]">
      
      {/* === A. SIDEBAR (Fixed 260px) === */}
      <aside className="w-[260px] bg-[#1C2128] border-r border-white/5 flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="h-[64px] flex items-center px-6 border-b border-white/5">
          <div className="w-6 h-6 bg-[#00F0FF] rounded flex items-center justify-center text-[#0B0E14] font-black text-[10px] mr-3">A</div>
          <span className="font-bold tracking-wider text-sm text-[#F0F6FC]">CYNA <span className="text-[#00F0FF]">ADMIN</span></span>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-[#00F0FF]/5 text-[#00F0FF] border-l-2 border-[#00F0FF]' 
                    : 'text-[#8B949E] hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/5">
            <button onClick={handleLogout} className="flex items-center gap-3 text-[#FF3B3B] hover:bg-[#FF3B3B]/10 w-full px-4 py-3 rounded-lg text-sm transition-colors">
                <LogOut size={18} />
                Déconnexion
            </button>
        </div>
      </aside>

      {/* === MAIN CONTENT WRAPPER === */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        
        {/* === B. TOPBAR (Glassmorphism) === */}
        <header className="h-[64px] sticky top-0 z-10 flex items-center justify-between px-8 border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-md">
            
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-[#8B949E]">
                <span className="hover:text-white cursor-pointer">Admin</span>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-[#00F0FF] font-medium capitalize">
                    {location.pathname.split('/').pop() || 'Dashboard'}
                </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="hidden md:flex items-center bg-[#1C2128] rounded-full px-3 py-1.5 border border-white/10 focus-within:border-[#00F0FF]/50 transition-colors">
                    <Search size={14} className="text-[#8B949E] mr-2" />
                    <input type="text" placeholder="Quick search..." className="bg-transparent border-none outline-none text-xs text-white w-32 placeholder-[#8B949E]" />
                </div>

                {/* Notifications */}
                <button className="relative text-[#8B949E] hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]"></span>
                </button>

                {/* Profile Dropdown Trigger */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00F0FF] to-blue-600 border border-white/10 cursor-pointer"></div>
            </div>
        </header>

        {/* === C. PAGE CONTENT === */}
        <main className="flex-1 p-8 overflow-y-auto">
            <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;