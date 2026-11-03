import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { ChatConversation, ChatMessage } from '@/types';

export const dynamic = 'force-dynamic';

function sanitizeText(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

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

    // 1. Accès à une conversation spécifique (visiteur ou administrateur)
    if (conversationId) {
      const sanitizedId = sanitizeText(conversationId);
      let conv = conversations.find((c) => c.id === sanitizedId);

      // Si non trouvée en mémoire locale, tenter la récupération depuis Supabase
      if (!conv && isSupabaseConfigured()) {
        try {
          const supabase = getServiceSupabase();
          if (supabase) {
            const { data: convData } = await supabase
              .from('chat_conversations')
              .select('*')
              .eq('id', sanitizedId)
              .maybeSingle();

            if (convData) {
              const { data: messagesData } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('conversation_id', sanitizedId)
                .order('created_at', { ascending: true });

              const restoredMessages: ChatMessage[] = (messagesData || []).map((m: any) => ({
                id: m.id,
                sender: m.sender as 'client' | 'agent',
                senderName: m.sender_name || (m.sender === 'client' ? convData.customer_name : 'Conseiller T. Wiley'),
                text: m.text,
                timestamp: m.created_at,
              }));

              conv = {
                id: convData.id,
                customerName: convData.customer_name,
                customerPhone: convData.customer_phone || undefined,
                createdAt: convData.created_at,
                updatedAt: convData.updated_at,
                status: 'active',
                unreadByAdmin: false,
                unreadByClient: false,
                messages: restoredMessages,
              };

              if (!Array.isArray(db.chatConversations)) {
                db.chatConversations = [];
              }
              db.chatConversations.push(conv);
            }
          }
        } catch (supaErr) {
          console.warn('Erreur lecture Supabase chat:', supaErr);
        }
      }

      if (!conv) {
        return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
      }
      return NextResponse.json(conv);
    }

    // 2. Accès à la liste complète de toutes les conversations : RÉSERVÉ STRICTEMENT À L'ADMINISTRATEUR
    if (!isUserAdmin()) {
      return NextResponse.json(
        { error: 'Accès non autorisé à la liste des conversations.' },
        { status: 403 }
      );
    }

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

    // Protection : seul un administrateur authentifié peut envoyer des messages en tant qu'agent
    if (sender === 'agent' && !isUserAdmin()) {
      return NextResponse.json(
        { error: 'Action non autorisée : droits administrateur requis pour répondre en tant qu’agent.' },
        { status: 403 }
      );
    }

    // Assainissement et limitation de longueur (anti-DoS et anti-XSS)
    const sanitizedText = sanitizeText(text).substring(0, 2000);
    const sanitizedName = customerName ? sanitizeText(String(customerName)).substring(0, 100) : '';
    const sanitizedPhone = customerPhone ? sanitizeText(String(customerPhone)).substring(0, 30) : '';
    const sanitizedConvId = conversationId ? sanitizeText(String(conversationId)).substring(0, 80) : '';

    if (!sanitizedText) {
      return NextResponse.json({ error: 'Message invalide après assainissement' }, { status: 400 });
    }

    const db = getDatabase();
    if (!Array.isArray(db.chatConversations)) {
      db.chatConversations = [];
    }

    const now = new Date().toISOString();
    let conv: ChatConversation | undefined;

    if (sanitizedConvId) {
      conv = db.chatConversations.find((c) => c.id === sanitizedConvId);
    }

    const isNew = !conv;

    if (!conv) {
      const newId = sanitizedConvId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      conv = {
        id: newId,
        customerName: sanitizedName || `Client #${newId.slice(-4).toUpperCase()}`,
        customerPhone: sanitizedPhone,
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
      if (sanitizedName && conv.customerName.startsWith('Client #')) {
        conv.customerName = sanitizedName;
      }
      if (sanitizedPhone) {
        conv.customerPhone = sanitizedPhone;
      }
      if (sender === 'client') {
        conv.unreadByAdmin = true;
      } else {
        conv.unreadByClient = true;
        conv.unreadByAdmin = false;
      }
    }

    // Ajouter le message utilisateur assaini
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender as 'client' | 'agent',
      senderName: sender === 'client' ? conv.customerName : 'Conseiller T. Wiley',
      text: sanitizedText,
      timestamp: now,
    };
    conv.messages.push(userMsg);

    let autoMsg: ChatMessage | null = null;

    // Si nouveau client ou première question, réponse automatique
    if (sender === 'client') {
      const autoReplyText = isNew
        ? "Bonjour et bienvenue aux Laboratoires T. Wiley ! 👋 Un conseiller clientèle a bien reçu votre message. Posez-nous votre question, nous sommes en ligne pour vous répondre."
        : getSmartAutoReply(sanitizedText);

      if (autoReplyText) {
        autoMsg = {
          id: `msg-auto-${Date.now()}`,
          sender: 'agent',
          senderName: 'Assistant T. Wiley',
          text: autoReplyText,
          timestamp: new Date(Date.now() + 500).toISOString(),
        };
        conv.messages.push(autoMsg);
      }
    }

    try {
      saveDatabase(db);
    } catch (saveErr) {
      console.warn('Sauvegarde storage DB avertissement:', saveErr);
    }

    // Synchronisation Supabase en arrière-plan (sans bloquer ni crasher l'appel)
    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          await supabase.from('chat_conversations').upsert({
            id: conv.id,
            customer_name: conv.customerName,
            customer_phone: conv.customerPhone || null,
            updated_at: conv.updatedAt,
          });

          await supabase.from('chat_messages').insert({
            id: userMsg.id,
            conversation_id: conv.id,
            sender: userMsg.sender,
            sender_name: userMsg.senderName,
            text: userMsg.text,
            created_at: userMsg.timestamp,
          });

          if (autoMsg) {
            await supabase.from('chat_messages').insert({
              id: autoMsg.id,
              conversation_id: conv.id,
              sender: autoMsg.sender,
              sender_name: autoMsg.senderName,
              text: autoMsg.text,
              created_at: autoMsg.timestamp,
            });
          }
        }
      } catch (supaSyncErr) {
        console.warn('Erreur synchro Supabase chat (toléré):', supaSyncErr);
      }
    }

    return NextResponse.json({ success: true, conversation: conv });
  } catch (error) {
    console.error('Erreur POST /api/chat:', error);
    return NextResponse.json({ error: 'Erreur lors de l’envoi' }, { status: 500 });
  }
}
