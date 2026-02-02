import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Charger les produits via ton Service
        const productData = await fetchProducts();
        setProducts(productData);

        // 2. Charger le message d'alerte depuis le Backend
        const alertRes = await fetch('http://localhost:3000/alert');
        if (alertRes.ok) {
            const alertData = await alertRes.json();
            setAlertMessage(alertData.message);
        }

      } catch (err) {
        console.error("Erreur de chargement :", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-cyna-navy text-white">
      {/* HEADER / HERO */}
      <Hero />

      {/* 👇 ZONE D'ALERTE STYLE "GLASSMORPHISM" 👇 */}
      {alertMessage && (
        <div className="w-full flex justify-center -mt-6 mb-10 relative z-20">
            <div className="animate-fade-in inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyna-cyan/10 border border-cyna-cyan/20 text-cyna-cyan text-sm font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:bg-cyna-cyan/20 transition-all cursor-default select-none">
                
                {/* Le petit point qui pulse */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyna-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyna-cyan"></span>
                </span>

                {/* Le message dynamique */}
                <span className="tracking-wide">{alertMessage}</span>
            </div>
        </div>
      )}

      {/* GRILLE BENTO (Design moderne) */}
      <BentoGrid />

      {/* SECTION PRODUITS */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-32 mb-20">
        <h2 className="text-3xl font-bold text-cyna-text mb-12">Les Top Produits du moment</h2>
        
        {loading ? (
            <div className="text-center text-gray-500">Chargement des produits...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* On affiche seulement les 4 premiers produits */}
                {products.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
        )}
      </section>
      
      {/* FOOTER */}
      <footer className="bg-[#05070A] border-t border-cyna-steel py-20 mt-20">
          <div className="text-center text-cyna-text">© 2026 Cyna Defense. Tous droits réservés.</div>
      </footer>
    </div>
  );
};

export default Home;