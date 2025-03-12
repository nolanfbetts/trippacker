export interface ProductRecommendation {
  name: string;
  description: string;
  affiliateLink: string;
}

export interface PackingItem {
  name: string;
  description: string;
  recommendations: ProductRecommendation[];
}

export interface Category {
  name: string;
  items: PackingItem[];
}

export interface PackingList {
  categories: Category[];
}

export interface RawProductRecommendation {
  name: string;
  description: string;
  amazonUrl?: string;
} 