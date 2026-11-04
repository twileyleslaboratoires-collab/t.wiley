'use client';

import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Video, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { compressImage } from '@/lib/image-compress';

interface MediaUploaderProps {
  label: string;
  type?: 'image' | 'video';
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  description?: string;
  accept?: string;
}

export default function MediaUploader({
  label,
  type = 'image',
  value,
  onChange,
  required = false,
  description,
  accept,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultAccept = type === 'video' ? 'video/mp4,video/webm,video/quicktime,video/*' : 'image/*';
  const fileAccept = accept || defaultAccept;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Compression instantanée côté client des images (10 Mo -> 200 Ko en 150ms) pour upload immédiat
      const file = type === 'image' ? await compressImage(rawFile) : rawFile;

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'envoi du fichier.");
      }
      if (!data.url) {
        throw new Error("Aucune URL reçue du serveur.");
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'importation";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be selected again if needed
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 text-xs sm:text-sm">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fichier sélectionné
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      {/* Hidden native file input opened on click */}
      <input
        ref={inputRef}
        type="file"
        accept={fileAccept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Dropzone / Upload area */}
      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full border-2 border-dashed rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2.5 transition-all text-center cursor-pointer ${
            isUploading
              ? 'border-brand-400 bg-brand-50/50 cursor-wait'
              : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
            ) : type === 'video' ? (
              <Video className="w-6 h-6" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="font-bold text-xs sm:text-sm text-slate-800">
              {isUploading
                ? 'Importation du fichier en cours...'
                : type === 'video'
                ? "Cliquez pour choisir une vidéo depuis vos dossiers"
                : "Cliquez pour choisir une photo depuis vos dossiers"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {type === 'video'
                ? 'Format MP4, WebM ou MOV directement depuis votre téléphone ou PC'
                : 'Format JPG, PNG, WEBP directement depuis votre téléphone ou PC'}
            </p>
          </div>
        </button>
      ) : (
        <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3.5 overflow-hidden">
          {/* Media preview */}
          <div className="w-full sm:w-28 sm:h-28 h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
            {type === 'video' ? (
              <video
                src={value}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={value}
                src={value}
                alt="Aperçu"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex-1 w-full flex flex-col justify-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                {isUploading ? 'Importation...' : type === 'video' ? 'Changer de vidéo' : 'Changer de photo'}
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-mono break-all line-clamp-1">
              Fichier enregistré : {value}
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}

