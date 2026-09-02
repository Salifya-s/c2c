# GitHub Issues - Shippable Product Roadmap

Generated from the **Shippable Product Checklist** in `README.md`. These issues can be copied directly into GitHub Issues or imported via automation tools.

---

## 1. [Auth] Replace file-backed auth store with PostgreSQL / Prisma ORM & migrations

**Labels:** `backend`, `database`, `authentication`  
**Priority:** `P0 - High`

### Description
Currently, user authentication records and OTP challenges are stored in local JSON files (`.data/auth-store.json`). Before launching to production, this file-backed store must be replaced with a durable PostgreSQL database managed via Prisma ORM.

### Acceptance Criteria
- [ ] Set up Prisma ORM with PostgreSQL schema for `User`, `Account`, `Session`, and `OtpChallenge`.
- [ ] Migrate `AuthUserRecord` and `MerchantOnboardingAnswers` structures to database models.
- [ ] Replace `src/features/commerce/server/auth/store.ts` file reads/writes with Prisma client repository calls.
- [ ] Provide database migration scripts for staging and production deployment.

---

## 2. [Auth] Integrate production SMS & Email providers for OTP delivery

**Labels:** `backend`, `authentication`, `integrations`  
**Priority:** `P0 - High`

### Description
The current OTP delivery mechanism logs development codes to the console (`src/features/commerce/server/auth/otpDelivery.ts`). We need to integrate real SMS gateways (e.g. Twilio, Africa's Talking) and Email services (e.g. Resend, SendGrid) to deliver 6-digit verification codes.

### Acceptance Criteria
- [ ] Add provider adapters for SMS (Twilio / Africa's Talking) for Zambian phone numbers (`+260`).
- [ ] Add provider adapter for Email OTP delivery (Resend / SendGrid).
- [ ] Implement fallback logic and retry strategy for failed message deliveries.
- [ ] Environment variables configured securely for production API keys.

---

## 3. [Security] Implement rate limiting and brute-force protection for Auth & OTP endpoints

**Labels:** `security`, `backend`, `api`  
**Priority:** `P0 - High`

### Description
Protect `/api/auth/login/start`, `/api/auth/register/start`, and `/api/auth/verify-otp` against brute-force attacks, credential stuffing, and SMS abuse.

### Acceptance Criteria
- [ ] Add IP-based and user-based rate limiting middleware (e.g., Upstash Redis or memory-sliding window).
- [ ] Limit OTP requests to max 3 requests per phone number/email per 10 minutes.
- [ ] Limit OTP verification attempts to max 5 failed attempts per challenge.
- [ ] Return standard `429 Too Many Requests` responses with `Retry-After` headers.

---

## 4. [Auth] Implement Password Reset and Self-Service Account Recovery Flow

**Labels:** `authentication`, `frontend`, `backend`  
**Priority:** `P1 - Medium`

### Description
Users currently have no self-service mechanism to reset forgotten passwords or recover their accounts.

### Acceptance Criteria
- [ ] Create `/auth/forgot-password` route and user interface.
- [ ] Implement backend API route to issue password reset OTP/tokens.
- [ ] Create `/auth/reset-password` form allowing password update upon OTP verification.
- [ ] Invalidate all existing active sessions when a password reset occurs.

---

## 5. [Auth] Add Contact Verification Status and Contact-Change Verification Flow

**Labels:** `authentication`, `backend`, `security`  
**Priority:** `P1 - Medium`

### Description
Track whether a user's mobile number or email address has been verified and require multi-factor confirmation before allowing users to update their contact details.

### Acceptance Criteria
- [ ] Add `emailVerifiedAt` and `mobileVerifiedAt` timestamp columns to the user database schema.
- [ ] Build contact modification UI in `/discover` (Profile tab) and `/merchant/orders`.
- [ ] Require OTP verification on the *new* contact detail before committing the change.

---

## 6. [Security] Implement Next.js Middleware and RBAC for Protected Routes

**Labels:** `security`, `frontend`, `middleware`  
**Priority:** `P0 - High`

### Description
Restricted pages (such as `/merchant/orders` and `/checkout`) should enforce strict Role-Based Access Control (RBAC) via Next.js middleware rather than relying solely on client-side state checks.

### Acceptance Criteria
- [ ] Create Next.js `middleware.ts` to inspect signed HTTP-only session cookies.
- [ ] Protect `/merchant/*` routes so only authenticated `merchant` users can access.
- [ ] Redirect unauthenticated requests to `/auth` or trigger login modal.

---

## 7. [Commerce] Migrate Client LocalStorage Carts and Orders to Authenticated Backend Records

**Labels:** `backend`, `database`, `commerce`  
**Priority:** `P0 - High`

### Description
Cart items and order history currently rely on `localStorage` (`cartService.ts` & `orderService.ts`). These must be stored in the database so users can access their cart and order history across multiple devices.

### Acceptance Criteria
- [ ] Create `Cart`, `CartItem`, and `Order` tables in the database schema.
- [ ] Implement `/api/cart` routes (GET, POST, PUT, DELETE) to sync cart lines for authenticated users.
- [ ] Implement `/api/orders` routes to fetch historical orders and active escrow statuses.
- [ ] Provide client-side sync strategy when an unauthenticated guest logs in.

---

## 8. [Payments] Integrate Production Payment Gateway & Escrow Compliance Engine

**Labels:** `payments`, `compliance`, `integrations`  
**Priority:** `P0 - High`

### Description
Replace the mock payment provider (`mockPaymentProvider.ts`) with production payment gateways (Mobile Money MTN/Airtel/Zamtel, Visa/Mastercard via DPO or Flutterwave) and implement escrow hold logic.

### Acceptance Criteria
- [ ] Integrate Mobile Money payment APIs (MTN MoMo, Airtel Money).
- [ ] Implement escrow vault holding mechanism: payment is held safely until customer PIN is entered upon delivery.
- [ ] Implement webhook handlers for async payment status notifications.
- [ ] Add compliance audit logging for all transaction states.

---

## 9. [Logistics] Integrate Real Delivery Provider API (Yango Delivery / Local Couriers)

**Labels:** `logistics`, `integrations`, `backend`  
**Priority:** `P1 - Medium`

### Description
Replace `mockYangoProvider.ts` with live courier dispatch APIs to get real-time delivery quotes, schedule driver pickups, and receive live GPS tracking updates.

### Acceptance Criteria
- [ ] Connect Yango Delivery / local courier API credentials in server environment variables.
- [ ] Implement real delivery fee quotes based on merchant and customer coordinates.
- [ ] Webhook integration for real-time driver assignment, pickup, and delivery events.

---

## 10. [Merchant OS] Build Full Catalog Management (Products, Pricing, Inventory & Media Uploads)

**Labels:** `merchant-os`, `frontend`, `backend`  
**Priority:** `P0 - High`

### Description
Merchants currently view static seed products. Build a complete Merchant OS catalog editor so store owners can manage their products, pricing, stock levels, variants, and product images.

### Acceptance Criteria
- [ ] Product creation and edit forms in `/merchant/orders` (or `/merchant/catalog`).
- [ ] Image upload functionality backed by cloud storage (AWS S3 / Cloudinary / Vercel Blob).
- [ ] Inventory management: track stock counts, out-of-stock toggles, and low-stock alerts.
- [ ] Category and variant configuration (sizes, colors, custom add-ons).

---

## 11. [Customer Support] Implement Dispute Management, Evidence Upload & Escalation Workflow

**Labels:** `support`, `escrow`, `fullstack`  
**Priority:** `P1 - Medium`

### Description
Expand the placeholder help/support button on `/orders/[orderId]` into a full dispute resolution suite for buyer protection.

### Acceptance Criteria
- [ ] Dispute submission modal with issue category selection (Non-delivery, Damaged item, Wrong item).
- [ ] Evidence upload feature allowing buyers and merchants to attach photos/receipts.
- [ ] Support dashboard for platform admin/agent to review disputes, issue refunds, or release escrow funds.

---

## 12. [Compliance] Implement System-Wide Audit Logging & Security Trail

**Labels:** `compliance`, `security`, `backend`  
**Priority:** `P1 - Medium`

### Description
Record immutable audit logs for sensitive operations including authentication attempts, payout requests, escrow fund releases, catalog changes, and administrative actions.

### Acceptance Criteria
- [ ] Create `AuditLog` database schema with action type, actor ID, IP address, timestamp, and metadata payload.
- [ ] Instrument auth, payment, order release, and merchant account actions with audit logging.
- [ ] Ensure audit log entries are read-only and indexed for security audits.

---

## 13. [DevOps] Set Up Observability Stack (Sentry, Pino Logging, OpenTelemetry)

**Labels:** `devops`, `infrastructure`, `observability`  
**Priority:** `P1 - Medium`

### Description
Establish production observability for error monitoring, structured server logs, API performance metrics, and service health checks.

### Acceptance Criteria
- [ ] Integrate Sentry for automatic frontend and backend error tracking.
- [ ] Replace standard `console.log` statements with structured JSON logger (e.g. Pino).
- [ ] Add `/api/health` health-check endpoint for uptime monitoring services.

---

## 14. [Testing] Implement Automated E2E & Integration Test Suite

**Labels:** `testing`, `qa`, `ci-cd`  
**Priority:** `P1 - Medium`

### Description
Expand `scripts/commerce-tests.mjs` into a comprehensive automated test suite covering critical customer and merchant user flows using Playwright and Vitest.

### Acceptance Criteria
- [ ] Vitest suite for server-side auth logic, pricing calculations, and database repositories.
- [ ] Playwright E2E tests for registration, product discovery, checkout flow, and order tracking.
- [ ] Configure GitHub Actions workflow to run test suite on every pull request.

---

## 15. [Security & Compliance] Perform Privacy Audit, PII Protection & Data Retention Enforcement

**Labels:** `security`, `compliance`, `privacy`  
**Priority:** `P0 - High`

### Description
Perform a comprehensive privacy and security audit on customer PII, session storage, cookie attributes, and data retention policies in accordance with Zambian data protection regulations.

### Acceptance Criteria
- [ ] Ensure all session cookies use `HttpOnly`, `Secure`, `SameSite=Lax`.
- [ ] Encrypt sensitive customer PII (delivery addresses, contact numbers) at rest.
- [ ] Define data retention rules and automated cleanup jobs for expired OTP challenges and transient sessions.
