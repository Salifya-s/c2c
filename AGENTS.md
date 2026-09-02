# C2C Coding Agent Instructions

These instructions collect the project rules and product direction given by the user. Any coding agent working in this repository should read this file before planning, editing, or running commands.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Direction

- This app is moving from prototype toward a shippable conversational commerce product.
- Build for two user types: customers and merchants.
- Keep the experience modern, clean, responsive, and full screen. Do not reintroduce the mobile phone shell.
- Customer navigation should include these main tabs: Discover, Chat, Orders, and Profile.
- Merchant tooling should follow the product specification and can start broad before being deepened in later passes.
- Prefer real working flows over static mockups. Mock only the parts explicitly marked as placeholders.

## Code Organization

- Organize files by responsibility: route handlers, server utilities, shared types, feature components, data fixtures, and reusable UI helpers should live in clear separate locations.
- Keep functions reusable where the same behavior may be needed by multiple screens or API routes.
- Refactor tightly coupled or low-cohesion code when touching the area. Avoid broad unrelated rewrites.
- Replace hardcoded UI/business data with maintainable data modules, fixture files, or store adapters that can later be swapped for database or API calls.
- For each data type, choose storage based on expected use:
  - Static reference data such as categories can live in typed fixture modules.
  - Prototype transactional data such as carts, orders, auth users, and sessions should go behind store functions.
  - Anything production-sensitive should be designed so the file-backed implementation can be replaced by a database adapter.
- Prefer typed interfaces for shared business objects such as users, merchants, orders, chats, cart groups, products, sessions, and OTP challenges.
- Use comments to explain non-obvious functions, variables, store adapters, and integration swap points. Comments should tell future agents what to replace with API calls, database queries, or provider integrations. Avoid comments that merely repeat obvious code.

## Auth And Security

- Complete login, registration, and onboarding for both customers and merchants on both frontend and backend.
- Required auth model: password plus OTP sent by mobile or email.
- Development-only auth/storage implementations must be clearly marked as such.
- Before production, replace local file stores and mock OTP delivery with a durable database and real SMS/email provider.
- Never hardcode secrets, tokens, PATs, OTP secrets, or provider credentials in committed files.
- Use environment variables for secrets. For GitHub CLI/API work, use an ephemeral `GITHUB_TOKEN` environment variable.
- Vercel production must define `AUTH_SESSION_SECRET`.

## Customer Experience Rules

- Discover should use category cards with appropriate hover transformation effects. Icons are acceptable placeholders until real assets are available.
- Chat should show only a list of recent merchant conversations. Remove standalone mock chat promo cards.
- Clicking a chat should open a full-screen conversation/detail view while preserving tabs and standard app controls.
- Orders should show a list of recent orders. Clicking an order should reveal full order details in a full-screen detail view while preserving tabs and standard app controls.
- Order details should include a help option for order problems, but that help flow should remain a mock button until explicitly implemented.
- Profile should show customer order history and personal information such as name, username, and mobile number.
- Add a floating cart button in the bottom-right corner with a quantity badge.
- Cart progress must be saved separately per merchant/store.
- Clicking the cart should show merchants with the quantity of products from each merchant.
- The cart flow should allow customers to fulfill orders from multiple merchants without losing each store's cart progress.

## Merchant Experience Rules

- Merchant onboarding should be simple enough for a non-technical person to complete in minutes.
- Ask enough friendly, direct questions to collect store/service details, fulfillment method, product/service type, contact channels, operating area, and payment preferences.
- Keep the merchant setup flow guided, conversational, and low-friction.
- Merchant-facing dashboards and setup screens should be implemented according to the product spec, with more detail added later.

## UI And Frontend Rules

- Keep the interface full screen and responsive across mobile, tablet, and desktop.
- Use the established font setup: Alata for headings and Google Sans for body text unless the user changes it.
- Use simulated loading screens, animations, and transitions where they make flows feel clearer.
- Prefer familiar controls and icons for actions. Use existing icon libraries when available.
- Ensure text fits within its containers on all viewport sizes.
- Keep layout dimensions stable for tabs, cards, lists, buttons, counters, and detail views so content changes do not cause jarring shifts.
- Do not add marketing-style landing pages unless explicitly requested.
- Do not add visible in-app instructional copy explaining features unless it is part of a natural workflow.

## GitHub Issue Workflow

- The user has created GitHub issues from the shippable-product checklist.
- Work should be tracked in GitHub issues instead of maintaining a README checklist.
- Before starting substantial work, identify the relevant issue. If none exists, open one.
- Comment progress and implementation notes directly on the issue as work progresses.
- Close an issue only after implementation and validation are complete.
- Reopen or comment on issues when follow-up work is discovered.
- Do not change git remotes, branches, or repository settings without confirming with the user first.

## README And Documentation

- Keep `README.md` current with major app changes.
- README updates should explain the current folder/file structure and what each major folder or file is responsible for.
- Do not use the README as the main task checklist now that GitHub issues are being used for tracking.

## Validation Before Handoff

- Run focused validation for the files or flows changed.
- For frontend work, check responsive behavior and key interactions in the browser when practical.
- For auth/backend changes, validate success and failure paths for register, login, OTP verification, session lookup, and logout.
- Report any tests or checks that could not be run.

## Deployment Notes

- Vercel should use the Next.js framework preset.
- Root Directory should be blank or `./` when the repository root contains the app.
- Output Directory should remain blank/default for this Next.js app. Do not set it to `public`.
- If Vercel reports missing Next.js or missing output directory, verify that the deployed commit contains `package.json` and the Next.js app files at the configured root.
