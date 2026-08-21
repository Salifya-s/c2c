import {
  FiGift,
  FiGrid,
  FiShoppingBag,
  FiStar,
  FiUser,
  FiZap
} from 'react-icons/fi';

import type {ChatMessage} from '../types/commerce';

/**
 * Customer-facing discovery prompts.
 *
 * Production swap:
 * replace this file with CMS/admin-managed categories or a database table.
 */
export const discoverySuggestions = [
  'Birthday cake under K500',
  'Chicken and chips near me',
  'Tailor available this week',
  'Beauty products delivered today'
];

/**
 * Category cards shown in the Discover tab.
 *
 * The `id` must match product/merchant category values used by search filters.
 */
export const discoveryCategoryCards = [
  {id: 'Bakery', label: 'Bakery', helper: 'Cakes, cupcakes, breakfast bakes', Icon: FiGift, accent: 'bg-pink-50 text-pink-700'},
  {id: 'Lunch', label: 'Lunch', helper: 'Prepared meals ready today', Icon: FiShoppingBag, accent: 'bg-amber-50 text-amber-700'},
  {id: 'Groceries', label: 'Groceries', helper: 'Fresh produce and household basics', Icon: FiGrid, accent: 'bg-emerald-50 text-emerald-700'},
  {id: 'Fashion', label: 'Fashion', helper: 'Clothing, shoes, custom pieces', Icon: FiUser, accent: 'bg-sky-50 text-sky-700'},
  {id: 'Beauty', label: 'Beauty', helper: 'Products and appointments', Icon: FiStar, accent: 'bg-fuchsia-50 text-fuchsia-700'},
  {id: 'Services', label: 'Services', helper: 'Repairs, tailoring, appointments', Icon: FiZap, accent: 'bg-indigo-50 text-indigo-700'},
  {id: 'Gifts', label: 'Gifts', helper: 'Flowers, hampers, event extras', Icon: FiGift, accent: 'bg-rose-50 text-rose-700'}
];

export const customerFilterLocations = ['Lusaka', 'Kabulonga', 'Woodlands', 'Ibex Hill', 'Roma', 'Chilenje', 'Kitwe'];

export const customerProfileSeed = {
  email: 'naledi@example.com',
  address: 'Plot 12, Great East Road, Kabulonga',
  preferredPayment: 'MTN Money',
  memberSince: 'May 2026'
};

/**
 * Mock chat inbox.
 *
 * Production swap:
 * this can become a `conversations` query joined to merchant profiles and
 * paginated by last message timestamp.
 */
export const recentConversations: Array<{
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
