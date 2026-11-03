# Guide des Variables d'Environnement — Les Laboratoires T. Wiley

Ce document récapitule l'ensemble des variables d'environnement nécessaires pour faire fonctionner le site en production (notamment lors du déploiement sur **Vercel** ou tout autre hébergeur).

---

## 📋 Tableau récapitulatif des variables

| Variable | Type | Requis | Description | Exemple |
| :--- | :--- | :---: | :--- | :--- |
| **`NEXT_PUBLIC_SITE_URL`** | Public | ✅ Oui | URL publique de votre site web en production | `https://t-wiley.vercel.app` |
| **`ADMIN_EMAIL`** | Serveur | ✅ Oui | Adresse email de l'administrateur unique | `twileyleslaboratoires@gmail.com` |
| **`ADMIN_PASSWORD`** | Serveur (Secret) | ✅ Oui | Mot de passe de connexion à l'espace gestionnaire | `VotreMotDePasseRobuste2026!` |
| **`SESSION_SECRET`** | Serveur (Secret) | ✅ Oui | Clé secrète de signature des sessions sécurisées | `twiley_secure_super_random_session_key_production_2026` |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Public | ✅ Oui | URL de votre projet Supabase | `https://oxxxvyvodlvfugcqufzv.supabase.co` |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Public | ✅ Oui | Clé publique anonyme Supabase (`anon` / `publishable`) | `sb_publishable_...` |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Serveur (Secret) | ✅ Oui | Clé secrète d'administration Supabase (`service_role`) | `sb_secret_...` |

---

## 🔒 Détails et Bonnes Pratiques de Sécurité

### 1. Variables Publiques (`NEXT_PUBLIC_*`)
* Ces variables sont compilées et lisibles par le navigateur client.
* **Ne jamais y mettre** de clé `service_role`, de mot de passe ou de secret privé.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` dispose uniquement de droits de lecture restreints aux données publiques publiées (via les politiques RLS).

### 2. Variables Serveur Privées (Secrets)
* Ces variables ne doivent **jamais** être préfixées par `NEXT_PUBLIC_`.
* Elles ne sont exécutées que côté serveur (API routes Next.js et Edge middleware).
* Elles ne sont **jamais** exposées au navigateur ni incluses dans les fichiers JavaScript publics.

---

## 🚀 Configuration sur Vercel (Étape par Étape)

Lors du déploiement de votre projet sur **Vercel** :

1. Rendez-vous sur votre tableau de bord **[Vercel](https://vercel.com)**.
2. Ouvrez votre projet **`t.wiley`**.
3. Allez dans l'onglet **Settings** > **Environment Variables**.
4. Ajoutez chacune des 7 variables listées ci-dessus pour les environnements **Production**, **Preview** et **Development**.
5. Cliquez sur **Save**.
6. Déclenchez un nouveau déploiement (**Redeploy**) pour que Vercel prenne en compte les variables.

---

## 🔍 Où trouver les clés Supabase ?

1. Connectez-vous sur votre console **[Supabase](https://supabase.com/dashboard)**.
2. Ouvrez le projet **`t.wiley`**.
3. Dans le menu de gauche, cliquez sur l'icône **Project Settings** (icône d'engrenage en bas).
4. Cliquez sur le sous-menu **API**.
5. Vous y trouverez :
   * **Project URL** ➔ Copier dans `NEXT_PUBLIC_SUPABASE_URL`
   * **Project API Keys** > `anon` `public` ➔ Copier dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * **Project API Keys** > `service_role` `secret` ➔ Copier dans `SUPABASE_SERVICE_ROLE_KEY`
