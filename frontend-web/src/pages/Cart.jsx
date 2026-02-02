import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Box, ShieldAlert, ArrowRight, Lock, Loader } from 'lucide-react';
import { createOrder } from '../services/api'; // Assure-toi que ce fichier existe
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQuantity, updateDuration, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  
  // État pour gérer le chargement pendant le paiement
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérification User
  const user = JSON.parse(localStorage.getItem('user'));

  // Vérifie si un produit bloque la commande (Stock = 0)
  const hasUnavailableItems = cart.some(item => item.stock_virtuel === 0);

  // --- LOGIQUE DE PAIEMENT ---
  const handleCheckout = async () => {
    // 1. Si pas connecté -> Redirection Login
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calcul du total TTC (Total HT * 1.20)
      const totalTTC = cartTotal * 1.20;

      // 2. Appel à l'API NestJS
      // Note: user.id dépend de comment tu as stocké l'user dans le Login. 
      // Si ça bug, vérifie si c'est user.id ou user.user.id
      const result = await createOrder(user.id, cart, totalTTC);

      if (result && (result.status === 'SUCCESS' || result.orderId)) {
        // 3. Succès !
        alert(`Commande #${result.orderId} validée avec succès !`);
        
        // On vide le panier brutalement (pour l'instant)
        localStorage.removeItem('cyna_cart');
        
        // Redirection vers l'accueil (ou un dashboard si tu l'as fait)
        window.location.href = '/'; 
      }
    } catch (error) {
      console.error("Erreur commande:", error);
      alert("Une erreur est survenue lors de la validation de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EMPTY STATE ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cyna-navy flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-cyna-steel rounded-full flex items-center justify-center mb-6 shadow-neon">
          <Box size={48} className="text-cyna-text" />
        </div>
        <h2 className="text-3xl font-bold text-cyna-white mb-2">Votre panier est vide</h2>
        <p className="text-cyna-text mb-8 text-center max-w-md">
          Explorez nos solutions de cybersécurité et sécurisez votre infrastructure.
        </p>
        <Link to="/" className="bg-cyna-cyan text-cyna-navy font-bold py-3 px-8 rounded-lg hover:shadow-neon transition-all">
          Parcourir le catalogue
        </Link>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-cyna-navy pt-[120px] pb-20 px-6">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-12">
        
        {/* === LEFT COLUMN: ITEMS LIST === */}
        <div className="space-y-4">
          <header className="flex items-end gap-4 mb-8">
            <h1 className="text-3xl font-bold text-cyna-white">Votre Panier</h1>
            <span className="text-cyna-text text-sm font-mono mb-1.5">{cartCount} items</span>
          </header>

          {cart.map((item) => {
            const isAvailable = item.stock_virtuel > 0;
            const itemTotal = item.price * item.quantity * (item.duration === 'yearly' ? 12 : 1);

            return (
              <div 
                key={item.id} 
                className={`
                  bg-cyna-steel border border-white/5 rounded-2xl p-6 
                  flex flex-col md:flex-row items-center gap-6 
                  transition-all duration-300
                  ${!isAvailable ? 'opacity-60 border-cyna-error/30' : 'hover:border-cyna-cyan/30'}
                `}
              >
                {/* 1. Icon (Thumbnail) */}
                <div className="w-16 h-16 bg-cyna-navy rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                  <Box className={isAvailable ? "text-cyna-cyan" : "text-cyna-error"} size={32} />
                </div>

                {/* 2. Info & Config */}
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Texte */}
                  <div>
                    <h3 className="text-lg font-bold text-cyna-white">{item.name}</h3>
                    {isAvailable ? (
                      <span className="text-xs font-bold text-cyna-success uppercase tracking-wider">Disponible</span>
                    ) : (
                      <div className="flex items-center gap-2 text-cyna-error mt-1">
                        <ShieldAlert size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Indisponible</span>
                      </div>
                    )}
                    {!isAvailable && (
                       <p className="text-cyna-error text-xs mt-1">Ce service est momentanément indisponible.</p>
                    )}
                  </div>

                  {/* Inputs (Duration & Quantity) */}
                  <div className="flex gap-3">
                    {/* Duration Select */}
                    <select 
                      value={item.duration}
                      onChange={(e) => updateDuration(item.id, e.target.value)}
                      disabled={!isAvailable}
                      className="bg-cyna-navy border border-white/10 text-cyna-text text-sm rounded-lg px-3 py-2 outline-none focus:border-cyna-cyan cursor-pointer"
                    >
                      <option value="monthly">Mensuel</option>
                      <option value="yearly">Annuel (-20%)</option>
                    </select>

                    {/* Quantity Input */}
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, e.target.value)}
                      disabled={!isAvailable}
                      className="w-20 bg-cyna-navy border border-white/10 text-cyna-white text-sm rounded-lg px-3 py-2 outline-none focus:border-cyna-cyan text-center"
                    />
                  </div>
                </div>

                {/* 3. Pricing & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 w-full md:w-auto justify-between">
                  <div className="text-right">
                    <p className="text-xl font-bold text-cyna-cyan">{itemTotal.toFixed(2)} €</p>
                    <p className="text-cyna-text text-xs">({item.price} € / unité)</p>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-cyna-text hover:text-cyna-error transition-colors p-2"
                    title="Retirer du panier"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* === RIGHT COLUMN: ORDER SUMMARY (Sticky) === */}
        <aside className="relative">
          <div className="sticky top-[100px] bg-cyna-navy border border-cyna-cyan/20 rounded-3xl p-8 shadow-neon">
            <h2 className="text-2xl font-bold text-cyna-white mb-6">Récapitulatif</h2>

            {/* Math Rows */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-cyna-text">
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-cyna-text">
                <span>TVA (20%)</span>
                <span>{(cartTotal * 0.20).toFixed(2)} €</span>
              </div>
              
              <div className="h-px bg-white/10 my-6"></div>
              
              <div className="flex justify-between items-end">
                <span className="text-cyna-white font-medium">Total à payer</span>
                <span className="text-3xl font-bold text-cyna-white">{(cartTotal * 1.20).toFixed(2)} €</span>
              </div>
            </div>

            {/* Primary CTA */}
            <button 
              onClick={handleCheckout} // <--- ACTION AJOUTÉE ICI
              disabled={hasUnavailableItems || isSubmitting}
              className={`
                w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all
                ${hasUnavailableItems || isSubmitting
                  ? 'bg-cyna-steel text-cyna-text cursor-not-allowed opacity-50' 
                  : 'bg-cyber-gradient text-cyna-navy hover:shadow-neon hover:scale-[1.02]'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={20} /> Traitement...
                </>
              ) : hasUnavailableItems ? (
                'PANIER INVALIDE'
              ) : (
                <>
                  PASSER À LA CAISSE <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Guest Prompt */}
            {!user && (
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-cyna-cyan hover:underline flex items-center justify-center gap-2">
                  <Lock size={14} /> Connectez-vous pour sauvegarder
                </Link>
              </div>
            )}

          </div>
        </aside>

      </div>
    </div>
  );
};

export default Cart;