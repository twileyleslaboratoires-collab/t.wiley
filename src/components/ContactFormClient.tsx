'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { sanitizeWhatsAppNumber } from '@/lib/whatsapp';

interface ContactFormProps {
  whatsappNumber: string;
}

export default function ContactFormClient({ whatsappNumber }: ContactFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Votre message a été transmis avec succès !', 'success');
    }, 600);
  };

  const handleOpenWhatsAppDirect = () => {
    const clean = sanitizeWhatsAppNumber(whatsappNumber);
    const msg = `Bonjour, je suis ${formData.name || 'un client'}.\nObjet : ${
      formData.subject || 'Demande de renseignements'
    }.\nMessage : ${formData.message || 'Je souhaite échanger avec un conseiller.'}`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
      {submitted ? (
        <div className="text-center py-10 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Message bien reçu !</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Merci de nous avoir contactés. Notre équipe commerciale traitera votre demande dans les
            plus brefs délais.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
              }}
              className="text-xs text-brand-600 font-bold hover:underline"
            >
              Envoyer un autre message
            </button>
            <span className="hidden sm:inline text-slate-300">•</span>
            <button
              onClick={handleOpenWhatsAppDirect}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Transmettre sur WhatsApp
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            Envoyez-nous un message
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Remplissez ce formulaire et notre équipe vous répondra par téléphone ou par email.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex : M. Koffi / Entreprise ABC"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Numéro de téléphone (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex : +225 07..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex : contact@entreprise.com"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sujet de votre demande *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex : Devis fourniture gros volume"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Votre message ou détail de vos besoins *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Indiquez les quantités souhaitées, votre adresse de livraison ou toute question..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
            ></textarea>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsAppDirect}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Envoyer plutôt via WhatsApp
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

