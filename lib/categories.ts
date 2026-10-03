export interface ProductCategoryItem {
  id: string;
  name: string;
  icon?: string;
  sector: string;
}

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { id: 'cat-joaillerie', name: 'Joaillerie & Bijoux', icon: '💎', sector: 'Haute Joaillerie' },
  { id: 'cat-horlogerie', name: 'Horlogerie & Montres', icon: '⌚', sector: 'Horlogerie' },
  { id: 'cat-maroquinerie', name: 'Maroquinerie & Sacs', icon: '👜', sector: 'Cuir & Maroquinerie' },
  { id: 'cat-mode', name: 'Mode & Prêt-à-porter', icon: '👗', sector: 'Mode & Textile' },
  { id: 'cat-parfums', name: 'Parfums & Cosmétiques', icon: '✨', sector: 'Beauté & Fragrance' },
  { id: 'cat-mobilier', name: 'Mobilier & Design', icon: '🛋️', sector: 'Maison & Décoration' },
  { id: 'cat-tech', name: 'High-Tech & Audio', icon: '🎧', sector: 'High-Tech & Innovation' },
  { id: 'cat-art', name: "Objets d'art & Décoration", icon: '🎨', sector: 'Art & Artisanat' },
  { id: 'cat-accessoires', name: 'Lunettes & Accessoires', icon: '👓', sector: 'Accessoires' },
  { id: 'cat-epicerie', name: 'Gastronomie & Spiritueux', icon: '🍾', sector: 'Luxe Gourmand' },
];

export const ALL_SECTORS = [
  'Multi-secteurs (Général)',
  'Haute Joaillerie & Orfèvrerie',
  'Horlogerie & Garde-temps',
  'Maroquinerie & Cuir de prestige',
  'Mode, Textile & Prêt-à-porter',
  'Parfumerie, Cosmétique & Bien-être',
  'Mobilier d’Art & Décoration Intérieure',
  'High-Tech, Audio & Objets connectés',
  'Artisanat d’Art & Créateurs',
];
