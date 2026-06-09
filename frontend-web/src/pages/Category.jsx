import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Shield, Zap, Activity, Server } from 'lucide-react';

// ─── CONFIGURATION DES CATÉGORIES ───────────────────────────────────────────
// Cette fonction attribue une icône, un titre et une description selon la catégorie
const getCategoryInfo = (cat) => {
    switch(cat?.toUpperCase()) {
        case 'EDR': 
            return { icon: <Shield size={28} className="text-cyna-cyan" />, title: 'EDR (Endpoint Detection)', desc: 'Protection avancée pour vos terminaux et postes de travail.' };
        case 'XDR': 
            return { icon: <Zap size={28} className="text-cyna-cyan" />, title: 'XDR (Extended Detection)', desc: 'Détection étendue sur l\'ensemble de votre infrastructure et de vos réseaux.' };
        case 'SOC': 
            return { icon: <Activity size={28} className="text-cyna-cyan" />, title: 'SOC (Security Operations)', desc: 'Surveillance, analyse et réponse aux incidents 24/7.' };
        default: 
            return { icon: <Server size={28} className="text-cyna-cyan" />, title: cat || 'Autres Services', desc: 'Solutions de cybersécurité additionnelles.' };
    }
};

const Category = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                // On utilise le même service de fetch que sur la page Home
                const data = await fetchProducts();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erreur chargement produits:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // 1. Filtrer si un slug spécifique est demandé (ex: /category/edr). Si "all", on garde tout.
    const filteredProducts = (slug && slug !== 'all') 
        ? products.filter(p => (p.category || '').toLowerCase() === slug.toLowerCase())
        : products;

    // 2. Grouper les produits par catégorie
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const cat = (product.category || 'Autres').toUpperCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white pt-12 pb-24 selection:bg-cyna-cyan selection:text-black">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                
                {/* En-tête de la page */}
                <header className="mb-16 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                        {slug && slug !== 'all' ? `Solutions ${slug}` : 'Notre Catalogue'}
                    </h1>
                    <p className="text-[#A0A0A0] text-lg">
                        Découvrez l'ensemble de nos solutions de cybersécurité pour protéger votre infrastructure.
                    </p>
                </header>

                {/* Affichage des groupes de produits */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyna-cyan"></div>
                    </div>
                ) : Object.keys(groupedProducts).length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-[#1C2128] border border-[#2D333B] rounded-2xl">
                        Aucun service trouvé pour cette catégorie.
                    </div>
                ) : (
                    <div className="space-y-24">
                        {Object.entries(groupedProducts).map(([categoryName, items]) => {
                            const info = getCategoryInfo(categoryName);
                            return (
                                <section key={categoryName} className="animate-fade-in">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                {info.icon}
                                                <h2 className="text-3xl font-black tracking-tight">{info.title}</h2>
                                            </div>
                                            <p className="text-[#A0A0A0]">{info.desc}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-lg">
                                            {items.length} service{items.length > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {items.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Category;