import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDatabase } from '@/lib/storage';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = getDatabase();
  const product = db.products.find((p) => p.slug === params.slug && p.isPublished);

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  return {
    title: product.name,
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

export default function ProductDetailPage({ params }: Props) {
  const db = getDatabase();
  const product = db.products.find((p) => p.slug === params.slug && p.isPublished);

  if (!product) {
    notFound();
  }

  // 1. Produits de la même catégorie (hors produit courant)
  const sameCategoryProducts = db.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isPublished)
    .slice(0, 4);

  // 2. Produits similaires / Recommandés (hors produit courant et hors même catégorie pour varier les suggestions)
  const similarProducts = db.products
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

