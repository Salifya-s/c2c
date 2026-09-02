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

export const landingStats: LandingStat[] = [
  {label: 'Customer chats', value: '1 place'},
  {label: 'Merchant setup', value: 'Minutes'},
  {label: 'Protected checkout', value: 'Built in'}
];

export const landingFeatures: LandingFeature[] = [
  {
    title: 'Find trusted local sellers',
    description: 'Customers discover products, services, delivery options, and merchant trust signals from one clean workspace.',
    icon: FiSearch
  },
  {
    title: 'Order through conversation',
    description: 'Chats help customers ask questions, confirm availability, and move naturally from intent to checkout.',
    icon: FiMessageSquare
  },
  {
    title: 'Protect every order',
    description: 'Checkout is designed around escrow-style payment protection, order tracking, fulfilment proof, and support.',
    icon: FiShield
  },
  {
    title: 'Give merchants simple tools',
    description: 'Merchant onboarding, order queues, inventory signals, and fulfilment actions are built for non-technical teams.',
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
    description: 'Orders move through payment protection, pickup or delivery, live status updates, and receipt states.'
  }
];

export const heroOrderPreview = [
  {label: 'Fresh groceries', merchant: 'Kalingalinga Market', icon: FiPackage},
  {label: 'Rider assigned', merchant: 'Mock Yango delivery', icon: FiTruck},
  {label: 'Payment protected', merchant: 'Escrow checkout', icon: FiCreditCard},
  {label: 'Ready to release', merchant: 'PIN confirmation', icon: FiCheckCircle}
];
