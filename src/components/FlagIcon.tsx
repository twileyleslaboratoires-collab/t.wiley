import React from 'react';

interface FlagIconProps {
  code: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export default function FlagIcon({ code, className = '', size = 'md' }: FlagIconProps) {
  const c = code.toLowerCase().trim();

  const sizeClasses = {
    sm: 'w-4 h-2.5',
    md: 'w-5 h-3.5',
    lg: 'w-7 h-4.5',
    xl: 'w-9 h-6',
    '2xl': 'w-12 h-8',
    '3xl': 'w-16 h-11',
  }[size];

  const baseClass = `${sizeClasses} rounded-xs shadow-xs overflow-hidden inline-block flex-shrink-0 border border-black/10 align-middle ${className}`;

  switch (c) {
    case 'us':
      return (
        <svg viewBox="0 0 60 40" className={baseClass}>
          <rect width="60" height="40" fill="#B22234" />
          <rect y="3.08" width="60" height="3.08" fill="#fff" />
          <rect y="9.23" width="60" height="3.08" fill="#fff" />
          <rect y="15.38" width="60" height="3.08" fill="#fff" />
          <rect y="21.54" width="60" height="3.08" fill="#fff" />
          <rect y="27.69" width="60" height="3.08" fill="#fff" />
          <rect y="33.85" width="60" height="3.08" fill="#fff" />
          <rect width="26" height="21.54" fill="#3C3B6E" />
          <g fill="#fff">
            <circle cx="4" cy="3.5" r="1.1" />
            <circle cx="10" cy="3.5" r="1.1" />
            <circle cx="16" cy="3.5" r="1.1" />
            <circle cx="22" cy="3.5" r="1.1" />
            <circle cx="7" cy="7.2" r="1.1" />
            <circle cx="13" cy="7.2" r="1.1" />
            <circle cx="19" cy="7.2" r="1.1" />
            <circle cx="4" cy="10.8" r="1.1" />
            <circle cx="10" cy="10.8" r="1.1" />
            <circle cx="16" cy="10.8" r="1.1" />
            <circle cx="22" cy="10.8" r="1.1" />
            <circle cx="7" cy="14.4" r="1.1" />
            <circle cx="13" cy="14.4" r="1.1" />
            <circle cx="19" cy="14.4" r="1.1" />
            <circle cx="4" cy="18" r="1.1" />
            <circle cx="10" cy="18" r="1.1" />
            <circle cx="16" cy="18" r="1.1" />
            <circle cx="22" cy="18" r="1.1" />
          </g>
        </svg>
      );

    case 'ci': // Côte d'Ivoire (Orange, White, Green)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#F77F00" />
          <rect x="10" width="10" height="20" fill="#FFFFFF" />
          <rect x="20" width="10" height="20" fill="#009E60" />
        </svg>
      );

    case 'sn': // Sénégal (Green, Yellow with green star, Red)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#00853F" />
          <rect x="10" width="10" height="20" fill="#FDEF42" />
          <rect x="20" width="10" height="20" fill="#E31B23" />
          <polygon points="15,6.5 16,9.5 19,9.5 16.5,11.5 17.5,14.5 15,12.5 12.5,14.5 13.5,11.5 11,9.5 14,9.5" fill="#00853F" />
        </svg>
      );

