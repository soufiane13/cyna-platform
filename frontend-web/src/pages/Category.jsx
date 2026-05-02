import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { fetchProducts } from '../services/productService';
import { getCategoryConfig, CATEGORY_CONFIG } from '../utils/categoryConfig';

const Category = () => {
    const { slug } = useParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const data = await fetchProducts(slug === 'all' ? undefined : slug);
                setProducts(data);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement de la catégorie :', err);
                setError('Impossible de charger les solutions de sécurité.');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [slug]);

    const sortedProducts = [...products].sort((a, b) => {
        const aIn = a.stock_virtuel > 0;
        const bIn = b.stock_virtuel > 0;
        if (aIn !== bIn) return aIn ? -1 : 1;
        return parseFloat(a.prix) - parseFloat(b.prix);
    });

    // Config dynamique selon le slug
    const isAll = slug === 'all' || !slug;
    const cfg = isAll ? null : getCategoryConfig(slug);
    const pageTitle = isAll ? 'Toutes nos solutions' : (cfg?.label || slug.toUpperCase());
    const pageTagline = isAll
        ? 'Découvrez l\'ensemble de nos solutions de cybersécurité pour protéger votre infrastructure.'
        : cfg?.tagline;

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white pt-20 lg:pt-28 pb-20 font-sans selection:bg-cyna-cyan selection:text-black">

            {/* ── EN-TÊTE DYNAMIQUE ────────────────────────────────────────────── */}
            <div className="relative w-full py-16 md:py-24 border-b border-white/10 flex flex-col justify-center px-6 md:px-12 lg:px-20 overflow-hidden">

                {/* Fond grille de points */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />

                {/* Dégradé de couleur selon catégorie */}
                <div className={`absolute inset-0 bg-gradient-to-r ${cfg ? cfg.headerGradient : 'from-slate-900/60 via-[#0B0E14]/90 to-transparent'}`} />

                {/* Glow coloré (seulement si catégorie identifiée) */}
                {cfg && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-20"
                        style={{ backgroundColor: cfg.accentColor }}
                    />
                )}

                <div className="relative z-10 max-w-[800px] animate-fade-in">

                    {/* Badge catégorie */}
                    {cfg && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-5 ${cfg.badgeBg}`}>
                            <span className={cfg.textClass}>{cfg.icon(14)}</span>
                            {cfg.label}
                        </div>
                    )}

                    {/* Titre */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase mb-5 leading-tight">
                        {pageTitle}
                    </h1>

                    {/* Description */}
                    <p className="text-[#A0A0A0] text-base md:text-lg leading-relaxed max-w-2xl mb-6">
                        {pageTagline}
                    </p>

                    {/* Features clés (si catégorie spécifique) */}
                    {cfg?.features && (
                        <div className="flex flex-wrap gap-2">
                            {cfg.features.map((f, i) => (
                                <span key={i} className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <span className={`w-1 h-1 rounded-full ${cfg.textClass.replace('text-', 'bg-')}`} />
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Vue d'ensemble : liens vers les catégories */}
                    {isAll && (
                        <div className="flex flex-wrap gap-3 mt-2">
                            {Object.entries(CATEGORY_CONFIG).map(([key, c]) => (
                                <Link
                                    key={key}
                                    to={`/category/${key}`}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 ${c.badgeBg}`}
                                >
                                    <span className={c.textClass}>{c.icon(12)}</span>
                                    {c.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── GRILLE DE PRODUITS ───────────────────────────────────────────── */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-12 md:mt-20">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-cyna-cyan">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="text-white font-bold tracking-widest uppercase text-sm">Synchronisation avec le SOC...</p>
                    </div>
                ) : error ? (
                    <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <AlertCircle size={48} className="text-[#FF3B3B] mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Erreur de connexion</h3>
                        <p className="text-[#A0A0A0]">{error}</p>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#1C2128] rounded-2xl border border-white/5">
                        {cfg && <div className={`text-5xl mb-4 flex justify-center ${cfg.textClass}`}>{cfg.icon(48)}</div>}
                        <h3 className="text-2xl font-bold text-white mb-2">Aucune solution trouvée</h3>
                        <p className="text-[#A0A0A0]">Nous n'avons pas encore de services déployés dans cette catégorie.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {sortedProducts.map((product) => {
                            const inStock = product.stock_virtuel > 0;
                            const prix = parseFloat(product.prix || product.price || 0);
                            const nomProduit = product.nom || product.name || 'Solution CYNA';
                            const categorie = product.categorie || product.category || '';
                            const prodCfg = getCategoryConfig(categorie);

                            return (
                                <Link
                                    to={`/product/${product.id}`}
                                    key={product.id}
                                    className={`bg-[#1C2128] border border-[#2D333B] rounded-[24px] overflow-hidden transition-all duration-300 group relative flex flex-col h-full
                                        ${!inStock
                                            ? 'opacity-60 grayscale hover:grayscale-0'
                                            : `${prodCfg.hoverBorder} ${prodCfg.glow} hover:-translate-y-1`}`}
                                >
                                    {/* Zone image / Visuel */}
                                    <div className="relative aspect-[4/3] bg-[#0B0E14] border-b border-[#2D333B] flex items-center justify-center overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={nomProduit}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                        ) : (
                                            <>
                                                <div className={`absolute inset-0 bg-gradient-to-br ${prodCfg.bgGradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                                                {/* Fond grille de points subtil */}
                                                <div className="absolute inset-0 opacity-[0.06]"
                                                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                                                />
                                                <div className={`z-10 group-hover:scale-110 transition-transform duration-300 ${prodCfg.textClass} opacity-30 group-hover:opacity-60`}>
                                                    {prodCfg.icon(56)}
                                                </div>
                                            </>
                                        )}

                                        {/* Badge catégorie */}
                                        {categorie && (
                                            <div className="absolute top-3 left-3 z-20">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-sm ${prodCfg.badgeBg}`}>
                                                    <span className={prodCfg.textClass}>{prodCfg.icon(10)}</span>
                                                    {categorie}
                                                </span>
                                            </div>
                                        )}

                                        {/* Badge rupture */}
                                        {!inStock && (
                                            <div className="absolute top-3 right-3 z-20">
                                                <span className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest backdrop-blur-sm">
                                                    Rupture
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Zone infos */}
                                    <div className="flex-1 flex flex-col p-5">
                                        <h3 className={`text-base font-bold text-white mb-1.5 line-clamp-2 transition-colors group-hover:${prodCfg.textClass}`}>
                                            {nomProduit}
                                        </h3>

                                        {product.description && (
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                                                {product.description}
                                            </p>
                                        )}

                                        {inStock
                                            ? <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#00FF94] uppercase tracking-widest mb-4">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />Disponible
                                              </span>
                                            : <span className="text-[9px] font-bold text-[#FF3B3B] uppercase tracking-widest mb-4">Indisponible</span>
                                        }

                                        <div className="mt-auto">
                                            <p className="text-[9px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">À partir de</p>
                                            <div className="flex items-end justify-between">
                                                <p className={`font-mono text-2xl font-bold ${prodCfg.textClass}`}>{prix.toFixed(2)} €</p>
                                                <div className={`w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-current transition-all ${prodCfg.textClass}`}>
                                                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Category;
