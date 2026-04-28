import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageSquare, X, Send, Loader, ShieldCheck, Minimize2,
    Bot, AlertTriangle, FileText, UserCheck, PhoneCall, Trash2
} from 'lucide-react';

// ============================================================
// SERVICE : Sauvegarde de la conversation dans le backoffice
// Remplace par ton vrai endpoint NestJS / Supabase
// ============================================================
const saveConversationToBackoffice = async (conversationData) => {
    // Exemple :
    // await fetch('http://localhost:3000/chat-sessions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(conversationData)
    // });
    console.log('[BACKOFFICE] Conversation sauvegardée :', conversationData);
};

// ============================================================
// SERVICE : Escalade vers un agent humain
// ============================================================
const escalateToHuman = async (escalationData) => {
    const customText = escalationData.customMessage ? `\n\nMessage de l'utilisateur :\n${escalationData.customMessage}` : "";
    // Envoi de la demande et de l'historique vers la vraie route du Backoffice
    const res = await fetch('http://localhost:3000/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         userName: "Visiteur (Via Nexus)",
         contactInfo: escalationData.contactInfo,
         message: `Demande de contact administrateur.${customText}\n\nHistorique de la conversation :\n` + escalationData.conversation.map(m => `[${m.role}] ${m.content}`).join('\n')
      })
    });
    if (!res.ok) {
        throw new Error("Le serveur backend a refusé l'enregistrement du message.");
    }
};

// ============================================================
// SYSTEM PROMPT COMPLET
// Personnalise selon ton catalogue et tes règles métier
// ============================================================
const buildSystemPrompt = (capturedInfo) => `
Tu es Nexus, l'assistante IA de CYNA Defense, une plateforme SaaS B2B de cybersécurité haut de gamme.

## Ton rôle
Répondre aux questions des clients, collecter leurs informations de contact, et escalader si nécessaire.

## Règles de comportement
1. Toujours répondre en français, de façon concise (3-5 phrases max)
2. Être professionnelle, rassurante, jamais robotique
3. Ne jamais inventer de prix précis — dire "consultez notre catalogue"
4. Ne jamais promettre de délais de livraison précis

## Catalogue CYNA Defense
- Solutions EDR/XDR : protection endpoints avancée
- SIEM as a Service : monitoring et corrélation d'événements 24/7
- SOC as a Service : centre opérationnel externalisé
- WAF Cloud : protection des applications web
- Threat Intelligence : renseignements sur les menaces
- Abonnements : mensuel ou annuel (-20%)
- TVA : 20% sur tous les prix

## Collecte d'informations
Informations déjà capturées : ${JSON.stringify(capturedInfo)}
- Si tu n'as pas encore l'email de l'utilisateur et que la conversation progresse (après 2+ échanges), demande-le naturellement
- Si tu n'as pas le sujet principal, essaie de l'identifier en posant une question

## Escalade vers un agent humain
Tu DOIS proposer une escalade dans ces cas :
- L'utilisateur dit explicitement vouloir parler à un humain / agent
- La question dépasse tes compétences (juridique, comptabilité, contrat sur mesure, urgence critique)
- L'utilisateur semble frustré ou insatisfait après 2 échanges
- La question concerne un incident de sécurité en cours

Quand tu proposes l'escalade, inclus EXACTEMENT ce texte dans ta réponse : [[PROPOSE_ESCALADE]]

## Redirection vers formulaire
Si l'utilisateur veut soumettre une demande détaillée par écrit, inclus : [[PROPOSE_FORMULAIRE]]

## Navigation
- Catalogue : /category/all
- Connexion : /login  
- Tableau de bord : /dashboard
- Panier : /cart
`;

// ============================================================
// DÉTECTION D'INTENTIONS SPÉCIALES DANS LA RÉPONSE IA
// ============================================================
const parseSpecialFlags = (text) => {
    const flags = {
        proposeEscalade: text.includes('[[PROPOSE_ESCALADE]]'),
        proposeFormulaire: text.includes('[[PROPOSE_FORMULAIRE]]'),
    };
    const cleanText = text
        .replace('[[PROPOSE_ESCALADE]]', '')
        .replace('[[PROPOSE_FORMULAIRE]]', '')
        .trim();
    return { cleanText, flags };
};

