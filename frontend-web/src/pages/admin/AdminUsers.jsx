
import React, { useState, useEffect } from 'react';
import { Search, User, Shield, Trash2, AlertTriangle, X, Loader } from 'lucide-react';

// ─── Composant Modal de Confirmation ───────────────────────────────────────
const DeleteConfirmModal = ({ user, onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

        {/* Carte */}
        <div className="relative z-10 w-full max-w-md bg-[#1C2128] border border-[#FF3B3B]/40 rounded-2xl p-8 shadow-2xl">
            {/* Icône */}
            <div className="w-14 h-14 bg-[#FF3B3B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-[#FF3B3B]" size={28} />
            </div>

            {/* Texte */}
            <h3 className="text-xl font-black text-white text-center mb-2">
                Supprimer cet utilisateur ?
            </h3>
            <p className="text-[#A0A0A0] text-sm text-center mb-1">
                Vous êtes sur le point de supprimer définitivement :
            </p>
            <p className="text-cyna-cyan font-bold text-center text-sm mb-6 break-all">
                {user.email}
            </p>
            <p className="text-xs text-[#FF3B3B]/80 text-center bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded-lg p-3 mb-8">
                ⚠️ Cette action est irréversible. Toutes les données associées seront perdues.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-xl font-bold text-[#A0A0A0] bg-[#0B0E14] border border-[#2D333B] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-xl font-black text-white bg-[#FF3B3B] hover:bg-[#ff5555] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isDeleting ? (
                        <><Loader size={16} className="animate-spin" /> Suppression...</>
                    ) : (
                        <><Trash2 size={16} /> Supprimer</>
                    )}
                </button>
            </div>
        </div>
    </div>
);

