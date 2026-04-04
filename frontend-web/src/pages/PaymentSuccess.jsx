import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Si on a un ID de session Stripe dans l'URL, le paiement a réussi
    if (sessionId) {
      // On vide le panier stocké en local
      localStorage.removeItem('cyna_cart');
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center text-center p-6 animate-fade-in font-sans">
      <div className="w-24 h-24 bg-[#00FF94]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,255,148,0.2)]">
        <CheckCircle size={50} className="text-[#00FF94]" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Paiement Validé</h1>
      <p className="text-[#A0A0A0] max-w-lg mb-10 text-lg">
        Merci pour votre confiance. Votre commande a bien été enregistrée et vos services sont en cours d'activation. Vous retrouverez votre facture dans votre espace client.
      </p>
      
      <Link to="/dashboard" className="bg-cyna-cyan text-[#0B0E14] font-black px-8 py-4 rounded-xl hover:bg-white hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        ACCÉDER À MON TABLEAU DE BORD
      </Link>
    </div>
  );
};

export default PaymentSuccess;