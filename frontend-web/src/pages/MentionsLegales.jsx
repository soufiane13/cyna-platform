import React from 'react';

const MentionsLegales = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 selection:bg-cyna-cyan selection:text-black">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tight">Mentions Légales</h1>
      
      <div className="space-y-10 text-[#A0A0A0] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white border-b border-[#2D333B] pb-2 mb-4">Éditeur du site</h2>
          <p className="mb-2">Le site <strong>www.cyna-it.fr</strong> est édité par la société <strong>CYNA-IT</strong>.</p>
          <ul className="space-y-1">
            <li><strong className="text-cyna-cyan">Siège social :</strong> 10 RUE DE PENTHIEVRE, 75008 Paris</li>
            <li><strong className="text-cyna-cyan">Numéro SIRET :</strong> 91371103200015</li>
            <li><strong className="text-cyna-cyan">Directeur de la publication :</strong> Kevin Moukam Nkameni</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white border-b border-[#2D333B] pb-2 mb-4">Hébergement</h2>
          <p><strong>Hébergeur :</strong> [À compléter]</p>
          <p><strong>Adresse de l'hébergeur :</strong> [À compléter]</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white border-b border-[#2D333B] pb-2 mb-4">Propriété intellectuelle</h2>
          <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
        </section>
      </div>
    </div>
  );
};

export default MentionsLegales;