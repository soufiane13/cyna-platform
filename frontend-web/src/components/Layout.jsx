import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14]">
      {/* Flexbox en colonne avec min-h-screen pour que le Footer reste en bas */}
      <Navbar />
      
      {/* Le contenu des pages (Accueil, Produits, etc.) est injecté ici */}
      <main className="flex-grow pt-20 lg:pt-28">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;