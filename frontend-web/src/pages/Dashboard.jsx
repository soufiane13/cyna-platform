import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, MapPin, Clock, LogOut,
  FileText, Edit2, Trash2, Plus, Settings, Download, AlertCircle, ShieldCheck, Lock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';


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
  const { t } = useTranslation();

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
  const isAdmin = user?.user_metadata?.role === 'admin';

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

    // Charger l'historique pour l'historique ET les abonnements
    if (activeTab === 'history' || activeTab === 'subs') {
      fetchUserOrders(user.id).then(data => setOrders(data));
    }
  }, [user, navigate, activeTab]);

  if (!user) return null;

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileView user={user} safeName={displayName} />;
      case 'subs': return <SubscriptionsView orders={orders} />;
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
            <NavItem icon={<User size={20} />} label={t('dashboard.info')} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <NavItem icon={<ShieldCheck size={20} />} label={t('dashboard.subs')} active={activeTab === 'subs'} onClick={() => setActiveTab('subs')} />
            <NavItem icon={<CreditCard size={20} />} label={t('dashboard.billing')} active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
            <NavItem icon={<Clock size={20} />} label={t('dashboard.history')} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />

            {/* SECTION ADMIN */}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-[#2D333B]">
                <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#F5A623] hover:bg-[#F5A623]/10 transition-colors group">
                  <Shield size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold">{t('dashboard.admin_access')}</span>
                </button>
              </div>
            )}

            <div className="pt-8 mt-8 border-t border-[#2D333B]">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#FF3B3B] hover:bg-[#FF3B3B]/10 transition-colors group">
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">{t('dashboard.logout')}</span>
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
              {tab === 'profile' && t('dashboard.profile_tab')}
              {tab === 'subs' && t('dashboard.subs_tab')}
              {tab === 'billing' && t('dashboard.billing_tab')}
              {tab === 'history' && t('dashboard.history_tab')}
            </button>
          ))}
          {/* BOUTON ADMIN MOBILE */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="whitespace-nowrap px-5 py-3 rounded-xl text-sm font-bold border transition-all bg-[#1C2128] text-[#F5A623] border-[#2D333B] hover:bg-[#F5A623]/10"
            >
              Backoffice
            </button>
          )}
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

