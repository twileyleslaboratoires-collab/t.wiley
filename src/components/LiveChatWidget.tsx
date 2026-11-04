'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Headphones,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '@/types';
import { usePathname } from 'next/navigation';

interface LiveChatWidgetProps {
  whatsappNumber?: string;
}

const QUICK_QUESTIONS = [
  'Quels sont vos délais de livraison ?',
  'Avez-vous des fûts de 20L en stock ?',
  'Conseils pour les produits d’hygiène & cosmétiques',
  'Où est situé votre laboratoire ?',
];

export default function LiveChatWidget({ whatsappNumber = '2250767626468' }: LiveChatWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationRef = useRef<ChatConversation | null>(null);
  conversationRef.current = conversation;

  // Défilement automatique doux vers le bas dans la boîte de dialogue
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // 1. Initialisation : chargement depuis le cache local pour un affichage instantané
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedConvId = localStorage.getItem('twiley_chat_conv_id');
    const savedName = localStorage.getItem('twiley_chat_user_name');
    if (savedName) setCustomerName(savedName);

    // Charger les messages pré-mis en cache pour zéro latence
    if (savedConvId) {
      try {
        const cached = localStorage.getItem(`twiley_chat_cache_${savedConvId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.messages)) {
            setConversation(parsed);
          }
        }
      } catch {
        // Ignorer
      }

      // Synchroniser avec le serveur
      fetch(`/api/chat?conversationId=${encodeURIComponent(savedConvId)}&_t=${Date.now()}`, {
        cache: 'no-store',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: ChatConversation | null) => {
          if (data && data.id) {
            setConversation(data);
            try {
              localStorage.setItem(`twiley_chat_cache_${data.id}`, JSON.stringify(data));
            } catch {
              // Ignorer
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // 2. Défilement automatique au chargement ou lors d'un nouveau message
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => scrollToBottom(false), 50);
      setUnreadCount(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, conversation?.messages?.length, scrollToBottom]);

  // 3. Polling intelligent anti-scintillement
  useEffect(() => {
    if (!isOpen || !conversation?.id) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const poll = async () => {
      // Éviter de poll si l'onglet est masqué
      if (typeof document !== 'undefined' && document.hidden) return;

      const currentConv = conversationRef.current;
      if (!currentConv?.id) return;

      try {
        const res = await fetch(`/api/chat?conversationId=${encodeURIComponent(currentConv.id)}&_t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const fresh: ChatConversation = await res.json();
          if (fresh && Array.isArray(fresh.messages)) {
            const currentMsgs = currentConv.messages || [];
            // Ne mettre à jour le state QUE s'il y a un réel changement pour éviter de désactiver l'input
            const isDiff =
              fresh.messages.length !== currentMsgs.length ||
              fresh.updatedAt !== currentConv.updatedAt ||
              (fresh.messages.length > 0 &&
                fresh.messages[fresh.messages.length - 1].id !== currentMsgs[currentMsgs.length - 1]?.id);

            if (isDiff) {
              setConversation(fresh);
              try {
                localStorage.setItem(`twiley_chat_cache_${fresh.id}`, JSON.stringify(fresh));
              } catch {
                // Toléré
              }
            }
          }
        }
      } catch {
        // En cas d'aléa réseau temporaire, maintenir l'affichage local sans crasher
      }
    };

    pollIntervalRef.current = setInterval(poll, 3500);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, conversation?.id]);

  // 4. Gestion douce du bouton retour mobile
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;

    let pushed = false;
    try {
      window.history.pushState({ twileyChatOpen: true }, '');
      pushed = true;
    } catch {
      // Ignorer
    }

    const handlePopState = (e: PopStateEvent) => {
      setIsOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pushed && window.history.state?.twileyChatOpen) {
        try {
          window.history.back();
        } catch {
          // Ignorer
        }
      }
    };
  }, [isOpen]);

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  // 5. Envoi avec mise à jour optimiste immédiate (affiché à la seconde 0)
  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || loading) return;

    const currentConv = conversationRef.current;
    const convId = currentConv?.id || (typeof window !== 'undefined' ? localStorage.getItem('twiley_chat_conv_id') : null);

    // Message optimiste affiché instantanément
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const nowIso = new Date().toISOString();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: 'client',
      senderName: customerName.trim() || 'Vous',
      text: msg,
      timestamp: nowIso,
      status: 'sending',
    };

    // Mettre à jour l'état local immédiatement
    setConversation((prev) => {
      if (!prev) {
        return {
          id: convId || 'conv-pending',
          customerName: customerName.trim() || 'Client',
          createdAt: nowIso,
          updatedAt: nowIso,
          status: 'active',
          messages: [optimisticMsg],
        };
      }
      return {
        ...prev,
        updatedAt: nowIso,
        messages: [...prev.messages, optimisticMsg],
      };
    });

    setInputText('');
    setLoading(true);
    setTimeout(() => scrollToBottom(true), 40);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          conversationId: convId || undefined,
          text: msg,
          sender: 'client',
          customerName: customerName.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setConversation(data.conversation);
          if (typeof window !== 'undefined') {
            localStorage.setItem('twiley_chat_conv_id', data.conversation.id);
            localStorage.setItem(`twiley_chat_cache_${data.conversation.id}`, JSON.stringify(data.conversation));
            if (customerName.trim()) {
              localStorage.setItem('twiley_chat_user_name', customerName.trim());
            }
          }
        }
      } else {
        // Marquer le message comme en échec
        setConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)),
          };
        });
      }
    } catch (err) {
      console.error('Erreur chat:', err);
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)),
        };
      });
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(true), 40);
    }
  };

  const handleRetryMessage = (failedText: string) => {
    handleSendMessage(failedText);
  };

  // Ne pas afficher le widget flottant dans l'espace administration / gestionnaire
  if (pathname && (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin'))) {
    return null;
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-200 ${
        isOpen
          ? 'inset-x-2 bottom-2 top-14 sm:inset-auto sm:bottom-6 sm:left-6 sm:top-auto'
          : 'bottom-6 left-6'
      }`}
    >
      {/* BOUTON FLOTTANT D'OUVERTURE DU CHAT EN DIRECT */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-brand-700 hover:bg-brand-800 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-300 group border border-white/20"
          title="Ouvrir le Chat en direct avec un conseiller"
          aria-label="Chat en direct"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-extrabold text-xs tracking-wide flex items-center gap-1.5 leading-none">
              <span>Chat en direct</span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">● En ligne</span>
            </p>
            <p className="text-[10px] text-slate-200 font-medium leading-none mt-1">
              Échangez avec nos conseillers
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[11px] font-black flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* BOÎTE DE DIALOGUE DU CHAT EN DIRECT */}
      {isOpen && (
        <div className="w-full sm:w-[380px] h-full sm:h-[540px] max-h-[calc(100dvh-4.5rem)] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* En-tête du Chat */}
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xs relative flex-shrink-0">
                <Headphones className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                  <span>Chat en direct</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                    En ligne
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  Les Laboratoires T. Wiley
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseChat}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Fermer le chat"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zone de discussion (Messages) */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
            {/* Message de bienvenue automatique du support */}
            <div className="flex items-start gap-2 max-w-[88%]">
              <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs mt-0.5">
                TW
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-slate-200 text-slate-800 shadow-2xs space-y-1">
                <p className="font-semibold text-slate-900">
                  Bonjour et bienvenue ! 👋
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Notre équipe est à votre écoute pour vous conseiller sur nos formules certifiées et répondre à vos questions.
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Les Laboratoires T. Wiley • Bouaké, Côte d'Ivoire
                </p>
              </div>
            </div>

            {/* Questions fréquentes suggérées si la discussion débute */}
            {(!conversation || conversation.messages.length <= 1) && (
              <div className="pt-1 pb-2 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Questions fréquentes :
                </p>
                <div className="flex flex-col gap-1.5">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="text-left bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-800 px-3 py-2 rounded-xl text-[11px] font-medium transition-all shadow-2xs"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Historique des messages */}
            {conversation?.messages?.map((msg) => {
              const isClient = msg.sender === 'client';
              const isSending = msg.status === 'sending';
              const isError = msg.status === 'error';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isClient ? 'justify-end' : 'justify-start'}`}
                >
                  {!isClient && (
                    <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs mt-0.5">
                      TW
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-2xs transition-opacity ${
                      isClient
                        ? isError
                          ? 'bg-rose-50 border border-rose-300 text-rose-900 rounded-tr-xs'
                          : 'bg-brand-700 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    } ${isSending ? 'opacity-70' : 'opacity-100'}`}
                  >
                    {!isClient && (
                      <p className="text-[10px] font-bold text-brand-700 mb-0.5">
                        {msg.senderName || 'Conseiller T. Wiley'}
                      </p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span
                        className={`text-[9px] ${
                          isClient
                            ? isError
                              ? 'text-rose-600'
                              : 'text-brand-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isSending && (
                        <RotateCw className="w-2.5 h-2.5 animate-spin text-brand-200" />
                      )}
                      {isError && (
                        <button
                          type="button"
                          onClick={() => handleRetryMessage(msg.text)}
                          className="flex items-center gap-1 text-[9px] font-bold text-rose-700 underline"
                          title="Réessayer d'envoyer"
                        >
                          <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                          <span>Réessayer</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {isClient && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formulaire de saisie et bouton d'envoi */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Posez votre question à notre conseiller..."
                disabled={loading}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-10 h-10 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-xs flex-shrink-0"
                title="Envoyer"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
