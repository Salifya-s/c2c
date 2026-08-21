'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import {FiAlertCircle, FiCheckCircle, FiClock, FiCreditCard, FiPackage, FiShield, FiShoppingBag, FiTruck} from 'react-icons/fi';

import {initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, formatKwacha, getNextOrderStatus, getStatusLabel} from '../lib/commerceLogic';
import {readOrders, saveOrders} from '../services/orderService';
import type {Order, OrderStatus} from '../types/commerce';

const timeline: Array<{status: OrderStatus; label: string; detail: string; Icon: typeof FiClock}> = [
  {status: 'paid', label: 'Order placed', detail: 'The order was created after simulated payment.', Icon: FiShoppingBag},
  {status: 'paid', label: 'Payment protected', detail: 'Funds are marked as protected in this prototype.', Icon: FiShield},
  {status: 'awaiting_merchant_acceptance', label: 'Waiting for merchant confirmation', detail: 'The merchant can accept or reject this order.', Icon: FiClock},
  {status: 'accepted', label: 'Merchant accepted the order', detail: 'Your order is confirmed by the seller.', Icon: FiCheckCircle},
  {status: 'preparing', label: 'Preparing your order', detail: 'The merchant is preparing your items.', Icon: FiPackage},
  {status: 'courier_requested', label: 'Courier requested', detail: 'Mock Yango courier request has been created.', Icon: FiTruck},
  {status: 'courier_assigned', label: 'Courier assigned', detail: 'A courier has been assigned in the simulator.', Icon: FiTruck},
  {status: 'out_for_delivery', label: 'Your order is on the way', detail: 'The courier is moving toward your address.', Icon: FiTruck},
  {status: 'delivered', label: 'Delivered', detail: 'Confirm delivery only after receiving the order.', Icon: FiPackage},
  {status: 'completed', label: 'Completed', detail: 'Protection is released after confirmation.', Icon: FiCreditCard}
];

export const OrderTrackingPageClient = ({orderId, confirmed = false}: {orderId: string; confirmed?: boolean}) => {
  const [orders, setOrders] = useState<Order[]>(() => readOrders(initialOrders));
  const [supportOpen, setSupportOpen] = useState(false);
  const order = orders.find((item) => item.id === orderId);

  const currentIndex = useMemo(() => {
    if (!order) return 0;
    const index = timeline.map((item) => item.status).lastIndexOf(order.status);
    return Math.max(0, index);
  }, [order]);

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100 p-4">
        <section className="max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
          <FiAlertCircle className="mx-auto text-red-500" size={36} />
          <h1 className="mt-3 text-2xl font-black">Order status cannot be retrieved</h1>
          <p className="mt-2 text-sm text-neutral-500">The order may only exist in another browser session.</p>
          <Link href="/discover" className="mt-4 inline-flex rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">Continue shopping</Link>
        </section>
      </main>
    );
  }

  const merchant = findSeller(order.sellerId);
  const firstProduct = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
  const amount = order.finalAmount ?? 0;

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
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="min-h-screen bg-white pb-24">
        {confirmed ? (
          <section className="bg-emerald-700 p-4 text-white">
            <p className="font-black"><FiCheckCircle className="mr-2 inline" /> Order confirmed</p>
            <p className="mt-1 text-sm text-emerald-50">Transaction reference: {order.transactionReference}</p>
          </section>
        ) : null}

        <section className={`h-52 bg-gradient-to-br ${firstProduct.imageStyle}`}>
          <div className="flex h-full flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <p className="text-sm font-bold opacity-90">{order.id}</p>
            <h1 className="text-3xl font-black">{getStatusLabel(order.status)}</h1>
            <p className="text-sm opacity-90">{merchant.name}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-4 p-4 lg:p-8">
          <div className="rounded-3xl border border-neutral-200 p-4">
            <h2 className="font-black">Order summary</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Summary label="Payment" value={order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus ?? 'Pending'} />
              <Summary label="Protection" value={order.protectionStatus?.replaceAll('_', ' ') ?? 'funds protected'} />
              <Summary label="Fulfilment" value={order.fulfilmentMethod} />
              <Summary label="Amount" value={formatKwacha(amount)} />
            </div>
            <div className="mt-3 rounded-2xl bg-amber-50 p-3">
              <p className="text-sm font-black text-amber-900">Completion PIN</p>
              <p className="text-3xl font-black tracking-[0.18em]">{order.escrowPin}</p>
              <p className="text-xs font-semibold text-amber-800">Share this only after delivery or pickup.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Tracking timeline</h2>
              <span className="text-sm font-black text-emerald-700">{Math.round(((currentIndex + 1) / timeline.length) * 100)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-emerald-600 transition-all duration-700" style={{width: `${((currentIndex + 1) / timeline.length) * 100}%`}} />
            </div>
            <div className="mt-4 space-y-3">
              {timeline.map((item, index) => {
                const Icon = item.Icon;
                const active = index <= currentIndex;
                return (
                  <div key={`${item.label}-${index}`} className="grid grid-cols-[36px_1fr] gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${active ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                      <Icon size={16} />
                    </span>
                    <div className={`rounded-2xl p-3 ${index === currentIndex ? 'bg-emerald-50' : 'bg-white'}`}>
                      <p className="font-black">{item.label}</p>
                      <p className="text-sm text-neutral-500">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            {order.status !== 'completed' && order.status !== 'delivered' ? (
              <button type="button" onClick={() => updateOrder(getNextOrderStatus(order.status))} className="rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">
                Simulate next update
              </button>
            ) : null}
            {order.status === 'delivered' ? (
              <button type="button" onClick={() => updateOrder('completed')} className="rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white">
                Confirm received and release protection
              </button>
            ) : null}
          </div>

          <section className="rounded-3xl border border-neutral-200 p-4">
            <p className="font-black">Need help?</p>
            <p className="mt-1 text-sm text-neutral-500">Report late delivery, wrong item, damaged goods, missing item, or non-delivery. The prototype attaches chat, payment, PIN, and tracking history.</p>
            <button type="button" onClick={() => setSupportOpen(true)} className="mt-3 rounded-2xl border border-neutral-200 px-4 py-3 font-black">
              Report issue
            </button>
            {supportOpen ? <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">Support timeline created. Protection status can move to disputed in a full backend.</div> : null}
          </section>

          <div className="grid grid-cols-2 gap-2">
            <Link href="/discover" className="rounded-2xl border border-neutral-200 px-4 py-3 text-center font-black">Continue shopping</Link>
            <Link href={`/merchants/${merchant.id}`} className="rounded-2xl bg-amber-500 px-4 py-3 text-center font-black text-neutral-950">View store</Link>
          </div>
        </section>
      </div>
    </main>
  );
};

const Summary = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-2xl bg-neutral-100 p-3">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-1 font-black capitalize">{value}</p>
  </div>
);
