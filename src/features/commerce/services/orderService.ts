import {findProduct} from '../lib/commerceLogic';
import type {CartState, DeliveryAddress, FulfilmentMethod, Order, PaymentResult, Seller} from '../types/commerce';

export const ORDERS_STORAGE_KEY = 'zamcomm-orders-v1';

export const readOrders = (seed: Order[] = []): Order[] => {
  if (typeof window === 'undefined') return seed;
  try {
    return JSON.parse(window.localStorage.getItem(ORDERS_STORAGE_KEY) || 'null') ?? seed;
  } catch {
    return seed;
  }
};

export const saveOrders = (orders: Order[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

export const createProtectedOrder = (input: {
  cart: CartState;
  merchant: Seller;
  fulfilmentMethod: FulfilmentMethod;
  deliveryAddress?: DeliveryAddress;
  deliverySlotId: string;
  pricing: {subtotal: number; deliveryFee: number; protectionFee: number; discount: number; finalTotal: number};
  payment: PaymentResult;
}): Order => {
  const now = new Date().toISOString();
  return {
    id: `ZC-${Math.floor(2000 + Math.random() * 7000)}`,
    customerId: 'demo-customer',
    sellerId: input.merchant.id,
    customerName: input.deliveryAddress?.fullName || 'Demo Customer',
    items: input.cart.items.map((item) => ({...item, merchantId: input.merchant.id})),
    subtotal: input.pricing.subtotal,
    deliveryFee: input.pricing.deliveryFee,
    protectionFee: input.pricing.protectionFee,
    discount: input.pricing.discount,
    finalAmount: input.pricing.finalTotal,
    fulfilmentMethod: input.fulfilmentMethod,
    deliveryAddress: input.deliveryAddress,
    deliverySlotId: input.deliverySlotId,
    paymentStatus: input.payment.status,
    transactionReference: input.payment.transactionReference,
    protectionStatus: input.payment.status === 'paid' ? 'funds_protected' : 'not_required',
    status: input.payment.status === 'pay_on_pickup' ? 'awaiting_merchant_acceptance' : 'paid',
    escrowPin: String(Math.floor(1000 + Math.random() * 9000)),
    paidAt: new Date().toLocaleTimeString('en-ZM', {hour: '2-digit', minute: '2-digit'}),
    createdAt: now,
    updatedAt: now
  };
};

export const orderSummary = (order: Order, merchant: Seller) =>
  order.items.map((item) => `${item.quantity} x ${findProduct(merchant, item.productId).name}`).join(', ');
