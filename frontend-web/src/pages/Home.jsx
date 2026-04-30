import React, { useEffect, useState } from 'react';
import { Link }                        from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { fetchProducts }               from '../services/productService';
import Hero                            from '../components/Hero';
import BentoGrid                       from '../components/BentoGrid';
import ProductCard                     from '../components/ProductCard';

// ── Skeleton animé affiché pendant le chargement ─────────────────────────────
const Skeleton = () => (
  <div className="h-[380px] bg-[#1C2128] rounded-2xl border border-[#2D333B] animate-pulse">
    <div className="h-[45%] bg-white/5 rounded-t-2xl" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-white/5 rounded w-3/4" />
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-10 bg-white/5 rounded w-full mt-6" />
    </div>
  </div>
);

// ── État vide si aucun produit en base ───────────────────────────────────────
const EmptyState = () => (
  <div className="w-full bg-[#1C2128] border border-white/10 rounded-2xl p-12 flex flex-col items-center text-center">
    <Zap className="text-gray-500 mb-4" size={48} />
    <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
    <p className="text-gray-400 text-sm">Vérifiez la connexion au backend NestJS ou ajoutez des produits dans Supabase.</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
const Home = () => {

  // ── États ──────────────────────────────────────────────────────────────────
  const [products,     setProducts]     = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading,      setLoading]      = useState(true);

  // ── Chargement parallèle : produits + alerte depuis NestJS ────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, alertRes] = await Promise.all([
          fetchProducts(),
          fetch('http://localhost:3000/alert'),
        ]);
        setProducts(productData);
        if (alertRes.ok) {
          const { message } = await alertRes.json();
          setAlertMessage(message);
        }
      } catch (err) {
        console.error('Erreur de chargement API :', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-cyna-cyan selection:text-black pt-20 lg:pt-28">

      {/* ── BOUTON 1 : Hero — CTA navigue vers slide.link (category ou search) ── */}
      <Hero />

      {/* ── Bannière d'alerte dynamique (depuis site_settings Supabase) ──────── */}
      {alertMessage && (
        <div className="w-full flex justify-center -mt-6 mb-16 px-6 relative z-20">
          <div className="animate-fade-in flex items-center gap-3 px-6 py-3 rounded-full bg-cyna-cyan/10 border border-cyna-cyan/30 text-cyna-cyan text-sm md:text-base font-bold backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] max-w-full">
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyna-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyna-cyan" />
            </span>
            <span className="tracking-wide truncate">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* ── BOUTON 2 : BentoGrid — chaque carte → /search?category=XXX ─────── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-20">
        <BentoGrid />
      </div>

      {/* ── Section Top Produits ─────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-32 mb-32">

        {/* En-tête + BOUTON 3 : "VOIR TOUT LE CATALOGUE" → /category/all */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-cyna-cyan" size={28} />
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Top Produits</h2>
            </div>
            <p className="text-[#A0A0A0] text-sm lg:text-base">Les solutions de sécurité les plus déployées ce mois-ci.</p>
          </div>

          {/* ── BOUTON 3 : Voir tout le catalogue → /category/all ─────────────── */}
          <Link
            to="/category/all"
            className="flex items-center gap-2 text-sm font-bold text-cyna-cyan hover:text-white transition-colors group"
          >
            VOIR TOUT LE CATALOGUE
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grille produits : skeleton → produits → état vide */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#05070A] border-t border-white/10 py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-cyna-cyan rounded flex items-center justify-center text-cyna-cyan text-[10px] font-black">C</div>
            <span className="font-bold text-white tracking-wider italic">CYNA<span className="text-cyna-cyan">DEFENSE</span></span>
          </div>
          <p className="text-sm text-gray-500 font-medium">© 2026 CYNA DEFENSE. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;