const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

const current = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

current.companyInfo = {
  ...current.companyInfo,
  name: 'Les Laboratoires T. Wiley',
  slogan: 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique',
  activities: 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique',
  logo: '/logo-laboratoires-t-wiley.jpg',
  description: 'Les Laboratoires T. Wiley sont spécialisés dans la recherche, la formulation et la distribution de solutions certifiées en cosmétiques, détergences hospitalières, entretien domestique et mécanique industrielle.',
  phone1: '07 67 62 64 68',
  phone2: '01 40 98 64 64',
  phone3: '27 31 62 41 83',
  phoneUS: '+1 704 287 2551',
  phone: '07 67 62 64 68',
  whatsappNumber: '2250767626468',
  email: '', // À renseigner ultérieurement par le propriétaire
  address: 'France 1, Feu Pacha, Bouaké, Côte d\'Ivoire',
  city: 'Bouaké',
  country: 'Côte d\'Ivoire',
  openingHours: 'Lundi au Vendredi : 08h00 - 18h00 | Samedi : 08h30 - 14h00',
};

current.themeSettings = current.themeSettings || {
  primaryColor: '#026ac8',
  secondaryColor: '#0f172a',
  buttonColor: '#16a34a',
  accentColor: '#d97706',
};

current.adminCredentials = current.adminCredentials || {
  email: 'admin@laboratoires-twiley.ci',
  password: 'admin2026',
  updatedAt: new Date().toISOString(),
};

fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2), 'utf8');
console.log('Fichier data/database.json synchronisé avec succès pour Les Laboratoires T. Wiley !');

