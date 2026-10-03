'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Trash2,
  Download,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  Loader2,
  Users,
  Clock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Campaign, EmailInvitation, InvitationBatch } from '@/lib/types';

interface EmailInvitationsManagerProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onRefreshStats?: () => void;
}

export default function EmailInvitationsManager({
  campaigns,
  activeCampaign,
  onRefreshStats,
}: EmailInvitationsManagerProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    () => activeCampaign?.id || (campaigns[0]?.id ?? '')
  );
  const [invitations, setInvitations] = useState<EmailInvitation[]>([]);
  const [batches, setBatches] = useState<InvitationBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Import state
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState('');
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email template customization
  const [subject, setSubject] = useState(
    '💎 Évaluation bijoux septembre 2026 - Invitation exclusive'
  );
  const [customMessage, setCustomMessage] = useState(
    "Nous avons le plaisir de vous convier en avant-première à découvrir et évaluer les pièces de notre nouvelle collection de haute joaillerie. Votre avis et vos estimations de prix sont essentiels pour parfaire ce lancement."
  );

  // Send progress
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Preview tab
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  const currentCampaign = campaigns.find((c) => c.id === selectedCampaignId) || activeCampaign;

  // Compute public campaign URL
  const [baseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });

  const publicCampaignUrl = currentCampaign
    ? `${baseUrl}?cid=${currentCampaign.id}`
    : baseUrl;

  // Load invitations list
  const loadInvitations = useCallback(async () => {
    if (!selectedCampaignId) return;
    try {
      const res = await fetch(`/api/campaigns/invitations?campaignId=${selectedCampaignId}`);
      const data = await res.json();
      if (data.success) {
        setInvitations(data.invitations || []);
        setBatches(data.batches || []);
      }
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId]);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      if (!ignore) {
        await loadInvitations();
      }
    })();
    return () => {
      ignore = true;
    };
  }, [loadInvitations]);

  // Parse text or CSV content for email addresses
  const extractEmails = (content: string, fileName?: string) => {
    setFileError(null);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const matches = content.match(emailRegex) || [];

    if (matches.length === 0) {
      setFileError("Aucune adresse email valide n'a été trouvée dans le contenu importé.");
      return;
    }

    const uniqueEmails: string[] = [];
    let dupes = 0;
    const seen = new Set<string>();

    for (const raw of matches) {
      const clean = raw.trim().toLowerCase();
      if (seen.has(clean)) {
        dupes++;
      } else {
        seen.add(clean);
        uniqueEmails.push(clean);
      }
    }

    setDuplicateCount(dupes);
    setParsedEmails(uniqueEmails);
    if (fileName) setImportedFileName(fileName);
  };

  // Handle file drop / upload
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        extractEmails(text, file.name);
      }
    };
    reader.onerror = () => {
      setFileError('Impossible de lire le fichier.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const removeParsedEmail = (index: number) => {
    setParsedEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllParsed = () => {
    setParsedEmails([]);
    setImportedFileName(null);
    setRawText('');
    setDuplicateCount(0);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicCampaignUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyIndividualLink = (link: string, id: string) => {
    const fullLink = link.startsWith('http') ? link : `${baseUrl}${link.startsWith('/') ? '' : '/'}${link}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2500);
  };

  // Trigger send
  const handleSendInvitations = async () => {
    if (parsedEmails.length === 0 || !selectedCampaignId) return;

    setIsSending(true);
    setSendProgress(10);
    setSendSuccessMessage(null);

    // Simulated progress steps for smooth UX
    const interval = setInterval(() => {
      setSendProgress((p) => {
        if (p >= 85) {
          clearInterval(interval);
          return 85;
        }
        return p + 15;
      });
    }, 200);

    try {
      const res = await fetch('/api/campaigns/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          subject,
          emails: parsedEmails,
          baseUrl,
          fileName: importedFileName || 'import_manuel',
        }),
      });

      clearInterval(interval);
      setSendProgress(100);

      const data = await res.json();
      if (data.success) {
        setSendSuccessMessage(
          `${data.count} invitation(s) envoyée(s) avec succès pour la campagne « ${currentCampaign?.title} » !`
        );
        clearAllParsed();
        await loadInvitations();
        if (onRefreshStats) onRefreshStats();
      } else {
        setFileError(data.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error(err);
      setFileError('Erreur de connexion au serveur.');
    } finally {
      setIsSending(false);
      setTimeout(() => setSendProgress(0), 1000);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/invitations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      'email;nom;prenom\nexemple@example.invalid;Nom;Prénom\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modele_invitations_emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Campaign Selector */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Diffusion & Envoi d&apos;Invitations par Email
              </h3>
              <p className="text-xs text-slate-500">
                Importez une liste de contacts clients pour leur transmettre le lien d&apos;évaluation personnalisé.
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Filter & Quick Copy */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Campagne cible :</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none shadow-sm"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 transition"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Lien copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copier le lien public
              </>
            )}
          </button>

          <a
            href={publicCampaignUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            title="Tester le lien dans un nouvel onglet"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Tester
          </a>
        </div>
      </div>

      {/* Main 2 Columns: Left = Import & Composer, Right = Preview */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Column: Import File + Configuration (7 cols) */}
        <div className="space-y-6 xl:col-span-7">
          {/* Step 1: File Import / Text input */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-extrabold">
                    1
                  </span>
                  Importer les contacts
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Sélectionnez ou collez vos adresses email
                </h4>
              </div>

              {/* Mode switch */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    inputMode === 'file'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Fichier CSV / TXT
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    inputMode === 'text'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Coller du texte
                </button>
              </div>
            </div>

            {/* File Dropzone */}
            {inputMode === 'file' ? (
              <div className="mt-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50/80"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md text-indigo-600 mb-3">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Glissez-déposez votre fichier ici, ou <span className="text-indigo-600 underline">parcourez</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Formats acceptés : <strong>.CSV, .TXT, .TSV, .XLSX</strong> (séparateurs virgule, point-virgule ou saut de ligne)
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.tsv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger un modèle CSV d&apos;exemple
                  </button>
                  <span className="text-slate-400">Détection automatique des colonnes d&apos;emails</span>
                </div>
              </div>
            ) : (
              /* Raw text input mode */
              <div className="mt-4">
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Collez ici vos adresses e-mail séparées par des virgules, des points-virgules ou des retours à la ligne"
                  className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs font-mono text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => extractEmails(rawText, 'saisie_manuelle.txt')}
                    disabled={!rawText.trim()}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-40"
                  >
                    Extraire les emails
                  </button>
                </div>
              </div>
            )}

            {/* Error banner */}
            {fileError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Parsed summary badge */}
            {parsedEmails.length > 0 && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-extrabold text-emerald-950">
                      {parsedEmails.length} adresse(s) email valide(s) détectée(s)
                    </span>
                    {importedFileName && (
                      <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        {importedFileName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {duplicateCount > 0 && (
                      <span className="text-xs font-medium text-slate-500">
                        ({duplicateCount} doublon(s) ignoré(s))
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={clearAllParsed}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Effacer tout
                    </button>
                  </div>
                </div>

                {/* Email Chips list (collapsible/scrollable) */}
                <div className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-emerald-200/60 bg-white p-2 flex flex-wrap gap-1.5">
                  {parsedEmails.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeParsedEmail(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Retirer cet email"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Message customization & Sending button */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-extrabold">
                    2
                  </span>
                  Personnaliser l&apos;email & Envoyer
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Message d&apos;invitation et objet
                </h4>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Objet du message
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet de l'email..."
                  className="h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Texte d&apos;introduction personnalisé
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Écrivez le message adressé aux évaluateurs..."
                  className="w-full rounded-xl border border-slate-300 p-3.5 text-xs leading-relaxed text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Progress bar during sending */}
              {isSending && (
                <div className="space-y-2 rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      Envoi des emails en cours aux {parsedEmails.length} contacts...
                    </span>
                    <span>{sendProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-200">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${sendProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Notification */}
              {sendSuccessMessage && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-emerald-950">Succès !</h5>
                    <p className="text-xs text-emerald-800 mt-0.5">{sendSuccessMessage}</p>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={parsedEmails.length === 0 || isSending}
                  onClick={handleSendInvitations}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-sm font-extrabold text-white shadow-lg shadow-indigo-100 transition hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer le lien de la campagne ({parsedEmails.length} destinataire{parsedEmails.length > 1 ? 's' : ''})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Email Preview (5 cols) */}
        <div className="space-y-6 xl:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Aperçu direct de l&apos;email</h4>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewTab('desktop')}
                  className={`rounded px-2.5 py-1 ${
                    previewTab === 'desktop' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Bureau
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('mobile')}
                  className={`rounded px-2.5 py-1 ${
                    previewTab === 'mobile' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Email Container Mock */}
            <div
              className={`mt-4 mx-auto rounded-2xl border border-slate-200/90 bg-slate-50 p-3 shadow-inner transition-all ${
                previewTab === 'mobile' ? 'max-w-[340px]' : 'w-full'
              }`}
            >
              {/* Fake Email Client Chrome */}
              <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm space-y-3">
                {/* Email Header */}
                <div className="border-b border-slate-100 pb-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>De : <strong>Maison Haute Joaillerie</strong> &lt;invitations@bijoux-luxe.ma&gt;</span>
                    <span>Aujourd&apos;hui</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    À : {parsedEmails[0] || 'client.vip@exemple.com'}
                  </div>
                  <div className="font-bold text-indigo-900 text-sm">
                    {subject || 'Invitation évaluation collection'}
                  </div>
                </div>

                {/* Email Visual Content */}
                <div className="space-y-4 pt-1">
                  {/* Brand Hero */}
                  <div className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur">
                      💎
                    </div>
                    <h5 className="mt-2 font-black text-sm tracking-wide">
                      {currentCampaign?.title || 'Évaluation Bijoux'}
                    </h5>
                    <p className="mt-0.5 text-[11px] text-indigo-200">Session privée réservée aux membres</p>
                  </div>

                  {/* Body Paragraph */}
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {customMessage}
                  </p>

                  {/* Instructions Bullet points */}
                  <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1.5 border border-slate-100">
                    <div className="font-bold text-slate-800">Votre participation en 2 étapes :</div>
                    <div>⭐ Attribuez une note de 1 à 5 étoiles</div>
                    <div>💰 Indiquez votre estimation de prix en Dirham (MAD)</div>
                    <div>🔍 Zoomez sur les pièces en haute définition</div>
                  </div>

                  {/* CTA Button Mock */}
                  <div className="pt-2 text-center">
                    <a
                      href={publicCampaignUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
                    >
                      Accéder à la campagne & Donner mon avis →
                    </a>
                  </div>

                  <p className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    Lien direct sécurisé unique : <span className="underline">{publicCampaignUrl.slice(0, 36)}...</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History of Sent Invitations & Batches Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Historique des invitations envoyées ({invitations.length})
            </h4>
            <p className="text-xs text-slate-500">
              Retrouvez l&apos;ensemble des liens personnalisés générés et leur statut.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadInvitations}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              title="Rafraîchir"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <a
              href={`/api/campaigns/invitations/export?campaignId=${selectedCampaignId}`}
              download
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Exporter la liste (CSV)
            </a>
          </div>
        </div>

        {/* Recent Batches Pills */}
        {batches.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {batches.slice(0, 5).map((batch) => (
              <div
                key={batch.id}
                className="flex items-center gap-2 rounded-xl bg-indigo-50/80 px-3 py-1.5 text-xs text-indigo-900 border border-indigo-100"
              >
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span className="font-bold">{batch.totalCount} invitations</span>
                <span className="text-indigo-400">•</span>
                <span className="truncate max-w-[140px] text-[11px] text-indigo-700">
                  {batch.fileName || batch.subject}
                </span>
                <span className="text-indigo-400">•</span>
                <span className="text-[10px] text-indigo-600">
                  {new Date(batch.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Invitations Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Destinataire (Email)</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Date d&apos;envoi</th>
                <th className="px-5 py-3">Lien personnalisé</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-medium">
                    Aucune invitation envoyée pour cette campagne pour le moment.
                    Importez votre premier fichier ci-dessus pour lancer la diffusion.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => {
                  const isCopied = copiedEmailId === inv.id;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {inv.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Envoyé
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(inv.sentAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleCopyIndividualLink(inv.campaignLink, inv.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                          title="Copier le lien individualisé pour ce contact"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-400" />
                              <span>Copier lien token</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteInvitation(inv.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Supprimer cette invitation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
