import React, { useState, useEffect } from 'react';
import { Shield, Activity, Lock, Server } from 'lucide-react'; // Icônes temporaires pour les visuels

const slides = [
  {
    id: 1,
    title: "Secure Your Future with Intelligent SOC.",
    subtitle: "Surveillance continue et réponse aux menaces en temps réel.",
    visual: "SOC", // Logique pour afficher le bon visuel
    cta: "S'ABONNER MAINTENANT"
  },
  {
    id: 2,
    title: "Endpoint Detection. Real-time Response.",
    subtitle: "Protection avancée pour chaque appareil de votre réseau.",
    visual: "EDR",
    cta: "DÉCOUVRIR EDR"
  },
  {
    id: 3,
    title: "Unified Security Across All Layers.",
    subtitle: "Une visibilité totale grâce à la technologie XDR.",
    visual: "XDR",
    cta: "VOIR LA DÉMO"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Rotation automatique du carrousel (toutes les 5 secondes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-[720px] bg-cyna-navy overflow-hidden flex items-center">
      <div className="max-w-[1440px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 h-full">
        
        {/* COL 1: TEXTE (40%) */}
        <div className="flex flex-col justify-center pl-4 lg:pl-12 z-10 transition-opacity duration-500 ease-in-out">
          <h1 className="text-5xl lg:text-6xl font-bold text-cyna-white leading-tight mb-6">
            {slide.title.split('.').map((chunk, i) => (
              <span key={i} className="block">
                {chunk}{chunk && <span className="text-cyna-cyan">.</span>}
              </span>
            ))}
          </h1>
          <p className="text-cyna-text text-lg max-w-md mb-8">
            {slide.subtitle}
          </p>
          <button className="w-fit bg-cyber-gradient text-cyna-navy font-bold py-4 px-8 rounded-lg shadow-neon hover:scale-105 transition-transform">
            {slide.cta}
          </button>
        </div>

        {/* COL 2: VISUEL FLOTTANT (60%) */}
        <div className="relative flex items-center justify-center">
          {/* Simulation du visuel "Map" + Cartes flottantes */}
          <div className="relative w-[500px] h-[400px]">
            
            {/* Carte Centrale (Map/Server) */}
            <div className="absolute inset-0 bg-cyna-steel/50 border border-cyna-cyan/20 rounded-2xl backdrop-blur-sm flex items-center justify-center shadow-card">
              {slide.visual === 'SOC' && <Activity size={120} className="text-cyna-cyan opacity-80" />}
              {slide.visual === 'EDR' && <Shield size={120} className="text-cyna-success opacity-80" />}
              {slide.visual === 'XDR' && <Server size={120} className="text-purple-500 opacity-80" />}
            </div>

            {/* Cartes flottantes (Animation) */}
            <div className="absolute -top-10 -right-10 bg-cyna-steel border border-cyna-warning/30 p-4 rounded-xl shadow-lg animate-float">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyna-warning animate-pulse"></div>
                <span className="text-cyna-white text-sm font-mono">Threat Detected</span>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-10 bg-cyna-steel border border-cyna-success/30 p-4 rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
               <div className="flex items-center gap-3">
                <Shield size={16} className="text-cyna-success"/>
                <span className="text-cyna-white text-sm font-mono">System Secure</span>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Indicateurs de slide (Dots) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-cyna-cyan w-8' : 'bg-cyna-text/30'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;