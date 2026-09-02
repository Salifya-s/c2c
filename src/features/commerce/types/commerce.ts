export type FulfilmentMethod = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending_payment'
  | 'created'
  | 'paid'
  | 'paid_in_escrow'
  | 'awaiting_merchant_acceptance'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'ready_for_pickup'
  | 'courier_requested'
  | 'courier_assigned'
  | 'picked_up'
  | 'in_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'pin_verified'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'pay_on_pickup';
export type ProtectionStatus = 'not_required' | 'pending_payment' | 'funds_protected' | 'release_pending' | 'released' | 'refunded' | 'disputed';

export type Product = {
  id: string;
  merchantId?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageStyle: string;
  tags: string[];
  available?: boolean;
  deliveryEligible?: boolean;
  prepMinutes?: number;
  variants?: string[];
};

export type Seller = {
  id: string;
  name: string;
  handle: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  responseTime: string;
  verifiedLevel: string;
  completionRate: number;
  disputeRate: number;
  open: boolean;
  completedOrders?: number;
  minimumOrder?: number;
  openingHours?: string;
  deliveryAvailable?: boolean;
  deliveryZones: string[];
  policies: string[];
  products: Product[];
};

export type DeliverySlot = {
  id: string;
  label: string;
  fee: number;
  capacity: number;
};

export type CartLine = {
  merchantId?: string;
  productId: string;
  quantity: number;
  variant?: string;
};

export type CartState = {
  merchantId?: string;
  items: CartLine[];
};

export type MerchantCartGroup = {
  merchantId: string;
  items: CartLine[];
  updatedAt: string;
};

export type MultiMerchantCartState = {
  activeMerchantId?: string;
  groups: MerchantCartGroup[];
};

export type ChatMessage = {
  id: string;
  role: 'bot' | 'customer' | 'system';
  text: string;
};

export type Order = {
  id: string;
  customerId?: string;
  sellerId: string;
  customerName: string;
  items: CartLine[];
  subtotal?: number;
  deliveryFee?: number;
  protectionFee?: number;
  discount?: number;
  finalAmount?: number;
  fulfilmentMethod: FulfilmentMethod;
  deliveryAddress?: DeliveryAddress;
  deliverySlotId: string;
  paymentStatus?: PaymentStatus;
  transactionReference?: string;
  protectionStatus?: ProtectionStatus;
  status: OrderStatus;
  escrowPin: string;
  paidAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  instructions?: string;
};

export type ParsedSearchIntent = {
  query: string;
  category?: string;
  maxPrice?: number;
  location?: string;
  requestedDate?: string;
  requestedDeliverySlot?: string;
  deliveryRequired?: boolean;
  verifiedOnly?: boolean;
};

export type DiscoveryFilters = {
  category?: string;
  location?: string;
  verifiedOnly?: boolean;
  deliveryOnly?: boolean;
  maxPrice?: number;
};

export type ProductResult = Product & {
  merchant: Seller;
  score: number;
};

export type MerchantResult = Seller & {
  score: number;
};

export type DiscoveryResults = {
  products: ProductResult[];
  merchants: MerchantResult[];
  intent: ParsedSearchIntent;
};

export type DeliveryQuoteInput = {
  merchant: Seller;
  address?: DeliveryAddress;
  fulfilmentMethod: FulfilmentMethod;
};

export type DeliveryQuote = {
  provider: 'Mock Yango';
  available: boolean;
  fee: number;
  etaMinutes: number;
  message?: string;
};

export type PaymentInput = {
  method: 'mobile_money' | 'card' | 'pay_on_pickup';
  provider?: 'MTN Money' | 'Airtel Money' | 'Zamtel Money';
  phone?: string;
  amount: number;
};

export type PaymentResult = {
  ok: boolean;
  status: PaymentStatus;
  transactionReference?: string;
  message: string;
};
