'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import {FiArrowLeft, FiMessageCircle, FiSearch, FiShield, FiShoppingBag} from 'react-icons/fi';

import {Badge} from '@/src/components/ui/badge';
import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog';
import {Input} from '@/src/components/ui/input';
import {cn} from '@/src/lib/cn';

import {calculateTrustScore, formatKwacha} from '../lib/commerceLogic';
import {addCartItem, readMultiCart, saveMultiCart, setActiveMerchantCart} from '../services/cartService';
import type {Product, Seller} from '../types/commerce';
import {Metric, Money, ProductThumb} from './shared';

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

  const filteredProducts = useMemo(
    () =>
      merchant.products.filter((product) =>
        `${product.name} ${product.category} ${product.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
      ),
    [merchant.products, query]
  );

  const addProduct = (product: Product) => {
    if (product.available === false || product.stock < 1) {
      setMessage('This product is currently unavailable.');
      return;
    }
    saveMultiCart(addCartItem(readMultiCart(), merchant, product));
    setMessage(`${product.name} added to ${merchant.name} cart.`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen bg-card pb-16">
        <section className="relative h-44">
          <ProductThumb
            imageStyle={merchant.products[0].imageStyle}
            className="absolute inset-0 size-full rounded-none border-0"
          />
          {/* Scrim keeps the overlaid text legible whatever gradient the merchant has. */}
          <div className="relative flex h-full flex-col justify-between bg-gradient-to-t from-foreground/80 to-foreground/20 p-4 text-primary-foreground">
            <Button asChild size="sm" variant="secondary" className="w-fit">
              <Link href="/discover">
                <FiArrowLeft aria-hidden />
                Back to discovery
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="text-xs opacity-80">{merchant.category}</p>
              <h1 className="truncate font-display text-2xl font-semibold">{merchant.name}</h1>
              <p className="truncate text-xs opacity-80">
                {merchant.handle} - {merchant.location}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={merchant.verifiedLevel} value={`${calculateTrustScore(merchant)}/100 trust`} />
            <Metric label={`${merchant.rating} rating`} value={`${merchant.completedOrders ?? 0} completed`} />
            <Metric label={merchant.openingHours ?? 'Open today'} value={merchant.open ? 'Accepting orders' : 'Paused'} />
            <Metric
              label={merchant.deliveryAvailable ? 'Delivery available' : 'Pickup only'}
              value={merchant.deliveryZones.slice(0, 2).join(', ')}
            />
          </div>

          <Card className="gap-0 rounded-lg border-border/50 bg-primary/5 p-4 shadow-none">
            <div className="flex items-start gap-3">
              <FiShield aria-hidden className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Payment protection simulation</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Funds are marked as protected after simulated payment and released only after delivery or pickup
                  confirmation.
                </p>
              </div>
            </div>
          </Card>

          <div className="relative">
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this store"
              aria-label={`Search ${merchant.name}`}
              className="h-10 pl-9"
            />
          </div>

          {message ? (
            <p role="status" className="rounded-md bg-success-muted p-3 text-xs text-success">
              {message}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const inStock = product.available !== false && product.stock > 0;
              return (
                <Card key={product.id} className="gap-0 overflow-hidden rounded-lg border-border/50 p-0 shadow-none">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    aria-label={`View ${product.name}`}
                    className="block w-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <ProductThumb
                      imageStyle={product.imageStyle}
                      className="h-32 w-full rounded-none border-0 border-b border-border/50"
                    />
                  </button>
                  <div className="p-3">
                    <h2 className="truncate text-sm font-medium">{product.name}</h2>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Money amount={product.price} emphasis="strong" />
                      <Badge
                        variant="secondary"
                        className={cn(
                          'shrink-0',
                          inStock ? 'bg-success-muted text-success' : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {inStock ? `${product.stock} left` : 'Unavailable'}
                      </Badge>
                    </div>
                    <Button type="button" className="mt-3 h-9 w-full" onClick={() => addProduct(product)}>
                      Add to cart
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="gap-0 rounded-lg border-border/50 p-4 shadow-none">
            <h2 className="text-sm font-medium">Store policy</h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
              {merchant.policies.map((policy) => (
                <li key={policy}>{policy}</li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button asChild>
                <Link href={`/checkout?merchant=${merchant.id}`} onClick={() => setActiveMerchantCart(merchant.id)}>
                  <FiShoppingBag aria-hidden />
                  Cart
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/discover">
                  <FiMessageCircle aria-hidden />
                  Assistant
                </Link>
              </Button>
            </div>
          </Card>
        </section>

        <ProductDialog
          product={selectedProduct}
          merchant={merchant}
          onOpenChange={(open) => {
            if (!open) setSelectedProduct(null);
          }}
          onAdd={addProduct}
        />
      </div>
    </main>
  );
};

/**
 * Product detail. Previously a bare fixed overlay with no focus trap or Escape
 * handling; Shadcn Dialog is Radix underneath, so both come with it.
 */
const ProductDialog = ({
  product,
  merchant,
  onOpenChange,
  onAdd
}: {
  product: Product | null;
  merchant: Seller;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}) => (
  <Dialog open={product !== null} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      {product ? (
        <>
          <ProductThumb imageStyle={product.imageStyle} radius="lg" className="h-40 w-full" />
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{product.name}</DialogTitle>
            <DialogDescription className="text-xs leading-6">{product.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Price" value={formatKwacha(product.price)} />
            <Metric label="Prep time" value={`${product.prepMinutes ?? 30} min`} />
            <Metric label="Delivery" value={product.deliveryEligible ? 'Eligible' : 'Pickup only'} />
            <Metric label="Merchant" value={merchant.location} />
          </div>

          {product.variants?.length ? (
            <div className="flex gap-2 overflow-x-auto">
              {product.variants.map((variant) => (
                <Badge key={variant} variant="secondary" className="shrink-0">
                  {variant}
                </Badge>
              ))}
            </div>
          ) : null}

          <DialogFooter className="sm:justify-start">
            <Button type="button" className="flex-1" onClick={() => onAdd(product)}>
              Add to cart
            </Button>
          </DialogFooter>
        </>
      ) : null}
    </DialogContent>
  </Dialog>
);
