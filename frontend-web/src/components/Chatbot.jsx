import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Bonjour, je suis Nexus, votre assistant CYNA Defence. Comment puis-je vous aider à sécuriser votre infrastructure aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [needsContact, setNeedsContact] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const messagesEndRef = useRef(null);

  // Faire défiler automatiquement vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Ajouter le message de l'utilisateur à l'interface
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    try {
      // 2. Envoyer la question au Backend NestJS
      const response = await fetch('http://localhost:3000/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await response.json();
      
      // 3. Ajouter la réponse du bot
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        if (data.requiresSupport) {
            setNeedsContact(true);
        }
      }, 500); // Petit délai pour faire plus humain
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Désolé, je suis déconnecté du serveur." }]);
    }
  };

  const sendToSupport = async () => {
    if (!contactEmail.trim()) return;
    
    // Récupérer le dernier message de l'utilisateur comme "question complexe"
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop()?.text || 'Demande de contact';

    await fetch('http://localhost:3000/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: "Visiteur", contactInfo: contactEmail, message: lastUserMessage })
    });

    setNeedsContact(false);
    setMessages(prev => [...prev, { sender: 'bot', text: "Merci ! Votre demande a été transférée à notre équipe, nous vous répondrons par e-mail au plus vite." }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* BOUTON D'OUVERTURE */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-cyna-cyan text-[#0B0E14] p-4 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform">
          <MessageSquare size={28} />
        </button>
      )}

      {/* FENÊTRE DU CHATBOT */}
      {isOpen && (
        <div className="bg-[#1C2128] border border-[#2D333B] w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* HEADER */}
          <div className="bg-[#0B0E14] p-4 border-b border-[#2D333B] flex justify-between items-center">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyna-cyan animate-pulse"></div><h3 className="font-bold text-white tracking-wide">Assistant CYNA</h3></div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0B0E14]/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-cyna-cyan text-[#0B0E14] rounded-br-none font-medium' : 'bg-[#2D333B] text-gray-200 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* FORMULAIRE DE CONTACT SI BESOIN DE SUPPORT HUMAIN */}
            {needsContact && (
               <div className="bg-[#2D333B] p-4 rounded-xl border border-cyna-cyan/30 mt-2">
                 <p className="text-xs text-gray-300 mb-2">Entrez votre email pour être recontacté :</p>
                 <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="votre@email.com" className="w-full bg-[#0B0E14] text-white text-xs p-2 rounded border border-[#2D333B] mb-2 outline-none focus:border-cyna-cyan" />
                 <button onClick={sendToSupport} className="w-full bg-cyna-cyan text-[#0B0E14] text-xs font-bold py-2 rounded hover:bg-white transition-colors">ENVOYER AU SUPPORT</button>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ZONE DE SAISIE */}
          <div className="p-3 bg-[#1C2128] border-t border-[#2D333B] flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Posez votre question..." className="flex-1 bg-[#0B0E14] text-white text-sm px-4 py-2 rounded-full border border-[#2D333B] focus:outline-none focus:border-cyna-cyan" />
            <button onClick={sendMessage} disabled={!input.trim()} className="bg-cyna-cyan text-[#0B0E14] p-2 rounded-full hover:bg-white disabled:opacity-50 disabled:hover:bg-cyna-cyan"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Chatbot;