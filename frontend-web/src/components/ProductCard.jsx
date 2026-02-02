import React from 'react';
import { Box, CheckCircle, XCircle } from 'lucide-react'; // Icônes
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isAvailable = product.stock_virtuel > 0; // Ou autre logique de stock

  return (
    <div className={`
      group relative w-full h-[420px] 
      bg-cyna-steel rounded-2xl overflow-hidden
      border border-white/5 hover:border-cyna-cyan/30
      hover:-translate-y-2 hover:shadow-card
      transition-all duration-300
      ${!isAvailable ? 'opacity-60 grayscale' : ''}
    `}>
      
      {/* ZONE IMAGE (Top 60%) */}
      <div className="h-[60%] bg-gradient-to-b from-slate-800 to-cyna-steel flex items-center justify-center p-8 relative">
        {/* Placeholder pour l'icône 3D */}
        <Box size={80} className="text-cyna-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] group-hover:scale-110 transition-transform duration-500" />
      </div>

      {/* ZONE INFO (Bottom 40%) */}
      <div className="h-[40%] p-6 flex flex-col justify-between relative bg-cyna-steel z-10">
        <div>
          <h3 className="text-xl font-bold text-cyna-white mb-1">{product.name}</h3>
          <p className="text-cyna-cyan font-bold text-lg">{product.price} €</p>
        </div>

        {/* Disponibilité */}
        <div className="flex items-center gap-2 mt-2">
          {isAvailable ? (
            <>
              <div className="w-2 h-2 rounded-full bg-cyna-success shadow-[0_0_8px_#00FF94]"></div>
              <span className="text-xs font-medium text-cyna-success uppercase tracking-wider">Disponible</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-cyna-text"></div>
              <span className="text-xs font-medium text-cyna-text uppercase tracking-wider">Épuisé</span>
            </>
          )}
        </div>
      </div>

      {/* BOUTON SLIDE UP (Masqué par défaut) */}
      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
        <button 
          disabled={!isAvailable}
          onClick={() => addToCart(product)}
          className="w-full bg-cyna-cyan text-cyna-navy font-bold py-3 rounded-lg shadow-neon hover:bg-white transition-colors disabled:cursor-not-allowed"
        >
          {isAvailable ? "AJOUTER AU PANIER" : "INDISPONIBLE"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;