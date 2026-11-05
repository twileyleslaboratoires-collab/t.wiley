import React from 'react';
import { getDatabase } from '@/lib/storage';
import { getLiveProducts } from '@/lib/products';
import { getLiveCategories } from '@/lib/categories';
import BoutiqueCatalog from '@/components/BoutiqueCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Données dynamiques fraîches

export default async function HomePage() {
  const db = getDatabase();
  const [liveProducts, liveCategories] = await Promise.all([
    getLiveProducts(),
    getLiveCategories(),
  ]);
  const publishedProducts = liveProducts.filter((p) => p.isPublished);

  return (
    <BoutiqueCatalog
      initialProducts={publishedProducts}
      categories={liveCategories}
      companyInfo={db.companyInfo}
    />
  );
}
