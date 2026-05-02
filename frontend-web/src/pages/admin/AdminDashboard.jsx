import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Save, Users, ShoppingCart, DollarSign, Activity, TrendingUp, Image, Star, Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, BarChart2, BarChart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    // État pour le texte de l'alerte
    const [alertText, setAlertText] = useState('');
    const [loading, setLoading] = useState(false);

    // États pour le Carrousel et Top Produits
    const [carouselItems, setCarouselItems] = useState([]);
    const [loadingCarousel, setLoadingCarousel] = useState(false);
    const [topProducts, setTopProducts] = useState([
        { id: 1, name: "CYNA EDR Premium", category: "EDR" },
        { id: 2, name: "SOC Managé 24/7", category: "SOC" },
        { id: 3, name: "Audit & Pentest", category: "AUDIT" },
        { id: 4, name: "XDR Unified", category: "XDR" }
    ]);

    // Stats & Activités dynamiques
    const [stats, setStats] = useState({
        users: 0, usersThisMonth: 0, usersLastMonth: 0,
        orders: 0, ordersThisMonth: 0, ordersLastMonth: 0,
        revenue: 0, lastMonthRevenue: 0,
        annualRevenue: 0,
        activeProducts: 0, totalProducts: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [outOfStock, setOutOfStock] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [monthlyChartData, setMonthlyChartData] = useState([]);
    const [chartMode, setChartMode] = useState('orders'); // 'orders' | 'revenue'

    // Charger le carrousel au démarrage
    useEffect(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const isCurrentMonth = (date) => {
            const d = new Date(date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };
        const isLastMonth = (date) => {
            const d = new Date(date);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        };

        fetch('http://localhost:3000/carousel')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (data && data.length > 0) setCarouselItems(data);
                else setCarouselItems([{ title: 'Nouveau Slide', subtitle: 'Description...', visual: 'SOC', cta: 'Découvrir' }]);
            })
            .catch(err => console.error("Erreur chargement carrousel", err));

        // Charger les utilisateurs pour le KPI + tendance réelle
        fetch('http://localhost:3000/auth/users')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const users = Array.isArray(data) ? data : (data.users || []);
                const usersThisMonth = users.filter(u => u.created_at && isCurrentMonth(u.created_at)).length;
                const usersLastMonth = users.filter(u => u.created_at && isLastMonth(u.created_at)).length;
                setStats(prev => ({ ...prev, users: users.length, usersThisMonth, usersLastMonth }));
            })
            .catch(err => console.error("Erreur chargement utilisateurs", err));

        // Charger les produits pour détecter les ruptures de stock + KPI Produits Actifs
        fetch('http://localhost:3000/products')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const outOfStockList = data.filter(p => p.stock_virtuel <= 0);
                const activeCount = data.filter(p => p.stock_virtuel > 0).length;
                setOutOfStock(outOfStockList);
                setStats(prev => ({ ...prev, activeProducts: activeCount, totalProducts: data.length }));
            })
            .catch(err => console.error("Erreur chargement alertes stock", err));

        // Charger les commandes pour les KPI et l'activité récente
        fetch('http://localhost:3000/orders')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const validOrders = data.filter(o => o.status === 'paid' || o.status === 'completed');

                // Tendance commandes : ce mois vs mois dernier
                const ordersThisMonth = validOrders.filter(o => o.created_at && isCurrentMonth(o.created_at)).length;
                const ordersLastMonth = validOrders.filter(o => o.created_at && isLastMonth(o.created_at)).length;

                // Revenu : ce mois vs mois dernier
                const monthlyRevenue = validOrders
                    .filter(o => o.created_at && isCurrentMonth(o.created_at))
                    .reduce((sum, o) => sum + Number(o.total_amount || o.total || 0), 0);
                const lastMonthRevenue = validOrders
                    .filter(o => o.created_at && isLastMonth(o.created_at))
                    .reduce((sum, o) => sum + Number(o.total_amount || o.total || 0), 0);

                // Revenu annuel (toutes les commandes validées de l'année en cours)
                const annualRevenue = validOrders
                    .filter(o => o.created_at && new Date(o.created_at).getFullYear() === currentYear)
                    .reduce((sum, o) => sum + Number(o.total_amount || o.total || 0), 0);

                setStats(prev => ({
                    ...prev,
                    orders: data.length,
                    ordersThisMonth, ordersLastMonth,
                    revenue: monthlyRevenue, lastMonthRevenue,
                    annualRevenue
                }));
                setRecentActivity(data.slice(0, 5));

                // Données du graphique — 12 derniers mois
                const chartMonths = [];
                for (let i = 11; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(1);
                    d.setMonth(d.getMonth() - i);
                    const m = d.getMonth();
                    const y = d.getFullYear();
                    const monthOrders = validOrders.filter(o => {
                        if (!o.created_at) return false;
                        const od = new Date(o.created_at);
                        return od.getMonth() === m && od.getFullYear() === y;
                    });
                    chartMonths.push({
                        label: d.toLocaleDateString('fr-FR', { month: 'short' }),
                        year: y,
                        orders: monthOrders.length,
                        revenue: monthOrders.reduce((s, o) => s + Number(o.total_amount || o.total || 0), 0),
                        isCurrent: i === 0,
                    });
                }
                setMonthlyChartData(chartMonths);

                // Rapport de Performance (Top Produits générateurs de revenus)
                const productSales = {};
                validOrders.forEach(order => {
                    (order.order_items || []).forEach(item => {
                        const pName = item.products?.name || item.products?.nom || 'Service Inconnu';
                        if (!productSales[pName]) productSales[pName] = { count: 0, revenue: 0 };
                        productSales[pName].count += item.quantity;
                        productSales[pName].revenue += (item.quantity * Number(item.price_at_purchase || 0));
                    });
                });
                const sortedTop = Object.entries(productSales)
                    .map(([name, s]) => ({ name, ...s }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);
                setTopSelling(sortedTop);
            })
            .catch(err => console.error("Erreur chargement commandes pour stats", err));
    }, []);

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

    // --- FONCTIONS CARROUSEL ---
    const handleCarouselChange = (index, field, value) => {
        const newItems = [...carouselItems];
        newItems[index][field] = value;
        setCarouselItems(newItems);
    };

    const saveCarousel = async () => {
        setLoadingCarousel(true);
        try {
            const response = await fetch('http://localhost:3000/carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: carouselItems })
            });
            if (response.ok) alert("✅ Carrousel mis à jour avec succès !");
            else alert("❌ Erreur lors de la mise à jour.");
        } catch (error) {
            alert("❌ Erreur de connexion au serveur.");
        } finally {
            setLoadingCarousel(false);
        }
    };

    // --- FONCTIONS TOP PRODUITS (Ordre) ---
    const moveProduct = (index, direction) => {
        const newItems = [...topProducts];
        if (direction === 'up' && index > 0) [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        else if (direction === 'down' && index < newItems.length - 1) [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
        setTopProducts(newItems);
    };

    const calcTrend = (current, last) => {
        if (last === 0 && current > 0) return "+100%";
        if (last === 0) return "+0%";
        const diff = ((current - last) / last) * 100;
        return (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
    };

    const revenueTrendText = calcTrend(stats.revenue, stats.lastMonthRevenue);
    const orderTrendText = calcTrend(stats.ordersThisMonth, stats.ordersLastMonth);
    const userTrendText = calcTrend(stats.usersThisMonth, stats.usersLastMonth);

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

            {/* --- 0. ALERTE CRITIQUE : RUPTURE DE STOCK --- */}
            {outOfStock.length > 0 && (
                <div className="mb-8 p-5 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-4 text-[#FF3B3B]">
                        <div className="p-3 bg-[#FF3B3B]/20 rounded-xl flex-shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-lg">Alerte : Rupture de stock détectée</h4>
                            <p className="text-sm font-medium opacity-80">{outOfStock.length} service(s) nécessite(nt) votre attention et n'est/ne sont plus disponible(s) à la vente.</p>
                        </div>
                    </div>
                    <Link to="/admin/products" className="whitespace-nowrap px-6 py-3 bg-[#FF3B3B] text-white font-black rounded-xl text-sm hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(255,59,59,0.3)]">
                        Gérer les stocks
                    </Link>
                </div>
            )}

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* --- 2. WIDGET CARROUSEL --- */}
                <section className="bg-[#1C2128] border border-white/10 p-6 rounded-2xl shadow-lg flex flex-col h-full">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Image size={20} className="text-cyna-cyan" /> Slides Carrousel</span>
                        <button onClick={() => setCarouselItems([...carouselItems, { title: '', subtitle: '', visual: 'SOC', cta: 'Bouton' }])} className="text-cyna-cyan text-sm flex items-center gap-1 hover:underline">
                            <Plus size={16} /> Ajouter
                        </button>
                    </h2>
                    <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 flex-1">
                        {carouselItems.map((item, idx) => (
                            <div key={idx} className="bg-[#0B0E14] p-4 rounded-xl border border-white/5 relative group">
                                <button onClick={() => setCarouselItems(carouselItems.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                <input type="text" value={item.title} onChange={e => handleCarouselChange(idx, 'title', e.target.value)} placeholder="Titre principal" className="w-full bg-transparent text-white font-bold mb-2 focus:outline-none focus:text-cyna-cyan" />
                                <input type="text" value={item.subtitle} onChange={e => handleCarouselChange(idx, 'subtitle', e.target.value)} placeholder="Sous-titre" className="w-full bg-transparent text-gray-400 text-sm mb-3 focus:outline-none" />
                                <div className="flex gap-3">
                                    <select value={item.visual} onChange={e => handleCarouselChange(idx, 'visual', e.target.value)} className="bg-[#1C2128] border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none">
                                        <option value="SOC">Icône SOC</option>
                                        <option value="EDR">Icône EDR</option>
                                        <option value="XDR">Icône XDR</option>
                                    </select>
                                    <input type="text" value={item.cta} onChange={e => handleCarouselChange(idx, 'cta', e.target.value)} placeholder="Texte Bouton" className="flex-1 bg-[#1C2128] border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-cyna-cyan" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={saveCarousel} disabled={loadingCarousel} className="w-full mt-4 bg-cyna-cyan text-black font-bold py-3 rounded-lg flex justify-center gap-2 hover:bg-[#00D1E1] transition-colors">
                        {loadingCarousel ? 'Sauvegarde...' : <><Save size={18}/> Enregistrer le Carrousel</>}
                    </button>
                </section>

                {/* --- 3. WIDGET TOP PRODUITS (Ordre) --- */}
                <section className="bg-[#1C2128] border border-white/10 p-6 rounded-2xl shadow-lg flex flex-col h-full">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Star size={20} className="text-[#F5A623]" /> Ordre Top Produits</span>
                        <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded">Glisser ou utiliser les flèches</span>
                    </h2>
                    <div className="space-y-3 flex-1">
                        {topProducts.map((prod, idx) => (
                            <div key={prod.id} className="flex items-center justify-between bg-[#0B0E14] p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                <div>
                                    <p className="font-bold text-white text-sm">{prod.name}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">{prod.category}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveProduct(idx, 'up')} disabled={idx === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-20"><ArrowUp size={16}/></button>
                                    <button onClick={() => moveProduct(idx, 'down')} disabled={idx === topProducts.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-20"><ArrowDown size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => alert("À connecter à votre base de données NestJS (Route /top-products)")} className="w-full mt-4 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-lg flex justify-center gap-2 hover:bg-white/10 transition-colors">
                        <Save size={18}/> Enregistrer l'ordre
                    </button>
                </section>
            </div>

            {/* --- 4. STATISTIQUES (KPIs) --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<Users size={24} />}
                    title="Utilisateurs"
                    value={stats.users.toString()}
                    trend={userTrendText}
                    subtitle={`+${stats.usersThisMonth} ce mois`}
                    color="text-blue-400"
                />
                <StatCard
                    icon={<ShoppingCart size={24} />}
                    title="Commandes Total"
                    value={stats.orders.toString()}
                    trend={orderTrendText}
                    subtitle={`${stats.ordersThisMonth} ce mois`}
                    color="text-green-400"
                />
                <RevenueCard
                    monthly={stats.revenue}
                    annual={stats.annualRevenue}
                    trend={revenueTrendText}
                />
                <StatCard
                    icon={<Activity size={24} />}
                    title="Produits Actifs"
                    value={`${stats.activeProducts}/${stats.totalProducts}`}
                    trend={stats.totalProducts > 0 ? `${Math.round((stats.activeProducts / stats.totalProducts) * 100)}%` : '0%'}
                    subtitle="en stock & disponibles"
                    color="text-purple-400"
                />
            </section>

            {/* --- 5. DIAGRAMME EN BANDE — COMMANDES CONFIRMÉES ─────────────── */}
            <section className="bg-[#1C2128] border border-white/10 rounded-2xl p-6 shadow-lg mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart2 size={20} className="text-cyna-cyan" />
                            Évolution des Ventes — 12 derniers mois
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Commandes confirmées (statut paid / completed) uniquement</p>
                    </div>
                    {/* Toggle Commandes / Revenus */}
                    <div className="flex bg-[#0B0E14] border border-white/10 rounded-xl p-1 gap-1 flex-shrink-0">
                        <button
                            onClick={() => setChartMode('orders')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${chartMode === 'orders' ? 'bg-cyna-cyan text-black shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <ShoppingCart size={13} className="inline mr-1.5 mb-0.5" />Commandes
                        </button>
                        <button
                            onClick={() => setChartMode('revenue')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${chartMode === 'revenue' ? 'bg-cyna-cyan text-black shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <DollarSign size={13} className="inline mr-1.5 mb-0.5" />Revenus
                        </button>
                    </div>
                </div>

                {/* Résumé rapide au-dessus du graphique */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#0B0E14] rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ce mois</p>
                        <p className="text-lg font-black text-cyna-cyan font-mono">
                            {chartMode === 'orders'
                                ? `${stats.ordersThisMonth} cmd`
                                : `${stats.revenue.toFixed(0)} €`}
                        </p>
                    </div>
                    <div className="bg-[#0B0E14] rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Mois précédent</p>
                        <p className="text-lg font-black text-white font-mono">
                            {chartMode === 'orders'
                                ? `${stats.ordersLastMonth} cmd`
                                : `${stats.lastMonthRevenue.toFixed(0)} €`}
                        </p>
                    </div>
                    <div className="bg-[#0B0E14] rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cumul annuel</p>
                        <p className="text-lg font-black text-[#00FF94] font-mono">
                            {chartMode === 'orders'
                                ? `${monthlyChartData.reduce((s, m) => s + m.orders, 0)} cmd`
                                : `${stats.annualRevenue.toFixed(0)} €`}
                        </p>
                    </div>
                </div>

                {/* Graphique */}
                {monthlyChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[180px] text-gray-600">
                        <BarChart size={32} className="mr-3" />
                        <p className="text-sm">En attente des données...</p>
                    </div>
                ) : (
                    <SalesBarChart data={monthlyChartData} mode={chartMode} />
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* --- 6. ACTIVITÉ RÉCENTE --- */}

                <section className="bg-[#1C2128] border border-white/10 rounded-2xl p-6 shadow-lg h-full">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-cyna-cyan" />
                        Activité Récente
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-sm">Aucune activité récente.</p>
                        ) : (
                            recentActivity.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-[#0B0E14] rounded-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-cyna-cyan/10 flex items-center justify-center text-cyna-cyan font-bold flex-shrink-0">
                                            <ShoppingCart size={18}/>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Nouvelle commande #{order.id.substring(0,6)}</h4>
                                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-cyna-cyan font-bold whitespace-nowrap">+ {Number(order.total_amount || order.total || 0).toFixed(2)} €</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* --- 6. RAPPORT DE PERFORMANCE DES VENTES --- */}
                <section className="bg-[#1C2128] border border-white/10 rounded-2xl p-6 shadow-lg h-full flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart size={20} className="text-cyna-cyan" />
                        Rapport de Performance (Top Ventes)
                    </h3>

                    {/* Résumé global */}
                    {topSelling.length > 0 && (
                        <div className="flex gap-4 mb-6 p-3 bg-[#0B0E14] rounded-xl border border-white/5">
                            <div className="flex-1 text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Revenu validé</p>
                                <p className="text-lg font-black text-cyna-cyan font-mono">
                                    {topSelling.reduce((s, p) => s + p.revenue, 0).toFixed(2)} €
                                </p>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Unités vendues</p>
                                <p className="text-lg font-black text-white font-mono">
                                    {topSelling.reduce((s, p) => s + p.count, 0)}
                                </p>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Produits actifs</p>
                                <p className="text-lg font-black text-white font-mono">
                                    {topSelling.length}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5 flex-1">
                        {topSelling.length === 0 ? (
                            <div className="text-center py-12">
                                <BarChart size={32} className="text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm font-medium">Aucune donnée de vente validée disponible.</p>
                                <p className="text-gray-600 text-xs mt-1">Les commandes au statut "paid" ou "completed" apparaîtront ici.</p>
                            </div>
                        ) : (
                            topSelling.map((prod, idx) => {
                                const maxRev = topSelling[0].revenue;
                                const percent = maxRev > 0 ? Math.max(5, Math.round((prod.revenue / maxRev) * 100)) : 5;
                                const rankColors = ['text-[#FFD700]', 'text-[#C0C0C0]', 'text-[#CD7F32]', 'text-gray-500', 'text-gray-600'];
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1.5 items-center">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`text-xs font-black w-4 flex-shrink-0 ${rankColors[idx] || 'text-gray-600'}`}>#{idx + 1}</span>
                                                <span className="font-bold text-white truncate">{prod.name}</span>
                                            </div>
                                            <span className="text-cyna-cyan font-mono font-bold flex-shrink-0 ml-2">{prod.revenue.toFixed(2)} €</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2.5 bg-[#0B0E14] border border-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyna-cyan rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-700" style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 font-bold w-14 text-right uppercase tracking-wider">{prod.count} U.</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

// ─── Diagramme en bande — Ventes sur 12 mois ─────────────────────────────────
const SalesBarChart = ({ data, mode }) => {
    const [hovered, setHovered] = useState(null);
    const maxVal = Math.max(...data.map(d => mode === 'orders' ? d.orders : d.revenue), 1);
    const BAR_MAX_H = 140;

    return (
        <div className="w-full">
            {/* Lignes de grille horizontales */}
            <div className="relative">
                <div className="absolute inset-x-0 top-0 flex flex-col justify-between h-[140px] pointer-events-none">
                    {[100, 75, 50, 25, 0].map(pct => (
                        <div key={pct} className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-600 w-7 text-right flex-shrink-0">
                                {pct > 0 ? Math.round((maxVal * pct) / 100) : 0}
                            </span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>
                    ))}
                </div>

                {/* Barres */}
                <div className="flex items-end gap-1.5 h-[140px] pl-10">
                    {data.map((d, i) => {
                        const val = mode === 'orders' ? d.orders : d.revenue;
                        const barH = maxVal > 0 ? Math.max(3, Math.round((val / maxVal) * BAR_MAX_H)) : 3;
                        const isHov = hovered === i;

                        return (
                            <div
                                key={i}
                                className="relative flex-1 flex flex-col items-center justify-end cursor-pointer"
                                style={{ height: `${BAR_MAX_H}px` }}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {/* Tooltip */}
                                {isHov && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-[#0B0E14] border border-white/20 rounded-xl px-3 py-2 text-center whitespace-nowrap shadow-2xl pointer-events-none">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{d.label} {d.year}</p>
                                        <p className="text-sm font-black text-white">{d.orders} commande{d.orders !== 1 ? 's' : ''}</p>
                                        <p className="text-xs font-bold text-cyna-cyan font-mono">{d.revenue.toFixed(2)} €</p>
                                    </div>
                                )}

                                {/* Barre */}
                                <div
                                    className={`w-full rounded-t-md transition-all duration-300 ${
                                        d.isCurrent
                                            ? 'bg-cyna-cyan shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                                            : isHov
                                                ? 'bg-white/30'
                                                : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                    style={{ height: `${barH}px` }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Axe X — labels mois */}
            <div className="flex gap-1.5 mt-2 pl-10">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                        <span className={`text-[9px] uppercase font-bold tracking-widest ${d.isCurrent ? 'text-cyna-cyan' : 'text-gray-600'}`}>
                            {d.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-end gap-5 mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="w-3 h-3 rounded-sm bg-cyna-cyan shadow-[0_0_6px_rgba(0,240,255,0.5)]" />
                    Mois actuel
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="w-3 h-3 rounded-sm bg-white/10" />
                    Mois précédents
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="w-3 h-3 rounded-sm bg-white/30" />
                    Survolé
                </div>
            </div>
        </div>
    );
};

// ─── Carte Revenus (mensuel + annuel) ────────────────────────────────────────
const RevenueCard = ({ monthly, annual, trend }) => {
    const isNegative = trend && trend.startsWith('-');
    const trendColor = isNegative ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10';

    return (
        <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/10 hover:border-cyna-cyan/30 transition-all group">

            {/* En-tête icône + badge tendance */}
            <div className="flex justify-between items-start mb-5">
                <div className="p-3 rounded-lg bg-white/5 text-cyna-cyan group-hover:scale-110 transition-transform">
                    <DollarSign size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendColor}`}>{trend}</span>
            </div>

            {/* ── Revenu Mensuel ── */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                Revenu Mensuel
            </p>
            <p className="text-3xl font-black text-white font-mono">
                {monthly.toFixed(2)} €
            </p>
            <p className="text-[10px] text-gray-600 mt-1 mb-4">vs mois précédent</p>

            {/* Séparateur */}
            <div className="h-px bg-white/10 mb-4" />

            {/* ── Revenu Annuel ── */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                <Calendar size={10} />
                Revenu Annuel
            </p>
            <p className="text-2xl font-black text-[#00FF94] font-mono">
                {annual.toFixed(2)} €
            </p>
            <p className="text-[10px] text-gray-600 mt-1">cumul {new Date().getFullYear()}</p>
        </div>
    );
};

// ─── Carte KPI standard ───────────────────────────────────────────────────────
const StatCard = ({ icon, title, value, trend, subtitle, color }) => {
    const isNegative = trend && trend.startsWith('-');
    const trendColor = isNegative ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10';

    return (
        <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/10 hover:border-cyna-cyan/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendColor}`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-black text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
};

export default AdminDashboard;