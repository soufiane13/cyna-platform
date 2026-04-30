import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  
  getAutoResponse(userMessage: string): { reply: string; requiresSupport: boolean } {
    const msg = userMessage.toLowerCase();

    // 1. Salutations
    if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello')) {
      return { reply: "Bonjour, je suis Nexus, votre assistant CYNA Defence. Comment puis-je vous aider à sécuriser votre infrastructure aujourd'hui ?", requiresSupport: false };
    }

    // Règle spécifique pour le devis / Enterprise
    if (msg.includes('enterprise') || msg.includes('devis') || msg.includes('sur mesure')) {
      return { reply: "La solution CYNA EDR Enterprise est taillée pour les grandes infrastructures et n'est disponible que sur devis. Souhaitez-vous être mis en relation avec un expert pour évaluer vos besoins ?", requiresSupport: true };
    }
    
    // 2. Tarifs et Prix
    if (msg.includes('prix') || msg.includes('tarif') || msg.includes('coût') || msg.includes('combien')) {
      return { reply: "Nos tarifs varient selon les solutions. Par exemple, notre solution logicielle Cyna SaaS Pro est à 299€ HT/mois, et un Audit de Sécurité Web commence à 1500€ HT. Vous trouverez tout dans la section 'Produits'.", requiresSupport: false };
    }

    // 3. Services (Audit / Pentest)
    if (msg.includes('audit') || msg.includes('pentest') || msg.includes('sécurité') || msg.includes('piratage')) {
      return { reply: "Nous sommes experts en cybersécurité offensive. Nous proposons des audits d'applications web (norme OWASP) et des tests d'intrusion (Pentest) sur votre infrastructure. Souhaitez-vous en discuter avec un administrateur ?", requiresSupport: true };
    }

    // 4. Solutions Spécifiques (SOC / EDR)
    if (msg.includes('soc') || msg.includes('edr') || msg.includes('xdr')) {
      return { reply: "Nos solutions SOC (Security Operations Center) et EDR/XDR assurent une surveillance 24/7 de vos terminaux et réseaux pour bloquer les menaces en temps réel. Souhaitez-vous contacter nos ventes pour une démo ?", requiresSupport: true };
    }

    // 5. Base de connaissances FAQ : Mots de passe / Connexion
    if (msg.includes('mot de passe') || msg.includes('connexion') || msg.includes('connecter')) {
      return { reply: "Si vous rencontrez des problèmes de connexion ou avez oublié votre mot de passe, vous pouvez le réinitialiser depuis la page de connexion en cliquant sur 'Mot de passe oublié'.", requiresSupport: false };
    }

    // 6. Base de connaissances FAQ : Facturation
    if (msg.includes('facture') || msg.includes('paiement') || msg.includes('commande')) {
      return { reply: "Vos factures et votre historique de paiement sont disponibles à tout moment dans votre Espace Client (Tableau de bord > Historique). Vous pouvez les télécharger au format PDF.", requiresSupport: false };
    }

    // 7. Base de connaissances FAQ : Création de compte
    if (msg.includes('compte') || msg.includes('inscription') || msg.includes('inscrire')) {
      return { reply: "Pour créer un compte, rendez-vous sur la [page de connexion](/login) et sélectionnez 'Créer une instance'. Vous pourrez ensuite gérer votre infrastructure depuis votre espace client.", requiresSupport: false };
    }

    // 4. Par défaut (Question non reconnue -> Redirection vers le support humain)
    return {
      reply: "Je suis Nexus, une intelligence artificielle. Pour une demande précise, voulez-vous que je transfère votre message à un administrateur ?",
      requiresSupport: true // Indique au frontend d'afficher le formulaire pour demander l'email
    };
  }
}