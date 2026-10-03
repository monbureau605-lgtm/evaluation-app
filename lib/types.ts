export interface EvaluationCriteria {
  design: number; // 1 to 5
  quality: number; // 1 to 5
  originality: number; // 1 to 5
  purchaseIntent: number; // 1 to 5
}

export interface Product {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  category?: string;
  suggestedPrice?: number; // Prix Public Conseillé (PPC / MSRP)
  images: string[];
  videoUrl?: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  campaignId: string;
  productId: string;
  rating: number; // 1 to 5
  estimatedPrice: number; // in campaign currency
  criteria?: EvaluationCriteria;
  participantSessionId: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  titleAr?: string;
  descriptionAr?: string;
  active: boolean;
  currency: string;
  categorySector?: string; // e.g. "Tous secteurs", "Haute Horlogerie", "Maroquinerie de luxe", etc.
  videoUrl?: string;
  images?: string[];
  createdAt: string;
}

export interface PriceBin {
  range: string;
  count: number;
}

export interface ProductStats {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  category?: string;
  suggestedPrice?: number; // Prix Public Conseillé
  priceGapVsSuggested?: number; // % écart: ((priceAvg - suggestedPrice) / suggestedPrice) * 100
  images: string[];
  videoUrl?: string;
  participants: number;
  avgRating: number;
  criteriaAvg?: EvaluationCriteria;
  priceAvg: number;
  priceMedian: number;
  priceMin: number;
  priceMax: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  priceHistogram: PriceBin[];
}

export interface GlobalStats {
  totalCampaigns: number;
  totalParticipants: number;
  totalEvaluations: number;
  globalPriceAvg: number;
  activeCampaignTitle: string;
}

export interface EmailInvitation {
  id: string;
  campaignId: string;
  email: string;
  token: string;
  campaignLink: string;
  status: 'sent' | 'pending' | 'failed';
  sentAt: string;
  batchId?: string;
}

export interface InvitationBatch {
  id: string;
  campaignId: string;
  campaignTitle: string;
  subject: string;
  totalCount: number;
  fileName?: string;
  createdAt: string;
}
