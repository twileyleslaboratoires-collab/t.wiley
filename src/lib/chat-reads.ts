import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getDatabase, saveDatabase } from '@/lib/storage';

export interface AdminChatMeta {
  lastMenuOpenedAt: string | null;
  convReads: Record<string, string>; // conversationId -> ISO timestamp
}

// Mémoire vive pour accès rapide
let inMemoryChatMeta: AdminChatMeta = {
  lastMenuOpenedAt: null,
  convReads: {},
};

/**
 * Récupère les métadonnées de lecture de l'administrateur (dernière ouverture du menu, lectures par conversation)
 */
export async function getAdminChatMeta(): Promise<AdminChatMeta> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('company_info')
          .select('social_links')
          .eq('id', 'primary')
          .maybeSingle();

        if (data && data.social_links) {
          const links = data.social_links as any;
          if (links._chat_last_menu_opened || links._chat_admin_reads) {
            inMemoryChatMeta = {
              lastMenuOpenedAt: links._chat_last_menu_opened || inMemoryChatMeta.lastMenuOpenedAt,
              convReads: {
                ...inMemoryChatMeta.convReads,
                ...(links._chat_admin_reads || {}),
              },
            };
          }
        }
      }
    } catch (err) {
      console.warn('Erreur lecture admin chat meta Supabase:', err);
    }
  }

  // Fusion avec la DB locale si présente
  const db = getDatabase();
  if (Array.isArray(db.chatConversations)) {
    for (const conv of db.chatConversations) {
      if (conv.adminLastReadAt && !inMemoryChatMeta.convReads[conv.id]) {
        inMemoryChatMeta.convReads[conv.id] = conv.adminLastReadAt;
      }
    }
  }

  return inMemoryChatMeta;
}

/**
 * Enregistre l'ouverture du menu Chat en Direct par l'administrateur
 * Remet le compteur global du menu à 0
 */
export async function markChatMenuOpened(): Promise<AdminChatMeta> {
  const now = new Date().toISOString();
  inMemoryChatMeta.lastMenuOpenedAt = now;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('company_info')
          .select('social_links')
          .eq('id', 'primary')
          .maybeSingle();

        const existingLinks = (data?.social_links as any) || {};
        const updatedLinks = {
          ...existingLinks,
          _chat_last_menu_opened: now,
        };
        await supabase
          .from('company_info')
          .update({ social_links: updatedLinks })
          .eq('id', 'primary');
      }
    } catch (err) {
      console.warn('Erreur markChatMenuOpened Supabase:', err);
    }
  }

  return inMemoryChatMeta;
}

/**
 * Enregistre la lecture complète d'une conversation par l'administrateur
 * Fait disparaître le compteur de cette conversation
 */
export async function markConversationRead(
  conversationId: string,
  timestamp?: string
): Promise<AdminChatMeta> {
  const now = timestamp || new Date().toISOString();
  inMemoryChatMeta.convReads[conversationId] = now;

  // Mise à jour de la mémoire locale de la conversation
  const db = getDatabase();
  if (Array.isArray(db.chatConversations)) {
    const c = db.chatConversations.find((item) => item.id === conversationId);
    if (c) {
      c.adminLastReadAt = now;
      c.unreadByAdmin = false;
      try {
        saveDatabase(db);
      } catch {}
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('company_info')
          .select('social_links')
          .eq('id', 'primary')
          .maybeSingle();

        const existingLinks = (data?.social_links as any) || {};
        const updatedReads = {
          ...(existingLinks._chat_admin_reads || {}),
          [conversationId]: now,
        };
        const updatedLinks = {
          ...existingLinks,
          _chat_admin_reads: updatedReads,
        };
        await supabase
          .from('company_info')
          .update({ social_links: updatedLinks })
          .eq('id', 'primary');
      }
    } catch (err) {
      console.warn('Erreur markConversationRead Supabase:', err);
    }
  }

  return inMemoryChatMeta;
}

