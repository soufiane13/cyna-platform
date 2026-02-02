import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, CreditCard, MapPin, Clock, LogOut, 
  FileText, Edit2, Trash2, CheckCircle, AlertTriangle, Plus, Settings
} from 'lucide-react';

// Fonction pour récupérer les commandes réelles
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

// 👇 NOUVELLE FONCTION : TÉLÉCHARGER LE PDF
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
    const [orders, setOrders] = useState([]); // État pour les commandes réelles
  
    // 1. Récupération sécurisée
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      console.error("Erreur lecture user", e);
    }
  
    // 2. Fonction pour extraire le nom sans planter
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

  return (
    <div className="min-h-screen bg-cyna-navy pt-[120px] pb-20 px-6">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        
        {/* === SIDEBAR === */}
        <aside className="hidden lg:block h-fit bg-cyna-steel border-r border-white/5 rounded-2xl p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-cyna-cyan flex items-center justify-center text-cyna-navy font-bold text-xl mb-3 shadow-neon">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <h4 className="text-cyna-white font-bold text-lg">{displayName}</h4>
            <p className="text-cyna-text text-xs">{user.email}</p>
          </div>

          <div className="h-px bg-[#2D333B] my-6"></div>

          <nav className="space-y-2">
            <NavItem icon={<User size={20} />} label="Informations personnelles" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <NavItem icon={<Shield size={20} />} label="Mes abonnements SaaS" active={activeTab === 'subs'} onClick={() => setActiveTab('subs')} />
            <NavItem icon={<CreditCard size={20} />} label="Paiement & Adresses" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
            <NavItem icon={<Clock size={20} />} label="Historique commandes" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            
            <div className="pt-6">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-cyna-error hover:bg-cyna-error/10 transition-colors">
                <LogOut size={20} />
                <span className="font-medium">Se déconnecter</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* === MOBILE MENU === */}
        <div className="lg:hidden flex overflow-x-auto gap-4 pb-4 mb-4 scrollbar-hide">
          {['profile', 'subs', 'billing', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold border ${activeTab === tab ? 'bg-cyna-cyan/10 text-cyna-cyan border-cyna-cyan' : 'bg-cyna-steel text-cyna-text border-white/5'}`}
            >
              {tab === 'profile' && 'Profil'}
              {tab === 'subs' && 'Abonnements'}
              {tab === 'billing' && 'Paiement'}
              {tab === 'history' && 'Historique'}
            </button>
          ))}
        </div>

        {/* === MAIN CONTENT AREA === */}
        <main className="animate-fade-in">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${active ? 'bg-cyna-cyan/10 text-cyna-cyan border-l-[3px] border-cyna-cyan' : 'text-cyna-text hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const ProfileView = ({ user, safeName }) => (
  <div className="bg-cyna-steel rounded-2xl p-8 border border-white/5">
    <h2 className="text-2xl font-bold text-cyna-white mb-8">Mon Profil</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Nom Complet</label>
        <input type="text" defaultValue={safeName} className="w-full h-[52px] bg-cyna-navy border border-[#2D333B] rounded-lg px-4 text-cyna-white focus:border-cyna-cyan focus:outline-none" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Adresse Email</label>
        <input type="email" defaultValue={user.email} className="w-full h-[52px] bg-cyna-navy border border-[#2D333B] rounded-lg px-4 text-cyna-white focus:border-cyna-cyan focus:outline-none" />
        <p className="text-xs text-cyna-text">Changer votre email nécessitera une re-validation.</p>
      </div>
    </div>
    <div className="border-t border-white/5 pt-8">
      <h3 className="text-lg font-bold text-cyna-white mb-4">Sécurité</h3>
      <button className="bg-white/5 border border-white/10 text-cyna-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">Modifier le mot de passe</button>
    </div>
  </div>
);

const SubscriptionsView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-cyna-white mb-6">Mes Abonnements SaaS</h2>
    <div className="bg-cyna-steel rounded-2xl p-6 border border-white/5 border-l-4 border-l-cyna-success flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-cyna-white">Cyna EDR Shield</h3>
          <span className="px-3 py-1 bg-cyna-success/10 text-cyna-success text-xs font-bold rounded-full border border-cyna-success/20">ACTIF</span>
        </div>
        <div className="flex flex-col gap-1 text-sm text-cyna-text">
          <p>Renouvellement le : <span className="text-cyna-white">24 Fév 2026</span></p>
          <p>Plan : <span className="text-cyna-white">Annuel</span></p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 border border-cyna-cyan text-cyna-cyan font-bold rounded-lg hover:bg-cyna-cyan hover:text-cyna-navy transition-all text-sm">Upgrade</button>
        <button className="p-2 text-cyna-text hover:text-cyna-white transition-colors bg-white/5 rounded-lg"><Settings size={20} /></button>
      </div>
    </div>
  </div>
);

const BillingView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-cyna-white flex items-center gap-2"><CreditCard size={20} className="text-cyna-cyan" /> Méthodes de paiement</h3>
      <div className="bg-cyna-steel p-5 rounded-xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-black">VISA</div>
          <span className="text-cyna-white font-mono">**** 4242</span>
        </div>
        <button className="text-cyna-text hover:text-cyna-error"><Trash2 size={18}/></button>
      </div>
      <button className="w-full py-4 border border-dashed border-white/20 rounded-xl text-cyna-text hover:text-cyna-cyan hover:border-cyna-cyan transition-colors flex items-center justify-center gap-2"><Plus size={20} /> Ajouter une carte</button>
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-cyna-white flex items-center gap-2"><MapPin size={20} className="text-cyna-cyan" /> Carnet d'adresses</h3>
      <div className="bg-cyna-steel p-5 rounded-xl border border-white/5 relative group">
        <p className="font-bold text-cyna-white">Siège Social</p>
        <p className="text-cyna-text text-sm mt-1">12 Avenue des Champs-Élysées<br/>75008 Paris, France</p>
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 bg-cyna-navy rounded text-cyna-cyan"><Edit2 size={14}/></button>
          <button className="p-1.5 bg-cyna-navy rounded text-cyna-error"><Trash2 size={14}/></button>
        </div>
      </div>
      <button className="w-full py-4 border border-dashed border-white/20 rounded-xl text-cyna-text hover:text-cyna-cyan hover:border-cyna-cyan transition-colors flex items-center justify-center gap-2"><Plus size={20} /> Ajouter une adresse</button>
    </div>
  </div>
);

const HistoryView = ({ orders }) => {
  const getOrdersByYear = (year) => orders.filter(o => o.created_at.includes(year));
  const currentYear = new Date().getFullYear().toString();
  const lastYear = (new Date().getFullYear() - 1).toString();
  const ordersCurrent = getOrdersByYear(currentYear);
  const ordersLast = getOrdersByYear(lastYear);

  if (orders.length === 0) {
      return (
          <div className="text-center py-20 bg-cyna-steel rounded-2xl border border-white/5">
              <Clock size={48} className="mx-auto text-cyna-text mb-4 opacity-50"/>
              <h3 className="text-xl font-bold text-cyna-white">Aucune commande</h3>
              <p className="text-cyna-text mt-2">Vous n'avez pas encore effectué d'achat.</p>
          </div>
      );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-cyna-white mb-8">Historique des commandes</h2>
      {ordersCurrent.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-cyna-text mb-4 sticky top-0">{currentYear}</h3>
            <div className="space-y-3">{ordersCurrent.map(order => <OrderRow key={order.id} order={order} />)}</div>
          </div>
      )}
      {ordersLast.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-cyna-text mb-4 sticky top-0">{lastYear}</h3>
            <div className="space-y-3">{ordersLast.map(order => <OrderRow key={order.id} order={order} />)}</div>
          </div>
      )}
    </div>
  );
};

const OrderRow = ({ order }) => {
    const productNames = order.order_items 
        ? order.order_items.map(i => i.products?.name || "Produit").join(', ') 
        : "Commande";

    return (
      <div className="bg-cyna-steel border border-white/5 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyna-navy rounded-lg flex items-center justify-center text-cyna-cyan">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-cyna-white">{productNames}</p>
            <p className="text-xs text-cyna-text">#{order.id} • {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 ml-auto">
          <p className="font-bold text-cyna-white">{Number(order.total).toFixed(2)} €</p>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'completed' || order.status === 'paid' || order.status === 'pending' ? 'bg-cyna-success/10 text-cyna-success' : 'bg-cyna-text/10 text-cyna-text'}`}>
            {order.status === 'pending' ? 'En attente' : 'Payé'}
          </span>
          {/* 👇 BOUTON TÉLÉCHARGEMENT CONNECTÉ ICI 👇 */}
          <button 
            onClick={() => downloadInvoice(order.id)}
            className="text-cyna-text hover:text-cyna-cyan transition-colors" 
            title="Télécharger Facture"
          >
            <FileText size={20} />
          </button>
        </div>
      </div>
    );
};

export default Dashboard;