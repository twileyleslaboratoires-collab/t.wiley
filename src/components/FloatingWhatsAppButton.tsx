'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export default function FloatingWhatsAppButton({ whatsappNumber }: FloatingWhatsAppProps) {
  const url = buildWhatsAppUrl(
    whatsappNumber || '2250767626468',
    'Bonjour, je souhaite obtenir des informations sur vos produits.'
  );

  return (
    <aside
      aria-label="Contact rapide WhatsApp"
      className="fixed bottom-6 left-6 z-40 flex items-center group"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        title="Discuter avec notre service client sur WhatsApp"
        aria-label="Discuter sur WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline font-bold text-sm tracking-wide">
          Besoin d'aide ? WhatsApp
        </span>
      </a>
    </aside>
  );
}