// ============================================================
// COMPOSANT PRINCIPAL : Chatbot CYNA complet
// ============================================================
const CynaChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
                role: 'assistant',
                content: "Bonjour, je suis Nexus, votre assistant CYNA Defence. Comment puis-je vous aider à sécuriser votre infrastructure aujourd'hui ?",
            timestamp: new Date().toISOString(),
        },
        {
                role: 'system',
                content: "🔒 **Sécurité CYNA :** Ne partagez jamais vos mots de passe ou informations bancaires dans cette fenêtre.",
            timestamp: new Date().toISOString(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(`session_${Date.now()}`);

    // Informations capturées pendant la conversation
    const [capturedInfo, setCapturedInfo] = useState({
        email: null,
        subject: null,
        userId: JSON.parse(localStorage.getItem('user') || 'null')?.id || null,
    });

    // États spéciaux UI
    const [showEscaladeForm, setShowEscaladeForm] = useState(false);
    const [escaladeContact, setEscaladeContact] = useState(''); // Peut être un e-mail ou un téléphone
    const [escaladeMessage, setEscaladeMessage] = useState(''); // Message personnalisé
    const [escaladeSuccess, setEscaladeSuccess] = useState(false);
    const [isEscalading, setIsEscalading] = useState(false);
    const [hasEscaladed, setHasEscaladed] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Écoute l'événement custom depuis ContactPage (bouton "Contacter Nexus")
    useEffect(() => {
        const handler = () => { setIsOpen(true); setIsMinimized(false); };
        window.addEventListener('openCynaChatbot', handler);
        return () => window.removeEventListener('openCynaChatbot', handler);
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showEscaladeForm]);

    // Focus input
    useEffect(() => {
        if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 150);
    }, [isOpen, isMinimized]);

    // Sauvegarde auto de la conversation en backoffice toutes les 5 secondes
    // (uniquement si conversation active)
    useEffect(() => {
        if (messages.length <= 1) return;
        const timer = setTimeout(() => {
            saveConversationToBackoffice({
                sessionId,
                capturedInfo,
                messages: messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
                status: hasEscaladed ? 'escalated' : 'active',
                lastActivity: new Date().toISOString(),
            });
        }, 5000);
        return () => clearTimeout(timer);
    }, [messages, capturedInfo, hasEscaladed, sessionId]);

    // ============================================================
    // EXTRACTION D'EMAIL depuis le texte utilisateur
    // ============================================================
    const extractEmail = useCallback((text) => {
        const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return match ? match[0] : null;
    }, []);

    // ============================================================
    // ENVOI DE MESSAGE PRINCIPAL
    // ============================================================
    const sendMessage = async (overrideText = null) => {
        const text = (overrideText || input).trim();
        if (!text || isLoading) return;

        const userMessage = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        // Tenter d'extraire l'email si pas encore capturé
        const detectedEmail = extractEmail(text);
        if (detectedEmail && !capturedInfo.email) {
            setCapturedInfo(prev => ({ ...prev, email: detectedEmail }));
        }

        try {
            const response = await fetch('http://localhost:3000/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: buildSystemPrompt(capturedInfo),
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });
            const data = await response.json();
            const rawReply = data.content?.map(b => b.type === 'text' ? b.text : '').join('') || "Je n'ai pas pu répondre.";
            const { cleanText, flags } = parseSpecialFlags(rawReply);

            const assistantMessage = {
                role: 'assistant',
                content: cleanText,
                timestamp: new Date().toISOString(),
                flags,
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Afficher le formulaire d'escalade si l'IA le demande
            if (flags.proposeEscalade && !hasEscaladed) {
                setTimeout(() => setShowEscaladeForm(true), 500);
            }

        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ Une erreur est survenue. Contactez support@cyna-defense.com",
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================
    // ESCALADE VERS UN AGENT HUMAIN
    // ============================================================
    const handleEscalade = async () => {
        const contact = escaladeContact || capturedInfo.email;
        if (!contact) { alert("Veuillez entrer votre e-mail ou numéro de téléphone."); return; }

        setIsEscalading(true);
        try {
            await escalateToHuman({
                sessionId,
                contactInfo: contact,
                customMessage: escaladeMessage,
                conversation: messages.map(m => ({ role: m.role, content: m.content })),
                capturedInfo: { ...capturedInfo, email: contact },
                priority: 'normal',
                timestamp: new Date().toISOString(),
            });
            setHasEscaladed(true);
            setEscaladeSuccess(true);
            setShowEscaladeForm(false);
            setCapturedInfo(prev => ({ ...prev, email: contact }));

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✅ Votre demande a été transmise à notre équipe. Un administrateur vous contactera sur **${contact}** dans les plus brefs délais. Votre conversation a été sauvegardée.`,
                timestamp: new Date().toISOString(),
            }]);
        } catch {
            alert("Erreur lors de la transmission. Contactez directement support@cyna-defense.com");
        } finally {
            setIsEscalading(false);
        }
    };

    // ============================================================
    // CONFORMITÉ RGPD : EFFACER L'HISTORIQUE
    // ============================================================
    const clearHistory = () => {
        if (window.confirm("Conformément au RGPD, voulez-vous effacer l'historique de cette conversation ?")) {
            setMessages([
                { role: 'system', content: "🔒 **Sécurité CYNA :** Ne partagez jamais vos mots de passe ou informations bancaires ici.", timestamp: new Date().toISOString() },
                { role: 'assistant', content: "Historique effacé. Comment puis-je vous aider ?", timestamp: new Date().toISOString() }
            ]);
            setHasEscaladed(false);
            setShowEscaladeForm(false);
            setEscaladeSuccess(false);
            setCapturedInfo(prev => ({ ...prev, email: null })); // Oublier l'email
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Rendu markdown simple (gras et liens)
    const renderContent = (content) =>
        content.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('[') && part.endsWith(')')) {
                const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (match) {
                    return <a key={i} href={match[2]} className="text-cyna-cyan underline hover:text-white transition-colors">{match[1]}</a>;
                }
            }
            return part;
        });

    const SUGGESTIONS = ['Découvrir nos solutions SOC/EDR', 'Voir les tarifs', 'Créer un compte', 'Contacter le support technique'];

    // ============================================================
    // RENDU
    // ============================================================
    return (
        <>
            {/* ===== BOUTON FLOTTANT ===== */}
            <button
                onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                aria-label="Ouvrir le support Nexus"
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-cyna-cyan text-[#0B0E14] flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_50px_rgba(0,240,255,0.5)]
          ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}`}
            >
                <MessageSquare size={26} />
                {!hasEscaladed && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF3B3B] rounded-full border-2 border-[#0B0E14] flex items-center justify-center">
                        <span className="text-[8px] text-white font-black">!</span>
                    </span>
                )}
            </button>

            {/* ===== FENÊTRE CHAT ===== */}
            <div className={`fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-1.5rem)] transition-all duration-400 ease-out
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}
        ${isMinimized ? '' : 'h-[680px] max-h-[90vh]'}`}
            >
                <div className={`w-full flex flex-col bg-[#1C2128] border border-[#2D333B] rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 ${isMinimized ? '' : 'h-full'}`}>

                    {/* --- HEADER --- */}
                    <div className="flex items-center gap-3 px-5 py-4 bg-[#0D1117] border-b border-[#2D333B] flex-shrink-0">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-cyna-cyan/10 border border-cyna-cyan/20 flex items-center justify-center">
                                <Bot size={20} className="text-cyna-cyan" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00FF94] rounded-full border-2 border-[#0D1117]"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">Nexus — Support CYNA</p>
                            <p className="text-[10px] text-[#00FF94] font-bold uppercase tracking-widest">
                                {hasEscaladed ? '🔁 Escaladé vers un agent' : '● En ligne · Répond en quelques secondes'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={clearHistory} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#FF9500] hover:bg-[#FF9500]/10 transition-all" title="Effacer l'historique (RGPD)">
                                <Trash2 size={14} />
                            </button>
                            <button onClick={() => setIsMinimized(v => !v)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all" title="Réduire">
                                <Minimize2 size={14} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 transition-all" title="Fermer">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* --- CONTENU (masqué si réduit) --- */}
                    {!isMinimized && (
                        <>
                            {/* MESSAGES */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {messages.map((msg, i) => (
                                    msg.role === 'system' ? (
                                        <div key={i} className="flex justify-center my-3 animate-fade-in">
                                            <div className="bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 text-center max-w-[95%]">
                                                <ShieldCheck size={14} className="flex-shrink-0" />
                                                <span>{renderContent(msg.content)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                    <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-7 h-7 rounded-full bg-cyna-cyan/10 border border-cyna-cyan/20 flex items-center justify-center flex-shrink-0">
                                                <ShieldCheck size={13} className="text-cyna-cyan" />
                                            </div>
                                        )}
                                        <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                      ${msg.role === 'user'
                                                ? 'bg-cyna-cyan text-[#0B0E14] font-semibold rounded-br-sm'
                                                : 'bg-[#0B0E14] border border-[#2D333B] text-[#D0D0D0] rounded-bl-sm'
                                            }`}
                                        >
                                            {renderContent(msg.content)}


                                        </div>
                                    </div>
                                    )
                                ))}

                                {/* INDICATEUR TYPING */}
                                {isLoading && (
                                    <div className="flex items-end gap-2">
                                        <div className="w-7 h-7 rounded-full bg-cyna-cyan/10 border border-cyna-cyan/20 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={13} className="text-cyna-cyan" />
                                        </div>
                                        <div className="bg-[#0B0E14] border border-[#2D333B] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                            {[0, 150, 300].map(delay => (
                                                <span key={delay} className="w-1.5 h-1.5 bg-cyna-cyan/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* === FORMULAIRE D'ESCALADE === */}
                                {showEscaladeForm && !hasEscaladed && (
                                <div className="bg-[#0B0E14] border border-cyna-cyan/30 rounded-2xl p-5 animate-fade-in mx-2 mb-2">
                                        <div className="flex items-center gap-2 mb-3">
                                        <UserCheck size={16} className="text-cyna-cyan" />
                                        <span className="text-sm font-bold text-cyna-cyan">Contacter un administrateur</span>
                                        </div>
                                        <p className="text-xs text-[#A0A0A0] mb-4 leading-relaxed">
                                        Un administrateur prendra en charge votre demande. Laissez votre e-mail ou numéro de téléphone pour être recontacté sous 24h.
                                        </p>
                                        <input
                                        type="text"
                                        value={escaladeContact}
                                        onChange={e => setEscaladeContact(e.target.value)}
                                        placeholder={capturedInfo.email || "E-mail ou Téléphone"}
                                            className="w-full h-10 bg-[#1C2128] border border-[#2D333B] rounded-lg px-3 text-white text-sm placeholder-gray-600 outline-none focus:border-cyna-cyan mb-3"
                                        />
                                    <textarea
                                        value={escaladeMessage}
                                        onChange={e => setEscaladeMessage(e.target.value)}
                                        placeholder="Précisez votre demande (optionnel)..."
                                        rows={2}
                                        className="w-full bg-[#1C2128] border border-[#2D333B] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-cyna-cyan mb-3 resize-none"
                                    />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleEscalade}
                                                disabled={isEscalading}
                                            className="flex-1 h-10 bg-cyna-cyan text-[#0B0E14] font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors"
                                            >
                                            {isEscalading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                                            Envoyer la demande
                                            </button>
                                            <button onClick={() => setShowEscaladeForm(false)} className="px-3 h-10 text-gray-500 hover:text-white transition-colors text-sm border border-[#2D333B] rounded-lg">
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* SUCCÈS ESCALADE */}
                                {escaladeSuccess && (
                                    <div className="bg-[#00FF94]/5 border border-[#00FF94]/20 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                                        <PhoneCall size={18} className="text-[#00FF94] flex-shrink-0" />
                                    <p className="text-xs text-[#00FF94] font-bold">Un administrateur vous contactera sous 24h.</p>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* SUGGESTIONS (seulement au début) */}
                            {messages.length <= 2 && !isLoading && (
                                <div className="px-4 pb-3 flex flex-wrap gap-2">
                                    {SUGGESTIONS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            className="text-[11px] font-bold text-cyna-cyan border border-cyna-cyan/25 bg-cyna-cyan/5 px-3 py-1.5 rounded-full hover:bg-cyna-cyan/15 transition-all hover:-translate-y-0.5"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                        {/* BOUTON CONTACT ADMINISTRATEUR DIRECT (Toujours visible) */}
                        {!hasEscaladed && !showEscaladeForm && (
                                <div className="px-4 pb-2">
                                    <button
                                        onClick={() => setShowEscaladeForm(true)}
                                    className="w-full text-xs text-[#A0A0A0] hover:text-cyna-cyan transition-colors flex items-center justify-center gap-1.5 py-2 border border-[#2D333B] rounded-xl hover:border-cyna-cyan/30 hover:bg-cyna-cyan/5"
                                    >
                                    <UserCheck size={13} /> Contacter un administrateur
                                    </button>
                                </div>
                            )}

                            {/* ZONE DE SAISIE */}
                            <div className="p-4 border-t border-[#2D333B] flex-shrink-0">
                                <div className="flex items-end gap-2 bg-[#0B0E14] border border-[#2D333B] rounded-xl p-1 pl-3 focus-within:border-cyna-cyan/40 transition-colors">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Écrivez votre message... (Entrée pour envoyer)"
                                        rows={1}
                                        disabled={hasEscaladed}
                                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none resize-none py-2.5 max-h-28 disabled:opacity-40"
                                        style={{ lineHeight: '1.5' }}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={isLoading || !input.trim() || hasEscaladed}
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 mb-0.5
                      ${input.trim() && !isLoading && !hasEscaladed
                                                ? 'bg-cyna-cyan text-[#0B0E14] hover:bg-white shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                                                : 'bg-[#2D333B] text-gray-600 cursor-not-allowed'
                                            }`}
                                        aria-label="Envoyer"
                                    >
                                        {isLoading ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-700 text-center mt-2 uppercase tracking-widest">
                                    Nexus ·  · CYNA Defense
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CynaChatbot;
