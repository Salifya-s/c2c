import type { IconType } from 'react-icons';
import {
  FiCheckCircle,
  FiCreditCard,
  FiMessageSquare,
  FiPackage,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck
} from 'react-icons/fi';

/**
 * Landing page content.
 *
 * Production swap: this is the natural place for a CMS to take over. Every
 * string the marketing page renders lives here rather than in the component.
 */

export type LandingStat = {
  label: string;
  value: string;
};

export type LandingFeature = {
  title: string;
  description: string;
  icon: IconType;
};

export type LandingStep = {
  title: string;
  description: string;
};

/** Top navigation. Anchors resolve to section ids on the page. */
export const landingNavLinks: Array<{ label: string; href: string }> = [
  { label: 'Why Tantika', href: '#why' },
  { label: 'How it works', href: '#how' },
  { label: 'For merchants', href: '#merchants' }
];

/** Example prompts under the hero input, mirroring the store ideas a merchant might type. */
export const heroPromptExamples = [
  'A bakery in Roma selling birthday cakes',
  'A tailor taking repairs and alterations',
  'A grocery stand delivering across Lusaka'
];

/** Hero supporting tiles: the journey a generated store immediately supports. */
export const heroOrderPreview = [
  { label: 'Fresh groceries', merchant: 'Kalingalinga Market', icon: FiPackage },
  { label: 'Rider assigned', merchant: 'Mock Yango delivery', icon: FiTruck },
  { label: 'Payment protected', merchant: 'Escrow checkout', icon: FiCreditCard },
  { label: 'Ready to release', merchant: 'PIN confirmation', icon: FiCheckCircle }
];

/** Three short benefit columns directly below the hero. */
export const landingBenefits: LandingStep[] = [
  {
    title: 'Easy to use',
    description:
      'Describe the business in one sentence. Tantika turns it into a working storefront with products, delivery options, and protected checkout already wired up.'
  },
  {
    title: 'Quick to build',
    description:
      'Merchant setup is a guided six-step flow, not a configuration manual. Most sellers finish in minutes on a phone.'
  },
  {
    title: 'Built for trust',
    description:
      'Every order runs through escrow-style payment protection, live status tracking, and PIN-confirmed handover before funds are released.'
  }
];

export const landingStats: LandingStat[] = [
  { label: 'Customer chats', value: '1 place' },
  { label: 'Merchant setup', value: 'Minutes' },
  { label: 'Protected checkout', value: 'Built in' }
];

/** Social proof: a merchant quote plus the seeded stores shown as a logo row. */
export const landingTestimonial = {
  quote:
    'I used to lose orders in three different chat apps. Now everything a customer asks, pays, and confirms sits in one place, and I know the money is protected before I start baking.',
  author: 'Tasha Mwila',
  role: "Owner, Tasha's Cakes, Lusaka"
};

export const landingMerchantLogos = [
  "Tasha's Cakes",
  'Mama Kunda Kitchen',
  'Lusaka Tailor Studio',
  'Greenfield Grocers',
  'Beauty by Mwila'
];

export const landingFeatures: LandingFeature[] = [
  {
    title: 'Find trusted local sellers',
    description:
      'Customers discover products, services, delivery options, and merchant trust signals from one clean workspace.',
    icon: FiSearch
  },
  {
    title: 'Order through conversation',
    description:
      'Chats help customers ask questions, confirm availability, and move naturally from intent to checkout.',
    icon: FiMessageSquare
  },
  {
    title: 'Protect every order',
    description:
      'Checkout is designed around escrow-style payment protection, order tracking, fulfilment proof, and support.',
    icon: FiShield
  },
  {
    title: 'Give merchants simple tools',
    description:
      'Merchant onboarding, order queues, inventory signals, and fulfilment actions are built for non-technical teams.',
    icon: FiShoppingBag
  }
];

export const landingSteps: LandingStep[] = [
  {
    title: 'Sign in or create an account',
    description: 'Customers and merchants start with the role that matches how they use the platform.'
  },
  {
    title: 'Discover, chat, and build a cart',
    description: 'The app keeps carts grouped by merchant so several stores can be managed at once.'
  },
  {
    title: 'Fulfil with confidence',
    description:
      'Orders move through payment protection, pickup or delivery, live status updates, and receipt states.'
  }
];

