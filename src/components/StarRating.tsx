'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 1 to 5
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showScore?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
  showScore = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  }[size];

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1 select-none ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = currentVal >= starValue;

          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-115 active:scale-95 transition-transform p-0.5 focus:outline-none'
                  : 'cursor-default'
              }`}
              aria-label={`${starValue} étoile${starValue > 1 ? 's' : ''}`}
            >
              <Star
                className={`${sizeClasses} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.4)]'
                    : 'text-slate-300 fill-slate-100'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-slate-800 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

