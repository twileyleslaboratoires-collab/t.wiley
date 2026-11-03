import { Product, CartItem } from '@/types';

/**
 * Nettoie et formate un numéro pour l'API WhatsApp officielle (wa.me)
 * Supprime les espaces, les tirets, les parenthèses et le symbole '+'
 * Exemple: "+225 07 12 34 56 78" -> "2250712345678"
 */
export function sanitizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Formate un montant en FCFA avec séparateur de milliers
 * Exemple: 15000 -> "15 000 FCFA"
 */
export function formatPriceFCFA(amount: number): string {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Génère le message WhatsApp pour une commande individuelle de produit
 * Récupère également la photo et le lien du produit pour que WhatsApp affiche un aperçu visuel
 */
export function generateSingleProductOrderMessage(
  product: Product,
  quantity: number,
  productUrl?: string,
  imageUrl?: string
): string {
  const unitPrice = formatPriceFCFA(product.price);
  const totalEstimated = formatPriceFCFA(product.price * quantity);

  let msg =
    `Bonjour, je souhaite passer une commande.\n\n` +
    `📦 Produit : ${product.name}\n` +
    `🔢 Quantité : ${quantity}\n` +
    `💰 Prix unitaire : ${unitPrice}\n` +
    `💵 Total estimé : ${totalEstimated}\n`;

  if (imageUrl) {
    msg += `📸 Photo : ${imageUrl}\n`;
  }
  if (productUrl) {
    msg += `🔗 Fiche produit : ${productUrl}\n`;
  }

  msg += `\nMerci de me confirmer la disponibilité et les modalités de livraison.`;
  return msg;
}

/**
 * Génère le message WhatsApp pour une commande groupée via le panier
 */
export function generateCartOrderMessage(items: CartItem[]): string {
  const lines = items.map((item, index) => {
    const itemTotal = formatPriceFCFA(item.product.price * item.quantity);
    return `${index + 1}. ${item.product.name} — Quantité : ${item.quantity} — Total : ${itemTotal}.`;
  });

  const grandTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    `Bonjour, je souhaite passer la commande suivante :\n\n` +
    `${lines.join('\n')}\n\n` +
    `Total estimé : ${formatPriceFCFA(grandTotal)}.\n\n` +
    `Merci de me confirmer la disponibilité et les modalités de livraison.`
  );
}

/**
 * Construit l'URL officielle WhatsApp
 * Utilise api.whatsapp.com pour éviter le blocage "Lancement de la discussion"
 * sur l'application Desktop et garantir l'ouverture fluide sur Mobile et Web.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = sanitizeWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
}

