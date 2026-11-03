'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  User,
  Headphones,
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '@/types';
import Link from 'next/link';
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

  // Défilement automatique vers le bas UNIQUEMENT dans le conteneur du chat (sans toucher à la page)
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    const savedConvId = typeof window !== 'undefined' ? localStorage.getItem('twiley_chat_conv_id') : null;
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('twiley_chat_user_name') : null;
    if (savedName) setCustomerName(savedName);

    if (savedConvId) {
      fetch(`/api/chat?conversationId=${savedConvId}`)
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data: ChatConversation | null) => {
          if (data && data.id) {
            setConversation(data);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [isOpen, conversation?.messages?.length]);

  // Polling temps réel quand la fenêtre de chat est ouverte
  useEffect(() => {
    if (!isOpen || !conversation?.id) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/chat?conversationId=${conversation.id}`);
        if (res.ok) {
          const fresh: ChatConversation = await res.json();
          if (fresh && fresh.messages) {
            setConversation(fresh);
          }
        }
      } catch {
        // Ignorer
      }
    };

    pollIntervalRef.current = setInterval(poll, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, conversation?.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || loading) return;

    setLoading(true);
    setInputText('');

    try {
      const convId = conversation?.id || (typeof window !== 'undefined' ? localStorage.getItem('twiley_chat_conv_id') : null);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            if (customerName.trim()) {
              localStorage.setItem('twiley_chat_user_name', customerName.trim());
            }
          }
        }
      } else {
        // En cas d'erreur de communication, restituer le message pour ne pas le perdre
        setInputText(msg);
      }
    } catch (err) {
      console.error('Erreur chat:', err);
      setInputText(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Ne pas afficher le widget flottant dans l'espace administration / gestionnaire
  if (pathname && (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin'))) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${isOpen ? 'inset-x-3 bottom-3 top-14 sm:inset-auto sm:bottom-6 sm:left-6' : 'bottom-6 left-6'}`}>
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
        <div className="w-full sm:w-[380px] h-full sm:h-[520px] max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* En-tête du Chat */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xs relative">
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
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Fermer le chat"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bandeau de réassurance & distinction WhatsApp pour commander */}
          <div className="bg-brand-50 border-b border-brand-100 px-3 py-1.5 text-[11px] text-brand-900 flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>Assistance & conseils en direct</span>
            </span>
            <span className="text-slate-500 text-[10px]">
              Commande : via WhatsApp
            </span>
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

            {/* Questions rapides suggérées au client */}
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
                    className={`max-w-[85%] p-3 rounded-2xl shadow-2xs ${
                      isClient
                        ? 'bg-brand-700 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {!isClient && (
                      <p className="text-[10px] font-bold text-brand-700 mb-0.5">
                        {msg.senderName || 'Conseiller T. Wiley'}
                      </p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-1 ${
                        isClient ? 'text-brand-200 text-right' : 'text-slate-400 text-left'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
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

          {/* Rappel : WhatsApp est réservé pour la commande de produits */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>Envie de commander directement ?</span>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Voir la boutique</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Champ de saisie et bouton d'envoi avec formulaire accessible */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Posez votre question à notre conseiller..."
                disabled={loading}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
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

