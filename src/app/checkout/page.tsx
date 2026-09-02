import {Suspense} from 'react';

import {CheckoutPageClient} from '@/src/features/commerce/components/CheckoutPageClient';

const CheckoutFallback = () => (
  <main className="grid min-h-screen place-items-center bg-background p-4">
    <div className="rounded-lg border border-border/50 bg-card p-5 text-sm text-muted-foreground">Preparing checkout...</div>
  </main>
);

const CheckoutPage = () => (
  <Suspense fallback={<CheckoutFallback />}>
    <CheckoutPageClient />
  </Suspense>
);

export default CheckoutPage;
