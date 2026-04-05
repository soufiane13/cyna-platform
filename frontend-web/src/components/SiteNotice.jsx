import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SiteNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cyna_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cyna_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('cyna_cookie_consent', 'refused');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6 animate-fade-in pointer-events-none">
      <div className="max-w-4xl mx-auto bg-[#1C2128]/90 backdrop-blur-xl border border-cyna-cyan/30 p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-6 pointer-events-auto">
        <div className="w-12 h-12 bg-cyna-cyan/10 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Shield className="text-cyna-cyan" size={24} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-white font-bold text-lg mb-1">{t('cookie.title')}</h3>
          <p className="text-[#A0A0A0] text-sm leading-relaxed">
            {t('cookie.desc')}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleRefuse} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-[#A0A0A0] bg-[#0B0E14] border border-[#2D333B] hover:text-white hover:bg-white/5 transition-colors">{t('cookie.refuse')}</button>
          <button onClick={handleAccept} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-[#0B0E14] bg-cyna-cyan hover:bg-white hover:-translate-y-0.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">{t('cookie.accept')}</button>
        </div>
      </div>
    </div>
  );
};

export default SiteNotice;