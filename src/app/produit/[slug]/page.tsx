import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDatabase } from '@/lib/storage';
import { getLiveProductBySlugOrId, getLiveProducts } from '@/lib/products';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: { slug: string } | Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) return { title: 'Produit non trouvé' };

  const product = await getLiveProductBySlugOrId(slug);

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  return {
    title: `${product.name} | Les Laboratoires T. Wiley`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — ${product.categoryName}`,
      description: product.shortDescription,
      images: [
        {
          url: product.mainImage,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  // 1. Récupération directe du produit à jour (depuis Supabase en priorité)
  const product = await getLiveProductBySlugOrId(slug);

  if (!product || !product.isPublished) {
    notFound();
  }

  const allProducts = await getLiveProducts();
  const db = getDatabase();

  // 2. Produits de la même catégorie (hors produit courant)
  const sameCategoryProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isPublished)
    .slice(0, 4);

  // 3. Produits similaires / Recommandés (hors produit courant et hors même catégorie)
  const similarProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.isPublished &&
        !sameCategoryProducts.some((scp) => scp.id === p.id)
    )
    .slice(0, 4);

  // Données structurées JSON-LD pour le SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: product.price,
      availability:
        product.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        sameCategoryProducts={sameCategoryProducts}
        similarProducts={similarProducts}
        companyInfo={db.companyInfo}
      />
    </>
  );
}
