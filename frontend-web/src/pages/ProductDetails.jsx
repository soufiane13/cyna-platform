import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Server, Activity, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
    Loader2, ArrowLeft, ShieldCheck,
    ShoppingCart, Check, Plus, Minus, AlertCircle,
} from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();       // ← id depuis l'URL /product/:id
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // ── États ────────────────────────────────────────────────────────────────
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);        // ← quantité choisie
    const [duration, setDuration] = useState('monthly'); // ← mensuel / annuel
    const [added, setAdded] = useState(false);     // ← feedback bouton

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
    // ── Chargement du produit depuis NestJS ──────────────────────────────────
    useEffect(() => {
        fetch('http://localhost:3000/products')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                const found = data.find(p => String(p.id) === String(id));
                if (!found) throw new Error('Produit introuvable');
                setProduct(found);
            })
            .catch(() => setError('Produit introuvable ou erreur serveur.'))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Handlers quantité ────────────────────────────────────────────────────
    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => Math.max(1, q - 1));
    const onChange = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1) setQuantity(val);
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
    // ── Ajout au panier avec quantité + durée sélectionnées ──────────────────
    const handleAddToCart = () => {
        const nom = product.nom || product.name || 'Solution CYNA';
        const prix = parseFloat(product.prix || product.price || 0);

        addToCart({
            ...product,
            name: nom,
            price: prix,
            quantity, // ← quantité choisie par l'utilisateur
            duration, // ← durée choisie par l'utilisateur
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    // ── Prix calculé selon la durée ──────────────────────────────────────────
    const prix = parseFloat(product?.prix || product?.price || 0);
    const multiplier = duration === 'yearly' ? 12 * 0.80 : 1; // -20% annuel
    const prixTotal = (prix * quantity * multiplier).toFixed(2);

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTATS DE CHARGEMENT / ERREUR
    // ─────────────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
            <Loader2 size={48} className="text-cyna-cyan animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center text-center p-6 gap-4">
            <AlertCircle size={48} className="text-[#FF3B3B]" />
            <p className="text-white text-xl font-bold">{error}</p>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-cyna-cyan hover:text-white transition-colors font-bold"
            >
                <ArrowLeft size={16} /> Retour
            </button>
        </div>
    );

    const nom = product.nom || product.name || 'Produit';
    const isAvailable = product.stock_virtuel > 0;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDU
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0B0E14] text-white pt-28 pb-20 px-6 font-sans selection:bg-cyna-cyan selection:text-black">
            <div className="max-w-[1000px] mx-auto">

                {/* ── Bouton retour ──────────────────────────────────────────────── */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors font-bold mb-10 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Retour au catalogue
                </button>

                {/* ── Fiche produit ──────────────────────────────────────────────── */}
                <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row">

                        {/* ── Image / Visuel ─────────────────────────────────────────── */}
                        <div className="w-full md:w-[45%] aspect-square bg-[#0B0E14] flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-[#2D333B]">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={nom}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-cyna-cyan/5" />
                                    <ShieldCheck size={100} className="text-cyna-cyan/30 z-10" />
                                </>
                            )}

                            {/* Badge stock épuisé */}
                            {!isAvailable && (
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-[10px] px-4 py-2 rounded-full font-bold uppercase tracking-widest backdrop-blur-md">
                                        Rupture de stock
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Informations produit ────────────────────────────────────── */}
                        <div className="flex-1 p-8 flex flex-col justify-between">
                            <div>
                                {/* Nom + statut */}
                                <h1 className="text-3xl font-black text-white mb-3">{nom}</h1>

                                {isAvailable ? (
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-[#00FF94] uppercase tracking-widest mb-4">
                                        <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
                                        Disponible
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-[#FF3B3B] uppercase tracking-widest mb-4 block">
                                        Indisponible
                                    </span>
                                )}

                                {/* Description */}
                                <p className="text-[#A0A0A0] leading-relaxed mb-8">
                                    {product.description || 'Aucune description disponible pour ce service.'}
                                </p>

                                {/* ── Séparateur ─────────────────────────────────────────── */}
                                <div className="h-px w-full bg-[#2D333B] mb-8" />

                                {/* ── SÉLECTEUR DE DURÉE ─────────────────────────────────── */}
                                <div className="mb-6">
                                    <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">
                                        Durée d'abonnement
                                    </label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'monthly', label: 'Mensuel', sub: 'Mois par mois' },
                                            { value: 'yearly', label: 'Annuel', sub: 'Économisez 20%' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setDuration(opt.value)}
                                                className={`flex-1 py-3 px-4 rounded-xl border text-left transition-all duration-200
                          ${duration === opt.value
                                                        ? 'bg-cyna-cyan/10 border-cyna-cyan text-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                                                        : 'bg-[#0B0E14] border-[#2D333B] text-[#A0A0A0] hover:border-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                <p className="font-bold text-sm">{opt.label}</p>
                                                <p className="text-[10px] opacity-70 mt-0.5">{opt.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── SÉLECTEUR DE QUANTITÉ ──────────────────────────────── */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">
                                        Nombre de licences
                                    </label>
                                    <div className="flex items-center gap-3 w-fit">
                                        {/* Bouton - */}
                                        <button
                                            onClick={decrement}
                                            disabled={quantity <= 1}
                                            className="w-10 h-10 rounded-xl bg-[#0B0E14] border border-[#2D333B] flex items-center justify-center text-white hover:border-cyna-cyan/40 hover:text-cyna-cyan transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Minus size={16} />
                                        </button>

                                        {/* Input quantité */}
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={onChange}
                                            className="w-16 h-10 rounded-xl bg-[#0B0E14] border border-[#2D333B] text-white text-center font-bold text-sm focus:outline-none focus:border-cyna-cyan transition-colors"
                                        />

                                        {/* Bouton + */}
                                        <button
                                            onClick={increment}
                                            className="w-10 h-10 rounded-xl bg-[#0B0E14] border border-[#2D333B] flex items-center justify-center text-white hover:border-cyna-cyan/40 hover:text-cyna-cyan transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
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
                            {/* ── Prix total + Bouton panier ────────────────────────────── */}
                            <div>
                                {/* Prix calculé dynamiquement */}
                                <div className="flex items-end justify-between mb-6">
                                    <div>
                                        <p className="text-[10px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">
                                            Total {duration === 'yearly' ? 'annuel' : 'mensuel'}
                                        </p>
                                        <p className="text-cyna-cyan font-mono text-4xl font-bold">
                                            {prixTotal} €
                                        </p>
                                        <p className="text-xs text-[#A0A0A0] mt-1">
                                            {prix.toFixed(2)} € × {quantity} licence{quantity > 1 ? 's' : ''}
                                            {duration === 'yearly' ? ' × 12 mois − 20%' : ' / mois'}
                                        </p>
                                    </div>
                                </div>

                                {/* ── BOUTON AJOUTER AU PANIER (quantité + durée transmises) ── */}
                                <button
                                    disabled={!isAvailable}
                                    onClick={handleAddToCart}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2
                    ${!isAvailable
                                            ? 'bg-[#2D333B] text-gray-600 cursor-not-allowed'
                                            : added
                                                ? 'bg-[#00FF94]/20 border border-[#00FF94]/40 text-[#00FF94]'
                                                : 'bg-cyna-cyan text-[#0B0E14] hover:bg-white hover:-translate-y-1 shadow-neon'
                                        }`}
                                >
                                    {added ? (
                                        <><Check size={18} /> Ajouté au panier !</>
                                    ) : (
                                        <><ShoppingCart size={18} /> Ajouter au panier</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
export default ProductDetails;
