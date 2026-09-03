# AICOS Zambia Commerce Prototype

This is a working prototype moving toward a shippable AI Commerce Operating System. It focuses on proving that customers and merchants can register or log in with password + OTP, search for local needs, discover trusted merchants, browse stores, create protected orders, and manage fulfilment without leaving the web app.

## Main Customer Tabs

- `/discover` - Full-screen responsive customer workspace with password + OTP login/register, Discover, Chat, Orders, Profile, and logout.
- `/merchants/[merchantId]` - Storefront, trust details, policies, product browsing, product detail modal, and add-to-cart.
- `/checkout` - Cart review, fulfilment method, address, slot selection, simulated payment, and order creation.
- `/orders/[orderId]` - Confirmation, payment-protection status, customer timeline, support issue entry, and fulfilment simulation.
- `/merchant/orders` - Merchant password + OTP login/register, guided onboarding, and order-management view consuming customer-created prototype orders.

## What the Prototype Does

- Customer and merchant login/register with password + OTP, backed by Next.js route handlers.
- Guided merchant setup interview that asks plain-language questions about owner details, store category, first offer, pricing, service area, fulfilment, payments, trust settings, and brand tone.
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
- DM Sans headings and Jost body copy configured through `next/font/google` with `font-display: swap`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The root route `/` now renders the public landing page with the active customer/merchant login and signup flow embedded directly on the page. Successful customer sessions continue to `/discover`; successful merchant sessions continue to `/merchant/orders`.

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

Set `AUTH_SESSION_SECRET` in production before using the auth routes. The current local auth store is file-backed for development and should be replaced with a durable database before production traffic.

## Folder and File Responsibilities

### `src/app/`

- `src/app/page.tsx` - Public landing page route that introduces AICOS Commerce and routes users into customer or merchant login/signup flows.
- `src/app/layout.tsx` - Root layout, page metadata, global CSS import, and optimized DM Sans/Jost font variables.
- `src/app/globals.css` - Tailwind v4 `@theme inline` block holding the zam/ink brand ramps plus the Shadcn semantic tokens mapped onto them, animations, and app-wide utility styles.
- `src/app/discover/page.tsx` - Customer merchant/product discovery route.
- `src/app/merchants/[merchantId]/page.tsx` - Dynamic merchant storefront route.
- `src/app/checkout/page.tsx` - Checkout route.
- `src/app/orders/[orderId]/page.tsx` - Dynamic customer order tracking route.
- `src/app/merchant/orders/page.tsx` - Merchant order-management route for the prototype.
- `src/app/hub/page.tsx` - Redirect to `/`. The standalone hub was retired once the landing page carried the same pitch.
- `src/app/auth/page.tsx` - Redirect to the landing page's `#access` auth panel, preserving `?role=` (and the legacy `vendor` spelling).
- `src/app/api/auth/register/start/route.ts` - Starts customer or merchant registration, hashes the password, creates a user draft, and sends an OTP challenge.
- `src/app/api/auth/login/start/route.ts` - Checks password credentials and sends an OTP challenge.
- `src/app/api/auth/verify-otp/route.ts` - Verifies OTP challenges and creates a signed HttpOnly session cookie.
- `src/app/api/auth/me/route.ts` - Reads the current session cookie and returns the signed-in user.
- `src/app/api/auth/logout/route.ts` - Clears the session cookie.
- `src/app/favicon.ico` - Browser favicon.

### `src/features/commerce/`

Main customer commerce feature area. It keeps UI, mock data, logic, and shared types separate so the mock implementation can later be replaced by real APIs.

