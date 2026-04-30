import React, { useState, useEffect } from 'react';
import { Shield, Activity, Server, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Slides par défaut (fallback si le carousel Supabase est vide) ─────────────
const DEFAULT_SLIDES = [
  { id: 1, title: "Secure Your Future with Intelligent SOC.", subtitle: "Surveillance continue et réponse aux menaces en temps réel.", visual: "SOC", cta: "S'ABONNER MAINTENANT", link: "/category/all" },
  { id: 2, title: "Endpoint Detection. Real-time Response.",  subtitle: "Protection avancée pour chaque appareil de votre réseau.",  visual: "EDR", cta: "DÉCOUVRIR EDR",          link: "/search?category=EDR" },
  { id: 3, title: "Unified Security Across All Layers.",     subtitle: "Une visibilité totale grâce à la technologie XDR.",         visual: "XDR", cta: "VOIR LE CATALOGUE",      link: "/category/all" },
];

// ── Icônes associées à chaque type de slide ───────────────────────────────────
const VISUALS = {
  SOC: <Activity size={120} className="text-cyna-cyan opacity-80" />,
  EDR: <Shield   size={120} className="text-cyna-success opacity-80" />,
  XDR: <Server   size={120} className="text-purple-500 opacity-80" />,
};

const Hero = () => {
  const navigate = useNavigate();
  const [slides,       setSlides]       = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating,  setIsAnimating]  = useState(false);

  // ── Chargement du carousel depuis NestJS ──────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:3000/carousel')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.items?.length) setSlides(data.items); })
      .catch(() => {});
  }, []);

  // ── Rotation automatique toutes les 5s ────────────────────────────────────
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

  return (
    <section className="relative w-full h-[720px] bg-cyna-navy overflow-hidden flex items-center">
      <div className="max-w-[1440px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 h-full">

        {/* ── Colonne texte ────────────────────────────────────────────────── */}
        <div className={`flex flex-col justify-center pl-4 lg:pl-12 z-10 transition-all duration-400
          ${isAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-cyna-white leading-tight mb-6">
            {slide.title.split('.').map((chunk, i) => (
              <span key={i} className="block">
                {chunk}{chunk && <span className="text-cyna-cyan">.</span>}
              </span>
            ))}
          </h1>
          <p className="text-cyna-text text-lg max-w-md mb-10">{slide.subtitle}</p>

          {/* ── BOUTON 1 : CTA principal → navigue vers slide.link ──────────── */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(slide.link || '/category/all')}
              className="flex items-center gap-3 bg-cyber-gradient text-cyna-navy font-black py-4 px-8 rounded-xl shadow-neon hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 group"
            >
              {slide.cta}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Bouton secondaire → page Search */}
            <button
              onClick={() => navigate('/search')}
              className="text-sm font-bold text-gray-400 hover:text-cyna-cyan border border-white/10 hover:border-cyna-cyan/30 py-4 px-6 rounded-xl transition-all"
            >
              Explorer le catalogue
            </button>
          </div>
        </div>

        {/* ── Colonne visuel ───────────────────────────────────────────────── */}
        <div className={`relative flex items-center justify-center transition-all duration-400
          ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          <div className="relative w-[500px] h-[400px]">
            <div className="absolute inset-0 bg-cyna-steel/50 border border-cyna-cyan/20 rounded-2xl backdrop-blur-sm flex items-center justify-center shadow-card">
              {VISUALS[slide.visual] ?? VISUALS.SOC}
            </div>
            <div className="absolute -top-10 -right-10 bg-cyna-steel border border-cyna-warning/30 p-4 rounded-xl shadow-lg animate-float">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyna-warning animate-pulse" />
                <span className="text-cyna-white text-sm font-mono">Threat Detected</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-10 bg-cyna-steel border border-cyna-success/30 p-4 rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-cyna-success" />
                <span className="text-cyna-white text-sm font-mono">System Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Indicateurs de slide ──────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goToSlide(i)} aria-label={`Slide ${i + 1}`}
            className={`h-3 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-cyna-cyan w-8' : 'bg-cyna-text/30 w-3 hover:bg-cyna-text/60'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;