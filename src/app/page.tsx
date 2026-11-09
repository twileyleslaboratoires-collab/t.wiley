import React from 'react';
import { getDatabase } from '@/lib/storage';
import { getLiveProducts } from '@/lib/products';
import { getLiveCategories } from '@/lib/categories';
import { getLiveCompanyInfo } from '@/lib/company';
import BoutiqueCatalog from '@/components/BoutiqueCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Données dynamiques fraîches

export default async function HomePage() {
  const [liveProducts, liveCategories, liveCompanyInfo] = await Promise.all([
    getLiveProducts(),
    getLiveCategories(),
    getLiveCompanyInfo(),
  ]);
  const publishedProducts = liveProducts.filter((p) => p.isPublished);

  return (
    <BoutiqueCatalog
      initialProducts={publishedProducts}
      categories={liveCategories}
      companyInfo={liveCompanyInfo}
    />
  );
}
