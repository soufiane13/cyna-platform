import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';

// ─── Cartes avec taille, slug et stats ───────────────────────────────────────
const CATEGORIES = [
    {
        slug: 'SOC', size: 'large',
        stats: [
            { value: '< 15 min', label: 'Temps de réponse' },
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '24/7', label: 'Surveillance' },
        ],
    },
    { slug: 'EDR', size: 'small' },
    { slug: 'XDR', size: 'small' },
    { slug: 'AUDIT', size: 'small' },
];

const BentoGrid = () => (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-32">

        {/* ── En-tête section ────────────────────────────────────────────────── */}
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

        {/* ── Grille bento ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 md:h-[560px]">
            {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat.slug];
                return (
                    <Link
                        to={`/search?category=${cat.slug}`}
                        key={cat.slug}
                        className={`
                            relative group overflow-hidden rounded-3xl min-h-[160px]
                            bg-[#1C2128] border border-[#2D333B] transition-all duration-300
                            hover:-translate-y-1 ${cfg.hoverBorder} ${cfg.glow}
                            ${cat.size === 'large' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'}
                        `}
                    >
                        {/* Fond dégradé */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.bgGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />

                        {/* Contenu */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-7 md:p-8">
                            {/* Icône */}
                            <div className={`w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${cfg.textClass}`}>
                                {cfg.icon(cat.size === 'large' ? 28 : 24)}
                            </div>

                            <div>
                                {/* Titre + description */}
                                <h3 className={`font-black text-white group-hover:${cfg.textClass} transition-colors mb-2
                                    ${cat.size === 'large' ? 'text-2xl lg:text-3xl' : 'text-lg'}`}>
                                    {cfg.label}
                                </h3>
                                <p className={`text-[#A0A0A0] leading-relaxed mb-4 ${cat.size === 'large' ? 'text-base max-w-xs' : 'text-sm'}`}>
                                    {cfg.tagline}
                                </p>

                                {/* Stats chiffrées (grande carte seulement) */}
                                {cat.size === 'large' && cat.stats && (
                                    <div className="grid grid-cols-3 gap-3 mb-5">
                                        {cat.stats.map(s => (
                                            <div key={s.label} className="bg-[#0B0E14]/60 border border-white/5 rounded-xl p-3">
                                                <p className={`text-base font-black font-mono ${cfg.textClass}`}>{s.value}</p>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5 leading-tight">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Ligne décorative + CTA */}
                                <div className="flex items-center gap-3">
                                    <div className={`h-0.5 w-0 group-hover:w-12 ${cfg.textClass.replace('text-', 'bg-')} transition-all duration-500 rounded-full`} />
                                    <span className={`text-xs font-bold ${cfg.textClass} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 uppercase tracking-widest`}>
                                        Explorer <ArrowRight size={12} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    </section>
);

export default BentoGrid;
