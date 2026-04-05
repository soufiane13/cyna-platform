import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Erreur chargement commandes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:3000/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
            } else {
                alert("❌ Erreur de mise à jour.");
            }
        } catch (err) {
            alert("❌ Erreur de connexion au serveur.");
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortedOrders = () => {
        let filterData = orders.filter(o => 
            (statusFilter === 'all' || o.status === statusFilter || (statusFilter === 'paid' && o.status === 'completed')) &&
            (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || (o.user_id && o.user_id.toLowerCase().includes(searchTerm.toLowerCase())))
        );
        
        return filterData.sort((a, b) => {
            let valA = sortConfig.key === 'total' ? parseFloat(a.total_amount || a.total || 0) : a[sortConfig.key];
            let valB = sortConfig.key === 'total' ? parseFloat(b.total_amount || b.total || 0) : b[sortConfig.key];

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
            case 'paid': return <span className="px-2 py-1 bg-[#00FF94]/10 text-[#00FF94] text-[10px] uppercase font-bold rounded flex items-center gap-1 w-fit"><CheckCircle size={12}/> Payé</span>;
            case 'pending': return <span className="px-2 py-1 bg-[#F5A623]/10 text-[#F5A623] text-[10px] uppercase font-bold rounded flex items-center gap-1 w-fit"><Clock size={12}/> Attente</span>;
            default: return <span className="px-2 py-1 bg-[#FF3B3B]/10 text-[#FF3B3B] text-[10px] uppercase font-bold rounded flex items-center gap-1 w-fit"><XCircle size={12}/> Annulé</span>;
        }
    };

    return (
        <div className="p-8 min-h-screen bg-[#0B0E14] text-white animate-fade-in relative">
            <header className="mb-10"><h1 className="text-3xl font-black tracking-tight text-white mb-1">Gestion des Commandes</h1><p className="text-gray-400 text-sm">Validez les paiements et suivez les ventes.</p></header>
            
            <div className="bg-[#1C2128] border border-[#2D333B] p-4 rounded-t-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" placeholder="Rechercher par ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyna-cyan" /></div>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)} 
                        className="w-full sm:w-auto bg-[#0B0E14] border border-[#2D333B] text-white text-sm rounded-lg h-10 px-4 focus:outline-none focus:border-cyna-cyan cursor-pointer"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="paid">Payé / Complété</option>
                        <option value="pending">En attente</option>
                        <option value="cancelled">Annulé</option>
                    </select>
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-md border border-white/5">Total : {getSortedOrders().length}</div>
            </div>
            <div className="overflow-x-auto bg-[#1C2128] border border-t-0 border-[#2D333B] rounded-b-2xl shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0E14] text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#2D333B]">
                            <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('id')}><div className="flex items-center gap-1">ID Cmd <ArrowUpDown size={12}/></div></th>
                            <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('created_at')}><div className="flex items-center gap-1">Date <ArrowUpDown size={12}/></div></th>
                            <th className="p-4 font-bold">Client (ID)</th>
                            <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('total')}><div className="flex items-center gap-1">Montant <ArrowUpDown size={12}/></div></th>
                            <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('status')}><div className="flex items-center gap-1">Statut <ArrowUpDown size={12}/></div></th>
                            <th className="p-4 font-bold text-right">Modifier Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B]">
                        {loading ? <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chargement...</td></tr> : getSortedOrders().map(order => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-xs font-mono text-gray-500">#{order.id.substring(0, 8)}</td>
                                <td className="p-4 text-sm">{new Date(order.created_at).toLocaleString()}</td>
                                <td className="p-4 text-xs font-mono text-cyna-cyan">{order.user_id ? order.user_id.substring(0,12) + '...' : 'Inconnu'}</td>
                                <td className="p-4 text-white font-mono font-bold">{Number(order.total_amount || order.total || 0).toFixed(2)} €</td>
                                <td className="p-4">{getStatusBadge(order.status)}</td>
                                <td className="p-4 text-right"><select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="bg-[#0B0E14] border border-[#2D333B] text-xs text-white rounded px-2 py-1 outline-none cursor-pointer"><option value="pending">En attente</option><option value="paid">Payé</option><option value="cancelled">Annulé</option></select></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminOrders;