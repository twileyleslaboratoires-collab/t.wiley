import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Product, Category, CompanyInfo, Partner, ThemeSettings, AdminCredentials, AboutSection } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-cosmetiques',
    slug: 'cosmetiques',
    name: 'Cosmétiques & Soins',
    description: 'Gammes de savons liquides, gels lavants pour les mains, shampoings et lotions hydratantes pour un usage quotidien.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    order: 1,
  },
  {
    id: 'cat-hospitalier',
    slug: 'detergences-hospitalieres',
    name: 'Détergences Hospitalières',
    description: 'Formulations antiseptiques et désinfectantes agréées pour les blocs opératoires, cliniques, laboratoires et cabinets médicaux.',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',
    order: 2,
  },
  {
    id: 'cat-domestique',
    slug: 'nettoyage-domestique',
    name: 'Entretien Domestique',
    description: 'Liquides vaisselle concentrés, gels détartrants WC, désodorisants longue durée et nettoyants cuisine de qualité professionnelle.',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    order: 3,
  },
  {
    id: 'cat-mecanique',
    slug: 'entretien-mecanique',
    name: 'Mécanique & Industrie',
    description: 'Dégraissants lourds, solvants de nettoyage de pièces, décapants d’ateliers et nettoyants haute pression pour moteurs et machines.',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    order: 4,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'detergent-desinfectant-hospitalier-5l',
    name: 'Détergent Désinfectant Hospitalier 5L',
    shortDescription: 'Solution concentrée pour la désinfection et le nettoyage des surfaces médicales, paillasses et sols hospitaliers.',
    fullDescription: 'Élaboré selon les protocoles d’hygiène hospitalière, ce détergent désinfectant élimine efficacement les bactéries et salissures sans altérer les surfaces sensibles. Compatible avec les milieux de soins, cliniques, laboratoires et maternités. Ne nécessite aucun rinçage sauf sur les surfaces en contact direct avec les denrées.',
    categoryId: 'cat-hospitalier',
    categoryName: 'Détergences Hospitalières',
    price: 8500,
    currency: 'FCFA',
    packaging: 'Bidon de 5 Litres PEHD sécurisé',
    mainImage: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
    ],
    availability: 'in_stock',
    stockQuantity: 95,
    isPublished: true,
    isFeatured: true,
    characteristics: [
      { label: 'Conditionnement', value: 'Bidon 5L PEHD' },
      { label: 'Action', value: 'Détergence & désinfection des surfaces médicales' },
      { label: 'Dilution conseillée', value: '0.5% à 1% dans de l’eau' },
      { label: 'Parfum', value: 'Neutre / Discret' },
    ],
    additionalInfo: 'Tenir hors de portée des enfants. Conserver à température ambiante.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    slug: 'degraissant-lourd-mecanique-20l',
    name: 'Dégraissant Lourd Haute Performance Mécanique 20L',
    shortDescription: 'Dégraissant surpuissant formulé pour pièces mécaniques, huiles minérales, cambouis et sols d’ateliers.',
    fullDescription: 'Conçu pour les garages, usines de production, ateliers de maintenance et chantiers, ce dégraissant élimine en profondeur les hydrocarbures cuits et les résidus gras tenaces. Utilisable en fontaine de nettoyage, pulvérisation ou haute pression.',
    categoryId: 'cat-mecanique',
    categoryName: 'Mécanique & Industrie',
    price: 28500,
    currency: 'FCFA',
    packaging: 'Fût renforcé de 20 Litres',
    mainImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    ],
    availability: 'in_stock',
    stockQuantity: 40,
    isPublished: true,
    isFeatured: true,
    characteristics: [
      { label: 'Format', value: 'Fût de 20L avec bonde' },
      { label: 'Application', value: 'Moteurs, chaînes, pièces industrielles, sols de garage' },
      { label: 'Rinçage', value: 'Rinçage obligatoire à l’eau claire' },
    ],
    additionalInfo: 'Port de gants recommandé lors de la manipulation du produit pur.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    slug: 'savon-liquide-doux-mains-soins-5l',
    name: 'Savon Liquide Doux Mains & Soins Dermatologiques 5L',
    shortDescription: 'Lotion lavante cosmétique onctueuse à pH neutre pour un lavage fréquent et respectueux de la peau.',
    fullDescription: 'Formule enrichie en agents hydratants pour la protection du film hydrolipidique de l’épiderme. Idéal pour les recharges de distributeurs sanitaires dans les entreprises, écoles, cliniques et résidences privées.',
    categoryId: 'cat-cosmetiques',
    categoryName: 'Cosmétiques & Soins',
    price: 6500,
    currency: 'FCFA',
    packaging: 'Bidon recharge de 5 Litres',
    mainImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    ],
    availability: 'in_stock',
    stockQuantity: 110,
    isPublished: true,
    isFeatured: true,
    characteristics: [
      { label: 'Format', value: 'Bidon 5L' },
      { label: 'pH', value: '5.5 (neutre pour la peau)' },
      { label: 'Texture', value: 'Crème lavante nacrée onctueuse' },
    ],
    additionalInfo: 'Hypoallergénique, testé sous contrôle de qualité.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    slug: 'liquide-vaisselle-super-concentre-domestique-5l',
    name: 'Liquide Vaisselle Concentré Dégraissant Citron 5L',
    shortDescription: 'Ultra-dégraissant haute efficacité pour vaisselle domestique et batteries de cuisine.',
    fullDescription: 'Formule super concentrée qui dissout instantanément les graisses cuites et résidus tenaces. Mousse riche et persistante au parfum vivifiant de zeste de citron.',
    categoryId: 'cat-domestique',
    categoryName: 'Entretien Domestique',
    price: 4500,
    currency: 'FCFA',
    packaging: 'Bidon ergonomique de 5 Litres',
    mainImage: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
    ],
    availability: 'in_stock',
    stockQuantity: 130,
    isPublished: true,
    isFeatured: true,
    characteristics: [
      { label: 'Volume', value: '5 Litres' },
      { label: 'Action', value: 'Dégraissant actif eau tiède et froide' },
      { label: 'Parfum', value: 'Citron d’Afrique' },
    ],
    additionalInfo: 'Économique : 1 bouchon suffit pour un évier rempli.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_COMPANY_INFO: CompanyInfo = {
  name: 'Les Laboratoires T. Wiley',
  slogan: 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique',
  activities: 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique',
  logo: '/logo-laboratoires-t-wiley.jpg',
  description: 'Les Laboratoires T. Wiley sont spécialisés dans la recherche, la formulation et la commercialisation de produits cosmétiques, détergences hospitalières certifiées, solutions d’hygiène domestique et produits d’entretien mécanique pour particuliers et professionnels.',
  phone1: '07 67 62 64 68',
  phone2: '01 40 98 64 64',
  phone3: '27 31 62 41 83',
  phoneUS: '+1 704 287 2551',
  phone: '07 67 62 64 68',
  whatsappNumber: '2250767626468', // 07 67 62 64 68 au format officiel international
  email: '', // À renseigner ultérieurement par le propriétaire
  address: 'France 1, Feu Pacha, Bouaké, Côte d\'Ivoire',
  city: 'Bouaké',
  country: 'Côte d\'Ivoire',
  openingHours: 'Lundi au Vendredi : 08h00 - 18h00 | Samedi : 08h30 - 14h00',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  },
  mission: 'Concevoir et distribuer des formulations fiables, conformes aux exigences sanitaires les plus strictes, alliant efficacité maximale et accessibilité.',
  vision: 'Être le pôle de référence en Côte d’Ivoire et dans la sous-région pour l’approvisionnement en détergences hospitalières, cosmétiques de soins et dégraissants industriels.',
  history: 'Fondés sur une expertise rigoureuse en chimie appliquée et hygiène environnementale, Les Laboratoires T. Wiley s’affirment comme un partenaire de premier plan pour les structures hospitalières, les entreprises industrielles et les ménages.',
  domainActivities: [
    {
      title: 'Cosmétiques & Soins Corporels',
      description: 'Savons moussants liquides, crèmes lavantes douces et produits d’hygiène corporelle formulés pour préserver l’équilibre cutané.',
    },
    {
      title: 'Détergences Hospitalières',
      description: 'Produits désinfectants à large spectre d’action pour cliniques, hôpitaux, centres de santé, blocs et surfaces sensibles.',
    },
    {
      title: 'Entretien Domestique',
      description: 'Liquides vaisselle surconcentrés, détartrants, détergents sols et désodorisants pour une propreté éclatante de la maison.',
    },
    {
      title: 'Mécanique & Dégraissage Industriel',
      description: 'Dégraissants lourds et solvants techniques pour ateliers de réparation, garages mécaniques, engins et machineries.',
    },
  ],
  commitments: [
    {
      title: 'Conformité & Sécurité',
      description: 'Formulations adaptées aux normes hospitalières et industrielles en vigueur.',
    },
    {
      title: 'Disponibilité Permanente',
      description: 'Production régulière et stock disponible pour satisfaire vos commandes urgentes.',
    },
    {
      title: 'Écoute & Réactivité WhatsApp',
      description: 'Service commercial joignable directement pour traiter vos demandes et planifier vos livraisons.',
    },
    {
      title: 'Formulations Puissantes',
      description: 'Produits hautement concentrés offrant un excellent rendement par unité.',
    },
    {
      title: 'Proximité Régionale',
      description: 'Présence active à Bouaké avec desserte rapide sur l’ensemble du territoire ivoirien et international.',
    },
  ],
  clientSegments: [
    {
      title: 'Cliniques, Hôpitaux & Laboratoires',
      description: 'Détergences hospitalières agréées et savons aseptiques.',
    },
    {
      title: 'Garages, Ateliers & Industries',
      description: 'Dégraissants puissants pour sols d’ateliers, pièces mécaniques et machines.',
    },
    {
      title: 'Hôtels, Restaurants & Collectivités',
      description: 'Solutions pour l’entretien des salles, cuisines professionnelles et sanitaires.',
    },
    {
      title: 'Particuliers & Familles',
      description: 'Produits d’entretien domestique et cosmétiques pour le quotidien.',
    },
  ],
};