const ProfileView = ({ user, safeName }) => {
  const [formData, setFormData] = useState({
    fullName: safeName || '',
    phone: user?.user_metadata?.phone || '',
    company: user?.user_metadata?.company || '',
    address: user?.user_metadata?.address || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    // Vérification des mots de passe avant l'envoi
    if (isChangingPwd && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        return setMessage('❌ Erreur: Les mots de passe ne correspondent pas.');
      }
      if (formData.password.length < 8) {
        return setMessage('❌ Erreur: Le mot de passe doit contenir au moins 8 caractères.');
      }
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`http://localhost:3000/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        // Mettre à jour le localStorage avec les nouvelles données
        const currentUserData = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...currentUserData, user_metadata: updatedUser.user_metadata }));
        setMessage('✅ Informations mises à jour avec succès !');

        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setIsChangingPwd(false); // On referme la section mot de passe
      } else {
        const errData = await res.json();
        setMessage(`❌ Erreur: ${errData.message || 'Impossible de sauvegarder'}`);
      }
    } catch (err) {
      setMessage('❌ Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1C2128] rounded-[24px] p-6 md:p-10 border border-[#2D333B] shadow-2xl">
      <h2 className="text-2xl lg:text-3xl font-black text-white mb-8">{t('dashboard.personal_info')}</h2>

      {message && (
        <div className={`p-4 mb-8 rounded-xl text-sm font-bold animate-fade-in ${message.startsWith('✅') ? 'bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94]' : 'bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B]'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.full_name')}</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.email')}</label>
          <input type="email" defaultValue={user.email} disabled className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-gray-500 font-medium cursor-not-allowed opacity-70" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.phone')}</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+33 6 00 00 00 00" className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.company')}</label>
          <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Nom de l'entreprise" className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
        </div>
        <div className="space-y-3 md:col-span-2">
          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.address')}</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Avenue de la Cybersécurité, 75000 Paris" className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
        </div>
      </div>

      {/* SECTION MOT DE PASSE (Déployable) */}
      {isChangingPwd && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pt-6 border-t border-white/5 animate-fade-in">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.new_password')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{t('dashboard.confirm_password')}</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 text-white font-medium focus:border-cyna-cyan focus:outline-none transition-colors" />
          </div>
        </div>
      )}

      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <button onClick={handleSave} disabled={loading} className="w-full md:w-auto bg-cyna-cyan text-[#0B0E14] font-black px-8 py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center justify-center">
          {loading ? <span className="animate-pulse">{t('dashboard.saving')}</span> : t('dashboard.save_changes')}
        </button>
        <button onClick={() => setIsChangingPwd(!isChangingPwd)} type="button" className={`w-full md:w-auto border font-bold px-6 py-4 rounded-xl transition-colors ${isChangingPwd ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/30 hover:bg-[#FF3B3B]/20' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
          {isChangingPwd ? t('dashboard.cancel_pwd_change') : t('dashboard.change_pwd')}
        </button>
      </div>
    </div>
  );
};

const SubscriptionsView = ({ orders }) => {
  // 1. Filtrer les commandes validées/payées
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');

  // 2. Extraire tous les produits de ces commandes pour en faire des abonnements actifs
  const activeSubs = paidOrders.flatMap(order =>
    (order.order_items || []).map(item => ({
      ...item,
      order_date: order.created_at || order.date_commande
    }))
  );

  if (activeSubs.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl lg:text-3xl font-black text-white">Mes Abonnements SaaS</h2>
        <div className="text-center py-24 bg-[#1C2128] rounded-[24px] border border-[#2D333B]">
          <div className="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <ShieldCheck size={32} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Aucun abonnement actif</h3>
          <p className="text-[#A0A0A0]">Les services apparaîtront ici une fois votre paiement validé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl lg:text-3xl font-black text-white">Mes Abonnements SaaS</h2>

      <div className="space-y-4">
        {activeSubs.map((sub, idx) => (
          <SubscriptionItem key={idx} sub={sub} />
        ))}
      </div>
    </div>
  );
};

const SubscriptionItem = ({ sub }) => {
  const [isManaging, setIsManaging] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  const productName = sub.products?.name || sub.products?.nom || "Service Cyber";
  const isYearly = sub.selected_plan === 'yearly';

  // Calcul dynamique du prochain cycle de facturation
  const nextDate = new Date(sub.order_date);
  if (isYearly) nextDate.setFullYear(nextDate.getFullYear() + 1);
  else nextDate.setMonth(nextDate.getMonth() + 1);

  return (
    <div className="bg-[#1C2128] rounded-[24px] p-6 md:p-8 border border-[#2D333B] relative overflow-hidden group hover:border-cyna-cyan/30 transition-colors">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${autoRenew ? 'bg-[#00FF94]' : 'bg-[#F5A623]'}`}></div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl md:text-2xl font-black text-white">{productName}</h3>
            <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-md border flex items-center gap-1.5 ${autoRenew ? 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/20' : 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${autoRenew ? 'bg-[#00FF94]' : 'bg-[#F5A623]'}`}></span> ACTIF
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-[#A0A0A0] font-medium">
            <p>Facturation : <span className="text-white">{isYearly ? 'Annuelle' : 'Mensuelle'}</span></p>
            <p className="hidden sm:block">•</p>
            <p>Prochain cycle : <span className="text-white">{nextDate.toLocaleDateString()}</span></p>
            <p className="hidden sm:block">•</p>
            <p>Licences : <span className="text-white">{sub.quantity} poste{sub.quantity > 1 ? 's' : ''}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-white/5 lg:border-none">
          <button onClick={() => setIsManaging(!isManaging)} className={`flex-1 lg:flex-none px-6 py-3 border font-bold rounded-xl transition-all text-sm uppercase tracking-wider ${isManaging ? 'bg-white/10 text-white border-transparent' : 'border-cyna-cyan text-cyna-cyan hover:bg-cyna-cyan hover:text-[#0B0E14]'}`}>
            {isManaging ? 'Fermer' : 'Gérer le plan'}
          </button>
        </div>
      </div>

      {/* ZONE DE GESTION (S'affiche au clic) */}
      {isManaging && (
        <div className="mt-6 pt-6 border-t border-[#2D333B] animate-fade-in">
          <h4 className="text-white font-bold mb-4">Options de l'abonnement</h4>
          <div className="flex items-center justify-between bg-[#0B0E14] p-4 rounded-xl border border-[#2D333B]">
            <div>
              <p className="text-white font-bold text-sm">Renouvellement automatique</p>
              <p className="text-[#A0A0A0] text-xs mt-1">Votre moyen de paiement sera débité automatiquement à chaque cycle.</p>
            </div>
            <button
              onClick={() => setAutoRenew(!autoRenew)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenew ? 'bg-cyna-cyan' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {!autoRenew && (
            <p className="text-[#F5A623] text-xs font-bold mt-4 flex items-center gap-2">
              <AlertCircle size={14} /> Attention : Votre service sera suspendu le {nextDate.toLocaleDateString()} si vous ne renouvelez pas manuellement.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const BillingView = () => {
  const [cards, setCards] = useState([
    { id: 1, brand: 'VISA', last4: '4242', exp: '12/28' }
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddCardMock = () => {
    alert("En production, cette action redirigera vers le portail sécurisé Stripe (SetupIntent) pour enregistrer la carte sans que les données ne passent par votre serveur.");
    setCards([...cards, { id: Date.now(), brand: 'MASTERCARD', last4: '5555', exp: '09/29' }]);
    setIsAddingCard(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="text-xl font-black text-white flex items-center gap-3">
          <CreditCard size={24} className="text-cyna-cyan" /> Méthodes de paiement
        </h3>

        {cards.map(card => (
          <div key={card.id} className="bg-[#1C2128] p-6 rounded-[20px] border border-[#2D333B] flex items-center justify-between group hover:border-cyna-cyan/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center text-[10px] font-black text-[#0B0E14] shadow-inner">{card.brand}</div>
              <div className="flex flex-col">
                <span className="text-white font-mono font-bold">**** **** **** {card.last4}</span>
                <span className="text-[#A0A0A0] text-xs">Expire {card.exp}</span>
              </div>
            </div>
            <button onClick={() => setCards(cards.filter(c => c.id !== card.id))} className="text-[#A0A0A0] hover:text-[#FF3B3B] transition-colors p-2 bg-white/5 rounded-lg"><Trash2 size={18} /></button>
          </div>
        ))}

        {isAddingCard ? (
          <div className="bg-[#1C2128] p-6 rounded-[20px] border border-cyna-cyan/30 animate-fade-in space-y-4 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <p className="text-sm text-gray-400 font-bold mb-2 flex items-center gap-2"><Lock size={16} className="text-cyna-cyan" /> Saisie sécurisée</p>
            <input type="text" placeholder="Numéro de carte (Simulation)" className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyna-cyan" />
            <div className="flex gap-4">
              <input type="text" placeholder="MM/AA" className="w-1/2 bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyna-cyan" />
              <input type="text" placeholder="CVC" className="w-1/2 bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyna-cyan" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsAddingCard(false)} className="flex-1 py-3 text-white bg-white/5 hover:bg-white/10 rounded-lg font-bold transition-colors">Annuler</button>
              <button onClick={handleAddCardMock} className="flex-1 py-3 text-[#0B0E14] bg-cyna-cyan hover:bg-white rounded-lg font-bold transition-colors shadow-lg">Enregistrer</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAddingCard(true)} className="w-full py-5 border-2 border-dashed border-[#2D333B] rounded-[20px] text-[#A0A0A0] hover:text-cyna-cyan hover:border-cyna-cyan hover:bg-cyna-cyan/5 transition-all flex items-center justify-center gap-2 font-bold">
            <Plus size={20} /> Ajouter une carte
          </button>
        )}
      </div>

      <div className="space-y-6">





      </div>
    </div>
  );
};

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
          <p className="font-bold text-cyna-cyan font-mono text-xl">{(Number(order.total_amount || order.total) * 1.20).toFixed(2)} € <span className="text-xs text-gray-500">TTC</span></p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border ${isPaid ? 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
            }`}>
            {isPaid ? 'Payé' : 'En attente'}
          </span>
        </div>

        {/* BOUTON TÉLÉCHARGEMENT CONNECTÉ À L'API NESTJS */}
        {isPaid ? (
          <button
            onClick={() => downloadInvoice(order.id)}
            className="flex items-center gap-2 bg-white/5 hover:bg-cyna-cyan hover:text-[#0B0E14] text-white px-4 py-3 rounded-xl transition-all font-bold text-sm"
            title="Télécharger Facture PDF"
          >
            <Download size={18} /> <span className="hidden md:inline">PDF</span>
          </button>
        ) : (
          <span className="text-[10px] text-gray-500 italic max-w-[100px] md:max-w-none text-right leading-tight">Facture indisponible<br />(En attente de validation)</span>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
