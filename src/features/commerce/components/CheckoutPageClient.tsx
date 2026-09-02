'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {FiAlertCircle, FiArrowLeft, FiCreditCard, FiMinus, FiPackage, FiPlus, FiShield, FiShoppingBag, FiTruck} from 'react-icons/fi';

import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {Label} from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';
import {cn} from '@/src/lib/cn';

import {deliverySlots, initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, formatKwacha} from '../lib/commerceLogic';
import {clearCart, readCart, updateCartQuantity} from '../services/cartService';
import {mockYangoProvider} from '../services/mockYangoProvider';
import {mockPaymentProvider} from '../services/mockPaymentProvider';
import {createProtectedOrder, readOrders, saveOrders} from '../services/orderService';
import {calculatePriceBreakdown} from '../services/pricingService';
import type {DeliveryAddress, FulfilmentMethod, PaymentInput} from '../types/commerce';
import {EmptyState, Field, Money, ProductThumb} from './shared';

const savedAddress: DeliveryAddress = {
  fullName: 'Demo Customer',
  phone: '0977000001',
  addressLine: 'Plot 12, Great East Road',
  area: 'Kabulonga',
  instructions: 'Call when outside.'
};

const steps = ['Cart', 'Delivery', 'Payment', 'Review'] as const;

const paymentMethodLabels: Record<PaymentInput['method'], string> = {
  mobile_money: 'Mobile money',
  card: 'Card',
  pay_on_pickup: 'Pay on pickup'
};

