import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
    Loader2, ArrowLeft, ShieldCheck,
    ShoppingCart, Check, Plus, Minus, AlertCircle, CheckCircle, Lock,
} from 'lucide-react';
import { getCategoryConfig } from '../utils/categoryConfig';
import QuoteRequestForm from '../components/QuoteRequestForm';

// ─── Badges de confiance affichés sous le bouton panier ──────────────────────
const TRUST = [
    { icon: <ShieldCheck size={14} />, text: 'ISO 27001 Certifié' },
    { icon: <Lock size={14} />, text: 'GDPR Compliant' },
    { icon: <CheckCircle size={14} />, text: 'SLA 99.99%' },
];

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [duration, setDuration] = useState('monthly');
    const [added, setAdded] = useState(false);

    useEffect(() => {
        fetch('https://cyna-api-d6b4.onrender.com/products')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                const found = data.find(p => String(p.id) === String(id));
                if (!found) throw new Error('Produit introuvable');
                setProduct(found);
            })
            .catch(() => setError('Produit introuvable ou erreur serveur.'))
            .finally(() => setLoading(false));
    }, [id]);

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => Math.max(1, q - 1));
    const onChange  = (e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setQuantity(v); };

    const handleAddToCart = () => {
        const nom  = product.nom || product.name || 'Solution CYNA';
        const prix = parseFloat(product.prix || product.price || 0);
        addToCart({ ...product, name: nom, price: prix, quantity, duration });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    // ── États chargement / erreur ─────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
            <Loader2 size={48} className="text-cyna-cyan animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center text-center p-6 gap-4">
            <AlertCircle size={48} className="text-[#FF3B3B]" />
            <p className="text-white text-xl font-bold">{error}</p>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyna-cyan hover:text-white transition-colors font-bold">
                <ArrowLeft size={16} /> Retour
            </button>
        </div>
    );

    const nom        = product.nom || product.name || 'Produit';
    const categorie  = product.categorie || product.category || '';
    const isAvailable = product.stock_virtuel > 0;
    const cfg        = getCategoryConfig(categorie);

    const prix       = parseFloat(product?.prix || product?.price || 0);
    const multiplier = duration === 'yearly' ? 12 * 0.80 : 1;
    const prixTotal  = (prix * quantity * multiplier).toFixed(2);

    // Features : depuis la BDD si dispo, sinon fallback par catégorie
    const features = product.features || product.caracteristiques || cfg.features;

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white pt-28 pb-20 px-6 font-sans selection:bg-cyna-cyan selection:text-black">
            <div className="max-w-[1080px] mx-auto">

                {/* ── Breadcrumb / retour ──────────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-10">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors font-bold group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Retour au catalogue
                    </button>
                    {categorie && (
                        <>
                            <span className="text-white/20">/</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${cfg.badgeBg}`}>
                                <span className={cfg.textClass}>{cfg.icon(11)}</span>
                                {cfg.label}
                            </span>
                        </>
                    )}
                </div>

                {/* ── Fiche produit ────────────────────────────────────────────── */}
                <div className="bg-[#1C2128] border border-[#2D333B] rounded-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row">

                        {/* ── Panneau visuel gauche ─────────────────────────────── */}
                        <div className="w-full md:w-[45%] aspect-square bg-[#0B0E14] flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-[#2D333B]">

                            {product.image_url ? (
                                <img src={product.image_url} alt={nom} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    {/* Fond dégradé coloré par catégorie */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.bgGradient} opacity-70`} />

                                    {/* Grille de points */}
                                    <div className="absolute inset-0 opacity-[0.05]"
                                        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                                    />

                                    {/* Icône centrale grande */}
                                    <div className={`relative z-10 flex flex-col items-center gap-4 ${cfg.textClass}`}>
                                        <div className={`p-8 rounded-3xl bg-white/5 border ${cfg.border} shadow-lg`}
                                            style={{ boxShadow: `0 0 60px ${cfg.accentColor}20` }}>
                                            {cfg.icon(80)}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-50">{cfg.label}</span>
                                    </div>
                                </>
                            )}

                            {/* Badge rupture */}
                            {!isAvailable && (
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-[10px] px-4 py-2 rounded-full font-bold uppercase tracking-widest backdrop-blur-md">
                                        Rupture de stock
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Panneau infos droit ───────────────────────────────── */}
                        <div className="flex-1 p-8 flex flex-col justify-between">
                            <div>
                                {/* Nom + statut */}
                                <h1 className="text-3xl font-black text-white mb-3">{nom}</h1>

                                {isAvailable ? (
                                    <span className="flex items-center gap-2 text-[10px] font-bold text-[#00FF94] uppercase tracking-widest mb-4">
                                        <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />Disponible — Activation immédiate
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-[#FF3B3B] uppercase tracking-widest mb-4 block">Indisponible</span>
                                )}

                                {/* Description */}
                                <p className="text-[#A0A0A0] leading-relaxed mb-6">
                                    {product.description || cfg.tagline}
                                </p>

                                {/* Features / avantages */}
                                {features && features.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Ce qui est inclus</p>
                                        <ul className="space-y-2">
                                            {features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-white">
                                                    <CheckCircle size={15} className={`flex-shrink-0 mt-0.5 ${cfg.textClass}`} />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {product.requires_quote ? (
                                <div className="mt-8">
                                    <QuoteRequestForm product={product} />
                                </div>
                            ) : (
                                <>
                                    <div className="h-px w-full bg-[#2D333B] mb-6" />

                                    {/* Sélecteur durée */}
                                    <div className="mb-6">
                                        <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Durée d'abonnement</label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'monthly', label: 'Mensuel', sub: 'Mois par mois' },
                                            { value: 'yearly',  label: 'Annuel',  sub: 'Économisez 20%' },
                                        ].map(opt => (
                                            <button key={opt.value} onClick={() => setDuration(opt.value)}
                                                className={`flex-1 py-3 px-4 rounded-xl border text-left transition-all duration-200
                                                    ${duration === opt.value
                                                        ? `bg-white/5 ${cfg.border} ${cfg.textClass} shadow-sm`
                                                        : 'bg-[#0B0E14] border-[#2D333B] text-[#A0A0A0] hover:border-gray-500 hover:text-white'}`}
                                            >
                                                <p className="font-bold text-sm">{opt.label}</p>
                                                <p className="text-[10px] opacity-70 mt-0.5">{opt.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sélecteur quantité */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Nombre de licences</label>
                                    <div className="flex items-center gap-3 w-fit">
                                        <button onClick={decrement} disabled={quantity <= 1}
                                            className="w-10 h-10 rounded-xl bg-[#0B0E14] border border-[#2D333B] flex items-center justify-center text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Minus size={16} />
                                        </button>
                                        <input type="number" min="1" value={quantity} onChange={onChange}
                                            className="w-16 h-10 rounded-xl bg-[#0B0E14] border border-[#2D333B] text-white text-center font-bold text-sm focus:outline-none focus:border-cyna-cyan transition-colors" />
                                        <button onClick={increment}
                                            className="w-10 h-10 rounded-xl bg-[#0B0E14] border border-[#2D333B] flex items-center justify-center text-white hover:border-white/30 transition-all">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                </>
                            )}
                            </div>

                        {!product.requires_quote && (
                            <div>
                                {/* ── Bloc prix + bouton panier ─────────────────────── */}
                                <div className="flex items-end justify-between mb-5">
                                    <div>
                                        <p className="text-[10px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-1">
                                            Total {duration === 'yearly' ? 'annuel' : 'mensuel'}
                                        </p>
                                        <p className={`font-mono text-4xl font-bold ${cfg.textClass}`}>{prixTotal} €</p>
                                        <p className="text-xs text-[#A0A0A0] mt-1">
                                            {prix.toFixed(2)} € × {quantity} licence{quantity > 1 ? 's' : ''}
                                            {duration === 'yearly' ? ' × 12 mois − 20%' : ' / mois'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    disabled={!isAvailable}
                                    onClick={handleAddToCart}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 mb-5
                                        ${!isAvailable
                                            ? 'bg-[#2D333B] text-gray-600 cursor-not-allowed'
                                            : added
                                                ? 'bg-[#00FF94]/20 border border-[#00FF94]/40 text-[#00FF94]'
                                                : 'bg-cyna-cyan text-[#0B0E14] hover:bg-white hover:-translate-y-0.5 shadow-neon'}`}
                                >
                                    {added ? <><Check size={18} /> Ajouté au panier !</> : <><ShoppingCart size={18} /> Ajouter au panier</>}
                                </button>

                                {/* Badges de confiance */}
                                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/5">
                                    {TRUST.map(b => (
                                        <div key={b.text} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                            <span className="text-gray-600">{b.icon}</span>
                                            {b.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
