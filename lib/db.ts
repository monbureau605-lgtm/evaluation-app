import { Product, Evaluation, Campaign, ProductStats, GlobalStats, PriceBin, EmailInvitation, InvitationBatch } from './types';
import { translateFrenchToAr } from './translator';

interface StoreData {
  campaigns: Campaign[];
  products: Product[];
  evaluations: Evaluation[];
  invitations?: EmailInvitation[];
  invitationBatches?: InvitationBatch[];
  // Baseline synthetic stats to enrich prototype historical volume
  baselineStats?: Record<string, {
    participants: number;
    avgRating: number;
    priceAvg: number;
    priceMedian: number;
    priceMin: number;
    priceMax: number;
    rating: { 5: number; 4: number; 3: number; 2: number; 1: number };
    priceHist: number[];
  }>;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    title: '💎 Évaluation & Étude Collections Prestige 2026',
    description: 'Campagne active • Validation multi-secteurs article par article • Étude de marché & pricing',
    active: true,
    currency: 'MAD',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
    ],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'camp-2',
    title: '✨ Collection Prestige Cuir & Maroquinerie 2026',
    description: 'Campagne clôturée • 8 articles • 520 participants',
    active: false,
    currency: 'MAD',
    createdAt: '2026-06-15T08:00:00Z',
  },
  {
    id: 'camp-3',
    title: '🌿 Ligne Éco-Responsable Printemps 2026',
    description: 'Campagne archivée • 5 produits • 310 participants',
    active: false,
    currency: 'MAD',
    createdAt: '2026-03-10T08:00:00Z',
  },
  {
    id: 'camp-4',
    title: '💍 Saint-Valentin Édition Limitée 2026',
    description: 'Campagne archivée • 4 produits • 640 participants',
    active: false,
    currency: 'MAD',
    createdAt: '2026-02-01T08:00:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    campaignId: 'camp-1',
    name: 'Bracelet Acier Inoxydable',
    description: 'Bracelet minimaliste en acier inoxydable, finition polie haute résistance.',
    category: 'Bracelets',
    suggestedPrice: 160,
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1602751584552-0b3d3a5b0e0d?w=800&h=800&fit=crop',
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: '2',
    campaignId: 'camp-1',
    name: 'Collier Perles Naturelles',
    description: 'Collier élégant avec perles de culture véritables et fermoir argent.',
    category: 'Colliers',
    suggestedPrice: 200,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: '3',
    campaignId: 'camp-1',
    name: 'Bague Argent 925',
    description: 'Bague ajustable en argent massif 925 avec pierre semi-précieuse facettée.',
    category: 'Bagues',
    suggestedPrice: 175,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
    ],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: '4',
    campaignId: 'camp-1',
    name: "Boucles d'Oreilles Dorées",
    description: "Boucles d'oreilles pendantes géométriques plaqué or 18 carats.",
    category: 'Boucles',
    suggestedPrice: 160,
    images: [
      'https://images.unsplash.com/photo-1635767798638-3665a0a107cf?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: '5',
    campaignId: 'camp-1',
    name: 'Pendentif Cristal',
    description: 'Pendentif en cristal de roche naturel taillé à la main avec bélière fine.',
    category: 'Colliers',
    suggestedPrice: 140,
    images: [
      'https://images.unsplash.com/photo-1602751584552-0b3d3a5b0e0d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1635767798638-3665a0a107cf?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
    ],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: '6',
    campaignId: 'camp-1',
    name: 'Bracelet Cuir Tressé',
    description: 'Bracelet artisanal en cuir véritable tressé avec fermoir magnétique inox.',
    category: 'Bracelets',
    suggestedPrice: 120,
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1635767798638-3665a0a107cf?w=800&h=800&fit=crop',
    ],
    createdAt: '2026-09-01T08:00:00Z',
  },
];

