import React from 'react';

const CGU = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 selection:bg-cyna-cyan selection:text-black">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tight">Conditions Générales d'Utilisation (CGU)</h1>
      
      <div className="space-y-10 text-[#A0A0A0] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3"><span className="text-cyna-cyan mr-2">Article 1 :</span>Objet</h2>
          <p>Les présentes CGU ont pour objet d'encadrer l'accès et l'utilisation de la plateforme e-commerce de <strong>CYNA-IT</strong>, spécialisée dans la vente de solutions de sécurité SaaS (SOC, EDR, XDR) aux entreprises.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3"><span className="text-cyna-cyan mr-2">Article 2 :</span>Accès au site et aux services</h2>
          <p>Le site est accessible gratuitement à tout utilisateur disposant d'un accès à internet. L'achat et la gestion des abonnements aux services SaaS nécessitent la création d'un compte utilisateur sécurisé. L'utilisateur est responsable du maintien de la confidentialité de ses identifiants.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3"><span className="text-cyna-cyan mr-2">Article 3 :</span>Disponibilité des services SaaS</h2>
          <p>Les solutions commercialisées étant des services SaaS, aucune gestion de stock physique n'est applicable. Les services sont indiqués comme "Disponibles immédiatement" sauf en cas de maintenance technique, auquel cas la mention "Service momentanément indisponible" sera affichée.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3"><span className="text-cyna-cyan mr-2">Article 4 :</span>Données personnelles et sécurité</h2>
          <p>CYNA-IT s'engage à protéger les données personnelles et bancaires de ses utilisateurs via des protocoles de chiffrement conformes aux normes strictes de sécurité (PCI-DSS).</p>
        </section>
      </div>
    </div>
  );
};

export default CGU;