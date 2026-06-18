import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const QuoteRequestForm = ({ product, onClose }) => {
    // 1. Gestion de l'état local du formulaire
    const [formData, setFormData] = useState({
        companyName: '',
        companyAddress: '',
        managerName: '',
        phone: '',
        email: '',
        availability: ''
    });
    
    // État pour l'expérience utilisateur (UI)
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

    // Mise à jour générique des champs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Logique de soumission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Bloque le rafraîchissement de la page
        setStatus('loading');

        // Formatage du JSON pour s'intégrer parfaitement à l'API /messages du backoffice Admin
        const payload = {
            contactInfo: `${formData.email} | ${formData.phone}`,
            userName: `${formData.managerName} (${formData.companyName})`,
            message: `📢 DEMANDE DE DEVIS SUR MESURE\n\nProduit/Service : ${product?.name || product?.nom || 'Non spécifié'}\nEntreprise : ${formData.companyName}\nAdresse : ${formData.companyAddress}\nDisponibilité pour RDV : ${formData.availability.replace('T', ' à ')}`
        };

        try {
            // Requête vers le backend NestJS
            const response = await fetch('https://cyna-api-d6b4.onrender.com/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de la demande de devis:", error);
            setStatus('error');
        }
    };

    // 3. Affichage : Message de confirmation (Succès)
    if (status === 'success') {
        return (
            <div className="bg-[#1C2128] border border-[#00FF94]/30 rounded-2xl p-8 text-center animate-fade-in shadow-2xl">
                <CheckCircle className="text-[#00FF94] w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h3>
                <p className="text-gray-400 mb-6">Notre équipe a bien reçu votre demande de devis pour <strong>{product?.name || product?.nom}</strong>. Un administrateur vous recontactera très prochainement.</p>
                {onClose && (
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                        Fermer
                    </button>
                )}
            </div>
        );
    }

    // 4. Affichage : Le Formulaire
    return (
        <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl p-6 md:p-8 relative shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Demander un devis</h3>
            <p className="text-gray-400 text-sm mb-6">Veuillez remplir ce formulaire pour obtenir une tarification sur mesure concernant <strong className="text-cyna-cyan">{product?.name || product?.nom}</strong>.</p>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-lg flex items-center gap-3 text-[#FF3B3B] text-sm font-bold animate-fade-in">
                    <AlertCircle size={18} />
                    Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label htmlFor="companyName" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nom de l'entreprise *</label><input type="text" id="companyName" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 py-3 text-white focus:border-cyna-cyan focus:outline-none transition-colors" placeholder="Ex: Cyna Corp" /></div>
                    <div><label htmlFor="managerName" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nom du responsable *</label><input type="text" id="managerName" name="managerName" required value={formData.managerName} onChange={handleChange} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 py-3 text-white focus:border-cyna-cyan focus:outline-none transition-colors" placeholder="Ex: Jean Dupont" /></div>
                </div>

                <div><label htmlFor="companyAddress" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Adresse de l'entreprise *</label><input type="text" id="companyAddress" name="companyAddress" required value={formData.companyAddress} onChange={handleChange} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 py-3 text-white focus:border-cyna-cyan focus:outline-none transition-colors" placeholder="Ex: 10 Rue de Penthièvre, 75008 Paris" /></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Adresse E-mail *</label><input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 py-3 text-white focus:border-cyna-cyan focus:outline-none transition-colors" placeholder="contact@entreprise.com" /></div>
                    <div><label htmlFor="phone" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Numéro de téléphone *</label><input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 py-3 text-white focus:border-cyna-cyan focus:outline-none transition-colors" placeholder="+33 1 23 45 67 89" /></div>
                </div>

                <div><label htmlFor="availability" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Disponibilité pour un RDV *</label><input type="datetime-local" id="availability" name="availability" required value={formData.availability} onChange={handleChange} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-4 py-3 text-gray-300 focus:border-cyna-cyan focus:outline-none transition-colors color-scheme-dark" style={{ colorScheme: 'dark' }} /></div>

                <div className="pt-2">
                    <button type="submit" disabled={status === 'loading'} className="w-full bg-cyna-cyan hover:bg-[#00D1E0] text-[#0B0E14] font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {status === 'loading' ? (
                            <span className="flex items-center gap-2 animate-pulse">Envoi en cours...</span>
                        ) : (
                            <><Send size={18} /> Demander un devis</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuoteRequestForm;