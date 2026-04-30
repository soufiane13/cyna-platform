import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Server, Activity, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// ⚠️ Assure-toi d'avoir ces fonctions dans tes services API
import { fetchProducts } from '../services/productService';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // ==========================================
    // 1. ÉTATS (DATA & UI)
    // ==========================================
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour les interactions utilisateur
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' ou 'yearly'
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false); // Effet visuel du bouton d'ajout

    // États pour le Formulaire de Devis
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
    const [quoteSuccess, setQuoteSuccess] = useState(false);
    const [quoteForm, setQuoteForm] = useState({
        companyName: '',
        address: '',
        email: '',
        phone: '',
        contactPerson: '',
        availability: ''
    });

    // ==========================================
    // 2. LOGIQUE BACK-END (CHARGEMENT BDD)
    // ==========================================
    useEffect(() => {
        const loadProductData = async () => {
            try {
                setLoading(true);
                window.scrollTo(0, 0); // Remonte en haut de la page au changement de produit

                // Idéalement, tu devrais avoir un `fetchProductById(id)` dans tes services.
                // Pour l'instant, on fetch tout et on filtre (à optimiser plus tard si beaucoup de produits)
                const allProducts = await fetchProducts();
                const foundProduct = allProducts.find(p => p.id.toString() === id.toString());

                if (!foundProduct) {
                    throw new Error("Produit introuvable");
                }

                setProduct(foundProduct);

                // Cross-selling : Prendre 3 autres produits de la même catégorie ou au hasard
                const others = allProducts.filter(p => p.id.toString() !== id.toString()).slice(0, 3);
                setSimilarProducts(others);
                setError(null);

            } catch (err) {
                console.error("Erreur chargement produit :", err);
                setError("Impossible de charger les détails de ce service.");
            } finally {
                setLoading(false);
            }
        };

        if (id) loadProductData();
    }, [id]);

    // ==========================================
    // 3. ACTIONS (AJOUT AU PANIER)
    // ==========================================
    const handleAddToCart = () => {
        if (!product) return;

        setIsAdding(true);

        // Formatage des données pour correspondre à la structure de ton CartContext
        const cartItem = {
            id: product.id,
            name: product.nom || product.name,
            price: parseFloat(product.prix || product.price),
            stock_virtuel: product.stock_virtuel,
            quantity: parseInt(quantity, 10),
            duration: billingCycle
        };

        addToCart(cartItem);

        // Petit délai pour l'animation du bouton avant de rediriger
        setTimeout(() => {
            navigate('/cart');
        }, 600);
    };

    // ==========================================
    // GESTION DU FORMULAIRE DE DEVIS
    // ==========================================
    const submitQuote = async (e) => {
        e.preventDefault();
        setIsSubmittingQuote(true);
        try {
            const messageContent = `🎯 DEMANDE DE DEVIS POUR : ${product.nom || product.name}\n\n🏢 Entreprise : ${quoteForm.companyName}\n📍 Adresse : ${quoteForm.address}\n👤 Responsable : ${quoteForm.contactPerson}\n🕒 Disponibilité : ${quoteForm.availability}`;
            
            // Envoi vers le endpoint des messages existant (Backend NestJS)
            await fetch('http://localhost:3000/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: quoteForm.contactPerson,
                    contactInfo: `${quoteForm.email} / ${quoteForm.phone}`,
                    message: messageContent
                })
            });
            setQuoteSuccess(true);
            setTimeout(() => {
                setIsQuoteModalOpen(false);
                setQuoteSuccess(false);
                setQuoteForm({ companyName: '', address: '', email: '', phone: '', contactPerson: '', availability: '' });
            }, 4000);
        } catch (error) {
            console.error('Erreur lors de la demande de devis', error);
            alert('Erreur de connexion. Veuillez réessayer ultérieurement.');
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    // ==========================================
    // 4. GESTION DES ÉTATS DE CHARGEMENT
    // ==========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center pt-[120px]">
                <Loader2 size={48} className="text-cyna-cyan animate-spin mb-4" />
                <p className="text-white font-bold tracking-widest uppercase">Décryptage des données...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center pt-[120px] px-6">
                <AlertCircle size={64} className="text-[#FF3B3B] mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Erreur 404</h2>
                <p className="text-[#A0A0A0] mb-8">{error}</p>
                <Link to="/category/all" className="bg-cyna-cyan text-[#0B0E14] px-8 py-3 rounded-xl font-bold hover:bg-white transition-all">Retour au catalogue</Link>
            </div>
        );
    }

    // ==========================================
    // 5. PRÉPARATION DES DONNÉES D'AFFICHAGE
    // ==========================================
    const inStock = product.stock_virtuel > 0;
    const prixBase = parseFloat(product.prix || product.price);
    const nomProduit = product.nom || product.name;

    // Si tu n'as qu'une seule image dans Supabase, on complète le tableau pour garder le carousel actif visuellement
    const displayImages = product.image_url
        ? [product.image_url, "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"]
        : [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80"
        ];

    // ==========================================
    // 6. RENDU UI (FRONT-END RESPONSIVE)
    // ==========================================
    return (
        <div className="min-h-screen bg-[#0B0E14] text-white pt-[100px] lg:pt-[140px] pb-32 font-sans selection:bg-cyna-cyan selection:text-black">
            <div className="max-w-[1280px] mx-auto px-6">

                {/* =========================================
            SPLIT LAYOUT (Above the fold)
        ========================================= */}
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* COLONNE GAUCHE (60%) : Visuels & Contenu */}
                    <div className="w-full lg:w-[60%] space-y-16">

                        {/* Section A : Carousel Visuel */}
                        <div className="space-y-4 animate-fade-in">
                            <div className="aspect-video bg-[#05070A] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 relative group cursor-pointer">
                                <img src={displayImages[activeImage]} alt={nomProduit} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] to-transparent opacity-50"></div>
                            </div>

                            {/* Miniatures */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? 'border-cyna-cyan scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section B : Deep Dive Content */}
                        <div className="space-y-12">

                            {/* Description provenant de Supabase */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">À propos de ce service</h2>
                                <div className="text-[#A0A0A0] text-base leading-[1.7] space-y-6">
                                    <p>{product.description || "Sécurisez votre infrastructure avec notre solution de pointe. Ce service est conçu pour s'intégrer parfaitement à votre environnement B2B existant."}</p>

                                    {/* Avantages génériques si la description est courte */}
                                    <ul className="space-y-4 pt-4">
                                        {[
                                            "Surveillance et détection en temps réel avec latence < 1ms.",
                                            "Protection autonome contre les menaces avancées.",
                                            "Visibilité complète et intégration API."
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-cyna-cyan/10 flex items-center justify-center flex-shrink-0">
                                                    <Check size={12} className="text-cyna-cyan" />
                                                </div>
                                                <span className="text-gray-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Caractéristiques techniques (Bento Grid) */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Caractéristiques Techniques</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/5">
                                        <Shield className="text-cyna-cyan mb-4" size={24} />
                                        <h3 className="font-bold text-white mb-2">Hautement Sécurisé</h3>
                                        <p className="text-sm text-[#A0A0A0]">Chiffrement de bout en bout et conformité RGPD/ISO27001.</p>
                                    </div>
                                    <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/5">
                                        <Zap className="text-cyna-cyan mb-4" size={24} />
                                        <h3 className="font-bold text-white mb-2">Performance Cloud</h3>
                                        <p className="text-sm text-[#A0A0A0]">Infrastructure redondante avec disponibilité garantie à 99.99%.</p>
                                    </div>
                                    <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/5">
                                        <Server className="text-cyna-cyan mb-4" size={24} />
                                        <h3 className="font-bold text-white mb-2">Intégration Facile</h3>
                                        <p className="text-sm text-[#A0A0A0]">Compatible avec la majorité des SIEM et outils de monitoring.</p>
                                    </div>
                                    <div className="bg-[#1C2128] p-6 rounded-2xl border border-white/5">
                                        <Activity className="text-cyna-cyan mb-4" size={24} />
                                        <h3 className="font-bold text-white mb-2">Support Dédié</h3>
                                        <p className="text-sm text-[#A0A0A0]">Assistance technique 24/7 par nos analystes SOC.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* COLONNE DROITE (40%) : Sticky Buy Box */}
                    <div className="w-full lg:w-[40%] relative">
                        <div className="sticky top-[120px] bg-[#1C2128] p-6 lg:p-8 rounded-[24px] border border-[#2D333B] shadow-2xl">

                            <h1 className="text-3xl lg:text-[40px] font-bold text-[#F8F9FA] leading-tight mb-4 tracking-tight">
                                {nomProduit}
                            </h1>

                            {/* Statut du stock dynamique */}
                            <div className="flex items-center gap-2 mb-8">
                                {inStock ? (
                                    <>
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#00FF94] animate-pulse"></span>
                                        <span className="text-sm font-bold text-[#00FF94]">Disponible immédiatement</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B]"></span>
                                        <span className="text-sm font-bold text-[#FF3B3B]">Stock virtuel épuisé</span>
                                    </>
                                )}
                            </div>

                            {product.requires_quote ? (
                                <div className="border-t border-white/10 pt-6 mb-8">
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-[36px] font-bold text-[#F5A623] leading-none tracking-tight">
                                            Sur Devis
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Contactez un de nos experts pour évaluer vos besoins et obtenir une tarification sur mesure.</p>
                                </div>
                            ) : (
                                <div className="border-t border-white/10 pt-6 mb-8">
                                    {/* Toggle Mensuel / Annuel */}
                                    <div className="flex bg-[#0B0E14] rounded-lg p-1 border border-[#2D333B] w-fit mb-6">
                                        <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#2D333B] text-white' : 'text-gray-500 hover:text-white'}`}>Mensuel</button>
                                        <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[#2D333B] text-white' : 'text-gray-500 hover:text-white'}`}>
                                            Annuel <span className="bg-cyna-cyan/10 text-cyna-cyan px-1.5 py-0.5 rounded text-[10px] border border-cyna-cyan/20">-20%</span>
                                        </button>
                                    </div>

                                    {/* Prix Calculé (Ex: -20% si annuel) */}
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-[36px] font-bold text-cyna-cyan leading-none font-mono">
                                            {billingCycle === 'monthly' ? prixBase.toFixed(2) : (prixBase * 0.8).toFixed(2)} €
                                        </span>
                                        <span className="text-[#A0A0A0] text-sm pb-1 font-bold">/ {billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Prix par unité/appareil. Facturation {billingCycle === 'monthly' ? 'mensuelle' : 'annuelle'}.</p>
                                </div>
                            )}

                            {/* Input Quantité / Nombre d'appareils */}
                            {!product.requires_quote && (
                                <div className="mb-8">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quantité / Licences</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                                        min="1"
                                        disabled={!inStock}
                                        className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl h-[52px] px-4 text-white font-bold focus:border-cyna-cyan focus:outline-none transition-colors disabled:opacity-50"
                                    />
                                </div>
                            )}

                            {/* Bouton CTA Principal lié au CartContext */}
                            {product.requires_quote ? (
                                <button 
                                    onClick={() => setIsQuoteModalOpen(true)} 
                                    className="w-full h-[56px] font-black rounded-xl transition-all flex items-center justify-center gap-2 bg-[#F5A623] text-[#0B0E14] hover:bg-white shadow-[0_0_20px_rgba(245,166,35,0.2)] hover:-translate-y-1">
                                    DEMANDER UN DEVIS
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAddToCart()}
                                    disabled={!inStock || isAdding}
                                    className={`w-full h-[56px] font-black rounded-xl transition-all flex items-center justify-center gap-2 ${!inStock
                                        ? 'bg-[#2D333B] text-gray-500 cursor-not-allowed'
                                        : isAdding
                                            ? 'bg-white text-[#0B0E14] scale-[0.98]'
                                            : 'bg-cyna-cyan text-[#0B0E14] hover:bg-white shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:-translate-y-1'
                                        }`}
                                >
                                    {isAdding ? (
                                        <><Loader2 size={20} className="animate-spin" /> AJOUT EN COURS...</>
                                    ) : !inStock ? (
                                        'SERVICE INDISPONIBLE'
                                    ) : (
                                        'AJOUTER AU PANIER'
                                    )}
                                </button>
                            )}

                            <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2 font-medium">
                                <Shield size={14} className="text-cyna-cyan" /> Protection garantie. Annulation à tout moment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =========================================
            SECTION D : CROSS-SELLING (Bottom)
        ========================================= */}
                {similarProducts.length > 0 && (
                    <div className="mt-32 pt-16 border-t border-white/10">
                        <h2 className="text-[28px] font-bold text-[#F8F9FA] mb-8">Solutions complémentaires</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {similarProducts.map((simProduct) => {
                                const simInStock = simProduct.stock_virtuel > 0;
                                const simPrix = parseFloat(simProduct.prix || simProduct.price || 0);
                                const simNom = simProduct.nom || simProduct.name;

                                return (
                                    <Link
                                        to={`/product/${simProduct.id}`}
                                        key={simProduct.id}
                                        className={`bg-[#1C2128] border border-[#2D333B] rounded-[24px] p-6 transition-all group ${!simInStock ? 'opacity-60 grayscale' : 'hover:border-cyna-cyan/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,240,255,0.05)]'}`}
                                    >
                                        <div className="aspect-video bg-[#0B0E14] rounded-xl mb-6 relative flex items-center justify-center border border-white/5 overflow-hidden">
                                            {simProduct.image_url ? (
                                                <img src={simProduct.image_url} alt={simNom} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" />
                                            ) : (
                                                <div className={`absolute inset-0 ${simInStock ? 'group-hover:bg-cyna-cyan/5' : ''} transition-colors`}></div>
                                            )}
                                            {!simProduct.image_url && <span className="text-white/20 font-bold text-sm tracking-widest z-10">{simNom}</span>}
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2 truncate">{simNom}</h3>

                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-cyna-cyan font-mono text-xl font-bold">{simPrix.toFixed(2)} €</span>
                                            {simInStock ? (
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-[#0B0E14] transition-colors"><ArrowRight size={16} /></div>
                                            ) : (
                                                <span className="text-[#FF3B3B] text-[10px] font-bold uppercase tracking-widest border border-[#FF3B3B]/30 px-2 py-1 rounded">Épuisé</span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* =========================================
          MOBILE STICKY CTA (Visible < 1024px)
      ========================================= */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-[#1C2128]/95 backdrop-blur-md border-t border-white/10 lg:hidden z-50">
                {product.requires_quote ? (
                    <button
                        onClick={() => setIsQuoteModalOpen(true)}
                        className="w-full h-[56px] font-black rounded-xl transition-all shadow-lg bg-[#F5A623] text-[#0B0E14]"
                    >
                        DEMANDER UN DEVIS
                    </button>
                ) : (
                    <button
                        onClick={() => handleAddToCart()}
                        disabled={!inStock || isAdding}
                        className={`w-full h-[56px] font-black rounded-xl transition-all shadow-lg ${!inStock ? 'bg-[#2D333B] text-gray-500' : 'bg-cyna-cyan text-[#0B0E14]'
                            }`}
                    >
                        {!inStock ? 'INDISPONIBLE' : isAdding ? 'AJOUT EN COURS...' : 'AJOUTER AU PANIER'}
                    </button>
                )}
            </div>

            {/* =========================================
                MODALE DU FORMULAIRE DE DEVIS
            ========================================= */}
            {isQuoteModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[#1C2128] border border-[#2D333B] w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-[#2D333B] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Demande de devis - {product.nom || product.name}</h2>
                            <button onClick={() => setIsQuoteModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
                        </div>
                        
                        {quoteSuccess ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-[#00FF94]/10 rounded-full flex items-center justify-center mb-4">
                                    <Check size={32} className="text-[#00FF94]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h3>
                                <p className="text-[#A0A0A0]">Notre équipe d'experts évaluera votre infrastructure et vous contactera dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <form onSubmit={submitQuote} className="p-6 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Nom de l'entreprise *</label>
                                        <input type="text" required value={quoteForm.companyName} onChange={e => setQuoteForm({...quoteForm, companyName: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Responsable à contacter *</label>
                                        <input type="text" required value={quoteForm.contactPerson} onChange={e => setQuoteForm({...quoteForm, contactPerson: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Adresse complète *</label>
                                    <input type="text" required value={quoteForm.address} onChange={e => setQuoteForm({...quoteForm, address: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">E-mail professionnel *</label>
                                        <input type="email" required value={quoteForm.email} onChange={e => setQuoteForm({...quoteForm, email: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Numéro de téléphone *</label>
                                        <input type="tel" required value={quoteForm.phone} onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Disponibilité pour visite ou échange *</label>
                                    <input type="text" required placeholder="Ex: Lundi au Vendredi matin, semaine prochaine..." value={quoteForm.availability} onChange={e => setQuoteForm({...quoteForm, availability: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="px-5 py-2.5 rounded-lg text-white font-bold border border-[#2D333B] hover:bg-white/5 transition-colors">Annuler</button>
                                    <button type="submit" disabled={isSubmittingQuote} className="px-6 py-2.5 rounded-lg bg-[#F5A623] text-[#0B0E14] font-bold hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50">
                                        {isSubmittingQuote ? <Loader2 size={18} className="animate-spin" /> : null}
                                        {isSubmittingQuote ? 'Envoi...' : 'Envoyer la demande'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