    case 'ml': // Mali (Green, Yellow, Red)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#14B53A" />
          <rect x="10" width="10" height="20" fill="#FCD116" />
          <rect x="20" width="10" height="20" fill="#CE1126" />
        </svg>
      );

    case 'bf': // Burkina Faso (Red, Green, Yellow star)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="10" fill="#EF2B2D" />
          <rect y="10" width="30" height="10" fill="#009E49" />
          <polygon points="15,6 16.2,9.8 20,9.8 17,12 18.2,15.8 15,13.4 11.8,15.8 13,12 10,9.8 13.8,9.8" fill="#FCD116" />
        </svg>
      );

    case 'gn': // Guinée (Red, Yellow, Green)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#CE1126" />
          <rect x="10" width="10" height="20" fill="#FCD116" />
          <rect x="20" width="10" height="20" fill="#009460" />
        </svg>
      );

    case 'gh': // Ghana (Red, Yellow with black star, Green)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="6.67" fill="#CE1126" />
          <rect y="6.67" width="30" height="6.67" fill="#FCD116" />
          <rect y="13.34" width="30" height="6.66" fill="#006B3F" />
          <polygon points="15,7 16,9.8 19,9.8 16.5,11.5 17.5,14 15,12.2 12.5,14 13.5,11.5 11,9.8 14,9.8" fill="#000000" />
        </svg>
      );

    case 'tg': // Togo (Green/Yellow stripes, red canton with white star)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="20" fill="#006A4E" />
          <rect y="4" width="30" height="4" fill="#FFCE00" />
          <rect y="12" width="30" height="4" fill="#FFCE00" />
          <rect width="12" height="12" fill="#D21034" />
          <polygon points="6,3.5 6.9,6 9.5,6 7.4,7.5 8.2,10 6,8.5 3.8,10 4.6,7.5 2.5,6 5.1,6" fill="#FFFFFF" />
        </svg>
      );

    case 'bj': // Bénin (Green hoist, yellow & red fly)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="12" height="20" fill="#008751" />
          <rect x="12" width="18" height="10" fill="#FCD116" />
          <rect x="12" y="10" width="18" height="10" fill="#E8112D" />
        </svg>
      );

    case 'cm': // Cameroun (Green, Red with yellow star, Yellow)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#007A5E" />
          <rect x="10" width="10" height="20" fill="#CE1126" />
          <rect x="20" width="10" height="20" fill="#FCD116" />
          <polygon points="15,6.5 16,9.5 19,9.5 16.5,11.5 17.5,14.5 15,12.5 12.5,14.5 13.5,11.5 11,9.5 14,9.5" fill="#FCD116" />
        </svg>
      );

    case 'ga': // Gabon (Green, Yellow, Blue)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="6.67" fill="#009E60" />
          <rect y="6.67" width="30" height="6.67" fill="#FCD116" />
          <rect y="13.34" width="30" height="6.66" fill="#3A75C4" />
        </svg>
      );

    case 'cg': // Congo (Green, yellow diagonal, red)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <polygon points="0,0 20,0 0,20" fill="#009543" />
          <polygon points="20,0 30,0 10,20 0,20" fill="#FBDE4A" />
          <polygon points="30,0 30,20 10,20" fill="#DC241F" />
        </svg>
      );

    case 'cd': // RD Congo (Sky blue, yellow/red diagonal, yellow star)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="20" fill="#007FFF" />
          <polygon points="0,17 26,0 30,0 4,20 0,20" fill="#FCD116" />
          <polygon points="0,18.5 28,0 30,0 2,20 0,20" fill="#CE1126" />
          <polygon points="5,3 6,6 9,6 6.5,8 7.5,11 5,9 2.5,11 3.5,8 1,6 4,6" fill="#FCD116" />
        </svg>
      );

    case 'ne': // Niger (Orange, white with orange disc, green)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="6.67" fill="#E05206" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.34" width="30" height="6.66" fill="#0DB02B" />
          <circle cx="15" cy="10" r="2.8" fill="#E05206" />
        </svg>
      );

    case 'td': // Tchad (Blue, Yellow, Red)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#00205B" />
          <rect x="10" width="10" height="20" fill="#FFCD00" />
          <rect x="20" width="10" height="20" fill="#C8102E" />
        </svg>
      );

    case 'ng': // Nigéria (Green, White, Green)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="10" height="20" fill="#008751" />
          <rect x="10" width="10" height="20" fill="#FFFFFF" />
          <rect x="20" width="10" height="20" fill="#008751" />
        </svg>
      );

    case 'mr': // Mauritanie (Green with red bands and gold crescent/star)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="20" fill="#006233" />
          <rect width="30" height="4" fill="#D01C1F" />
          <rect y="16" width="30" height="4" fill="#D01C1F" />
          <path d="M11,10 A5,5 0 0,0 19,10 A4,4 0 0,1 11,10" fill="#FFD700" />
          <polygon points="15,7 15.6,8.5 17,8.5 15.8,9.5 16.3,11 15,10 13.7,11 14.2,9.5 13,8.5 14.4,8.5" fill="#FFD700" />
        </svg>
      );

    case 'ma': // Maroc (Red with green pentagram)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="20" fill="#C1272D" />
          <polygon
            points="15,5 16.5,9.5 21,9.5 17.5,12 19,16.5 15,13.5 11,16.5 12.5,12 9,9.5 13.5,9.5"
            fill="none"
            stroke="#006233"
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'dz': // Algérie (Green, White, Red crescent and star)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="15" height="20" fill="#006633" />
          <rect x="15" width="15" height="20" fill="#FFFFFF" />
          <circle cx="15" cy="10" r="5" fill="#D21034" />
          <circle cx="16.5" cy="10" r="4" fill="#FFFFFF" />
          <polygon points="17.5,8 18,9.2 19.5,9.2 18.2,10 18.7,11.2 17.5,10.4 16.3,11.2 16.8,10 15.5,9.2 17,9.2" fill="#D21034" />
        </svg>
      );

    case 'tn': // Tunisie (Red, white circle, red crescent & star)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="20" fill="#E70013" />
          <circle cx="15" cy="10" r="5" fill="#FFFFFF" />
          <circle cx="15" cy="10" r="3.8" fill="#E70013" />
          <circle cx="16" cy="10" r="3" fill="#FFFFFF" />
          <polygon points="16,8.5 16.5,9.5 17.5,9.5 16.7,10.2 17,11 16,10.5 15,11 15.3,10.2 14.5,9.5 15.5,9.5" fill="#E70013" />
        </svg>
      );

    case 'eg': // Égypte (Red, White with eagle, Black)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="6.67" fill="#CE1126" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.34" width="30" height="6.66" fill="#000000" />
          <circle cx="15" cy="10" r="1.8" fill="#C09300" />
        </svg>
      );

    case 'rw': // Rwanda (Blue, Yellow, Green with sun)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="10" fill="#00A1DE" />
          <rect y="10" width="30" height="5" fill="#FAD201" />
          <rect y="15" width="30" height="5" fill="#20603D" />
          <circle cx="24" cy="5" r="2.2" fill="#E5A800" />
        </svg>
      );

    case 'ke': // Kenya (Black, Red, Green with white stripes and shield)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="6" fill="#000000" />
          <rect y="6" width="30" height="8" fill="#BB0000" />
          <rect y="14" width="30" height="6" fill="#006600" />
          <rect y="5.5" width="30" height="1" fill="#FFFFFF" />
          <rect y="13.5" width="30" height="1" fill="#FFFFFF" />
          <ellipse cx="15" cy="10" rx="3" ry="5" fill="#000000" />
          <ellipse cx="15" cy="10" rx="1.5" ry="4" fill="#FFFFFF" />
        </svg>
      );

    case 'za': // Afrique du Sud (Green Y, Chili red, Blue, Black triangle, Gold & White borders)
      return (
        <svg viewBox="0 0 30 20" className={baseClass}>
          <rect width="30" height="10" fill="#E03C31" />
          <rect y="10" width="30" height="10" fill="#001489" />
          <polygon points="0,0 12,10 0,20" fill="#000000" />
          <polygon points="0,0 3,0 14,9 14,11 3,20 0,20 11,10" fill="#FFB81C" />
          <polygon points="0,0 6,0 18,10 30,10 30,12 18,12 6,20 0,20 12,10" fill="#FFFFFF" />
          <polygon points="0,0 8,0 18,8 30,8 30,12 18,12 8,20 0,20 10,10" fill="#007749" />
        </svg>
      );

    default:
      return (
        <span className="text-base leading-none" role="img" aria-label={`Drapeau ${code}`}>
          🌍
        </span>
      );
  }
}