const BASELINE_STATS: Record<string, {
  participants: number;
  avgRating: number;
  priceAvg: number;
  priceMedian: number;
  priceMin: number;
  priceMax: number;
  rating: { 5: number; 4: number; 3: number; 2: number; 1: number };
  priceHist: number[];
}> = {
  '1': {
    participants: 247,
    avgRating: 4.3,
    priceAvg: 149,
    priceMedian: 150,
    priceMin: 80,
    priceMax: 250,
    rating: { 5: 52, 4: 27, 3: 13, 2: 5, 1: 3 },
    priceHist: [12, 28, 45, 68, 52, 32, 28],
  },
  '2': {
    participants: 232,
    avgRating: 4.1,
    priceAvg: 219,
    priceMedian: 220,
    priceMin: 120,
    priceMax: 380,
    rating: { 5: 45, 4: 30, 3: 15, 2: 6, 1: 4 },
    priceHist: [5, 12, 24, 48, 66, 42, 35],
  },
  '3': {
    participants: 218,
    avgRating: 3.8,
    priceAvg: 165,
    priceMedian: 160,
    priceMin: 90,
    priceMax: 290,
    rating: { 5: 35, 4: 28, 3: 20, 2: 10, 1: 7 },
    priceHist: [8, 20, 38, 59, 47, 30, 16],
  },
  '4': {
    participants: 203,
    avgRating: 4.5,
    priceAvg: 185,
    priceMedian: 180,
    priceMin: 100,
    priceMax: 320,
    rating: { 5: 61, 4: 22, 3: 10, 2: 4, 1: 3 },
    priceHist: [6, 15, 28, 54, 60, 28, 12],
  },
  '5': {
    participants: 194,
    avgRating: 3.6,
    priceAvg: 132,
    priceMedian: 130,
    priceMin: 70,
    priceMax: 240,
    rating: { 5: 28, 4: 25, 3: 22, 2: 14, 1: 11 },
    priceHist: [14, 26, 42, 50, 35, 20, 7],
  },
  '6': {
    participants: 176,
    avgRating: 4.0,
    priceAvg: 118,
    priceMedian: 115,
    priceMin: 60,
    priceMax: 210,
    rating: { 5: 41, 4: 27, 3: 17, 2: 9, 1: 6 },
    priceHist: [18, 32, 46, 40, 25, 12, 3],
  },
};

const STORE_ID = 'primary';

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be configured');
  return { url: url.replace(/\/$/, ''), key };
}

async function ensureStore(): Promise<StoreData> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/app_state?id=eq.${STORE_ID}&select=data`, {
    headers: { apikey: key },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase read failed (${response.status})`);
  const rows = await response.json() as Array<{ data: StoreData }>;
  if (rows[0]?.data?.campaigns) return rows[0].data;

  const freshStore: StoreData = {
    campaigns: INITIAL_CAMPAIGNS,
    products: INITIAL_PRODUCTS,
    evaluations: [],
    baselineStats: BASELINE_STATS,
  };
  await saveStore(freshStore);
  return freshStore;
}

async function saveStore(store: StoreData): Promise<void> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/app_state`, {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ id: STORE_ID, data: store }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase write failed (${response.status})`);
}

export async function getCampaigns(): Promise<Campaign[]> {
  const store = await ensureStore();
  return store.campaigns;
}

export async function getActiveCampaign(): Promise<Campaign> {
  const store = await ensureStore();
  const active = store.campaigns.find((c) => c.active);
  return active || store.campaigns[0];
}

export async function setActiveCampaign(campaignId: string): Promise<Campaign | null> {
  const store = await ensureStore();
  const exists = store.campaigns.find((c) => c.id === campaignId);
  if (!exists) return null;

  store.campaigns = store.campaigns.map((c) => ({
    ...c,
    active: c.id === campaignId,
  }));
  await saveStore(store);
  return exists;
}

