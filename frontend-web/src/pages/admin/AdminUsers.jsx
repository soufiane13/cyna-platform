import React, { useState, useEffect } from 'react';
import { Search, User, Shield, Clock } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Appel API pour lister les utilisateurs (Si votre backend a la route, sinon on charge des fausses données visuelles pour l'analytics)
            const res = await fetch('http://localhost:3000/auth/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                // Fallback (Données de test si le backend n'a pas encore cette route)
                setUsers([
                    { id: "1", email: "admin@cyna.com", role: "admin", created_at: new Date().toISOString() },
                    { id: "2", email: "client@entreprise.com", role: "user", created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: "3", email: "tech@startup.io", role: "user", created_at: new Date(Date.now() - 150000000).toISOString() }
                ]);
            }
        } catch (error) {
            console.error("Erreur utilisateurs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-8 min-h-screen bg-[#0B0E14] text-white animate-fade-in relative">
            <header className="mb-10"><h1 className="text-3xl font-black tracking-tight text-white mb-1">Suivi des Utilisateurs</h1><p className="text-gray-400 text-sm">Analysez les inscriptions et l'engagement client.</p></header>
            
            <div className="bg-[#1C2128] border border-[#2D333B] p-4 rounded-t-2xl flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-[300px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Rechercher un email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyna-cyan" />
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-md border border-white/5">Total : {filteredUsers.length}</div>
            </div>

            <div className="overflow-x-auto bg-[#1C2128] border border-t-0 border-[#2D333B] rounded-b-2xl shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0E14] text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#2D333B]">
                            <th className="p-4 font-bold">Email</th>
                            <th className="p-4 font-bold">Rôle</th>
                            <th className="p-4 font-bold">Date d'inscription</th>
                            <th className="p-4 font-bold">Activité / Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B]">
                        {loading ? <tr><td colSpan="4" className="p-8 text-center text-gray-500">Chargement...</td></tr> : filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#0B0E14] border border-white/5 flex items-center justify-center text-cyna-cyan"><User size={14}/></div>{u.email}</td>
                                <td className="p-4">
                                    {u.role === 'admin' || u.user_metadata?.role === 'admin' ? <span className="px-2 py-1 bg-[#F5A623]/10 text-[#F5A623] text-[10px] uppercase font-bold rounded flex items-center gap-1 w-fit"><Shield size={12}/> Admin</span> : <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] uppercase font-bold rounded flex items-center gap-1 w-fit">Client</span>}
                                </td>
                                <td className="p-4 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-sm text-[#00FF94] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></span> En Ligne (Simulé)</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminUsers;