# LES LABORATOIRES T. WILEY — PLATEFORME E-COMMERCE PROFESSIONNELLE

Plateforme e-commerce professionnelle officielle pour **Les Laboratoires T. Wiley** (Bouaké, Côte d'Ivoire), spécialisée dans la commercialisation et distribution de produits en :
- **Cosmétiques**
- **Détergences hospitalières**
- **Entretien domestique**
- **Mécanique & Industrie**

Avec intégration native des commandes par **WhatsApp**, panier persistant sans création de compte pour les visiteurs, et un **espace d'administration privé et sécurisé** avec personnalisation visuelle.

---

## 🌟 IDENTITÉ OFFICIELLE DE L'ENTREPRISE

- **Nom officiel** : Les Laboratoires T. Wiley
- **Logo officiel** : Intégré fidèlement depuis l'image fournie dans `public/logo-laboratoires-t-wiley.jpg` (en-tête, footer, page à propos et favicon).
- **Activités** : Cosmétiques — Détergences hospitalières — Domestique — Mécanique
- **Adresse** : France 1, Feu Pacha, Bouaké, Côte d'Ivoire
- **Téléphones Côte d'Ivoire** :
  - `07 67 62 64 68` (Ligne principale & WhatsApp Commandes)
  - `01 40 98 64 64`
  - `27 31 62 41 83`
- **Téléphone États-Unis** :
  - `+1 704 287 2551`
- **Email officiel** : Champ administrable prévu (à renseigner par le propriétaire sans toucher au code).

---

## 🛒 EXPÉRIENCE VISITEUR (ZÉRO CONTRAINTE)

1. **Aucun compte client requis** : Les visiteurs n'ont pas besoin de s'inscrire, de se connecter ou de mémoriser un mot de passe.
2. **Arrivée directe sur la Boutique (`/`)** : Le catalogue commercial, la recherche et les catégories s'affichent immédiatement.
3. **Menu officiel strictly ordonné** :
   ```
   [LOGO] Les Laboratoires T. Wiley | BOUTIQUE | CATÉGORIES | PANIER | CONTACT | À PROPOS
   ```
4. **Commandes WhatsApp automatiques** :
   - Fiche produit : commande unitaire préremplie avec le nom, la quantité, le prix en FCFA et le total estimé.
   - Panier : commande groupée récapitulant tous les articles sélectionnés et le total général.
   - Tous les boutons utilisent de façon centralisée le numéro officiel WhatsApp (`+225 07 67 62 64 68`).

---

## 🔐 ESPACE ADMINISTRATEUR PRIVÉ (`/admin/login`)

- **Adresse secrète de connexion** : `/admin/login` (aucun bouton public d'administration n'est affiché aux visiteurs normaux).
- **Identifiants de connexion initiaux** :
  - **Email** : `admin@laboratoires-twiley.ci`
  - **Mot de passe** : `admin2026`
- **Accès & Sécurité (`/admin/securite`)** :
  - Le propriétaire peut modifier son adresse email administrateur.
  - Le propriétaire peut définir son propre mot de passe sécurisé à tout moment.
- **Tableau de bord (`/admin`)** :
  - Métriques clés (total produits, produits publiés, masqués, catégories).
  - Statut WhatsApp et identité commerciale.

---

## 🎨 PERSONNALISATION VISUELLE DU SITE (`/admin/apparence`)

L'administrateur peut ajuster l'apparence du site en toute autonomie :
- **Couleur principale** (titres, accents, logo).
- **Couleur secondaire** (surfaces sombres, footer).
- **Couleur des boutons d'action** (boutons WhatsApp, validations).
- **Couleur d'accent** (badges et mises en avant).
- **Palettes prêtes à l'emploi** (*Bleu Laboratoire & Médical*, *Émeraude & Hygiène Pure*, *Bleu Nuit & Or*, *Océan Pro*).
- **Persistance garantie** : Les couleurs sont enregistrées dans la configuration et persistent après actualisation, déconnexion ou redéploiement via variables CSS.

---

## 📦 GESTION DU CATALOGUE PRODUITS (`/admin/produits`)

- **Ajout de produit** avec nom, catégorie, description courte, description complète, prix en FCFA, conditionnement, stock, disponibilité et **prévisualisation immédiate de l'image**.
- **Modification instantanée** : Tout changement de prix ou d'image se répercute immédiatement dans la boutique, les fiches, le panier et les messages WhatsApp.
- **Suppression définitive** : Les produits de démonstration peuvent être supprimés en 1 clic par le propriétaire et disparaissent immédiatement du site public.
- **Publication / Dépublication en 1 clic**.

---

## 🚀 DÉMARRAGE RAPIDE EN LOCAL

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ou lancer le build de production
npm run build
npm run start
```
Le site est accessible sur **http://localhost:3000**.
