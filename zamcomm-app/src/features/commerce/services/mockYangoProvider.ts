import {deliverySlots} from '../data/mockCommerce';
import type {DeliveryAddress, DeliveryQuote, DeliveryQuoteInput, DeliverySlot, Seller} from '../types/commerce';

export type DeliverySlotInput = {
  merchant: Seller;
  address?: DeliveryAddress;
};

export const mockYangoProvider = {
  async getQuote(input: DeliveryQuoteInput): Promise<DeliveryQuote> {
    if (input.fulfilmentMethod === 'pickup') {
      return {provider: 'Mock Yango', available: true, fee: 0, etaMinutes: 0};
    }
    if (!input.merchant.deliveryAvailable) {
      return {provider: 'Mock Yango', available: false, fee: 0, etaMinutes: 0, message: 'Delivery is not available for this merchant.'};
    }
    const area = input.address?.area;
    if (area && !input.merchant.deliveryZones.some((zone) => area.toLowerCase().includes(zone.toLowerCase()) || zone.toLowerCase().includes(area.toLowerCase()))) {
      return {provider: 'Mock Yango', available: false, fee: 0, etaMinutes: 0, message: 'No mock couriers are available for this area.'};
    }

    return {provider: 'Mock Yango', available: true, fee: input.merchant.minimumOrder && input.merchant.minimumOrder > 150 ? 40 : 30, etaMinutes: 45};
  },

  async getAvailableSlots(input: DeliverySlotInput): Promise<DeliverySlot[]> {
    if (!input.merchant.open || !input.merchant.deliveryAvailable) return [];
    return deliverySlots.filter((slot) => slot.capacity > 0);
  },

  async createDelivery() {
    return {deliveryId: `YANGO-${Math.floor(10000 + Math.random() * 89999)}`, status: 'courier_requested'};
  },

  async getDeliveryStatus() {
    return 'courier_assigned';
  }
};
