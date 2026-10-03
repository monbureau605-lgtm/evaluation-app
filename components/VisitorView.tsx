'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  MessageCircle,
  Send,
  ShieldCheck,
  HeartHandshake,
  Film,
  Share2,
  Layers,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { Product, Campaign, Evaluation } from '@/lib/types';
import { Language, getTranslation } from '@/lib/i18n';
import { translateFrenchToAr } from '@/lib/translator';
import ProductCard from './ProductCard';
import ImageZoomModal from './ImageZoomModal';

interface VisitorViewProps {
  onOpenAdminLogin: () => void;
  isAdminAuthenticated: boolean;
  onGoToAdmin: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

export default function VisitorView({
  onOpenAdminLogin,
  isAdminAuthenticated,
  onGoToAdmin,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
}: VisitorViewProps) {
  const t = getTranslation(lang);
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '' });

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [validatedIds, setValidatedIds] = useState<string[]>([]);
  const [userEvaluations, setUserEvaluations] = useState<Record<string, { rating: number; price: number }>>({});
  const [loading, setLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // Zoom Modal state
  const [zoomState, setZoomState] = useState<{
    isOpen: boolean;
    images: string[];
    videoUrl?: string;
    index: number;
    name: string;
  }>({
    isOpen: false,
    images: [],
    videoUrl: undefined,
    index: 0,
    name: '',
  });

  // Unique session identifier for visitor stored in localStorage
  const [visitorId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let vid = localStorage.getItem('visitor_session_id');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('visitor_session_id', vid);
      }
      return vid;
    }
    return '';
  });

  const [isInvitedGuest, setIsInvitedGuest] = useState(false);

  const loadData = useCallback(async () => {
    if (!visitorId) return;
    try {
      let urlCid: string | null = null;
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        urlCid = search.get('cid');
        if (search.get('ref') === 'invite' || search.get('t')) {
          setIsInvitedGuest(true);
        }
      }

      // Load campaigns & products
      const [campRes, prodRes, socialRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch(urlCid ? `/api/products?campaignId=${urlCid}` : '/api/products'),
        fetch('/api/settings/social-links'),
      ]);

      const campData = await campRes.json();
      const prodData = await prodRes.json();
      const socialData = await socialRes.json();
      if (socialData.success) setSocialLinks(socialData.socialLinks || { whatsapp: '', telegram: '' });

      let targetCamp = campData.activeCampaign;
      if (urlCid && campData.campaigns) {
        const found = campData.campaigns.find((c: Campaign) => c.id === urlCid);
        if (found) targetCamp = found;
      }

      if (targetCamp) {
        setCampaign(targetCamp);
      }

      if (prodData.success && prodData.products) {
        setProducts(prodData.products);
      }

      // Check user saved progress
      const progRes = await fetch(
        `/api/evaluations/my-progress?sessionId=${visitorId}&campaignId=${targetCamp?.id || ''}`
      );
      const progData = await progRes.json();

      if (progData.success) {
        setValidatedIds(progData.validatedProductIds || []);
        const map: Record<string, { rating: number; price: number }> = {};
        (progData.evaluations || []).forEach((e: Evaluation) => {
          map[e.productId] = { rating: e.rating, price: e.estimatedPrice };
        });
        setUserEvaluations(map);
      }
    } catch (e) {
      console.error('Failed to load visitor data:', e);
    } finally {
      setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    let ignore = false;
    if (visitorId) {
      void (async () => {
        if (!ignore) {
          await loadData();
        }
      })();
    }
    return () => {
      ignore = true;
    };
  }, [visitorId, loadData]);

  const handleValidateProduct = async (data: {
    productId: string;
    rating: number;
    estimatedPrice: number;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          campaignId: campaign?.id,
          participantSessionId: visitorId,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setValidatedIds((prev) => Array.from(new Set([...prev, data.productId])));
        setUserEvaluations((prev) => ({
          ...prev,
          [data.productId]: { rating: data.rating, price: data.estimatedPrice },
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleOpenZoom = (images: string[], index: number, name: string, videoUrl?: string) => {
    setZoomState({
      isOpen: true,
      images,
      videoUrl,
      index,
      name,
    });
  };

  const totalProducts = products.length;
  const validatedCount = validatedIds.length;
  const progressPercent = totalProducts > 0 ? Math.round((validatedCount / totalProducts) * 100) : 0;
  const isAllCompleted = totalProducts > 0 && validatedCount >= totalProducts;

  const categories = Array.from(
    new Set(products.map((p) => p.category || 'Général').filter(Boolean))
  );

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => (p.category || 'Général') === selectedCategory);

  // Determine campaign title and description dynamically based on language & campaign data
  const displayTitle = lang === 'ar'
    ? (campaign?.titleAr || (campaign?.title ? translateFrenchToAr(campaign.title) : t.appName))
    : (campaign?.title || t.appName);

  const displayDesc = lang === 'ar'
    ? (campaign?.descriptionAr || (campaign?.description ? translateFrenchToAr(campaign.description) : t.appSubtitle))
    : (campaign?.description || t.appSubtitle);

  const shareTargets = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = lang === 'ar'
      ? `شاركوا معنا في تقييم مجموعة «${displayTitle}» واقترحوا السعر المناسب:`
      : `Découvrez la collection « ${displayTitle} » et donnez votre avis :`;
    const page = encodeURIComponent(url);
    return [
      { label: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}` },
      { label: 'Telegram', href: `https://t.me/share/url?url=${page}&text=${encodeURIComponent(text)}` },
      { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${page}` },
      { label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${page}` },
      { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${page}` },
    ];
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      {/* Sticky Header with Progress, Theme and Language Controls */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 sm:py-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 sm:flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 text-sm shadow-xs sm:h-8 sm:w-8 sm:rounded-xl sm:text-base">
                  💎
                </span>
                <h1 className="min-w-0 break-words text-base font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  {displayTitle}
                </h1>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400 sm:text-sm">
                {displayDesc}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {(campaign?.videoUrl || (campaign?.images && campaign.images.length > 0)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const imgs = campaign.images && campaign.images.length > 0 ? campaign.images : [];
                      handleOpenZoom(imgs, imgs.length, displayTitle, campaign.videoUrl);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/90 dark:bg-indigo-950/50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition shadow-xs"
                  >
                    <Film className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="sm:hidden">{t.viewVisuals}</span>
                    <span className="hidden sm:inline">{campaign.videoUrl ? t.watchVideo : t.viewVisuals}</span>
                  </button>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShareMenuOpen((open) => !open)}
                    aria-expanded={shareMenuOpen}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-xs"
                    title={lang === 'ar' ? 'مشاركة المجموعة' : 'Partager la collection'}
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {lang === 'ar' ? 'مشاركة' : 'Partager'}
                  </button>
                  {shareMenuOpen && (
                    <div className="absolute start-0 top-full z-50 mt-2 grid min-w-36 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      {shareTargets().map((target) => (
                        <a key={target.label} href={target.href} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="rounded-lg px-3 py-2 text-start text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                          {target.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 items-center gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-2">
              {/* Theme Toggle (Mode Sombre) */}
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
                title={theme === 'dark' ? t.lightMode : t.darkMode}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs sm:px-3 sm:text-xs"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>{t.lightMode}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{t.darkMode}</span>
                  </>
                )}
              </button>

              {/* Language Switcher (Version Arabe / Français) */}
              <div className="flex min-h-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => onToggleLang('fr')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    lang === 'fr'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => onToggleLang('ar')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    lang === 'ar'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  العربية
                </button>
              </div>

              {/* Progress Count */}
              <div className="col-span-2 flex items-baseline justify-between gap-2 sm:block sm:text-right rtl:sm:text-left">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:text-xs">{t.progression}</div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 sm:text-sm">
                  {validatedCount} / {totalProducts} {t.validatedProducts} ({progressPercent}%)
                </div>
              </div>

              {isAdminAuthenticated && (
                <button
                  onClick={onGoToAdmin}
                  className="col-span-2 flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm sm:col-auto"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t.adminDashboard}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:mt-2 sm:h-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {isInvitedGuest && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/40 p-4 text-xs font-semibold text-indigo-950 dark:text-indigo-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm text-sm">
                ✨
              </span>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white">{t.vipInviteWelcome}</span>
                <span className="hidden sm:inline text-slate-600 dark:text-slate-300 ms-1">
                  {t.vipInviteSub}
                </span>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-3 py-1 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {t.vipInviteBadge}
            </span>
          </div>
        )}

        {/* Category Filter Pills (if multiple categories) */}
        {categories.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 me-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {t.categoryFilterLabel}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {t.categories['all'] || t.allArticles} ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => (p.category || 'Général') === cat).length;
              const catLabel = t.categories[cat] || cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none'
                      : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {catLabel} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Instructions Box */}
        <div className="mb-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-indigo-950 dark:text-indigo-200">{t.instructionsTitle}</h2>
              <div className="mt-1.5 grid gap-x-5 gap-y-1.5 text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-300/90 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold">
                    1
                  </span>
                  <span>{t.instruction1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold">
                    2
                  </span>
                  <span>{t.instruction2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold">
                    3
                  </span>
                  <span>{t.instruction3}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold">
                    4
                  </span>
                  <span>{t.instruction4}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[520px] animate-pulse rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
              >
                <div className="aspect-square w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
                <div className="mt-6 h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const isValidated = validatedIds.includes(product.id);
              const userEval = userEvaluations[product.id];

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={campaign?.currency || 'MAD'}
                  isValidated={isValidated}
                  initialRating={userEval?.rating || 0}
                  initialPrice={userEval?.price || ''}
                  lang={lang}
                  onValidate={handleValidateProduct}
                  onOpenZoom={handleOpenZoom}
                />
              );
            })}
          </div>
        )}

        {/* Final Completion Banner */}
        {isAllCompleted && (
          <div className="mt-12 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 p-8 text-center shadow-lg shadow-emerald-50 dark:shadow-none">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-3xl text-emerald-600 dark:text-emerald-400 shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="mt-4 text-2xl font-black text-emerald-950 dark:text-emerald-200 sm:text-3xl">
              {t.completedTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-emerald-800 dark:text-emerald-300 sm:text-base">
              {t.joinOffersPrompt}
            </p>

            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/40 px-4 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <HeartHandshake className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                {t.completedBadge} {visitorId}
              </div>
              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.joinWhatsApp}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </a>
              )}
              {socialLinks.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
                >
                  <Send className="h-4 w-4" />
                  {t.joinTelegram}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Discreet Admin Lock Button */}
      <button
        id="admin-trigger"
        type="button"
        onClick={() => {
          if (isAdminAuthenticated) {
            onGoToAdmin();
          } else {
            onOpenAdminLogin();
          }
        }}
        title={t.adminPortal}
        className="fixed bottom-4 end-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-400 opacity-40 shadow-lg backdrop-blur transition hover:scale-110 hover:opacity-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600"
      >
        <Lock className="h-4 w-4" />
      </button>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={zoomState.isOpen}
        images={zoomState.images}
        videoUrl={zoomState.videoUrl}
        initialIndex={zoomState.index}
        productName={zoomState.name}
        lang={lang}
        onClose={() => setZoomState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
