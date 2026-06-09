import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout'; // Import du Layout
import Layout from './components/Layout'; // Import du Layout Public
import AdminDashboard from './pages/admin/AdminDashboard'; // Import du Dashboard
import AdminProducts from './pages/admin/AdminProducts'; // Import du gestionnaire de produits
import AdminOrders from './pages/admin/AdminOrders'; // Import de la gestion des commandes
import AdminUsers from './pages/admin/AdminUsers'; // Import du suivi utilisateur
import AdminMessages from './pages/admin/AdminMessages'; // Import de la messagerie
import Category from './pages/Category';
import PaymentSuccess from './pages/PaymentSuccess'; // <--- IMPORT
import ProductDetails from './pages/ProductDetails';
import Search from './pages/Search';
import SiteNotice from './components/SiteNotice'; // <--- IMPORT DU NOUVEAU COMPOSANT
import UpdatePassword from './pages/UpdatePassword'; // <--- IMPORT DE LA PAGE DE MOT DE PASSE
import MentionsLegales from './pages/MentionsLegales'; // <--- NOUVELLE PAGE
import CGU from './pages/CGU'; // <--- NOUVELLE PAGE
import Contact from './pages/Contact'; // <--- NOUVELLE PAGE
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import PolitiqueCookies from './pages/PolitiqueCookies';

function App() {
  return (
    <ToastProvider>
    <CartProvider>
      <Router>
        
        {/* Bannière d'information (Globale) */}
        <SiteNotice />
        
        <Routes>
          {/* --- ROUTES PUBLIQUES (Encapsulées dans le Layout avec Navbar et Footer) --- */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/category" element={<Category />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/search" element={<Search />} />
            
            {/* Nouvelles pages Légales & Contact */}
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/politique-cookies" element={<PolitiqueCookies />} />
          </Route>

          {/* --- ROUTES ADMIN (Protégées) --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} /> {/* Vue A */}
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
    </ToastProvider>
  );
}

export default App;