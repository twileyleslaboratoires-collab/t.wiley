/**
 * Script de migration et synchronisation automatique de database.json vers Supabase
 * Usage : node scripts/migrate-to-supabase.js
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Chargement léger de .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('https://')) {
  console.error('❌ Erreur : Supabase URL ou Clé API manquante dans .env.local');
  console.log('Veuillez renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

async function migrate() {
  console.log('🚀 Début de la synchronisation vers Supabase...');

  // 1. Catégories
  if (db.categories?.length) {
    console.log(`📦 Synchronisation de ${db.categories.length} catégories...`);
    for (const cat of db.categories) {
      const { error } = await supabase.from('categories').upsert({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        order: cat.order || 0,
      });
      if (error) console.error(`Erreur catégorie ${cat.name}:`, error.message);
    }
  }

  // 2. Produits
  if (db.products?.length) {
    console.log(`🧼 Synchronisation de ${db.products.length} produits...`);
    for (const p of db.products) {
      const { error } = await supabase.from('products').upsert({
        id: p.id,
        slug: p.slug,
        name: p.name,
        short_description: p.shortDescription,
        full_description: p.fullDescription,
        category_id: p.categoryId,
        category_name: p.categoryName,
        price: p.price,
        currency: p.currency || 'FCFA',
        packaging: p.packaging,
        main_image: p.mainImage,
        images: p.images || [],
        availability: p.availability || 'in_stock',
        stock_quantity: p.stockQuantity || 0,
        is_published: p.isPublished !== false,
        is_featured: p.isFeatured || false,
        characteristics: p.characteristics || [],
        additional_info: p.additionalInfo || null,
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: p.updatedAt || new Date().toISOString(),
      });
      if (error) console.error(`Erreur produit ${p.name}:`, error.message);
    }
  }

  // 3. Partenaires
  if (db.partners?.length) {
    console.log(`🤝 Synchronisation de ${db.partners.length} partenaires...`);
    for (const part of db.partners) {
      const { error } = await supabase.from('partners').upsert({
        id: part.id,
        name: part.name,
        logo: part.logo,
        description: part.description,
        website_url: part.websiteUrl || null,
      });
      if (error) console.error(`Erreur partenaire ${part.name}:`, error.message);
    }
  }

  // 4. Infos Entreprise
  if (db.companyInfo) {
    console.log(`🏢 Synchronisation des informations de l'entreprise...`);
    const c = db.companyInfo;
    const { error } = await supabase.from('company_info').upsert({
      id: 'primary',
      name: c.name,
      slogan: c.slogan,
      logo: c.logo,
      about_hero_image: c.aboutHeroImage || null,
      description: c.description,
      whatsapp_number: c.whatsappNumber,
      phone: c.phone || c.phone1,
      email: c.email || '',
      address: c.address,
      opening_hours: c.openingHours,
      social_links: c.socialLinks || {},
      mission: c.mission,
      vision: c.vision,
      history: c.history,
      domain_activities: c.domainActivities || [],
      commitments: c.commitments || [],
      client_segments: c.clientSegments || [],
      updated_at: new Date().toISOString(),
    });
    if (error) console.error(`Erreur company_info:`, error.message);
  }

  // 5. Sections À Propos
  if (db.aboutSections?.length) {
    console.log(`📄 Synchronisation de ${db.aboutSections.length} sections À Propos...`);
    for (const sec of db.aboutSections) {
      const { error } = await supabase.from('about_sections').upsert({
        id: sec.id,
        title: sec.title,
        badge: sec.badge,
        description: sec.description,
        content: sec.content,
        image: sec.image,
        video_url: sec.videoUrl || null,
        order: sec.order || 1,
        is_published: sec.isPublished !== false,
      });
      if (error) console.error(`Erreur section ${sec.title}:`, error.message);
    }
  }

  console.log('✅ Migration vers Supabase terminée avec succès !');
}

migrate().catch(console.error);