- `components/AuthFlow.tsx` - Reusable simulated login/onboarding experience shared by customer and merchant entry points. Captures role, name, username, mobile number, business name where needed, and onboarding state.
- `components/DiscoveryPageClient.tsx` - Full-screen customer tab shell with login/onboarding gate, logout, floating multi-store cart drawer, discovery search, category cards, mock merchant inbox/detail, order list/detail, customer profile, loading/empty/error states, merchant results, product results, and add-to-cart handling.
- `components/StorefrontPageClient.tsx` - Merchant storefront, trust information, product search, product detail modal, policies, and cart entry.
- `components/CheckoutPageClient.tsx` - Step-based checkout for cart review, fulfilment, address, slots, payment, review, and order creation.
- `components/OrderTrackingPageClient.tsx` - Order confirmation, readable customer timeline, simulated updates, completion PIN, protection status, and issue reporting.
- `components/MerchantOrdersPageClient.tsx` - Merchant login/onboarding gate plus dashboard, fulfilment queue, inventory signal view, support preview, and simulated acceptance, rejection, and fulfilment status changes.
- `components/shared/` - Cross-screen commerce vocabulary: `StatusBadge` (order/protection/payment status to one tone + label), `Money` (Kwacha formatting), `ProductThumb` (single render path for placeholder imagery), `Metric`, and `EmptyState`.
- `data/customerExperience.ts` - Replaceable customer UX data for suggestions, category cards, filter locations, profile seed fields, and recent conversations.
- `data/merchantExperience.ts` - Replaceable merchant dashboard seed data for metrics, low-stock threshold, and support queue examples.
- `data/merchantOnboarding.ts` - Replaceable merchant onboarding options for categories, fulfilment methods, payment choices, trust settings, tone, and launch checklist.
- `data/mockCommerce.ts` - Mock sellers, products, delivery slots, and initial orders used by the customer experience.
- `lib/commerceLogic.ts` - Reusable business functions for currency formatting, seller/product lookup, cart totals, trust scoring, order status progression, order creation, and chatbot replies.
- `services/searchService.ts` - Deterministic keyword/natural-language parser plus local ranking for products and merchants.
- `services/cartService.ts` - Local-storage multi-merchant cart store, merchant cart groups, active merchant selection for checkout, item counts, add/update/clear operations, and documented database/API swap points.
- `services/pricingService.ts` - Product subtotal, delivery fee, buyer-protection fee, discount, and final total calculations.
- `services/mockYangoProvider.ts` - Mock delivery-provider adapter for quotes, compatible slots, booking, and status.
- `services/mockPaymentProvider.ts` - Simulated payment adapter with mobile money/card/pay-on-pickup success and failure paths.
- `services/orderService.ts` - Local-storage order persistence and protected order creation.
- `server/auth/crypto.ts` - Password hashing, OTP hashing, OTP generation, and signed session-token helpers.
- `server/auth/otpDelivery.ts` - Replaceable OTP delivery adapter. It logs/surfaces development OTPs now; replace with SMS/email providers later.
- `server/auth/responses.ts` - Shared auth response and session cookie helpers.
- `server/auth/store.ts` - Development auth repository backed by `.data/auth-store.json`; replace with a database repository for production.
- `server/auth/types.ts` - Shared backend auth record, OTP challenge, and public session types.
- `types/auth.ts` - Shared auth/session/onboarding types used by both client components and backend auth routes.
- `types/commerce.ts` - Shared TypeScript types for products, sellers, cart lines, orders, statuses, delivery slots, and chat messages.

### `src/components/`

Application-wide UI that is not specific to the commerce feature.

- `landing/LandingPage.tsx` - Public landing page for `/`. Describes the product and embeds the real `AuthFlow` in its `#access` panel, routing customers to `/discover` and merchants to `/merchant/orders` on completion.
- `ui/` - Shadcn primitives (`button`, `card`, `input`, `textarea`, `label`, `badge`, `dialog`, `sheet`, `tabs`, `select`, `separator`, `skeleton`). Generated by the Shadcn CLI and styled through the semantic tokens in `globals.css`.

### `src/data/` and `src/lib/`

- `src/data/landingPage.ts` - Typed landing-page content for stats, feature cards, journey steps, and the hero order preview.
- `src/lib/cn.ts` - Class-name merge helper (`clsx` + `tailwind-merge`) used by every component so conflicting Tailwind utilities resolve last-wins.

