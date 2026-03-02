import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, MapPin, Clock, LogOut,
  FileText, Edit2, Trash2, Plus, Settings, Download, AlertCircle, ShieldCheck
} from 'lucide-react';

// ==========================================
// 1. LOGIQUE BACK-END (API APPELS)
// ==========================================
const fetchUserOrders = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/orders/${userId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Erreur fetch commandes:", error);
    return [];
  }
};

const downloadInvoice = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:3000/orders/${orderId}/invoice`);
    if (!response.ok) throw new Error("Erreur téléchargement");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture_cyna_${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur PDF:", error);
    alert("Impossible de télécharger la facture. Vérifiez que le Backend tourne.");
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);

  // --- RÉCUPÉRATION SÉCURISÉE DU USER ---
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.error("Erreur lecture user", e);
  }

  const getSafeName = () => {
    if (!user || !user.user_metadata) return 'Utilisateur';
    const nameData = user.user_metadata.full_name;
    if (typeof nameData === 'string') return nameData;
    if (typeof nameData === 'object' && nameData?.full_name) return nameData.full_name;
    return 'Utilisateur';
  };

  const displayName = getSafeName();

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cyna_cart');
    navigate('/login');
    window.location.reload();
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Charger l'historique réel si on est sur l'onglet history
    if (activeTab === 'history') {
      fetchUserOrders(user.id).then(data => setOrders(data));
    }
    // TODO: Tu pourras ajouter un fetchUserSubscriptions(user.id) ici plus tard !
  }, [user, navigate, activeTab]);

  if (!user) return null;

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileView user={user} safeName={displayName} />;
      case 'subs': return <SubscriptionsView />;
      case 'billing': return <BillingView />;
      case 'history': return <HistoryView orders={orders} />;
      default: return <ProfileView user={user} safeName={displayName} />;
    }
  };

  // ==========================================
  // 2. AFFICHAGE (UI / FRONT-END RESPONSIVE)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pt-[100px] lg:pt-[140px] pb-20 px-6 font-sans selection:bg-cyna-cyan selection:text-black">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">

        {/* === SIDEBAR (DESKTOP) === */}
        <aside className="hidden lg:flex flex-col h-fit bg-[#1C2128] border border-[#2D333B] rounded-[24px] p-6 shadow-2xl sticky top-[140px]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyna-cyan/10 border-2 border-cyna-cyan flex items-center justify-center text-cyna-cyan font-black text-2xl mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <h4 className="text-white font-bold text-lg">{displayName}</h4>
            <p className="text-[#A0A0A0] text-sm">{user.email}</p>
          </div>

          <div className="h-px bg-[#2D333B] w-full mb-6"></div>

          <nav className="space-y-2 flex-1">
            <NavItem icon={<User size={20} />} label="Informations" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <NavItem icon={<ShieldCheck size={20} />} label="Abonnements SaaS" active={activeTab === 'subs'} onClick={() => setActiveTab('subs')} />
            <NavItem icon={<CreditCard size={20} />} label="Facturation" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
            <NavItem icon={<Clock size={20} />} label="Historique" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />

            <div className="pt-8 mt-8 border-t border-[#2D333B]">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#FF3B3B] hover:bg-[#FF3B3B]/10 transition-colors group">
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Se déconnecter</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* === MOBILE MENU (TABS) === */}
        <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 mb-4 scrollbar-hide">
          {['profile', 'subs', 'billing', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-3 rounded-xl text-sm font-bold border transition-all ${activeTab === tab
                  ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'bg-[#1C2128] text-[#A0A0A0] border-[#2D333B] hover:text-white'
                }`}
            >
              {tab === 'profile' && 'Profil'}
              {tab === 'subs' && 'Abonnements'}
              {tab === 'billing' && 'Paiement'}
              {tab === 'history' && 'Historique'}
            </button>
          ))}
        </div>

        {/* === MAIN CONTENT AREA === */}
        <main className="animate-fade-in w-full">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

