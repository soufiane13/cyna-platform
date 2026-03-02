import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, ArrowRight, ChevronDown, Check, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
// ⚠️ Assure-toi que ce chemin correspond bien à ton service
import { fetchProducts } from '../services/productService'; 

const Search = () => {
  // ==========================================
  // 1. ÉTATS (DATA & UI)
  // ==========================================
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TOUT'); // Modifié pour inclure "TOUT" par défaut
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price_asc', 'price_desc'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ==========================================
  // 2. LOGIQUE BACK-END (CHARGEMENT BDD)
  // ==========================================
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setAllProducts(data);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement catalogue :", err);
        setError("Impossible de charger les données. Vérifiez la connexion à la base.");
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // ==========================================
  // 3. MOTEUR DE RECHERCHE & TRI (FRONT-END)
  // ==========================================
  const filteredProducts = allProducts.filter(product => {
    const nom = product.nom || product.name || "";
    const description = product.description || "";
    
    // Filtre 1 : Barre de recherche textuelle
    const matchesSearch = nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre 2 : Catégorie (Pills)
    // Comme nous n'avons pas fait de jointure SQL complexe ici, on regarde si le mot-clé (ex: "SOC") 
    // est dans le nom ou la description du produit.
    const matchesCategory = activeCategory === 'TOUT' 
      || nom.toUpperCase().includes(activeCategory) 
      || description.toUpperCase().includes(activeCategory);

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Logique de tri
    const priceA = parseFloat(a.prix || a.price || 0);
    const priceB = parseFloat(b.prix || b.price || 0);
    
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    return b.id - a.id; // 'recent' (par défaut, l'ID le plus élevé est le plus récent)
  });

  // ==========================================
  // 4. RENDU UI (FRONT-END RESPONSIVE)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pt-[100px] md:pt-[140px] pb-20 font-sans selection:bg-cyna-cyan selection:text-black">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* =========================================
            BOUTON FILTRES MOBILE (< 1024px)
        ========================================= */}
        <button 
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-[#1C2128] border border-[#2D333B] text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          <Filter size={20} className="text-cyna-cyan" />
          Afficher les filtres
        </button>

        {/* =========================================
            SECTION A : LA SIDEBAR DE FILTRES
        ========================================= */}
        <aside className={`
          ${showMobileFilters ? 'fixed inset-0 z-[100] bg-[#0B0E14] p-6 overflow-y-auto' : 'hidden'} 
          lg:block lg:static lg:bg-transparent lg:p-0 lg:z-auto lg:w-1/4 flex-shrink-0 transition-all
        `}>
          
          {/* En-tête Mobile avec bouton Fermer */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="text-cyna-cyan" size={20} /> Filtres
            </h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-[#1C2128] rounded-full text-[#A0A0A0] hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="bg-[#1C2128] rounded-[24px] p-6 md:p-8 border border-[#2D333B] lg:sticky lg:top-[120px] shadow-2xl">
            
            {/* Titre Desktop uniquement */}
            <div className="hidden lg:flex items-center gap-3 mb-6 border-b border-[#2D333B] pb-4">
              <SlidersHorizontal className="text-cyna-cyan" size={20} />
              <h2 className="text-[20px] font-bold text-white tracking-tight">Filtres de recherche</h2>
            </div>

            <div className="space-y-8">
              {/* 1. Recherche Textuelle */}
              <div>
                <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Recherche par Titre</label>
                <div className="relative">
                  <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Ex: Cyna EDR Pro..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white focus:border-cyna-cyan focus:outline-none transition-colors" 
                  />
                </div>
              </div>

              {/* 2. Catégories (Pill Selectors) */}
              <div>
                <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3">Catégorie(s)</label>
                <div className="flex flex-wrap gap-2">
                  {['TOUT', 'SOC', 'EDR', 'XDR', 'AUDIT'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        activeCategory === cat 
                          ? 'bg-cyna-cyan/10 border-cyna-cyan text-cyna-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                          : 'bg-[#0B0E14] border-[#2D333B] text-[#A0A0A0] hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] w-full bg-[#2D333B]"></div>

              {/* 3. Caractéristiques Techniques (Esthétique pour B2B) */}
              <div className="opacity-50 grayscale pointer-events-none">
                <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-3 flex items-center justify-between">
                  Caractéristiques <span className="text-[9px] bg-[#2D333B] px-2 py-0.5 rounded text-white">Bientôt dispo</span>
                </label>
                <div className="space-y-3">
                  {['Cloud Native', 'Intégration SIEM', 'SLA 99.99%'].map((feature, idx) => (
                    <label key={idx} className="flex items-center gap-3">
                      <div className={`w-[18px] h-[18px] rounded-[4px] border border-[#2D333B] bg-[#0B0E14]`}></div>
                      <span className="text-sm text-gray-400 font-medium">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1px] w-full bg-[#2D333B] lg:hidden"></div>

              {/* Bouton Appliquer (Mobile uniquement) */}
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="lg:hidden w-full bg-cyna-cyan text-[#0B0E14] font-black py-4 rounded-xl mt-4"
              >
                APPLIQUER ({filteredProducts.length})
              </button>

            </div>
          </div>
        </aside>

        {/* =========================================
            SECTION B : RÉSULTATS ET TRI (75%)
        ========================================= */}
        <main className="w-full lg:w-3/4 flex flex-col">
          
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <p className="text-[#A0A0A0] font-medium text-sm">
              <strong className="text-white text-xl font-black mr-2">{filteredProducts.length}</strong> 
              {filteredProducts.length > 1 ? 'services trouvés' : 'service trouvé'}
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-[#1C2128] border border-[#2D333B] text-white text-sm font-bold rounded-xl pl-5 pr-12 py-3.5 focus:outline-none group-hover:border-gray-500 focus:border-cyna-cyan cursor-pointer transition-colors"
                >
                  <option value="recent">Plus récents d'abord</option>
                  <option value="price_asc">Prix : Croissant</option>
                  <option value="price_desc">Prix : Décroissant</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Grille de résultats ou Loading/Empty States */}
          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 text-cyna-cyan border border-white/5 bg-[#1C2128] rounded-[24px]">
               <Loader2 size={48} className="animate-spin mb-4" />
               <p className="text-white font-bold tracking-widest uppercase text-sm">Recherche en cours...</p>
             </div>
          ) : error ? (
             <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-[24px] p-8 flex flex-col items-center justify-center text-center py-20">
                <AlertCircle size={48} className="text-[#FF3B3B] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Erreur de requête</h3>
                <p className="text-[#A0A0A0]">{error}</p>
             </div>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-32 bg-[#1C2128] rounded-[24px] border border-[#2D333B]">
               <div className="w-16 h-16 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                 <SearchIcon size={24} className="text-gray-500"/>
               </div>
               <h3 className="text-2xl font-black text-white mb-2">Aucune correspondance</h3>
               <p className="text-[#A0A0A0] max-w-md mx-auto">Modifiez vos filtres ou essayez d'autres mots-clés pour trouver la solution adaptée à votre infrastructure.</p>
               <button onClick={() => { setSearchTerm(''); setActiveCategory('TOUT'); }} className="mt-6 text-cyna-cyan font-bold hover:underline">Réinitialiser les filtres</button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 flex-1">
              {filteredProducts.map((product) => {
                const inStock = product.stock_virtuel > 0;
                const prix = parseFloat(product.prix || product.price || 0);
                const nomProduit = product.nom || product.name;

                return (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className={`bg-[#1C2128] border border-[#2D333B] rounded-[24px] p-5 md:p-6 transition-all duration-300 group relative overflow-hidden flex flex-col h-full ${
                      !inStock 
                        ? 'opacity-50 grayscale hover:grayscale-0' 
                        : 'hover:border-cyna-cyan/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.05)] hover:-translate-y-1'
                    }`}
                  >
                    <div className="aspect-video bg-[#0B0E14] rounded-xl mb-6 flex items-center justify-center relative border border-white/5 overflow-hidden">
                        {product.image_url ? (
                           <img src={product.image_url} alt={nomProduit} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                           <>
                             <div className={`absolute inset-0 ${inStock ? 'bg-cyna-cyan/5 group-hover:bg-cyna-cyan/10' : 'bg-white/5'} transition-colors`}></div>
                             <span className="font-bold text-white/20 tracking-wider text-center px-4 z-10">{nomProduit}</span>
                           </>
                        )}
                        {!inStock && (
                          <div className="absolute top-3 right-3 z-20">
                            <span className="bg-[#FF3B3B] text-[#0B0E14] text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest">Épuisé</span>
                          </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 flex-1 line-clamp-2">{nomProduit}</h3>
                    <p className="text-[10px] text-[#A0A0A0] font-bold tracking-widest uppercase mb-2">À PARTIR DE</p>

                    <div className="flex items-end justify-between mt-auto">
                      <p className="text-cyna-cyan font-mono text-2xl font-bold">{prix.toFixed(2)} €</p>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-[#0B0E14] transition-all">
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Search;


