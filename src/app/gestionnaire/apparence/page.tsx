'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Check, Eye } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ThemeSettings } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

const PRESET_PALETTES = [
  {
    name: 'Bleu Laboratoire & Médical (Officiel)',
    primary: '#026ac8',
    secondary: '#0f172a',
    button: '#16a34a',
    accent: '#d97706',
  },
  {
    name: 'Émeraude & Hygiène Pure',
    primary: '#059669',
    secondary: '#064e3b',
    button: '#10b981',
    accent: '#f59e0b',
  },
  {
    name: 'Bleu Nuit & Or Prestige',
    primary: '#1e3a8a',
    secondary: '#0f172a',
    button: '#2563eb',
    accent: '#eab308',
  },
  {
    name: 'Océan Professionnel',
    primary: '#0284c7',
    secondary: '#0c4a6e',
    button: '#0ea5e9',
    accent: '#f97316',
  },
];

export default function AdminApparencePage() {
  const { showToast } = useToast();
  const { updateTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colors, setColors] = useState<ThemeSettings>({
    primaryColor: '#026ac8',
    secondaryColor: '#0f172a',
    buttonColor: '#16a34a',
    accentColor: '#d97706',
  });

  useEffect(() => {
    fetch('/api/theme')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setColors({
            primaryColor: data.primaryColor || '#026ac8',
            secondaryColor: data.secondaryColor || '#0f172a',
            buttonColor: data.buttonColor || '#16a34a',
            accentColor: data.accentColor || '#d97706',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    const updated: ThemeSettings = {
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      buttonColor: preset.button,
      accentColor: preset.accent,
    };
    setColors(updated);
    updateTheme(updated);
    showToast(`Palette "${preset.name}" pré-appliquée ! Cliquez sur Enregistrer pour confirmer.`, 'info');
  };

  const handleChangeColor = (key: keyof ThemeSettings, value: string) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    updateTheme(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors),
      });

      if (res.ok) {
        showToast('Couleurs et thème visuel enregistrés durablement !', 'success');
        updateTheme(colors);
      } else {
        showToast('Erreur lors de l’enregistrement.', 'error');
      }
    } catch {
      showToast('Erreur réseau.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    const defaultVals: ThemeSettings = {
      primaryColor: '#026ac8',
      secondaryColor: '#0f172a',
      buttonColor: '#16a34a',
      accentColor: '#d97706',
    };
    setColors(defaultVals);
    updateTheme(defaultVals);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-slate-500">Chargement de l'apparence...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-brand-600" />
            Personnalisation Visuelle & Couleurs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ajustez facilement les couleurs principales et des boutons de votre site sans toucher au code
          </p>
        </div>

        {/* PALETTES PRÉDÉFINIES */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Palettes Recommandées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_PALETTES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-brand-500 text-left transition-all hover:shadow-md bg-slate-50 hover:bg-white group"
              >
                <span className="block text-xs font-bold text-slate-800 mb-2 group-hover:text-brand-600">
                  {preset.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-slate-300" style={{ backgroundColor: preset.primary }} title="Principale" />
                  <div className="w-6 h-6 rounded-full border border-slate-300" style={{ backgroundColor: preset.secondary }} title="Secondaire" />
                  <div className="w-6 h-6 rounded-full border border-slate-300" style={{ backgroundColor: preset.button }} title="Boutons" />
                  <div className="w-6 h-6 rounded-full border border-slate-300" style={{ backgroundColor: preset.accent }} title="Accent" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FORMULAIRE SÉLECTEURS DE COULEURS */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Couleurs Personnalisées
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Couleur Principale */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Couleur Principale
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Titres majeurs, logos, liens actifs et accents de marque
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.primaryColor}
                    onChange={(e) => handleChangeColor('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={colors.primaryColor}
                    onChange={(e) => handleChangeColor('primaryColor', e.target.value)}
                    className="flex-1 font-mono text-xs uppercase p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Couleur Secondaire */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Couleur Secondaire / Surfaces
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Pied de page, barres supérieures et conteneurs sombres
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.secondaryColor}
                    onChange={(e) => handleChangeColor('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={colors.secondaryColor}
                    onChange={(e) => handleChangeColor('secondaryColor', e.target.value)}
                    className="flex-1 font-mono text-xs uppercase p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Couleur des Boutons */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Couleur des Boutons d'Action
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Boutons WhatsApp, commander, et validations principales
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.buttonColor}
                    onChange={(e) => handleChangeColor('buttonColor', e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={colors.buttonColor}
                    onChange={(e) => handleChangeColor('buttonColor', e.target.value)}
                    className="flex-1 font-mono text-xs uppercase p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* APERÇU EN DIRECT DU RENDU */}
            <div className="pt-6 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                Aperçu en direct des éléments graphiques
              </span>
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  style={{ backgroundColor: colors.buttonColor }}
                  className="text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition-transform"
                >
                  Bouton Commander WhatsApp
                </button>

                <button
                  type="button"
                  style={{ backgroundColor: colors.primaryColor }}
                  className="text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm"
                >
                  Bouton Principal / Navigation
                </button>

                <span
                  style={{ color: colors.primaryColor }}
                  className="font-black text-sm"
                >
                  Texte de mise en avant ({colors.primaryColor})
                </span>

                <div
                  style={{ backgroundColor: colors.secondaryColor }}
                  className="text-white text-xs px-4 py-2.5 rounded-xl font-bold"
                >
                  Arrière-plan sombre ({colors.secondaryColor})
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS : ENREGISTRER & RÉINITIALISER */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rétablir les couleurs par défaut
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer les couleurs sur le site'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

