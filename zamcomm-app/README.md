# AICOS Zambia Commerce Prototype

This is a working customer-facing prototype for the AI Commerce Operating System described in the project brief, feature inspiration notes, and PDF specification. It focuses on proving that a customer can search for a local need, discover trusted merchants, browse a store, add products to a single-merchant cart, complete simulated checkout, and track fulfilment without leaving the platform.

## Main Customer Tabs

- `/discover` - Full-screen responsive customer workspace with Discover, Chat, Orders, and Profile tabs.
- `/merchants/[merchantId]` - Storefront, trust details, policies, product browsing, product detail modal, and add-to-cart.
- `/checkout` - Cart review, fulfilment method, address, slot selection, simulated payment, and order creation.
- `/orders/[orderId]` - Confirmation, payment-protection status, customer timeline, support issue entry, and fulfilment simulation.
- `/merchant/orders` - Lightweight merchant order-management view consuming customer-created prototype orders.

## What the Prototype Does

- Mobile-first customer discovery with realistic Zambian merchant examples.
- Rule-based conversational ordering for availability, pricing, delivery, trust, and escrow questions.
- Cart, delivery slot selection, pickup/delivery mode, and simulated checkout.
- Escrow-style order creation with delivery PIN and protected payment state.
- Customer-facing fulfilment workspace with simulated live updates, delivery progress, completion confirmation, escrow release, receipt state, and support reporting.
- Simulated loading overlays, progress animations, active timeline states, and smooth tab/screen transitions.
- Dedicated adapters/services for search parsing, discovery ranking, cart persistence, mock Yango delivery quotes/slots, simulated payments, price breakdowns, and local order persistence.
- Alata headings and Google Sans body copy configured through `next/font/google` with `font-display: swap`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production check:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Folder and File Responsibilities

### `src/app/`

- `src/app/page.tsx` - Redirects the root route to `/discover`.
- `src/app/layout.tsx` - Root layout, page metadata, `next-intl` provider, global CSS import, and optimized Alata/Google Sans font variables.
- `src/app/globals.css` - Tailwind import, theme tokens, modern font stack, animations, and app-wide utility styles.
- `src/app/discover/page.tsx` - Customer merchant/product discovery route.
- `src/app/merchants/[merchantId]/page.tsx` - Dynamic merchant storefront route.
- `src/app/checkout/page.tsx` - Checkout route.
- `src/app/orders/[orderId]/page.tsx` - Dynamic customer order tracking route.
- `src/app/merchant/orders/page.tsx` - Merchant order-management route for the prototype.
- `src/app/hub/page.tsx` - Existing explanatory project hub route.
- `src/app/auth/page.tsx` - Existing authentication/onboarding preview route.
- `src/app/favicon.ico` - Browser favicon.

### `src/features/commerce/`

Main customer commerce feature area. It keeps UI, mock data, logic, and shared types separate so the mock implementation can later be replaced by real APIs.

- `components/DiscoveryPageClient.tsx` - Full-screen customer tab shell with discovery search, mock merchant chats, order summaries, customer profile, loading/empty/error states, merchant results, product results, and add-to-cart handling.
- `components/StorefrontPageClient.tsx` - Merchant storefront, trust information, product search, product detail modal, policies, and cart entry.
- `components/CheckoutPageClient.tsx` - Step-based checkout for cart review, fulfilment, address, slots, payment, review, and order creation.
- `components/OrderTrackingPageClient.tsx` - Order confirmation, readable customer timeline, simulated updates, completion PIN, protection status, and issue reporting.
- `components/MerchantOrdersPageClient.tsx` - Merchant order list that reads customer-created orders and simulates acceptance, rejection, and fulfilment status changes.
- `components/CustomerInstagramApp.tsx` - Earlier four-tab customer surface retained as a reference component, no longer used by the main route.
- `data/mockCommerce.ts` - Mock sellers, products, delivery slots, and initial orders used by the customer experience.
- `lib/commerceLogic.ts` - Reusable business functions for currency formatting, seller/product lookup, cart totals, trust scoring, order status progression, order creation, and chatbot replies.
- `services/searchService.ts` - Deterministic keyword/natural-language parser plus local ranking for products and merchants.
- `services/cartService.ts` - Local-storage cart state, single-merchant cart structure, add/update/clear operations.
- `services/pricingService.ts` - Product subtotal, delivery fee, buyer-protection fee, discount, and final total calculations.
- `services/mockYangoProvider.ts` - Mock delivery-provider adapter for quotes, compatible slots, booking, and status.
- `services/mockPaymentProvider.ts` - Simulated payment adapter with mobile money/card/pay-on-pickup success and failure paths.
- `services/orderService.ts` - Local-storage order persistence and protected order creation.
- `types/commerce.ts` - Shared TypeScript types for products, sellers, cart lines, orders, statuses, delivery slots, and chat messages.

