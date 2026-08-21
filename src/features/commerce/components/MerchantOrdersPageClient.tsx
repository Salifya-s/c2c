'use client';

import Link from 'next/link';
import {useState} from 'react';
import {FiLogOut} from 'react-icons/fi';

import {initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, getNextOrderStatus, getStatusLabel} from '../lib/commerceLogic';
import {readOrders, saveOrders} from '../services/orderService';
import type {Order} from '../types/commerce';
import {AuthFlow, type CommerceSession} from './AuthFlow';

export const MerchantOrdersPageClient = () => {
  const [session, setSession] = useState<CommerceSession | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => readOrders(initialOrders));

  if (!session) {
    return (
      <AuthFlow
        initialRole="merchant"
        title="Merchant login and onboarding"
        description="Preview how merchants enter the order workspace, confirm business details, and manage fulfilment after checkout."
        onComplete={(nextSession) => {
          if (nextSession.role === 'customer') {
            window.location.href = '/discover';
            return;
          }
          setSession(nextSession);
        }}
        alternateAction={
          <Link href="/discover" className="inline-flex rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15">
            Continue as customer
          </Link>
        }
      />
    );
  }

  const updateOrder = (order: Order, reject = false) => {
    const nextOrders = orders.map((item) =>
      item.id === order.id
        ? {
            ...item,
            status: reject ? 'cancelled' : getNextOrderStatus(item.status),
            updatedAt: new Date().toISOString()
          }
        : item
    );
    setOrders(nextOrders);
    saveOrders(nextOrders);
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href="/discover" className="text-sm font-black text-neutral-500">Back to customer app</Link>
              <h1 className="mt-2 text-3xl font-black">Merchant order management</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {session.businessName ?? session.name} - {session.onboarded ? 'onboarded merchant workspace' : 'logged in merchant workspace'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSession(null)}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-neutral-200 px-4 font-black text-neutral-600 transition hover:bg-neutral-100"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </header>

        {orders.map((order) => {
          const merchant = findSeller(order.sellerId);
          const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
          return (
            <article key={order.id} className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-emerald-700">{merchant.name}</p>
                  <h2 className="text-xl font-black">{order.id} - {order.customerName}</h2>
                  <p className="text-sm text-neutral-500">
                    {order.items[0]?.quantity ?? 1} x {product.name} - {order.fulfilmentMethod}
                  </p>
                  {order.deliveryAddress ? (
                    <p className="mt-1 text-sm text-neutral-500">
                      {order.deliveryAddress.addressLine}, {order.deliveryAddress.area} - {order.deliveryAddress.phone}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-2 text-sm font-black">{getStatusLabel(order.status)}</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Info label="Slot" value={order.deliverySlotId} />
                <Info label="Protection" value={order.protectionStatus?.replaceAll('_', ' ') ?? 'funds protected'} />
                <Info label="Transaction" value={order.transactionReference ?? 'Not paid'} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => updateOrder(order)} className="rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">
                  Move to next status
                </button>
                <button type="button" onClick={() => updateOrder(order, true)} className="rounded-2xl border border-neutral-200 px-4 py-3 font-black">
                  Reject order
                </button>
                <Link href={`/orders/${order.id}`} className="rounded-2xl bg-amber-500 px-4 py-3 font-black text-neutral-950">
                  View customer tracking
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};

const Info = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-2xl bg-neutral-100 p-3">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-1 truncate font-black capitalize">{value}</p>
  </div>
);
