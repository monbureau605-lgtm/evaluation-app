'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Campaign } from '@/lib/types';

interface CounterQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export default function CounterQrCodeModal({
  isOpen,
  onClose,
  campaign,
}: CounterQrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Determine full live campaign URL derived cleanly
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const campaignUrl = campaign ? `${origin}?cid=${campaign.id}&ref=qr_counter` : '';
  const isGenerating = !qrDataUrl && Boolean(campaignUrl);

  useEffect(() => {
    if (!campaignUrl) return;
    let ignore = false;

    QRCode.toDataURL(campaignUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (!ignore) {
          setQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });

    return () => {
      ignore = true;
    };
  }, [campaignUrl]);

  if (!isOpen || !campaign) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-comptoir-${campaign.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCounter = () => {
    window.print();
  };

  // WhatsApp share logic
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `✨ *${campaign.title}*\n\n` +
      `Bonjour, découvrez en exclusivité notre nouvelle collection et donnez votre avis d'expert (notes et estimations de prix) :\n\n` +
      `👉 Accéder directement au test : ${campaignUrl}\n\n` +
      (customNote ? `💬 Note de la maison : "${customNote}"\n\n` : '') +
      `Merci pour votre précieuse contribution !`
    );
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-200 dark:shadow-none">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                QR Code Comptoir & Partage WhatsApp
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  Direct Live
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Idéal pour showrooms, boutiques physiques, salons VIP et campagnes WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-12 items-start">
            {/* Printable Counter Standee Preview (A5/Chevalet) */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Aperçu Chevalet de Comptoir
                </span>
                <span className="text-[11px] text-slate-600">Prêt pour impression A5 / A4</span>
              </div>

              {/* Printable Standee Card */}
              <div
                ref={printRef}
                id="counter-standee"
                className="w-full rounded-2xl border-4 border-amber-600/30 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 p-6 text-center shadow-lg relative overflow-hidden"
              >
                {/* Decorative luxury corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600/60" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600/60" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600/60" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600/60" />

                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-900 mb-2">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  Espace Test Clientèle
                </div>

                <h4 className="text-lg font-black text-slate-900 tracking-tight">
                  {campaign.title}
                </h4>
                <p className="mt-1 text-xs text-slate-600 max-w-sm mx-auto line-clamp-2">
                  Scannez avec l&apos;appareil photo de votre smartphone pour évaluer les pièces et estimer leur prix.
                </p>

                {/* QR Code Container */}
                <div className="my-4 mx-auto w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-white p-3 shadow-md border-2 border-slate-200/90 flex items-center justify-center">
                  {isGenerating || !qrDataUrl ? (
                    <div className="animate-pulse text-xs text-slate-400">Génération du QR Code...</div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrDataUrl}
                      alt="QR Code Comptoir"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="rounded-xl bg-slate-900 text-white py-2 px-3 text-[11px] font-bold tracking-wide">
                  1. Ouvrez votre appareil photo • 2. Visez le QR Code • 3. Donnez votre avis
                </div>
                <div className="mt-2 text-[10px] text-slate-600 tracking-wider">
                  Test anonyme • Validation en 2 minutes
                </div>
              </div>

              {/* Action buttons under preview */}
              <div className="mt-3 flex w-full gap-2">
                <button
                  type="button"
                  onClick={handlePrintCounter}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                >
                  <Printer className="h-4 w-4 text-slate-600" />
                  Imprimer le chevalet
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                >
                  <Download className="h-4 w-4 text-slate-600" />
                  Télécharger PNG
                </button>
              </div>
            </div>

            {/* Right Column: Direct WhatsApp Sharing & Direct Link */}
            <div className="md:col-span-5 space-y-4">
              {/* WhatsApp Card */}
              <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-sm">
                    💬
                  </span>
                  <h5 className="text-sm font-black text-emerald-950">
                    Partage Direct WhatsApp
                  </h5>
                </div>
                <p className="text-xs text-emerald-900/80 mb-3">
                  Envoyez une invitation immédiate avec le lien pré-rempli à vos clients, influenceurs ou équipes.
                </p>

                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                    Ajouter une note personnelle (optionnel) :
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Ex: Merci de me dire ce que tu en penses !"
                    className="w-full h-8 rounded-lg border border-emerald-300 bg-white px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 text-xs shadow-md shadow-emerald-200 transition active:scale-[0.99]"
                >
                  <Share2 className="h-4 w-4" />
                  Envoyer sur WhatsApp
                </button>
              </div>

              {/* Direct Link Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Lien Direct de la Campagne</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={campaignUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-700 truncate select-all focus:outline-none"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={campaignUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Tester le lien visiteur
                  </a>
                  <span className="text-[11px] font-semibold text-slate-600">
                    ID : {campaign.id}
                  </span>
                </div>
              </div>

              {/* Usage Tip */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-[11px] text-indigo-900 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Conseil Pro :</strong> Placez le chevalet imprimé à côté des pièces exposées en boutique. Les clients flashent et votent immédiatement sans télécharger d&apos;application.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
