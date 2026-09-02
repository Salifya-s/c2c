'use client';

import Link from 'next/link';
import type {Dispatch, SetStateAction} from 'react';
import {useMemo, useState} from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiChevronRight,
  FiClock,
  FiHome,
  FiLogOut,
  FiMessageCircle,
  FiPackage,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiUser
} from 'react-icons/fi';

import {Badge} from '@/src/components/ui/badge';
import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {Input} from '@/src/components/ui/input';
import {Label} from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/src/components/ui/sheet';
import {Skeleton} from '@/src/components/ui/skeleton';
import {cn} from '@/src/lib/cn';

import {customerFilterLocations, customerProfileSeed, discoveryCategoryCards, discoverySuggestions, recentConversations} from '../data/customerExperience';
import {initialOrders, sellers} from '../data/mockCommerce';
import {calculateTrustScore, findProduct, findSeller, formatKwacha} from '../lib/commerceLogic';
import {addCartItem, getCartItemCount, getMerchantCartQuantity, readMultiCart, saveMultiCart, setActiveMerchantCart} from '../services/cartService';
import {readOrders} from '../services/orderService';
import {searchCommerce} from '../services/searchService';
import type {DiscoveryFilters, MultiMerchantCartState, ProductResult} from '../types/commerce';
import {AuthFlow, type CommerceSession} from './AuthFlow';
import {AppShell, EmptyState, Metric, Money, ProductThumb, StatusBadge, type ShellNavItem} from './shared';

type CustomerTab = 'discover' | 'chat' | 'orders' | 'profile';

/** Radix Select reserves the empty string, so "any location" needs a sentinel. */
const ANY_LOCATION = 'all';

const tabs: ShellNavItem<CustomerTab>[] = [
  {id: 'discover', label: 'Discover', Icon: FiHome},
  {id: 'chat', label: 'Chat', Icon: FiMessageCircle},
  {id: 'orders', label: 'Orders', Icon: FiPackage},
  {id: 'profile', label: 'Profile', Icon: FiUser}
];

export const DiscoveryPageClient = () => {
  const [session, setSession] = useState<CommerceSession | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerTab>('discover');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [multiCart, setMultiCart] = useState<MultiMerchantCartState>(() => readMultiCart());
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');

  const results = useMemo(() => searchCommerce(query, filters), [filters, query]);
  const cartCount = getCartItemCount(multiCart);

  const logout = async () => {
    await fetch('/api/auth/logout', {method: 'POST'});
    setSession(null);
  };

  if (!session) {
    return (
      <AuthFlow
        initialRole="customer"
        title="Login or join ZamComm"
        description="Preview how customers and merchants enter the commerce workspace before moving into discovery, chat, orders, and fulfilment."
        onComplete={(nextSession) => {
          if (nextSession.role === 'merchant') {
            window.location.href = '/merchant/orders';
            return;
          }
          setSession(nextSession);
        }}
      />
    );
  }

  const runSearch = (nextQuery = query) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (nextQuery.toLowerCase().includes('connection')) setError('Connection lost while searching. Try again.');
      setLoading(false);
    }, 450);
  };

  const refreshCart = () => setMultiCart(readMultiCart());

  const addResultToCart = (product: ProductResult) => {
    if (product.available === false || product.stock < 1) {
      setCartMessage('This product is unavailable. Choose another item from this merchant.');
      return;
    }
    const nextCart = addCartItem(readMultiCart(), product.merchant, product);
    saveMultiCart(nextCart);
    setMultiCart(nextCart);
    setCartMessage(`${product.name} added to ${product.merchant.name} cart.`);
  };

  return (
    <AppShell
      brand={{eyebrow: 'AICOS', title: 'ZamComm'}}
      nav={tabs}
      activeId={activeTab}
      onNavigate={setActiveTab}
      header={{
        eyebrow: 'Customer app',
        title: tabs.find((tab) => tab.id === activeTab)?.label ?? 'Discover',
        subtitle: `${session.name} - ${session.onboarded ? 'onboarded' : 'logged in'}`,
        actions: (
          <>
            <CartButton count={cartCount} onClick={() => setCartDrawerOpen(true)} />
            <Button type="button" variant="outline" size="icon" onClick={logout} aria-label="Logout">
              <FiLogOut aria-hidden />
            </Button>
          </>
        )
      }}
      sidebarFooter={
        <div className="grid gap-3">
          <Card className="gap-1 rounded-lg border-border/50 bg-primary/5 p-3 shadow-none">
            <p className="text-sm font-medium text-primary">Payment protection</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Track protected orders from discovery to delivery without leaving the platform.
            </p>
          </Card>
          <Button type="button" variant="outline" className="h-10 justify-center gap-2" onClick={logout}>
            <FiLogOut aria-hidden />
            Logout
          </Button>
        </div>
      }
      overlay={
        <>
          <Button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Open saved carts, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            className="fixed bottom-20 right-4 z-30 size-12 rounded-full p-0 shadow-lg lg:bottom-6"
          >
            <FiShoppingBag aria-hidden size={20} />
            <CartCount count={cartCount} />
          </Button>
          <CartDrawer
            open={cartDrawerOpen}
            onOpenChange={setCartDrawerOpen}
            cart={multiCart}
            onRefresh={refreshCart}
          />
        </>
      }
    >
      {activeTab === 'discover' ? (
        <DiscoverTab
          query={query}
          setQuery={setQuery}
          filters={filters}
          setFilters={setFilters}
          loading={loading}
          error={error}
          cartMessage={cartMessage}
          results={results}
          runSearch={runSearch}
          addResultToCart={addResultToCart}
        />
      ) : null}

      {activeTab === 'chat' ? <ChatTab /> : null}
      {activeTab === 'orders' ? <OrdersTab /> : null}
      {activeTab === 'profile' ? <ProfileTab session={session} /> : null}
    </AppShell>
  );
};

