# 🛡️ CYNA Defense - Plateforme Web & API

Bienvenue sur le dépôt principal de la plateforme **CYNA Defense**. 
Ce dépôt monorepo (ou dépôt global) contient à la fois le code source de notre interface client/administrateur (Frontend) et de notre logique serveur métier (Backend).

---

## 🏗️ Architecture Technique

Le projet est divisé en deux environnements distincts qui communiquent via API REST :

### 🌐 Frontend (Dossier `frontend-web/`)
* **Technologie :** React.js propulsé par Vite
* **Tests :** Vitest & React Testing Library (JSDOM)
* **Hébergement :** Vercel
* **Rôle :** Interface utilisateur fluide, tableau de bord administrateur, intégration Stripe pour le client.

### ⚙️ Backend (Dossier `cyna-backend/`)
* **Technologie :** Node.js avec le framework NestJS (TypeScript)
* **Tests :** Jest (Unitaires et End-to-End)
* **Base de données & Auth :** Supabase (PostgreSQL)
* **Fonctionnalités :** Webhooks Stripe, envoi d'emails (SMTP Nodemailer), requêtes IA (Groq API).
* **Hébergement :** Render

---

## 📂 Structure du Projet

    cyna-project/
    ├── frontend-web/        # 💻 Code source de l'interface React/Vite
    │   ├── src/             # Composants, Pages, Hooks
    │   └── package.json     # Dépendances front
    ├── cyna-backend/        # ⚙️ Code source de l'API NestJS
    │   ├── src/             # Contrôleurs, Services, Modules
    │   └── package.json     # Dépendances back
    └── README.md            # Ce fichier de documentation

---

## 🚀 Guide d'Installation Globale

### 1. Prérequis
Assurez-vous d'avoir installé :
* [Node.js](https://nodejs.org/) (Version LTS)
* `npm` (Gestionnaire de paquets)

### 2. Cloner le dépôt
```bash
git clone [URL_DE_REPO_GITHUB]
cd cyna-project
```
3. Installation des dépendances
Vous devez installer les dépendances pour chaque dossier de manière isolée :


## Installer le Backend
```Bash
cd cyna-backend
npm install
```

# Revenir à la racine et installer le Frontend
```
cd ../frontend-web
npm install
```
🔐 Configuration des Environnements (.env)
Le frontend et le backend nécessitent leurs propres fichiers .env.
⚠️ Sécurité : Ne placez jamais les clés secrètes (SERVICE_KEY, STRIPE_SECRET, mots de passe) dans le dossier frontend.

⚙️ Backend (cyna-backend/.env)

# URL Frontend
```
FRONTEND_URL=http://localhost:5173
```

# Supabase (Clés secrètes autorisées)
```
SUPABASE_URL=[https://vvqznavlkqjelpskjplh.supabase.co](https://vvqznavlkqjelpskjplh.supabase.co)
SUPABASE_KEY=votre_cle_publique
SUPABASE_SERVICE_KEY=votre_cle_secrete_service_role
```

# Stripe & Groq
```
STRIPE_SECRET_KEY=rk_test_votre_cle_secrete
GROQ_API_KEY=votre_cle_api_groq
```

# SMTP (Mailing)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
```
🌐 Frontend (frontend-web/.env)
Toutes les variables doivent être préfixées par VITE_.

```
VITE_FRONTEND_URL=http://localhost:5173
VITE_SUPABASE_URL=[https://vvqznavlkqjelpskjplh.supabase.co](https://vvqznavlkqjelpskjplh.supabase.co)
VITE_SUPABASE_ANON_KEY=votre_cle_publique_anonyme
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
```
💻 Démarrer l'Écosystème en Local
Pour faire fonctionner le projet localement, vous devez lancer les deux serveurs en parallèle (dans deux terminaux séparés).

Terminal 1 : Lancer l'API (Backend)

```Bash

cd cyna-backend
npm run start:dev
L'API écoutera sur http://localhost:3000.
```

Terminal 2 : Lancer l'Interface (Frontend)

```Bash

cd frontend-web
npm run dev
Le site web sera accessible sur http://localhost:5173.
```

🧪 Tests et Assurance Qualité (QA)
Chaque environnement possède son propre pipeline de tests pour garantir la stabilité avant la mise en production.

Tester le Backend (NestJS / Jest) :

```Bash
cd cyna-backend
npm run test
npm run test:e2e
```
Tester le Frontend (React / Vitest) :

```Bash
cd frontend-web
npx vitest run --environment jsdom
```
📦 Déploiement Continu (CI/CD)
Notre infrastructure cloud est automatisée :

Backend (Render) : À chaque mise à jour sur la branche main, Render clone le dossier cyna-backend, compile le code TypeScript (npm run build) et redémarre le serveur (npm run start:prod).

Frontend (Vercel) : Vercel détecte les changements dans frontend-web, exécute npm run build, et déploie le dossier dist/ sur le réseau de diffusion mondial.
