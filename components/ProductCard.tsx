'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, Search, AlertCircle, Loader2, Play, Film, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { Product } from '@/lib/types';
import { Language, getTranslation } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
  currency?: string;
  initialRating?: number;
  initialPrice?: number | string;
  isValidated?: boolean;
  lang?: Language;
  onValidate: (data: {
    productId: string;
    rating: number;
    estimatedPrice: number;
    criteria?: {
      design: number;
      quality: number;
      originality: number;
      purchaseIntent: number;
    };
  }) => Promise<boolean>;
  onOpenZoom: (images: string[], index: number, name: string, videoUrl?: string) => void;
}

export default function ProductCard({
  product,
  currency = 'MAD',
  initialRating = 0,
  initialPrice = '',
  isValidated = false,
  lang = 'fr',
  onValidate,
  onOpenZoom,
}: ProductCardProps) {
  const t = getTranslation(lang);

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [showDetailedCriteria, setShowDetailedCriteria] = useState(false);

  // Multi-criteria state
  const [designRating, setDesignRating] = useState(initialRating || 4);
  const [qualityRating, setQualityRating] = useState(initialRating || 4);
  const [originalityRating, setOriginalityRating] = useState(initialRating || 4);
  const [purchaseIntent, setPurchaseIntent] = useState(initialRating || 4);

  const [price, setPrice] = useState<string>(initialPrice ? String(initialPrice) : '');
  const [validated, setValidated] = useState(isValidated);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images.slice(0, 3)
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'];

  const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim() !== '');

  const handleRatingClick = (star: number) => {
    if (validated) return;
    setRating(star);
    setDesignRating(star);
    setQualityRating(star);
    setOriginalityRating(star);
    setPurchaseIntent(star);
    setError(null);
  };

  const handlePriceChange = (val: string) => {
    if (validated) return;
    setPrice(val);
    setError(null);
  };

  const handleValidate = async () => {
    if (validated || isSubmitting) return;

    const finalRating = rating || Math.round((designRating + qualityRating + originalityRating + purchaseIntent) / 4);

    if (!finalRating || finalRating < 1) {
      setError(t.requiredRatingError);
      return;
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setError(
        lang === 'ar'
          ? `يرجى إدخال تقدير سعر أعلى من 0 ${currency}.`
          : `Veuillez indiquer une estimation de prix supérieure à 0 ${currency}.`
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const ok = await onValidate({
        productId: product.id,
        rating: finalRating,
        estimatedPrice: numPrice,
        criteria: {
          design: designRating,
          quality: qualityRating,
          originality: originalityRating,
          purchaseIntent: purchaseIntent,
        },
      });

      if (ok) {
        setValidated(true);
      } else {
        setError(
          lang === 'ar'
            ? 'تعذر حفظ التقييم. يرجى إعادة المحاولة.'
            : "Impossible d'enregistrer votre évaluation. Veuillez réessayer."
        );
      }
    } catch (e) {
      console.error(e);
      setError(
        lang === 'ar'
          ? 'حدث خطأ في الاتصال بالخادم.'
          : 'Erreur de communication avec le serveur.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeImage = images[selectedImgIndex] || images[0];

  const isYoutube = product.videoUrl?.includes('youtube.com') || product.videoUrl?.includes('youtu.be');
  const getYoutubeEmbed = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
      }
      const u = new URL(url);
      const v = u.searchParams.get('v');
      return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1`;
    } catch {
      return url;
    }
  };

  const categoryName = (product.category && t.categories[product.category]) || product.category || '';

  return (
    <div
      className={`group flex h-full flex-col rounded-3xl border-2 transition-all duration-300 shadow-sm ${
        validated
          ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-700/60 dark:bg-emerald-950/20 shadow-emerald-50 dark:shadow-none'
          : 'border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-500/50'
      }`}
    >
      {/* Top Media & Gallery (3 Photos + 1 Video) */}
      <div className="p-4 pb-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          {isVideoActive && product.videoUrl ? (
            isYoutube ? (
              <iframe
                src={getYoutubeEmbed(product.videoUrl)}
                className="h-full w-full object-cover"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                src={product.videoUrl}
                controls
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover bg-black"
              />
            )
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105 select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDoubleClick={() => onOpenZoom(images, selectedImgIndex, product.name, product.videoUrl)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/jewel-${product.id}/800/800`;
              }}
            />
          )}

          <button
            type="button"
            onClick={() =>
              onOpenZoom(
                images,
                isVideoActive ? images.length : selectedImgIndex,
                product.name,
                product.videoUrl
              )
            }
            className="absolute bottom-3 end-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/80"
          >
            {isVideoActive ? (
              <>
                <Film className="h-3.5 w-3.5" />
                {t.fullscreen}
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" />
                {t.zoom}
              </>
            )}
          </button>

          {validated && (
            <div className="absolute top-3 start-3 flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur">
              <CheckCircle className="h-3.5 w-3.5" />
              {t.productValidated}
            </div>
          )}
        </div>

        {/* Thumbnails (Up to 3 Photos + 1 Video) */}
        {(images.length > 1 || hasVideo) && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.slice(0, 3).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsVideoActive(false);
                  setSelectedImgIndex(idx);
                }}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                  !isVideoActive && idx === selectedImgIndex
                    ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900/60'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="h-full w-full object-cover select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </button>
            ))}

            {/* Video Slot Button */}
            {hasVideo && (
              <button
                type="button"
                onClick={() => setIsVideoActive(true)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition bg-indigo-950 text-white ${
                  isVideoActive
                    ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900/60 scale-102 shadow-md'
                    : 'border-transparent opacity-75 hover:opacity-100 hover:scale-102'
                }`}
                title={t.watchVideo}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow">
                  <Play className="h-3.5 w-3.5 fill-white ms-0.5" />
                </div>
                <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-indigo-200">
                  {lang === 'ar' ? 'فيديو' : 'Vidéo'}
                </span>
              </button>
            )}
          </div>
        )}

        <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          {hasVideo ? t.mediaCountInfo : t.doubleClickZoom}
        </p>
      </div>

      {/* Product Details & Actions */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                {categoryName}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</h3>
          </div>
        </div>

        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[32px]">
          {product.description}
        </p>

        {/* Inputs Section */}
        <div className="mt-4 space-y-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800">
          {/* Note Globale */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>{t.overallRating}</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {t.ratingLabels[hoverRating || rating] || t.rateOutOfFive}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={validated}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => !validated && setHoverRating(star)}
                    onMouseLeave={() => !validated && setHoverRating(0)}
                    className={`flex-1 flex justify-center py-1.5 rounded-lg transition-transform ${
                      !validated ? 'hover:scale-115 active:scale-95' : 'cursor-default'
                    }`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'fill-transparent text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Multicritères Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDetailedCriteria(!showDetailedCriteria)}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-[11px] font-bold text-indigo-800 dark:text-indigo-300 transition"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                {t.detailedCriteria}
              </span>
              {showDetailedCriteria ? (
                <ChevronUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {showDetailedCriteria && (
              <div className="mt-2.5 space-y-2.5 rounded-xl bg-white dark:bg-slate-800 p-3 border border-indigo-100 dark:border-slate-700 text-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
                {/* 1. Design & Esthétique */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {t.designCriterion}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{designRating}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={validated}
                        onClick={() => !validated && setDesignRating(s)}
                        className="flex-1 py-0.5 flex justify-center"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            designRating >= s
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-transparent text-slate-200 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Qualité perçue & Finitions */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {t.qualityCriterion}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{qualityRating}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={validated}
                        onClick={() => !validated && setQualityRating(s)}
                        className="flex-1 py-0.5 flex justify-center"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            qualityRating >= s
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-transparent text-slate-200 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Originalité & Style */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {t.originalityCriterion}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{originalityRating}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={validated}
                        onClick={() => !validated && setOriginalityRating(s)}
                        className="flex-1 py-0.5 flex justify-center"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            originalityRating >= s
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-transparent text-slate-200 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Intention d'achat */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {t.intentCriterion}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t.intentLabels[purchaseIntent]?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        disabled={validated}
                        onClick={() => !validated && setPurchaseIntent(val)}
                        className={`rounded-lg py-1 text-[10px] font-bold transition text-center ${
                          purchaseIntent === val
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        title={t.intentLabels[val]?.desc}
                      >
                        {val === 1 ? '1/5' : val === 2 ? '2/5' : val === 3 ? '3/5' : val === 4 ? '4/5' : '5/5 ★'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prix Estimé */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {t.estimatedPrice} ({currency}) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                disabled={validated}
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder={t.enterPricePlaceholder}
                className={`h-11 w-full rounded-xl border-2 px-3.5 text-sm font-semibold transition focus:outline-none ${
                  validated
                    ? 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950'
                }`}
              />
              <span className="absolute end-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
                {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <button
            type="button"
            disabled={validated || isSubmitting}
            onClick={handleValidate}
            className={`w-full h-11 rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 ${
              validated
                ? 'bg-emerald-600 text-white cursor-default shadow-emerald-200 dark:shadow-none'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-100 dark:hover:shadow-none active:scale-[0.99] disabled:opacity-50'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.savingInProgress}
              </>
            ) : validated ? (
              <>
                <CheckCircle className="h-4 w-4" />
                {t.productValidated}
              </>
            ) : (
              t.validateProduct
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