export async function createCampaign(data: {
  title: string;
  description: string;
  titleAr?: string;
  descriptionAr?: string;
  currency?: string;
  videoUrl?: string;
  images?: string[];
}): Promise<Campaign> {
  const store = await ensureStore();
  const title = data.title.trim();
  const description = data.description.trim();
  const titleAr = data.titleAr && data.titleAr.trim() ? data.titleAr.trim() : translateFrenchToAr(title);
  const descriptionAr = data.descriptionAr && data.descriptionAr.trim() ? data.descriptionAr.trim() : translateFrenchToAr(description);

  const newCamp: Campaign = {
    id: `camp-${Date.now()}`,
    title,
    description,
    titleAr,
    descriptionAr,
    active: false,
    currency: data.currency || 'MAD',
    videoUrl: data.videoUrl,
    images: data.images,
    createdAt: new Date().toISOString(),
  };
  store.campaigns.push(newCamp);
  await saveStore(store);
  return newCamp;
}

export async function updateCampaign(
  id: string,
  data: {
    title?: string;
    description?: string;
    titleAr?: string;
    descriptionAr?: string;
    currency?: string;
    active?: boolean;
    videoUrl?: string;
    images?: string[];
  }
): Promise<Campaign | null> {
  const store = await ensureStore();
  const index = store.campaigns.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = store.campaigns[index];
  const newTitle = data.title !== undefined ? data.title.trim() : current.title;
  const newDesc = data.description !== undefined ? data.description.trim() : current.description;

  // Derive titleAr
  let newTitleAr = current.titleAr;
  if (data.titleAr !== undefined && data.titleAr.trim() !== '') {
    newTitleAr = data.titleAr.trim();
  } else if (data.title !== undefined && data.title.trim() !== current.title) {
    newTitleAr = translateFrenchToAr(newTitle);
  } else if (!newTitleAr) {
    newTitleAr = translateFrenchToAr(newTitle);
  }

  // Derive descriptionAr
  let newDescAr = current.descriptionAr;
  if (data.descriptionAr !== undefined && data.descriptionAr.trim() !== '') {
    newDescAr = data.descriptionAr.trim();
  } else if (data.description !== undefined && data.description.trim() !== current.description) {
    newDescAr = translateFrenchToAr(newDesc);
  } else if (!newDescAr) {
    newDescAr = translateFrenchToAr(newDesc);
  }

  const updated: Campaign = {
    ...current,
    title: newTitle,
    description: newDesc,
    titleAr: newTitleAr,
    descriptionAr: newDescAr,
    currency: data.currency !== undefined ? data.currency.trim() : current.currency,
    active: data.active !== undefined ? data.active : current.active,
    videoUrl: data.videoUrl !== undefined ? data.videoUrl.trim() : current.videoUrl,
    images: data.images !== undefined ? data.images : current.images,
  };

  if (updated.active && !current.active) {
    store.campaigns = store.campaigns.map((c) => ({
      ...c,
      active: c.id === id,
    }));
  } else {
    store.campaigns[index] = updated;
  }

  await saveStore(store);
  return updated;
}

export async function deleteCampaign(id: string): Promise<{ success: boolean; error?: string }> {
  const store = await ensureStore();
  const exists = store.campaigns.find((c) => c.id === id);
  if (!exists) return { success: false, error: 'Campagne introuvable' };

  if (store.campaigns.length <= 1) {
    return { success: false, error: 'Impossible de supprimer la dernière campagne restante.' };
  }

  const wasActive = exists.active;
  store.campaigns = store.campaigns.filter((c) => c.id !== id);

  if (wasActive && store.campaigns.length > 0) {
    store.campaigns[0].active = true;
  }

  // Remove associated products, evaluations, invitations for this deleted campaign
  store.products = store.products.filter((p) => p.campaignId !== id);
  store.evaluations = store.evaluations.filter((e) => e.campaignId !== id);
  if (store.invitations) {
    store.invitations = store.invitations.filter((i) => i.campaignId !== id);
  }
  if (store.invitationBatches) {
    store.invitationBatches = store.invitationBatches.filter((b) => b.campaignId !== id);
  }

  await saveStore(store);
  return { success: true };
}

