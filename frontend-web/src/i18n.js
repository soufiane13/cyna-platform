import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dictionnaire de traductions
const resources = {
  fr: {
    translation: {
      "home": "Accueil",
      "categories": "Catégories",
      "search": "Recherche",
      "login": "Se connecter",
      "client_space": "Mon Espace Client",
      "admin_space": "Mon Espace Admin",
      "dashboard": {
        "info": "Informations",
        "subs": "Abonnements SaaS",
        "billing": "Facturation",
        "history": "Historique",
        "admin_access": "Accès Backoffice",
        "logout": "Se déconnecter",
        "profile_tab": "Profil",
        "subs_tab": "Abonnements",
        "billing_tab": "Paiement",
        "history_tab": "Historique",
        "personal_info": "Informations Personnelles",
        "full_name": "Nom Complet (Contact Légal)",
        "email": "Adresse Email",
        "phone": "Numéro de Téléphone",
        "company": "Entreprise / Organisation",
        "address": "Adresse Postale / Facturation",
        "saving": "SAUVEGARDE EN COURS...",
        "save_changes": "ENREGISTRER LES MODIFICATIONS",
        "change_pwd": "Modifier le mot de passe",
        "new_password": "Nouveau mot de passe",
        "confirm_password": "Confirmer le mot de passe",
        "cancel_pwd_change": "Annuler la modification"
      },
      "cookie": {
        "title": "Votre vie privée nous importe",
        "desc": "Nous utilisons des cookies pour améliorer votre expérience, analyser notre trafic et sécuriser nos services. En acceptant, vous consentez à l'utilisation de ces technologies.",
        "refuse": "Refuser",
        "accept": "Accepter"
      }
    }
  },
  en: {
    translation: {
      "home": "Home",
      "categories": "Categories",
      "search": "Search",
      "login": "Login",
      "client_space": "My Client Area",
      "admin_space": "My Admin Area",
      "dashboard": {
        "info": "Information",
        "subs": "SaaS Subscriptions",
        "billing": "Billing",
        "history": "History",
        "admin_access": "Backoffice Access",
        "logout": "Log Out",
        "profile_tab": "Profile",
        "subs_tab": "Subscriptions",
        "billing_tab": "Payment",
        "history_tab": "History",
        "personal_info": "Personal Information",
        "full_name": "Full Name (Legal Contact)",
        "email": "Email Address",
        "phone": "Phone Number",
        "company": "Company / Organization",
        "address": "Postal / Billing Address",
        "saving": "SAVING...",
        "save_changes": "SAVE CHANGES",
        "change_pwd": "Change Password",
        "new_password": "New Password",
        "confirm_password": "Confirm Password",
        "cancel_pwd_change": "Cancel Password Change"
      },
      "cookie": {
        "title": "Your privacy matters to us",
        "desc": "We use cookies to improve your experience, analyze our traffic, and secure our services. By accepting, you consent to the use of these technologies.",
        "refuse": "Decline",
        "accept": "Accept"
      }
    }
  }
};

// On récupère la langue sauvegardée dans le navigateur (ou 'fr' par défaut)
const savedLanguage = localStorage.getItem('cyna_lang') || 'fr';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "fr", // Langue de secours
  interpolation: { escapeValue: false } // React protège déjà contre les failles XSS
});

export default i18n;