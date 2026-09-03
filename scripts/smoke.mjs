/**
 * Browser smoke walkthrough.
 *
 * Drives the running dev server through the real customer and merchant flows,
 * capturing a screenshot per step and collecting every console error, page
 * exception, and failed request along the way.
 *
 * This exists because type checks, lint, and inspecting the served HTML all
 * confirm that markup is correct without confirming that it renders or works.
 * A collapsed hero passed every one of those checks for several commits.
 *
 * Usage:
 *   npm run dev            # in one terminal
 *   npm run smoke          # in another
 *
 * Options:
 *   BASE_URL=http://localhost:3001 npm run smoke
 *   SMOKE_HEADED=1 npm run smoke     # watch it run
 *   SMOKE_OUT=./shots npm run smoke  # where screenshots land
 *
 * Uses the Chrome already installed on the machine via `channel: 'chrome'`, so
 * there is no separate Playwright browser download to manage.
 */
import {mkdir, rm} from 'node:fs/promises';
import path from 'node:path';

import {chromium} from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = path.resolve(process.env.SMOKE_OUT ?? '.smoke');
const HEADED = process.env.SMOKE_HEADED === '1';

/** Seeded dev accounts. Every seeded user shares this password. */
const DEMO_PASSWORD = 'password123';
const CUSTOMER_CONTACT = '+260977111001';
const MERCHANT_CONTACT = '+260966000014';

const results = [];
const problems = [];
let shotIndex = 0;

const record = (name, status, detail = '') => {
  results.push({name, status, detail});
  const icon = status === 'pass' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL';
  console.log(`  ${icon}  ${name}${detail ? ` - ${detail}` : ''}`);
};

const step = async (page, name, fn) => {
  try {
    const detail = await fn();
    await shoot(page, name);
    record(name, 'pass', detail ?? '');
    return true;
  } catch (error) {
    await shoot(page, `FAILED-${name}`);
    record(name, 'fail', error.message.split('\n')[0]);
    return false;
  }
};

const shoot = async (page, name) => {
  shotIndex += 1;
  const slug = String(shotIndex).padStart(2, '0') + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  await page.screenshot({path: path.join(OUT_DIR, `${slug}.png`), fullPage: true}).catch(() => undefined);
};

/** Completes the password + OTP pair, reading the development OTP off screen. */
const signIn = async (page, {contact, submitLabel}) => {
  await page.getByLabel('Mobile number or email').fill(contact);
  await page.getByLabel('Password', {exact: true}).fill(DEMO_PASSWORD);
  await page.getByRole('button', {name: submitLabel}).click();

  const otpNotice = page.getByText(/Development OTP:/i);
  await otpNotice.waitFor({timeout: 15000});
  const otp = (await otpNotice.innerText()).replace(/\D/g, '');
  if (otp.length !== 6) throw new Error(`could not read a 6-digit dev OTP, got "${otp}"`);

  await page.getByLabel('One-time code').fill(otp);
  await page.getByRole('button', {name: 'Verify'}).click();
  return `otp ${otp}`;
};