export async function getProducts(campaignId?: string): Promise<Product[]> {
  const store = await ensureStore();
  if (campaignId) {
    return store.products.filter((p) => p.campaignId === campaignId);
  }
  const active = await getActiveCampaign();
  return store.products.filter((p) => p.campaignId === active.id);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const store = await ensureStore();
  return store.products.find((p) => p.id === id);
}

export async function createProduct(data: {
  name: string;
  description: string;
  category?: string;
  suggestedPrice?: number;
  images: string[];
  videoUrl?: string;
  campaignId?: string;
}): Promise<Product> {
  const store = await ensureStore();
  const active = await getActiveCampaign();
  const newProd: Product = {
    id: `prod-${Date.now()}`,
    campaignId: data.campaignId || active.id,
    name: data.name,
    description: data.description,
    category: data.category || 'Général',
    suggestedPrice: data.suggestedPrice !== undefined && !isNaN(Number(data.suggestedPrice)) && Number(data.suggestedPrice) > 0 ? Number(data.suggestedPrice) : undefined,
    images: data.images && data.images.length > 0 ? data.images : [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'
    ],
    videoUrl: data.videoUrl ? data.videoUrl.trim() : undefined,
    createdAt: new Date().toISOString(),
  };
  store.products.push(newProd);
  await saveStore(store);
  return newProd;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    suggestedPrice?: number;
    images?: string[];
    videoUrl?: string;
    campaignId?: string;
  }
): Promise<Product | null> {
  const store = await ensureStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = store.products[index];
  const updated: Product = {
    ...current,
    name: data.name !== undefined ? data.name.trim() : current.name,
    description: data.description !== undefined ? data.description.trim() : current.description,
    category: data.category !== undefined ? data.category.trim() : current.category,
    suggestedPrice: data.suggestedPrice !== undefined
      ? (isNaN(Number(data.suggestedPrice)) || Number(data.suggestedPrice) <= 0 ? undefined : Number(data.suggestedPrice))
      : current.suggestedPrice,
    images: data.images && data.images.length > 0 ? data.images : current.images,
    videoUrl: data.videoUrl !== undefined ? data.videoUrl.trim() : current.videoUrl,
    campaignId: data.campaignId !== undefined ? data.campaignId : current.campaignId,
  };

  store.products[index] = updated;
  await saveStore(store);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = await ensureStore();
  const initialCount = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  store.evaluations = store.evaluations.filter((e) => e.productId !== id);
  if (store.products.length !== initialCount) {
    await saveStore(store);
    return true;
  }
  return false;
}

export async function getEvaluations(campaignId?: string, productId?: string): Promise<Evaluation[]> {
  const store = await ensureStore();
  return store.evaluations.filter((e) => {
    if (campaignId && e.campaignId !== campaignId) return false;
    if (productId && e.productId !== productId) return false;
    return true;
  });
}

export async function addEvaluation(item: {
  campaignId: string;
  productId: string;
  rating: number;
  estimatedPrice: number;
  criteria?: {
    design: number;
    quality: number;
    originality: number;
    purchaseIntent: number;
  };
  participantSessionId: string;
}): Promise<Evaluation> {
  const store = await ensureStore();
  
  // Clean rating & price
  const rating = Math.max(1, Math.min(5, Math.round(item.rating)));
  const estimatedPrice = Math.max(1, Math.round(item.estimatedPrice));

  // Remove existing evaluation by same session for same product in this campaign to avoid duplicate double votes
  const filtered = store.evaluations.filter(
    (e) => !(e.productId === item.productId && e.participantSessionId === item.participantSessionId)
  );

  const newEval: Evaluation = {
    id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    campaignId: item.campaignId,
    productId: item.productId,
    rating,
    estimatedPrice,
    criteria: item.criteria ? {
      design: Math.max(1, Math.min(5, Math.round(item.criteria.design))),
      quality: Math.max(1, Math.min(5, Math.round(item.criteria.quality))),
      originality: Math.max(1, Math.min(5, Math.round(item.criteria.originality))),
      purchaseIntent: Math.max(1, Math.min(5, Math.round(item.criteria.purchaseIntent))),
    } : undefined,
    participantSessionId: item.participantSessionId,
    createdAt: new Date().toISOString(),
  };

  filtered.push(newEval);
  store.evaluations = filtered;
  await saveStore(store);
  return newEval;
}

