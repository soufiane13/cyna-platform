import React from 'react';
import { Box, ArrowRight } from 'lucide-react'; // Icônes
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { Link }            from 'react-router-dom';
import { useCart }         from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart }     = useCart();
  const [added, setAdded] = useState(false);

  const nomAffiche = product.nom || product.name || "Solution CYNA";
  const prixAffiche = parseFloat(product.price || product.prix || 0);
  const requiresQuote = product.requires_quote || false;
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
    <Link to={`/product/${product.id}`} className={`
      group relative w-full h-[420px] 
      bg-cyna-steel rounded-2xl overflow-hidden
      border border-white/5 hover:border-cyna-cyan/30
      hover:-translate-y-2 hover:shadow-card
      transition-all duration-300
      ${!isAvailable ? 'opacity-60 grayscale' : ''}
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

      {/* ZONE INFO (Bottom 40%) */}
      <div className="h-[40%] p-6 flex flex-col justify-between relative bg-cyna-steel z-10">
        <div>
          <h3 className="text-xl font-bold text-cyna-white mb-1 truncate">{nomAffiche}</h3>
          {requiresQuote ? (
            <p className="text-[#F5A623] font-bold text-lg">Sur Devis</p>
          ) : (
            <p className="text-cyna-cyan font-bold text-lg">{prixAffiche.toFixed(2)} €</p>
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

      {/* BOUTON SLIDE UP (Masqué par défaut) */}
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
        {requiresQuote ? (
          <div className="w-full bg-[#F5A623] text-cyna-navy font-bold py-3 rounded-lg shadow-neon flex items-center justify-center gap-2">
            DEMANDER UN DEVIS <ArrowRight size={16} />
          </div>
        ) : (
          <button 
            disabled={!isAvailable}
            onClick={(e) => {
              e.preventDefault(); // Empêche la navigation du Link parent
              e.stopPropagation(); // Empêche la propagation de l'événement
              addToCart({ ...product, name: nomAffiche, price: prixAffiche, quantity: 1, duration: 'monthly' });
            }}
            className="w-full bg-cyna-cyan text-cyna-navy font-bold py-3 rounded-lg shadow-neon hover:bg-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {isAvailable ? "AJOUTER AU PANIER" : "INDISPONIBLE"}
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;