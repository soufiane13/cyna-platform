import React from 'react';

const MentionsLegales = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 selection:bg-cyna-cyan selection:text-black">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-12 tracking-tight">Mentions Légales</h1>
      
      <div className="space-y-12 text-[#A0A0A0] leading-relaxed text-sm md:text-base">
        
        {/* --- SECTION 1 --- */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white border-b border-[#2D333B] pb-3 mb-5">1. Présentation du site internet</h2>
          <p>En vertu de l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, il est précisé aux utilisateurs du site internet https://www.cyna-it.fr l’identité des différents intervenants dans le cadre de sa réalisation et de son suivi :</p>
          <ul className="space-y-2">
            <li><strong className="text-cyna-cyan">Propriétaire :</strong> SAS CYNA-IT, Capital social de 12 000 euros, Numéro de TVA : FR20913711032 – 10 rue de Penthièvre 75008 Paris</li>
            <li><strong className="text-cyna-cyan">Responsable publication :</strong> Elbaz Alexandre – alexandre.elbaz@cyna-it.fr<br/><span className="text-xs italic text-gray-500">Le responsable publication est une personne physique ou une personne morale.</span></li>
            <li><strong className="text-cyna-cyan">Hébergeur :</strong> OVH – 2 rue Kellermann 59100 Roubaix 1007</li>
            <li><strong className="text-cyna-cyan">Délégué à la protection des données :</strong> Nathan Bramli – nathan.bramli@cyna-it.fr</li>
          </ul>
          <p className="text-xs italic mt-4">Ces mentions légales RGPD sont issues du générateur gratuit de mentions légales pour un site internet.</p>
        </section>

        {/* --- PIED DE PAGE LÉGAL --- */}
        <div className="pt-10 border-t border-[#2D333B] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cyna-cyan font-mono uppercase tracking-widest">
          <span>SOC 24/7 managé</span>
          <span>CERT // Mention Légale</span>
        </div>

      </div>
    </div>
  );
};

export default MentionsLegales;