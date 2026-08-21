'use client';

import Link from 'next/link';
import type {Dispatch, ReactNode, SetStateAction} from 'react';
import {useMemo, useState} from 'react';
import {
  FiAlertCircle,
  FiClock,
  FiHome,
  FiMessageCircle,
  FiPackage,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiUser
} from 'react-icons/fi';

import {initialOrders, sellers} from '../data/mockCommerce';
import {calculateTrustScore, findProduct, findSeller, formatKwacha, getStatusLabel} from '../lib/commerceLogic';
import {addCartItem, readCart, saveCart} from '../services/cartService';
import {readOrders} from '../services/orderService';
import {searchCommerce} from '../services/searchService';
import type {ChatMessage, DiscoveryFilters, ProductResult} from '../types/commerce';

type CustomerTab = 'discover' | 'chat' | 'orders' | 'profile';

const suggestions = [
  'Birthday cake under K500',
  'Chicken and chips near me',
  'Tailor available this week',
  'Beauty products delivered today'
];

const categories = ['Bakery', 'Lunch', 'Groceries', 'Fashion', 'Beauty', 'Services', 'Gifts'];
const locations = ['Lusaka', 'Kabulonga', 'Woodlands', 'Ibex Hill', 'Roma', 'Chilenje', 'Kitwe'];
const tabs: Array<{id: CustomerTab; label: string; Icon: typeof FiHome}> = [
  {id: 'discover', label: 'Discover', Icon: FiHome},
  {id: 'chat', label: 'Chat', Icon: FiMessageCircle},
  {id: 'orders', label: 'Orders', Icon: FiPackage},
  {id: 'profile', label: 'Profile', Icon: FiUser}
];

const customerProfile = {
  name: 'Naledi Mwansa',
  username: '@naledi.m',
  mobile: '+260 977 000 001',
  email: 'naledi@example.com',
  address: 'Plot 12, Great East Road, Kabulonga',
  preferredPayment: 'MTN Money',
  memberSince: 'May 2026'
};

const recentConversations: Array<{
  merchantId: string;
  unread?: number;
  lastMessage: string;
  time: string;
  messages: ChatMessage[];
}> = [
  {
    merchantId: 'mama-kunda',
    unread: 2,
    lastMessage: 'Your chicken and chips can be ready by 12:30.',
    time: '10:42',
    messages: [
      {id: 'mk-1', role: 'customer', text: 'Do you still have chicken and chips?'},
      {id: 'mk-2', role: 'bot', text: 'Yes, 18 portions are available today. Delivery slots start at 12:30.'},
      {id: 'mk-3', role: 'system', text: 'Payment protection simulation available at checkout.'}
    ]
  },
  {
    merchantId: 'baked-tasha',
    lastMessage: 'A chocolate birthday cake under K500 is available.',
    time: 'Yesterday',
    messages: [
      {id: 'bt-1', role: 'customer', text: 'Can I get a cake for tomorrow?'},
      {id: 'bt-2', role: 'bot', text: 'Yes. The chocolate birthday cake is K450 and needs about 3 hours preparation.'}
    ]
  },
  {
    merchantId: 'lusaka-tailor',
    unread: 1,
    lastMessage: 'Zip repair can be completed today if dropped before 14:00.',
    time: 'Mon',
    messages: [
      {id: 'lt-1', role: 'customer', text: 'I need a tailor before Friday.'},
      {id: 'lt-2', role: 'bot', text: 'Lusaka Tailor Studio has quick repairs today and alterations this week.'}
    ]
  }
];

export const DiscoveryPageClient = () => {
  const [activeTab, setActiveTab] = useState<CustomerTab>('discover');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [pendingProduct, setPendingProduct] = useState<ProductResult | null>(null);

  const results = useMemo(() => searchCommerce(query, filters), [filters, query]);

  const runSearch = (nextQuery = query) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (nextQuery.toLowerCase().includes('connection')) setError('Connection lost while searching. Try again.');
      setLoading(false);
    }, 450);
  };

  const addResultToCart = (product: ProductResult, force = false) => {
    if (product.available === false || product.stock < 1) {
      setCartMessage('This product is unavailable. Choose another item from this merchant.');
      return;
    }
    const cart = readCart();
    if (!force && cart.merchantId && cart.merchantId !== product.merchant.id && cart.items.length > 0) {
      setPendingProduct(product);
      return;
    }
    const nextCart = addCartItem(force ? {items: []} : cart, product.merchant, product);
    saveCart(nextCart);
    setCartMessage(`${product.name} added to cart.`);
    setPendingProduct(null);
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
        </aside>

        <section className="min-w-0 pb-24 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 p-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Customer app</p>
              <h1 className="text-2xl font-black lg:text-4xl">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h1>
            </div>
            <Link href="/checkout" className="rounded-full border border-neutral-200 bg-white p-3" aria-label="Open checkout">
              <FiShoppingBag />
            </Link>
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
              pendingProduct={pendingProduct}
              setPendingProduct={setPendingProduct}
              results={results}
              runSearch={runSearch}
              addResultToCart={addResultToCart}
            />
          ) : null}

          {activeTab === 'chat' ? <ChatTab /> : null}
          {activeTab === 'orders' ? <OrdersTab /> : null}
          {activeTab === 'profile' ? <ProfileTab /> : null}
        </section>

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
  pendingProduct: ProductResult | null;
  setPendingProduct: (product: ProductResult | null) => void;
  results: ReturnType<typeof searchCommerce>;
  runSearch: (query?: string) => void;
  addResultToCart: (product: ProductResult, force?: boolean) => void;
};

