import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { ChatConversation, ChatMessage } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function sanitizeText(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Récupère une conversation spécifique avec tous ses messages depuis Supabase
 */
async function fetchConversationFromSupabase(conversationId: string): Promise<ChatConversation | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getServiceSupabase();
    if (!supabase) return null;

    const { data: convData, error: convErr } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (convErr || !convData) return null;

    const { data: messagesData, error: msgErr } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgErr) return null;

    const messages: ChatMessage[] = (messagesData || []).map((m: any) => ({
      id: m.id,
      sender: m.sender as 'client' | 'agent',
      senderName: m.sender_name || (m.sender === 'client' ? convData.customer_name : 'Conseiller T. Wiley'),
      text: m.text,
      timestamp: m.created_at,
      status: 'sent',
    }));

    return {
      id: convData.id,
      customerName: convData.customer_name,
      customerPhone: convData.customer_phone || undefined,
      createdAt: convData.created_at,
      updatedAt: convData.updated_at,
      status: 'active',
      unreadByAdmin: false,
      unreadByClient: false,
      messages,
    };
  } catch (err) {
    console.warn('Erreur lecture Supabase conversation:', err);
    return null;
  }
}

/**
 * Récupère toutes les conversations avec leurs messages depuis Supabase
 */
async function fetchAllConversationsFromSupabase(): Promise<ChatConversation[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getServiceSupabase();
    if (!supabase) return [];

    const { data: convsData, error: convErr } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (convErr || !convsData || convsData.length === 0) return [];

    const { data: msgsData, error: msgErr } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    const msgMap = new Map<string, ChatMessage[]>();
    for (const m of msgsData || []) {
      const convId = m.conversation_id;
      if (!msgMap.has(convId)) {
        msgMap.set(convId, []);
      }
      msgMap.get(convId)!.push({
        id: m.id,
        sender: m.sender as 'client' | 'agent',
        senderName: m.sender_name,
        text: m.text,
        timestamp: m.created_at,
        status: 'sent',
      });
    }

    return convsData.map((c: any) => ({
      id: c.id,
      customerName: c.customer_name,
      customerPhone: c.customer_phone || undefined,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      status: 'active',
      messages: msgMap.get(c.id) || [],
    }));
  } catch (err) {
    console.warn('Erreur lecture Supabase all conversations:', err);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');

    // 1. Accès à une conversation spécifique (visiteur ou administrateur)
    if (conversationId) {
      const sanitizedId = sanitizeText(conversationId);

      // Priorité 1 : récupération directe et fraîche depuis Supabase
      let conv = await fetchConversationFromSupabase(sanitizedId);

      // Priorité 2 : repli sur la base de données locale si non trouvée dans Supabase
      const db = getDatabase();
      const localConversations: ChatConversation[] = db.chatConversations || [];
      const localConv = localConversations.find((c) => c.id === sanitizedId);

      if (!conv && localConv) {
        conv = localConv;
      } else if (conv && localConv) {
        // Fusionner si la mémoire locale a un message plus récent
        const supaMsgIds = new Set(conv.messages.map((m) => m.id));
        for (const lm of localConv.messages) {
          if (!supaMsgIds.has(lm.id)) {
            conv.messages.push(lm);
          }
        }
        conv.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }

      // Synchroniser la mémoire locale avec la conversation mise à jour
      if (conv) {
        if (!Array.isArray(db.chatConversations)) {
          db.chatConversations = [];
        }
        const existingIdx = db.chatConversations.findIndex((c) => c.id === sanitizedId);
        if (existingIdx >= 0) {
          db.chatConversations[existingIdx] = conv;
        } else {
          db.chatConversations.unshift(conv);
        }
        try {
          saveDatabase(db);
        } catch {
          // Toléré
        }

        return NextResponse.json(conv, { headers: NO_CACHE_HEADERS });
      }

      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // 2. Accès à la liste complète de toutes les conversations : RÉSERVÉ STRICTEMENT À L'ADMINISTRATEUR
    if (!isUserAdmin()) {
      return NextResponse.json(
        { error: 'Accès non autorisé à la liste des conversations.' },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    // Récupérer depuis Supabase et fusionner avec le local
    const supaConversations = await fetchAllConversationsFromSupabase();
    const db = getDatabase();
    const localConversations: ChatConversation[] = db.chatConversations || [];

    const mergedMap = new Map<string, ChatConversation>();

    // Insérer d'abord les locales
    for (const lc of localConversations) {
      mergedMap.set(lc.id, lc);
    }

    // Mettre à jour avec Supabase (prioritaire car partagé entre tous les serveurs Vercel)
    for (const sc of supaConversations) {
      const local = mergedMap.get(sc.id);
      if (!local) {
        mergedMap.set(sc.id, sc);
      } else {
        // Fusionner les messages
        const msgMap = new Map<string, ChatMessage>();
        for (const m of local.messages) msgMap.set(m.id, m);
        for (const m of sc.messages) msgMap.set(m.id, m);
        const sortedMsgs = Array.from(msgMap.values()).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        mergedMap.set(sc.id, {
          ...sc,
          customerName: sc.customerName || local.customerName,
          customerPhone: sc.customerPhone || local.customerPhone,
          unreadByAdmin: local.unreadByAdmin ?? sc.unreadByAdmin,
          messages: sortedMsgs,
        });
      }
    }

    const sorted = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Mettre à jour la mémoire locale
    db.chatConversations = sorted;
    try {
      saveDatabase(db);
    } catch {
      // Toléré
    }

    return NextResponse.json(sorted, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur GET /api/chat:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversation manquant.' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const db = getDatabase();
    if (!Array.isArray(db.chatConversations)) {
      db.chatConversations = [];
    }

    const now = new Date().toISOString();
    let conv = db.chatConversations.find((c) => c.id === conversationId);

    if (conv) {
      conv.unreadByAdmin = false;
      conv.adminLastReadAt = now;
    } else {
      conv = {
        id: conversationId,
        customerName: 'Client',
        createdAt: now,
        updatedAt: now,
        status: 'active',
        unreadByAdmin: false,
        adminLastReadAt: now,
        messages: [],
      };
      db.chatConversations.push(conv);
    }

    try {
      saveDatabase(db);
    } catch {}

    return NextResponse.json({ success: true, conversationId, adminLastReadAt: now }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur PATCH /api/chat:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, text, sender = 'client', customerName, customerPhone } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Le texte du message est requis' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    // Protection : seul un administrateur authentifié peut envoyer des messages en tant qu'agent
    if (sender === 'agent' && !isUserAdmin()) {
      return NextResponse.json(
        { error: 'Action non autorisée : droits administrateur requis pour répondre en tant qu’agent.' },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    // Assainissement et limitation de longueur (anti-DoS et anti-XSS)
    const sanitizedText = sanitizeText(text).substring(0, 2000);
    const sanitizedName = customerName ? sanitizeText(String(customerName)).substring(0, 100) : '';
    const sanitizedPhone = customerPhone ? sanitizeText(String(customerPhone)).substring(0, 30) : '';
    const sanitizedConvId = conversationId ? sanitizeText(String(conversationId)).substring(0, 80) : '';

    if (!sanitizedText) {
      return NextResponse.json({ error: 'Message invalide après assainissement' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const db = getDatabase();
    if (!Array.isArray(db.chatConversations)) {
      db.chatConversations = [];
    }

    const now = new Date().toISOString();
    let conv: ChatConversation | null = null;

    // 1. Tenter de charger la conversation existante (d'abord Supabase, puis local)
    if (sanitizedConvId) {
      conv = await fetchConversationFromSupabase(sanitizedConvId);
      if (!conv) {
        conv = db.chatConversations.find((c) => c.id === sanitizedConvId) || null;
      }
    }

    // 2. Si elle n'existe pas encore, la créer
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
      if (sanitizedName && (conv.customerName.startsWith('Client #') || !conv.customerName)) {
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

      // Mettre à jour l'entrée correspondante dans le tableau local
      const localIdx = db.chatConversations.findIndex((c) => c.id === conv!.id);
      if (localIdx >= 0) {
        db.chatConversations[localIdx] = conv;
      } else {
        db.chatConversations.unshift(conv);
      }
    }

    // 3. Ajouter le nouveau message
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender as 'client' | 'agent',
      senderName: sender === 'client' ? conv.customerName : 'Conseiller T. Wiley',
      text: sanitizedText,
      timestamp: now,
      status: 'sent',
    };
    conv.messages.push(newMsg);

    // 4. Sauvegarde dans la base locale
    try {
      saveDatabase(db);
    } catch (saveErr) {
      console.warn('Sauvegarde storage DB avertissement:', saveErr);
    }

    // 5. Persistance immédiate et robuste dans Supabase
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
            id: newMsg.id,
            conversation_id: conv.id,
            sender: newMsg.sender,
            sender_name: newMsg.senderName,
            text: newMsg.text,
            created_at: newMsg.timestamp,
          });
        }
      } catch (supaSyncErr) {
        console.warn('Erreur synchro Supabase chat (toléré):', supaSyncErr);
      }
    }

    return NextResponse.json({ success: true, conversation: conv }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur POST /api/chat:', error);
    return NextResponse.json({ error: 'Erreur lors de l’envoi' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
