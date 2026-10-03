'use client';

import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Play, Film } from 'lucide-react';

import { Language, getTranslation } from '@/lib/i18n';

interface ImageZoomModalProps {
  isOpen: boolean;
  images: string[];
  videoUrl?: string;
  initialIndex: number;
  productName: string;
  lang?: Language;
  onClose: () => void;
}

export default function ImageZoomModal({
  isOpen,
  images,
  videoUrl,
  initialIndex,
  productName,
  lang = 'fr',
  onClose,
}: ImageZoomModalProps) {
  const t = getTranslation(lang);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMagnified, setIsMagnified] = useState(false);
  const [prevProps, setPrevProps] = useState({ initialIndex, isOpen });

  if (prevProps.initialIndex !== initialIndex || prevProps.isOpen !== isOpen) {
    setPrevProps({ initialIndex, isOpen });
    setCurrentIndex(initialIndex);
    setIsMagnified(false);
  }

  // Total items = images + (videoUrl ? 1 : 0)
  const hasVideo = Boolean(videoUrl && videoUrl.trim() !== '');
  const totalItems = images.length + (hasVideo ? 1 : 0);
  const isVideoCurrent = hasVideo && currentIndex === images.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && totalItems > 1) {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
        setIsMagnified(false);
      }
      if (e.key === 'ArrowLeft' && totalItems > 1) {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
        setIsMagnified(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalItems, onClose]);

  if (!isOpen || (images.length === 0 && !hasVideo)) return null;

  const currentImage = images[currentIndex] || images[0];

  // Helper to detect youtube / vimeo embed
  const isYoutube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  const getYoutubeEmbed = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      const u = new URL(url);
      const v = u.searchParams.get('v');
      return `https://www.youtube.com/embed/${v}?autoplay=1`;
    } catch {
      return url;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <div>
          <h4 className="text-base font-semibold drop-shadow">{productName}</h4>
          <p className="text-xs text-slate-300">
            {isVideoCurrent
              ? (lang === 'ar' ? 'فيديو استعراض المنتج' : 'Vidéo de présentation du produit')
              : (lang === 'ar'
                  ? `صورة ${currentIndex + 1} من ${images.length} • انقر للتكبير`
                  : `Photo ${currentIndex + 1} sur ${images.length} • Cliquez pour agrandir`)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isVideoCurrent && (
            <button
              type="button"
              onClick={() => setIsMagnified(!isMagnified)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
              title={isMagnified ? (lang === 'ar' ? 'تصغير' : 'Réduire') : (lang === 'ar' ? 'تكبير' : 'Agrandir')}
            >
              {isMagnified ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
            title={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Prev / Next controls */}
      {totalItems > 1 && (
        <>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
              setIsMagnified(false);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/70 hover:scale-105"
            title={t.prev}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % totalItems);
              setIsMagnified(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/70 hover:scale-105"
            title={t.next}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Main Display: Video or Image */}
      {isVideoCurrent && videoUrl ? (
        <div className="relative flex max-h-[82vh] max-w-[90vw] w-full max-w-4xl items-center justify-center z-10">
          {isYoutube ? (
            <iframe
              src={getYoutubeEmbed(videoUrl)}
              className="aspect-video w-full rounded-2xl shadow-2xl border border-white/10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl bg-black border border-white/10"
            />
          )}
        </div>
      ) : (
        <div
          className={`relative flex items-center justify-center transition-transform duration-200 select-none ${
            isMagnified ? 'cursor-zoom-out scale-125' : 'cursor-zoom-in scale-100'
          }`}
          onClick={() => setIsMagnified(!isMagnified)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={productName}
            className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain shadow-2xl transition duration-150 select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}

      {/* Bottom thumbnails: Photos + Video button */}
      {totalItems > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 rounded-2xl bg-black/60 p-2 backdrop-blur">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsMagnified(false);
              }}
              className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition ${
                idx === currentIndex
                  ? 'border-indigo-400 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}

          {/* Video thumbnail button */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(images.length);
                setIsMagnified(false);
              }}
              className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border-2 transition bg-indigo-950 text-white ${
                currentIndex === images.length
                  ? 'border-indigo-400 scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              title="Vidéo du bijou"
            >
              <Film className="h-5 w-5 text-indigo-300" />
              <span className="absolute bottom-0.5 text-[8px] font-extrabold uppercase text-indigo-200">
                Vidéo
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

