import React, { useState, useEffect } from 'react';
import { Shield, Activity, Server, ArrowRight, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategoryConfig } from '../utils/categoryConfig';

const DEFAULT_SLIDES = [
    { id: 1, title: "Secure Your Future with Intelligent SOC.", subtitle: "Surveillance continue et réponse aux menaces en temps réel.", visual: "SOC", cta: "S'ABONNER MAINTENANT", link: "/category/all" },
    { id: 2, title: "Endpoint Detection. Real-time Response.",  subtitle: "Protection avancée pour chaque appareil de votre réseau.",  visual: "EDR", cta: "DÉCOUVRIR EDR",          link: "/search?category=EDR" },
    { id: 3, title: "Unified Security Across All Layers.",     subtitle: "Une visibilité totale grâce à la technologie XDR.",         visual: "XDR", cta: "VOIR LE CATALOGUE",      link: "/category/all" },
];

// ─── Nexus Dev — panel image premium ─────────────────────────────────────────
const NexusDevPanel = () => {
    const [time, setTime] = useState(() => new Date().toLocaleTimeString('fr-FR'));
    useEffect(() => {
        const t = setInterval(() => setTime(new Date().toLocaleTimeString('fr-FR')), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#060810]">

            {/* Image principale */}
            <img
                src="/nexus-dev.png"
                alt="Nexus Dev"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                onError={e => { e.currentTarget.style.display = 'none'; }}
            />

            {/* Teinte cyan subtile */}
            <div className="absolute inset-0 bg-[#00F0FF]/[0.04]" />

            {/* Grille cyber */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)',
                    backgroundSize: '38px 38px',
                }}
            />

            {/* Vignette radiale sur les bords */}
            <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(6,8,16,0.75) 100%)' }}
            />

            {/* Dégradés top & bottom */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#060810] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060810] via-[#060810]/60 to-transparent" />

            {/* Ligne de scan animée */}
            <div className="nexus-scan-line absolute inset-x-0 pointer-events-none"
                style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.7) 35%, #00F0FF 50%, rgba(0,240,255,0.7) 65%, transparent 100%)' }}
            />

            {/* Coins L — haut-gauche */}
            <div className="absolute top-5 left-5">
                <div className="absolute top-0 left-0 w-5 h-px bg-[#00F0FF] opacity-80" />
                <div className="absolute top-0 left-0 w-px h-5 bg-[#00F0FF] opacity-80" />
            </div>
            {/* Coins L — haut-droit */}
            <div className="absolute top-5 right-5">
                <div className="absolute top-0 right-0 w-5 h-px bg-[#00F0FF] opacity-80" />
                <div className="absolute top-0 right-0 w-px h-5 bg-[#00F0FF] opacity-80" />
            </div>
            {/* Coins L — bas-gauche */}
            <div className="absolute bottom-5 left-5">
                <div className="absolute bottom-0 left-0 w-5 h-px bg-[#00F0FF] opacity-80" />
                <div className="absolute bottom-0 left-0 w-px h-5 bg-[#00F0FF] opacity-80" />
            </div>
            {/* Coins L — bas-droit */}
            <div className="absolute bottom-5 right-5">
                <div className="absolute bottom-0 right-0 w-5 h-px bg-[#00F0FF] opacity-80" />
                <div className="absolute bottom-0 right-0 w-px h-5 bg-[#00F0FF] opacity-80" />
            </div>

            {/* HUD supérieur */}
            <div className="absolute top-0 inset-x-0 px-6 pt-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#00F0FF] animate-ping opacity-50" />
                    </div>
                    <span className="text-[11px] font-mono font-black text-[#00F0FF] tracking-[0.25em] uppercase">NEXUS.DEV</span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-[#00F0FF]/15 px-3 py-1 rounded-md">
                    <span className="text-[10px] font-mono text-[#00F0FF]/60 tracking-widest tabular-nums">{time}</span>
                </div>
            </div>

            {/* Statuts flottants gauche & droite */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 px-5 flex justify-between items-center z-10 pointer-events-none">
                <div className="flex flex-col gap-2">
                    {[
                        { label: 'PROTECTION', value: 'ACTIVE', color: '#00FF94' },
                        { label: 'SURVEILLANCE', value: '24/7',   color: '#00F0FF' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/5 px-2.5 py-1.5 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-[9px] text-gray-400 font-mono tracking-widest">{s.label}</span>
                            <span className="text-[9px] font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2 items-end">
                    {[
                        { label: 'MENACES', value: '0',      color: '#00FF94' },
                        { label: 'UPTIME',  value: '99.99%', color: '#00F0FF' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/5 px-2.5 py-1.5 rounded-lg">
                            <span className="text-[9px] text-gray-400 font-mono tracking-widest">{s.label}</span>
                            <span className="text-[9px] font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Branding bas */}
            <div className="absolute bottom-0 inset-x-0 px-6 pb-6 z-10">
                <p className="text-[9px] font-mono text-[#00F0FF]/40 uppercase tracking-[0.35em] mb-1.5">Cybersecurity Platform</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black leading-none uppercase tracking-tight">
                        <span className="text-white">NEXUS </span>
                        <span className="text-[#00F0FF]" style={{ textShadow: '0 0 20px rgba(0,240,255,0.6)' }}>DEV</span>
                    </h3>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-[#00F0FF]/50 uppercase tracking-widest">
                        <div className="w-px h-3 bg-[#00F0FF]/30" />
                        SECURED
                    </div>
                </div>
                <div className="mt-2.5 h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(0,240,255,0.4), rgba(0,240,255,0.1) 50%, transparent)' }}
                />
            </div>
        </div>
    );
};

// ─── Panel EDR — status des endpoints ─────────────────────────────────────────
const EDRPanel = () => (
    <div className="w-full h-full flex flex-col gap-2.5 p-4 font-mono">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="text-[11px] text-[#00F0FF] font-bold tracking-widest">ENDPOINT SHIELD</span>
            <span className="text-[10px] text-[#00FF94]">✓ 342 protégés</span>
        </div>
        <div className="flex items-center justify-center py-2">
            <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1C2128" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#00F0FF" strokeWidth="10"
                        strokeDasharray="239" strokeDashoffset="5" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-[#00F0FF]">97.9<span className="text-sm">%</span></p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Protégé</p>
                </div>
            </div>
        </div>
        <div className="flex-1 space-y-1.5">
            {[
                { os: 'Windows 11', count: 186, color: 'bg-blue-500' },
                { os: 'macOS', count: 94, color: 'bg-gray-400' },
                { os: 'Linux', count: 62, color: 'bg-emerald-500' },
            ].map(row => (
                <div key={row.os}>
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-400">{row.os}</span>
                        <span className="text-white font-bold">{row.count}</span>
                    </div>
                    <div className="h-1.5 bg-[#0B0E14] rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full`} style={{ width: `${(row.count / 342) * 100}%` }} />
                    </div>
                </div>
            ))}
        </div>
        <div className="bg-[#00FF94]/5 border border-[#00FF94]/20 rounded-lg p-2.5 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#00FF94] flex-shrink-0" />
            <span className="text-[10px] text-[#00FF94]">Aucune menace active détectée</span>
        </div>
    </div>
);

// ─── Panel XDR — vue réseau unifiée ───────────────────────────────────────────
const XDRPanel = () => (
    <div className="w-full h-full flex flex-col gap-2.5 p-4 font-mono">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="text-[11px] text-purple-400 font-bold tracking-widest">XDR UNIFIED VIEW</span>
            <span className="text-[10px] text-gray-500">4 couches actives</span>
        </div>
        <div className="grid grid-cols-3 gap-2 flex-1">
            {[
                { label: 'Réseau', icon: <Server size={14} />, ok: 12, warn: 1, color: 'text-purple-400' },
                { label: 'Cloud', icon: <Activity size={14} />, ok: 8, warn: 0, color: 'text-blue-400' },
                { label: 'Email', icon: <Shield size={14} />, ok: 5, warn: 2, color: 'text-emerald-400' },
            ].map(node => (
                <div key={node.label} className="bg-[#0B0E14] rounded-xl border border-white/5 p-3 flex flex-col items-center gap-1.5">
                    <span className={node.color}>{node.icon}</span>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">{node.label}</p>
                    <div className="text-center">
                        <p className="text-sm font-black text-[#00FF94]">{node.ok} <span className="text-[8px] text-gray-500">OK</span></p>
                        {node.warn > 0 && <p className="text-[10px] font-bold text-[#FF9900]">{node.warn} alerte</p>}
                    </div>
                </div>
            ))}
        </div>
        <div className="bg-[#0B0E14] rounded-lg border border-white/5 p-3">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Corrélations récentes</p>
            {[
                { text: 'Mouvement latéral détecté — isolé', severity: 'high' },
                { text: 'Exfiltration DNS — bloquée', severity: 'medium' },
            ].map((e, i) => (
                <div key={i} className="flex items-start gap-2 py-1">
                    <AlertTriangle size={10} className={e.severity === 'high' ? 'text-[#FF3B3B]' : 'text-[#FF9900]'} />
                    <span className="text-[10px] text-gray-400">{e.text}</span>
                </div>
            ))}
        </div>
    </div>
);

const CYBER_PANELS = { SOC: NexusDevPanel, EDR: EDRPanel, XDR: XDRPanel };

// ─── Bande de confiance ───────────────────────────────────────────────────────
const TRUST_BADGES = [
    { label: 'ISO 27001', icon: <ShieldCheck size={14} /> },
    { label: 'GDPR Compliant', icon: <Lock size={14} /> },
    { label: 'SOC 2 Type II', icon: <Shield size={14} /> },
    { label: 'ANSSI Qualifié', icon: <ShieldCheck size={14} /> },
];

const Hero = () => {
    const navigate = useNavigate();
    const [slides, setSlides] = useState(DEFAULT_SLIDES);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop');

    useEffect(() => {
        fetch('https://cyna-api-d6b4.onrender.com/carousel')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.items?.length) setSlides(data.items); })
            .catch(() => {});

        // Récupérer l'image de fond dynamique
        fetch('https://cyna-api-d6b4.onrender.com/hero-bg')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.image_url) setBgImage(data.image_url); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const t = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);
        return () => clearInterval(t);
    }, [currentSlide, slides.length]);

    const goToSlide = (index) => {
        if (isAnimating || index === currentSlide) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 400);
    };

    const slide = slides[currentSlide];
    const CyberPanel = CYBER_PANELS[slide.visual] ?? NexusDevPanel;
    const isNexus = slide.visual === 'SOC' || !CYBER_PANELS[slide.visual];

    return (
        <section className="relative w-full min-h-[720px] bg-cyna-navy overflow-hidden flex flex-col">

            {/* ── Image de fond (Côté Gauche) avec fondu vers la droite ── */}
            <div 
                className="absolute inset-y-0 left-0 w-full lg:w-2/3 bg-cover bg-center opacity-20 pointer-events-none transition-all duration-700 ease-in-out"
                style={{ 
                    backgroundImage: `url("${slide.image_url || bgImage}")`,
                    WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                }}
            />

            {/* Fond grille de points */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(circle, #00F0FF 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
            {/* Glow latéral gauche */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyna-cyan/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1440px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 flex-1 py-24 lg:py-0 lg:h-[720px]">

                {/* ── Colonne texte ────────────────────────────────────────── */}
                <div className={`flex flex-col justify-center pl-4 lg:pl-12 z-10 transition-all duration-400 ${isAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
                    <h1 className="text-4xl lg:text-6xl font-bold text-cyna-white leading-tight mb-6">
                        {slide.title.split('.').map((chunk, i) => (
                            <span key={i} className="block">
                                {chunk}{chunk && <span className="text-cyna-cyan">.</span>}
                            </span>
                        ))}
                    </h1>
                    <p className="text-cyna-text text-lg max-w-md mb-10">{slide.subtitle}</p>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate(slide.link || '/category/all')}
                            className="flex items-center gap-3 bg-cyber-gradient text-cyna-navy font-black py-4 px-8 rounded-xl shadow-neon hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 group"
                        >
                            {slide.cta}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/search')}
                            className="text-sm font-bold text-gray-400 hover:text-cyna-cyan border border-white/10 hover:border-cyna-cyan/30 py-4 px-6 rounded-xl transition-all"
                        >
                            Explorer le catalogue
                        </button>
                    </div>

                    {/* Bande de certifications */}
                    <div className="flex flex-wrap items-center gap-3 mt-10 pt-8 border-t border-white/5">
                        {TRUST_BADGES.map(b => (
                            <div key={b.label} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                                <span className="text-gray-600">{b.icon}</span>
                                {b.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Colonne visuel ────────────────────────────────────────── */}
                <div className={`relative flex items-center justify-center transition-all duration-400 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="relative w-full max-w-[480px] h-[400px]">

                        {/* Panel principal — cyber dashboard */}
                        <div className={`absolute inset-0 rounded-2xl overflow-hidden shadow-card
                            ${isNexus
                                ? 'bg-[#060810] border border-transparent nexus-frame'
                                : 'bg-[#1C2128]/80 border border-cyna-cyan/20 backdrop-blur-sm'}`}>
                            <CyberPanel />
                        </div>

                        {/* Badge flottant haut droite */}
                        <div className="absolute -top-8 -right-8 bg-cyna-steel border border-cyna-warning/30 p-3.5 rounded-xl shadow-lg animate-float">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyna-warning animate-pulse" />
                                <span className="text-cyna-white text-xs font-mono font-bold">Threat Detected</span>
                            </div>
                        </div>

                        {/* Badge flottant bas gauche */}
                        <div className="absolute -bottom-4 -left-8 bg-cyna-steel border border-cyna-success/30 p-3.5 rounded-xl shadow-lg animate-float" style={{ animationDelay: '1.2s' }}>
                            <div className="flex items-center gap-2.5">
                                <Shield size={14} className="text-cyna-success" />
                                <span className="text-cyna-white text-xs font-mono font-bold">System Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Indicateurs de slide ────────────────────────────────────── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => goToSlide(i)} aria-label={`Slide ${i + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-cyna-cyan w-8' : 'bg-cyna-text/30 w-2.5 hover:bg-cyna-text/60'}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
