# 🔐 Guide des Variables d'Environnement — Vercel (Production)
## Plateforme E-Commerce — Les Laboratoires T. Wiley

Ce document répertorie l'ensemble des **variables d'environnement requises** à configurer dans le tableau de bord **Vercel** avant le déploiement en production.

---

## 📋 Tableau Récapitulatif pour Vercel

Dans Vercel, rendez-vous dans votre projet :  
👉 **Settings** > **Environment Variables**  
Sélectionnez les environnements : **Production**, **Preview**, et éventuellement **Development**.

| Nom de la Variable | Visibilité | Obligatoire | Description & Valeur Type |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SITE_URL` | Publique | **Oui** | URL publique finale de votre site (ex : `https://t-wiley.vercel.app` ou votre nom de domaine `https://laboratoires-twiley.ci`). Utilisé pour le SEO et le sitemap. |
| `ADMIN_EMAIL` | Secrète (Serveur) | **Oui** | Adresse email de l'administrateur unique (ex : `twileyleslaboratoires@gmail.com`). |
| `ADMIN_PASSWORD` | Secrète (Serveur) | **Oui** | Mot de passe robuste pour l'accès à l'Espace Gestionnaire (`/gestionnaire` ou `/admin`). |
| `SESSION_SECRET` | Secrète (Serveur) | **Oui** | Clé secrète cryptographique utilisée pour signer les cookies de session admin en HMAC-SHA256 (ex : une longue chaîne aléatoire de 32 à 64 caractères). |
| `NEXT_PUBLIC_SUPABASE_URL` | Publique | **Oui** | URL de votre instance de base de données Supabase (ex : `https://oxxxvyvodlvfugcqufzv.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique | **Oui** | Clé API publique `anon` / `publishable` de Supabase (`sb_publishable_...` ou `eyJhbGci...`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Secrète (Serveur) | **Oui** | Clé secrète `service_role` de Supabase (`sb_secret_...` ou `eyJhbGci...`). **Ne jamais exposer au navigateur.** |

---

## ⚙️ Détail et Rôle de Chaque Variable

### 1. `NEXT_PUBLIC_SITE_URL`
* **Rôle :** Permet à Next.js de générer les balises OpenGraph, les liens de partage WhatsApp et le sitemap dynamique pour le référencement Google.
* **Exemple Vercel :** `https://t-wiley.vercel.app`

### 2. `ADMIN_EMAIL`
* **Rôle :** Identifiant officiel de l'administrateur unique.
* **Valeur configurée :** `twileyleslaboratoires@gmail.com`

### 3. `ADMIN_PASSWORD`
* **Rôle :** Mot de passe de protection de l'espace d'administration.
* **Sécurité :** L'API le compare en temps constant (`timingSafeEqual`) et applique un verrouillage anti-force brute après 5 tentatives échouées.

### 4. `SESSION_SECRET`
* **Rôle :** Clé de signature des jetons de session (Edge Runtime & Server).
* **Recommandation :** Vous pouvez réutiliser la clé locale ou générer une nouvelle chaîne aléatoire :
  ```text
  twiley_secure_super_random_session_key_production_2026
  ```

### 5. `NEXT_PUBLIC_SUPABASE_URL`
* **Rôle :** Point d'accès de votre base de données Supabase PostgreSQL.
* **Valeur actuelle :** `https://oxxxvyvodlvfugcqufzv.supabase.co`

### 6. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* **Rôle :** Clé publique autorisant la lecture des catégories et produits publiés selon les politiques de sécurité RLS (*Row Level Security*).

### 7. `SUPABASE_SERVICE_ROLE_KEY`
* **Rôle :** Clé d'administration Supabase utilisée exclusivement côté serveur pour les opérations d'écriture (création/modification de produits, gestion du compte admin).

---

## 🚀 Procédure d'Ajout sur Vercel

1. Ouvrez votre tableau de bord **[Vercel](https://vercel.com)**.
2. Cliquez sur votre projet **`t-wiley`**.
3. Allez dans l'onglet **Settings** > puis **Environment Variables** dans le menu de gauche.
4. Pour chaque variable ci-dessus :
   * Entrez le **Key** (ex : `ADMIN_EMAIL`)
   * Entrez la **Value** correspondante
   * Cochez **Production**, **Preview**, **Development**
   * Cliquez sur **Save**.
5. Une fois toutes les variables ajoutées, lancez un nouveau déploiement (**Deployments** > **Redeploy**) pour que Vercel applique ces paramètres.

