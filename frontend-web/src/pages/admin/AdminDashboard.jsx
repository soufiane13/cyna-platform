import React, { useState } from 'react';
import { Megaphone, Save, Users, ShoppingCart, DollarSign, Activity, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    // État pour le texte de l'alerte
    const [alertText, setAlertText] = useState('');
    const [loading, setLoading] = useState(false);

    // Fonction pour sauvegarder l'alerte sur le serveur
    const updateAlert = async () => {
        if (!alertText) return; // Ne rien faire si vide
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: alertText })
            });

            if (response.ok) {
                alert("✅ Alerte mise à jour avec succès sur l'accueil !");
                setAlertText(''); // Vider le champ après succès
            } else {
                alert("❌ Erreur lors de la mise à jour.");
            }
        } catch (error) {
            console.error(error);
            alert("❌ Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-[#0B0E14] text-white animate-fade-in">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">DASHBOARD ADMIN</h1>
                    <p className="text-cyna-text">Gérez vos produits, utilisateurs et l'interface du site.</p>
                </div>
                <div className="px-4 py-2 bg-cyna-cyan/10 border border-cyna-cyan/20 text-cyna-cyan rounded-lg font-bold text-sm">
                    Admin Connecté
                </div>
            </header>

            {/* --- 1. WIDGET DE GESTION DE L'ALERTE (NOUVEAU) --- */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Megaphone size={20} className="text-cyna-cyan" />
                    Bannière d'Alerte (Page d'Accueil)
                </h2>
                
                <div className="bg-[#1C2128] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-lg">
                    <div className="flex-1 w-full">
                        <label className="text-xs text-gray-400 font-bold mb-2 block uppercase">Message à afficher</label>
                        <input 
                            type="text" 
                            value={alertText}
                            onChange={(e) => setAlertText(e.target.value)}
                            placeholder="Ex: ⚡ PROMO FLASH : -50% sur tous les produits EDR ce weekend !" 
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white font-medium focus:outline-none focus:border-cyna-cyan transition-colors"
                        />
                    </div>
                    <button 
                        onClick={updateAlert}
                        disabled={loading}
                        className="w-full md:w-auto bg-cyna-cyan text-black font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00D1E1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sauvegarde...' : <><Save size={18}/> Mettre à jour</>}
                    </button>
                </div>
            </section>

            {/* --- 2. STATISTIQUES (KPIs) --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard 
                    icon={<Users size={24} />} 
                    title="Utilisateurs" 
                    value="1,234" 
                    trend="+12%" 
                    color="text-blue-400"
                />
                <StatCard 
                    icon={<ShoppingCart size={24} />} 
                    title="Commandes" 
                    value="42" 
                    trend="+5%" 
                    color="text-green-400"
                />
                <StatCard 
                    icon={<DollarSign size={24} />} 
                    title="Revenu Mensuel" 
                    value="8,540 €" 
                    trend="+24%" 
                    color="text-cyna-cyan"
                />
                <StatCard 
                    icon={<Activity size={24} />} 
                    title="Trafic Site" 
                    value="15k" 
                    trend="+8%" 
                    color="text-purple-400"
                />
            </section>

            {/* --- 3. ACTIVITÉ RÉCENTE (Exemple visuel) --- */}
            <section className="bg-[#1C2128] border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyna-cyan" />
                    Activité Récente
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center justify-between p-4 bg-[#0B0E14] rounded-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                    JS
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Jean S. a acheté "Cyna EDR Pro"</h4>
                                    <p className="text-xs text-gray-500">Il y a 2 minutes</p>
                                </div>
                            </div>
                            <span className="text-cyna-cyan font-bold">+ 14.99 €</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// Petit composant interne pour les cartes de stats
const StatCard = ({ icon, title, value, trend, color }) => (
    <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/10 hover:border-cyna-cyan/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                {trend}
            </span>
        </div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-black text-white">{value}</p>
    </div>
);

export default AdminDashboard;