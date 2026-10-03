'use client';

import React, { useState } from 'react';
import { Lock, X, KeyRound, User, Loader2 } from 'lucide-react';
import { Language, getTranslation } from '@/lib/i18n';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: Language;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess, lang = 'fr' }: AdminLoginModalProps) {
  const t = getTranslation(lang);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Veuillez renseigner tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || (lang === 'ar' ? 'بيانات الاعتماد غير صحيحة' : 'Identifiants incorrects'));
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'ar' ? 'فضاء الإدارة' : 'Espace Administrateur'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? 'وصول آمن للإحصائيات والإدارة' : 'Accès sécurisé aux statistiques et à la gestion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {lang === 'ar' ? 'اسم المستخدم' : 'Identifiant'}
            </label>
            <div className="relative">
              <User className="absolute start-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 ps-10 pe-4 text-sm font-medium text-slate-800 dark:text-slate-100 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
            </label>
            <div className="relative">
              <KeyRound className="absolute start-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 ps-10 pe-4 text-sm font-medium text-slate-800 dark:text-slate-100 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {t.close}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lang === 'ar' ? 'جارٍ التحقق...' : 'Connexion...'}
                </>
              ) : (
                lang === 'ar' ? 'تسجيل الدخول' : 'Se connecter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
