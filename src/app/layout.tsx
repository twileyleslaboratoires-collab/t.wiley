import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChatWidget from '@/components/LiveChatWidget';
import MobileNavigationGuard from '@/components/MobileNavigationGuard';
import IntroScreen from '@/components/IntroScreen';
import { getDatabase } from '@/lib/storage';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const db = getDatabase();
  const info = db.companyInfo;

  return {
    title: {
      template: `%s | ${info.name}`,
      default: `${info.name} — ${info.activities || 'Cosmétiques & Détergences'}`,
    },
    description: info.description,
    keywords: [
      'Les Laboratoires T. Wiley',
      'Laboratoires T. Wiley',
      'cosmétiques',
      'détergences hospitalières',
      'nettoyage domestique',
      'entretien mécanique',
      'Bouaké',
      'Côte d’Ivoire',
      'commande whatsapp',
    ],
    icons: {
      icon: '/logo-laboratoires-t-wiley.jpg',
      apple: '/logo-laboratoires-t-wiley.jpg',
    },
    openGraph: {
      title: info.name,
      description: info.description,
      siteName: info.name,
      locale: 'fr_FR',
      type: 'website',
      images: [
        {
          url: '/logo-laboratoires-t-wiley.jpg',
          width: 800,
          height: 600,
          alt: info.name,
        },
      ],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = getDatabase();
  const companyInfo = db.companyInfo;
  const theme = db.themeSettings || {
    primaryColor: '#026ac8',
    secondaryColor: '#0f172a',
    buttonColor: '#16a34a',
    accentColor: '#d97706',
  };

  const dynamicCss = `
    :root {
      --color-primary: ${theme.primaryColor || '#026ac8'};
      --color-secondary: ${theme.secondaryColor || '#0f172a'};
      --color-btn: ${theme.buttonColor || '#16a34a'};
      --color-accent: ${theme.accentColor || '#d97706'};
    }
  `;

  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preload" href="/logo-laboratoires-t-wiley.jpg" as="image" />
        <link rel="preload" href="/carte-afrique.jpg" as="image" />
        <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-slate-50 text-slate-800`}>
        <IntroScreen logoUrl="/logo-laboratoires-t-wiley.jpg" />
        <ThemeProvider initialTheme={theme}>
          <LanguageProvider>
            <ToastProvider>
              <CartProvider>
                <MobileNavigationGuard />
                <Navbar initialCompanyInfo={companyInfo} />
                <main className="flex-1">
                  {children}
                </main>
                <Footer companyInfo={companyInfo} />
                <LiveChatWidget whatsappNumber={companyInfo.whatsappNumber} />
              </CartProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
