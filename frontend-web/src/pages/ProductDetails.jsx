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
        </div>
    );
};

export default ProductDetails;