const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables depuis .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const value = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'twileyleslaboratoires@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin2026';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erreur : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log(`🔍 Vérification du compte administrateur dans Supabase (${adminEmail})...`);

  try {
    // 1. Lister les utilisateurs existants
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError.message);
      return;
    }

    const existingUser = usersData.users.find(
      (u) => u.email && u.email.toLowerCase() === adminEmail.toLowerCase()
    );

    if (existingUser) {
      console.log(`ℹ️ L'utilisateur ${adminEmail} existe déjà dans Supabase Auth (ID: ${existingUser.id}).`);
      console.log('🔄 Mise à jour du mot de passe et confirmation de l\'email...');

      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: adminPassword,
          email_confirm: true,
          user_metadata: { role: 'admin', name: 'Administrateur T. Wiley' },
        }
      );

      if (updateError) {
        console.error('❌ Erreur mise à jour utilisateur:', updateError.message);
      } else {
        console.log(`✅ Compte administrateur mis à jour avec succès dans Supabase !`);
      }
    } else {
      console.log(`➕ Création du nouvel utilisateur administrateur dans Supabase Auth...`);

      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'admin', name: 'Administrateur T. Wiley' },
      });

      if (createError) {
        console.error('❌ Erreur création utilisateur:', createError.message);
      } else {
        console.log(`✅ Compte administrateur créé avec succès dans Supabase Auth !`);
        console.log(`   ID Utilisateur : ${createData.user.id}`);
        console.log(`   Email : ${createData.user.email}`);
        console.log(`   Email confirmé : ${createData.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      }
    }
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
  }
}

main();