### `src/components/`

Reusable TypeScript components used by secondary routes and the hub.

- `auth/AuthFormFields.tsx` - Shared authentication form fields for `/auth`.
- `layout/PhoneFrame.tsx` - Reusable phone-frame layout component.
- `layout/OverlaySheet.tsx` - Reusable overlay/sheet component.
- `pages/AuthExperience.tsx` - Auth/onboarding preview experience.
- `pages/HubLandingPage.tsx` - Explanatory project hub page.
- `ui/Button.tsx`, `ui/Card.tsx`, `ui/IconButton.tsx`, `ui/InputField.tsx`, `ui/SectionHeading.tsx` - Shared UI primitives.
- `hub/ChatDemo.tsx` - Hub conversational ordering demo.
- `hub/EscrowFlow.tsx` - Hub escrow flow visualization.
- `hub/FeaturesTabs.tsx` - Hub feature tabs.
- `hub/HeroChat.tsx` - Hub hero chat animation.

### `src/data/` and `src/lib/`

Shared support for the retained hub and auth routes.

- `src/data/hubData.ts` - Mock data for hub demo flows.
- `src/lib/iconography.ts` - Shared icon mapping based on `react-icons`.

### `messages/` and `i18n/`

- `messages/en.json` - English copy used by translated components and secondary routes.
- `i18n/request.ts`, `i18n/routing.ts` - `next-intl` configuration.

### Project Configuration

- `package.json` - Scripts and dependencies for Next.js, React, Tailwind, and `next-intl`.
- `package-lock.json` - Locked dependency versions.
- `next.config.ts` - Next.js configuration with `next-intl`.
- `tailwind.config.ts` - Tailwind theme configuration.
- `postcss.config.mjs` - Tailwind PostCSS setup.
- `tsconfig.json` - TypeScript configuration and path aliases.
- `eslint.config.mjs` - ESLint configuration.
- `proxy.ts` - Locale/request proxy used by `next-intl`.
- `AGENTS.md` - Local coding guidance for this Next.js version.
- `scripts/commerce-tests.mjs` - Dependency-free service tests for search, ranking, cart restriction, pricing/payment, and the end-to-end happy path.

## Key Reusable Functions

- `formatKwacha(amount)` - Formats Zambian Kwacha values consistently.
- `findSeller(sellerId)` and `findProduct(seller, productId)` - Centralised lookup helpers.
- `calculateCartSubtotal(cart, seller)` - Computes item totals from cart lines.
- `calculateOrderTotal(cart, seller, method, slotId)` - Adds delivery fees when needed.
- `calculateTrustScore(seller)` - Simulates the Trust Engine score from rating, verification, completion, and dispute data.
- `getNextOrderStatus(status)` and `getStatusLabel(status)` - Encapsulate the escrow fulfilment state machine.
- `createOrderFromCart(cart, sellerId, method, slotId)` - Creates a simulated paid escrow order with PIN.
- `buildBotReply(message, seller, productId)` - Rule-based customer support and sales response generator.
- `parseSearchIntent(raw)` - Extracts deterministic search intent fields from keyword or natural-language requests.
- `searchCommerce(rawQuery, filters)` - Returns ranked merchant and product results.
- `mockYangoProvider.getQuote/getAvailableSlots()` - Simulates delivery compatibility and slot availability.
- `mockPaymentProvider.pay()` - Simulates payment success, failure, and pay-on-pickup.
- `createProtectedOrder(input)` - Creates the checkout order after simulated payment succeeds.

## Prototype Boundaries

The app is frontend-only. Payments, AI parsing, fraud scoring, identity verification, courier tracking, disputes, merchant order management, and customer memory are simulated with local state and mock data. Real Yango, real payment processing, real escrow, production AI credentials, and a backend order database are still required for production.
