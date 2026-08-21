# AICOS Zambia Commerce Prototype

This is a working prototype for the AI Commerce Operating System described in the project brief, feature inspiration notes, and PDF specification. It focuses on proving that customers and merchants can enter the platform through simulated login/onboarding, search for local needs, discover trusted merchants, browse stores, create protected orders, and manage fulfilment without leaving the web app.

## Main Customer Tabs

- `/discover` - Full-screen responsive customer workspace with simulated login/onboarding, Discover, Chat, Orders, Profile, and logout.
- `/merchants/[merchantId]` - Storefront, trust details, policies, product browsing, product detail modal, and add-to-cart.
- `/checkout` - Cart review, fulfilment method, address, slot selection, simulated payment, and order creation.
- `/orders/[orderId]` - Confirmation, payment-protection status, customer timeline, support issue entry, and fulfilment simulation.
- `/merchant/orders` - Merchant login/onboarding and order-management view consuming customer-created prototype orders.

## What the Prototype Does

- Simulated customer and merchant login/onboarding flows with role switching and logout.
- Mobile-first customer discovery with realistic Zambian merchant examples.
- Category discovery cards with icon placeholders, active states, and hover transformation effects.
- Rule-based conversational ordering for availability, pricing, delivery, trust, and escrow questions.
- Floating cart button with total quantity count and a merchant-by-merchant saved cart drawer.
- Multi-store cart progress so customers can keep separate carts for different merchants and fulfil each merchant order without losing the others.
- Mock recent merchant conversations in the customer Chat tab, with list-first inbox behaviour and full-screen conversation detail after selection.
- Cart, delivery slot selection, pickup/delivery mode, and simulated checkout.
- Escrow-style order creation with delivery PIN and protected payment state.
- Customer Orders tab with list-first recent orders, full-screen order detail after selection, tracking links, and a placeholder help button for future support/dispute flows.
- Customer-facing fulfilment workspace with simulated live updates, delivery progress, completion confirmation, escrow release, receipt state, and support reporting.
- Merchant-facing workspace with dashboard metrics, fulfilment queue, inventory signals, support preview, simulated order actions, and logout.
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

## Vercel Deployment Notes

The app is now structured as a standard Next.js project at the repository root. In Vercel, use:

- Framework Preset: `Next.js`
- Root Directory: `./` or blank/default
- Build Command: default or `npm run build`
- Install Command: default or `npm install`
- Output Directory: blank/default

Do not set the Output Directory to `public`; `public/` is only for static assets in this Next.js app.

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

- `components/AuthFlow.tsx` - Reusable simulated login/onboarding experience shared by customer and merchant entry points. Captures role, name, username, mobile number, business name where needed, and onboarding state.
- `components/DiscoveryPageClient.tsx` - Full-screen customer tab shell with login/onboarding gate, logout, floating multi-store cart drawer, discovery search, category cards, mock merchant inbox/detail, order list/detail, customer profile, loading/empty/error states, merchant results, product results, and add-to-cart handling.
- `components/StorefrontPageClient.tsx` - Merchant storefront, trust information, product search, product detail modal, policies, and cart entry.
- `components/CheckoutPageClient.tsx` - Step-based checkout for cart review, fulfilment, address, slots, payment, review, and order creation.
- `components/OrderTrackingPageClient.tsx` - Order confirmation, readable customer timeline, simulated updates, completion PIN, protection status, and issue reporting.
- `components/MerchantOrdersPageClient.tsx` - Merchant login/onboarding gate plus dashboard, fulfilment queue, inventory signal view, support preview, and simulated acceptance, rejection, and fulfilment status changes.
- `data/customerExperience.ts` - Replaceable customer UX data for suggestions, category cards, filter locations, profile seed fields, and recent conversations.
- `data/merchantExperience.ts` - Replaceable merchant dashboard seed data for metrics, low-stock threshold, and support queue examples.
- `data/mockCommerce.ts` - Mock sellers, products, delivery slots, and initial orders used by the customer experience.
- `lib/commerceLogic.ts` - Reusable business functions for currency formatting, seller/product lookup, cart totals, trust scoring, order status progression, order creation, and chatbot replies.
- `services/searchService.ts` - Deterministic keyword/natural-language parser plus local ranking for products and merchants.
- `services/cartService.ts` - Local-storage multi-merchant cart store, merchant cart groups, active merchant selection for checkout, item counts, add/update/clear operations, and documented database/API swap points.
- `services/pricingService.ts` - Product subtotal, delivery fee, buyer-protection fee, discount, and final total calculations.
- `services/mockYangoProvider.ts` - Mock delivery-provider adapter for quotes, compatible slots, booking, and status.
- `services/mockPaymentProvider.ts` - Simulated payment adapter with mobile money/card/pay-on-pickup success and failure paths.
- `services/orderService.ts` - Local-storage order persistence and protected order creation.
- `types/commerce.ts` - Shared TypeScript types for products, sellers, cart lines, orders, statuses, delivery slots, and chat messages.

### `src/components/`

Reusable TypeScript components used by secondary routes and the hub.

- `auth/AuthFormFields.tsx` - Shared authentication form fields for `/auth`.
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
- `readMultiCart()` and `saveMultiCart(cart)` - Read and persist the multi-store cart shape. These are the primary future swap points for a real authenticated cart API.
- `addCartItem(cart, merchant, product)` - Adds products to the correct merchant cart group while preserving carts from other stores.
- `getCartItemCount(cart)` and `getMerchantCartQuantity(group)` - Power the floating cart badge and merchant grouped cart drawer.
- `setActiveMerchantCart(merchantId)` - Marks which merchant group checkout should process.

## Current UX Progress

- Customer entry: `/discover` opens with a simulated customer login/onboarding flow. Selecting merchant redirects into the merchant workspace.
- Merchant entry: `/merchant/orders` opens with a simulated merchant login/onboarding flow. Selecting customer redirects back to the customer app.
- Discover: search, suggestions, filters, category cards, merchant cards, product cards, and multi-merchant add-to-cart are working against local mock data.
- Cart: the bottom-right floating cart button opens saved carts grouped by merchant. Each merchant group can resume checkout independently while other store carts remain saved.
- Chat: only the recent chat list is displayed first. Selecting a chat opens a full-screen conversation detail within the app shell.
- Orders: only the recent order list is displayed first. Selecting an order opens a full-screen detail view within the app shell. The help button is intentionally a placeholder for now.
- Profile: customer personal information and order history are shown from the simulated session and mock order state.
- Merchant workspace: dashboard metrics, order queue, inventory view, and support preview are implemented as a scaffold for future deeper merchant tools.

## Data and Future Backend Swap Points

- Static catalog data currently lives in TypeScript data files under `src/features/commerce/data/`. These files are intentionally shaped like repository seed data so they can later be replaced by database reads or API responses.
- Customer session, cart, and orders are still local browser state. The service functions in `services/cartService.ts` and `services/orderService.ts` are the intended boundaries for future authenticated API calls.
- Mock payment and delivery adapters live behind provider-style service files. Production integrations should replace those files without forcing UI components to know payment or courier implementation details.
- Components now consume data through service/data modules instead of defining most UX content inline. This improves cohesion and makes the prototype easier to grow.

## Prototype Boundaries

The app is frontend-only. Authentication, onboarding, payments, AI parsing, fraud scoring, identity verification, courier tracking, disputes, merchant order management, customer memory, and help/support routing are simulated with local state and mock data. Real auth, real Yango, real payment processing, real escrow, production AI credentials, and a backend order database are still required for production.
