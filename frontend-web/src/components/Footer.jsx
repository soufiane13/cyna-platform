import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block w-full mt-auto bg-[#05070A] border-t border-white/10 text-gray-400">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        
        {/* Grille principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Colonne 1 : Marque et Description */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 border-2 border-cyna-cyan rounded flex items-center justify-center text-cyna-cyan text-[10px] font-black">C</div>
              <span className="font-bold text-white tracking-wider italic text-xl">CYNA<span className="text-cyna-cyan">DEFENSE</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              La plateforme SaaS de cybersécurité de référence pour les entreprises. SOC, EDR, XDR : sécurisez votre avenir.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="https://twitter.com/cynadefense" target="_blank" rel="noopener noreferrer" className="p-2 border border-white/10 rounded-md hover:bg-cyna-cyan/10 hover:text-cyna-cyan hover:border-cyna-cyan/30 transition-all" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com/company/cynadefense" target="_blank" rel="noopener noreferrer" className="p-2 border border-white/10 rounded-md hover:bg-cyna-cyan/10 hover:text-cyna-cyan hover:border-cyna-cyan/30 transition-all" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="https://github.com/cynadefense" target="_blank" rel="noopener noreferrer" className="p-2 border border-white/10 rounded-md hover:bg-cyna-cyan/10 hover:text-cyna-cyan hover:border-cyna-cyan/30 transition-all" aria-label="GitHub">
                <Github size={18} />
              </a>
              <Link to="/contact" className="p-2 border border-white/10 rounded-md hover:bg-cyna-cyan/10 hover:text-cyna-cyan hover:border-cyna-cyan/30 transition-all" aria-label="Contact">
                <Mail size={18} />
              </Link>
            </div>
          </div>

          {/* Colonne 2 : Solutions */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Solutions</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/category/soc" className="hover:text-cyna-cyan transition-colors">SOC (Opérations de Sécurité)</Link></li>
              <li><Link to="/category/edr" className="hover:text-cyna-cyan transition-colors">EDR (Détection Endpoints)</Link></li>
              <li><Link to="/category/xdr" className="hover:text-cyna-cyan transition-colors">XDR (Détection Étendue)</Link></li>
              <li><Link to="/category/all" className="hover:text-cyna-cyan transition-colors">Tous les Services</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Entreprise */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Entreprise</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/search" className="hover:text-cyna-cyan transition-colors">Recherche Avancée</Link></li>
              <li><Link to="/contact" className="hover:text-cyna-cyan transition-colors">Nous Contacter</Link></li>
              <li><Link to="/login" className="hover:text-cyna-cyan transition-colors">Espace Client</Link></li>
              <li><Link to="/admin" className="hover:text-cyna-cyan transition-colors">Administration</Link></li>
            </ul>
          </div>

          {/* Colonne 4 : Légal */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Légal</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/cgu" className="hover:text-cyna-cyan transition-colors">Conditions d'Utilisation</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-cyna-cyan transition-colors">Mentions Légales</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-cyna-cyan transition-colors">Politique de Confidentialité</Link></li>
              <li><Link to="/politique-cookies" className="hover:text-cyna-cyan transition-colors">Politique de Cookies</Link></li>
            </ul>
          </div>

        </div>

        {/* Ligne inférieure : Copyright et Sécurité */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© {currentYear} Cyna-IT — 10 Rue de Penthièvre, 75008 Paris</p>
          <div className="flex items-center space-x-2 text-[#00FF94] bg-[#00FF94]/10 px-3 py-1.5 rounded-full border border-[#00FF94]/20">
            <ShieldCheck size={14} />
            <span>Site sécurisé SSL • SIRET 91371103200015</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
