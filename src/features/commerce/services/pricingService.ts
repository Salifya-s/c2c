import {findProduct} from '../lib/commerceLogic';
import type {CartState, FulfilmentMethod, Seller} from '../types/commerce';

export const calculatePriceBreakdown = (cart: CartState, merchant: Seller, method: FulfilmentMethod, deliveryFee: number) => {
  const subtotal = cart.items.reduce((total, item) => total + findProduct(merchant, item.productId).price * item.quantity, 0);
  const protectionFee = Math.ceil(subtotal * 0.035);
  const discount = subtotal >= 500 ? 25 : 0;
  const finalTotal = subtotal + (method === 'delivery' ? deliveryFee : 0) + protectionFee - discount;

  return {subtotal, deliveryFee: method === 'delivery' ? deliveryFee : 0, protectionFee, discount, finalTotal};
};
