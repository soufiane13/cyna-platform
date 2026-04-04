import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Box, ShieldAlert, ArrowRight, Lock, Loader, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  // ==========================================
  // 1. LOGIQUE BACK-END (NE PAS TOUCHER)
  // ==========================================
  const { cart, updateQuantity, updateDuration, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const hasUnavailableItems = cart.some(item => item.stock_virtuel === 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // On appelle maintenant directement le backend NestJS qui va générer la session Stripe
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cart: cart,
          total: cartTotal, // Le backend utilisera le panier pour calculer le total final pour Stripe
        }),
      });

      if (!response.ok) {
        // Gérer les erreurs HTTP (ex: 500, 400)
        const errorData = await response.json();
        throw new Error(errorData.message || 'La création de la commande a échoué.');
      }
      
      const data = await response.json();
      
      // REDIRECTION VERS LA PAGE SÉCURISÉE DE STRIPE
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Erreur: Aucune URL de paiement retournée par le backend.");
        alert("Une erreur technique est survenue. Impossible de procéder au paiement.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du paiement:", error);
      alert(error.message || "Une erreur est survenue lors de l'initialisation du paiement.");
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // 2. AFFICHAGE (UI / FRONT-END RESPONSIVE)
  // ==========================================

  // --- ÉTAT VIDE (EMPTY STATE) ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-24 h-24 bg-[#1C2128] border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
          <Box size={40} className="text-gray-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Votre panier est vide</h2>
        <p className="text-[#A0A0A0] mb-8 max-w-md">
          Explorez notre catalogue de solutions SaaS et sécurisez votre infrastructure dès aujourd'hui.
        </p>
        <Link to="/category/all" className="bg-cyna-cyan text-[#0B0E14] font-black py-4 px-8 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:bg-white transition-all hover:-translate-y-1">
          PARCOURIR LE CATALOGUE
        </Link>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-[#0B0E14] pt-[100px] lg:pt-[140px] pb-20 font-sans selection:bg-cyna-cyan selection:text-black">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8 lg:gap-12">
        
        {/* === COLONNE GAUCHE : LISTE DES ARTICLES === */}
        <div className="space-y-6">
          <header className="flex items-end gap-4 mb-8 border-b border-white/10 pb-6">
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Votre Panier</h1>
            <span className="text-cyna-cyan text-sm font-bold bg-cyna-cyan/10 px-3 py-1 rounded-md mb-1.5">
              {cartCount} service{cartCount > 1 ? 's' : ''}
            </span>
          </header>

          <div className="space-y-4">
            {cart.map((item) => {
              const isAvailable = item.stock_virtuel > 0;
              const itemTotal = item.price * item.quantity * (item.duration === 'yearly' ? 12 : 1);

              return (
                <div 
                  key={item.id} 
                  className={`bg-[#1C2128] border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-300
                    ${!isAvailable ? 'opacity-60 border-[#FF3B3B]/30 grayscale' : 'border-[#2D333B] hover:border-cyna-cyan/50'}
                  `}
                >
                  {/* Icône Produit */}
                  <div className="w-16 h-16 bg-[#0B0E14] border border-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className={isAvailable ? "text-cyna-cyan" : "text-[#FF3B3B]"} size={28} />
                  </div>

                  {/* Infos & Configuration */}
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                      {isAvailable ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#00FF94] uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></span> Disponible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF3B3B] uppercase tracking-widest">
                          <ShieldAlert size={12} /> Stock épuisé
                        </span>
                      )}
                      {!isAvailable && (
                         <p className="text-[#FF3B3B] text-xs mt-2">Ce service nécessite une intervention manuelle.</p>
                      )}
                    </div>

                    {/* Inputs (Durée & Quantité) */}
                    <div className="flex items-center gap-3">
                      <select 
                        value={item.duration}
                        onChange={(e) => updateDuration(item.id, e.target.value)}
                        disabled={!isAvailable}
                        className="bg-[#0B0E14] border border-[#2D333B] text-white text-sm font-bold rounded-lg px-3 py-2.5 outline-none focus:border-cyna-cyan cursor-pointer flex-1"
                      >
                        <option value="monthly">Mensuel</option>
                        <option value="yearly">Annuel (-20%)</option>
                      </select>

                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        disabled={!isAvailable}
                        className="w-20 bg-[#0B0E14] border border-[#2D333B] text-white text-sm font-bold rounded-lg px-3 py-2.5 outline-none focus:border-cyna-cyan text-center"
                      />
                    </div>
                  </div>

                  {/* Prix & Bouton Supprimer */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold text-cyna-cyan font-mono">{itemTotal.toFixed(2)} €</p>
                      <p className="text-[#A0A0A0] text-[10px] uppercase font-bold tracking-wider">{item.price} € / u.</p>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-[#FF3B3B] transition-colors p-2 md:mt-2 bg-white/5 hover:bg-[#FF3B3B]/10 rounded-lg"
                      title="Retirer du panier"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === COLONNE DROITE : RÉSUMÉ (Sticky) === */}
        <aside className="w-full relative">
          <div className="sticky top-[120px] bg-[#1C2128] border border-[#2D333B] rounded-[24px] p-6 lg:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Résumé de la commande</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[#A0A0A0] text-sm font-bold">
                <span>Sous-total HT</span>
                <span className="font-mono text-white">{cartTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-[#A0A0A0] text-sm font-bold">
                <span>TVA (20%)</span>
                <span className="font-mono text-white">{(cartTotal * 0.20).toFixed(2)} €</span>
              </div>
              
              <div className="h-px w-full bg-[#2D333B] my-6"></div>
              
              <div className="flex justify-between items-end">
                <span className="text-white font-bold">Total TTC</span>
                <span className="text-3xl font-bold text-cyna-cyan font-mono">{(cartTotal * 1.20).toFixed(2)} €</span>
              </div>
            </div>

            {/* Bouton Checkout Principal */}
            <button 
              onClick={handleCheckout}
              disabled={hasUnavailableItems || isSubmitting}
              className={`
                w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300
                ${hasUnavailableItems || isSubmitting
                  ? 'bg-[#2D333B] text-gray-500 cursor-not-allowed' 
                  : 'bg-cyna-cyan text-[#0B0E14] hover:bg-white shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:-translate-y-1'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={20} /> REDIRECTION VERS LE PAIEMENT...
                </>
              ) : hasUnavailableItems ? (
                'PANIER INVALIDE (STOCK)'
              ) : (
                <>
                  PROCÉDER AU PAIEMENT SÉCURISÉ <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Avertissement Utilisateur Non Connecté */}
            {!user && (
              <div className="mt-6 text-center bg-[#0B0E14] border border-[#2D333B] rounded-lg p-4">
                <p className="text-xs text-gray-400 font-bold mb-2 flex items-center justify-center gap-2">
                  <Lock size={14} className="text-cyna-cyan" /> Authentification requise
                </p>
                <Link to="/login" className="text-sm text-cyna-cyan hover:text-white transition-colors underline font-bold">
                  Connectez-vous pour finaliser la commande
                </Link>
              </div>
            )}

            <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale">
               {/* Faux logos de paiement pour l'UI */}
               <div className="h-6 w-10 bg-white/20 rounded"></div>
               <div className="h-6 w-10 bg-white/20 rounded"></div>
               <div className="h-6 w-10 bg-white/20 rounded"></div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default Cart;
