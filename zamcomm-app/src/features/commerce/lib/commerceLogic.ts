import {deliverySlots, sellers} from '../data/mockCommerce';
import type {CartLine, FulfilmentMethod, Order, OrderStatus, Seller} from '../types/commerce';

export const formatKwacha = (amount: number) =>
  new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    maximumFractionDigits: 0
  }).format(amount);

export const findSeller = (sellerId: string) => sellers.find((seller) => seller.id === sellerId) ?? sellers[0];

export const findProduct = (seller: Seller, productId: string) =>
  seller.products.find((product) => product.id === productId) ?? seller.products[0];

export const calculateCartSubtotal = (cart: CartLine[], seller: Seller) =>
  cart.reduce((total, line) => total + findProduct(seller, line.productId).price * line.quantity, 0);

export const calculateOrderTotal = (cart: CartLine[], seller: Seller, method: FulfilmentMethod, slotId: string) => {
  const slot = deliverySlots.find((deliverySlot) => deliverySlot.id === slotId) ?? deliverySlots[0];
  const deliveryFee = method === 'delivery' ? slot.fee : 0;

  return calculateCartSubtotal(cart, seller) + deliveryFee;
};

export const calculateTrustScore = (seller: Seller) => {
  const verificationBoost = seller.verifiedLevel.includes('Verified') ? 12 : 4;
  const ratingScore = seller.rating * 12;
  const completionScore = seller.completionRate * 0.28;
  const disputePenalty = seller.disputeRate * 5;

  return Math.round(Math.min(98, ratingScore + completionScore + verificationBoost - disputePenalty));
};

const statusFlow: OrderStatus[] = [
  'pending_payment',
  'paid',
  'awaiting_merchant_acceptance',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'courier_requested',
  'courier_assigned',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'completed'
];

export const getNextOrderStatus = (status: OrderStatus) => {
  const index = statusFlow.indexOf(status);
  return statusFlow[Math.min(index + 1, statusFlow.length - 1)];
};

export const getStatusLabel = (status: OrderStatus) =>
  ({
    created: 'Created',
    pending_payment: 'Pending payment',
    paid: 'Paid into escrow',
    awaiting_merchant_acceptance: 'Waiting for merchant confirmation',
    accepted: 'Accepted',
    preparing: 'Preparing',
    ready: 'Ready',
    ready_for_pickup: 'Ready for pickup',
    courier_requested: 'Courier requested',
    courier_assigned: 'Courier assigned',
    picked_up: 'Picked up',
    in_delivery: 'Out for delivery',
    out_for_delivery: 'On the way',
    delivered: 'Delivered',
    completed: 'Funds released',
    cancelled: 'Cancelled',
    disputed: 'Disputed'
  })[status];

export const createOrderFromCart = (
  cart: CartLine[],
  sellerId: string,
  fulfilmentMethod: FulfilmentMethod,
  deliverySlotId: string
): Order => ({
  id: `ZC-${Math.floor(1200 + Math.random() * 700)}`,
  sellerId,
  customerName: 'Demo Customer',
  items: cart,
  fulfilmentMethod,
  deliverySlotId,
  status: 'paid',
  escrowPin: String(Math.floor(1000 + Math.random() * 9000)),
  paidAt: new Date().toLocaleTimeString('en-ZM', {hour: '2-digit', minute: '2-digit'})
});

export const buildBotReply = (message: string, seller: Seller, selectedProductId: string) => {
  const text = message.toLowerCase();
  const product = findProduct(seller, selectedProductId);

  if (text.includes('delivery')) {
    return `Delivery is available in ${seller.deliveryZones.slice(0, 3).join(', ')}. The next slot is ${deliverySlots[0].label}.`;
  }

  if (text.includes('trust') || text.includes('safe') || text.includes('escrow')) {
    return `Your payment is held in escrow until the order is delivered and your PIN confirms completion. ${seller.name} has a ${calculateTrustScore(seller)} trust score.`;
  }

  if (text.includes('stock') || text.includes('available')) {
    return `${product.name} is available now. There are ${product.stock} left, and I can reserve it while you check out.`;
  }

  if (text.includes('price') || text.includes('cost')) {
    return `${product.name} is ${formatKwacha(product.price)}. Delivery starts from ${formatKwacha(deliverySlots[0].fee)} depending on your slot.`;
  }

  return `I can help with availability, price, delivery, escrow, or checkout for ${seller.name}.`;
};
