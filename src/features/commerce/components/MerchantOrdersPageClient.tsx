'use client';

import Link from 'next/link';
import {useState} from 'react';
import {FiBox, FiLogOut, FiMessageCircle, FiPackage} from 'react-icons/fi';

import {Badge} from '@/src/components/ui/badge';
import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {cn} from '@/src/lib/cn';

import {merchantDashboardSeed} from '../data/merchantExperience';
import {initialOrders} from '../data/mockCommerce';
import {findProduct, findSeller, formatKwacha, getNextOrderStatus} from '../lib/commerceLogic';
import {readOrders, saveOrders} from '../services/orderService';
import type {Order} from '../types/commerce';
import {AuthFlow, type CommerceSession} from './AuthFlow';
import {AppShell, Metric, Money, ProductThumb, StatusBadge, type ShellNavItem} from './shared';

type MerchantView = 'orders' | 'inventory' | 'support';

const views: ShellNavItem<MerchantView>[] = [
  {id: 'orders', label: 'Orders', Icon: FiPackage},
  {id: 'inventory', label: 'Inventory', Icon: FiBox},
  {id: 'support', label: 'Support', Icon: FiMessageCircle}
];

export const MerchantOrdersPageClient = () => {
  const [session, setSession] = useState<CommerceSession | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => readOrders(initialOrders));
  const [selectedView, setSelectedView] = useState<MerchantView>('orders');

  const logout = async () => {
    await fetch('/api/auth/logout', {method: 'POST'});
    setSession(null);
  };

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
          <Button asChild variant="secondary" size="sm">
            <Link href="/discover">Continue as customer</Link>
          </Button>
        }
      />
    );
  }

  const updateOrder = (order: Order, reject = false) => {
    const nextOrders = orders.map((item) =>
      item.id === order.id
        ? {
            ...item,
            status: reject ? ('cancelled' as const) : getNextOrderStatus(item.status),
            updatedAt: new Date().toISOString()
          }
        : item
    );
    setOrders(nextOrders);
    saveOrders(nextOrders);
  };

  return (
    <AppShell
      brand={{eyebrow: 'Merchant OS', title: session.businessName ?? session.name}}
      nav={views}
      activeId={selectedView}
      onNavigate={setSelectedView}
      header={{
        eyebrow: 'Merchant workspace',
        title: views.find((view) => view.id === selectedView)?.label ?? 'Orders',
        subtitle: `${session.businessName ?? session.name} - ${session.onboarded ? 'onboarded' : 'logged in'}`,
        actions: (
          <Button type="button" variant="outline" size="icon" onClick={logout} aria-label="Logout">
            <FiLogOut aria-hidden />
          </Button>
        )
      }}
      sidebarFooter={
        <div className="grid gap-2">
          <Button asChild variant="outline" className="h-10 justify-center">
            <Link href="/discover">Customer app</Link>
          </Button>
          <Button type="button" variant="outline" className="h-10 justify-center gap-2" onClick={logout}>
            <FiLogOut aria-hidden />
            Logout
          </Button>
        </div>
      }
    >
      <section className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
        {session.merchantSetup ? (
          <Card className="gap-0 rounded-lg border-0 bg-primary p-4 text-primary-foreground shadow-none">
            <p className="text-xs text-primary-foreground/60">Onboarding complete</p>
            <h2 className="font-display text-lg font-semibold">{session.merchantSetup.businessName}</h2>
            <p className="mt-1 max-w-3xl text-xs leading-6 text-primary-foreground/70">
              {session.merchantSetup.shortDescription}
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <MerchantSetupTile
                label="First offer"
                value={`${session.merchantSetup.mainOffer} from K${session.merchantSetup.startingPrice}`}
              />
              <MerchantSetupTile label="Service area" value={session.merchantSetup.serviceArea} />
              <MerchantSetupTile label="Order style" value={session.merchantSetup.fulfilment.join(', ')} />
            </div>
          </Card>
        ) : null}

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Today revenue" value={formatKwacha(merchantDashboardSeed.todayRevenue)} />
          <Metric label="Protected funds" value={formatKwacha(merchantDashboardSeed.protectedFunds)} />
          <Metric label="Payout balance" value={formatKwacha(merchantDashboardSeed.payoutBalance)} />
          <Metric label="Avg response" value={merchantDashboardSeed.averageResponse} />
        </div>

        {selectedView === 'orders' ? <MerchantOrderQueue orders={orders} updateOrder={updateOrder} /> : null}
        {selectedView === 'inventory' ? <MerchantInventory /> : null}
        {selectedView === 'support' ? <MerchantSupport /> : null}
      </section>
    </AppShell>
  );
};

