import type {PaymentInput, PaymentResult} from '../types/commerce';

export const mockPaymentProvider = {
  async pay(input: PaymentInput): Promise<PaymentResult> {
    if (input.method === 'pay_on_pickup') {
      return {ok: true, status: 'pay_on_pickup', transactionReference: `POP-${Date.now()}`, message: 'Pay on pickup selected.'};
    }
    if (input.method === 'mobile_money' && (!input.phone || input.phone.replace(/\D/g, '').length < 9)) {
      return {ok: false, status: 'failed', message: 'Enter a valid mobile money phone number.'};
    }
    if (input.phone?.endsWith('000')) {
      return {ok: false, status: 'failed', message: 'Payment failed in the simulator. Try a different number.'};
    }

    return {
      ok: true,
      status: 'paid',
      transactionReference: `ZC-TXN-${Math.floor(100000 + Math.random() * 899999)}`,
      message: 'Payment successful. Funds marked as protected in this prototype.'
    };
  }
};
