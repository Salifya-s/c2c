/**
 * Merchant dashboard configuration.
 *
 * Production swap:
 * these values should come from merchant analytics/order aggregates once a
 * backend exists. Keeping them in one file makes the prototype easy to tune.
 */
export const merchantDashboardSeed = {
  merchantId: 'baked-tasha',
  payoutBalance: 1840,
  protectedFunds: 760,
  todayRevenue: 1260,
  averageResponse: '5 min',
  lowStockThreshold: 6,
  supportQueue: [
    {
      id: 'SUP-18',
      customer: 'Naledi Mwansa',
      topic: 'Delivery ETA',
      message: 'Customer asked whether the birthday cake can arrive before 15:00.',
      status: 'Open'
    },
    {
      id: 'SUP-17',
      customer: 'Bupe M.',
      topic: 'Payment confirmation',
      message: 'Mobile money confirmation was delayed by the provider.',
      status: 'Watching'
    }
  ]
};
