import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { ChatConversation, ChatMessage } from '@/types';
import { getAdminChatMeta } from '@/lib/chat-reads';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  if (!isUserAdmin()) {
    return NextResponse.json({ unreadCount: 0, unreadConversations: 0, details: {} }, { headers: NO_CACHE_HEADERS });
  }

  try {
    const meta = await getAdminChatMeta();
    const menuOpenTime = meta.lastMenuOpenedAt ? new Date(meta.lastMenuOpenedAt).getTime() : 0;

    const db = getDatabase();
    const localMap = new Map<string, ChatConversation>();
    for (const c of db.chatConversations || []) {
      localMap.set(c.id, c);
    }

    let conversations: ChatConversation[] = Array.from(localMap.values());

    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const { data: convsData } = await supabase.from('chat_conversations').select('*');
          const { data: msgsData } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true });

          const msgMap = new Map<string, ChatMessage[]>();
          for (const m of msgsData || []) {
            if (!msgMap.has(m.conversation_id)) msgMap.set(m.conversation_id, []);
            msgMap.get(m.conversation_id)!.push({
              id: m.id,
              sender: m.sender as 'client' | 'agent',
              senderName: m.sender_name,
              text: m.text,
              timestamp: m.created_at,
            });
          }

          if (convsData) {
            for (const sc of convsData) {
              const local = localMap.get(sc.id);
              const msgs = msgMap.get(sc.id) || [];
              const adminReadAt = meta.convReads[sc.id] || local?.adminLastReadAt;
              localMap.set(sc.id, {
                id: sc.id,
                customerName: sc.customer_name,
                customerPhone: sc.customer_phone || undefined,
                createdAt: sc.created_at,
                updatedAt: sc.updated_at,
                status: 'active',
                adminLastReadAt: adminReadAt,
                unreadByAdmin: local?.unreadByAdmin,
                messages: msgs,
              });
            }
            conversations = Array.from(localMap.values());
          }
        }
      } catch (e) {
        console.warn('Erreur unread-count Supabase:', e);
      }
    }

    let unreadCount = 0;
    let unreadConversations = 0;
    const details: Record<string, number> = {};

    for (const conv of conversations) {
      const msgs = conv.messages || [];
      if (msgs.length === 0) continue;

      const lastReadIso = meta.convReads[conv.id] || conv.adminLastReadAt;
      const lastReadTime = lastReadIso ? new Date(lastReadIso).getTime() : 0;

      // 1. Compteur individuel de cette conversation pour la liste clients
      const unreadMsgsForConv = msgs.filter((m) => {
        if (m.sender !== 'client') return false;
        return new Date(m.timestamp).getTime() > lastReadTime;
      });

      const countForConv = unreadMsgsForConv.length;
      if (countForConv > 0) {
        details[conv.id] = countForConv;
        unreadConversations += 1;
      }

      // 2. Compteur global pour le menu (uniquement les nouveaux messages reçus depuis l'ouverture du menu et non lus)
      const newSinceMenuOpened = msgs.filter((m) => {
        if (m.sender !== 'client') return false;
        const msgTime = new Date(m.timestamp).getTime();
        return msgTime > Math.max(menuOpenTime, lastReadTime);
      });

      unreadCount += newSinceMenuOpened.length;
    }

    return NextResponse.json(
      {
        unreadCount,
        unreadConversations,
        lastMenuOpenedAt: meta.lastMenuOpenedAt,
        details,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error('Erreur GET /api/chat/unread-count:', err);
    return NextResponse.json({ unreadCount: 0, unreadConversations: 0, details: {} }, { headers: NO_CACHE_HEADERS });
  }
}

