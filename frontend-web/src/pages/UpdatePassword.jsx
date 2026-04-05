import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, Check, AlertCircle, ArrowLeft } from 'lucide-react';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // 1. Récupération du Token envoyé par Supabase dans l'URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Supabase place les infos après le #, on utilise URLSearchParams pour les lire
      const hashParams = new URLSearchParams(hash.substring(1));
      const token = hashParams.get('access_token');
      const type = hashParams.get('type'); // Devrait être 'recovery'

      if (token) {
        setAccessToken(token);
      } else {
        setError("Lien de réinitialisation invalide ou expiré.");
      }
    } else {
      setError("Aucun jeton d'accès trouvé dans l'URL.");
    }
  }, []);

  // 2. Soumission du nouveau mot de passe au Backend NestJS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }
    if (password.length < 8) {
      return setError("Le mot de passe doit contenir au moins 8 caractères.");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la modification du mot de passe.");
      }

      setSuccess(true);
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0E14] flex flex-col items-center justify-center relative py-12 px-6 font-sans selection:bg-cyna-cyan selection:text-black">
      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1C2128_0%,_#0B0E14_70%)] z-0 opacity-50"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>

      {/* LOGO CYNA */}
      <div className="relative z-20 flex flex-col items-center mb-8">
         <div className="w-12 h-12 bg-cyna-cyan/10 border-2 border-cyna-cyan rounded-xl flex items-center justify-center text-cyna-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)] mb-4">
            <Shield size={24} />
         </div>
         <span className="text-2xl font-black text-white tracking-widest italic uppercase">CYNA<span className="text-cyna-cyan">DEFENSE</span></span>
      </div>

      {/* CARTE DE MODIFICATION */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#1C2128] p-8 md:p-12 rounded-[24px] border border-[#2D333B] shadow-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Nouveau Mot de passe</h1>
          <p className="text-sm text-[#A0A0A0] font-medium">Veuillez définir votre nouvelle clé d'accès sécurisée.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl flex items-start gap-3 text-[#FF3B3B] text-sm font-bold animate-fade-in"><AlertCircle size={18} className="flex-shrink-0 mt-0.5" /> <span>{error}</span></div>}
        {success && <div className="mb-6 p-4 bg-[#00FF94]/10 border border-[#00FF94]/30 rounded-xl flex items-start gap-3 text-[#00FF94] text-sm font-bold animate-fade-in"><Check size={18} className="flex-shrink-0 mt-0.5" /> <span>Mot de passe mis à jour avec succès ! Redirection vers la page de connexion...</span></div>}

        {!success && accessToken && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Nouveau mot de passe</label>
              <div className="relative group">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl pl-4 pr-12 text-white font-medium focus:outline-none focus:border-cyna-cyan transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Confirmer le mot de passe</label>
              <div className="relative group">
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl pl-4 pr-12 text-white font-medium focus:outline-none focus:border-cyna-cyan transition-all" />
                <Lock size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            
            <button type="submit" disabled={loading} className={`w-full h-[56px] mt-8 font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${loading ? 'bg-[#2D333B] text-gray-500 cursor-not-allowed' : 'bg-cyna-cyan text-[#0B0E14] hover:bg-white shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:-translate-y-1'}`}>
              {loading ? "TRAITEMENT..." : "METTRE À JOUR"}
            </button>
          </form>
        )}

        {!accessToken && !success && (
           <div className="text-center mt-6">
              <Link to="/login" className="text-cyna-cyan font-bold hover:text-white underline">Retourner à la connexion</Link>
           </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;