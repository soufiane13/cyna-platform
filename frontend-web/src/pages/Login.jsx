import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff, Mail, Lock, User, Shield, Smartphone } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  
  // ==========================================
  // 1. ÉTATS (DATA & UI)
  // ==========================================
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'setup-2fa' | 'verify-2fa'
  const [tempToken, setTempToken] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [secret, setSecret] = useState(null);
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

  // ==========================================
  // 2. LOGIQUE MÉTIER (Ne pas toucher)
  // ==========================================
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
    if (s <= 25) return 'bg-[#FF3B3B]'; // Rouge (Faible)
    if (s <= 50) return 'bg-[#F5A623]'; // Orange (Moyen)
    return 'bg-[#00FF94]'; // Vert (Fort)
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        const loginRes = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await loginRes.json();

        if (!loginRes.ok) {
          throw new Error(data.message || "Identifiants invalides");
        }

        if (data.mfaSetupRequired) {
          setTempToken(data.token);
          
          // Appel au backend pour générer le QR Code
          const setupRes = await fetch('http://localhost:3000/auth/2fa/setup', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const setupData = await setupRes.json();
          if (!setupRes.ok) throw new Error(setupData.message || "Erreur lors de la configuration 2FA.");
          
          setQrCode(setupData.qrCode);
          setFactorId(setupData.factorId);
          setSecret(setupData.secret);
          setView('setup-2fa');
          setSuccessMsg("Configuration requise : Scannez le QR Code.");
          return;
        }

        if (data.mfaRequired) {
          setTempToken(data.token);
          setFactorId(data.factorId);
          setView('verify-2fa');
          setSuccessMsg("Sécurité renforcée : Entrez votre code 2FA.");
          return;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard'); 
        window.location.reload();
      } 
      else if (view === 'setup-2fa' || view === 'verify-2fa') {
        const verifyRes = await fetch('http://localhost:3000/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tempToken}` },
          body: JSON.stringify({ factorId, code: twoFaCode })
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.message || "Code 2FA invalide.");

        localStorage.setItem('user', JSON.stringify(verifyData.user));
        navigate('/dashboard');
        window.location.reload();
      }
      else if (view === 'register') {
        const registerRes = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password, fullName: formData.fullName })
        });
        const data = await registerRes.json();
        if (!registerRes.ok) throw new Error(data.message || "Erreur lors de l'inscription");

        setSuccessMsg("Compte sécurisé créé ! Redirection...");
        setTimeout(() => {
          setView('login');
          setSuccessMsg('');
        }, 2000);
      }
      else if (view === 'forgot') {
        const resetRes = await fetch('http://localhost:3000/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const resetData = await resetRes.json();
        if (!resetRes.ok) throw new Error(resetData.message || "Erreur lors de l'envoi du lien de réinitialisation.");
        
        setSuccessMsg("Lien de réinitialisation sécurisé envoyé ! Vérifiez votre boîte de réception.");
      }
    } catch (err) {
      setError(err.message || "Identifiants invalides ou erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. COMPOSANT D'INPUT RÉUTILISABLE
  // ==========================================
  const renderInput = (label, name, type = "text", placeholder, icon = null, autoComplete = "off") => (
    <div className="mb-6 animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <label htmlFor={name} className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">
          {label}
        </label>
        {name === 'password' && view === 'login' && (
          <button 
            type="button"
            onClick={() => { setView('forgot'); setError(null); }}
            className="text-xs text-cyna-cyan font-bold hover:text-white transition-colors"
          >
            Mot de passe oublié ?
          </button>
        )}
      </div>

      <div className="relative group">
        <input
          id={name}
          autoComplete={autoComplete}
          type={name === 'password' && showPassword ? 'text' : type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full h-[52px] bg-[#0B0E14] border rounded-xl pl-4 pr-12 text-white font-medium placeholder-gray-600
            focus:outline-none focus:border-cyna-cyan transition-all
            ${error ? 'border-[#FF3B3B]' : 'border-[#2D333B] hover:border-gray-500'}
          `}
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyna-cyan transition-colors">
           {name === 'password' ? (
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
           ) : (
             icon
           )}
        </div>
      </div>
      
      {/* Barre de force de mot de passe */}
      {view === 'register' && name === 'password' && formData.password.length > 0 && (
        <div className="mt-3 h-1.5 w-full bg-[#0B0E14] border border-[#2D333B] rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`} 
            style={{ width: `${passwordStrength}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  // ==========================================
  // 4. RENDU UI (FRONT-END RESPONSIVE)
  // ==========================================
  return (
    <div className="min-h-screen w-full bg-[#0B0E14] flex flex-col items-center justify-center relative py-12 px-6 font-sans selection:bg-cyna-cyan selection:text-black">
      
      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1C2128_0%,_#0B0E14_70%)] z-0 opacity-50"></div>
      {/* Grille Cybernétique discrète */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>

      {/* BOUTON RETOUR */}
      <Link 
        to="/" 
        className="absolute top-8 left-6 md:left-12 z-20 flex items-center gap-2 text-[#A0A0A0] hover:text-white font-bold text-sm transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour au site
      </Link>

      {/* LOGO CYNA */}
      <div className="relative z-20 flex flex-col items-center mb-8">
         <div className="w-12 h-12 bg-cyna-cyan/10 border-2 border-cyna-cyan rounded-xl flex items-center justify-center text-cyna-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)] mb-4">
            <Shield size={24} />
         </div>
         <span className="text-2xl font-black text-white tracking-widest italic uppercase">CYNA<span className="text-cyna-cyan">DEFENSE</span></span>
      </div>

      {/* CARTE D'AUTHENTIFICATION */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#1C2128] p-8 md:p-12 rounded-[24px] border border-[#2D333B] shadow-2xl">
        
        {/* HEADER CARTE */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
            {view === 'login' && "Portail d'accès"}
            {view === 'register' && "Créer une instance"}
            {view === 'forgot' && "Réinitialisation"}
          {view === 'setup-2fa' && "Configuration 2FA"}
          {view === 'verify-2fa' && "Vérification 2FA"}
          </h1>
          <p className="text-sm text-[#A0A0A0] font-medium">
            {view === 'login' && "Authentifiez-vous pour accéder à votre SOC."}
            {view === 'register' && "Rejoignez l'élite de la protection B2B."}
            {view === 'forgot' && "Un lien sécurisé vous sera envoyé."}
          {(view === 'setup-2fa' || view === 'verify-2fa') && "Sécurité administrateur requise."}
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div className="mb-6 p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl flex items-start gap-3 text-[#FF3B3B] text-sm font-bold animate-fade-in">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" /> 
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-[#00FF94]/10 border border-[#00FF94]/30 rounded-xl flex items-start gap-3 text-[#00FF94] text-sm font-bold animate-fade-in">
            <Check size={18} className="flex-shrink-0 mt-0.5" /> 
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-2">
          
          {view === 'register' && renderInput("Nom du Responsable", "fullName", "text", "Ex: Jean Dupont", <User size={18}/>, "name")}
          {(view === 'login' || view === 'register' || view === 'forgot') && renderInput("Adresse Email Pro", "email", "email", "contact@entreprise.com", <Mail size={18}/>, "email")}
          {(view === 'login' || view === 'register') && renderInput("Clé d'accès", "password", "password", "••••••••", <Lock size={18}/>, view === 'register' ? "new-password" : "current-password")}

          {/* AFFICHAGE DU QR CODE 2FA */}
          {view === 'setup-2fa' && qrCode && (
            <div className="flex flex-col items-center mb-6 animate-fade-in">
              <div className="bg-white text-black p-4 rounded-xl mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex justify-center [&>svg]:w-56 [&>svg]:h-56" dangerouslySetInnerHTML={{ __html: qrCode }}></div>
              <p className="text-sm text-[#A0A0A0] text-center mb-2">Scannez ce QR Code avec Google Authenticator ou Authy.</p>
              {secret && (
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500 mb-1">Impossible de scanner ? Saisissez la clé manuellement :</p>
                  <p className="font-mono text-cyna-cyan select-all text-sm tracking-widest">{secret}</p>
                </div>
              )}
            </div>
          )}

          {/* CHAMP CODE A 6 CHIFFRES */}
          {(view === 'setup-2fa' || view === 'verify-2fa') && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-2">Code à 6 chiffres</label>
              <div className="relative group">
                <input type="text" maxLength="6" value={twoFaCode} onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full h-[52px] bg-[#0B0E14] border border-[#2D333B] rounded-xl pl-4 pr-12 text-white font-medium text-center tracking-[0.5em] text-xl focus:outline-none focus:border-cyna-cyan transition-all" />
                <Smartphone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          )}

          {/* CHECKBOX (Login Only) */}
          {view === 'login' && (
            <div className="flex items-center mt-4 mb-2">
              <input 
                id="remember-me" 
                type="checkbox" 
                checked={formData.rememberMe}
                onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                className="w-4 h-4 rounded border-[#2D333B] text-cyna-cyan bg-[#0B0E14] focus:ring-cyna-cyan focus:ring-offset-[#1C2128] cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-[#A0A0A0] cursor-pointer select-none">
                Maintenir la session active
              </label>
            </div>
          )}

          {/* BOUTON CTA PRINCIPAL */}
          <button 
            type="submit" 
            disabled={loading}
            className={`
              w-full h-[56px] mt-8 font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2
              ${loading 
                ? 'bg-[#2D333B] text-gray-500 cursor-not-allowed' 
                : 'bg-cyna-cyan text-[#0B0E14] hover:bg-white shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:-translate-y-1'
              }
            `}
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> TRAITEMENT...</>
            ) : (
            view === 'login' ? "S'AUTHENTIFIER" : view === 'register' ? "S'INSCRIRE" : view === 'forgot' ? "ENVOYER LE LIEN" : "VALIDER LE CODE"
            )}
          </button>

        </form>

        {/* FOOTER LINKS */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          {view === 'login' ? (
            <p className="text-sm text-[#A0A0A0] font-medium">
              Pas encore client ?{' '}
              <button onClick={() => { setView('register'); setError(null); }} className="text-white font-bold hover:text-cyna-cyan transition-colors underline decoration-cyna-cyan/30 underline-offset-4">
                Créer une instance
              </button>
            </p>
      ) : view === 'setup-2fa' || view === 'verify-2fa' ? (
        <p className="text-sm text-[#A0A0A0] font-medium">
          <button type="button" onClick={() => { setView('login'); setError(null); }} className="text-white font-bold hover:text-cyna-cyan transition-colors underline decoration-cyna-cyan/30 underline-offset-4">
            Annuler et retourner à la connexion
          </button>
        </p>
          ) : (
            <p className="text-sm text-[#A0A0A0] font-medium">
              Déjà équipé ?{' '}
              <button onClick={() => { setView('login'); setError(null); }} className="text-white font-bold hover:text-cyna-cyan transition-colors underline decoration-cyna-cyan/30 underline-offset-4">
                S'authentifier
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Auth;
