'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  Star,
  Download,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  Tag,
  CheckCircle,
  X,
  Trash2,
  Calendar,
  Mail,
  Pencil,
  Film,
  Play,
  Image as ImageIcon,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Smartphone,
  Share2,
  Sliders,
  Target,
  SlidersHorizontal,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { ProductStats, GlobalStats, Campaign, Evaluation } from '@/lib/types';
import { DEFAULT_PRODUCT_CATEGORIES } from '@/lib/categories';
import EmailInvitationsManager from './EmailInvitationsManager';
import CounterQrCodeModal from './CounterQrCodeModal';

import { Language, getTranslation } from '@/lib/i18n';
import { translateFrenchToAr } from '@/lib/translator';

interface AdminViewProps {
  onBackToVisitor: () => void;
  onLogout: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  lang?: Language;
  onToggleLang?: (lang: Language) => void;
}

export default function AdminView({
  onBackToVisitor,
  onLogout,
  theme = 'dark',
  onToggleTheme,
  lang = 'fr',
  onToggleLang,
}: AdminViewProps) {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'products' | 'evaluations' | 'invitations'>('dashboard');
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('1');
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([]);
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '', whatsappContactNumber: '' });
  const [savingSocialLinks, setSavingSocialLinks] = useState(false);
  const [loading, setLoading] = useState(true);

  // QR Code & WhatsApp Counter Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalCampaign, setQrModalCampaign] = useState<Campaign | null>(null);

  // Category Filtering in Products Tab
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Modals for Campaign
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);

  // Modals for Product
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductStats | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductStats | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Campaign Form States (New)
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampTitleAr, setNewCampTitleAr] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampDescAr, setNewCampDescAr] = useState('');
  const [isTranslatingNewCamp, setIsTranslatingNewCamp] = useState(false);
  const [newCampCurrency, setNewCampCurrency] = useState('MAD');
  const [newCampVideoUrl, setNewCampVideoUrl] = useState('');
  const [newCampImages, setNewCampImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
  ]);

  // Campaign Form States (Edit)
  const [editCampTitle, setEditCampTitle] = useState('');
  const [editCampTitleAr, setEditCampTitleAr] = useState('');
  const [editCampDesc, setEditCampDesc] = useState('');
  const [editCampDescAr, setEditCampDescAr] = useState('');
  const [isTranslatingEditCamp, setIsTranslatingEditCamp] = useState(false);
  const [editCampCurrency, setEditCampCurrency] = useState('MAD');
  const [editCampActive, setEditCampActive] = useState(false);
  const [editCampVideoUrl, setEditCampVideoUrl] = useState('');
  const [editCampImages, setEditCampImages] = useState<string[]>(['', '', '']);

  // Product Form States (New) - 3 Photos + 1 Video
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Joaillerie & Bijoux');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newProdSuggestedPrice, setNewProdSuggestedPrice] = useState('');
  const [newProdVideoUrl, setNewProdVideoUrl] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop',
  ]);

  // Product Form States (Edit) - 3 Photos + 1 Video
  const [editProdName, setEditProdName] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('Joaillerie & Bijoux');
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState('');
  const [editProdSuggestedPrice, setEditProdSuggestedPrice] = useState('');
  const [editProdVideoUrl, setEditProdVideoUrl] = useState('');
  const [editProdImages, setEditProdImages] = useState<string[]>(['', '', '']);

  // Feedback notifications
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

  const notify = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    if (type === 'error') {
      setModalErrorMessage(text);
    } else {
      setModalErrorMessage(null);
    }
    setTimeout(() => {
      setActionMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const loadData = useCallback(async () => {
    try {
      const [statsRes, campRes, socialRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/campaigns'),
        fetch('/api/settings/social-links'),
      ]);

      const statsData = await statsRes.json();
      const campData = await campRes.json();
      const socialData = await socialRes.json();
      if (socialData.success) setSocialLinks(socialData.socialLinks || { whatsapp: '', telegram: '', whatsappContactNumber: '' });

      if (statsData.success) {
        setGlobalStats(statsData.globalStats);
        setProductStats(statsData.productStats);
        setRecentEvaluations(statsData.recentEvaluations || []);
        if (statsData.productStats.length > 0 && !selectedProductId) {
          setSelectedProductId(statsData.productStats[0].id);
        }
      }

      if (campData.success) {
        setCampaigns(campData.campaigns || []);
        setActiveCampaign(campData.activeCampaign || null);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedProductId]);

  const handleSaveSocialLinks = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingSocialLinks(true);
    try {
      const response = await fetch('/api/settings/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialLinks),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Enregistrement impossible');
      setSocialLinks(data.socialLinks);
      notify('success', lang === 'ar' ? 'تم حفظ روابط المجموعات.' : 'Les liens des groupes ont été enregistrés.');
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Enregistrement impossible');
    } finally {
      setSavingSocialLinks(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    void (async () => {
      if (!ignore) {
        await loadData();
      }
    })();
    return () => {
      ignore = true;
    };
  }, [loadData]);

  const handleSwitchCampaign = async (campaignId: string) => {
    try {
      const res = await fetch('/api/campaigns/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      if (res.ok) {
        notify('success', 'Campagne activée avec succès pour les visiteurs !');
        await loadData();
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur lors du basculement de campagne.');
    }
  };

  // --- Campaign Handlers ---
  const handleAutoTranslateNewCampaign = async () => {
    if (!newCampTitle.trim()) return;
    setIsTranslatingNewCamp(true);
    try {
      const [resTitle, resDesc] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newCampTitle.trim() }),
        }),
        newCampDesc.trim() ? fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newCampDesc.trim() }),
        }) : Promise.resolve(null),
      ]);
      const dataTitle = await resTitle.json();
      if (dataTitle.success && dataTitle.translation) {
        setNewCampTitleAr(dataTitle.translation);
      } else {
        setNewCampTitleAr(translateFrenchToAr(newCampTitle.trim()));
      }
      if (resDesc) {
        const dataDesc = await resDesc.json();
        if (dataDesc.success && dataDesc.translation) {
          setNewCampDescAr(dataDesc.translation);
        } else {
          setNewCampDescAr(translateFrenchToAr(newCampDesc.trim()));
        }
      }
      notify('success', 'Traduction en arabe effectuée !');
    } catch {
      setNewCampTitleAr(translateFrenchToAr(newCampTitle.trim()));
      if (newCampDesc.trim()) setNewCampDescAr(translateFrenchToAr(newCampDesc.trim()));
    } finally {
      setIsTranslatingNewCamp(false);
    }
  };

  const handleAutoTranslateEditCampaign = async () => {
    if (!editCampTitle.trim()) return;
    setIsTranslatingEditCamp(true);
    try {
      const [resTitle, resDesc] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editCampTitle.trim() }),
        }),
        editCampDesc.trim() ? fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editCampDesc.trim() }),
        }) : Promise.resolve(null),
      ]);
      const dataTitle = await resTitle.json();
      if (dataTitle.success && dataTitle.translation) {
        setEditCampTitleAr(dataTitle.translation);
      } else {
        setEditCampTitleAr(translateFrenchToAr(editCampTitle.trim()));
      }
      if (resDesc) {
        const dataDesc = await resDesc.json();
        if (dataDesc.success && dataDesc.translation) {
          setEditCampDescAr(dataDesc.translation);
        } else {
          setEditCampDescAr(translateFrenchToAr(editCampDesc.trim()));
        }
      }
      notify('success', 'Traduction en arabe effectuée !');
    } catch {
      setEditCampTitleAr(translateFrenchToAr(editCampTitle.trim()));
      if (editCampDesc.trim()) setEditCampDescAr(translateFrenchToAr(editCampDesc.trim()));
    } finally {
      setIsTranslatingEditCamp(false);
    }
  };

  const handleTranslateSingleCampaign = async (camp: Campaign) => {
    try {
      const [resTitle, resDesc] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: camp.title }),
        }),
        camp.description
          ? fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: camp.description }),
            })
          : Promise.resolve(null),
      ]);
      const dataTitle = await resTitle.json();
      const finalTitleAr =
        dataTitle.success && dataTitle.translation ? dataTitle.translation : translateFrenchToAr(camp.title);
      let finalDescAr = camp.descriptionAr;
      if (resDesc) {
        const dataDesc = await resDesc.json();
        if (dataDesc.success && dataDesc.translation) finalDescAr = dataDesc.translation;
        else finalDescAr = translateFrenchToAr(camp.description);
      }
      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: camp.id,
          titleAr: finalTitleAr,
          descriptionAr: finalDescAr,
        }),
      });
      if (res.ok) {
        notify('success', lang === 'ar' ? 'تمت ترجمة وتحديث الحملة بنجاح!' : 'Campagne traduite et mise à jour avec succès !');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Erreur lors de la traduction.');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) {
      notify('error', lang === 'ar' ? 'يرجى إدخال عنوان الحملة بالفرنسية أو بالعربية' : 'Veuillez renseigner le titre de la campagne.');
      return;
    }

    try {
      const finalTitleAr = newCampTitleAr.trim() || translateFrenchToAr(newCampTitle.trim());
      const finalDescAr = newCampDescAr.trim() || translateFrenchToAr(newCampDesc.trim() || 'Campagne en cours');

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCampTitle.trim(),
          titleAr: finalTitleAr,
          description: newCampDesc.trim() || 'Campagne en cours',
          descriptionAr: finalDescAr,
          currency: newCampCurrency.trim() || 'MAD',
          videoUrl: newCampVideoUrl.trim() || undefined,
          images: newCampImages.filter((img) => img.trim() !== '').slice(0, 3),
        }),
      });
      if (res.ok) {
        setShowNewCampaignModal(false);
        setNewCampTitle('');
        setNewCampTitleAr('');
        setNewCampDesc('');
        setNewCampDescAr('');
        setNewCampVideoUrl('');
        setModalErrorMessage(null);
        notify('success', lang === 'ar' ? 'تم إنشاء الحملة وترجمتها بنجاح!' : 'Nouvelle campagne créée avec traduction arabe !');
        await loadData();
      } else {
        const d = await res.json();
        notify('error', d.error || 'Erreur lors de la création de la campagne.');
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur de connexion au serveur.');
    }
  };

  const handleOpenEditCampaign = (camp: Campaign) => {
    setModalErrorMessage(null);
    setEditingCampaign(camp);
    setEditCampTitle(camp.title);
    setEditCampTitleAr(camp.titleAr || translateFrenchToAr(camp.title));
    setEditCampDesc(camp.description);
    setEditCampDescAr(camp.descriptionAr || translateFrenchToAr(camp.description));
    setEditCampCurrency(camp.currency || 'MAD');
    setEditCampActive(camp.active);
    setEditCampVideoUrl(camp.videoUrl || '');
    const imgs = camp.images && Array.isArray(camp.images) ? [...camp.images] : [];
    while (imgs.length < 3) imgs.push('');
    setEditCampImages(imgs.slice(0, 3));
    setShowEditCampaignModal(true);
  };

  const handleSaveEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    if (!editCampTitle.trim()) {
      notify('error', lang === 'ar' ? 'يرجى إدخال عنوان الحملة' : 'Veuillez renseigner le titre de la campagne.');
      return;
    }

    try {
      const finalTitleAr = editCampTitleAr.trim() || translateFrenchToAr(editCampTitle.trim());
      const finalDescAr = editCampDescAr.trim() || translateFrenchToAr(editCampDesc.trim());

      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCampaign.id,
          title: editCampTitle.trim(),
          titleAr: finalTitleAr,
          description: editCampDesc.trim(),
          descriptionAr: finalDescAr,
          currency: editCampCurrency.trim() || 'MAD',
          active: editCampActive,
          videoUrl: editCampVideoUrl.trim() || undefined,
          images: editCampImages.filter((img) => img.trim() !== '').slice(0, 3),
        }),
      });

      if (res.ok) {
        setShowEditCampaignModal(false);
        setEditingCampaign(null);
        setModalErrorMessage(null);
        notify('success', lang === 'ar' ? 'تم تعديل الحملة وترجمتها بنجاح!' : 'Campagne et traduction modifiées avec succès !');
        await loadData();
      } else {
        const d = await res.json();
        notify('error', d.error || 'Erreur lors de la mise à jour.');
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur serveur.');
    }
  };

  const handleOpenDeleteCampaign = (camp: Campaign) => {
    setCampaignToDelete(camp);
  };

  const handleConfirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsDeletingCampaign(true);
    try {
      const res = await fetch(`/api/campaigns?id=${encodeURIComponent(campaignToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaignToDelete(null);
        notify('success', 'Campagne supprimée avec succès !');
        await loadData();
      } else {
        notify('error', data.error || 'Erreur lors de la suppression.');
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur de communication avec le serveur.');
    } finally {
      setIsDeletingCampaign(false);
    }
  };

  // --- Product Handlers (3 Photos + 1 Video + PPC + Catégories) ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      notify('error', lang === 'ar' ? 'يرجى إدخال اسم القطعة' : "Veuillez renseigner le nom de l'article.");
      return;
    }

    const finalCategory = newProdCategory === 'custom'
      ? (customCategoryInput.trim() || 'Général')
      : newProdCategory;

    const suggestedPriceNum = newProdSuggestedPrice && !isNaN(Number(newProdSuggestedPrice))
      ? Number(newProdSuggestedPrice)
      : undefined;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName.trim(),
          description: newProdDesc.trim(),
          category: finalCategory,
          suggestedPrice: suggestedPriceNum,
          images: newProdImages.filter((img) => img.trim() !== '').slice(0, 3),
          videoUrl: newProdVideoUrl.trim() || undefined,
          campaignId: activeCampaign?.id,
        }),
      });
      if (res.ok) {
        setShowNewProductModal(false);
        setNewProdName('');
        setNewProdDesc('');
        setNewProdSuggestedPrice('');
        setCustomCategoryInput('');
        setNewProdVideoUrl('');
        setModalErrorMessage(null);
        notify('success', 'Nouvel article ajouté avec succès !');
        await loadData();
      } else {
        const d = await res.json();
        notify('error', d.error || "Erreur lors de la création de l'article.");
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur serveur.');
    }
  };

  const handleOpenEditProduct = (prod: ProductStats) => {
    setModalErrorMessage(null);
    setEditingProduct(prod);
    setEditProdName(prod.name);
    setEditProdDesc(prod.description);
    
    // Check if category exists in defaults
    const foundCategory = DEFAULT_PRODUCT_CATEGORIES.some((c) => c.name === prod.category);
    if (foundCategory || !prod.category) {
      setEditProdCategory(prod.category || 'Joaillerie & Bijoux');
      setEditCustomCategoryInput('');
    } else {
      setEditProdCategory('custom');
      setEditCustomCategoryInput(prod.category);
    }

    setEditProdSuggestedPrice(prod.suggestedPrice ? String(prod.suggestedPrice) : '');
    setEditProdVideoUrl(prod.videoUrl || '');
    const imgs = [...(prod.images || [])];
    while (imgs.length < 3) imgs.push('');
    setEditProdImages(imgs.slice(0, 3));
    setShowEditProductModal(true);
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim()) {
      notify('error', lang === 'ar' ? 'يرجى إدخال اسم القطعة' : "Veuillez renseigner le nom de l'article.");
      return;
    }

    const finalCategory = editProdCategory === 'custom'
      ? (editCustomCategoryInput.trim() || 'Général')
      : editProdCategory;

    const suggestedPriceNum = editProdSuggestedPrice && !isNaN(Number(editProdSuggestedPrice))
      ? Number(editProdSuggestedPrice)
      : undefined;

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editProdName.trim(),
          description: editProdDesc.trim(),
          category: finalCategory,
          suggestedPrice: suggestedPriceNum,
          images: editProdImages.filter((img) => img.trim() !== '').slice(0, 3),
          videoUrl: editProdVideoUrl.trim() || undefined,
          campaignId: editingProduct.campaignId,
        }),
      });

      if (res.ok) {
        setShowEditProductModal(false);
        setEditingProduct(null);
        setModalErrorMessage(null);
        notify('success', 'Article mis à jour avec succès !');
        await loadData();
      } else {
        const d = await res.json();
        notify('error', d.error || 'Erreur lors de la modification.');
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur serveur.');
    }
  };

  const handleOpenDeleteProduct = (prod: ProductStats) => {
    setProductToDelete(prod);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(productToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProductToDelete(null);
        notify('success', 'Bijou supprimé du catalogue.');
        await loadData();
      } else {
        notify('error', data.error || 'Erreur lors de la suppression.');
      }
    } catch (e) {
      console.error(e);
      notify('error', 'Erreur serveur.');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Voulez-vous réinitialiser toutes les évaluations aux valeurs de démo de base ?')) {
      try {
        const res = await fetch('/api/admin/reset', { method: 'POST' });
        if (res.ok) {
          await loadData();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const selectedProduct = productStats.find((p) => p.id === selectedProductId) || productStats[0];

  const ratingBarColor = (star: number) => {
    switch (star) {
      case 5:
        return 'bg-emerald-500';
      case 4:
        return 'bg-emerald-400';
      case 3:
        return 'bg-amber-400';
      case 2:
        return 'bg-orange-400';
      case 1:
        return 'bg-rose-500';
      default:
        return 'bg-indigo-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Floating Action Notification Toast - Premier Plan (z-[99999]) */}
      {actionMessage && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed top-5 right-5 z-[99999] max-w-md w-[calc(100%-2.5rem)] pointer-events-auto transition-all duration-200"
        >
          <div
            className={`flex items-start justify-between gap-3 rounded-2xl p-4 text-xs font-semibold shadow-2xl backdrop-blur-md ring-1 transition-all ${
              actionMessage.type === 'success'
                ? 'border border-emerald-300 dark:border-emerald-600/70 bg-emerald-50/95 dark:bg-emerald-950/95 text-emerald-900 dark:text-emerald-100 ring-emerald-500/20'
                : 'border border-rose-300 dark:border-rose-600/70 bg-rose-50/95 dark:bg-rose-950/95 text-rose-900 dark:text-rose-100 ring-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span className="leading-snug text-xs sm:text-sm font-bold">{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition shrink-0"
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex">
        <div className="border-b border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              💎
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white truncate" title={t.appName}>
                {t.appName}
              </h1>
              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{t.adminDashboard}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t.dashboardTab}
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'campaigns'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            {t.campaignsTab} ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'products'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="h-4 w-4" />
            {t.productsTab} ({productStats.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'evaluations'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="h-4 w-4" />
            {t.evaluationsTab}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'invitations'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            {t.invitationsTab}
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 p-4">
          <a
            href="/api/stats/export"
            download
            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {lang === 'ar' ? 'تصدير CSV' : 'Exporter CSV'}
          </a>
          <button
            onClick={handleResetData}
            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {lang === 'ar' ? 'إعادة ضبط تجريبية' : 'Réinitialiser démo'}
          </button>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
          >
            <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToVisitor}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t.backToVisitor}
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400 font-medium">
                {lang === 'ar' ? 'الحملة النشطة : ' : 'Campagne active : '}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {lang === 'ar'
                  ? (activeCampaign?.titleAr || (activeCampaign?.title ? translateFrenchToAr(activeCampaign.title) : 'تقييم مجوهرات سبتمبر 2026'))
                  : (activeCampaign?.title || 'Évaluation bijoux septembre 2026')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Theme & Language Controls in Admin */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === 'dark' ? t.lightMode : t.darkMode}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            )}

            {onToggleLang && (
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => onToggleLang('fr')}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
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
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                    lang === 'ar'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  عربي
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setQrModalCampaign(activeCampaign);
                setShowQrModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-sm"
              title="Générer le QR Code de comptoir ou partager sur WhatsApp"
            >
              <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">QR Code &</span> WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition shadow-sm"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">{lang === 'ar' ? 'دعوة بالبريد' : 'Inviter par email'}</span>
            </button>
            <button
              onClick={() => {
                setModalErrorMessage(null);
                setShowNewProductModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {lang === 'ar' ? 'منتج جديد' : 'Nouvel article'}
            </button>
            <button
              onClick={() => {
                setModalErrorMessage(null);
                setShowNewCampaignModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              {lang === 'ar' ? 'حملة جديدة' : 'Nouvelle campagne'}
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* Global KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Campagnes
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Layers className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">
                    {globalStats?.totalCampaigns ?? 4}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Campagnes de tests enregistrées</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Participants uniques
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Users className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">
                    {globalStats?.totalParticipants ?? 430}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Évaluateurs qualifiés uniques</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Évaluations totales
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Star className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">
                    {globalStats?.totalEvaluations.toLocaleString('fr-FR') ?? '7 685'}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Notes & prix validés cumulés</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Prix moyen global
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <DollarSign className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">
                    {globalStats?.globalPriceAvg ?? 178} MAD
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Estimation moyenne du catalogue</p>
                </div>
              </div>

              <form onSubmit={handleSaveSocialLinks} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">{lang === 'ar' ? 'روابط مجموعات العروض' : 'Groupes pour recevoir les offres'}</h3>
                  <p className="mt-1 text-xs text-slate-500">{lang === 'ar' ? 'أضف روابط الدعوة ورقم التواصل؛ ستظهر للزوار بعد إكمال التقييم أو إبداء الاهتمام.' : 'Ajoutez les liens d’invitation et le numéro de contact. Le numéro servira au bouton WhatsApp après un clic sur « Ce produit m’intéresse ».'}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    WhatsApp
                    <input type="url" inputMode="url" placeholder="https://chat.whatsapp.com/..." value={socialLinks.whatsapp} onChange={(event) => setSocialLinks((value) => ({ ...value, whatsapp: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Telegram
                    <input type="url" inputMode="url" placeholder="https://t.me/..." value={socialLinks.telegram} onChange={(event) => setSocialLinks((value) => ({ ...value, telegram: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'ar' ? 'رقم واتساب للتواصل المباشر' : 'Numéro WhatsApp de contact'}
                    <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+212 6 12 34 56 78" value={socialLinks.whatsappContactNumber} onChange={(event) => setSocialLinks((value) => ({ ...value, whatsappContactNumber: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  </label>
                </div>
                <button type="submit" disabled={savingSocialLinks} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                  {savingSocialLinks ? (lang === 'ar' ? 'جارٍ الحفظ…' : 'Enregistrement…') : (lang === 'ar' ? 'حفظ الروابط' : 'Enregistrer les liens')}
                </button>
              </form>

              {/* Callout Banner: Import & Invite by Email */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-indigo-200/90 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-lg shadow-indigo-100">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase backdrop-blur">
                      Diffusion Campagne
                    </span>
                    <h4 className="text-base font-extrabold">Invitez vos clients par email</h4>
                  </div>
                  <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
                    Importez un fichier CSV ou TXT d&apos;emails pour expédier automatiquement des invitations personnalisées avec lien direct vers la campagne active.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('invitations')}
                  className="whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-indigo-900 shadow-md hover:bg-indigo-50 transition active:scale-95 flex items-center gap-1.5 w-fit"
                >
                  <Mail className="h-4 w-4 text-indigo-600" />
                  Importer des emails & Envoyer →
                </button>
              </div>

              {/* Products Table */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Statistiques par produit</h3>
                    <p className="text-xs text-slate-500">
                      Cliquez sur une ligne pour afficher l&apos;analyse détaillée et la distribution des prix.
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 w-fit">
                    {productStats.length} produits évalués
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3.5">Produit</th>
                        <th className="px-6 py-3.5 text-right">Participants</th>
                        <th className="px-6 py-3.5 text-right">{t.interestedCount}</th>
                        <th className="px-6 py-3.5 text-right">Note moyenne</th>
                        <th className="px-6 py-3.5 text-right">Prix moyen</th>
                        <th className="px-6 py-3.5 text-right">Prix médian</th>
                        <th className="px-6 py-3.5 text-right">Min - Max</th>
                        <th className="px-6 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {productStats.map((stat) => {
                        const isSelected = stat.id === selectedProductId;
                        return (
                          <tr
                            key={stat.id}
                            onClick={() => setSelectedProductId(stat.id)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-indigo-50/70 font-semibold'
                                : 'hover:bg-slate-50/80 text-slate-700'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stat.images[0] || 'https://picsum.photos/seed/thumb/100/100'}
                                  alt={stat.name}
                                  className="h-11 w-11 rounded-xl object-cover border border-slate-200"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{stat.name}</div>
                                  <div className="text-[11px] text-slate-400 font-normal">
                                    ID: {stat.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-600">
                              {stat.participants}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                                {stat.interestedCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {stat.avgRating.toFixed(1)} / 5
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-slate-800">
                              {stat.priceAvg} MAD
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-indigo-600">
                              {stat.priceMedian} MAD
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                              {stat.priceMin} - {stat.priceMax} MAD
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProductId(stat.id);
                                }}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected ? 'Sélectionné' : 'Voir'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Deep Dive (2 Columns) */}
              {selectedProduct && (
                <div className="grid gap-6 xl:grid-cols-2">
                  {/* Left: Ratings distribution & Highlights */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                          Fiche d&apos;analyse détaillée
                        </span>
                        <h4 className="text-lg font-bold text-slate-900">{selectedProduct.name}</h4>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        {selectedProduct.participants} votes enregistrés
                      </span>
                    </div>

                    {/* Stat Badges */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Note Moy.</div>
                        <div className="mt-1 text-xl font-black text-slate-900">
                          {selectedProduct.avgRating.toFixed(1)} / 5
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Prix Moy.</div>
                        <div className="mt-1 text-xl font-black text-slate-900">
                          {selectedProduct.priceAvg} {activeCampaign?.currency || 'MAD'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-indigo-50 p-3 text-center border border-indigo-100">
                        <div className="text-[11px] font-semibold text-indigo-700 uppercase">Médiane</div>
                        <div className="mt-1 text-xl font-black text-indigo-700">
                          {selectedProduct.priceMedian} {activeCampaign?.currency || 'MAD'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Fourchette</div>
                        <div className="mt-1 text-xs font-bold text-slate-800">
                          {selectedProduct.priceMin} - {selectedProduct.priceMax} {activeCampaign?.currency || 'MAD'}
                        </div>
                      </div>
                    </div>

                    {/* Strategic Price Positioning Card (PPC vs Prix Estimé) */}
                    {selectedProduct.suggestedPrice && (
                      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-indigo-700" />
                            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                              Prix Public Conseillé (PPC) : {selectedProduct.suggestedPrice} {activeCampaign?.currency || 'MAD'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-indigo-900/80">
                            Consentement public : <strong>{selectedProduct.priceAvg} {activeCampaign?.currency || 'MAD'}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedProduct.priceGapVsSuggested !== undefined && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black shadow-xs ${
                              selectedProduct.priceGapVsSuggested > 5
                                ? 'bg-emerald-600 text-white'
                                : selectedProduct.priceGapVsSuggested < -5
                                ? 'bg-amber-600 text-white'
                                : 'bg-indigo-600 text-white'
                            }`}>
                              {selectedProduct.priceGapVsSuggested > 0 ? `+${selectedProduct.priceGapVsSuggested}%` : `${selectedProduct.priceGapVsSuggested}%`}
                              {selectedProduct.priceGapVsSuggested > 5 ? ' (Forte valeur perçue)' : selectedProduct.priceGapVsSuggested < -5 ? ' (Sensible au prix)' : ' (Parfaitement aligné)'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rating Breakdown Bars */}
                    <div className="mt-6">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                        Distribution des notes
                      </h5>
                      <div className="space-y-2.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const pct =
                            selectedProduct.ratingDistribution[
                              star as 1 | 2 | 3 | 4 | 5
                            ] || 0;
                          const count =
                            selectedProduct.ratingCounts?.[
                              star as 1 | 2 | 3 | 4 | 5
                            ] || 0;

                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="w-16 text-xs font-bold text-slate-600">
                                {star} étoiles
                              </span>
                              <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`flex h-full items-center justify-end px-2.5 text-[11px] font-bold text-white transition-all duration-500 ${ratingBarColor(
                                    star
                                  )}`}
                                  style={{ width: `${Math.max(pct, 6)}%` }}
                                >
                                  {pct}%
                                </div>
                              </div>
                              <span className="w-12 text-right text-xs text-slate-400 font-medium">
                                ({count})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Multicriteria Evaluation Matrix */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                          Évaluation multicritères (Sur 5)
                        </h5>
                        <span className="text-[10px] font-bold text-slate-500">Moyenne des participants</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">🎨 Design & Style</span>
                            <span className="text-xs font-black text-indigo-700">
                              {(selectedProduct.criteriaAvg?.design ?? 4.2).toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{ width: `${Math.min(100, ((selectedProduct.criteriaAvg?.design ?? 4.2) / 5) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">💎 Finitions & Qualité</span>
                            <span className="text-xs font-black text-indigo-700">
                              {(selectedProduct.criteriaAvg?.quality ?? 4.1).toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{ width: `${Math.min(100, ((selectedProduct.criteriaAvg?.quality ?? 4.1) / 5) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">✨ Originalité</span>
                            <span className="text-xs font-black text-indigo-700">
                              {(selectedProduct.criteriaAvg?.originality ?? 4.0).toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{ width: `${Math.min(100, ((selectedProduct.criteriaAvg?.originality ?? 4.0) / 5) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">🛒 Intention d&apos;achat</span>
                            <span className="text-xs font-black text-emerald-700">
                              {(selectedProduct.criteriaAvg?.purchaseIntent ?? 3.9).toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-600"
                              style={{ width: `${Math.min(100, ((selectedProduct.criteriaAvg?.purchaseIntent ?? 3.9) / 5) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price Distribution Histogram */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                            Courbe de sensibilité prix
                          </span>
                          <h4 className="text-lg font-bold text-slate-900">
                            Distribution des prix estimés (MAD)
                          </h4>
                        </div>
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Volume d&apos;évaluations ventilé par tranches de prix estimées par les participants.
                      </p>

                      {/* SVG Bar Chart */}
                      <div className="mt-6 h-64 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
                        {(() => {
                          const maxCount = Math.max(
                            ...selectedProduct.priceHistogram.map((b) => b.count),
                            1
                          );

                          return selectedProduct.priceHistogram.map((bin, i) => {
                            const heightPct = Math.round((bin.count / maxCount) * 100);
                            return (
                              <div key={i} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                                {/* Hover Tooltip */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold rounded-md px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                                  {bin.count} votes • {bin.range} MAD
                                </div>
                                <div
                                  className="w-full rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 group-hover:scale-[1.02] shadow-sm"
                                  style={{ height: `${Math.max(heightPct, 6)}%` }}
                                />
                                <span className="mt-2 text-[10px] font-bold text-slate-500 rotate-[-35deg] sm:rotate-0 origin-center truncate">
                                  {bin.range}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                      <span>💡 <strong>Conseil de tarification :</strong></span>
                      <span>Le pic de consentement se situe autour de <strong>{selectedProduct.priceMedian} MAD</strong>.</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Gestion des Campagnes</h3>
                  <p className="text-xs text-slate-500">
                    Modifiez, supprimez ou créez des campagnes avec jusqu&apos;à 3 photos et une vidéo.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalErrorMessage(null);
                    setShowNewCampaignModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle campagne
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {campaigns.map((camp) => {
                  const displayTitle = lang === 'ar'
                    ? (camp.titleAr || translateFrenchToAr(camp.title))
                    : camp.title;
                  const displayDesc = lang === 'ar'
                    ? (camp.descriptionAr || translateFrenchToAr(camp.description))
                    : camp.description;
                  const altArTitle = camp.titleAr || translateFrenchToAr(camp.title);

                  return (
                    <div
                      key={camp.id}
                      className={`rounded-2xl border-2 p-5 shadow-sm transition flex flex-col justify-between ${
                        camp.active
                          ? 'border-indigo-600 bg-indigo-50/40 dark:border-indigo-500 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-base">{displayTitle}</h4>
                              {camp.active ? (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                  <CheckCircle className="h-3 w-3" />
                                  {lang === 'ar' ? 'نشطة' : 'Active'}
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                  {lang === 'ar' ? 'ثانوية' : 'Secondaire'}
                                </span>
                              )}
                              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                                {camp.currency || 'MAD'}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{displayDesc}</p>
                            {lang === 'fr' && altArTitle && altArTitle !== camp.title && (
                              <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium" dir="rtl">
                                🇸🇦 {altArTitle}
                              </p>
                            )}
                          </div>

                        {/* Campaign Action Buttons (QR/WA, Edit, Translate & Delete) */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleCampaign(camp)}
                            className="flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 p-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-xs"
                            title={lang === 'ar' ? 'تحديث الترجمة إلى العربية' : 'Mettre à jour la traduction en arabe'}
                          >
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQrModalCampaign(camp);
                              setShowQrModal(true);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
                            title="Générer QR code de comptoir & partage WhatsApp"
                          >
                            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                            <span>QR / WA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditCampaign(camp)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-xs"
                            title="Éditer la campagne"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteCampaign(camp)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-xs"
                            title="Supprimer la campagne"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Campaign Media Showcase (Photos + Video) */}
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        {camp.images && camp.images.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                              <ImageIcon className="h-3 w-3 text-slate-500" />
                              {camp.images.length} photo{camp.images.length > 1 ? 's' : ''}
                            </span>
                            <div className="flex -space-x-1.5">
                              {camp.images.slice(0, 3).map((img, i) => (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  key={i}
                                  src={img}
                                  alt="Visuel"
                                  className="h-6 w-6 rounded-md border border-white object-cover"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {camp.videoUrl && (
                          <span className="flex items-center gap-1 rounded-lg bg-indigo-100/80 px-2 py-1 text-[11px] font-bold text-indigo-800">
                            <Film className="h-3 w-3 text-indigo-600" />
                            Vidéo incluse
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Créée le {new Date(camp.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {!camp.active ? (
                        <button
                          type="button"
                          onClick={() => handleSwitchCampaign(camp.id)}
                          className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
                        >
                          Activer pour les visiteurs
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700">
                          Active en ligne
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* Products Management Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Catalogue des Produits & Articles</h3>
                  <p className="text-xs text-slate-500">
                    Adaptable à tout secteur (joaillerie, maroquinerie, montres, mode, etc.). Gestion des visuels, PPC et catégories.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQrModalCampaign(activeCampaign);
                      setShowQrModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    QR Code Comptoir
                  </button>
                  <button
                    onClick={() => {
                      setModalErrorMessage(null);
                      setShowNewProductModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un article
                  </button>
                </div>
              </div>

              {/* Category Filter Toolbar */}
              {(() => {
                const cats = Array.from(new Set(productStats.map((p) => p.category || 'Général').filter(Boolean)));
                if (cats.length <= 1) return null;
                return (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      Catégories :
                    </span>
                    <button
                      type="button"
                      onClick={() => setProductCategoryFilter('all')}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        productCategoryFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Toutes ({productStats.length})
                    </button>
                    {cats.map((cat) => {
                      const count = productStats.filter((p) => (p.category || 'Général') === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setProductCategoryFilter(cat)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                            productCategoryFilter === cat
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {productStats
                  .filter((p) => productCategoryFilter === 'all' || (p.category || 'Général') === productCategoryFilter)
                  .map((prod) => (
                  <div key={prod.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
                    <div>
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.images[0] || 'https://picsum.photos/seed/product/600/400'}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                            {prod.images.length} photo{prod.images.length > 1 ? 's' : ''}
                          </span>
                          {prod.videoUrl && (
                            <span className="flex items-center gap-1 rounded-lg bg-indigo-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur shadow-sm">
                              <Film className="h-3 w-3" />
                              Vidéo
                            </span>
                          )}
                        </div>

                        {/* Thumbnails of other photos */}
                        {prod.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            {prod.images.slice(1, 3).map((subImg, idx) => (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                key={idx}
                                src={subImg}
                                alt="Aperçu"
                                className="h-6 w-6 rounded-md border border-white object-cover shadow-sm"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-900 truncate">{prod.name}</h4>
                          <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                            {prod.category || 'Général'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                      </div>

                      {/* Pricing & PPC Gap Display */}
                      <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">★ Note : {prod.avgRating.toFixed(1)} / 5</span>
                          <span className="font-bold text-indigo-700">Estimé : {prod.priceAvg} {activeCampaign?.currency || 'MAD'}</span>
                        </div>
                        {prod.suggestedPrice && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                            <span className="text-slate-500 flex items-center gap-1 font-medium">
                              <Target className="h-3 w-3 text-indigo-500" />
                              PPC Cible : {prod.suggestedPrice} {activeCampaign?.currency || 'MAD'}
                            </span>
                            {prod.priceGapVsSuggested !== undefined && (
                              <span className={`font-bold px-1.5 py-0.5 rounded ${
                                prod.priceGapVsSuggested > 5
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prod.priceGapVsSuggested < -5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {prod.priceGapVsSuggested > 0 ? `+${prod.priceGapVsSuggested}%` : `${prod.priceGapVsSuggested}%`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Multicriteria Micro-Scores */}
                      <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] text-center font-bold text-slate-600 bg-slate-100/60 rounded-lg p-1.5">
                        <div title="Design & Style">🎨 {(prod.criteriaAvg?.design ?? 4.2).toFixed(1)}</div>
                        <div title="Finition & Qualité">💎 {(prod.criteriaAvg?.quality ?? 4.1).toFixed(1)}</div>
                        <div title="Originalité">✨ {(prod.criteriaAvg?.originality ?? 4.0).toFixed(1)}</div>
                        <div title="Intention d'achat">🛒 {(prod.criteriaAvg?.purchaseIntent ?? 3.9).toFixed(1)}</div>
                      </div>
                    </div>

                    {/* Actions Bar for Product (Edit & Delete & Analyze) */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <Pencil className="h-3 w-3" />
                          Éditer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteProduct(prod)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          setActiveTab('dashboard');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Analyser →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluations Feed Tab */}
          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Flux des Dernières Évaluations</h3>
                  <p className="text-xs text-slate-500">
                    Consultation en direct des votes et prix estimés soumis par les visiteurs.
                  </p>
                </div>
                <a
                  href="/api/stats/export"
                  download
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  <Download className="h-4 w-4" />
                  Télécharger CSV
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3.5">ID Évaluation</th>
                        <th className="px-6 py-3.5">Produit ID</th>
                        <th className="px-6 py-3.5 text-right">Note</th>
                        <th className="px-6 py-3.5 text-right">Prix Estimé</th>
                        <th className="px-6 py-3.5">Session Visiteur</th>
                        <th className="px-6 py-3.5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {recentEvaluations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                            Aucune évaluation récente enregistrée pour l&apos;instant. Les soumissions en direct apparaîtront ici.
                          </td>
                        </tr>
                      ) : (
                        recentEvaluations.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="px-6 py-3 font-mono text-slate-500">{item.id.slice(0, 16)}</td>
                            <td className="px-6 py-3 font-semibold text-slate-900">{item.productId}</td>
                            <td className="px-6 py-3 text-right">
                              <span className="font-bold text-amber-600">★ {item.rating} / 5</span>
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-indigo-700">
                              {item.estimatedPrice} MAD
                            </td>
                            <td className="px-6 py-3 font-mono text-slate-400">{item.participantSessionId}</td>
                            <td className="px-6 py-3 text-right text-slate-500">
                              {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Invitations & Diffusion Tab */}
          {activeTab === 'invitations' && (
            <EmailInvitationsManager
              campaigns={campaigns}
              activeCampaign={activeCampaign}
              onRefreshStats={loadData}
            />
          )}
        </main>
      </div>

      {/* Modal: New Campaign */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  <Layers className="h-4 w-4" />
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Nouvelle Campagne</h4>
              </div>
              <button
                onClick={() => {
                  setShowNewCampaignModal(false);
                  setModalErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg p-1 transition"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* In-modal Error Banner */}
            {modalErrorMessage && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/80 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{modalErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => setModalErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Titre de la campagne (Français) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoTranslateNewCampaign}
                    disabled={isTranslatingNewCamp || !newCampTitle.trim()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    {isTranslatingNewCamp ? 'Traduction en cours...' : '✨ Traduire en arabe (Auto)'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex : Collection Automne 2026 - Haute Joaillerie"
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  onBlur={() => {
                    if (!newCampTitleAr.trim() && newCampTitle.trim()) {
                      setNewCampTitleAr(translateFrenchToAr(newCampTitle.trim()));
                    }
                  }}
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Titre de la campagne en Arabe (العنوان بالعربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال : تشكيلة خريف 2026 - مجوهرات راقية"
                  value={newCampTitleAr}
                  onChange={(e) => setNewCampTitleAr(e.target.value)}
                  className="h-10 w-full rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/40 text-slate-900 dark:text-indigo-100 placeholder-indigo-300 dark:placeholder-indigo-600/70 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none text-right font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Devise</label>
                  <select
                    value={newCampCurrency}
                    onChange={(e) => setNewCampCurrency(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white"
                  >
                    <option value="MAD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">MAD (Dirham Marocain)</option>
                    <option value="EUR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">EUR (€)</option>
                    <option value="USD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">USD ($)</option>
                    <option value="CHF" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">CHF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Vidéo de présentation (optionnel)
                  </label>
                  <input
                    type="url"
                    placeholder="URL YouTube ou vidéo MP4"
                    value={newCampVideoUrl}
                    onChange={(e) => setNewCampVideoUrl(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Description (Français)</label>
                <textarea
                  rows={2}
                  placeholder="Ex : Session d'évaluation de nos dernières créations auprès d'un panel sélectionné..."
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  onBlur={() => {
                    if (!newCampDescAr.trim() && newCampDesc.trim()) {
                      setNewCampDescAr(translateFrenchToAr(newCampDesc.trim()));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Description en Arabe (الوصف بالعربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="مثال : جلسة تقييم لتصاميمنا الحصرية الجديدة لتحديد معايير الجودة والأسعار..."
                  value={newCampDescAr}
                  onChange={(e) => setNewCampDescAr(e.target.value)}
                  className="w-full rounded-xl border border-indigo-200 dark:border-indigo-800 p-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-indigo-50/40 dark:bg-indigo-950/40 text-slate-900 dark:text-indigo-100 placeholder-indigo-300 dark:placeholder-indigo-600/70 text-right font-medium"
                />
              </div>

              {/* 3 Photos de la campagne */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Photos de la campagne (jusqu&apos;à 3 visuels)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bannière, lookbook, atelier</span>
                </div>

                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                      {newCampImages[idx] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={newCampImages[idx]}
                          alt={`Photo ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder={`URL Photo ${idx + 1} ${idx === 0 ? '(Bannière principale)' : '(Optionnelle)'}`}
                      value={newCampImages[idx] || ''}
                      onChange={(e) => {
                        const copy = [...newCampImages];
                        copy[idx] = e.target.value;
                        setNewCampImages(copy);
                      }}
                      className="h-9 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCampaignModal(false);
                    setModalErrorMessage(null);
                  }}
                  className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition"
                >
                  Créer la campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Campaign */}
      {showEditCampaignModal && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  <Pencil className="h-4 w-4" />
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Éditer la Campagne</h4>
              </div>
              <button
                onClick={() => {
                  setShowEditCampaignModal(false);
                  setEditingCampaign(null);
                  setModalErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg p-1 transition"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* In-modal Error Banner */}
            {modalErrorMessage && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/80 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{modalErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => setModalErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveEditCampaign} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Titre de la campagne (Français) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoTranslateEditCampaign}
                    disabled={isTranslatingEditCamp || !editCampTitle.trim()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    {isTranslatingEditCamp ? 'Traduction en cours...' : '✨ Traduire en arabe (Auto)'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editCampTitle}
                  onChange={(e) => setEditCampTitle(e.target.value)}
                  onBlur={() => {
                    if (!editCampTitleAr.trim() && editCampTitle.trim()) {
                      setEditCampTitleAr(translateFrenchToAr(editCampTitle.trim()));
                    }
                  }}
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Titre de la campagne en Arabe (العنوان بالعربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="العنوان باللغة العربية"
                  value={editCampTitleAr}
                  onChange={(e) => setEditCampTitleAr(e.target.value)}
                  className="h-10 w-full rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/40 text-slate-900 dark:text-indigo-100 placeholder-indigo-300 dark:placeholder-indigo-600/70 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none text-right font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Devise</label>
                  <select
                    value={editCampCurrency}
                    onChange={(e) => setEditCampCurrency(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white"
                  >
                    <option value="MAD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">MAD (Dirham Marocain)</option>
                    <option value="EUR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">EUR (€)</option>
                    <option value="USD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">USD ($)</option>
                    <option value="CHF" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">CHF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Vidéo de présentation (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="URL YouTube ou vidéo MP4"
                    value={editCampVideoUrl}
                    onChange={(e) => setEditCampVideoUrl(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Description (Français)</label>
                <textarea
                  rows={2}
                  value={editCampDesc}
                  onChange={(e) => setEditCampDesc(e.target.value)}
                  onBlur={() => {
                    if (!editCampDescAr.trim() && editCampDesc.trim()) {
                      setEditCampDescAr(translateFrenchToAr(editCampDesc.trim()));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Description en Arabe (الوصف بالعربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="الوصف باللغة العربية"
                  value={editCampDescAr}
                  onChange={(e) => setEditCampDescAr(e.target.value)}
                  className="w-full rounded-xl border border-indigo-200 dark:border-indigo-800 p-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-indigo-50/40 dark:bg-indigo-950/40 text-slate-900 dark:text-indigo-100 placeholder-indigo-300 dark:placeholder-indigo-600/70 text-right font-medium"
                />
              </div>

              {/* 3 Photos de la campagne */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  3 Photos de la campagne
                </span>

                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                      {editCampImages[idx] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={editCampImages[idx]}
                          alt={`Photo ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder={`URL Photo ${idx + 1} ${idx === 0 ? '(Principale)' : '(Optionnelle)'}`}
                      value={editCampImages[idx] || ''}
                      onChange={(e) => {
                        const copy = [...editCampImages];
                        copy[idx] = e.target.value;
                        setEditCampImages(copy);
                      }}
                      className="h-9 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                ))}
              </div>

              {/* Toggle Campagne Active */}
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={editCampActive}
                  onChange={(e) => setEditCampActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Définir comme la campagne active pour les visiteurs
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCampaignModal(false);
                    setEditingCampaign(null);
                    setModalErrorMessage(null);
                  }}
                  className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Campaign */}
      {campaignToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Supprimer la campagne ?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              Êtes-vous sûr de vouloir supprimer la campagne <strong>« {campaignToDelete.title} »</strong> ?
              Tous les bijoux, votes et invitations associés à cette campagne seront effacés.
            </p>

            {campaigns.length <= 1 && (
              <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-2.5 text-xs text-amber-800 dark:text-amber-200 font-semibold">
                ⚠️ Il s&apos;agit de la dernière campagne restante. Vous ne pouvez pas la supprimer.
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setCampaignToDelete(null)}
                className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={campaigns.length <= 1 || isDeletingCampaign}
                onClick={handleConfirmDeleteCampaign}
                className="h-10 flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white disabled:opacity-50 transition shadow-md"
              >
                {isDeletingCampaign ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Product (3 Photos + 1 Video) */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  <Package className="h-4 w-4" />
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Ajouter une Pièce de Bijou</h4>
              </div>
              <button
                onClick={() => {
                  setShowNewProductModal(false);
                  setModalErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg p-1 transition"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* In-modal Error Banner */}
            {modalErrorMessage && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/80 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{modalErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => setModalErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Nom de l&apos;article <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Sac Cuir Véritable, Montre Chronographe, Bracelet Or..."
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Catégorie & Prix Public Conseillé (PPC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Catégorie de l&apos;article <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white font-medium"
                  >
                    {DEFAULT_PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">➕ Nouvelle catégorie personnalisée...</option>
                  </select>
                  {newProdCategory === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Nom de la nouvelle catégorie..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="mt-2 h-9 w-full rounded-xl border border-indigo-300 dark:border-indigo-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-indigo-50/40 dark:bg-indigo-950/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center justify-between">
                    <span>Prix Public Conseillé (PPC)</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Recommandé</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ex : 250"
                      value={newProdSuggestedPrice}
                      onChange={(e) => setNewProdSuggestedPrice(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-3 text-xs font-semibold focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
                      {activeCampaign?.currency || 'MAD'}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Tarif cible pour évaluer l&apos;écart d&apos;acceptabilité.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Matières, finitions, fabrication artisanale, caratage ou caractéristiques..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-2.5 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* 3 Photos Section */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    3 Photos du bijou (Face, portée, détail)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdImages([
                        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
                        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
                        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop',
                      ]);
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Exemples HD
                  </button>
                </div>

                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                      {newProdImages[idx] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={newProdImages[idx]}
                          alt={`Photo ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder={`URL Photo ${idx + 1} ${idx === 0 ? '(Principale obligatoire)' : '(Angle secondaire)'}`}
                      value={newProdImages[idx] || ''}
                      onChange={(e) => {
                        const copy = [...newProdImages];
                        copy[idx] = e.target.value;
                        setNewProdImages(copy);
                      }}
                      className="h-9 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                ))}
              </div>

              {/* 1 Vidéo Section */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Film className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  1 Vidéo de présentation (YouTube ou direct .mp4)
                </span>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... ou lien MP4"
                  value={newProdVideoUrl}
                  onChange={(e) => setNewProdVideoUrl(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  La vidéo s&apos;affichera sous forme de bouton interactif dans la galerie du bijou.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProductModal(false);
                    setModalErrorMessage(null);
                  }}
                  className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition"
                >
                  Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product (3 Photos + 1 Video) */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                  <Pencil className="h-4 w-4" />
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Éditer le Bijou</h4>
              </div>
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                  setModalErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg p-1 transition"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* In-modal Error Banner */}
            {modalErrorMessage && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/80 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="flex-1">{modalErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => setModalErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveEditProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Nom de l&apos;article <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-3 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Catégorie & Prix Public Conseillé (PPC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Catégorie de l&apos;article <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white font-medium"
                  >
                    {DEFAULT_PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">➕ Nouvelle catégorie personnalisée...</option>
                  </select>
                  {editProdCategory === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Nom de la nouvelle catégorie..."
                      value={editCustomCategoryInput}
                      onChange={(e) => setEditCustomCategoryInput(e.target.value)}
                      className="mt-2 h-9 w-full rounded-xl border border-indigo-300 dark:border-indigo-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-indigo-50/40 dark:bg-indigo-950/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center justify-between">
                    <span>Prix Public Conseillé (PPC)</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Recommandé</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ex : 250"
                      value={editProdSuggestedPrice}
                      onChange={(e) => setEditProdSuggestedPrice(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-3 text-xs font-semibold focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
                      {activeCampaign?.currency || 'MAD'}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Tarif cible pour évaluer l&apos;écart d&apos;acceptabilité.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-2.5 text-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* 3 Photos Section */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  3 Photos du bijou
                </span>

                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                      {editProdImages[idx] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={editProdImages[idx]}
                          alt={`Photo ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder={`URL Photo ${idx + 1} ${idx === 0 ? '(Principale)' : '(Optionnelle)'}`}
                      value={editProdImages[idx] || ''}
                      onChange={(e) => {
                        const copy = [...editProdImages];
                        copy[idx] = e.target.value;
                        setEditProdImages(copy);
                      }}
                      className="h-9 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                ))}
              </div>

              {/* 1 Vidéo Section */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Film className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  1 Vidéo de présentation
                </span>
                <input
                  type="url"
                  placeholder="URL YouTube ou direct MP4"
                  value={editProdVideoUrl}
                  onChange={(e) => setEditProdVideoUrl(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-xs focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                    setModalErrorMessage(null);
                  }}
                  className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Product */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Supprimer le bijou ?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cette action retirera la pièce du catalogue.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              Voulez-vous vraiment retirer le modèle <strong>« {productToDelete.name} »</strong> du catalogue de cette campagne ?
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="h-10 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={handleConfirmDeleteProduct}
                className="h-10 flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-md"
              >
                {isDeletingProduct ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code & WhatsApp Counter Modal */}
      <CounterQrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        campaign={qrModalCampaign || activeCampaign}
      />
    </div>
  );
}