export async function getParticipantProgress(sessionId: string, campaignId: string): Promise<{
  evaluations: Evaluation[];
  validatedProductIds: string[];
}> {
  const store = await ensureStore();
  const evals = store.evaluations.filter(
    (e) => e.campaignId === campaignId && e.participantSessionId === sessionId
  );
  return {
    evaluations: evals,
    validatedProductIds: evals.map((e) => e.productId),
  };
}

const HISTOGRAM_BINS = [
  { range: '60-90', min: 60, max: 90 },
  { range: '90-120', min: 90, max: 120 },
  { range: '120-150', min: 120, max: 150 },
  { range: '150-180', min: 150, max: 180 },
  { range: '180-210', min: 180, max: 210 },
  { range: '210-250', min: 210, max: 250 },
  { range: '250+', min: 250, max: Infinity },
];

export async function calculateProductStats(campaignId?: string): Promise<ProductStats[]> {
  const store = await ensureStore();
  const targetCampaignId = campaignId || (await getActiveCampaign()).id;
  const products = store.products.filter((p) => p.campaignId === targetCampaignId);

  return products.map((prod) => {
    const liveEvals = store.evaluations.filter((e) => e.productId === prod.id);
    const baseline = store.baselineStats?.[prod.id];

    // Compute live aggregates
    const liveCount = liveEvals.length;
    const baseCount = baseline ? baseline.participants : 0;
    const totalParticipants = baseCount + liveCount;

    let avgRating = 0;
    let priceAvg = 0;
    let priceMedian = 0;
    let priceMin = 0;
    let priceMax = 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (baseline) {
      // Add baseline ratings
      ([5, 4, 3, 2, 1] as const).forEach((star) => {
        ratingCounts[star] = Math.round((baseline.rating[star] / 100) * baseline.participants);
      });
    }

    // Add live ratings
    liveEvals.forEach((e) => {
      const star = Math.max(1, Math.min(5, e.rating)) as 1 | 2 | 3 | 4 | 5;
      ratingCounts[star] += 1;
    });

    const sumRatingVotes = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
    if (sumRatingVotes > 0) {
      const weightedSum =
        ratingCounts[5] * 5 +
        ratingCounts[4] * 4 +
        ratingCounts[3] * 3 +
        ratingCounts[2] * 2 +
        ratingCounts[1] * 1;
      avgRating = Number((weightedSum / sumRatingVotes).toFixed(1));

      ([5, 4, 3, 2, 1] as const).forEach((star) => {
        ratingDistribution[star] = Math.round((ratingCounts[star] / sumRatingVotes) * 100);
      });
    }

    // Combine prices
    if (baseline && liveCount === 0) {
      priceAvg = baseline.priceAvg;
      priceMedian = baseline.priceMedian;
      priceMin = baseline.priceMin;
      priceMax = baseline.priceMax;
    } else if (baseline && liveCount > 0) {
      const livePrices = liveEvals.map((e) => e.estimatedPrice);
      const liveSum = livePrices.reduce((a, b) => a + b, 0);
      priceAvg = Math.round((baseline.priceAvg * baseline.participants + liveSum) / (baseline.participants + liveCount));
      priceMin = Math.min(baseline.priceMin, ...livePrices);
      priceMax = Math.max(baseline.priceMax, ...livePrices);
      priceMedian = Math.round((baseline.priceMedian + (liveSum / liveCount)) / 2);
    } else if (liveCount > 0) {
      const livePrices = liveEvals.map((e) => e.estimatedPrice).sort((a, b) => a - b);
      const liveSum = livePrices.reduce((a, b) => a + b, 0);
      priceAvg = Math.round(liveSum / liveCount);
      priceMin = livePrices[0];
      priceMax = livePrices[livePrices.length - 1];
      const mid = Math.floor(livePrices.length / 2);
      priceMedian = livePrices.length % 2 !== 0 ? livePrices[mid] : Math.round((livePrices[mid - 1] + livePrices[mid]) / 2);
    }

    // Histogram bins
    const priceHistogram: PriceBin[] = HISTOGRAM_BINS.map((bin, index) => {
      let count = 0;
      if (baseline && baseline.priceHist && baseline.priceHist[index] !== undefined) {
        count += baseline.priceHist[index];
      }
      liveEvals.forEach((e) => {
        if (e.estimatedPrice >= bin.min && e.estimatedPrice < bin.max) {
          count++;
        }
      });
      return {
        range: bin.range,
        count,
      };
    });

    // Multi-criteria averages calculation
    const effectiveAvg = avgRating || 4.0;
    let criteriaAvg = {
      design: Number(Math.min(5, Math.max(1, effectiveAvg + 0.1)).toFixed(1)),
      quality: Number(Math.min(5, Math.max(1, effectiveAvg - 0.1)).toFixed(1)),
      originality: Number(Math.min(5, Math.max(1, effectiveAvg - 0.2)).toFixed(1)),
      purchaseIntent: Number(Math.min(5, Math.max(1, effectiveAvg - 0.1)).toFixed(1)),
    };

    const evalsWithCriteria = liveEvals.filter((e) => e.criteria);
    if (evalsWithCriteria.length > 0) {
      const sumDesign = evalsWithCriteria.reduce((a, b) => a + (b.criteria?.design || b.rating), 0);
      const sumQuality = evalsWithCriteria.reduce((a, b) => a + (b.criteria?.quality || b.rating), 0);
      const sumOrig = evalsWithCriteria.reduce((a, b) => a + (b.criteria?.originality || b.rating), 0);
      const sumIntent = evalsWithCriteria.reduce((a, b) => a + (b.criteria?.purchaseIntent || b.rating), 0);
      const cCount = evalsWithCriteria.length;
      criteriaAvg = {
        design: Number((sumDesign / cCount).toFixed(1)),
        quality: Number((sumQuality / cCount).toFixed(1)),
        originality: Number((sumOrig / cCount).toFixed(1)),
        purchaseIntent: Number((sumIntent / cCount).toFixed(1)),
      };
    }

    const finalPriceAvg = priceAvg || 150;
    const finalSuggestedPrice = prod.suggestedPrice || (
      prod.id === '1' ? 160 :
      prod.id === '2' ? 200 :
      prod.id === '3' ? 175 :
      prod.id === '4' ? 160 :
      prod.id === '5' ? 140 :
      prod.id === '6' ? 120 :
      undefined
    );

    const priceGapVsSuggested = finalSuggestedPrice && finalSuggestedPrice > 0
      ? Math.round(((finalPriceAvg - finalSuggestedPrice) / finalSuggestedPrice) * 100)
      : undefined;

    return {
      id: prod.id,
      campaignId: prod.campaignId,
      name: prod.name,
      description: prod.description,
      category: prod.category || 'Général',
      suggestedPrice: finalSuggestedPrice,
      priceGapVsSuggested,
      images: prod.images,
      videoUrl: prod.videoUrl,
      participants: totalParticipants,
      avgRating: avgRating || 4.0,
      criteriaAvg,
      priceAvg: finalPriceAvg,
      priceMedian: priceMedian || 150,
      priceMin: priceMin || 80,
      priceMax: priceMax || 250,
      ratingDistribution,
      ratingCounts,
      priceHistogram,
    };
  });
}