const run = async () => {
  await rm(OUT_DIR, {recursive: true, force: true});
  await mkdir(OUT_DIR, {recursive: true});

  const browser = await chromium.launch({channel: 'chrome', headless: !HEADED});
  const context = await browser.newContext({viewport: {width: 1280, height: 900}});
  const page = await context.newPage();

  const EXPECTED_NOISE = [
    // AuthFlow probes /api/auth/me on mount; anonymous visitors get a 401 and
    // the component handles it. Filtered so real errors are not buried.
    /401 \(Unauthorized\)/
  ];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (EXPECTED_NOISE.some((pattern) => pattern.test(text))) return;
    problems.push(`console: ${text.slice(0, 200)}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message.slice(0, 200)}`));
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? 'failed';
    // Chrome cancels in-flight image requests on navigation; not a defect.
    if (failure.includes('ERR_ABORTED')) return;
    problems.push(`request: ${failure} ${request.url().slice(0, 120)}`);
  });

  console.log(`\nSmoke walkthrough against ${BASE_URL}\n`);

  // --- Landing -------------------------------------------------------------
  await step(page, 'landing renders', async () => {
    await page.goto(BASE_URL, {waitUntil: 'networkidle'});
    const hero = page.locator('section').first();
    const box = await hero.boundingBox();
    if (!box || box.height < 500) throw new Error(`hero collapsed: height ${box?.height ?? 0}px`);
    await page.getByRole('heading', {name: /Describe your business/i}).waitFor();
    return `hero ${Math.round(box.height)}px`;
  });

  await step(page, 'landing images load', async () => {
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('img')].filter((img) => img.complete && img.naturalWidth === 0).length
    );
    const total = await page.locator('img').count();
    if (broken > 0) throw new Error(`${broken} of ${total} images failed to load`);
    return `${total} images ok`;
  });

  await step(page, 'faq accordion opens', async () => {
    const trigger = page.getByRole('button', {name: /What does it cost to open a store/i});
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.getByText(/Nothing to set up/i).waitFor({timeout: 5000});
    return 'first answer expanded';
  });

  await step(page, 'category carousel autoplays and pauses on hover', async () => {
    await page.goto(BASE_URL, {waitUntil: 'networkidle'});
    const carousel = page.getByRole('region', {name: /trade on Tantika/i});
    await carousel.scrollIntoViewIfNeeded();

    const activeDot = () =>
      carousel.locator('[role="tab"][aria-selected="true"]').first().getAttribute('aria-label');

    const before = await activeDot();
    await page.waitForTimeout(4500);
    const after = await activeDot();
    if (before === after) throw new Error(`carousel never advanced (stuck on "${before}")`);

    // Hovering a slide must stop autoplay and hold position.
    await carousel.getByRole('group').first().hover();
    const heldFrom = await activeDot();
    await page.waitForTimeout(4500);
    const heldTo = await activeDot();
    if (heldFrom !== heldTo) throw new Error('carousel kept advancing while hovered');

    return `advanced, then held on hover at "${heldTo}"`;
  });

  await step(page, 'hero generate seeds onboarding', async () => {
    await page.goto(BASE_URL, {waitUntil: 'networkidle'});
    const idea = 'A tailor in Kabulonga doing repairs';
    await page.getByLabel('Describe your business').fill(idea);
    await page.getByRole('button', {name: 'Generate'}).click();
    await page.waitForTimeout(1200);

    const merchantPressed = await page
      .getByRole('button', {name: 'Merchant'})
      .getAttribute('aria-pressed');
    if (merchantPressed !== 'true') throw new Error('merchant role was not preselected');

    const registerPressed = await page
      .getByRole('button', {name: 'register'})
      .getAttribute('aria-pressed');
    if (registerPressed !== 'true') throw new Error('register mode was not preselected');
    return 'merchant + register preselected';
  });

  // --- Customer flow -------------------------------------------------------
  await step(page, 'customer login', async () => {
    await page.goto(`${BASE_URL}/discover`, {waitUntil: 'networkidle'});
    const detail = await signIn(page, {contact: CUSTOMER_CONTACT, submitLabel: /Send customer login code/i});
    await page.getByRole('heading', {name: 'Discover'}).waitFor({timeout: 15000});
    return detail;
  });

  await step(page, 'customer tabs switch', async () => {
    for (const tab of ['Chat', 'Orders', 'Profile', 'Discover']) {
      await page.getByRole('navigation', {name: /sections/i}).getByRole('button', {name: tab}).click();
      await page.getByRole('heading', {name: tab, exact: true}).waitFor({timeout: 8000});
    }
    return 'discover, chat, orders, profile';
  });

  await step(page, 'cart drawer traps focus and closes on escape', async () => {
    await page.getByRole('button', {name: /Open cart/i}).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({timeout: 8000});

    const focusInside = await page.evaluate(() => {
      const dialogEl = document.querySelector('[role="dialog"]');
      return Boolean(dialogEl && document.activeElement && dialogEl.contains(document.activeElement));
    });
    if (!focusInside) throw new Error('focus was not moved into the drawer');

    await page.keyboard.press('Escape');
    await dialog.waitFor({state: 'hidden', timeout: 8000});
    return 'focus trapped, escape closed it';
  });

  await step(page, 'storefront product dialog', async () => {
    await page.goto(`${BASE_URL}/merchants/baked-tasha`, {waitUntil: 'networkidle'});
    await page.getByRole('button', {name: /^View /}).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({timeout: 8000});
    await page.keyboard.press('Escape');
    await dialog.waitFor({state: 'hidden', timeout: 8000});
    return 'opened and closed on escape';
  });

  await step(page, 'checkout wizard walks four steps', async () => {
    await page.goto(`${BASE_URL}/merchants/baked-tasha`, {waitUntil: 'networkidle'});
    await page.getByRole('button', {name: 'Add to cart'}).first().click();
    await page.getByRole('link', {name: 'Cart', exact: true}).click();
    await page.waitForURL(/\/checkout/, {timeout: 10000});

    for (const label of ['Continue', 'Continue', 'Continue']) {
      await page.getByRole('button', {name: label}).first().click();
      await page.waitForTimeout(350);
    }
    await page.getByRole('heading', {name: /Price breakdown/i}).waitFor({timeout: 8000});
    return 'reached the review step';
  });

  await step(page, 'checkout completes and lands on tracking', async () => {
    await page.getByRole('button', {name: /Complete simulated payment/i}).click();
    await page.waitForURL(/\/orders\/ZC-/, {timeout: 20000});
    await page.getByText('Completion PIN', {exact: true}).waitFor({timeout: 8000});
    return page.url().split('/').pop();
  });

  // --- Merchant flow -------------------------------------------------------
  await step(page, 'merchant login and dashboard', async () => {
    await context.clearCookies();
    await page.goto(`${BASE_URL}/merchant/orders`, {waitUntil: 'networkidle'});
    await page.getByRole('button', {name: 'Merchant'}).first().click();
    const detail = await signIn(page, {contact: MERCHANT_CONTACT, submitLabel: /Send merchant login code/i});
    await page.locator('h1', {hasText: 'Orders'}).first().waitFor({timeout: 15000});
    return detail;
  });

  await step(page, 'merchant views switch', async () => {
    for (const view of ['Inventory', 'Support', 'Orders']) {
      await page.getByRole('navigation', {name: /sections/i}).getByRole('button', {name: view}).click();
      await page.getByRole('heading', {name: view, exact: true}).waitFor({timeout: 8000});
    }
    return 'orders, inventory, support';
  });

  await browser.close();

  // --- Report --------------------------------------------------------------
  const failed = results.filter((r) => r.status === 'fail');
  console.log(`\n  screenshots: ${OUT_DIR}`);

  if (problems.length) {
    const unique = [...new Set(problems)];
    console.log(`\n  browser problems (${unique.length}):`);
    for (const problem of unique.slice(0, 15)) console.log(`    - ${problem}`);
  } else {
    console.log('\n  no console errors, page exceptions, or failed requests');
  }

  console.log(`\n  ${results.length - failed.length}/${results.length} steps passed\n`);
  process.exit(failed.length ? 1 : 0);
};

run().catch((error) => {
  console.error('\nsmoke run crashed:', error);
  process.exit(1);
});