// ─── Composant Principal ────────────────────────────────────────────────────
const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // État pour la modal de confirmation
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', message }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, ordersRes] = await Promise.all([
                fetch('http://localhost:3000/auth/users'),
                fetch('http://localhost:3000/orders'),
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (ordersRes.ok) setOrders(await ordersRes.json());
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    // ─── Logique de suppression ───────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`http://localhost:3000/auth/users/${userToDelete.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                // Le backend renvoie 403 si abonnement actif, 500 sinon
                showNotification('error', data.message || 'Erreur lors de la suppression.');
            } else {
                setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
                showNotification('success', `L'utilisateur ${userToDelete.email} a été supprimé.`);
            }
        } catch {
            showNotification('error', 'Impossible de contacter le serveur.');
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────

    // Retourne true si l'utilisateur a au moins un abonnement actif
    const hasActiveSubscription = (userId) => {
        return orders.some(
            (o) =>
                o.user_id === userId &&
                (o.status === 'paid' || o.status === 'completed') &&
                (o.order_items?.length ?? 0) > 0
        );
    };

    const getUserSubscriptions = (userId) => {
        const userOrders = orders.filter(
            (o) =>
                o.user_id === userId &&
                (o.status === 'paid' || o.status === 'completed')
        );
        const subs = userOrders.flatMap((o) =>
            (o.order_items || []).map((item) => item.products?.name || item.products?.nom)
        );

        if (subs.length === 0)
            return <span className="text-gray-600 text-xs italic">Aucun abonnement</span>;

        const uniqueSubs = [...new Set(subs)];
        return (
            <div className="flex flex-wrap gap-1.5">
                {uniqueSubs.map((sub, i) => (
                    <span
                        key={i}
                        className="px-2 py-1 bg-cyna-cyan/10 text-cyna-cyan text-[10px] uppercase font-bold rounded border border-cyna-cyan/20"
                    >
                        {sub}
                    </span>
                ))}
            </div>
        );
    };

    const filteredUsers = users.filter((u) =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── Rendu ────────────────────────────────────────────────────────────────
    return (
        <div className="p-8 min-h-screen bg-[#0B0E14] text-white font-sans">

            {/* Modal de confirmation */}
            {userToDelete && (
                <DeleteConfirmModal
                    user={userToDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => !isDeleting && setUserToDelete(null)}
                    isDeleting={isDeleting}
                />
            )}

            {/* Notification toast */}
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl font-bold text-sm animate-fade-in max-w-sm
            ${notification.type === 'success'
                            ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]'
                            : 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B]'
                        }`}
                >
                    <span className="flex-1">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* En-tête */}
            <header className="mb-10">
                <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                    Suivi des Utilisateurs
                </h1>
                <p className="text-gray-400 text-sm">
                    Analysez les inscriptions et l'engagement client.
                </p>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/10">
                    <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-widest">Total Inscrits</p>
                    <p className="text-3xl font-black text-white">{users.length}</p>
                </div>
                <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/10">
                    <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-widest">Abonnements Actifs</p>
                    <p className="text-3xl font-black text-cyna-cyan">
                        {orders
                            .filter((o) => o.status === 'paid' || o.status === 'completed')
                            .reduce((acc, o) => acc + (o.order_items?.length || 0), 0)}
                    </p>
                </div>
                <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/10">
                    <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-widest">Nouveaux ce mois</p>
                    <p className="text-3xl font-black text-[#00FF94]">
                        {users.filter((u) => new Date(u.created_at).getMonth() === new Date().getMonth()).length}
                    </p>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="bg-[#1C2128] border border-[#2D333B] p-4 rounded-t-2xl flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-[300px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher un email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyna-cyan"
                    />
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                    Total : {filteredUsers.length}
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto bg-[#1C2128] border border-t-0 border-[#2D333B] rounded-b-2xl shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0E14] text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#2D333B]">
                            <th className="p-4 font-bold">Email</th>
                            <th className="p-4 font-bold">Rôle</th>
                            <th className="p-4 font-bold">Date d'inscription</th>
                            <th className="p-4 font-bold">Abonnements actifs</th>
                            <th className="p-4 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B]">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    Chargement...
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => {
                                const isActive = hasActiveSubscription(u.id);
                                const isAdminUser = u.role === 'admin' || u.user_metadata?.role === 'admin';

                                return (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">

                                        {/* Email */}
                                        <td className="p-4 font-bold text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#0B0E14] border border-white/5 flex items-center justify-center text-cyna-cyan flex-shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <span className="truncate max-w-[200px]">{u.email}</span>
                                            </div>
                                        </td>

                                        {/* Rôle */}
                                        <td className="p-4">
                                            {isAdminUser ? (
                                                <span className="px-2 py-1 bg-[#F5A623]/10 text-[#F5A623] text-[10px] uppercase font-bold rounded flex items-center gap-1 w-fit">
                                                    <Shield size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] uppercase font-bold rounded w-fit">
                                                    Client
                                                </span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 text-sm text-gray-400">
                                            {new Date(u.created_at).toLocaleDateString('fr-FR')}
                                        </td>

                                        {/* Abonnements */}
                                        <td className="p-4">{getUserSubscriptions(u.id)}</td>

                                        {/* Action Supprimer */}
                                        <td className="p-4 text-right">
                                            {isAdminUser ? (
                                                // On ne peut jamais supprimer un admin
                                                <span className="text-[10px] text-gray-600 italic font-medium">
                                                    Protégé
                                                </span>
                                            ) : isActive ? (
                                                // Abonnement actif → bouton désactivé avec tooltip
                                                <div className="relative group inline-block">
                                                    <button
                                                        disabled
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                                                    >
                                                        <Trash2 size={12} /> Supprimer
                                                    </button>
                                                    {/* Tooltip */}
                                                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#0B0E14] border border-[#2D333B] text-xs text-gray-400 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-left shadow-xl">
                                                        Abonnement actif en cours. Résiliez d'abord les services.
                                                    </div>
                                                </div>
                                            ) : (
                                                // Aucun abonnement → suppression possible
                                                <button
                                                    onClick={() => setUserToDelete(u)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#FF3B3B] bg-[#FF3B3B]/10 hover:bg-[#FF3B3B]/20 border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/40 transition-all"
                                                >
                                                    <Trash2 size={12} /> Supprimer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;