import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
// ⚠️ ATTENTION : Assure-toi que ce chemin correspond à ton fichier de service réel
import { fetchProducts } from '../services/productService';

const Category = () => {
    const { slug } = useParams();

    // ==========================================
    // 1. LOGIQUE BACK-END (VRAIES DONNÉES)
    // ==========================================
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                // Récupération des vrais produits depuis la BDD (NestJS ou Supabase)
                const data = await fetchProducts(slug === 'all' ? undefined : slug);
                setProducts(data);
                setError(null);
            } catch (err) {
                console.error("Erreur lors du chargement de la catégorie :", err);
                setError("Impossible de charger les solutions de sécurité.");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [slug]);

    // ==========================================
    // 2. LOGIQUE MÉTIER (TRI & FILTRAGE)
    // ==========================================
    // On adapte ta logique de tri aux vraies colonnes de ta BDD (stock_virtuel)
    const sortedProducts = [...products].sort((a, b) => {
        const aInStock = a.stock_virtuel > 0;
        const bInStock = b.stock_virtuel > 0;

        // 1. Les produits en rupture de stock vont à la fin
        if (aInStock !== bInStock) return aInStock ? -1 : 1;

        // 2. Ensuite, on peut trier par ID ou prix (ici par prix croissant par défaut)
        return parseFloat(a.prix) - parseFloat(b.prix);
    });

    // Déterminer le titre de la page
    const pageTitle = slug === 'all' || !slug ? 'Toutes nos solutions' : slug.toUpperCase();

    // ==========================================
    // 3. AFFICHAGE (UI / FRONT-END RESPONSIVE)
    // ==========================================
    return (
        <div className="min-h-screen bg-[#0B0E14] text-white pt-20 lg:pt-28 pb-20 font-sans selection:bg-cyna-cyan selection:text-black">

            {/* --- EN-TÊTE DE LA CATÉGORIE (Style Cyber) --- */}
            <div className="relative w-full py-16 md:py-24 border-b border-white/10 flex flex-col justify-center px-6 md:px-12 lg:px-20 overflow-hidden bg-[#1C2128]">
                {/* Image de fond (Style Circuit Imprimé / Cyber) */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1614064641936-3bce5c537d70?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-luminosity"></div>
                {/* Dégradé pour lisibilité du texte */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/90 to-transparent"></div>

                <div className="relative z-10 max-w-[800px] animate-fade-in">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-widest uppercase mb-6 leading-tight">
                        {pageTitle}
                    </h1>
                    <p className="text-[#A0A0A0] text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
                        Découvrez nos solutions d'élite pour sécuriser votre infrastructure contre les menaces avancées. Performance maximale, latence nulle.
                    </p>
                </div>
            </div>

            {/* --- ZONE DE CONTENU (Grille ou Chargement) --- */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-12 md:mt-20">

                {/* Gestion du Chargement */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-cyna-cyan">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="text-white font-bold tracking-widest uppercase text-sm">Synchronisation avec le SOC...</p>
                    </div>
                ) : error ? (
                    /* Gestion des Erreurs */
                    <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <AlertCircle size={48} className="text-[#FF3B3B] mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Erreur de connexion</h3>
                        <p className="text-[#A0A0A0]">{error}</p>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    /* Gestion du Vide (Aucun produit dans la catégorie) */
                    <div className="text-center py-20 bg-[#1C2128] rounded-2xl border border-white/5">
                        <h3 className="text-2xl font-bold text-white mb-2">Aucune solution trouvée</h3>
                        <p className="text-[#A0A0A0]">Nous n'avons pas encore de services déployés dans cette catégorie.</p>
                    </div>
                ) : (
                    /* Affichage de la Grille de Produits */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {sortedProducts.map((product) => {
                            // On utilise la vraie colonne 'stock_virtuel' de ta BDD
                            const inStock = product.stock_virtuel > 0;
                            // On s'assure que le prix est bien un nombre
                            const prix = parseFloat(product.prix || product.price || 0);
                            // On gère le nom de la colonne (nom ou name selon ton API)
                            const nomProduit = product.nom || product.name || "Solution CYNA";

                            return (
                                <Link
                                    to={`/product/${product.id}`}
                                    key={product.id}
                                    className={`bg-[#1C2128] border border-[#2D333B] rounded-[24px] p-6 transition-all duration-300 group relative overflow-hidden flex flex-col h-full ${!inStock
                                            ? 'opacity-60 grayscale hover:grayscale-0'
                                            : 'hover:border-cyna-cyan/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.05)] hover:-translate-y-1'
                                        }`}
                                >
                                    {/* Image/Illustration Produit */}
                                    <div className="aspect-[4/3] bg-[#0B0E14] rounded-xl mb-6 flex items-center justify-center relative border border-white/5 overflow-hidden">
                                        {/* Image réelle si elle existe, sinon fond par défaut */}
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={nomProduit} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <>
                                                <div className={`absolute inset-0 ${inStock ? 'bg-cyna-cyan/5 group-hover:bg-cyna-cyan/10' : 'bg-white/5'} transition-colors`}></div>
                                                <span className="font-bold text-white/20 tracking-wider text-center px-4 z-10">{nomProduit}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Infos Produit */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{nomProduit}</h3>

                                        <div className="mt-auto pt-6">
                                        <p className="text-[10px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">
                                            {product.requires_quote ? 'TARIFICATION SUR MESURE' : 'À PARTIR DE'}
                                        </p>

                                            <div className="flex items-end justify-between">
                                            {product.requires_quote ? (
                                                <p className="text-[#F5A623] font-bold text-2xl tracking-tight">Sur Devis</p>
                                            ) : (
                                                <p className="text-cyna-cyan font-mono text-2xl font-bold">{prix.toFixed(2)} €</p>
                                            )}
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-[#0B0E14] transition-all">
                                                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mention Stock Épuisé */}
                                    {!inStock && (
                                        <div className="absolute top-6 right-6">
                                            <span className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B]"></span> Rupture
                                            </span>
                                        </div>
                                    )}
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
