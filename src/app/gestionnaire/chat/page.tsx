'use client';

import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle,
  RefreshCw,
  Search,
  Sparkles,
  Headphones,
  Phone,
} from 'lucide-react';
import { ChatConversation } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function GestionnaireChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/chat?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data: ChatConversation[] = await res.json();
        if (Array.isArray(data)) {
          setConversations((prev) => {
            // Comparer pour éviter les re-renders inutiles
            const isDiff =
              data.length !== prev.length ||
              JSON.stringify(data.map((c) => ({ id: c.id, count: c.messages.length, up: c.updatedAt }))) !==
                JSON.stringify(prev.map((c) => ({ id: c.id, count: c.messages.length, up: c.updatedAt })));
            return isDiff ? data : prev;
          });

          setSelectedConvId((current) => {
            if (!current && data.length > 0) {
              return data[0].id;
            }
            return current;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchConversations();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // Défilement automatique UNIQUEMENT dans le conteneur interne de la boîte de discussion
  // N'affecte JAMAIS le scroll de la page ou de la fenêtre
  useEffect(() => {
    const currentCount = selectedConv?.messages?.length || 0;
    if (currentCount > prevMsgCountRef.current || selectedConvId) {
      prevMsgCountRef.current = currentCount;
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [selectedConvId, selectedConv?.messages?.length]);

  const handleSendReply = async () => {
    const textToSend = replyText.trim();
    if (!textToSend || !selectedConvId || sending) return;

    setSending(true);
    setReplyText('');

    // Message optimiste affiché instantanément dans la fenêtre du gestionnaire
    const tempMsgId = `temp-reply-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const optimisticMsg = {
      id: tempMsgId,
      sender: 'agent' as const,
      senderName: 'Vous (Gestionnaire T. Wiley)',
      text: textToSend,
      timestamp: nowIso,
      status: 'sending' as const,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            updatedAt: nowIso,
            messages: [...c.messages, optimisticMsg],
          };
        }
        return c;
      })
    );

    if (chatContainerRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          conversationId: selectedConvId,
          text: textToSend,
          sender: 'agent',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConvId ? data.conversation : c))
          );
        }
        showToast('Réponse envoyée au client.', 'success');
      } else {
        showToast('Erreur lors de l’envoi de la réponse.', 'error');
        setReplyText(textToSend);
      }
    } catch {
      showToast('Erreur réseau.', 'error');
      setReplyText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.customerName.toLowerCase().includes(q) ||
      c.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-brand-600" />
              Chat en Direct & Échanges Clients
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Répondez directement aux clients connectés sur le site en temps réel
            </p>
          </div>

          <button
            type="button"
            onClick={fetchConversations}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Interface de Chat Split (Liste à gauche, Discussion à droite) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          {/* Colonne gauche : Liste des conversations */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une conversation..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Aucune conversation pour le moment.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-50/80 border-l-4 border-brand-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        <User className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {conv.customerName}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(conv.updatedAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {lastMsg ? lastMsg.text : 'Discussion ouverte'}
                        </p>
                        {conv.unreadByAdmin && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-black uppercase tracking-wider">
                            Nouveau message
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Colonne droite : Discussion en cours */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-slate-50/40">
            {selectedConv ? (
              <>
                {/* En-tête de la discussion active */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {selectedConv.customerName}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Session ID: {selectedConv.id}</span>
                        {selectedConv.customerPhone && (
                          <span className="text-brand-700 font-semibold">
                            📞 {selectedConv.customerPhone}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 En direct
                  </span>
                </div>

                {/* Fil des messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-h-[480px]">
                  {selectedConv.messages.map((m) => {
                    const isClient = m.sender === 'client';
                    return (
                      <div
                        key={m.id}
                        className={`flex items-start gap-2.5 ${
                          isClient ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {isClient && (
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3.5 rounded-2xl shadow-2xs text-xs ${
                            isClient
                              ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                              : 'bg-brand-700 text-white rounded-tr-xs'
                          }`}
                        >
                          <p className="font-bold text-[10px] mb-1 opacity-75">
                            {isClient ? selectedConv.customerName : 'Vous (Gestionnaire T. Wiley)'}
                          </p>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <span className="text-[9px] block mt-1 opacity-60 text-right">
                            {new Date(m.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!isClient && (
                          <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs mt-0.5">
                            TW
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Zone de réponse du gestionnaire */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Écrivez votre réponse directe au client..."
                      className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                      className="px-5 py-3 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">
                  Sélectionnez une discussion à gauche
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Les messages envoyés par les visiteurs du site s’affichent ici
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

