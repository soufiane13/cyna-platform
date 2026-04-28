import React, { useState, useEffect } from 'react';
import { Search, Mail, MessageSquareText, CheckCircle, Clock, X, Trash2, Send, RefreshCcw } from 'lucide-react';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // States pour la modale d'email
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailData, setEmailData] = useState({ to: '', subject: '', message: '', messageId: null });
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/messages');
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (error) {
            console.error("Erreur chargement messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Mettre à jour le statut d'un message (ex: marquer comme lu/répondu)
    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:3000/messages/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
            }
        } catch (err) {
            console.error("Erreur mise à jour statut:", err);
        }
    };

    const openReplyModal = (msg) => {
        setEmailData({
            to: msg.contact_info,
            subject: 'RE: Votre demande au support CYNA Defense',
            message: `\n\n\n------------------------------\nVotre message d'origine :\n${msg.message}`,
            messageId: msg.id
        });
        setIsEmailModalOpen(true);
    };

    const handleSendEmail = async () => {
        setSendingEmail(true);
        try {
            const res = await fetch('http://localhost:3000/messages/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: emailData.to, subject: emailData.subject, message: emailData.message })
            });
            if (res.ok) {
                alert('✅ Email envoyé avec succès !');
                setIsEmailModalOpen(false);
                if (emailData.messageId) updateStatus(emailData.messageId, 'replied'); // Marquer comme répondu
            } else {
                alert('❌ Erreur lors de l\'envoi.');
            }
        } catch (e) {
            alert('❌ Erreur réseau.');
        }
        setSendingEmail(false);
    };

    const filteredMessages = messages.filter(m => 
        (m.contact_info || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 min-h-screen bg-[#0B0E14] text-white animate-fade-in relative">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">Support & Chatbot</h1>
                    <p className="text-gray-400 text-sm">Gérez les demandes de contact et les escalades de Nexus.</p>
                </div>
                <button onClick={fetchMessages} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#1C2128] border border-[#2D333B] rounded-lg text-sm font-bold hover:bg-white/5 transition-colors disabled:opacity-50">
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                    Actualiser
                </button>
            </header>

            <div className="bg-[#1C2128] border border-[#2D333B] p-4 rounded-t-2xl flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-[300px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Rechercher (Email, Contenu)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyna-cyan" />
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-md border border-white/5">Total : {filteredMessages.length}</div>
            </div>

            <div className="overflow-x-auto bg-[#1C2128] border border-t-0 border-[#2D333B] rounded-b-2xl shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0E14] text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#2D333B]">
                            <th className="p-4 font-bold">Contact (Email/Tél)</th>
                            <th className="p-4 font-bold">Auteur & Date</th>
                            <th className="p-4 font-bold w-[40%]">Message / Historique</th>
                            <th className="p-4 font-bold text-center">Statut</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B]">
                        {loading ? <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chargement...</td></tr> : filteredMessages.map(msg => (
                            <tr key={msg.id} className={`hover:bg-white/5 transition-colors ${msg.status === 'unread' ? 'bg-cyna-cyan/5' : ''}`}>
                                <td className="p-4 font-bold text-cyna-cyan">{msg.contact_info}</td>
                                <td className="p-4">
                                    <div className="text-sm font-bold text-white">{msg.user_name || 'Visiteur'}</div>
                                    <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-400 whitespace-pre-wrap max-h-32 overflow-hidden block">{msg.message}</td>
                                <td className="p-4 text-center">
                                    {msg.status === 'replied' ? <span className="px-2 py-1 bg-[#00FF94]/10 text-[#00FF94] text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1 mx-auto w-fit"><CheckCircle size={12}/> Traité</span> : 
                                     msg.status === 'unread' ? <span className="px-2 py-1 bg-[#F5A623]/10 text-[#F5A623] text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1 mx-auto w-fit"><Clock size={12}/> À traiter</span> :
                                     <span className="px-2 py-1 bg-white/10 text-gray-400 text-[10px] uppercase font-bold rounded">Lu</span>}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {msg.status === 'unread' && <button onClick={() => updateStatus(msg.id, 'read')} className="text-xs text-gray-500 hover:text-white underline">Marquer lu</button>}
                                        <button onClick={() => openReplyModal(msg)} className="px-3 py-1.5 bg-cyna-cyan text-black text-xs font-bold rounded hover:bg-white transition-colors flex items-center gap-1"><Mail size={14}/> Répondre</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredMessages.length === 0 && !loading && <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucun message trouvé.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE RÉPONSE RAPIDE */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-[#1C2128] border border-[#2D333B] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="flex justify-between items-center p-6 border-b border-[#2D333B]"><h2 className="text-xl font-bold flex items-center gap-2"><Send className="text-cyna-cyan" /> Répondre au client</h2><button onClick={() => setIsEmailModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button></div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Destinataire</label><input type="text" value={emailData.to} disabled className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed" /></div>
                            <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sujet</label><input type="text" value={emailData.subject} onChange={e => setEmailData({...emailData, subject: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyna-cyan" /></div>
                            <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Votre Réponse</label><textarea value={emailData.message} onChange={e => setEmailData({...emailData, message: e.target.value})} className="w-full h-48 bg-[#0B0E14] border border-[#2D333B] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyna-cyan resize-none" placeholder="Tapez votre réponse ici..." /></div>
                            <button onClick={handleSendEmail} disabled={sendingEmail || !emailData.message} className="w-full bg-cyna-cyan text-[#0B0E14] font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 flex justify-center gap-2 items-center">
                                {sendingEmail ? "Envoi en cours..." : <><Send size={16}/> Envoyer la réponse</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminMessages;