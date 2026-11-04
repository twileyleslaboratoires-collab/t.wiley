import React from 'react';
import { getDatabase } from '@/lib/storage';
import { getLiveProducts } from '@/lib/products';
import BoutiqueCatalog from '@/components/BoutiqueCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Données dynamiques fraîches

export default async function HomePage() {
  const db = getDatabase();
  const liveProducts = await getLiveProducts();
  const publishedProducts = liveProducts.filter((p) => p.isPublished);

  return (
    <BoutiqueCatalog
      initialProducts={publishedProducts}
      categories={db.categories}
      companyInfo={db.companyInfo}
    />
  );
}