/** Footer link groups. Hrefs are in-page anchors until the destination pages exist. */
export const landingFooterGroups: Array<{ heading: string; links: Array<{ label: string; href: string }> }> = [
  {
    heading: 'Product',
    links: [
      { label: 'Discover', href: '/discover' },
      { label: 'Merchant workspace', href: '/merchant/orders' },
      { label: 'How it works', href: '#how' },
      { label: 'Payment protection', href: '#why' }
    ]
  },
  {
    heading: 'For merchants',
    links: [
      { label: 'Start a store', href: '#access' },
      { label: 'Fulfilment dashboard', href: '/merchant/orders' },
      { label: 'Delivery and pickup', href: '#merchants' },
      { label: 'Getting paid', href: '#merchants' }
    ]
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help centre', href: '#access' },
      { label: 'Order issues', href: '#access' },
      { label: 'Contact us', href: '#access' },
      { label: 'Status', href: '#access' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Tantika', href: '#why' },
      { label: 'Careers', href: '#why' },
      { label: 'Privacy', href: '#why' },
      { label: 'Terms', href: '#why' }
    ]
  }
];

export const landingFooterLegal = [
  { label: 'Privacy policy', href: '#why' },
  { label: 'Terms of service', href: '#why' },
  { label: 'Cookie preferences', href: '#why' }
];

/**
 * Landing photography.
 *
 * Unsplash-hosted while the product has no first-party imagery. Each entry
 * records what the photo actually depicts so alt text stays accurate; swap
 * `src` for `/public` assets or a CDN when real photography exists.
 */
export type LandingImage = { src: string; alt: string };

const unsplash = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;

export const landingHeroImage: LandingImage = {
  src: unsplash('photo-1687422809654-579d81c29d32', 1200),
  alt: 'A vendor standing at a fruit stand, holding a mobile phone'
};

export const landingMerchantImage: LandingImage = {
  src: unsplash('photo-1687422808565-929533931584', 1100),
  alt: 'A market seller in front of a fruit stand giving a thumbs up'
};

export const landingCoverageImage: LandingImage = {
  src: unsplash('photo-1776153380872-108ba14dc63d', 1100),
  alt: 'A busy marketplace with crowded stalls and surrounding buildings'
};

/** Category tiles. `accent` drives the tile's tint so the grid carries colour. */
export const landingCategories: Array<LandingImage & { title: string; accent: string }> = [
  {
    title: 'Fresh produce',
    accent: 'bg-brand-green-soft text-brand-green',
    src: unsplash('photo-1734255026082-82fdc81991f0'),
    alt: 'People gathered around a table filled with tomatoes'
  },
  {
    title: 'Groceries',
    accent: 'bg-brand-teal-soft text-brand-teal',
    src: unsplash('photo-1552710218-bd32b0c98626'),
    alt: 'Brown seeds and grains on display at a market stall'
  },
  {
    title: 'Fashion and bags',
    accent: 'bg-brand-blue-soft text-brand-blue',
    src: unsplash('photo-1692689383138-c2df3476072c'),
    alt: 'A group of colourful bags arranged on a table'
  },
  {
    title: 'Fish and meat',
    accent: 'bg-brand-teal-soft text-brand-teal',
    src: unsplash('photo-1783408355128-c6a45a91c130'),
    alt: 'Fresh fish displayed at a busy market stall'
  },
  {
    title: 'Street food',
    accent: 'bg-brand-green-soft text-brand-green',
    src: unsplash('photo-1773858441067-de99ed159a95'),
    alt: 'A smiling vendor sitting in a fruit market'
  },
  {
    title: 'Everyday delivery',
    accent: 'bg-brand-blue-soft text-brand-blue',
    src: unsplash('photo-1734255620882-77378ba420bb'),
    alt: 'A man pushing a wheelbarrow filled with watermelons'
  }
];

/** Numbers band. Prototype figures - replace with real analytics before launch. */
export const landingImpactStats: LandingStat[] = [
  { label: 'Minutes to open a store', value: '6' },
  { label: 'Steps from chat to paid order', value: '4' },
  { label: 'Held in escrow until delivery', value: '100%' },
  { label: 'Lusaka delivery zones covered', value: '12' }
];

export const landingFaqs: Array<{ question: string; answer: string }> = [
  {
    question: 'What does it cost to open a store?',
    answer:
      'Nothing to set up. You describe the business, answer six short questions, and the storefront is live. Payment protection fees are only applied to completed orders.'
  },
  {
    question: 'How does payment protection work?',
    answer:
      'A customer pays at checkout and the money is held rather than sent straight to the seller. It is released once delivery or pickup is confirmed with the order PIN, so both sides are covered.'
  },
  {
    question: 'Do I need a smartphone or a computer?',
    answer:
      'A phone is enough. Onboarding, the order queue, and fulfilment actions are all designed to work on a small screen with an intermittent connection.'
  },
  {
    question: 'Can customers buy from several sellers at once?',
    answer:
      'Yes. Carts are kept separately per store, so a customer can build orders with several merchants in parallel and each seller still receives one clean order.'
  },
  {
    question: 'How do deliveries happen?',
    answer:
      'Sellers choose delivery, pickup, or both. Delivery quotes and time slots come from the courier integration, and the customer tracks each status change as it happens.'
  }
];
