import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  // ==========================================
  // 1. LOGIQUE BACK-END (NE PAS TOUCHER)
  // ==========================================
  const [products, setProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Charger les produits réels via le Service
        const productData = await fetchProducts();
        console.log("🔍 Données des produits reçues :", productData); // Pour vérifier si le prix est bien là
        setProducts(productData);

        // 2. Charger le message d'alerte depuis NestJS
        const alertRes = await fetch('http://localhost:3000/alert');
        if (alertRes.ok) {
            const alertData = await alertRes.json();
            setAlertMessage(alertData.message);
        }
      } catch (err) {
        console.error("Erreur de chargement API :", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ==========================================
  // 2. AFFICHAGE (UI / FRONT-END RESPONSIVE)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-cyna-cyan selection:text-black pt-20 lg:pt-28">
      
      {/* HEADER / HERO COMPONENT */}
      <Hero />

      {/* 👇 ZONE D'ALERTE STYLE "GLASSMORPHISM" 👇 */}
      {alertMessage && (
        <div className="w-full flex justify-center -mt-6 mb-16 px-6 relative z-20">
          <div className="animate-fade-in flex items-center gap-3 px-6 py-3 rounded-full bg-cyna-cyan/10 border border-cyna-cyan/30 text-cyna-cyan text-sm md:text-base font-bold backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:bg-cyna-cyan/20 transition-all cursor-default select-none max-w-full overflow-hidden text-center">
              
              {/* Le petit point qui pulse */}
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyna-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyna-cyan"></span>
              </span>

              {/* Le message dynamique venant du Backend */}
              <span className="tracking-wide truncate">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* GRILLE BENTO (Design existant conservé) */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-20">
        <BentoGrid />
      </div>

      {/* SECTION TOP PRODUITS (Connectée à la DB) */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-32 mb-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-cyna-cyan" size={28} />
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Top Produits</h2>
            </div>
            <p className="text-[#A0A0A0] text-sm lg:text-base">Les solutions de sécurité les plus déployées ce mois-ci.</p>
          </div>
          
          <Link to="/category/all" className="flex items-center gap-2 text-sm font-bold text-cyna-cyan hover:text-white transition-colors group">
            VOIR TOUT LE CATALOGUE 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loading ? (
            // Skeleton Loading UI (Plus propre qu'un simple texte)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="h-[350px] bg-[#1C2128] rounded-2xl border border-[#2D333B] animate-pulse">
                  <div className="h-40 bg-white/5 rounded-t-2xl mb-4"></div>
                  <div className="px-5 space-y-3">
                    <div className="h-6 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    <div className="h-10 bg-white/5 rounded w-full mt-8"></div>
                  </div>
                </div>
              ))}
            </div>
        ) : products.length > 0 ? (
            // Affichage des vrais produits
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            // État vide (Si la base de données ne renvoie rien)
            <div className="w-full bg-[#1C2128] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <Zap className="text-gray-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-400 text-sm">Vérifiez votre connexion au backend NestJS ou ajoutez des produits dans Supabase.</p>
            </div>
        )}
      </section>
      
      {/* FOOTER RESPONSIVE */}
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