const MerchantOrderQueue = ({orders, updateOrder}: {orders: Order[]; updateOrder: (order: Order, reject?: boolean) => void}) => (
  <section className="space-y-3">
    <div>
      <p className="text-xs text-muted-foreground">Fulfilment queue</p>
      <h2 className="font-display text-base font-semibold">Incoming and active orders</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        This is the merchant-facing scaffold. Deeper inventory, disputes, payouts, and staff roles can be layered in
        later.
      </p>
    </div>

    {orders.map((order) => {
      const merchant = findSeller(order.sellerId);
      const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
      return (
        <Card key={order.id} className="gap-0 rounded-lg border-border/50 p-3 shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <ProductThumb imageStyle={product.imageStyle} className="size-12" />
              <div className="min-w-0">
                <p className="text-xs text-primary">{merchant.name}</p>
                <h3 className="truncate text-sm font-medium">
                  {order.id} - {order.customerName}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {order.items[0]?.quantity ?? 1} x {product.name} - {order.fulfilmentMethod}
                </p>
                {order.deliveryAddress ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {order.deliveryAddress.addressLine}, {order.deliveryAddress.area} - {order.deliveryAddress.phone}
                  </p>
                ) : null}
              </div>
            </div>
            <StatusBadge kind="order" status={order.status} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Metric label="Slot" value={order.deliverySlotId} />
            <Metric
              label="Protection"
              value={<StatusBadge kind="protection" status={order.protectionStatus ?? 'funds_protected'} />}
            />
            <Metric label="Transaction" value={order.transactionReference ?? 'Not paid'} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => updateOrder(order)}>
              Move to next status
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => updateOrder(order, true)}>
              Reject order
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/orders/${order.id}`}>View customer tracking</Link>
            </Button>
          </div>
        </Card>
      );
    })}
  </section>
);

const MerchantInventory = () => {
  const merchant = findSeller(merchantDashboardSeed.merchantId);

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">Inventory signals</p>
        <h2 className="font-display text-base font-semibold">Products needing attention</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {merchant.products.map((product) => {
          const isLow = product.stock <= merchantDashboardSeed.lowStockThreshold;
          return (
            <Card key={product.id} className="gap-0 rounded-lg border-border/50 p-3 shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ProductThumb imageStyle={product.imageStyle} className="size-10" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium">{product.name}</h3>
                    <Money amount={product.price} label={product.category} />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={cn('shrink-0', isLow ? 'bg-warning-muted text-warning' : 'bg-success-muted text-success')}
                >
                  {product.stock} left
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

const MerchantSupport = () => (
  <section className="space-y-3">
    <div>
      <p className="text-xs text-muted-foreground">Customer care</p>
      <h2 className="font-display text-base font-semibold">Support preview</h2>
    </div>
    <div className="grid gap-2">
      {merchantDashboardSeed.supportQueue.map((item) => (
        <Card key={item.id} className="gap-0 rounded-lg border-border/50 p-3 shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-primary">{item.customer}</p>
              <h3 className="truncate text-sm font-medium">{item.topic}</h3>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.message}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 capitalize">
              {item.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  </section>
);

const MerchantSetupTile = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-md bg-primary-foreground/10 p-3">
    <p className="text-xs text-primary-foreground/60">{label}</p>
    <p className="mt-0.5 text-xs leading-5">{value}</p>
  </div>
);
