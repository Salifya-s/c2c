import {Suspense} from 'react';

import {CheckoutPageClient} from '@/src/features/commerce/components/CheckoutPageClient';

const CheckoutFallback = () => (
  <main className="grid min-h-screen place-items-center bg-neutral-100 p-4">
    <div className="rounded-3xl bg-white p-6 text-sm font-black text-neutral-500 shadow-sm">Preparing checkout...</div>
  </main>
);

const CheckoutPage = () => (
  <Suspense fallback={<CheckoutFallback />}>
    <CheckoutPageClient />
  </Suspense>
);

export default CheckoutPage;