const mobileMoneyProviders: NonNullable<PaymentInput['provider']>[] = ['MTN Money', 'Airtel Money', 'Zamtel Money'];

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
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen bg-card pb-16">
        {loading ? (
          <p role="status" className="sticky top-0 z-30 bg-primary p-2 text-center text-xs font-medium text-primary-foreground">
            Processing simulation...
          </p>
        ) : null}

        <header className="border-b border-border/50 p-4 lg:px-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/discover">
              <FiArrowLeft aria-hidden />
              Back to discovery
            </Link>
          </Button>
          <h1 className="mt-1 font-display text-xl font-semibold">Checkout</h1>
          <p className="text-xs text-muted-foreground">{merchant.name} - single merchant order</p>
        </header>

        <section className="mx-auto max-w-3xl space-y-4 p-4 lg:p-6">
          {error ? (
            <p role="alert" className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
              <FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />
              {error}
            </p>
          ) : null}

          <nav className="grid grid-cols-4 gap-1.5" aria-label="Checkout steps">
            {steps.map((label, index) => (
              <Button
                key={label}
                type="button"
                size="sm"
                variant={step === index ? 'default' : 'secondary'}
                aria-current={step === index ? 'step' : undefined}
                onClick={() => setStep(index)}
                className={cn('h-9', step !== index && 'text-muted-foreground')}
              >
                {label}
              </Button>
            ))}
          </nav>

          {step === 0 ? (
            <section className="space-y-2">
              {cart.items.map((item) => {
                const product = findProduct(merchant, item.productId);
                return (
                  <Card key={item.productId} className="gap-0 rounded-lg border-border/50 p-3 shadow-none">
                    <div className="flex gap-3">
                      <ProductThumb imageStyle={product.imageStyle} className="size-16" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatKwacha(product.price)} each</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="size-8"
                            aria-label={`Decrease ${product.name} quantity`}
                            onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          >
                            <FiMinus aria-hidden />
                          </Button>
                          <span className="min-w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                          <Button
                            type="button"
                            size="icon"
                            className="size-8"
                            aria-label={`Increase ${product.name} quantity`}
                            onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          >
                            <FiPlus aria-hidden />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              <CheckoutNav next={() => setStep(1)} />
            </section>
          ) : null}

          {step === 1 ? (
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(['delivery', 'pickup'] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={method === option ? 'default' : 'outline'}
                    aria-pressed={method === option}
                    onClick={() => setMethod(option)}
                    className="h-auto flex-col items-start gap-1 p-3 capitalize"
                  >
                    {option === 'delivery' ? <FiTruck aria-hidden /> : <FiPackage aria-hidden />}
                    {option}
                  </Button>
                ))}
              </div>

              {method === 'delivery' ? (
                <Card className="gap-3 rounded-lg border-border/50 p-4 shadow-none">
                  <Field label="Full name" value={address.fullName} onChange={(value) => setAddress((current) => ({...current, fullName: value}))} />
                  <Field label="Phone number" inputMode="tel" value={address.phone} onChange={(value) => setAddress((current) => ({...current, phone: value}))} />
                  <Field label="Address" value={address.addressLine} onChange={(value) => setAddress((current) => ({...current, addressLine: value}))} />
                  <Field label="Area or neighbourhood" value={address.area} onChange={(value) => setAddress((current) => ({...current, area: value}))} />
                  <Field label="Delivery instructions" value={address.instructions ?? ''} onChange={(value) => setAddress((current) => ({...current, instructions: value}))} />
                </Card>
              ) : null}

              <div>
                <Label htmlFor="delivery-slot">Delivery slot</Label>
                <Select value={slotId} onValueChange={setSlotId}>
                  <SelectTrigger id="delivery-slot" className="mt-1.5 w-full">
                    <SelectValue placeholder="Choose a slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.label} - {formatKwacha(slot.fee)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CheckoutNav back={() => setStep(0)} next={() => setStep(2)} />
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-3">
              <div className="grid gap-2">
                {(['mobile_money', 'card', 'pay_on_pickup'] as const).map((methodOption) => (
                  <Button
                    key={methodOption}
                    type="button"
                    variant={payment.method === methodOption ? 'default' : 'outline'}
                    aria-pressed={payment.method === methodOption}
                    onClick={() => setPayment((current) => ({...current, method: methodOption}))}
                    className="h-auto justify-start gap-3 p-3"
                  >
                    <FiCreditCard aria-hidden />
                    {paymentMethodLabels[methodOption]}
                  </Button>
                ))}
              </div>

              {payment.method === 'mobile_money' ? (
                <Card className="gap-3 rounded-lg border-border/50 p-4 shadow-none">
                  <div>
                    <Label htmlFor="mm-provider">Provider</Label>
                    <Select
                      value={payment.provider}
                      onValueChange={(value) => setPayment((current) => ({...current, provider: value as PaymentInput['provider']}))}
                    >
                      <SelectTrigger id="mm-provider" className="mt-1.5 w-full">
                        <SelectValue placeholder="Choose a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {mobileMoneyProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Field
                    label="Mobile money phone"
                    inputMode="tel"
                    value={payment.phone ?? ''}
                    onChange={(value) => setPayment((current) => ({...current, phone: value}))}
                    hint="Use a number ending in 000 to simulate a payment failure."
                  />
                </Card>
              ) : null}

              <CheckoutNav back={() => setStep(1)} next={() => setStep(3)} />
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-3">
              <PriceBreakdown pricing={pricing} />
              <Card className="gap-0 rounded-lg border-border/50 bg-primary/5 p-4 shadow-none">
                <p className="flex items-center gap-2 text-sm font-medium text-primary">
                  <FiShield aria-hidden />
                  Payment protection simulation
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Funds are marked as protected after successful simulated payment. This is not real regulated escrow.
                </p>
              </Card>
              <Button type="button" size="lg" className="w-full" disabled={loading} onClick={pay}>
                {loading ? 'Processing...' : 'Complete simulated payment'}
              </Button>
              <CheckoutNav back={() => setStep(2)} />
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
};

const EmptyCheckout = () => (
  <main className="grid min-h-screen place-items-center bg-background p-4">
    <div className="w-full max-w-sm">
      <EmptyState
        icon={<FiShoppingBag aria-hidden />}
        title="Your cart is empty"
        body="Search for a merchant or product to start an order."
      />
      <Button asChild className="mt-3 w-full">
        <Link href="/discover">Go to discovery</Link>
      </Button>
    </div>
  </main>
);

const CheckoutNav = ({back, next}: {back?: () => void; next?: () => void}) => (
  <div className="grid grid-cols-2 gap-2">
    {back ? (
      <Button type="button" variant="outline" onClick={back}>
        <FiArrowLeft aria-hidden />
        Back
      </Button>
    ) : (
      <span />
    )}
    {next ? (
      <Button type="button" onClick={next}>
        Continue
      </Button>
    ) : (
      <span />
    )}
  </div>
);

type Pricing = {subtotal: number; deliveryFee: number; protectionFee: number; discount: number; finalTotal: number};

const PriceBreakdown = ({pricing}: {pricing: Pricing}) => {
  const rows: Array<{label: string; amount: number; total?: boolean}> = [
    {label: 'Product subtotal', amount: pricing.subtotal},
    {label: 'Delivery fee', amount: pricing.deliveryFee},
    {label: 'Buyer protection fee', amount: pricing.protectionFee},
    {label: 'Discount', amount: -pricing.discount},
    {label: 'Final total', amount: pricing.finalTotal, total: true}
  ];

  return (
    <Card className="gap-0 rounded-lg border-border/50 p-4 shadow-none">
      <h2 className="text-sm font-medium">Price breakdown</h2>
      <dl className="mt-2 grid gap-1.5">
        {rows.map(({label, amount, total}) => (
          <div
            key={label}
            className={cn('flex items-baseline justify-between gap-3 text-sm', total && 'border-t border-border/50 pt-2')}
          >
            <dt className={total ? 'font-medium' : 'text-xs text-muted-foreground'}>{label}</dt>
            <dd>
              <Money amount={amount} emphasis={total ? 'strong' : 'default'} />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};
