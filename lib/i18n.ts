export type Language = 'fr' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  campaignTitleDefault: string;
  campaignDescDefault: string;
  activeCampaignBadge: string;
  progression: string;
  validatedProducts: string;
  adminDashboard: string;
  backToVisitor: string;
  vipInviteWelcome: string;
  vipInviteSub: string;
  vipInviteBadge: string;
  instructionsTitle: string;
  instruction1: string;
  instruction2: string;
  instruction3: string;
  instruction4: string;
  categoryFilterLabel: string;
  allArticles: string;
  watchVideo: string;
  viewVisuals: string;
  shareWhatsApp: string;
  overallRating: string;
  rateOutOfFive: string;
  detailedCriteria: string;
  designCriterion: string;
  qualityCriterion: string;
  originalityCriterion: string;
  intentCriterion: string;
  estimatedPrice: string;
  validateProduct: string;
  productValidated: string;
  markInterested: string;
  interestRecorded: string;
  interestSaveError: string;
  interestedCount: string;
  savingInProgress: string;
  doubleClickZoom: string;
  mediaCountInfo: string;
  fullscreen: string;
  zoom: string;
  completedTitle: string;
  completedDesc: string;
  completedBadge: string;
  joinOffersPrompt: string;
  joinWhatsApp: string;
  joinTelegram: string;
  darkMode: string;
  lightMode: string;
  language: string;
  themeToggle: string;
  logout: string;
  login: string;
  adminPortal: string;
  campaignsTab: string;
  productsTab: string;
  evaluationsTab: string;
  invitationsTab: string;
  dashboardTab: string;
  categories: Record<string, string>;
  ratingLabels: Record<number, string>;
  intentLabels: Record<number, { label: string; desc: string }>;
  suggestedPriceLabel: string;
  yourEstimateLabel: string;
  enterPricePlaceholder: string;
  requiredRatingError: string;
  close: string;
  next: string;
  prev: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  fr: {
    appName: 'Évaluation bijoux septembre 2026',
    appSubtitle: 'Campagne active • Validation produit par produit • Estimation en Dirham marocain (MAD)',
    campaignTitleDefault: '💎 Évaluation bijoux septembre 2026',
    campaignDescDefault: 'Campagne active • Validation produit par produit • Estimation en Dirham marocain (MAD)',
    activeCampaignBadge: 'Campagne Active',
    progression: 'Progression',
    validatedProducts: 'validés',
    adminDashboard: 'Tableau de bord Admin',
    backToVisitor: 'Retour vue visiteur',
    vipInviteWelcome: "Bienvenue sur votre espace d'évaluation privé.",
    vipInviteSub: 'Vous participez grâce au lien de campagne reçu par email ou WhatsApp.',
    vipInviteBadge: 'Invitation VIP',
    instructionsTitle: "📋 Consignes d'évaluation",
    instruction1: "Attribuez une note globale (et affinez par critères de Design, Finition, Intention d'achat).",
    instruction2: 'Indiquez le prix de vente estimé dans la devise indiquée (MAD).',
    instruction3: 'Cliquez sur « Valider ce produit » pour enregistrer votre avis.',
    instruction4: 'Double-cliquez sur les photos ou lancez la vidéo pour examiner les détails en haute résolution.',
    categoryFilterLabel: 'Filtrer par catégorie :',
    allArticles: 'Tous les articles',
    watchVideo: 'Regarder la vidéo de la collection',
    viewVisuals: 'Voir les visuels de la collection',
    shareWhatsApp: 'Partager sur WhatsApp',
    overallRating: 'Note globale',
    rateOutOfFive: 'Notez sur 5',
    detailedCriteria: "Critères détaillés (Design, Finition, Intention d'achat)",
    designCriterion: '🎨 Design & Esthétique',
    qualityCriterion: '💎 Qualité & Finitions perçues',
    originalityCriterion: '✨ Originalité & Coup de cœur',
    intentCriterion: "🛒 Intention d'achat",
    estimatedPrice: 'Prix estimé',
    validateProduct: 'Valider ce produit',
    productValidated: 'Produit validé ✓',
    savingInProgress: 'Enregistrement en cours...',
    markInterested: 'Ce produit m’intéresse',
    interestRecorded: 'Votre intérêt est enregistré',
    interestSaveError: 'Impossible d’enregistrer votre intérêt. Réessayez.',
    interestedCount: 'Intéressés',
    doubleClickZoom: 'Double-cliquez pour zoomer',
    mediaCountInfo: '3 photos & 1 vidéo disponibles',
    fullscreen: 'Plein écran',
    zoom: 'Zoom',
    completedTitle: 'Félicitations ! Vos évaluations sont bien enregistrées.',
    completedDesc: 'Vous avez validé l’intégralité des articles de cette campagne. Vos estimations précieuses permettent d’ajuster notre offre et nos prix de lancement.',
    completedBadge: 'Participation enregistrée sous',
    joinOffersPrompt: 'Recevez nos prochaines offres en rejoignant notre groupe WhatsApp ou Telegram.',
    joinWhatsApp: 'Rejoindre le groupe WhatsApp',
    joinTelegram: 'Rejoindre le groupe Telegram',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    language: 'Langue',
    themeToggle: 'Changer de thème',
    logout: 'Déconnexion',
    login: 'Connexion Admin',
    adminPortal: 'Portail Gestion & Statistiques',
    campaignsTab: 'Campagnes',
    productsTab: 'Articles & Bijoux',
    evaluationsTab: 'Évaluations',
    invitationsTab: 'Invitations & Relances',
    dashboardTab: 'Tableau de bord',
    categories: {
      'all': 'Tous les articles',
      'Bracelets': 'Bracelets',
      'Colliers': 'Colliers',
      'Bagues': 'Bagues',
      'Boucles': 'Boucles d’oreilles',
      "Boucles d'oreilles": 'Boucles d’oreilles',
      'Joaillerie & Bijoux': 'Joaillerie & Bijoux',
      'Horlogerie & Montres': 'Horlogerie & Montres',
      'Maroquinerie & Sacs': 'Maroquinerie & Sacs',
      'Général': 'Général',
    },
    ratingLabels: {
      1: 'Décevant',
      2: 'Passable',
      3: 'Correct',
      4: 'Très bien',
      5: 'Coup de cœur !',
    },
    intentLabels: {
      1: { label: 'Très peu probable', desc: 'Ne correspond pas à mes attentes' },
      2: { label: 'Peu probable', desc: 'Hésitant' },
      3: { label: 'Moyenne', desc: 'Pourquoi pas' },
      4: { label: 'Probable', desc: 'Intéressé' },
      5: { label: 'Certaine / Coup de cœur', desc: 'Achat immédiat' },
    },
    suggestedPriceLabel: 'Prix indicatif fabricant',
    yourEstimateLabel: 'Votre estimation du prix',
    enterPricePlaceholder: 'Ex: 180',
    requiredRatingError: 'Veuillez attribuer une note entre 1 et 5 étoiles.',
    close: 'Fermer',
    next: 'Suivant',
    prev: 'Précédent',
  },
  ar: {
    appName: 'تقييم مجوهرات سبتمبر 2026',
    appSubtitle: 'حملة تقييم نشطة • تقييم قطعة بقطعة • تقدير السعر بالدرهم المغربي (MAD)',
    campaignTitleDefault: '💎 تقييم مجوهرات سبتمبر 2026',
    campaignDescDefault: 'حملة تقييم نشطة • تقييم قطعة بقطعة • تقدير السعر بالدرهم المغربي (MAD)',
    activeCampaignBadge: 'حملة نشطة',
    progression: 'نسبة التقدم',
    validatedProducts: 'تم تقييمها',
    adminDashboard: 'لوحة تحكم المشرف',
    backToVisitor: 'الرجوع لعرض الزائر',
    vipInviteWelcome: 'أهلاً بكم في فضاء التقييم الخاص والحصري.',
    vipInviteSub: 'تشاركون معنا عبر رابط الحملة الحصري المرسل عبر البريد أو واتساب.',
    vipInviteBadge: 'دعوة VIP خاصة',
    instructionsTitle: '📋 إرشادات وتعليمات التقييم',
    instruction1: 'ضع تقييمًا عامًا (مع تحديد معايير التصميم، جودة الصنع، ورغبة الشراء).',
    instruction2: 'أدخل السعر التقديري المقترح بالدرهم المغربي (MAD).',
    instruction3: 'اضغط على «تأكيد تقييم هذا المنتج» لتسجيل رأيك بنجاح.',
    instruction4: 'انقر نقرًا مزدوجًا على الصور أو شاهد الفيديو لمعاينة التفاصيل بدقة عالية.',
    categoryFilterLabel: 'تصفية حسب الصنف :',
    allArticles: 'جميع المعروضات',
    watchVideo: 'مشاهدة فيديو التشكيلة',
    viewVisuals: 'معاينة صور التشكيلة',
    shareWhatsApp: 'مشاركة عبر واتساب',
    overallRating: 'التقييم الإجمالي',
    rateOutOfFive: 'تقييم من 5 نجوم',
    detailedCriteria: 'معايير مفصلة (التصميم، الجودة، الرغبة بالشراء)',
    designCriterion: '🎨 التصميم والأناقة',
    qualityCriterion: '💎 جودة الصنع واللمسات المتقنة',
    originalityCriterion: '✨ الأصالة والإعجاب الفوري',
    intentCriterion: '🛒 الرغبة ونية الشراء',
    estimatedPrice: 'السعر التقديري',
    validateProduct: 'تأكيد تقييم هذا المنتج',
    productValidated: 'تم حفظ التقييم بنجاح ✓',
    savingInProgress: 'جاري الحفظ الآن...',
    markInterested: 'هذا المنتج يهمني',
    interestRecorded: 'تم تسجيل اهتمامكم',
    interestSaveError: 'تعذر تسجيل اهتمامكم. حاولوا مرة أخرى.',
    interestedCount: 'المهتمون',
    doubleClickZoom: 'انقر مرتين للتكبير',
    mediaCountInfo: '3 صور وفيديو متوفر للمعاينة',
    fullscreen: 'ملء الشاشة',
    zoom: 'تكبير',
    completedTitle: 'تهانينا! تم تسجيل كافة تقييماتكم بنجاح.',
    completedDesc: 'لقد قمتم بتقييم كافة قطع هذه الحملة. تقديراتكم القيّمة تساعدنا على ضبط تشكيلاتنا وأسعار الإطلاق بدقة.',
    completedBadge: 'المشاركة مسجلة برقم',
    joinOffersPrompt: 'للتوصل بعروضنا القادمة، انضم إلى مجموعتنا على واتساب أو تيليجرام.',
    joinWhatsApp: 'انضم إلى مجموعة واتساب',
    joinTelegram: 'انضم إلى مجموعة تيليجرام',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    themeToggle: 'تغيير السمة',
    logout: 'تسجيل الخروج',
    login: 'دخول المشرف',
    adminPortal: 'بوابة الإدارة والإحصائيات',
    campaignsTab: 'الحملات',
    productsTab: 'المعروضات والمجوهرات',
    evaluationsTab: 'التقييمات',
    invitationsTab: 'الدعوات والتنبيهات',
    dashboardTab: 'لوحة التحكم',
    categories: {
      'all': 'جميع المعروضات',
      'Bracelets': 'أساور',
      'Colliers': 'قلائد وعقود',
      'Bagues': 'خواتم',
      'Boucles': 'أقراط وحلق',
      "Boucles d'oreilles": 'أقراط وحلق',
      'Joaillerie & Bijoux': 'مجوهرات وحلي',
      'Horlogerie & Montres': 'ساعات فاخرة',
      'Maroquinerie & Sacs': 'حقائب وجلديات',
      'Général': 'عام',
    },
    ratingLabels: {
      1: 'مخيب للتوقعات',
      2: 'مقبول',
      3: 'جيد ومناسب',
      4: 'ممتاز جداً',
      5: 'إعجاب تام واستثنائي !',
    },
    intentLabels: {
      1: { label: 'غير محتمل إطلاقاً', desc: 'لا يناسب اهتماماتي' },
      2: { label: 'غير مرجح', desc: 'متردد بشأنه' },
      3: { label: 'متوسط', desc: 'ممكن مستقبلاً' },
      4: { label: 'مرجح جداً', desc: 'مهتم بالاقتناء' },
      5: { label: 'شراء مؤكد / رغبة فورية', desc: 'اقتناء مباشر بدون تردد' },
    },
    suggestedPriceLabel: 'السعر الإرشادي للمصنع',
    yourEstimateLabel: 'تقديرك لسعر البيع',
    enterPricePlaceholder: 'مثال: 180',
    requiredRatingError: 'يرجى وضع تقييم بين نجمة واحدة و5 نجوم.',
    close: 'إغلاق',
    next: 'التالي',
    prev: 'السابق',
  },
};

export function getTranslation(lang: Language = 'fr'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.fr;
}

export default getTranslation;
