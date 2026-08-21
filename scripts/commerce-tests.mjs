import assert from 'node:assert/strict';
import test from 'node:test';

const merchants = [
  {
    id: 'cake-shop',
    name: 'Cake Shop',
    category: 'Bakery',
    location: 'Roma, Lusaka',
    verifiedLevel: 'Business Verified',
    rating: 4.9,
    completedOrders: 400,
    open: true,
    deliveryAvailable: true,
    products: [{id: 'cake', name: 'Chocolate birthday cake', category: 'Bakery', price: 450, stock: 4, available: true, deliveryEligible: true, tags: ['birthday']}]
  },
  {
    id: 'shoe-shop',
    name: 'Shoe Shop',
    category: 'Fashion',
    location: 'Kamwala, Lusaka',
    verifiedLevel: 'Unverified',
    rating: 4.1,
    completedOrders: 100,
    open: true,
    deliveryAvailable: true,
    products: [{id: 'shoes', name: 'White sneakers', category: 'Fashion', price: 320, stock: 8, available: true, deliveryEligible: true, tags: ['shoes']}]
  }
];

const parseSearchIntent = (raw) => {
  const lower = raw.toLowerCase();
  const price = lower.match(/(?:under|below|less than|max|maximum)\s*k?\s*(\d+)/);
  return {
    query: raw,
    category: lower.includes('cake') || lower.includes('birthday') ? 'Bakery' : lower.includes('shoes') ? 'Fashion' : undefined,
    maxPrice: price ? Number(price[1]) : undefined,
    deliveryRequired: lower.includes('deliver') || lower.includes('near me'),
    verifiedOnly: lower.includes('verified') || lower.includes('trusted')
  };
};

const search = (query) => {
  const intent = parseSearchIntent(query);
  return merchants
    .flatMap((merchant) =>
      merchant.products.map((product) => {
        let score = 0;
        if (intent.category === product.category) score += 35;
        if (intent.maxPrice && product.price <= intent.maxPrice) score += 20;
        if (product.stock > 0 && product.available) score += 28;
        if (merchant.verifiedLevel.includes('Verified')) score += 12;
        score += merchant.rating * 4;
        return {merchant, product, score};
      })
    )
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

const addCartItem = (cart, merchantId, productId) => {
  if (cart.merchantId && cart.merchantId !== merchantId && cart.items.length > 0) {
    return {requiresConfirmation: true, cart};
  }
  return {requiresConfirmation: false, cart: {merchantId, items: [...cart.items, {merchantId, productId, quantity: 1}]}};
};

const priceBreakdown = (subtotal, deliveryFee) => {
  const protectionFee = Math.ceil(subtotal * 0.035);
  const discount = subtotal >= 500 ? 25 : 0;
  return {subtotal, deliveryFee, protectionFee, discount, finalTotal: subtotal + deliveryFee + protectionFee - discount};
};

const mockPay = ({phone, amount}) => {
  if (phone.endsWith('000')) return {ok: false, status: 'failed'};
  return {ok: true, status: 'paid', transactionReference: `ZC-TXN-${amount}`};
};

test('parses natural-language search intent', () => {
  const intent = parseSearchIntent('I need a chocolate birthday cake under K500 delivered today');
  assert.equal(intent.category, 'Bakery');
  assert.equal(intent.maxPrice, 500);
  assert.equal(intent.deliveryRequired, true);
});

test('ranks available verified compatible products first', () => {
  const [first] = search('birthday cake under K500');
  assert.equal(first.product.id, 'cake');
  assert.equal(first.merchant.verifiedLevel, 'Business Verified');
});

test('enforces single-merchant cart restriction', () => {
  const first = addCartItem({items: []}, 'cake-shop', 'cake');
  const second = addCartItem(first.cart, 'shoe-shop', 'shoes');
  assert.equal(second.requiresConfirmation, true);
  assert.equal(second.cart.merchantId, 'cake-shop');
});

test('calculates cart totals and payment outcomes', () => {
  const pricing = priceBreakdown(450, 30);
  assert.equal(pricing.finalTotal, 496);
  assert.equal(mockPay({phone: '0977000001', amount: pricing.finalTotal}).status, 'paid');
  assert.equal(mockPay({phone: '0977000000', amount: pricing.finalTotal}).status, 'failed');
});

test('covers search to checkout order creation happy path', () => {
  const [result] = search('birthday cake under K500');
  const cartResult = addCartItem({items: []}, result.merchant.id, result.product.id);
  const pricing = priceBreakdown(result.product.price, 30);
  const payment = mockPay({phone: '0977000001', amount: pricing.finalTotal});
  const order = {
    id: 'ZC-TEST',
    merchantId: result.merchant.id,
    items: cartResult.cart.items,
    finalAmount: pricing.finalTotal,
    paymentStatus: payment.status,
    transactionReference: payment.transactionReference,
    status: 'paid'
  };
  assert.equal(order.paymentStatus, 'paid');
  assert.equal(order.items.length, 1);
  assert.ok(order.transactionReference);
});
