# ⚙️ CYNA Defense - Backend API

Bienvenue sur le dépôt du backend API de la plateforme **CYNA Defense**.
Développé avec **NestJS** (Node.js/TypeScript), ce backend centralise la logique métier, la gestion des paiements via Stripe et communique de manière sécurisée avec notre base de données Supabase.

---

## 🛠️ Stack Technique

* **Framework :** NestJS (TypeScript)
* **Base de données & Auth :** PostgreSQL (via Supabase)
* **Paiement :** Stripe Webhooks
* **Mailing :** SMTP (Nodemailer)
* **Hébergement / CI-CD :** Render

---

## 🚀 Guide d'installation

### 1. Prérequis
* [Node.js](https://nodejs.org/) (Version LTS)
* `npm`

### 2. Cloner et installer
Naviguez dans le dossier du backend, puis installez les dépendances :

```bash
cd cyna-backend
npm install

### 3\. Variables d'environnement (.env)

Créez un fichier .env à la racine du dossier backend._⚠️ AVERTISSEMENT : Ce fichier contient des clés secrètes (SERVICE\_KEY, STRIPE\_SECRET, identifiants SMTP). Il ne doit_ _**jamais**_ _être poussé sur GitHub._

# Configuration Supabase (Clés Secrètes)
SUPABASE_URL=[https://vvqznavlkqjelpskjplh.supabase.co](https://vvqznavlkqjelpskjplh.supabase.co)
SUPABASE_KEY=votre_cle_publique_supabase
SUPABASE_SERVICE_KEY=votre_cle_secrete_service_role

# Configuration Stripe
STRIPE_SECRET_KEY=rk_test_votre_cle_secrete_stripe

# API Tiers
GROQ_API_KEY=votre_cle_api_groq

# URLs
FRONTEND_URL=http://localhost:5173

# Configuration Mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application_gmail


💻 Démarrer le serveur local

# Mode développement standard
npm run start

# Mode développement avec rechargement à chaud (Watch mode) - Recommandé
npm run start:dev

# Mode production
npm run start:prod

L'API sera accessible par défaut sur http://localhost:3000 (ou selon le port défini par Render en production).

🧪 Lancer les Tests
-------------------

Le framework NestJS intègre Jest nativement pour garantir la stabilité des contrôleurs et des services.


# Tests unitaires
npm run test

# Tests End-to-End (e2e)
npm run test:e2e

# Rapport de couverture de code (Coverage)
npm run test:cov

📦 Déploiement (Render)
-----------------------

Ce backend est configuré pour un déploiement continu sur **Render**.Lors d'un _push_ ou d'un _merge_ sur la branche main de GitHub, Render va automatiquement :

1.  Cloner le code mis à jour.
    
2.  Exécuter npm install et npm run build.
    
3.  Démarrer l'application avec la commande npm run start:prod.
