'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import {FiAlertCircle, FiArrowLeft, FiCheckCircle, FiClock, FiCreditCard, FiKey, FiPackage, FiShield, FiShoppingBag, FiTruck} from 'react-icons/fi';

import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {cn} from '@/src/lib/cn';

import {initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, formatKwacha, getNextOrderStatus, getStatusLabel, normaliseStatus} from '../lib/commerceLogic';
import {readOrders, saveOrders} from '../services/orderService';
import type {Order, OrderStatus} from '../types/commerce';
import {EmptyState, Metric, ProductThumb, StatusBadge} from './shared';

const timeline: Array<{status: OrderStatus; label: string; detail: string; Icon: typeof FiClock}> = [
  {status: 'paid_in_escrow', label: 'Order placed', detail: 'The order was created after simulated payment.', Icon: FiShoppingBag},
  {status: 'paid_in_escrow', label: 'Payment protected', detail: 'Funds are marked as protected in this prototype.', Icon: FiShield},
  {status: 'awaiting_merchant_acceptance', label: 'Waiting for merchant confirmation', detail: 'The merchant can accept or reject this order.', Icon: FiClock},
  {status: 'accepted', label: 'Merchant accepted the order', detail: 'Your order is confirmed by the seller.', Icon: FiCheckCircle},
  {status: 'preparing', label: 'Preparing your order', detail: 'The merchant is preparing your items.', Icon: FiPackage},
  {status: 'courier_requested', label: 'Courier requested', detail: 'Mock Yango courier request has been created.', Icon: FiTruck},
  {status: 'courier_assigned', label: 'Courier assigned', detail: 'A courier has been assigned in the simulator.', Icon: FiTruck},
  {status: 'out_for_delivery', label: 'Your order is on the way', detail: 'The courier is moving toward your address.', Icon: FiTruck},
  {status: 'delivered', label: 'Delivered', detail: 'Confirm delivery only after receiving the order.', Icon: FiPackage},
  {status: 'pin_verified', label: 'Completion PIN verified', detail: 'The PIN was shared and accepted at handover.', Icon: FiKey},
  {status: 'completed', label: 'Completed', detail: 'Protection is released after confirmation.', Icon: FiCreditCard}
];

export const OrderTrackingPageClient = ({orderId, confirmed = false}: {orderId: string; confirmed?: boolean}) => {
  const [orders, setOrders] = useState<Order[]>(() => readOrders(initialOrders));
  const [supportOpen, setSupportOpen] = useState(false);
  const order = orders.find((item) => item.id === orderId);

  const currentIndex = useMemo(() => {
    if (!order) return 0;
    const index = timeline.map((item) => item.status).lastIndexOf(normaliseStatus(order.status));
    return Math.max(0, index);
  }, [order]);

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4">
        <div className="w-full max-w-sm">
          <EmptyState
            icon={<FiAlertCircle aria-hidden />}
            title="Order status cannot be retrieved"
            body="The order may only exist in another browser session."
          />
          <Button asChild className="mt-3 w-full">
            <Link href="/discover">Continue shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  const merchant = findSeller(order.sellerId);
  const firstProduct = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
  const amount = order.finalAmount ?? 0;
  const progress = Math.round(((currentIndex + 1) / timeline.length) * 100);

  const updateOrder = (nextStatus: OrderStatus) => {
    const nextOrders = orders.map((item) =>
      item.id === order.id
        ? {
            ...item,
            status: nextStatus,
            protectionStatus: nextStatus === 'completed' ? 'released' : nextStatus === 'delivered' ? 'release_pending' : item.protectionStatus,
            updatedAt: new Date().toISOString()
          }
        : item
    );
    setOrders(nextOrders);
    saveOrders(nextOrders);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen bg-card pb-16">
        {confirmed ? (
          <p role="status" className="flex items-center gap-2 bg-success p-3 text-xs text-primary-foreground">
            <FiCheckCircle aria-hidden />
            Order confirmed. Transaction reference: {order.transactionReference}
          </p>
        ) : null}

        <section className="relative h-40">
          <ProductThumb
            imageStyle={firstProduct.imageStyle}
            className="absolute inset-0 size-full rounded-none border-0"
          />
          <div className="relative flex h-full flex-col justify-between bg-gradient-to-t from-foreground/80 to-foreground/20 p-4 text-primary-foreground">
            <Button asChild size="sm" variant="secondary" className="w-fit">
              <Link href="/discover">
                <FiArrowLeft aria-hidden />
                Continue shopping
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="text-xs opacity-80">{order.id}</p>
              <h1 className="truncate font-display text-2xl font-semibold">{getStatusLabel(order.status)}</h1>
              <p className="truncate text-xs opacity-80">{merchant.name}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl space-y-4 p-4 lg:p-6">
          <Card className="gap-3 rounded-lg border-border/50 p-4 shadow-none">
            <h2 className="text-sm font-medium">Order summary</h2>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Payment" value={<StatusBadge kind="payment" status={order.paymentStatus ?? 'paid'} />} />
              <Metric label="Protection" value={<StatusBadge kind="protection" status={order.protectionStatus ?? 'funds_protected'} />} />
              <Metric label="Fulfilment" value={order.fulfilmentMethod} />
              <Metric label="Amount" value={formatKwacha(amount)} />
            </div>
            <div className="rounded-md bg-warning-muted p-3">
              <p className="text-xs font-medium text-warning">Completion PIN</p>
              <p className="font-mono text-2xl font-semibold tracking-[0.3em] text-warning">{order.escrowPin}</p>
              <p className="text-xs text-warning/80">Share this only after delivery or pickup.</p>
            </div>
          </Card>

          <Card className="gap-3 rounded-lg border-border/50 p-4 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Tracking timeline</h2>
              <span className="text-xs font-medium tabular-nums text-primary">{progress}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Order progress"
            >
              {/* Width is data-driven, so it stays an inline style rather than a utility class. */}
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{width: `${progress}%`}} />
            </div>
            <ol className="grid gap-2">
              {timeline.map((item, index) => {
                const Icon = item.Icon;
                const active = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <li key={`${item.label}-${index}`} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span
                      className={cn(
                        'grid size-8 place-items-center rounded-full',
                        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon aria-hidden size={15} />
                    </span>
                    <div
                      className={cn('rounded-md p-2', isCurrent && 'bg-primary/5')}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <div className="grid gap-2">
            {order.status !== 'completed' && order.status !== 'delivered' ? (
              <Button type="button" onClick={() => updateOrder(getNextOrderStatus(order.status))}>
                Simulate next update
              </Button>
            ) : null}
            {order.status === 'delivered' ? (
              <Button type="button" onClick={() => updateOrder('completed')}>
                Confirm received and release protection
              </Button>
            ) : null}
          </div>

          <Card className="gap-0 rounded-lg border-border/50 p-4 shadow-none">
            <p className="text-sm font-medium">Need help?</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Report late delivery, wrong item, damaged goods, missing item, or non-delivery. The prototype attaches
              chat, payment, PIN, and tracking history.
            </p>
            {/* Mock affordance: the support flow is intentionally not implemented yet. */}
            <Button type="button" variant="outline" className="mt-3 w-fit" onClick={() => setSupportOpen(true)}>
              Report issue
            </Button>
            {supportOpen ? (
              <p role="status" className="mt-3 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                Support timeline created. Protection status can move to disputed in a full backend.
              </p>
            ) : null}
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href="/discover">Continue shopping</Link>
            </Button>
            <Button asChild>
              <Link href={`/merchants/${merchant.id}`}>View store</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};
