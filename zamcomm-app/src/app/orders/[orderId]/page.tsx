import {OrderTrackingPageClient} from '@/src/features/commerce/components/OrderTrackingPageClient';

const OrderPage = async ({params, searchParams}: PageProps<'/orders/[orderId]'>) => {
  const {orderId} = await params;
  const query = await searchParams;
  return <OrderTrackingPageClient orderId={orderId} confirmed={query.confirmed === '1'} />;
};

export default OrderPage;
