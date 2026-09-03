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
