'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {FiAlertCircle, FiCreditCard, FiPackage, FiShield, FiShoppingBag, FiTruck} from 'react-icons/fi';

import {deliverySlots, initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, formatKwacha} from '../lib/commerceLogic';
import {clearCart, readCart, updateCartQuantity} from '../services/cartService';
import {mockYangoProvider} from '../services/mockYangoProvider';
import {mockPaymentProvider} from '../services/mockPaymentProvider';
import {createProtectedOrder, readOrders, saveOrders} from '../services/orderService';
import {calculatePriceBreakdown} from '../services/pricingService';
import type {DeliveryAddress, FulfilmentMethod, PaymentInput} from '../types/commerce';

const savedAddress: DeliveryAddress = {
  fullName: 'Demo Customer',
  phone: '0977000001',
  addressLine: 'Plot 12, Great East Road',
  area: 'Kabulonga',
  instructions: 'Call when outside.'
};

export const CheckoutPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchantParam = searchParams.get('merchant') ?? undefined;
  const [cart, setCart] = useState(() => readCart(merchantParam));
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<FulfilmentMethod>('delivery');
  const [address, setAddress] = useState<DeliveryAddress>(savedAddress);
  const [slotId, setSlotId] = useState(deliverySlots[0].id);
  const [payment, setPayment] = useState<PaymentInput>({method: 'mobile_money', provider: 'MTN Money', phone: '0977000001', amount: 0});
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [availableSlots, setAvailableSlots] = useState(deliverySlots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const merchant = cart.merchantId ? findSeller(cart.merchantId) : undefined;
  const pricing = useMemo(() => (merchant ? calculatePriceBreakdown(cart, merchant, method, deliveryFee) : undefined), [cart, deliveryFee, merchant, method]);

  useEffect(() => {
    if (!merchant) return;
    let cancelled = false;
    Promise.all([
      mockYangoProvider.getQuote({merchant, address, fulfilmentMethod: method}),
      mockYangoProvider.getAvailableSlots({merchant, address})
    ]).then(([quote, slots]) => {
      if (cancelled) return;
      setDeliveryFee(quote.fee);
      setAvailableSlots(method === 'pickup' ? deliverySlots : slots);
      if (!quote.available && method === 'delivery') setError(quote.message ?? 'No delivery available.');
      else setError('');
    });
    return () => {
      cancelled = true;
    };
  }, [address, merchant, method]);

  const updateQuantity = (productId: string, quantity: number) => {
    const nextCart = updateCartQuantity(cart, productId, quantity);
    setCart(nextCart);
  };

  const pay = async () => {
    if (!merchant || !pricing) return;
    if (method === 'delivery' && (!address.phone || !address.addressLine || !address.area)) {
      setError('Enter a delivery address, area, and phone number.');
      setStep(1);
      return;
    }
    if (method === 'delivery' && availableSlots.length === 0) {
      setError('No compatible delivery slots are available. Try pickup or another merchant.');
      setStep(1);
      return;
    }
    const unavailable = cart.items.find((item) => {
      const product = findProduct(merchant, item.productId);
      return product.available === false || product.stock < item.quantity;
    });
    if (unavailable) {
      setError('One product became unavailable before checkout. Update your cart and try again.');
      setStep(0);
      return;
    }

    setLoading(true);
    const result = await mockPaymentProvider.pay({...payment, amount: pricing.finalTotal});
    if (!result.ok) {
      setLoading(false);
      setError(result.message);
      setStep(2);
      return;
    }
    const order = createProtectedOrder({cart, merchant, fulfilmentMethod: method, deliveryAddress: method === 'delivery' ? address : undefined, deliverySlotId: slotId, pricing, payment: result});
    const nextOrders = [order, ...readOrders(initialOrders)];
    saveOrders(nextOrders);
    clearCart(merchant.id);
    setLoading(false);
    router.push(`/orders/${order.id}?confirmed=1`);
  };

  if (!merchant || !pricing || cart.items.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="min-h-screen bg-white pb-24">
        {loading ? <div className="sticky top-0 z-30 bg-emerald-700 p-3 text-center text-sm font-black text-white">Processing simulation...</div> : null}
        <header className="border-b border-neutral-200 p-4 lg:px-8">
          <Link href="/discover" className="text-sm font-black text-neutral-500">Back to discovery</Link>
          <h1 className="mt-2 text-3xl font-black">Checkout</h1>
          <p className="text-sm text-neutral-500">{merchant.name} - single merchant order</p>
        </header>
        <section className="mx-auto max-w-5xl space-y-4 p-4 lg:p-8">
          {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700"><FiAlertCircle className="mr-2 inline" /> {error}</div> : null}
          <div className="grid grid-cols-4 gap-2">
            {['Cart', 'Delivery', 'Payment', 'Review'].map((label, index) => (
              <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-2xl px-2 py-3 text-xs font-black ${step === index ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                {label}
              </button>
            ))}
          </div>

          {step === 0 ? (
            <section className="space-y-3">
              {cart.items.map((item) => {
                const product = findProduct(merchant, item.productId);
                return (
                  <div key={item.productId} className="flex gap-3 rounded-3xl border border-neutral-200 p-3">
                    <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${product.imageStyle}`} />
                    <div className="flex-1">
                      <p className="font-black">{product.name}</p>
                      <p className="text-sm text-neutral-500">{formatKwacha(product.price)} each</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(product.id, item.quantity - 1)} className="h-9 w-9 rounded-full bg-neutral-100 font-black">-</button>
                        <span className="font-black">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(product.id, item.quantity + 1)} className="h-9 w-9 rounded-full bg-neutral-950 font-black text-white">+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <CheckoutNav next={() => setStep(1)} />
            </section>
          ) : null}

          {step === 1 ? (
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(['delivery', 'pickup'] as const).map((option) => (
                  <button key={option} type="button" onClick={() => setMethod(option)} className={`rounded-3xl px-4 py-4 font-black capitalize ${method === option ? 'bg-emerald-700 text-white' : 'bg-neutral-100'}`}>
                    {option === 'delivery' ? <FiTruck className="mb-2" /> : <FiPackage className="mb-2" />} {option}
                  </button>
                ))}
              </div>
              {method === 'delivery' ? (
                <div className="space-y-2 rounded-3xl border border-neutral-200 p-4">
                  <Input label="Full name" value={address.fullName} onChange={(value) => setAddress((current) => ({...current, fullName: value}))} />
                  <Input label="Phone number" value={address.phone} onChange={(value) => setAddress((current) => ({...current, phone: value}))} />
                  <Input label="Address" value={address.addressLine} onChange={(value) => setAddress((current) => ({...current, addressLine: value}))} />
                  <Input label="Area or neighbourhood" value={address.area} onChange={(value) => setAddress((current) => ({...current, area: value}))} />
                  <Input label="Delivery instructions" value={address.instructions ?? ''} onChange={(value) => setAddress((current) => ({...current, instructions: value}))} />
                </div>
              ) : null}
              <select value={slotId} onChange={(event) => setSlotId(event.target.value)} className="w-full rounded-2xl border border-neutral-200 px-4 py-3 font-bold" aria-label="Delivery slot">
                {availableSlots.map((slot) => <option key={slot.id} value={slot.id}>{slot.label} - {formatKwacha(slot.fee)}</option>)}
              </select>
              <CheckoutNav back={() => setStep(0)} next={() => setStep(2)} />
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-3">
              <div className="grid gap-2">
                {(['mobile_money', 'card', 'pay_on_pickup'] as const).map((methodOption) => (
                  <button key={methodOption} type="button" onClick={() => setPayment((current) => ({...current, method: methodOption}))} className={`rounded-3xl border px-4 py-4 text-left font-black ${payment.method === methodOption ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200'}`}>
                    <FiCreditCard className="mb-2" /> {methodOption.replaceAll('_', ' ')}
                  </button>
                ))}
              </div>
              {payment.method === 'mobile_money' ? (
                <div className="space-y-2 rounded-3xl border border-neutral-200 p-4">
                  <select value={payment.provider} onChange={(event) => setPayment((current) => ({...current, provider: event.target.value as PaymentInput['provider']}))} className="w-full rounded-2xl bg-neutral-100 px-4 py-3 font-bold">
                    <option>MTN Money</option>
                    <option>Airtel Money</option>
                    <option>Zamtel Money</option>
                  </select>
                  <Input label="Mobile money phone" value={payment.phone ?? ''} onChange={(value) => setPayment((current) => ({...current, phone: value}))} />
                  <p className="text-xs font-semibold text-neutral-500">Use a number ending in 000 to simulate a payment failure.</p>
                </div>
              ) : null}
              <CheckoutNav back={() => setStep(1)} next={() => setStep(3)} />
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-3">
              <PriceBreakdown pricing={pricing} />
              <div className="rounded-3xl bg-emerald-50 p-4">
                <p className="font-black text-emerald-950"><FiShield className="mr-2 inline" /> Payment protection simulation</p>
                <p className="mt-1 text-sm text-emerald-800">Funds are marked as protected after successful simulated payment. This is not real regulated escrow.</p>
              </div>
              <button type="button" onClick={pay} className="w-full rounded-3xl bg-amber-500 px-4 py-4 font-black text-neutral-950">
                Complete simulated payment
              </button>
              <CheckoutNav back={() => setStep(2)} />
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
};

const EmptyCheckout = () => (
  <main className="grid min-h-screen place-items-center bg-neutral-100 p-4">
    <section className="max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
      <FiShoppingBag className="mx-auto text-neutral-400" size={36} />
      <h1 className="mt-3 text-2xl font-black">Your cart is empty</h1>
      <p className="mt-2 text-sm text-neutral-500">Search for a merchant or product to start an order.</p>
      <Link href="/discover" className="mt-4 inline-flex rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">Go to discovery</Link>
    </section>
  </main>
);

const CheckoutNav = ({back, next}: {back?: () => void; next?: () => void}) => (
  <div className="grid grid-cols-2 gap-2">
    {back ? <button type="button" onClick={back} className="rounded-2xl border border-neutral-200 px-4 py-3 font-black">Back</button> : <span />}
    {next ? <button type="button" onClick={next} className="rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">Continue</button> : <span />}
  </div>
);

const Input = ({label, value, onChange}: {label: string; value: string; onChange: (value: string) => void}) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-2xl bg-neutral-100 px-4 py-3 font-semibold outline-none" />
  </label>
);

const PriceBreakdown = ({pricing}: {pricing: {subtotal: number; deliveryFee: number; protectionFee: number; discount: number; finalTotal: number}}) => (
  <div className="rounded-3xl border border-neutral-200 p-4">
    <h2 className="font-black">Price breakdown</h2>
    {[
      ['Product subtotal', pricing.subtotal],
      ['Delivery fee', pricing.deliveryFee],
      ['Buyer protection fee', pricing.protectionFee],
      ['Discount', -pricing.discount],
      ['Final total', pricing.finalTotal]
    ].map(([label, value]) => (
      <div key={label} className="mt-2 flex justify-between text-sm">
        <span className={label === 'Final total' ? 'font-black' : 'text-neutral-500'}>{label}</span>
        <span className="font-black">{formatKwacha(Number(value))}</span>
      </div>
    ))}
  </div>
);
