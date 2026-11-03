import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { ChatConversation, ChatMessage } from '@/types';

export const dynamic = 'force-dynamic';

function getSmartAutoReply(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes('bonjour') || t.includes('salut') || t.includes('bonsoir') || t.includes('hello')) {
    return "Bonjour et bienvenue aux Laboratoires T. Wiley ! 👋 Un conseiller clientèle a bien reçu votre message et va vous répondre sous peu. Comment pouvons-nous vous assister aujourd'hui ?";
  }
  if (t.includes('livraison') || t.includes('délai') || t.includes('delai') || t.includes('expedition') || t.includes('expédier')) {
    return "🚚 Nos expéditions sont rapides : livraison express disponible à Abidjan et dans tout l'intérieur du pays (Bouaké, Yamoussoukro, San-Pedro, etc.). Les modalités précises sont convenues lors de la commande.";
  }
  if (t.includes('prix') || t.includes('tarif') || t.includes('coût') || t.includes('cout') || t.includes('combien')) {
    return "💰 Tous nos tarifs sont affichés en FCFA sur le catalogue en ligne. Pour les achats en gros ou fûts industriels, nous proposons des tarifs dégressifs. Notre conseiller va vous détailler nos offres.";
  }
  if (t.includes('commander') || t.includes('commande') || t.includes('acheter') || t.includes('panier')) {
    return "🛒 Pour commander, vous pouvez cliquer directement sur 'Commander via WhatsApp' sur n'importe quel produit ou dans votre panier. Notre équipe commerciale WhatsApp valide immédiatement votre commande !";
  }
  if (t.includes('adresse') || t.includes('bouaké') || t.includes('bouake') || t.includes('situé') || t.includes('situe') || t.includes('localisation')) {
    return "📍 Notre siège et laboratoire sont situés à Bouaké, quartier France 1, Feu Pacha, Côte d'Ivoire. Nous desservons tout le territoire ivoirien et la sous-région.";
  }
  if (t.includes('fût') || t.includes('fut') || t.includes('20l') || t.includes('industriel') || t.includes('dégraissant') || t.includes('degraissant')) {
    return "🏭 Nous disposons d'importants stocks permanents en fûts industriels de 20L et bidons techniques pour ateliers, garages, usines et collectivités.";
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const conversations: ChatConversation[] = db.chatConversations || [];
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');

    if (conversationId) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) {
        return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
      }
      return NextResponse.json(conv);
    }

    // Vue globale pour l'administration (triée par activité la plus récente)
    const sorted = [...conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Erreur GET /api/chat:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, text, sender = 'client', customerName, customerPhone } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Le texte du message est requis' }, { status: 400 });
    }

    const db = getDatabase();
    if (!Array.isArray(db.chatConversations)) {
      db.chatConversations = [];
    }

    const now = new Date().toISOString();
    let conv: ChatConversation | undefined;

    if (conversationId) {
      conv = db.chatConversations.find((c) => c.id === conversationId);
    }

    const isNew = !conv;

    if (!conv) {
      const newId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      conv = {
        id: newId,
        customerName: customerName || `Client #${newId.slice(-4).toUpperCase()}`,
        customerPhone: customerPhone || '',
        createdAt: now,
        updatedAt: now,
        status: 'active',
        unreadByAdmin: sender === 'client',
        unreadByClient: sender === 'agent',
        messages: [],
      };
      db.chatConversations.unshift(conv);
    } else {
      conv.updatedAt = now;
      if (customerName && conv.customerName.startsWith('Client #')) {
        conv.customerName = customerName;
      }
      if (customerPhone) {
        conv.customerPhone = customerPhone;
      }
      if (sender === 'client') {
        conv.unreadByAdmin = true;
      } else {
        conv.unreadByClient = true;
        conv.unreadByAdmin = false;
      }
    }

    // Ajouter le message utilisateur
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender as 'client' | 'agent',
      senderName: sender === 'client' ? conv.customerName : 'Conseiller T. Wiley',
      text: text.trim(),
      timestamp: now,
    };
    conv.messages.push(userMsg);

    // Si nouveau client ou première question, générer une réponse instantanée d'accueil ou d'assistance intelligente
    if (sender === 'client') {
      const autoReplyText = isNew
        ? "Bonjour et bienvenue aux Laboratoires T. Wiley ! 👋 Un conseiller clientèle a bien reçu votre message. Posez-nous votre question, nous sommes en ligne pour vous répondre."
        : getSmartAutoReply(text.trim());

      if (autoReplyText) {
        const autoMsg: ChatMessage = {
          id: `msg-auto-${Date.now()}`,
          sender: 'agent',
          senderName: 'Assistant T. Wiley',
          text: autoReplyText,
          timestamp: new Date(Date.now() + 500).toISOString(),
        };
        conv.messages.push(autoMsg);
      }
    }

    saveDatabase(db);

    return NextResponse.json({ success: true, conversation: conv });
  } catch (error) {
    console.error('Erreur POST /api/chat:', error);
    return NextResponse.json({ error: 'Erreur lors de l’envoi' }, { status: 500 });
  }
}

