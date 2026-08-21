import {sellers} from '../data/mockCommerce';
import type {DiscoveryFilters, DiscoveryResults, ParsedSearchIntent, ProductResult, Seller} from '../types/commerce';

const categoryAliases: Record<string, string> = {
  cake: 'Bakery',
  birthday: 'Bakery',
  chicken: 'Lunch',
  food: 'Lunch',
  groceries: 'Groceries',
  grocery: 'Groceries',
  shoes: 'Fashion',
  tailor: 'Services',
  alteration: 'Services',
  makeup: 'Beauty',
  beauty: 'Beauty',
  flowers: 'Gifts',
  repair: 'Services'
};

const locations = ['lusaka', 'kabulonga', 'woodlands', 'ibex', 'kitwe', 'roma', 'chilenje', 'kamwala', 'longacres'];

export const parseSearchIntent = (raw: string): ParsedSearchIntent => {
  const text = raw.trim();
  const lower = text.toLowerCase();
  const maxPriceMatch = lower.match(/(?:under|below|less than|max|maximum)\s*k?\s*(\d+)/);
  const category = Object.entries(categoryAliases).find(([alias]) => lower.includes(alias))?.[1];
  const location = locations.find((candidate) => lower.includes(candidate));

  return {
    query: text,
    ...(category ? {category} : {}),
    ...(maxPriceMatch ? {maxPrice: Number(maxPriceMatch[1])} : {}),
    ...(location ? {location: location === 'ibex' ? 'Ibex Hill' : titleCase(location)} : {}),
    ...(lower.includes('tomorrow') ? {requestedDate: 'tomorrow'} : {}),
    ...(lower.includes('today') || lower.includes('afternoon') ? {requestedDeliverySlot: lower.includes('afternoon') ? 'afternoon' : 'today'} : {}),
    ...(lower.includes('deliver') || lower.includes('near me') ? {deliveryRequired: true} : {}),
    ...(lower.includes('verified') || lower.includes('trusted') ? {verifiedOnly: true} : {})
  };
};

export const searchCommerce = (rawQuery: string, filters: DiscoveryFilters = {}): DiscoveryResults => {
  const intent = {...parseSearchIntent(rawQuery), ...removeEmptyFilters(filters)};
  const productResults: ProductResult[] = [];
  const merchantScores = new Map<string, number>();

  sellers.forEach((merchant) => {
    merchant.products.forEach((product) => {
      const score = rankProduct(merchant, product, intent);
      if (score <= 0) return;
      productResults.push({...product, merchantId: merchant.id, merchant, score});
      merchantScores.set(merchant.id, Math.max(merchantScores.get(merchant.id) ?? 0, score));
    });
  });

  const products = productResults.sort((a, b) => b.score - a.score);
  const merchants = sellers
    .map((merchant) => ({...merchant, score: merchantScores.get(merchant.id) ?? rankMerchant(merchant, intent)}))
    .filter((merchant) => merchant.score > 0)
    .sort((a, b) => b.score - a.score);

  return {products, merchants, intent};
};

const rankProduct = (merchant: Seller, product: Seller['products'][number], intent: ParsedSearchIntent) => {
  const haystack = `${product.name} ${product.description} ${product.category} ${product.tags.join(' ')} ${merchant.name} ${merchant.category}`.toLowerCase();
  const terms = intent.query.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
  let score = terms.reduce((total, term) => total + (haystack.includes(term) ? 18 : 0), 0);

  if (!intent.query) score += 20;
  if (intent.category && (product.category === intent.category || merchant.category === intent.category)) score += 35;
  if (intent.maxPrice && product.price <= intent.maxPrice) score += 20;
  if (intent.maxPrice && product.price > intent.maxPrice) score -= 40;
  if (intent.location && merchant.location.toLowerCase().includes(intent.location.toLowerCase())) score += 20;
  if (intent.verifiedOnly && !merchant.verifiedLevel.includes('Verified')) score -= 60;
  if (intent.deliveryRequired && !merchant.deliveryAvailable) score -= 60;
  if (intent.deliveryRequired && product.deliveryEligible) score += 16;
  if (product.available !== false && product.stock > 0) score += 28;
  if (merchant.open) score += 18;
  if (merchant.verifiedLevel.includes('Verified')) score += 12;
  score += merchant.rating * 4;
  score += Math.min(20, (merchant.completedOrders ?? 0) / 80);

  return score;
};

const rankMerchant = (merchant: Seller, intent: ParsedSearchIntent) => {
  let score = merchant.rating * 5 + Math.min(20, (merchant.completedOrders ?? 0) / 80);
  if (intent.location && merchant.location.toLowerCase().includes(intent.location.toLowerCase())) score += 20;
  if (intent.verifiedOnly && !merchant.verifiedLevel.includes('Verified')) score -= 60;
  if (intent.deliveryRequired && !merchant.deliveryAvailable) score -= 60;
  if (merchant.open) score += 15;
  return score;
};

const removeEmptyFilters = (filters: DiscoveryFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== '' && value !== false));

const titleCase = (value: string) => value.slice(0, 1).toUpperCase() + value.slice(1);