const DiscoverTab = ({
  query,
  setQuery,
  filters,
  setFilters,
  loading,
  error,
  cartMessage,
  pendingProduct,
  setPendingProduct,
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
            {suggestions.map((suggestion) => (
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

          <div className="grid gap-3 rounded-3xl bg-white p-3 shadow-sm">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFilters((current) => ({...current, category: current.category === category ? undefined : category}))}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold ${filters.category === category ? 'bg-emerald-700 text-white' : 'bg-white text-neutral-700'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.location ?? ''}
                onChange={(event) => setFilters((current) => ({...current, location: event.target.value || undefined}))}
                className="rounded-2xl border border-neutral-200 bg-white px-3 py-3 text-sm font-semibold"
                aria-label="Location"
              >
                <option value="">All locations</option>
                {locations.map((location) => <option key={location}>{location}</option>)}
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
          {pendingProduct ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-black text-amber-950">Your cart currently contains products from another merchant. Starting a new order will clear the current cart.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPendingProduct(null)} className="rounded-2xl bg-white px-4 py-3 font-black">Keep cart</button>
                <button type="button" onClick={() => addResultToCart(pendingProduct, true)} className="rounded-2xl bg-amber-500 px-4 py-3 font-black">Start new order</button>
              </div>
            </div>
          ) : null}

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

const ChatTab = () => {
  const [selectedConversation, setSelectedConversation] = useState(recentConversations[0]);
  const merchant = findSeller(selectedConversation.merchantId);

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 p-4 lg:grid-cols-[380px_1fr] lg:p-8">
      <div className="space-y-3">
        {recentConversations.map((conversation) => {
          const conversationMerchant = findSeller(conversation.merchantId);
          return (
            <button
              key={conversation.merchantId}
              type="button"
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full rounded-3xl p-4 text-left shadow-sm transition ${
                selectedConversation.merchantId === conversation.merchantId ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-950'
              }`}
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
      <section className="flex min-h-[560px] flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
        <header className="border-b border-neutral-200 p-5">
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
    </section>
  );
};

const OrdersTab = () => {
  const orders = readOrders(initialOrders);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 p-4 lg:p-8">
      {orders.map((order) => {
        const merchant = findSeller(order.sellerId);
        const product = findProduct(merchant, order.items[0]?.productId ?? merchant.products[0].id);
        return (
          <article key={order.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${product.imageStyle}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-emerald-700">{getStatusLabel(order.status)}</p>
                <h2 className="text-2xl font-black">{order.id}</h2>
                <p className="text-sm text-neutral-500">{merchant.name} - {product.name}</p>
              </div>
              <Link href={`/orders/${order.id}`} className="rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">
                Track order
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Metric label="Payment" value={order.paymentStatus ?? 'paid'} />
              <Metric label="Protection" value={order.protectionStatus?.replaceAll('_', ' ') ?? 'funds protected'} />
              <Metric label="Fulfilment" value={order.fulfilmentMethod} />
              <Metric label="Amount" value={order.finalAmount ? formatKwacha(order.finalAmount) : 'Seed order'} />
            </div>
          </article>
        );
      })}
    </section>
  );
};

const ProfileTab = () => {
  const orders = readOrders(initialOrders);
  const completed = orders.filter((order) => order.status === 'completed').length;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 p-4 lg:grid-cols-[360px_1fr] lg:p-8">
      <aside className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-neutral-950 text-3xl font-black text-white">
          {customerProfile.name.slice(0, 1)}
        </div>
        <h2 className="mt-4 text-3xl font-black">{customerProfile.name}</h2>
        <p className="text-neutral-500">{customerProfile.username}</p>
        <div className="mt-5 space-y-3 text-sm">
          <ProfileRow label="Mobile" value={customerProfile.mobile} />
          <ProfileRow label="Email" value={customerProfile.email} />
          <ProfileRow label="Address" value={customerProfile.address} />
          <ProfileRow label="Payment" value={customerProfile.preferredPayment} />
          <ProfileRow label="Member since" value={customerProfile.memberSince} />
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
