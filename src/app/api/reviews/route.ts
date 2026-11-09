import { NextRequest, NextResponse } from 'next/server';
import { getLiveReviewsForProduct, addLiveReview, getAllLiveReviews } from '@/lib/reviews';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      const reviews = await getLiveReviewsForProduct(productId);
      return NextResponse.json({ success: true, reviews });
    }

    const all = await getAllLiveReviews();
    return NextResponse.json({ success: true, reviews: all });
  } catch (error: any) {
    console.error('Erreur GET /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des avis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, authorName, rating, comment, city } = body || {};

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identifiant du produit manquant' },
        { status: 400 }
      );
    }

    if (!authorName || typeof authorName !== 'string' || authorName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir votre nom (au moins 2 caractères)' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'La note doit être comprise entre 1 et 5 étoiles' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Veuillez laisser un commentaire (au moins 4 caractères)' },
        { status: 400 }
      );
    }

    const review = await addLiveReview({
      productId,
      authorName: authorName.trim(),
      rating: numRating,
      comment: comment.trim(),
      city: typeof city === 'string' ? city.trim() : undefined,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’enregistrement de votre avis' },
      { status: 500 }
    );
  }
}

