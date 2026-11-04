export type AvailabilityStatus = 'in_stock' | 'on_demand' | 'out_of_stock';

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku?: string; // Référence produit
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categoryName: string;
  price: number; // in FCFA
  originalPrice?: number; // Ancien prix barré en FCFA
  currency: string; // 'FCFA'
  packaging: string; // e.g. "Bidon de 5 Litres", "Carton de 12 x 1L", "Flacon 500 ml"
  mainImage: string;
  images: string[];
  videoUrl?: string; // Lien vidéo (YouTube, Vimeo ou MP4 direct)
  videos?: string[]; // Liste des vidéos (1ère = galerie avec photos, 2ème et suivantes = dans la description)
  showVideo?: boolean;
  order?: number; // Ordre d'affichage
  availability: AvailabilityStatus;
  stockQuantity: number;
  isPublished: boolean;
  isFeatured?: boolean;
  characteristics?: { label: string; value: string }[];
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  isPublished?: boolean;
  productCount?: number;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  images?: string[]; // Liste de plusieurs photos animées automatiquement
  description: string;
  websiteUrl?: string;
  isPublished?: boolean;
  order?: number;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface AboutSection {
  id: string;
  title: string;
  badge?: string;
  description: string;
  content?: string;
  image?: string;
  videoUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyInfo {
  name: string;
  slogan: string;
  activities: string;
  logo: string;
  banner?: string;
  aboutHeroImage?: string;
  description: string;
  whatsappNumber: string; // clean international digits, e.g. "2250767626468"
  enableWhatsAppButton?: boolean; // Activer/Désactiver le bouton WhatsApp
  phone1: string; // 07 67 62 64 68
  phone2: string; // 01 40 98 64 64
  phone3: string; // 27 31 62 41 83
  phoneUS: string; // +1 704 287 2551
  additionalPhones?: string[];
  phone: string; // standard display phone
  email: string; // empty string by default until owner provides it
  additionalEmails?: string[];
  address: string; // "France 1, Feu Pacha, Bouaké, Côte d'Ivoire"
  city: string; // "Bouaké"
  country: string; // "Côte d'Ivoire"
  district?: string; // "France 1, Feu Pacha"
  openingHours: string;
  socialLinks: SocialLinks;
  mission: string;
  vision: string;
  history: string;
  domainActivities: { title: string; description: string; icon?: string }[];
  commitments: { title: string; description: string }[];
  clientSegments: { title: string; description: string }[];
}

export interface ThemeSettings {
  primaryColor: string; // default "#026ac8"
  secondaryColor: string; // default "#0f172a"
  buttonColor: string; // default "#16a34a" (WhatsApp green / Emerald)
  accentColor: string; // default "#eab308" (Gold)
}

export interface AdminCredentials {
  email: string;
  passwordHash?: string;
  password?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'agent' | 'system';
  senderName?: string;
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatConversation {
  id: string;
  customerName: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'closed';
  unreadByAdmin?: boolean;
  unreadByClient?: boolean;
  adminLastReadAt?: string;
  messages: ChatMessage[];
}

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  partners: Partner[];
  aboutSections?: AboutSection[];
  companyInfo: CompanyInfo;
  themeSettings: ThemeSettings;
  adminCredentials?: AdminCredentials;
  chatConversations?: ChatConversation[];
}
