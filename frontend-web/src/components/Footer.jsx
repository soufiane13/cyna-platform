import React from 'react';

export default function Footer() {
  return (
    {/* Masqué sur mobile (hidden), affiché sur desktop (md:block). Non fixe au scroll. */}
    <footer className="hidden md:block bg-slate-900 text-white py-8 mt-auto w-full">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        
        {/* Liens légaux et de contact */}
        <div className="flex space-x-6 text-sm mb-4 md:mb-0">
          <a href="/cgu" className="hover:text-blue-400 transition-colors">CGU</a>
          <a href="/mentions-legales" className="hover:text-blue-400 transition-colors">Mentions légales</a>
          <a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex space-x-4">
          <a href="https://facebook.com/votrepage" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
            Facebook
          </a>
          <a href="https://twitter.com/votrepage" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
            Twitter
          </a>
          <a href="https://linkedin.com/company/votrepage" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
            LinkedIn
          </a>
        </div>
        
      </div>
    </footer>
  );
}
