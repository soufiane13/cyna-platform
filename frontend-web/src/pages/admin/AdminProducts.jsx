import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, X, Save, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    // Gestion du tri (Sorting)
    const [sortConfig, setSortConfig] = useState({ key: 'category', direction: 'asc' }); // Tri par catégorie par défaut

    // Gestion de la modale (Ajout / Édition)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: 0, category: 'EDR', stock_virtuel: 100, image_url: '', requires_quote: false });

    const fileInputRef = useRef(null);

    // 1. Charger les produits au montage
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Erreur chargement produits:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Logique de tri
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortedProducts = () => {
        let filterData = products.filter(p => {
            const matchSearch = (p.name || p.nom || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = categoryFilter === 'all' || (p.category || p.categorie || 'EDR').toUpperCase() === categoryFilter.toUpperCase();
            return matchSearch && matchCat;
        });
        
        return filterData.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            // Gestion spécifique pour les noms de colonnes bilingues de la BDD
            if (sortConfig.key === 'name') {
                valA = (a.name || a.nom || '').toLowerCase();
                valB = (b.name || b.nom || '').toLowerCase();
            } else if (sortConfig.key === 'price') {
                valA = parseFloat(a.price || a.prix || 0);
                valB = parseFloat(b.price || b.prix || 0);
            }

            // Fallback générique pour éviter les bugs sur les valeurs nulles
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // 3. Gestion Formulaire (CRUD)
    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || product.nom || '',
                description: product.description || '',
                price: product.price || product.prix || 0,
            category: product.category || 'EDR',
                stock_virtuel: product.stock_virtuel !== undefined ? product.stock_virtuel : 100,
                image_url: product.image_url || '',
                requires_quote: product.requires_quote || false
            });
        } else {
            setEditingProduct(null);
        setFormData({ name: '', description: '', price: 0, category: 'EDR', stock_virtuel: 100, image_url: '', requires_quote: false });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const method = editingProduct ? 'PUT' : 'POST';
        const url = editingProduct ? `http://localhost:3000/products/${editingProduct.id}` : 'http://localhost:3000/products';

        // Formatage pour correspondre exactement aux colonnes de Supabase (nom, prix)
        const payload = {
            name: formData.name,
            nom: formData.name,
            description: formData.description,
            prix: formData.price,
            price_monthly: formData.price,
            price_yearly: formData.price * 12 * 0.8,
            category: formData.category,
            stock_virtuel: formData.stock_virtuel,
            image_url: formData.image_url,
            requires_quote: formData.requires_quote
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                loadProducts(); // Rafraîchir la liste
                alert(`✅ Service ${editingProduct ? 'modifié' : 'créé'} avec succès !`);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`❌ Erreur serveur : ${errData.message || errData.error || res.statusText}`);
                console.error("Détails de l'erreur backend :", errData);
            }
        } catch (err) {
            alert("❌ Impossible de contacter le serveur NestJS.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce service ?")) return;
        
        try {
            const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("❌ Erreur lors de la suppression.");
            }
        } catch (err) {
            alert("❌ Impossible de contacter le serveur NestJS.");
        }
    };

    // 4. Importation Excel
    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Formatage intelligent pour correspondre à Supabase peu importe les noms de colonnes
                const payload = data.map(row => ({
                    name: row.nom || row.name || row.Nom || 'Service sans nom',
                    nom: row.nom || row.name || row.Nom || 'Service sans nom',
                    description: row.description || row.Description || '',
                    prix: parseFloat(row.prix || row.price || row.Prix || 0),
                    price_monthly: parseFloat(row.prix || row.price || row.Prix || 0),
                    price_yearly: parseFloat(row.prix || row.price || row.Prix || 0) * 12 * 0.8,
                category: row.category || row.categorie || row.Catégorie || 'EDR',
                    stock_virtuel: parseInt(row.stock || row.stock_virtuel || row.Stock || 100),
                    image_url: row.image_url || row.image || '',
                    requires_quote: row.requires_quote || row.sur_devis ? true : false
                }));

                const res = await fetch('http://localhost:3000/products/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) { alert(`✅ ${payload.length} services importés avec succès !`); loadProducts(); } 
                else { const errData = await res.json(); alert(`❌ Erreur: ${errData.message}`); }
            } catch (err) {
                alert("❌ Erreur lors de la lecture du fichier Excel.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null; // Réinitialise l'input
    };

    return (
        <div className="p-8 min-h-screen bg-[#0B0E14] text-white animate-fade-in relative">
            
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">Catalogue Services</h1>
                    <p className="text-gray-400 text-sm">Gérez les abonnements et solutions proposés par Cyna.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input type="file" accept=".xlsx, .xls, .csv" hidden ref={fileInputRef} onChange={handleImportExcel} />
                    <button onClick={() => fileInputRef.current.click()} className="bg-[#1C2128] border border-[#2D333B] text-white font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-all flex-1 md:flex-none">
                        <Upload size={18} /> Importer Excel
                    </button>
                    <button onClick={() => openModal()} className="bg-cyna-cyan text-black font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00D1E1] transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] flex-1 md:flex-none">
                        <Plus size={18} /> Ajouter un service
                    </button>
                </div>
            </header>

            {/* Barre d'outils (Recherche) */}
            <div className="bg-[#1C2128] border border-[#2D333B] p-4 rounded-t-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un service..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg h-10 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyna-cyan transition-colors"
                        />
                    </div>
                    <select 
                        value={categoryFilter} 
                        onChange={e => setCategoryFilter(e.target.value)} 
                        className="w-full sm:w-auto bg-[#0B0E14] border border-[#2D333B] text-white text-sm rounded-lg h-10 px-4 focus:outline-none focus:border-cyna-cyan cursor-pointer transition-colors"
                    >
                        <option value="all">Toutes les catégories</option>
                        <option value="EDR">Catégorie : EDR</option>
                        <option value="XDR">Catégorie : XDR</option>
                        <option value="SOC">Catégorie : SOC</option>
                    </select>
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                    Total : {getSortedProducts().length}
                </div>
            </div>

            {/* Tableau des produits */}
            <div className="overflow-x-auto bg-[#1C2128] border border-t-0 border-[#2D333B] rounded-b-2xl shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0B0E14] text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#2D333B]">
                            <th className="p-4 font-bold cursor-pointer hover:text-cyna-cyan transition-colors" onClick={() => handleSort('id')}>
                                <div className="flex items-center gap-1">ID <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:text-cyna-cyan transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1">Nom du Service <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:text-cyna-cyan transition-colors" onClick={() => handleSort('category')}>
                                <div className="flex items-center gap-1">Catégorie <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:text-cyna-cyan transition-colors" onClick={() => handleSort('price')}>
                                <div className="flex items-center gap-1">Prix Mensuel <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:text-cyna-cyan transition-colors" onClick={() => handleSort('stock_virtuel')}>
                                <div className="flex items-center gap-1">Disponibilité <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B]">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chargement du catalogue...</td></tr>
                        ) : getSortedProducts().map(product => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-xs font-mono text-gray-500">#{product.id}</td>
                                <td className="p-4 font-bold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-[#0B0E14] border border-white/5 flex items-center justify-center overflow-hidden">
                                        {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="text-[10px] text-cyna-cyan">CY</div>}
                                    </div>
                                    {product.name || product.nom}
                                </td>
                                <td className="p-4 text-xs uppercase tracking-widest text-gray-400">{product.category || 'N/A'}</td>
                                <td className="p-4 text-cyna-cyan font-mono font-bold">
                                    {product.requires_quote ? <span className="text-[#F5A623] text-[10px] uppercase font-bold tracking-wider bg-[#F5A623]/10 px-2 py-1 rounded">Sur Devis</span> : `${parseFloat(product.price || product.prix || 0).toFixed(2)} €`}
                                </td>
                                <td className="p-4">
                                    {product.stock_virtuel > 0 
                                        ? <span className="px-2 py-1 bg-[#00FF94]/10 text-[#00FF94] text-[10px] uppercase font-bold rounded">Actif</span>
                                        : <span className="px-2 py-1 bg-[#FF3B3B]/10 text-[#FF3B3B] text-[10px] uppercase font-bold rounded">Épuisé</span>
                                    }
                                </td>
                                <td className="p-4 flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(product)} className="p-2 bg-[#0B0E14] rounded-lg text-cyna-cyan hover:bg-white/10 transition-colors" title="Modifier"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-[#0B0E14] rounded-lg text-[#FF3B3B] hover:bg-white/10 transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* =========================================
                MODALE DE CRÉATION / ÉDITION
            ========================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1C2128] border border-[#2D333B] w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-[#2D333B] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingProduct ? 'Modifier le service' : 'Ajouter un service'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div><label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Nom du service</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" required /></div>
                            <div><label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Description (Affichée sur la page détail)</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan min-h-[100px]" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Prix Mensuel (€)</label>
                                    <input type="number" step="0.01" value={formData.price} disabled={formData.requires_quote} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-cyna-cyan font-mono focus:outline-none focus:border-cyna-cyan disabled:opacity-50 disabled:cursor-not-allowed" required />
                                </div>
                            <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Catégorie / Service</label>
                                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan appearance-none">
                                    <optgroup label="CAT. 1 : DÉTECTION & RÉPONSE">
                                        <option value="EDR">EDR (Endpoint Detection)</option>
                                        <option value="XDR">XDR (Extended Detection)</option>
                                    </optgroup>
                                    <optgroup label="CAT. 2 : OPÉRATIONS">
                                        <option value="SOC">SOC (Security Operations)</option>
                                    </optgroup>
                                </select>
                            </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex items-center gap-3 bg-[#0B0E14] border border-[#2D333B] p-3 rounded-lg">
                                    <input type="checkbox" id="requires_quote" checked={formData.requires_quote} onChange={e => setFormData({...formData, requires_quote: e.target.checked, price: e.target.checked ? 0 : formData.price })} className="w-4 h-4 accent-cyna-cyan cursor-pointer" />
                                    <label htmlFor="requires_quote" className="text-sm text-white font-bold cursor-pointer">Ce produit nécessite un devis (Prix caché)</label>
                                </div>
                                <div><label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Stock Virtuel (0 = Épuisé)</label><input type="number" value={formData.stock_virtuel} onChange={e => setFormData({...formData, stock_virtuel: parseInt(e.target.value)})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" /></div>
                                <div><label className="block text-xs text-gray-400 font-bold mb-2 uppercase">Image URL</label><input type="url" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-[#0B0E14] border border-[#2D333B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyna-cyan" /></div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#2D333B] bg-[#1C2128] flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-white font-bold border border-[#2D333B] hover:bg-white/5 transition-colors">Annuler</button>
                            <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-cyna-cyan text-black font-bold hover:bg-[#00D1E1] transition-colors flex items-center gap-2"><Save size={18}/> Sauvegarder</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminProducts;