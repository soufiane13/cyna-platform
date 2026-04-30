import React from 'react';
import { Link }                              from 'react-router-dom';
import { ArrowRight, Radio, Shield, Globe, Search } from 'lucide-react';

// ── Configuration des catégories ─────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 1, title: "Opérations SOC",
    description: "Centre de surveillance continue et réponse aux incidents 24/7.",
    slug: "SOC",  size: "large",
    icon: <Radio  size={32} className="text-blue-400" />,
    gradient: "from-blue-900/40 to-blue-900/5",
    border:   "hover:border-blue-500/40",
    glow:     "hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)]",
  },
  {
    id: 2, title: "Détection EDR",
    description: "Protection avancée des endpoints contre les menaces zero-day.",
    slug: "EDR",  size: "small",
    icon: <Shield size={28} className="text-cyna-cyan" />,
    gradient: "from-cyan-900/40 to-cyan-900/5",
    border:   "hover:border-cyna-cyan/40",
    glow:     "hover:shadow-[0_10px_40px_rgba(0,240,255,0.08)]",
  },
  {
    id: 3, title: "Réponse XDR",
    description: "Visibilité unifiée sur l'ensemble de votre infrastructure.",
    slug: "XDR",  size: "small",
    icon: <Globe  size={28} className="text-purple-400" />,
    gradient: "from-purple-900/40 to-purple-900/5",
    border:   "hover:border-purple-500/40",
    glow:     "hover:shadow-[0_10px_40px_rgba(168,85,247,0.08)]",
  },
  {
    id: 4, title: "Audit & Pentest",
    description: "Évaluation proactive de vos vulnérabilités par nos experts.",
    slug: "AUDIT", size: "small",
    icon: <Search size={28} className="text-emerald-400" />,
    gradient: "from-emerald-900/40 to-emerald-900/5",
    border:   "hover:border-emerald-500/40",
    glow:     "hover:shadow-[0_10px_40px_rgba(52,211,153,0.08)]",
  },
];

const BentoGrid = () => (
  <section className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-32">

    {/* ── En-tête section ───────────────────────────────────────────────────── */}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6">
      <div>
        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
          Nos domaines d'expertise
        </h2>
        <p className="text-[#A0A0A0] text-sm">Des solutions pensées pour les entreprises exigeantes.</p>
      </div>
      <Link to="/category/all" className="flex items-center gap-2 text-sm font-bold text-cyna-cyan hover:text-white transition-colors group flex-shrink-0">
        TOUT VOIR <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>

    {/* ── BOUTON 2 : Grille — chaque carte est un Link vers /search?category=X ── */}
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 md:h-[560px]">
      {CATEGORIES.map((cat) => (
        <Link
          to={`/search?category=${cat.slug}`}
          key={cat.id}
          className={`
            relative group overflow-hidden rounded-3xl min-h-[160px]
            bg-[#1C2128] border border-[#2D333B] transition-all duration-300
            hover:-translate-y-1 ${cat.border} ${cat.glow}
            ${cat.size === 'large' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'}
          `}
        >
          {/* Fond dégradé au survol */}
          <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />

          {/* Contenu */}
          <div className="relative z-10 h-full flex flex-col justify-between p-7 md:p-8">
            {/* Icône */}
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {cat.icon}
            </div>
            {/* Texte + animation */}
            <div>
              <h3 className={`font-black text-white group-hover:text-cyna-cyan transition-colors mb-2
                ${cat.size === 'large' ? 'text-2xl lg:text-3xl' : 'text-lg'}`}>
                {cat.title}
              </h3>
              <p className={`text-[#A0A0A0] leading-relaxed mb-4 ${cat.size === 'large' ? 'text-base max-w-xs' : 'text-sm'}`}>
                {cat.description}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-0 group-hover:w-12 bg-cyna-cyan transition-all duration-500 rounded-full" />
                <span className="text-xs font-bold text-cyna-cyan opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 uppercase tracking-widest">
                  Explorer <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default BentoGrid;