// ==========================================
// 3. SOUS-COMPOSANTS DU DASHBOARD
// ==========================================

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold ${active
        ? 'bg-cyna-cyan/10 text-cyna-cyan border border-cyna-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.05)]'
        : 'text-[#A0A0A0] hover:text-white hover:bg-white/5 border border-transparent'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ProfileView = ({ user, safeName }) => (
  <div className="bg-[#1C2128] rounded-[24px] p-6 md:p-10 border border-[#2D333B] shadow-2xl">
    <h2 className="text-2xl lg:text-3xl font-black text-white mb-8">Informations Personnelles</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Nom Complet (Contact Légal)</label>
        <input type="text" defaultValue={safeName} className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">Adresse Email</label>
        <input type="email" defaultValue={user.email} disabled className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-gray-500 font-medium cursor-not-allowed opacity-70" />
        <p className="text-[11px] text-[#A0A0A0] flex items-center gap-1.5"><AlertCircle size={12} /> Liée à votre authentification Supabase.</p>
      </div>
    </div>

    <div className="border-t border-white/5 pt-8">
      <h3 className="text-lg font-bold text-white mb-4">Sécurité du compte</h3>
      <button className="bg-white/5 border border-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">Modifier le mot de passe</button>
    </div>
  </div>
);

const SubscriptionsView = () => (
  <div className="space-y-8">
    <h2 className="text-2xl lg:text-3xl font-black text-white">Mes Abonnements SaaS</h2>

    {/* Carte d'Abonnement (Prête à être mappée avec la table subscriptions) */}
    <div className="bg-[#1C2128] rounded-[24px] p-6 md:p-8 border border-[#2D333B] relative overflow-hidden group">
      {/* Liseré vert sur le côté */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00FF94]"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl md:text-2xl font-black text-white">CYNA EDR Premium</h3>
            <span className="px-3 py-1 bg-[#00FF94]/10 text-[#00FF94] text-[10px] uppercase tracking-widest font-black rounded-md border border-[#00FF94]/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></span> ACTIF
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-[#A0A0A0] font-medium">
            <p>Facturation : <span className="text-white">Mensuelle</span></p>
            <p className="hidden sm:block">•</p>
            <p>Prochain cycle : <span className="text-white">24 Mars 2026</span></p>
            <p className="hidden sm:block">•</p>
            <p>Licences : <span className="text-white">50 postes</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-white/5 lg:border-none">
          <button className="flex-1 lg:flex-none px-6 py-3 border border-cyna-cyan text-cyna-cyan font-bold rounded-xl hover:bg-cyna-cyan hover:text-[#0B0E14] transition-all text-sm uppercase tracking-wider">
            Gérer le plan
          </button>
          <button className="p-3 text-[#A0A0A0] hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl">
            <Settings size={20} />
          </button>
        </div>

      </div>
    </div>
  </div>
);

const BillingView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-6">
      <h3 className="text-xl font-black text-white flex items-center gap-3">
        <CreditCard size={24} className="text-cyna-cyan" /> Méthodes de paiement
      </h3>

      <div className="bg-[#1C2128] p-6 rounded-[20px] border border-[#2D333B] flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center text-[10px] font-black text-[#0B0E14] shadow-inner">VISA</div>
          <div className="flex flex-col">
            <span className="text-white font-mono font-bold">**** **** **** 4242</span>
            <span className="text-[#A0A0A0] text-xs">Expire 12/28</span>
          </div>
        </div>
        <button className="text-[#A0A0A0] hover:text-[#FF3B3B] transition-colors p-2 bg-white/5 rounded-lg"><Trash2 size={18} /></button>
      </div>

      <button className="w-full py-5 border-2 border-dashed border-[#2D333B] rounded-[20px] text-[#A0A0A0] hover:text-cyna-cyan hover:border-cyna-cyan hover:bg-cyna-cyan/5 transition-all flex items-center justify-center gap-2 font-bold">
        <Plus size={20} /> Ajouter une carte
      </button>
    </div>

    <div className="space-y-6">
      <h3 className="text-xl font-black text-white flex items-center gap-3">
        <MapPin size={24} className="text-cyna-cyan" /> Carnet d'adresses
      </h3>

      <div className="bg-[#1C2128] p-6 rounded-[20px] border border-[#2D333B] relative group">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-white uppercase tracking-widest text-xs">Siège Social (Par défaut)</p>
          <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-[#0B0E14] rounded-lg text-cyna-cyan hover:bg-white/10"><Edit2 size={14} /></button>
            <button className="p-2 bg-[#0B0E14] rounded-lg text-[#FF3B3B] hover:bg-white/10"><Trash2 size={14} /></button>
          </div>
        </div>
        <p className="text-[#A0A0A0] text-sm leading-relaxed mt-3">12 Avenue des Champs-Élysées<br />75008 Paris<br />France</p>
      </div>

      <button className="w-full py-5 border-2 border-dashed border-[#2D333B] rounded-[20px] text-[#A0A0A0] hover:text-cyna-cyan hover:border-cyna-cyan hover:bg-cyna-cyan/5 transition-all flex items-center justify-center gap-2 font-bold">
        <Plus size={20} /> Ajouter une adresse
      </button>
    </div>
  </div>
);

const HistoryView = ({ orders }) => {
  const getOrdersByYear = (year) => orders.filter(o => o.created_at && o.created_at.includes(year));
  const currentYear = new Date().getFullYear().toString();
  const lastYear = (new Date().getFullYear() - 1).toString();
  const ordersCurrent = getOrdersByYear(currentYear);
  const ordersLast = getOrdersByYear(lastYear);

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 bg-[#1C2128] rounded-[24px] border border-[#2D333B]">
        <div className="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
          <Clock size={32} className="text-gray-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Aucune commande</h3>
        <p className="text-[#A0A0A0]">Votre historique de facturation est vide.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl lg:text-3xl font-black text-white mb-8">Historique & Factures</h2>

      {ordersCurrent.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-black text-[#A0A0A0] mb-4 uppercase tracking-widest">{currentYear}</h3>
          <div className="space-y-4">{ordersCurrent.map(order => <OrderRow key={order.id} order={order} />)}</div>
        </div>
      )}

      {ordersLast.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-black text-[#A0A0A0] mb-4 uppercase tracking-widest">{lastYear}</h3>
          <div className="space-y-4">{ordersLast.map(order => <OrderRow key={order.id} order={order} />)}</div>
        </div>
      )}
    </div>
  );
};

const OrderRow = ({ order }) => {
  // Sécurité au cas où la structure de ton JSON API serait légèrement différente
  const productNames = order.order_items && order.order_items.length > 0
    ? order.order_items.map(i => i.products?.name || i.products?.nom || "Service SaaS").join(', ')
    : "Commande d'infrastructure";

  const isPaid = order.status === 'completed' || order.status === 'paid';

  return (
    <div className="bg-[#1C2128] border border-[#2D333B] rounded-[20px] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-cyna-cyan/50 transition-all group">

      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-[#0B0E14] rounded-xl flex items-center justify-center text-cyna-cyan border border-white/5 group-hover:bg-cyna-cyan/10 transition-colors">
          <FileText size={24} />
        </div>
        <div>
          <p className="font-bold text-white text-lg line-clamp-1">{productNames}</p>
          <p className="text-xs text-[#A0A0A0] font-mono mt-1">
            Cmd #{order.id} • {new Date(order.created_at || order.date_commande).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-6 md:ml-auto pt-4 md:pt-0 border-t border-white/5 md:border-none">
        <div className="text-left md:text-right">
          <p className="font-bold text-cyna-cyan font-mono text-xl">{Number(order.total).toFixed(2)} €</p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border ${isPaid ? 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
            }`}>
            {isPaid ? 'Payé' : 'En attente'}
          </span>
        </div>

        {/* BOUTON TÉLÉCHARGEMENT CONNECTÉ À L'API NESTJS */}
        <button
          onClick={() => downloadInvoice(order.id)}
          className="flex items-center gap-2 bg-white/5 hover:bg-cyna-cyan hover:text-[#0B0E14] text-white px-4 py-3 rounded-xl transition-all font-bold text-sm"
          title="Télécharger Facture PDF"
        >
          <Download size={18} /> <span className="hidden md:inline">PDF</span>
        </button>
      </div>

    </div>
  );
};

export default Dashboard;


