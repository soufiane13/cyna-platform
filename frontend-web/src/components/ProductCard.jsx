import React, { useState } from 'react';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCategoryConfig } from '../utils/categoryConfig';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const isAvailable = product.stock_virtuel > 0;
    const nomAffiche  = product.nom  || product.name  || 'Solution CYNA';
    const prixAffiche = parseFloat(product.prix || product.price || 0);
    const categorie   = product.categorie || product.category || '';
    const cfg         = getCategoryConfig(categorie);

    const handleAddToCart = (e) => {
        e.preventDefault();
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
                ? `${cfg.hoverBorder} ${cfg.glow} hover:-translate-y-1`
                : 'opacity-60 grayscale hover:grayscale-0'}
        `}>

            {/* ── Zone image ─────────────────────────────────────────────────── */}
            <div className="relative aspect-[4/3] bg-[#0B0E14] border-b border-[#2D333B] flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <img src={product.image_url} alt={nomAffiche}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                ) : (
                    <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.bgGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                        {/* Fond grille de points */}
                        <div className="absolute inset-0 opacity-[0.06]"
                            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                        />
                        <div className={`z-10 group-hover:scale-110 transition-transform duration-300 ${cfg.textClass} opacity-30 group-hover:opacity-60`}>
                            {cfg.icon(52)}
                        </div>
                    </>
                )}

                {/* Badge catégorie */}
                {categorie && (
                    <div className="absolute top-3 left-3 z-20">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-sm ${cfg.badgeBg}`}>
                            <span className={cfg.textClass}>{cfg.icon(10)}</span>
                            {categorie}
                        </span>
                    </div>
                )}

                {/* Badge rupture */}
                {!isAvailable && (
                    <div className="absolute top-3 right-3 z-20">
                        <span className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                            Rupture
                        </span>
                    </div>
                )}
            </div>

            {/* ── Zone infos ─────────────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 p-5">
                <h3 className={`text-base font-bold text-white mb-1.5 line-clamp-2 transition-colors group-hover:${cfg.textClass}`}>
                    {nomAffiche}
                </h3>

                {/* Description courte */}
                {product.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                        {product.description}
                    </p>
                )}

                {isAvailable
                    ? <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#00FF94] uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />Disponible
                      </span>
                    : <span className="text-[9px] font-bold text-[#FF3B3B] uppercase tracking-widest mb-4">Indisponible</span>
                }

                <div className="mt-auto">
                    {product.requires_quote ? (
                        <div className="mb-4">
                            <p className="text-[9px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">Tarification</p>
                            <p className="font-mono text-xl font-bold text-[#F5A623]">Sur devis</p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <p className="text-[9px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">À partir de</p>
                            <p className={`font-mono text-xl font-bold ${cfg.textClass}`}>
                                {prixAffiche.toFixed(2)} €<span className="text-xs text-[#A0A0A0] font-sans ml-1">/ mois</span>
                            </p>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-2">
                        {product.requires_quote ? (
                            <Link
                                to={`/product/${product.id}`}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] hover:bg-[#F5A623]/30"
                            >
                                Demander un devis <ArrowRight size={14} />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to={`/product/${product.id}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#2D333B] text-[#A0A0A0] hover:border-white/20 hover:text-white transition-all group/btn"
                                >
                                    Détails <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                </Link>

                                <button
                                    disabled={!isAvailable}
                                    onClick={handleAddToCart}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300
                                        ${!isAvailable
                                            ? 'bg-[#2D333B] text-gray-600 cursor-not-allowed'
                                            : added
                                                ? 'bg-[#00FF94]/20 border border-[#00FF94]/40 text-[#00FF94]'
                                                : `bg-white/5 border ${cfg.border} ${cfg.textClass} hover:bg-opacity-20`
                                        }`}
                                    style={isAvailable && !added ? { '--tw-bg-opacity': 1 } : {}}
                                >
                                    {added ? <><Check size={13} /> Ajouté !</> : <><ShoppingCart size={13} /> Ajouter</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
