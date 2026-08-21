import {notFound} from 'next/navigation';

import {sellers} from '@/src/features/commerce/data/mockCommerce';
import {StorefrontPageClient} from '@/src/features/commerce/components/StorefrontPageClient';

const MerchantPage = async ({params, searchParams}: PageProps<'/merchants/[merchantId]'>) => {
  const {merchantId} = await params;
  const query = await searchParams;
  const merchant = sellers.find((seller) => seller.id === merchantId);
  if (!merchant) notFound();

  const product = Array.isArray(query.product) ? query.product[0] : query.product;
  return <StorefrontPageClient merchant={merchant} initialProductId={product} />;
};

export default MerchantPage;
