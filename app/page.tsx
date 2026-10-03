'use client';

import React, { useState, useEffect } from 'react';
import VisitorView from '@/components/VisitorView';
import AdminView from '@/components/AdminView';
import AdminLoginModal from '@/components/AdminLoginModal';
import { Language } from '@/lib/i18n';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'visitor' | 'admin'>('visitor');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Default to Dark Mode as requested: "met le mode sombre"
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme') as 'dark' | 'light' | null;
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  // Language support: 'fr' or 'ar' ("puis la version arabe")
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app_lang') as Language | null;
      return savedLang || 'fr';
    }
    return 'fr';
  });

  useEffect(() => {
    // Synchronize DOM with current theme & language
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    // Admin session check
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
          setIsAdminAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    checkAuth();
  }, [theme, lang]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
  };

  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentScreen('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setIsAdminAuthenticated(false);
    setCurrentScreen('visitor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {currentScreen === 'visitor' ? (
        <VisitorView
          onOpenAdminLogin={handleOpenLogin}
          isAdminAuthenticated={isAdminAuthenticated}
          onGoToAdmin={() => setCurrentScreen('admin')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      ) : (
        <AdminView
          onBackToVisitor={() => setCurrentScreen('visitor')}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        lang={lang}
      />
    </div>
  );
}