export async function calculateGlobalStats(campaignId?: string): Promise<GlobalStats> {
  const store = await ensureStore();
  const activeCampaign = await getActiveCampaign();
  const targetCampaignId = campaignId || activeCampaign.id;
  const productStats = await calculateProductStats(targetCampaignId);

  // Baseline unique participants across all 6 products in active campaign
  const baseParticipants = 430;
  // Unique live participants
  const uniqueLiveParticipants = new Set(
    store.evaluations.filter((e) => e.campaignId === targetCampaignId).map((e) => e.participantSessionId)
  ).size;

  const totalParticipants = baseParticipants + uniqueLiveParticipants;

  // Baseline total evaluations across campaigns
  const baseEvaluations = 7685;
  const liveEvaluationsCount = store.evaluations.length;
  const totalEvaluations = baseEvaluations + liveEvaluationsCount;

  // Global price average
  let globalPriceAvg = 178;
  if (productStats.length > 0) {
    const sum = productStats.reduce((acc, p) => acc + p.priceAvg, 0);
    globalPriceAvg = Math.round(sum / productStats.length);
  }

  return {
    totalCampaigns: store.campaigns.length,
    totalParticipants,
    totalEvaluations,
    globalPriceAvg,
    activeCampaignTitle: activeCampaign.title,
  };
}

