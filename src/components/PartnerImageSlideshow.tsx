'use client';

import React, { useState, useEffect } from 'react';

interface PartnerImageSlideshowProps {
  images?: string[];
  fallbackImage: string;
  alt: string;
  className?: string;
  intervalMs?: number;
}

export default function PartnerImageSlideshow({
  images,
  fallbackImage,
  alt,
  className = '',
  intervalMs = 3500,
}: PartnerImageSlideshowProps) {
  // Liste des images nettoyée
  const validImages = React.useMemo(() => {
    const list = Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [];
    if (fallbackImage && !list.includes(fallbackImage)) {
      list.unshift(fallbackImage);
    }
    return list.length > 0 ? list : [fallbackImage || '/placeholder.png'];
  }, [images, fallbackImage]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Défilement automatique si plus d'une photo
  useEffect(() => {
    if (validImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [validImages.length, intervalMs]);

  if (validImages.length <= 1) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[0]}
          alt={alt}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      {validImages.map((imgUrl, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={`${imgUrl}-${idx}`}
            className={`absolute inset-0 flex items-center justify-center p-2 transition-all duration-1000 ease-in-out ${
              isActive
                ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                : 'opacity-0 scale-95 z-0 pointer-events-none'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={`${alt} - photo ${idx + 1}`}
              className="max-h-full max-w-full object-contain drop-shadow-xs"
            />
          </div>
        );
      })}
    </div>
  );
}

