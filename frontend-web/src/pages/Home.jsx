import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [alertMessage, setAlertMessage] = useState(''); // <--- 1. État pour l'alerte
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les produits
        const data = await fetchProducts();
        setProducts(data);

        // Charger l'alerte (Nouveau)
        const alertRes = await fetch('http://localhost:3000/alert');
        const alertData = await alertRes.json();
        setAlertMessage(alertData.message);

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
      <Hero />

      {/* 👇 2. ZONE D'ALERTE MODIFIABLE 👇 */}
      {alertMessage && (
        <div className="w-full flex justify-center -mt-8 mb-12 relative z-20">
            <div className="animate-bounce inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyna-cyan text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] border-2 border-white">
                <span>📢</span>
                {alertMessage}
            </div>
        </div>
      )}

      <BentoGrid />

      <section className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-32 mb-20">
        <h2 className="text-3xl font-bold text-cyna-text mb-12">Les Top Produits du moment</h2>
        {/* ... Reste de ton code produits ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>
      
      {/* Footer... */}
      <footer className="bg-[#05070A] border-t border-cyna-steel py-20 mt-20">
          <div className="text-center text-cyna-text">© 2026 Cyna Defense</div>
      </footer>
    </div>
  );
};

export default Home;