export const INITIAL_THEME_SETTINGS: ThemeSettings = {
  primaryColor: '#026ac8',
  secondaryColor: '#0f172a',
  buttonColor: '#16a34a',
  accentColor: '#d97706',
};

export const INITIAL_ADMIN_CREDENTIALS: AdminCredentials = {
  email: 'admin@laboratoires-twiley.ci',
  password: 'admin2026',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'part-1',
    name: 'Partenaires Chimiques Agréés',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    description: 'Réseau de fournisseurs de matières premières purifiées et tensioactifs certifiés.',
    websiteUrl: '',
  },
  {
    id: 'part-2',
    name: 'Réseau Logistique Express Côte d\'Ivoire',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
    description: 'Acheminement rapide de vos fûts industriels et cartons à Bouaké, Abidjan et toutes villes.',
    websiteUrl: '',
  },
];

export const INITIAL_ABOUT_SECTIONS: AboutSection[] = [
  {
    id: 'sec-expertise',
    title: 'Notre Savoir-Faire Industriel & Cosmétique',
    badge: 'Expertise & Rigueur',
    description: 'Une formulation de pointe adaptée aux normes strictes de l’hygiène hospitalière et industrielle.',
    content: 'Les Laboratoires T. Wiley développent et conçoivent des solutions adaptées aux professionnels de santé, aux entreprises industrielles et aux ménages. Chaque formule est soumise à des contrôles qualité rigoureux avant conditionnement.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    order: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sec-engagement',
    title: 'Notre Engagement pour la Santé & l’Environnement',
    badge: 'Qualité Certifiée',
    description: 'Des composants sélectionnés avec rigueur pour une efficacité maximale et une sécurité sans compromis.',
    content: 'Nous privilégions des tensioactifs à haute biodégradabilité et des agents désinfectants conformes aux exigences sanitaires en vigueur en Côte d’Ivoire et à l’international.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    order: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let memoryDb: DatabaseSchema | null = null;

function getTmpDbPath(): string {
  try {
    const os = require('os');
    return path.join(os.tmpdir(), 't-wiley-database.json');
  } catch {
    return '/tmp/t-wiley-database.json';
  }
}

export function ensureDatabase(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  let fileContent = '';
  const tmpFile = getTmpDbPath();

  try {
    if (fs.existsSync(DB_FILE)) {
      fileContent = fs.readFileSync(DB_FILE, 'utf8');
    } else if (fs.existsSync(tmpFile)) {
      fileContent = fs.readFileSync(tmpFile, 'utf8');
    }
  } catch {
    fileContent = '';
  }

  try {
    if (!fileContent) {
      throw new Error('Fichier DB absent');
    }
    const parsed = JSON.parse(fileContent);

    // Fusion avec les nouvelles informations officielles
    const info = parsed.companyInfo || {};
    const mergedCompanyInfo: CompanyInfo = {
      ...INITIAL_COMPANY_INFO,
      ...info,
      name: 'Les Laboratoires T. Wiley',
      logo: info.logo || '/logo-laboratoires-t-wiley.jpg',
      activities: 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique',
      phone1: info.phone1 || '07 67 62 64 68',
      phone2: info.phone2 || '01 40 98 64 64',
      phone3: info.phone3 || '27 31 62 41 83',
      phoneUS: info.phoneUS || '+1 704 287 2551',
      address: info.address || 'France 1, Feu Pacha, Bouaké, Côte d\'Ivoire',
      city: info.city || 'Bouaké',
      country: info.country || 'Côte d\'Ivoire',
      whatsappNumber: info.whatsappNumber || '2250767626468',
      email: info.email || '',
    };

    const finalData: DatabaseSchema = {
      products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_CATEGORIES,
      partners: parsed.partners || INITIAL_PARTNERS,
      aboutSections: parsed.aboutSections || INITIAL_ABOUT_SECTIONS,
      companyInfo: mergedCompanyInfo,
      themeSettings: parsed.themeSettings || INITIAL_THEME_SETTINGS,
      adminCredentials: parsed.adminCredentials || INITIAL_ADMIN_CREDENTIALS,
      chatConversations: Array.isArray(parsed.chatConversations) ? parsed.chatConversations : [],
    };

    memoryDb = finalData;
    return finalData;
  } catch {
    const initialData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      partners: INITIAL_PARTNERS,
      aboutSections: INITIAL_ABOUT_SECTIONS,
      companyInfo: INITIAL_COMPANY_INFO,
      themeSettings: INITIAL_THEME_SETTINGS,
      adminCredentials: INITIAL_ADMIN_CREDENTIALS,
      chatConversations: [],
    };
    memoryDb = initialData;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    } catch {
      try {
        fs.writeFileSync(tmpFile, JSON.stringify(initialData, null, 2), 'utf8');
      } catch {
        // En lecture seule, conservation en mémoire vive
      }
    }
    return initialData;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  memoryDb = data;
  const tmpFile = getTmpDbPath();
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Si process.cwd() est en lecture seule (Vercel Serverless / AWS Lambda EROFS)
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    } catch {
      // Conservation en mémoire vive
    }
  }
}

export function getDatabase(): DatabaseSchema {
  return ensureDatabase();
}