### Data stores

- `data/json/customers.json`, `data/json/merchants.json` - Committed demo seed. `readAuthStore` syncs these into the auth store and stamps each with the shared demo password, so a fresh clone has working logins.
- `.data/` - Gitignored. Holds the auth store and every account created at runtime, so registering while developing never dirties the working tree.

### Project Configuration

- `package.json` - Scripts and dependencies for Next.js, React, Tailwind, Radix (via `radix-ui`), and the Shadcn support libraries (`class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`).
- `package-lock.json` - Locked dependency versions.
- `next.config.ts` - Next.js configuration.
- `postcss.config.mjs` - Tailwind PostCSS setup.
- `tsconfig.json` - TypeScript configuration and path aliases.
- `eslint.config.mjs` - ESLint configuration.
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
- `hashPassword(password)` and `verifyPassword(password, hash, salt)` - Secure the first auth factor using scrypt.
- `createOtp()`, `hashOtp(otp)`, and `verifyOtpHash(otp, hash)` - Support the second auth factor.
- `signSession(payload)` and `verifySessionToken(token)` - Create/read signed HttpOnly session cookies.

## Current UX Progress

- Landing page: `/` introduces the customer and merchant value proposition, explains the main features, previews the commerce journey, and includes the current password + OTP login/signup flow for both customers and merchants.
- Customer entry: `/discover` opens with customer login/register. Both flows require password first and OTP second.
- Merchant entry: `/merchant/orders` opens with merchant login/register. Register includes the guided onboarding interview, then password + OTP account creation.
- Discover: search, suggestions, filters, category cards, merchant cards, product cards, and multi-merchant add-to-cart are working against local mock data.
- Cart: the bottom-right floating cart button opens saved carts grouped by merchant. Each merchant group can resume checkout independently while other store carts remain saved.
- Chat: only the recent chat list is displayed first. Selecting a chat opens a full-screen conversation detail within the app shell.
- Orders: only the recent order list is displayed first. Selecting an order opens a full-screen detail view within the app shell. The help button is intentionally a placeholder for now.
- Profile: customer personal information and order history are shown from the simulated session and mock order state.
- Merchant workspace: dashboard metrics, order queue, inventory view, and support preview are implemented as a scaffold for future deeper merchant tools.
- Merchant onboarding: registration now sends onboarding answers to the auth backend and returns them in the signed session. A production database should persist them as merchant profile, catalog draft, fulfilment settings, payment preferences, and trust-policy records.

## GitHub Issue Tracking

Shippable-product work is now tracked through GitHub issues rather than a README checklist. Use the issue workflow for opening, commenting on, and closing implementation tasks; keep this README focused on current app structure, capabilities, setup, and deployment notes.

## Data and Future Backend Swap Points

- Static catalog data currently lives in TypeScript data files under `src/features/commerce/data/`. These files are intentionally shaped like repository seed data so they can later be replaced by database reads or API responses.
- Customer auth sessions now use signed HttpOnly cookies. Cart and orders are still local browser state; the service functions in `services/cartService.ts` and `services/orderService.ts` are the intended boundaries for future authenticated API calls.
- Development auth users and OTP challenges are stored in `.data/auth-store.json`, which is ignored by git. This is not a production database.
- Mock payment and delivery adapters live behind provider-style service files. Production integrations should replace those files without forcing UI components to know payment or courier implementation details.
- Components now consume data through service/data modules instead of defining most UX content inline. This improves cohesion and makes the prototype easier to grow.

## Prototype Boundaries

Authentication now has frontend and backend route handlers, but the local user store and OTP delivery are still development-grade. Payments, AI parsing, fraud scoring, identity verification, courier tracking, disputes, merchant order management, customer memory, and help/support routing are simulated with local state and mock data. Real database persistence, real SMS/email OTP delivery, real Yango, real payment processing, real escrow, production AI credentials, and a backend order database are still required for production.
