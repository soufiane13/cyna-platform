import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/authService';
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  
  // État de la vue : 'login' | 'register' | 'forgot'
  const [view, setView] = useState('login');
  
  // Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    rememberMe: false
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // --- LOGIQUE DE FORCE MOT DE PASSE (Pour Register) ---
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };
  const passwordStrength = getPasswordStrength(formData.password);
  
  const getStrengthColor = (s) => {
    if (s <= 25) return 'bg-cyna-error';
    if (s <= 50) return 'bg-cyna-warning';
    return 'bg-cyna-success';
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Reset erreur quand on tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        const { user, error } = await loginUser(formData.email, formData.password);
        if (error) throw error;
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/'); // Redirection Dashboard
        window.location.reload();
      } 
      else if (view === 'register') {
        const { user, error } = await registerUser(formData.email, formData.password, { full_name: formData.fullName });
        if (error) throw error;
        setSuccessMsg("Compte créé ! Redirection...");
        setTimeout(() => {
          setView('login');
          setSuccessMsg('');
        }, 2000);
      }
      else if (view === 'forgot') {
        // Simulation d'envoi (à connecter à Supabase resetPasswordForEmail)
        setSuccessMsg("Lien de réinitialisation envoyé !");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU DES INPUTS GÉNÉRIQUES ---
  const renderInput = (label, name, type = "text", placeholder, icon = null) => (
    <div className="mb-6">
      <div className="flex justify-between">
        <label className="block text-[13px] font-medium text-[#8B949E] uppercase tracking-[0.5px] mb-2">
          {label}
        </label>
        {/* Lien Forgot Password (spécifique au champ password login) */}
        {name === 'password' && view === 'login' && (
          <button 
            type="button"
            onClick={() => setView('forgot')}
            className="text-xs text-cyna-cyan hover:underline"
          >
            Mot de passe oublié ?
          </button>
        )}
      </div>

      <div className="relative group">
        <input
          type={name === 'password' && showPassword ? 'text' : type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full h-[52px] bg-cyna-navy border rounded-lg pl-4 pr-12 text-cyna-white placeholder-[#484F58]
            focus:outline-none focus:border-cyna-cyan focus:ring-1 focus:ring-cyna-cyan/50 transition-all
            ${error ? 'border-cyna-error' : 'border-[#2D333B]'}
          `}
        />
        
        {/* Icône de validation ou Eye Toggle */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B949E]">
           {name === 'password' ? (
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-cyna-white">
               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
           ) : (
             icon
           )}
        </div>
      </div>
      
      {/* Barre de force (Uniquement Register + Password) */}
      {view === 'register' && name === 'password' && formData.password.length > 0 && (
        <div className="mt-2 h-1 w-full bg-cyna-navy rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`} 
            style={{ width: `${passwordStrength}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-cyna-navy flex flex-col items-center justify-center relative py-32 px-4 overflow-y-auto">
      
      {/* 1. BACKGROUND EFFECT (Spotlight) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1C2128_0%,_#0B0E14_70%)] z-0"></div>

      {/* 2. BACK LINK (Absolute Top-Left) */}
      <Link 
        to="/" 
        className="absolute top-10 left-10 z-20 flex items-center gap-2 text-cyna-text hover:text-cyna-white transition-colors"
      >
        <ArrowLeft size={20} /> Retour à l'accueil
      </Link>

      {/* 3. LOGO (Centered Above) */}
      <div className="absolute top-[calc(50%-340px)] left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
         <div className="w-10 h-10 bg-cyna-cyan rounded flex items-center justify-center text-cyna-navy font-black text-xl mb-2 shadow-neon">C</div>
      </div>

      {/* 4. AUTH CARD */}
      <div className="relative z-10 w-full max-w-[480px] bg-cyna-steel p-12 rounded-[24px] border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-bold text-cyna-white mb-2">
            {view === 'login' && "Bon retour parmi nous"}
            {view === 'register' && "Créer un compte"}
            {view === 'forgot' && "Réinitialisation"}
          </h1>
          <p className="text-[14px] text-cyna-text">
            {view === 'login' && "Entrez vos coordonnées pour accéder à votre espace."}
            {view === 'register' && "Rejoignez l'élite de la cybersécurité."}
            {view === 'forgot' && "Entrez votre email pour recevoir un lien."}
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div className="mb-6 p-3 bg-cyna-error/10 border border-cyna-error/30 rounded-lg flex items-center gap-2 text-cyna-error text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-cyna-success/10 border border-cyna-success/30 rounded-lg flex items-center gap-2 text-cyna-success text-sm">
            <Check size={16} /> {successMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          
          {view === 'register' && renderInput("Nom Complet", "fullName", "text", "ex: John Doe", <User size={18}/>)}
          
          {renderInput("Adresse Email", "email", "email", "nom@entreprise.com", <Mail size={18}/>)}
          
          {view !== 'forgot' && renderInput("Mot de passe", "password", "password", "••••••••", <Lock size={18}/>)}

          {/* CHECKBOX (Login Only) */}
          {view === 'login' && (
            <div className="flex items-center mt-6">
              <input 
                id="remember-me" 
                type="checkbox" 
                checked={formData.rememberMe}
                onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                className="w-4 h-4 rounded border-gray-600 text-cyna-cyan bg-cyna-navy focus:ring-cyna-cyan focus:ring-offset-cyna-navy"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-cyna-text cursor-pointer select-none">
                Se souvenir de moi
              </label>
            </div>
          )}

          {/* CTA BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-[52px] mt-8 bg-cyber-gradient text-cyna-navy font-bold text-[16px] rounded-lg hover:scale-[1.02] hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-cyna-navy border-t-transparent rounded-full animate-spin"></div>
            ) : (
              view === 'login' ? "SE CONNECTER" : view === 'register' ? "S'INSCRIRE" : "ENVOYER LE LIEN"
            )}
          </button>

        </form>

        {/* FOOTER LINKS */}
        <div className="mt-8 text-center">
          {view === 'login' ? (
            <p className="text-sm text-cyna-text">
              Pas encore de compte ?{' '}
              <button onClick={() => setView('register')} className="text-cyna-white font-bold hover:text-cyna-cyan transition-colors">
                S'inscrire
              </button>
            </p>
          ) : (
            <p className="text-sm text-cyna-text">
              Déjà un compte ?{' '}
              <button onClick={() => setView('login')} className="text-cyna-white font-bold hover:text-cyna-cyan transition-colors">
                Se connecter
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Auth;