export async function getInvitations(campaignId?: string): Promise<EmailInvitation[]> {
  const store = await ensureStore();
  const list = store.invitations || [];
  if (campaignId) {
    return list.filter((i) => i.campaignId === campaignId);
  }
  return list;
}

export async function getInvitationBatches(campaignId?: string): Promise<InvitationBatch[]> {
  const store = await ensureStore();
  const list = store.invitationBatches || [];
  if (campaignId) {
    return list.filter((b) => b.campaignId === campaignId);
  }
  return list;
}

export async function addInvitations(data: {
  campaignId: string;
  subject: string;
  emails: string[];
  baseUrl: string;
  fileName?: string;
}): Promise<{ batch: InvitationBatch; invitations: EmailInvitation[]; count: number }> {
  const store = await ensureStore();
  if (!store.invitations) store.invitations = [];
  if (!store.invitationBatches) store.invitationBatches = [];

  const active = store.campaigns.find((c) => c.id === data.campaignId) || await getActiveCampaign();
  const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const cleanBaseUrl = data.baseUrl.replace(/\/$/, '');

  const newInvitations: EmailInvitation[] = data.emails.map((rawEmail) => {
    const email = rawEmail.trim().toLowerCase();
    const token = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    const campaignLink = `${cleanBaseUrl}?cid=${data.campaignId}&ref=invite&t=${token}`;

    return {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      campaignId: data.campaignId,
      email,
      token,
      campaignLink,
      status: 'sent',
      sentAt: new Date().toISOString(),
      batchId,
    };
  });

  const batch: InvitationBatch = {
    id: batchId,
    campaignId: data.campaignId,
    campaignTitle: active.title,
    subject: data.subject,
    totalCount: newInvitations.length,
    fileName: data.fileName,
    createdAt: new Date().toISOString(),
  };

  store.invitations.unshift(...newInvitations);
  store.invitationBatches.unshift(batch);
  await saveStore(store);

  return { batch, invitations: newInvitations, count: newInvitations.length };
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const store = await ensureStore();
  if (!store.invitations) return false;
  const initialLength = store.invitations.length;
  store.invitations = store.invitations.filter((i) => i.id !== id);
  if (store.invitations.length !== initialLength) {
    await saveStore(store);
    return true;
  }
  return false;
}

export async function clearInvitations(campaignId?: string): Promise<void> {
  const store = await ensureStore();
  if (campaignId) {
    if (store.invitations) {
      store.invitations = store.invitations.filter((i) => i.campaignId !== campaignId);
    }
    if (store.invitationBatches) {
      store.invitationBatches = store.invitationBatches.filter((b) => b.campaignId !== campaignId);
    }
  } else {
    store.invitations = [];
    store.invitationBatches = [];
  }
  await saveStore(store);
}

export async function resetToSeedData() {
  const freshStore: StoreData = {
    campaigns: INITIAL_CAMPAIGNS,
    products: INITIAL_PRODUCTS,
    evaluations: [],
    invitations: [],
    invitationBatches: [],
    baselineStats: BASELINE_STATS,
  };
  await saveStore(freshStore);
  return freshStore;
}
