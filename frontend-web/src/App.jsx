import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // <--- IMPORT 1
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout'; // Import du Layout
import AdminDashboard from './pages/admin/AdminDashboard'; // Import du Dashboard
import AdminProducts from './pages/admin/AdminProducts'; // Import du gestionnaire de produits
import AdminOrders from './pages/admin/AdminOrders'; // Import de la gestion des commandes
import AdminUsers from './pages/admin/AdminUsers'; // Import du suivi utilisateur
import Category from './pages/Category';
import PaymentSuccess from './pages/PaymentSuccess'; // <--- IMPORT
import ProductDetails from './pages/ProductDetails';
import Search from './pages/Search';

function App() {
  return (
    // <--- IMPORT 2 : On enveloppe TOUT l'app ici
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Alias */}
          <Route path="/payment-success" element={<PaymentSuccess />} /> {/* <--- ROUTE DE RETOUR STRIPE */}

          {/* 👇 LES DEUX LIGNES MAGIQUES SONT LÀ 👇 */}
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/category" element={<Category />} />


          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Moteur de Recherche */} <Route path="/search" element={<Search />} />

          {/* --- ROUTES ADMIN (Protégées) --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} /> {/* Vue A */}
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;