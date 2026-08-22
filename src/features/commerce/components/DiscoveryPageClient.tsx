'use client';

import Link from 'next/link';
import type {Dispatch, ReactNode, SetStateAction} from 'react';
import {useMemo, useState} from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiChevronDown,
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

import {customerFilterLocations, customerProfileSeed, discoveryCategoryCards, discoverySuggestions, recentConversations} from '../data/customerExperience';
import {initialOrders, sellers} from '../data/mockCommerce';
import {calculateTrustScore, findProduct, findSeller, formatKwacha, getStatusLabel} from '../lib/commerceLogic';
import {addCartItem, getCartItemCount, getMerchantCartQuantity, readMultiCart, saveMultiCart, setActiveMerchantCart} from '../services/cartService';
import {readOrders} from '../services/orderService';
import {searchCommerce} from '../services/searchService';
import type {DiscoveryFilters, MultiMerchantCartState, ProductResult} from '../types/commerce';
import {AuthFlow, type CommerceSession} from './AuthFlow';

type CustomerTab = 'discover' | 'chat' | 'orders' | 'profile';

const tabs: Array<{id: CustomerTab; label: string; Icon: typeof FiHome}> = [
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
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-neutral-200 bg-white p-5 lg:block">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AICOS</p>
            <h1 className="mt-1 text-3xl font-black">ZamComm</h1>
          </div>
          <nav className="mt-8 grid gap-2" aria-label="Customer sections">
            {tabs.map(({id, label, Icon}) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left font-black transition ${
                  activeTab === id ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl bg-emerald-50 p-4">
            <p className="font-black text-emerald-950">Payment protection simulation</p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">Track protected orders from discovery to delivery without leaving the platform.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 font-black text-neutral-600 transition hover:bg-neutral-100"
          >
            <FiLogOut />
            Logout
          </button>
        </aside>

        <section className="min-w-0 pb-24 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 p-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Customer app</p>
              <h1 className="text-2xl font-black lg:text-4xl">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h1>
              <p className="mt-1 text-sm font-semibold text-neutral-500">{session.name} {session.onboarded ? '- onboarded' : '- logged in'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={logout} className="rounded-full border border-neutral-200 bg-white p-3" aria-label="Logout">
                <FiLogOut />
              </button>
              <button type="button" onClick={() => setCartDrawerOpen(true)} className="relative rounded-full border border-neutral-200 bg-white p-3" aria-label="Open cart">
                <FiShoppingBag />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-black text-neutral-950">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </header>

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
        </section>

        <button
          type="button"
          onClick={() => setCartDrawerOpen(true)}
          className="fixed bottom-24 right-4 z-30 grid h-16 w-16 place-items-center rounded-full bg-neutral-950 text-white shadow-xl transition hover:-translate-y-1 lg:bottom-6"
          aria-label="Open saved carts"
        >
          <FiShoppingBag size={24} />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-sm font-black text-neutral-950">
              {cartCount}
            </span>
          ) : null}
        </button>

        {cartDrawerOpen ? <CartDrawer cart={multiCart} onClose={() => setCartDrawerOpen(false)} onRefresh={refreshCart} /> : null}

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-neutral-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden" aria-label="Customer tabs">
          {tabs.map(({id, label, Icon}) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`grid justify-items-center gap-1 rounded-2xl px-2 py-2 text-xs font-black ${
                activeTab === id ? 'text-neutral-950' : 'text-neutral-400'
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
};

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
  <section className="mx-auto grid w-full max-w-7xl gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
      >
        <label className="flex min-h-14 flex-1 items-center gap-2 rounded-2xl bg-white px-4 shadow-sm">
          <FiSearch className="text-neutral-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What are you looking for today?"
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
          />
        </label>
        <button type="submit" className="rounded-2xl bg-neutral-950 px-5 text-sm font-black text-white">
          Search
        </button>
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
                className="shrink-0 rounded-full border border-neutral-200 px-3 py-2 text-sm font-bold"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Browse by need</p>
                <h2 className="mt-1 text-xl font-black">Categories</h2>
              </div>
              {filters.category ? (
                <button type="button" onClick={() => setFilters((current) => ({...current, category: undefined}))} className="text-sm font-black text-emerald-700">
                  Clear
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {discoveryCategoryCards.map(({id, label, helper, Icon, accent}) => {
                const isActive = filters.category === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilters((current) => ({...current, category: current.category === id ? undefined : id}))}
                    className={`group relative min-h-32 overflow-hidden rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      isActive ? 'border-neutral-950 bg-neutral-950 text-white shadow-lg' : 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300'
                    }`}
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500 opacity-0 transition group-hover:opacity-100" />
                    <div className={`grid h-11 w-11 place-items-center rounded-2xl transition group-hover:scale-110 ${isActive ? 'bg-white/10 text-white' : accent}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 font-black">{label}</h3>
                    <p className={`mt-1 text-sm leading-5 ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>{helper}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 rounded-3xl bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.location ?? ''}
                onChange={(event) => setFilters((current) => ({...current, location: event.target.value || undefined}))}
                className="rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-sm font-semibold"
                aria-label="Location"
              >
                <option value="">All locations</option>
                {customerFilterLocations.map((location) => <option key={location}>{location}</option>)}
              </select>
              <input
                type="number"
                min="0"
                value={filters.maxPrice ?? ''}
                onChange={(event) => setFilters((current) => ({...current, maxPrice: event.target.value ? Number(event.target.value) : undefined}))}
                placeholder="Max price"
                className="rounded-2xl border border-neutral-200 px-3 py-3 text-sm font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Toggle active={!!filters.verifiedOnly} label="Verified only" onClick={() => setFilters((current) => ({...current, verifiedOnly: !current.verifiedOnly}))} />
              <Toggle active={!!filters.deliveryOnly} label="Delivery" onClick={() => setFilters((current) => ({...current, deliveryOnly: !current.deliveryOnly}))} />
            </div>
          </div>

          {loading ? <SkeletonResults /> : null}
          {error ? <StateCard icon={<FiAlertCircle />} title="Search failed" body={error} action="Try again" onClick={() => runSearch()} /> : null}
          {!loading && !error && results.products.length === 0 && results.merchants.length === 0 ? (
            <StateCard icon={<FiSearch />} title="No matches yet" body="Try a broader search, remove filters, or search by merchant category." />
          ) : null}

          {cartMessage ? <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{cartMessage}</div> : null}
          <section>
            <h2 className="text-lg font-black">Merchants</h2>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              {results.merchants.map((merchant) => (
                <article key={merchant.id} className="rounded-3xl border border-neutral-200 bg-white p-4">
                  <div className="flex gap-3">
                    <div className={`h-20 w-20 shrink-0 rounded-3xl bg-gradient-to-br ${merchant.products[0].imageStyle}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-black">{merchant.name}</h3>
                          <p className="text-sm text-neutral-500">{merchant.category} - {merchant.location}</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{calculateTrustScore(merchant)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-neutral-600">
                        <span className="inline-flex items-center gap-1"><FiShield /> {merchant.verifiedLevel}</span>
                        <span className="inline-flex items-center gap-1"><FiStar /> {merchant.rating} ({merchant.completedOrders} orders)</span>
                        <span className="inline-flex items-center gap-1"><FiTruck /> {merchant.deliveryAvailable ? 'Delivery' : 'Pickup only'}</span>
                      </div>
                      <Link href={`/merchants/${merchant.id}`} className="mt-3 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-sm font-black text-white">
                        View store
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black">Products</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {results.products.map((product) => (
                <article key={`${product.merchant.id}-${product.id}`} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                  <Link href={`/merchants/${product.merchant.id}?product=${product.id}`} className={`block h-44 bg-gradient-to-br ${product.imageStyle}`} />
                  <div className="p-4">
                    <h3 className="font-black">{product.name}</h3>
                    <p className="text-sm text-neutral-500">{product.merchant.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black">{formatKwacha(product.price)}</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.available !== false && product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {product.available !== false && product.stock > 0 ? `${product.stock} available` : 'Unavailable'}
                      </span>
                    </div>
                    <button type="button" onClick={() => addResultToCart(product)} className="mt-3 w-full rounded-2xl bg-amber-500 px-4 py-3 font-black text-neutral-950">
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
    </div>
    <aside className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-neutral-500">Search intent</p>
        <h2 className="mt-1 text-2xl font-black">{results.intent.category ?? 'All categories'}</h2>
        <div className="mt-3 grid gap-2 text-sm text-neutral-600">
          <span>Query: {results.intent.query || 'Browsing all products'}</span>
          <span>Location: {results.intent.location ?? filters.location ?? 'Any'}</span>
          <span>Max price: {results.intent.maxPrice ?? filters.maxPrice ? `K${results.intent.maxPrice ?? filters.maxPrice}` : 'Any'}</span>
          <span>Delivery: {results.intent.deliveryRequired || filters.deliveryOnly ? 'Required' : 'Any'}</span>
          <span>Verification: {results.intent.verifiedOnly || filters.verifiedOnly ? 'Verified only' : 'Any'}</span>
        </div>
      </section>
      <section className="rounded-3xl bg-neutral-950 p-5 text-white shadow-sm">
        <p className="font-black">Full-screen customer workspace</p>
        <p className="mt-2 text-sm leading-6 text-neutral-300">Use the tabs to move from discovery to merchant chats, protected order tracking, and customer profile details.</p>
      </section>
    </aside>
  </section>
);

const CartDrawer = ({cart, onClose, onRefresh}: {cart: MultiMerchantCartState; onClose: () => void; onRefresh: () => void}) => (
  <div className="fixed inset-0 z-40 bg-black/40 p-3">
    <aside className="ml-auto flex h-full w-full max-w-[440px] flex-col rounded-3xl bg-white shadow-2xl">
      <header className="border-b border-neutral-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Saved carts</p>
            <h2 className="text-2xl font-black">Fulfil from multiple stores</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-neutral-100 px-3 py-2 text-sm font-black">
            Close
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {cart.groups.length === 0 ? (
          <StateCard icon={<FiShoppingBag />} title="No saved carts" body="Add products from any merchant and they will be grouped here by store." />
        ) : null}

        {cart.groups.map((group) => {
          const merchant = findSeller(group.merchantId);
          const quantity = getMerchantCartQuantity(group);
          const previewProducts = group.items.slice(0, 2).map((line) => findProduct(merchant, line.productId).name).join(', ');

          return (
            <article key={group.merchantId} className="rounded-3xl border border-neutral-200 p-4">
              <div className="flex gap-3">
                <div className={`h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br ${merchant.products[0].imageStyle}`} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-black">{merchant.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{quantity} item{quantity === 1 ? '' : 's'} - {previewProducts}</p>
                  <p className="mt-1 text-xs font-bold text-neutral-400">Saved {new Date(group.updatedAt).toLocaleTimeString('en-ZM', {hour: '2-digit', minute: '2-digit'})}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/checkout?merchant=${group.merchantId}`}
                  onClick={() => {
                    setActiveMerchantCart(group.merchantId);
                    onRefresh();
                  }}
                  className="rounded-2xl bg-neutral-950 px-4 py-3 text-center font-black text-white"
                >
                  Fulfil order
                </Link>
                <Link href={`/merchants/${group.merchantId}`} className="rounded-2xl border border-neutral-200 px-4 py-3 text-center font-black">
                  Add more
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {cart.groups.length > 1 ? (
        <footer className="border-t border-neutral-200 p-4">
          <p className="text-sm leading-6 text-neutral-500">
            Each store keeps its own cart so the customer can fulfil several merchant orders in parallel while each merchant still receives a clean fulfilment queue.
          </p>
        </footer>
      ) : null}
    </aside>
  </div>
);

const ChatTab = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const selectedConversation = recentConversations.find((conversation) => conversation.merchantId === selectedConversationId) ?? null;
  const merchant = selectedConversation ? findSeller(selectedConversation.merchantId) : null;

  return (
    <section className="mx-auto w-full max-w-7xl p-4 lg:p-8">
      {!selectedConversation || !merchant ? (
      <div className="space-y-3">
        {recentConversations.map((conversation) => {
          const conversationMerchant = findSeller(conversation.merchantId);
          return (
            <button
              key={conversation.merchantId}
              type="button"
              onClick={() => setSelectedConversationId(conversation.merchantId)}
              className="w-full rounded-3xl bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex gap-3">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${conversationMerchant.products[0].imageStyle}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="truncate font-black">{conversationMerchant.name}</p>
                    <span className="text-xs opacity-70">{conversation.time}</span>
                  </div>
                  <p className="mt-1 truncate text-sm opacity-70">{conversation.lastMessage}</p>
                </div>
                {conversation.unread ? <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-black text-neutral-950">{conversation.unread}</span> : null}
              </div>
            </button>
          );
        })}
      </div>
      ) : (
      <section className="flex min-h-[calc(100vh-160px)] flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
        <header className="border-b border-neutral-200 p-5">
          <button type="button" onClick={() => setSelectedConversationId(null)} className="mb-4 inline-flex items-center gap-2 text-sm font-black text-neutral-500">
            <FiArrowLeft />
            Back to chats
          </button>
          <p className="text-sm font-black text-emerald-700">{merchant.verifiedLevel}</p>
          <h2 className="text-2xl font-black">{merchant.name}</h2>
          <p className="text-sm text-neutral-500">{merchant.responseTime} response - {merchant.location}</p>
        </header>
        <div className="flex-1 space-y-3 bg-neutral-50 p-5">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                message.role === 'customer'
                  ? 'ml-auto bg-neutral-950 text-white'
                  : message.role === 'system'
                    ? 'mx-auto rounded-full bg-amber-100 text-xs font-black text-amber-900'
                    : 'bg-white text-neutral-800 shadow-sm'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <footer className="border-t border-neutral-200 p-4">
          <div className="flex min-h-12 items-center rounded-2xl bg-neutral-100 px-4 text-sm font-semibold text-neutral-500">
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
    <section className="mx-auto w-full max-w-7xl p-4 lg:p-8">
      {!selectedOrderId ? (
      <div className="space-y-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Recent orders</p>
          <h2 className="mt-1 text-2xl font-black">Tap an order for details</h2>
        </div>
      {orders.map((order) => {
        const merchant = findSeller(order.sellerId);
        const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
        return (
          <button
            key={order.id}
            type="button"
            onClick={() => setSelectedOrderId(order.id)}
            className="w-full rounded-3xl bg-white p-4 text-left text-neutral-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 shrink-0 rounded-3xl bg-gradient-to-br ${product.imageStyle}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-emerald-700">{getStatusLabel(order.status)}</p>
                <h3 className="text-xl font-black">{order.id}</h3>
                <p className="truncate text-sm text-neutral-500">{merchant.name} - {product.name}</p>
              </div>
              <FiChevronDown />
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
    return <StateCard icon={<FiPackage />} title="No orders yet" body="Orders will appear here once checkout creates them." />;
  }

  const merchant = findSeller(order.sellerId);
  const lines = order.items.map((line) => {
    const product = findProduct(merchant, line.productId);
    return {...line, product};
  });
  const primaryProduct = lines[0]?.product ?? merchant.products[0];

  return (
    <article className="min-h-[calc(100vh-160px)] rounded-3xl bg-white p-5 shadow-sm">
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-black text-neutral-500">
        <FiArrowLeft />
        Back to orders
      </button>
      <div className="flex flex-wrap items-start gap-4">
        <div className={`h-24 w-24 shrink-0 rounded-3xl bg-gradient-to-br ${primaryProduct.imageStyle}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-emerald-700">{getStatusLabel(order.status)}</p>
          <h2 className="mt-1 text-3xl font-black">{order.id}</h2>
          <p className="mt-1 text-sm text-neutral-500">{merchant.name} - {order.fulfilmentMethod}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Payment" value={order.paymentStatus ?? 'paid'} />
        <Metric label="Protection" value={order.protectionStatus?.replaceAll('_', ' ') ?? 'funds protected'} />
        <Metric label="Fulfilment" value={order.fulfilmentMethod} />
        <Metric label="Amount" value={order.finalAmount ? formatKwacha(order.finalAmount) : 'Seed order'} />
      </div>

      <section className="mt-5 rounded-3xl bg-neutral-100 p-4">
        <h3 className="font-black">Items</h3>
        <div className="mt-3 space-y-2">
          {lines.map(({product, quantity, variant}) => (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
              <div>
                <p className="font-black">{product.name}</p>
                <p className="text-sm text-neutral-500">{variant ?? product.category}</p>
              </div>
              <p className="font-black">x{quantity}</p>
            </div>
          ))}
        </div>
      </section>

      {order.deliveryAddress ? (
        <section className="mt-4 rounded-3xl bg-neutral-100 p-4">
          <h3 className="font-black">Delivery details</h3>
          <p className="mt-2 text-sm font-semibold text-neutral-600">
            {order.deliveryAddress.fullName} - {order.deliveryAddress.phone}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {order.deliveryAddress.addressLine}, {order.deliveryAddress.area}
          </p>
        </section>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/orders/${order.id}`} className="rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">
          Track order
        </Link>
        <button type="button" className="rounded-2xl border border-neutral-200 px-4 py-3 font-black text-neutral-700">
          Need help with this order
        </button>
      </div>
    </article>
  );
};

const ProfileTab = ({session}: {session: CommerceSession}) => {
  const orders = readOrders(initialOrders);
  const completed = orders.filter((order) => order.status === 'completed').length;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 p-4 lg:grid-cols-[360px_1fr] lg:p-8">
      <aside className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-neutral-950 text-3xl font-black text-white">
          {session.name.slice(0, 1)}
        </div>
        <h2 className="mt-4 text-3xl font-black">{session.name}</h2>
        <p className="text-neutral-500">{session.username}</p>
        <div className="mt-5 space-y-3 text-sm">
          <ProfileRow label="Mobile" value={session.mobile} />
          <ProfileRow label="Email" value={customerProfileSeed.email} />
          <ProfileRow label="Address" value={customerProfileSeed.address} />
          <ProfileRow label="Payment" value={customerProfileSeed.preferredPayment} />
          <ProfileRow label="Member since" value={customerProfileSeed.memberSince} />
        </div>
      </aside>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Total orders" value={String(orders.length)} />
          <Metric label="Completed" value={String(completed)} />
          <Metric label="Saved merchants" value="5" />
        </div>
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">Order history</h2>
          <div className="mt-4 space-y-3">
            {orders.map((order) => {
              const merchant = findSeller(order.sellerId);
              const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-3">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${product.imageStyle}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{order.id} - {merchant.name}</p>
                    <p className="text-sm text-neutral-500">{getStatusLabel(order.status)}</p>
                  </div>
                  <FiClock className="text-neutral-400" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
};

const Toggle = ({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) => (
  <button type="button" onClick={onClick} className={`rounded-2xl px-3 py-3 text-sm font-black ${active ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-700'}`}>
    {label}
  </button>
);

const SkeletonResults = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-3xl bg-neutral-100" />)}
  </div>
);

const StateCard = ({icon, title, body, action, onClick}: {icon: ReactNode; title: string; body: string; action?: string; onClick?: () => void}) => (
  <div className="rounded-3xl border border-neutral-200 bg-white p-5 text-center">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-500">{icon}</div>
    <h2 className="mt-3 font-black">{title}</h2>
    <p className="mt-1 text-sm text-neutral-500">{body}</p>
    {action ? <button type="button" onClick={onClick} className="mt-3 rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-black text-white">{action}</button> : null}
  </div>
);

const Metric = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-3xl bg-white p-4 shadow-sm">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-2 truncate text-xl font-black capitalize">{value}</p>
  </div>
);

const ProfileRow = ({label, value}: {label: string; value: string}) => (
  <div className="rounded-2xl bg-neutral-100 p-3">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-1 font-bold text-neutral-900">{value}</p>
  </div>
);
