import React from 'react';
import { getDatabase } from '@/lib/storage';
import BoutiqueCatalog from '@/components/BoutiqueCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Données dynamiques fraîches

export default function HomePage() {
  const db = getDatabase();
  const publishedProducts = db.products.filter((p) => p.isPublished);

  return (
    <BoutiqueCatalog
      initialProducts={publishedProducts}
      categories={db.categories}
      companyInfo={db.companyInfo}
    />
  );
}

