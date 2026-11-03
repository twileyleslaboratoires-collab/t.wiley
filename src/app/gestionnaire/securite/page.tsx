'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/context/ToastContext';

export default function AdminSecuritePage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/gestionnaire/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.email) {
          setEmail(data.email);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password && password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/gestionnaire/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la mise à jour.');
        showToast(data.error || 'Échec de mise à jour.', 'error');
        return;
      }

      setSuccess('Vos identifiants administrateur ont été mis à jour avec succès.');
      showToast('Identifiants mis à jour avec succès !', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Erreur réseau lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-slate-500">Chargement des paramètres de sécurité...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-brand-600" />
            Accès & Sécurité Administrateur
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Définissez votre adresse email de gestion et personnalisez votre mot de passe privé
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Administrateur Officiel *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="proprietaire@laboratoires-twiley.ci"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cette adresse sera utilisée pour vous connecter sur <code className="font-mono">/gestionnaire/login</code>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Changer le mot de passe
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Laissez ces champs vides si vous souhaitez conserver votre mot de passe actuel.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères..."
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe identique..."
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Mettre à jour mes identifiants'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

