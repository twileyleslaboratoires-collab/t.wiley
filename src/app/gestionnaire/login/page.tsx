'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowLeft, KeyRound, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Email ou mot de passe incorrect.');
        showToast(data.error || 'Échec de connexion.', 'error');
        setLoading(false);
        return;
      }

      showToast('Connexion réussie ! Bienvenue dans votre espace gestionnaire.', 'success');
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const targetUrl = params?.get('redirect') || '/gestionnaire';
      router.push(targetUrl);
      router.refresh();
    } catch {
      setError('Erreur réseau lors de la tentative de connexion.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-50 text-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Espace Gestionnaire
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Gestion privée de la boutique Les Laboratoires T. Wiley
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Gestionnaire *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex : admin@laboratoires-twiley.ci"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Mot de passe *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe..."
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Accès initial réservé au gestionnaire de la boutique. Vous pouvez modifier votre email et votre mot de passe une fois connecté.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Vérification...' : 'Se connecter au tableau de bord'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
