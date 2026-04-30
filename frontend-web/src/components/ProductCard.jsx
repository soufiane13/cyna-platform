import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { Link }            from 'react-router-dom';
import { useCart }         from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart }     = useCart();
  const [added, setAdded] = useState(false);

  // ── Normalisation des champs (nom/nom, prix/price) ─────────────────────────
  const isAvailable = product.stock_virtuel > 0;
  const nomAffiche  = product.nom  || product.name  || 'Solution CYNA';
  const prixAffiche = parseFloat(product.prix || product.price || 0);

  // ── Ajout au panier avec feedback visuel 1.5s ──────────────────────────────
  const handleAddToCart = (e) => {
    e.preventDefault();    // empêche la navigation du Link parent
    e.stopPropagation();
    addToCart({ ...product, name: nomAffiche, price: prixAffiche, quantity: 1, duration: 'monthly' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`
      group relative w-full bg-[#1C2128] rounded-2xl overflow-hidden
      border border-[#2D333B] transition-all duration-300 flex flex-col
      ${isAvailable
        ? 'hover:border-cyna-cyan/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.08)] hover:-translate-y-1'
        : 'opacity-60 grayscale hover:grayscale-0'}
    `}>

      {/* ── Zone image ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-[#0B0E14] border-b border-[#2D333B] flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={nomAffiche} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        ) : (
          <>
            <div className={`absolute inset-0 transition-colors duration-300 ${isAvailable ? 'bg-cyna-cyan/5 group-hover:bg-cyna-cyan/10' : 'bg-white/5'}`} />
            <ShieldCheck size={56} className={`z-10 transition-transform duration-300 group-hover:scale-110 ${isAvailable ? 'text-cyna-cyan/40' : 'text-white/20'}`} />
          </>
        )}
        {!isAvailable && (
          <div className="absolute top-3 right-3 z-20">
            <span className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* ── Zone infos ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-cyna-cyan transition-colors">
          {nomAffiche}
        </h3>
        {isAvailable
          ? <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#00FF94] uppercase tracking-widest mb-4"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />Disponible</span>
          : <span className="text-[10px] font-bold text-[#FF3B3B] uppercase tracking-widest mb-4">Indisponible</span>
        }

        <div className="mt-auto">
          <p className="text-[10px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">À partir de</p>
          <p className="text-cyna-cyan font-mono text-2xl font-bold mb-5">
            {prixAffiche.toFixed(2)} €<span className="text-xs text-[#A0A0A0] font-sans ml-1">/ mois</span>
          </p>

          {/* ── Boutons : Détails + Ajouter au panier ──────────────────────── */}
          <div className="flex gap-2">

            {/* Bouton Détails → /product/:id */}
            <Link
              to={`/product/${product.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#2D333B] text-[#A0A0A0] hover:border-cyna-cyan/40 hover:text-cyna-cyan transition-all group/btn"
            >
              Détails <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>

            {/* Bouton Panier → CartContext (avec feedback visuel) */}
            <button
              disabled={!isAvailable}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300
                ${!isAvailable
                  ? 'bg-[#2D333B] text-gray-600 cursor-not-allowed'
                  : added
                    ? 'bg-[#00FF94]/20 border border-[#00FF94]/40 text-[#00FF94]'
                    : 'bg-cyna-cyan/10 border border-cyna-cyan/30 text-cyna-cyan hover:bg-cyna-cyan hover:text-[#0B0E14]'
                }`}
            >
              {added ? <><Check size={14} /> Ajouté !</> : <><ShoppingCart size={14} /> Ajouter</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;