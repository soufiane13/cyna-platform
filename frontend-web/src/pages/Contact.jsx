import React, { useState } from 'react';
import CynaChatbot from '../components/CynaChatbot';
import { Mail, MapPin, Globe } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connecter avec le backend NestJS (ex: await fetch('/messages', ...))
    setSubmitted(true);
    setFormData({ email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000); // Disparaît après 5s
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 lg:py-20 selection:bg-cyna-cyan selection:text-black relative">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Contactez-nous</h1>
        <p className="text-[#A0A0A0] text-lg">Besoin d'aide avec nos solutions de cybersécurité ? L'équipe CYNA-IT est à votre disposition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Bloc 1 : Coordonnées */}
        <div className="bg-[#1C2128] border border-[#2D333B] p-8 md:p-12 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8">Informations de l'entreprise</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyna-cyan/10 rounded-xl text-cyna-cyan"><MapPin size={24} /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Adresse</p>
                <p className="text-white font-medium text-lg">CYNA-IT</p>
                <p className="text-[#A0A0A0]">10 RUE DE PENTHIEVRE<br/>75008 Paris</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyna-cyan/10 rounded-xl text-cyna-cyan"><Globe size={24} /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Site internet</p>
                <a href="https://www.cyna-it.fr" className="text-white font-medium text-lg hover:text-cyna-cyan transition-colors" target="_blank" rel="noreferrer">www.cyna-it.fr</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc 2 : Formulaire de Contact */}
        <div className="bg-[#1C2128] border border-[#2D333B] p-8 md:p-12 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8">Envoyez-nous un message</h2>
          
          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-2xl text-center font-medium animate-fade-in">
              Merci ! Votre message a bien été envoyé. Notre équipe vous répondra dans les plus brefs délais.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#A0A0A0] mb-2">Adresse e-mail *</label>
                <input type="email" required className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyna-cyan transition-colors" placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#A0A0A0] mb-2">Sujet du message *</label>
                <select required className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-5 py-3 text-white focus:outline-none focus:border-cyna-cyan transition-colors appearance-none" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}>
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="support">Support technique</option>
                  <option value="billing">Question abonnement / facturation</option>
                  <option value="sales">Demande commerciale</option>
                  <option value="other">Autre demande</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#A0A0A0] mb-2">Message *</label>
                <textarea required rows="5" className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyna-cyan transition-colors resize-none" placeholder="Détaillez votre demande ici..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              
              <button type="submit" className="w-full bg-cyna-cyan hover:bg-[#00D1E0] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] uppercase tracking-wide">Envoyer le message</button>
            </form>
          )}
        </div>
      </div>

      {/* Bloc 3 : Assistance en direct (Chatbot) */}
      <CynaChatbot />
    </div>
  );
};
export default Contact;