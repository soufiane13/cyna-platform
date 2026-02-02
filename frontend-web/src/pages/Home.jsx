import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-cyna-navy text-white">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. BENTO GRID (Catégories) */}
      <BentoGrid />

      {/* 3. TOP PRODUITS */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-32 mb-20">
        <h2 className="text-3xl font-bold text-cyna-text mb-12">Les Top Produits du moment</h2>

        {loading ? (
          <div className="text-center text-cyna-cyan animate-pulse">Chargement du catalogue...</div>
        ) : products.length === 0 ? (
           <div className="text-center bg-cyna-steel p-8 rounded-xl border border-cyna-error/30">
             <p className="text-cyna-error">Serveur inaccessible</p>
           </div>
        ) : (
          // Layout spec: 4-Column Row (flex justify-between ou grid)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. FOOTER (Simple static version for now) */}
      <footer className="bg-[#05070A] border-t border-cyna-steel py-20 mt-20">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div>
            <h4 className="text-white font-bold mb-4">CYNA DEFENSE</h4>
            <p className="text-cyna-text">Solutions de sécurité pour le futur.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-cyna-text">
              <li>À propos</li>
              <li>Carrières</li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4">Légal</h4>
             <ul className="space-y-2 text-cyna-text">
              <li>Mentions Légales</li>
              <li>CGU</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Suivez-nous</h4>
            <div className="flex gap-4 text-cyna-text">Twitter / LinkedIn</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;