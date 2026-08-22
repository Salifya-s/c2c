/**
 * Merchant onboarding question/content configuration.
 *
 * Production swap:
 * these options can later be served by an admin CMS or onboarding API so
 * different merchant categories can receive different setup questions.
 */
export const merchantCategoryOptions = [
  'Food and meals',
  'Bakery and cakes',
  'Fashion and tailoring',
  'Beauty and wellness',
  'Groceries',
  'Repairs and services',
  'Gifts and events'
];

export const merchantToneOptions = [
  'Warm and friendly',
  'Fast and direct',
  'Premium and polished',
  'Community and homegrown'
];

export const fulfilmentOptions = ['Delivery', 'Pickup', 'Bookings', 'Custom orders'];

export const paymentOptions = ['Mobile money', 'Cash on pickup', 'Card later', 'Deposit first'];

export const trustOptions = [
  'Show verified badge',
  'Use protected payments',
  'Show customer reviews',
  'Confirm every order before payment release'
];

export const launchChecklist = [
  'Store profile created',
  'First product or service captured',
  'Fulfilment preferences saved',
  'Payment preferences selected',
  'Trust and support rules prepared'
];