/** Count bubble shared by the header button and the floating action button. */
const CartCount = ({count}: {count: number}) =>
  count > 0 ? (
    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent-foreground text-[0.625rem] font-semibold text-background">
      {count}
    </span>
  ) : null;

const CartButton = ({count, onClick}: {count: number; onClick: () => void}) => (
  <Button
    type="button"
    variant="outline"
    size="icon"
    onClick={onClick}
    className="relative"
    aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
  >
    <FiShoppingBag aria-hidden />
    <CartCount count={count} />
  </Button>
);

type DiscoverTabProps = {
  query: string;
  setQuery: (value: string) => void;
  filters: DiscoveryFilters;
  setFilters: Dispatch<SetStateAction<DiscoveryFilters>>;
  loading: boolean;
  error: string;
  cartMessage: string;
  results: ReturnType<typeof searchCommerce>;
  runSearch: (query?: string) => void;
  addResultToCart: (product: ProductResult) => void;
};

const DiscoverTab = ({
  query,
  setQuery,
  filters,
  setFilters,
  loading,
  error,
  cartMessage,
  results,
  runSearch,
  addResultToCart
}: DiscoverTabProps) => (
  <section className="mx-auto grid w-full max-w-7xl gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
    <div className="min-w-0 space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
      >
        <div className="relative flex-1">
          <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What are you looking for today?"
            aria-label="Search products and merchants"
            className="h-10 pl-9"
          />
        </div>
        <Button type="submit" className="h-10">
          Search
        </Button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {discoverySuggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion);
              runSearch(suggestion);
            }}
            className="shrink-0 rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Browse by need</p>
            <h2 className="font-display text-base font-semibold">Categories</h2>
          </div>
          {filters.category ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilters((current) => ({...current, category: undefined}))}
            >
              Clear
            </Button>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {discoveryCategoryCards.map(({id, label, helper, Icon}) => {
            const isActive = filters.category === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilters((current) => ({...current, category: current.category === id ? undefined : id}))}
                className={cn(
                  'rounded-lg border p-3 text-left transition duration-200 hover:-translate-y-0.5',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  isActive ? 'border-primary bg-primary/5' : 'border-border/50 bg-card hover:border-primary/40'
                )}
              >
                <span className={cn('grid size-9 place-items-center rounded-md', isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary')}>
                  <Icon aria-hidden size={17} />
                </span>
                <span className="mt-3 block text-sm font-medium">{label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{helper}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Card className="gap-3 rounded-lg border-border/50 p-3 shadow-none">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="filter-location" className="text-xs text-muted-foreground">
              Location
            </Label>
            <Select
              value={filters.location ?? ANY_LOCATION}
              onValueChange={(value) =>
                setFilters((current) => ({...current, location: value === ANY_LOCATION ? undefined : value}))
              }
            >
              <SelectTrigger id="filter-location" className="mt-1.5 w-full">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_LOCATION}>All locations</SelectItem>
                {customerFilterLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-price" className="text-xs text-muted-foreground">
              Max price
            </Label>
            <Input
              id="filter-price"
              type="number"
              min="0"
              value={filters.maxPrice ?? ''}
              onChange={(event) =>
                setFilters((current) => ({...current, maxPrice: event.target.value ? Number(event.target.value) : undefined}))
              }
              placeholder="Any"
              className="mt-1.5 h-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FilterToggle
            active={!!filters.verifiedOnly}
            label="Verified only"
            onClick={() => setFilters((current) => ({...current, verifiedOnly: !current.verifiedOnly}))}
          />
          <FilterToggle
            active={!!filters.deliveryOnly}
            label="Delivery"
            onClick={() => setFilters((current) => ({...current, deliveryOnly: !current.deliveryOnly}))}
          />
        </div>
      </Card>

      {loading ? <SkeletonResults /> : null}
      {error ? (
        <EmptyState
          icon={<FiAlertCircle aria-hidden />}
          title="Search failed"
          body={error}
          action="Try again"
          onAction={() => runSearch()}
        />
      ) : null}
      {!loading && !error && results.products.length === 0 && results.merchants.length === 0 ? (
        <EmptyState
          icon={<FiSearch aria-hidden />}
          title="No matches yet"
          body="Try a broader search, remove filters, or search by merchant category."
        />
      ) : null}

      {cartMessage ? (
        <p role="status" className="rounded-md bg-success-muted p-3 text-xs text-success">
          {cartMessage}
        </p>
      ) : null}

      {results.merchants.length > 0 ? (
        <section>
          <h2 className="font-display text-base font-semibold">Merchants</h2>
          <div className="mt-3 grid gap-2 xl:grid-cols-2">
            {results.merchants.map((merchant) => (
              <Card key={merchant.id} className="gap-0 rounded-lg border-border/50 p-3 shadow-none">
                <div className="flex gap-3">
                  <ProductThumb imageStyle={merchant.products[0].imageStyle} className="size-16" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium">{merchant.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {merchant.category} - {merchant.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 bg-success-muted text-success">
                        {calculateTrustScore(merchant)}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FiShield aria-hidden /> {merchant.verifiedLevel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiStar aria-hidden /> {merchant.rating} ({merchant.completedOrders})
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiTruck aria-hidden /> {merchant.deliveryAvailable ? 'Delivery' : 'Pickup only'}
                      </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="mt-3">
                      <Link href={`/merchants/${merchant.id}`}>View store</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {results.products.length > 0 ? (
        <section>
          <h2 className="font-display text-base font-semibold">Products</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.products.map((product) => {
              const inStock = product.available !== false && product.stock > 0;
              return (
                <Card
                  key={`${product.merchant.id}-${product.id}`}
                  className="gap-0 overflow-hidden rounded-lg border-border/50 p-0 shadow-none"
                >
                  <Link
                    href={`/merchants/${product.merchant.id}?product=${product.id}`}
                    aria-label={`View ${product.name}`}
                  >
                    <ProductThumb imageStyle={product.imageStyle} radius="md" className="h-32 w-full rounded-none border-0 border-b border-border/50" />
                  </Link>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-medium">{product.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{product.merchant.name}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Money amount={product.price} emphasis="strong" />
                      <Badge
                        variant="secondary"
                        className={cn('shrink-0', inStock ? 'bg-success-muted text-success' : 'bg-destructive/10 text-destructive')}
                      >
                        {inStock ? `${product.stock} left` : 'Unavailable'}
                      </Badge>
                    </div>
                    <Button type="button" className="mt-3 h-9 w-full" onClick={() => addResultToCart(product)}>
                      Add to cart
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>

    <aside className="space-y-3">
      <Card className="gap-2 rounded-lg border-border/50 p-4 shadow-none">
        <div>
          <p className="text-xs text-muted-foreground">Search intent</p>
          <h2 className="font-display text-base font-semibold">{results.intent.category ?? 'All categories'}</h2>
        </div>
        <dl className="grid gap-1.5 text-xs">
          <IntentRow label="Query" value={results.intent.query || 'Browsing all products'} />
          <IntentRow label="Location" value={results.intent.location ?? filters.location ?? 'Any'} />
          <IntentRow
            label="Max price"
            value={
              results.intent.maxPrice ?? filters.maxPrice
                ? formatKwacha(results.intent.maxPrice ?? filters.maxPrice ?? 0)
                : 'Any'
            }
          />
          <IntentRow label="Delivery" value={results.intent.deliveryRequired || filters.deliveryOnly ? 'Required' : 'Any'} />
          <IntentRow label="Verification" value={results.intent.verifiedOnly || filters.verifiedOnly ? 'Verified only' : 'Any'} />
        </dl>
      </Card>
      <Card className="gap-1 rounded-lg border-0 bg-primary p-4 text-primary-foreground shadow-none">
        <p className="text-sm font-medium">Full-screen customer workspace</p>
        <p className="text-xs leading-5 text-primary-foreground/70">
          Use the tabs to move from discovery to merchant chats, protected order tracking, and customer profile details.
        </p>
      </Card>
    </aside>
  </section>
);

const IntentRow = ({label, value}: {label: string; value: string}) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="truncate text-right font-medium">{value}</dd>
  </div>
);

const FilterToggle = ({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) => (
  <Button
    type="button"
    variant={active ? 'default' : 'outline'}
    size="sm"
    aria-pressed={active}
    onClick={onClick}
    className="h-9"
  >
    {label}
  </Button>
);

const CartDrawer = ({
  open,
  onOpenChange,
  cart,
  onRefresh
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: MultiMerchantCartState;
  onRefresh: () => void;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
      <SheetHeader className="border-b border-border/50">
        <SheetTitle className="font-display text-base">Saved carts</SheetTitle>
        <SheetDescription className="text-xs">
          Each store keeps its own cart, so several merchant orders can be fulfilled in parallel.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {cart.groups.length === 0 ? (
          <EmptyState
            icon={<FiShoppingBag aria-hidden />}
            title="No saved carts"
            body="Add products from any merchant and they will be grouped here by store."
          />
        ) : null}

        {cart.groups.map((group) => {
          const merchant = findSeller(group.merchantId);
          const quantity = getMerchantCartQuantity(group);
          const previewProducts = group.items
            .slice(0, 2)
            .map((line) => findProduct(merchant, line.productId).name)
            .join(', ');

          return (
            <Card key={group.merchantId} className="gap-0 rounded-lg border-border/50 p-3 shadow-none">
              <div className="flex gap-3">
                <ProductThumb imageStyle={merchant.products[0].imageStyle} className="size-12" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">{merchant.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {quantity} item{quantity === 1 ? '' : 's'} - {previewProducts}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Saved {new Date(group.updatedAt).toLocaleTimeString('en-ZM', {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild size="sm">
                  <Link
                    href={`/checkout?merchant=${group.merchantId}`}
                    onClick={() => {
                      setActiveMerchantCart(group.merchantId);
                      onRefresh();
                    }}
                  >
                    Fulfil order
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/merchants/${group.merchantId}`}>Add more</Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {cart.groups.length > 1 ? (
        <SheetFooter className="border-t border-border/50">
          <p className="text-xs leading-5 text-muted-foreground">
            Each merchant still receives a clean fulfilment queue for their own order.
          </p>
        </SheetFooter>
      ) : null}
    </SheetContent>
  </Sheet>
);

const ChatTab = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const selectedConversation = recentConversations.find((conversation) => conversation.merchantId === selectedConversationId) ?? null;
  const merchant = selectedConversation ? findSeller(selectedConversation.merchantId) : null;

  return (
    <section className="mx-auto w-full max-w-7xl p-4 lg:p-6">
      {!selectedConversation || !merchant ? (
        <div className="space-y-2">
          {recentConversations.map((conversation) => {
            const conversationMerchant = findSeller(conversation.merchantId);
            return (
              <button
                key={conversation.merchantId}
                type="button"
                onClick={() => setSelectedConversationId(conversation.merchantId)}
                className="w-full rounded-lg border border-border/50 bg-card p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <div className="flex items-center gap-3">
                  <ProductThumb imageStyle={conversationMerchant.products[0].imageStyle} radius="full" className="size-10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-medium">{conversationMerchant.name}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread ? (
                    <Badge variant="secondary" className="bg-accent-foreground text-background">
                      {conversation.unread}
                    </Badge>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <section className="flex min-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-lg border border-border/50 bg-card">
          <header className="border-b border-border/50 p-4">
            <Button type="button" variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => setSelectedConversationId(null)}>
              <FiArrowLeft aria-hidden />
              Back to chats
            </Button>
            <p className="text-xs text-primary">{merchant.verifiedLevel}</p>
            <h2 className="font-display text-base font-semibold">{merchant.name}</h2>
            <p className="text-xs text-muted-foreground">
              {merchant.responseTime} response - {merchant.location}
            </p>
          </header>
          <div className="flex-1 space-y-2 bg-muted/40 p-4">
            {selectedConversation.messages.map((message) => (
              <p
                key={message.id}
                className={cn(
                  'max-w-[78%] rounded-lg px-3 py-2 text-sm leading-6',
                  message.role === 'customer'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : message.role === 'system'
                      ? 'mx-auto rounded-full bg-warning-muted text-center text-xs text-warning'
                      : 'border border-border/50 bg-card'
                )}
              >
                {message.text}
              </p>
            ))}
          </div>
          <footer className="border-t border-border/50 p-3">
            <div className="flex h-10 items-center rounded-md bg-muted px-3 text-xs text-muted-foreground">
              Mock reply composer
            </div>
          </footer>
        </section>
      )}
    </section>
  );
};

const OrdersTab = () => {
  const orders = readOrders(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <section className="mx-auto w-full max-w-7xl p-4 lg:p-6">
      {!selectedOrderId ? (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Recent orders</p>
            <h2 className="font-display text-base font-semibold">Tap an order for details</h2>
          </div>
          {orders.map((order) => {
            const merchant = findSeller(order.sellerId);
            const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full rounded-lg border border-border/50 bg-card p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <div className="flex items-center gap-3">
                  <ProductThumb imageStyle={product.imageStyle} className="size-12" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{order.id}</span>
                      <StatusBadge kind="order" status={order.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {merchant.name} - {product.name}
                    </p>
                  </div>
                  <FiChevronRight aria-hidden className="shrink-0 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <OrderDetailPanel orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
      )}
    </section>
  );
};

const OrderDetailPanel = ({orderId, onBack}: {orderId: string; onBack: () => void}) => {
  const orders = readOrders(initialOrders);
  const order = orders.find((item) => item.id === orderId) ?? orders[0];

  if (!order) {
    return (
      <EmptyState
        icon={<FiPackage aria-hidden />}
        title="No orders yet"
        body="Orders will appear here once checkout creates them."
      />
    );
  }

  const merchant = findSeller(order.sellerId);
  const lines = order.items.map((line) => ({...line, product: findProduct(merchant, line.productId)}));
  const primaryProduct = lines[0]?.product ?? merchant.products[0];

  return (
    <article className="min-h-[calc(100vh-11rem)] rounded-lg border border-border/50 bg-card p-4">
      <Button type="button" variant="ghost" size="sm" className="mb-3 -ml-2" onClick={onBack}>
        <FiArrowLeft aria-hidden />
        Back to orders
      </Button>

      <div className="flex flex-wrap items-start gap-3">
        <ProductThumb imageStyle={primaryProduct.imageStyle} radius="lg" className="size-20" />
        <div className="min-w-0 flex-1">
          <StatusBadge kind="order" status={order.status} />
          <h2 className="mt-1.5 font-display text-xl font-semibold">{order.id}</h2>
          <p className="text-xs text-muted-foreground">
            {merchant.name} - {order.fulfilmentMethod}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Payment" value={<StatusBadge kind="payment" status={order.paymentStatus ?? 'paid'} />} />
        <Metric label="Protection" value={<StatusBadge kind="protection" status={order.protectionStatus ?? 'funds_protected'} />} />
        <Metric label="Fulfilment" value={order.fulfilmentMethod} />
        <Metric label="Amount" value={order.finalAmount ? formatKwacha(order.finalAmount) : 'Seed order'} />
      </div>

      <section className="mt-4">
        <h3 className="text-sm font-medium">Items</h3>
        <div className="mt-2 space-y-2">
          {lines.map(({product, quantity, variant}) => (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-md border border-border/50 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="truncate text-xs text-muted-foreground">{variant ?? product.category}</p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">x{quantity}</span>
            </div>
          ))}
        </div>
      </section>

      {order.deliveryAddress ? (
        <section className="mt-4 rounded-md border border-border/50 p-3">
          <h3 className="text-sm font-medium">Delivery details</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.deliveryAddress.fullName} - {order.deliveryAddress.phone}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.deliveryAddress.addressLine}, {order.deliveryAddress.area}
          </p>
        </section>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/orders/${order.id}`}>Track order</Link>
        </Button>
        {/* Mock affordance: the support flow is intentionally not implemented yet. */}
        <Button type="button" variant="outline">
          Need help with this order
        </Button>
      </div>
    </article>
  );
};

const ProfileTab = ({session}: {session: CommerceSession}) => {
  const orders = readOrders(initialOrders);
  const completed = orders.filter((order) => order.status === 'completed').length;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 p-4 lg:grid-cols-[320px_1fr] lg:p-6">
      <Card className="gap-0 rounded-lg border-border/50 p-4 shadow-none">
        <div className="grid size-16 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {session.name.slice(0, 1)}
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold">{session.name}</h2>
        <p className="text-xs text-muted-foreground">{session.username}</p>
        <dl className="mt-4 space-y-2">
          <ProfileRow label="Mobile" value={session.mobile} />
          <ProfileRow label="Email" value={customerProfileSeed.email} />
          <ProfileRow label="Address" value={customerProfileSeed.address} />
          <ProfileRow label="Payment" value={customerProfileSeed.preferredPayment} />
          <ProfileRow label="Member since" value={customerProfileSeed.memberSince} />
        </dl>
      </Card>

      <div className="min-w-0 space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <Metric label="Total orders" value={String(orders.length)} />
          <Metric label="Completed" value={String(completed)} />
          <Metric label="Saved merchants" value={String(sellers.length)} />
        </div>
        <section>
          <h2 className="font-display text-base font-semibold">Order history</h2>
          <div className="mt-3 space-y-2">
            {orders.map((order) => {
              const merchant = findSeller(order.sellerId);
              const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition hover:bg-muted"
                >
                  <ProductThumb imageStyle={product.imageStyle} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.id} - {merchant.name}
                    </p>
                    <div className="mt-0.5">
                      <StatusBadge kind="order" status={order.status} />
                    </div>
                  </div>
                  <FiClock aria-hidden className="shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
};

const SkeletonResults = () => (
  <div className="space-y-2" aria-hidden>
    {[0, 1, 2].map((item) => (
      <Skeleton key={item} className="h-20 rounded-lg" />
    ))}
  </div>
);

const ProfileRow = ({label, value}: {label: string; value: string}) => (
  <div className="flex items-baseline justify-between gap-3 rounded-md bg-muted px-3 py-2">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="truncate text-right text-xs font-medium">{value}</dd>
  </div>
);
