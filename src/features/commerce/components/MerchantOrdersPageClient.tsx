'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useState} from 'react';
import {FiBox, FiClock, FiCreditCard, FiLogOut, FiMessageCircle, FiPackage, FiShield, FiTrendingUp} from 'react-icons/fi';

import {merchantDashboardSeed} from '../data/merchantExperience';
import {initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, formatKwacha, getNextOrderStatus, getStatusLabel} from '../lib/commerceLogic';
import {readOrders, saveOrders} from '../services/orderService';
import type {Order} from '../types/commerce';
import {AuthFlow, type CommerceSession} from './AuthFlow';

export const MerchantOrdersPageClient = () => {
  const [session, setSession] = useState<CommerceSession | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => readOrders(initialOrders));
  const [selectedView, setSelectedView] = useState<'orders' | 'inventory' | 'support'>('orders');

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
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-neutral-200 bg-white p-5 lg:block">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Merchant OS</p>
          <h1 className="mt-1 text-3xl font-black">{session.businessName ?? session.name}</h1>
          <nav className="mt-8 grid gap-2" aria-label="Merchant sections">
            {[
              {id: 'orders', label: 'Orders', Icon: FiPackage},
              {id: 'inventory', label: 'Inventory', Icon: FiBox},
              {id: 'support', label: 'Support', Icon: FiMessageCircle}
            ].map(({id, label, Icon}) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedView(id as typeof selectedView)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left font-black transition ${
                  selectedView === id ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>
          <Link href="/discover" className="mt-8 flex min-h-12 items-center justify-center rounded-2xl bg-emerald-50 font-black text-emerald-800">
            Customer app
          </Link>
        </aside>

        <section className="min-w-0 pb-20">
          <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 p-4 backdrop-blur lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href="/discover" className="text-sm font-black text-neutral-500">Back to customer app</Link>
              <h1 className="mt-2 text-3xl font-black">Merchant workspace</h1>
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

          <section className="mx-auto max-w-7xl space-y-4 p-4 lg:p-8">
            {session.merchantSetup ? (
              <section className="rounded-3xl bg-neutral-950 p-5 text-white shadow-sm">
                <p className="text-sm font-black text-emerald-200">Onboarding complete</p>
                <h2 className="mt-1 text-3xl font-black">{session.merchantSetup.businessName}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">{session.merchantSetup.shortDescription}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <MerchantSetupTile label="First offer" value={`${session.merchantSetup.mainOffer} from K${session.merchantSetup.startingPrice}`} />
                  <MerchantSetupTile label="Service area" value={session.merchantSetup.serviceArea} />
                  <MerchantSetupTile label="Order style" value={session.merchantSetup.fulfilment.join(', ')} />
                </div>
              </section>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MerchantMetric icon={<FiTrendingUp />} label="Today revenue" value={formatKwacha(merchantDashboardSeed.todayRevenue)} />
              <MerchantMetric icon={<FiShield />} label="Protected funds" value={formatKwacha(merchantDashboardSeed.protectedFunds)} />
              <MerchantMetric icon={<FiCreditCard />} label="Payout balance" value={formatKwacha(merchantDashboardSeed.payoutBalance)} />
              <MerchantMetric icon={<FiClock />} label="Avg response" value={merchantDashboardSeed.averageResponse} />
            </div>

            <div className="grid grid-cols-3 gap-2 lg:hidden">
              {[
                {id: 'orders', label: 'Orders'},
                {id: 'inventory', label: 'Inventory'},
                {id: 'support', label: 'Support'}
              ].map((item) => (
                <button key={item.id} type="button" onClick={() => setSelectedView(item.id as typeof selectedView)} className={`rounded-2xl px-3 py-3 text-sm font-black ${selectedView === item.id ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-600'}`}>
                  {item.label}
                </button>
              ))}
            </div>

            {selectedView === 'orders' ? <MerchantOrderQueue orders={orders} updateOrder={updateOrder} /> : null}
            {selectedView === 'inventory' ? <MerchantInventory /> : null}
            {selectedView === 'support' ? <MerchantSupport /> : null}
          </section>
        </section>
      </div>
    </main>
  );
};

const MerchantOrderQueue = ({orders, updateOrder}: {orders: Order[]; updateOrder: (order: Order, reject?: boolean) => void}) => (
  <section className="space-y-4">
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Fulfilment queue</p>
      <h2 className="mt-1 text-2xl font-black">Incoming and active orders</h2>
      <p className="mt-1 text-sm text-neutral-500">This is the merchant-facing scaffold. Deeper inventory, disputes, payouts, and staff roles can be layered in later.</p>
    </div>
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
  </section>
);

const MerchantInventory = () => {
  const merchant = findSeller(merchantDashboardSeed.merchantId);
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Inventory signals</p>
      <h2 className="mt-1 text-2xl font-black">Products needing attention</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {merchant.products.map((product) => (
          <div key={product.id} className="rounded-3xl bg-neutral-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">{product.name}</h3>
                <p className="text-sm text-neutral-500">{formatKwacha(product.price)} - {product.category}</p>
              </div>
              <span className={`rounded-full px-3 py-2 text-sm font-black ${product.stock <= merchantDashboardSeed.lowStockThreshold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                {product.stock} left
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const MerchantSupport = () => (
  <section className="rounded-3xl bg-white p-5 shadow-sm">
    <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Customer care</p>
    <h2 className="mt-1 text-2xl font-black">Support preview</h2>
    <div className="mt-4 grid gap-3">
      {merchantDashboardSeed.supportQueue.map((item) => (
        <article key={item.id} className="rounded-3xl bg-neutral-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-emerald-700">{item.customer}</p>
              <h3 className="font-black">{item.topic}</h3>
              <p className="mt-1 text-sm text-neutral-500">{item.message}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-black">{item.status}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const MerchantMetric = ({icon, label, value}: {icon: ReactNode; label: string; value: string}) => (
  <div className="rounded-3xl bg-white p-4 shadow-sm">
    <div className="text-emerald-700">{icon}</div>
    <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
  </div>
);

const MerchantSetupTile = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-2xl bg-white/10 p-4">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
    <p className="mt-1 text-sm font-black leading-5 text-white">{value}</p>
  </div>
);

const Info = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-2xl bg-neutral-100 p-3">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-1 truncate font-black capitalize">{value}</p>
  </div>
);
