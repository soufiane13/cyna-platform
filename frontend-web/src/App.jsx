import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // <--- IMPORT 1
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart'; 
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout'; // Import du Layout
import AdminDashboard from './pages/admin/AdminDashboard'; // Import du Dashboard

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
          {/* --- ROUTES ADMIN (Protégées) --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} /> {/* Vue A */}
            <Route path="products" element={<div className="text-white">TODO: Vue B Products</div>} />
            <Route path="orders" element={<div className="text-white">TODO: Vue B Orders</div>} />
            <Route path="users" element={<div className="text-white">TODO: Vue B Users</div>} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;