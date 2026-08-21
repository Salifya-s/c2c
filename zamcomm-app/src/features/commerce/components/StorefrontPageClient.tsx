'use client';

import Link from 'next/link';
import type {ReactNode} from 'react';
import {useMemo, useState} from 'react';
import {FiClock, FiMapPin, FiMessageCircle, FiSearch, FiShield, FiShoppingBag, FiStar, FiTruck} from 'react-icons/fi';

import {calculateTrustScore, formatKwacha} from '../lib/commerceLogic';
import {addCartItem, readCart, saveCart} from '../services/cartService';
import type {Product, Seller} from '../types/commerce';

type StorefrontPageClientProps = {
  merchant: Seller;
  initialProductId?: string;
};

export const StorefrontPageClient = ({merchant, initialProductId}: StorefrontPageClientProps) => {
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    merchant.products.find((product) => product.id === initialProductId) ?? null
  );
  const [message, setMessage] = useState('');
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(
    () =>
      merchant.products.filter((product) =>
        `${product.name} ${product.category} ${product.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
      ),
    [merchant.products, query]
  );

  const addProduct = (product: Product, force = false) => {
    if (product.available === false || product.stock < 1) {
      setMessage('This product is currently unavailable.');
      return;
    }
    const cart = readCart();
    if (!force && cart.merchantId && cart.merchantId !== merchant.id && cart.items.length > 0) {
      setPendingProduct(product);
      return;
    }
    saveCart(addCartItem(force ? {items: []} : cart, merchant, product));
    setMessage(`${product.name} added to cart.`);
    setPendingProduct(null);
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="min-h-screen bg-white pb-24">
        <section className={`h-56 bg-gradient-to-br ${merchant.products[0].imageStyle}`}>
          <div className="flex h-full flex-col justify-between bg-gradient-to-t from-black/70 to-black/10 p-4 text-white">
            <Link href="/discover" className="w-fit rounded-full bg-white/15 px-3 py-2 text-sm font-black backdrop-blur">Back to discovery</Link>
            <div>
              <p className="text-sm font-bold opacity-90">{merchant.category}</p>
              <h1 className="text-3xl font-black">{merchant.name}</h1>
              <p className="text-sm opacity-90">{merchant.handle} - {merchant.location}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-4 p-4 lg:p-8">
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<FiShield />} label={merchant.verifiedLevel} value={`${calculateTrustScore(merchant)}/100 trust`} />
            <InfoTile icon={<FiStar />} label={`${merchant.rating} rating`} value={`${merchant.completedOrders} completed`} />
            <InfoTile icon={<FiClock />} label={merchant.openingHours ?? 'Open today'} value={merchant.open ? 'Accepting orders' : 'Paused'} />
            <InfoTile icon={<FiTruck />} label={merchant.deliveryAvailable ? 'Delivery available' : 'Pickup only'} value={merchant.deliveryZones.slice(0, 2).join(', ')} />
          </div>

          <div className="rounded-3xl bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <FiShield className="mt-1 text-emerald-700" />
              <div>
                <p className="font-black text-emerald-950">Payment protection simulation</p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">Funds are marked as protected after simulated payment and released only after delivery or pickup confirmation.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3">
            <FiSearch className="text-neutral-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this store" className="w-full bg-transparent text-sm font-semibold outline-none" />
          </div>

          {message ? <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</div> : null}
          {pendingProduct ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-black text-amber-950">Your cart currently contains products from another merchant. Starting a new order will clear the current cart.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPendingProduct(null)} className="rounded-2xl bg-white px-4 py-3 font-black">Keep cart</button>
                <button type="button" onClick={() => addProduct(pendingProduct, true)} className="rounded-2xl bg-amber-500 px-4 py-3 font-black">Start new order</button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-3xl border border-neutral-200">
                <button type="button" onClick={() => setSelectedProduct(product)} className={`block h-44 w-full bg-gradient-to-br ${product.imageStyle}`} aria-label={`View ${product.name}`} />
                <div className="p-4">
                  <h2 className="font-black">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-black">{formatKwacha(product.price)}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.available !== false && product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {product.available !== false && product.stock > 0 ? `${product.stock} left` : 'Unavailable'}
                    </span>
                  </div>
                  <button type="button" onClick={() => addProduct(product)} className="mt-3 w-full rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>

          <section className="rounded-3xl border border-neutral-200 p-4">
            <h2 className="font-black">Store policy</h2>
            <ul className="mt-2 space-y-2 text-sm text-neutral-600">
              {merchant.policies.map((policy) => <li key={policy}>{policy}</li>)}
            </ul>
            <div className="mt-4 flex gap-2">
              <Link href="/checkout" className="flex-1 rounded-2xl bg-amber-500 px-4 py-3 text-center font-black text-neutral-950"><FiShoppingBag className="mr-2 inline" /> Cart</Link>
              <Link href="/discover" className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-center font-black"><FiMessageCircle className="mr-2 inline" /> Assistant</Link>
            </div>
          </section>
        </section>

        {selectedProduct ? (
          <div className="fixed inset-0 z-40 grid place-items-end bg-black/40 p-3 sm:place-items-center">
            <section className="w-full max-w-[520px] rounded-3xl bg-white p-4 shadow-2xl">
              <div className={`h-52 rounded-2xl bg-gradient-to-br ${selectedProduct.imageStyle}`} />
              <h2 className="mt-4 text-2xl font-black">{selectedProduct.name}</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{selectedProduct.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <InfoTile icon={<FiShoppingBag />} label="Price" value={formatKwacha(selectedProduct.price)} />
                <InfoTile icon={<FiClock />} label="Prep time" value={`${selectedProduct.prepMinutes ?? 30} min`} />
                <InfoTile icon={<FiTruck />} label="Delivery" value={selectedProduct.deliveryEligible ? 'Eligible' : 'Pickup only'} />
                <InfoTile icon={<FiMapPin />} label="Merchant" value={merchant.location} />
              </div>
              {selectedProduct.variants?.length ? (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {selectedProduct.variants.map((variant) => <span key={variant} className="shrink-0 rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold">{variant}</span>)}
                </div>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSelectedProduct(null)} className="rounded-2xl border border-neutral-200 px-4 py-3 font-black">Close</button>
                <button type="button" onClick={() => addProduct(selectedProduct)} className="rounded-2xl bg-amber-500 px-4 py-3 font-black">Add to cart</button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};

const InfoTile = ({icon, label, value}: {icon: ReactNode; label: string; value: string}) => (
  <div className="rounded-3xl bg-neutral-100 p-3">
    <div className="text-neutral-500">{icon}</div>
    <p className="mt-2 text-xs font-bold text-neutral-500">{label}</p>
    <p className="text-sm font-black">{value}</p>
  </div>
);
