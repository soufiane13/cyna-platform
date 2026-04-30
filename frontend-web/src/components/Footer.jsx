import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    // "hidden lg:block" masque le footer sur mobile et l'affiche sur ordinateur.
    // Il n'est pas "fixed", donc il descendra naturellement avec le défilement de la page.
    <footer className="hidden lg:block bg-[#05070A] border-t border-white/10 py-12 lg:py-16 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyna-cyan rounded flex items-center justify-center text-cyna-cyan text-[10px] font-black">C</div>
          <span className="font-bold text-white tracking-wider italic">CYNA<span className="text-cyna-cyan">DEFENSE</span></span>
        </div>
        
        {/* Liens légaux et Contact */}
        <div className="flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/cgu" className="hover:text-cyna-cyan transition-colors">CGU</Link>
          <Link to="/mentions-legales" className="hover:text-cyna-cyan transition-colors">Mentions Légales</Link>
          <Link to="/contact" className="hover:text-cyna-cyan transition-colors">Contact</Link>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex items-center gap-5 text-gray-500">
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyna-cyan transition-colors" title="LinkedIn"><Linkedin size={20} /></a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-cyna-cyan transition-colors" title="Twitter"><Twitter size={20} /></a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-cyna-cyan transition-colors" title="Facebook"><Facebook size={20} /></a>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-8 text-center">
        <p className="text-sm text-gray-600 font-medium">© {new Date().getFullYear()} CYNA DEFENSE. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;