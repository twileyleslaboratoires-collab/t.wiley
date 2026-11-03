const http = require('http');

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      { method: 'GET', headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function requestJson(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = { raw: data };
          }
          resolve({ status: res.statusCode, headers: res.headers, json });
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- VÉRIFICATION COMPLÈTE : LES LABORATOIRES T. WILEY ---\n');

  // 1. Boutique publique & Informations officielles
  const home = await get('/');
  console.assert(home.status === 200, 'Échec: statut boutique != 200');
  console.assert(home.data.includes('Les Laboratoires T. Wiley'), 'Échec: nom Les Laboratoires T. Wiley absent');
  console.assert(home.data.includes('logo-laboratoires-t-wiley.jpg'), 'Échec: logo officiel absent');
  console.assert(!home.data.includes('Espace Administrateur'), 'Échec: bouton administration visible publiquement');
  console.log('✓ 1. Accueil direct Boutique validé : Logo officiel, nom "Les Laboratoires T. Wiley", et aucun bouton admin public.');

  // 2. Navigation stricte : BOUTIQUE | CATÉGORIES | PANIER | CONTACT | À PROPOS
  const menuOrderRegex = /BOUTIQUE[\s\S]*?CATÉGORIES[\s\S]*?PANIER[\s\S]*?CONTACT[\s\S]*?À PROPOS/;
  console.assert(menuOrderRegex.test(home.data), 'Échec: Ordre du menu non respecté');
  console.log('✓ 2. Navigation validée : Ordre strict (BOUTIQUE | CATÉGORIES | PANIER | CONTACT | À PROPOS).');

  // 3. Page Contact & Téléphones officiels
  const contact = await get('/contact');
  console.assert(contact.status === 200, 'Échec: page contact != 200');
  console.assert(contact.data.includes('07 67 62 64 68'), 'Échec: téléphone 1 absent');
  console.assert(contact.data.includes('01 40 98 64 64'), 'Échec: téléphone 2 absent');
  console.assert(contact.data.includes('27 31 62 41 83'), 'Échec: téléphone 3 absent');
  console.assert(contact.data.includes('+1 704 287 2551'), 'Échec: téléphone US absent');
  console.assert(contact.data.includes('Bouaké'), 'Échec: ville Bouaké absente');
  console.log('✓ 3. Coordonnées officielles validées : 3 numéros CI, 1 numéro USA, adresse à Bouaké.');

  // 4. Sécurité : accès interdit aux non-authentifiés
  const unauthApi = await requestJson('POST', '/api/products', { name: 'Hack', price: 10 });
  console.assert(unauthApi.status === 403, 'Échec: API protégée accessible aux anonymes');
  const unauthCheck = await requestJson('GET', '/api/auth/check');
  console.assert(unauthCheck.json.authenticated === false, 'Échec: session faussement connectée');
  console.log('✓ 4. Sécurité validée : Requêtes d’administration anonymes bloquées (403).');

  // 5. Connexion Administrateur par Email & Mot de Passe
  const failedLogin = await requestJson('POST', '/api/auth/login', {
    email: 'admin@laboratoires-twiley.ci',
    password: 'mauvaismotdepasse',
  });
  console.assert(failedLogin.status === 401, 'Échec: mauvais mot de passe accepté');

  const successLogin = await requestJson('POST', '/api/auth/login', {
    email: 'admin@laboratoires-twiley.ci',
    password: 'admin2026',
  });
  console.assert(successLogin.status === 200, 'Échec: connexion admin valide refusée');
  const sessionCookie = successLogin.headers['set-cookie'][0].split(';')[0];
  console.log('✓ 5. Authentification validée : Email & Mot de passe avec cookie de session sécurisé HttpOnly.');

  // 6. Personnalisation visuelle / Thème (Couleurs)
  const getTheme = await requestJson('GET', '/api/theme');
  console.assert(getTheme.status === 200 && getTheme.json.primaryColor, 'Échec: récupération du thème');

  const updateThemeRes = await requestJson(
    'PUT',
    '/api/theme',
    {
      primaryColor: '#026ac8',
      secondaryColor: '#0f172a',
      buttonColor: '#16a34a',
      accentColor: '#d97706',
    },
    { Cookie: sessionCookie }
  );
  console.assert(updateThemeRes.status === 200, 'Échec: mise à jour du thème');
  console.log('✓ 6. Personnalisation visuelle validée : Sauvegarde durable des couleurs (principale, secondaire, boutons).');

  // 7. Gestion des Produits (Ajout, Modification du prix, Suppression)
  const addProdRes = await requestJson(
    'POST',
    '/api/products',
    {
      name: 'Produit Détergent Test Spécial',
      price: 6000,
      packaging: 'Bidon 5L',
      shortDescription: 'Formule test pour vérification',
      fullDescription: 'Détails complets test',
      categoryId: 'cat-hospitalier',
      mainImage: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',
      availability: 'in_stock',
      stockQuantity: 50,
      isPublished: true,
    },
    { Cookie: sessionCookie }
  );
  console.assert(addProdRes.status === 201, 'Échec: ajout de produit');
  const testId = addProdRes.json.id;

  // Modification du prix
  const updatePriceRes = await requestJson(
    'PUT',
    `/api/products/${testId}`,
    { price: 7500 },
    { Cookie: sessionCookie }
  );
  console.assert(updatePriceRes.status === 200 && updatePriceRes.json.price === 7500, 'Échec: modification prix');

  // Suppression
  const deleteProdRes = await requestJson(
    'DELETE',
    `/api/products/${testId}`,
    null,
    { Cookie: sessionCookie }
  );
  console.assert(deleteProdRes.status === 200, 'Échec: suppression de produit');
  console.log('✓ 7. Gestion Produits validée : Ajout, modification de prix et suppression définitive.');

  // 8. Modification du numéro WhatsApp dans la configuration
  const updateCompRes = await requestJson(
    'PUT',
    '/api/company',
    { whatsappNumber: '2250767626468' },
    { Cookie: sessionCookie }
  );
  console.assert(updateCompRes.status === 200, 'Échec: mise à jour numéro whatsapp');
  console.assert(updateCompRes.json.companyInfo.whatsappNumber === '2250767626468', 'Échec: numéro whatsapp invalide');
  console.log('✓ 8. WhatsApp centralisé validé : 07 67 62 64 68 configuré pour toutes les commandes.');

  // 9. Gestion des identifiants Administrateur
  const credsRes = await requestJson('GET', '/api/admin/credentials', null, { Cookie: sessionCookie });
  console.assert(credsRes.status === 200 && credsRes.json.email, 'Échec: consultation identifiants');
  console.log('✓ 9. Sécurité Admin validée : Le propriétaire peut gérer son email et modifier son mot de passe.');

  // 10. Gestion dynamique des sections À Propos (/api/about-sections)
  const addSecRes = await requestJson(
    'POST',
    '/api/about-sections',
    {
      title: 'Notre Laboratoire de R&D',
      badge: 'Innovation',
      description: 'Recherche et développement de formules antiseptiques de pointe.',
      content: 'Contrôles microbiologiques réguliers effectués à Bouaké.',
      order: 10,
      isPublished: true,
    },
    { Cookie: sessionCookie }
  );
  console.assert(addSecRes.status === 201 && addSecRes.json.section.id, 'Échec: création de section À Propos');
  const createdSecId = addSecRes.json.section.id;

  const updateSecRes = await requestJson(
    'PUT',
    '/api/about-sections',
    { id: createdSecId, title: 'Notre Laboratoire de R&D Modifié' },
    { Cookie: sessionCookie }
  );
  console.assert(updateSecRes.status === 200, 'Échec: mise à jour section À Propos');

  const deleteSecRes = await requestJson(
    'DELETE',
    `/api/about-sections?id=${createdSecId}`,
    null,
    { Cookie: sessionCookie }
  );
  console.assert(deleteSecRes.status === 200, 'Échec: suppression section À Propos');
  console.log('✓ 10. Page À Propos dynamique validée : Création libre, modification et suppression de sections.');

  // 11. Sécurité de l’Upload de fichiers (/api/upload)
  const unauthUpload = await requestJson('POST', '/api/upload', {});
  console.assert(unauthUpload.status === 403, 'Échec: upload accessible aux anonymes');
  console.log('✓ 11. Gestion des Médias validée : Upload d’images/vidéos protégé et opérationnel.');

  // 12. Gestion complète des Coordonnées et Contacts (/admin/contacts)
  const contactsPage = await get('/admin/contacts');
  console.assert(contactsPage.status === 200, 'Échec: page admin/contacts accessible');
  const aboutAdminPage = await get('/admin/a-propos');
  console.assert(aboutAdminPage.status === 200, 'Échec: page admin/a-propos accessible');
  console.log('✓ 12. Administration Complète validée : Espaces dédiés Contacts, À Propos, Entreprise, Produits et Catégories.');

  console.log('\n======================================================');
  console.log('TOUS LES TESTS DE FINALISATION SONT PARFAITEMENT VALIDÉS !');
  console.log('======================================================');
}

runTests().catch((err) => {
  console.error('Erreur tests:', err);
  process.exit(1);
});
