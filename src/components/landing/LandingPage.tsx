'use client';

import Link from 'next/link';
import {useCallback, useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  FiArrowRight,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiTwitter
} from 'react-icons/fi';

import {BRAND_NAME, Logo} from '@/src/components/brand/Logo';
import {Reveal} from '@/src/components/landing/Reveal';
import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {Textarea} from '@/src/components/ui/textarea';
import {cn} from '@/src/lib/cn';
import {
  heroOrderPreview,
  heroPromptExamples,
  landingBenefits,
  landingFeatures,
  landingFooterGroups,
  landingFooterLegal,
  landingMerchantLogos,
  landingNavLinks,
  landingStats,
  landingSteps,
  landingTestimonial
} from '@/src/data/landingPage';
import {AuthFlow, type CommerceSession, type CommerceUserRole} from '@/src/features/commerce/components/AuthFlow';

const ACCESS_ANCHOR = '#access';
const STORE_IDEA_LIMIT = 100;

type AuthMode = 'login' | 'register';

type LandingPageProps = {
  /** Preselects the auth panel's role, so `/?role=merchant` deep links still work. */
  initialRole?: CommerceUserRole;
};

export const LandingPage = ({initialRole = 'customer'}: LandingPageProps) => {
  const router = useRouter();

  const [storeIdea, setStoreIdea] = useState('');
  const [authRole, setAuthRole] = useState<CommerceUserRole>(initialRole);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [seededIdea, setSeededIdea] = useState('');
  // AuthFlow seeds its role, mode, and wizard answers from props on first render,
  // so changing them later needs a remount rather than a re-render.
  const [authInstance, setAuthInstance] = useState(0);

  const handleAuthComplete = useCallback(
    (session: CommerceSession) => {
      router.push(session.role === 'merchant' ? '/merchant/orders' : '/discover');
    },
    [router]
  );

  const openAuth = useCallback((role: CommerceUserRole, mode: AuthMode, idea = '') => {
    setAuthRole(role);
    setAuthMode(mode);
    setSeededIdea(idea);
    setAuthInstance((current) => current + 1);
    document.getElementById('access')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-card text-foreground">
      <SiteHeader onStartFree={() => openAuth('merchant', 'register')} />

      {/* Hero: describe a store, and drop straight into merchant onboarding with it. */}
      <section className="border-b border-border/50 px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Describe your business. Start selling today.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {BRAND_NAME} turns one sentence into a working storefront for Zambian sellers, with chat, multi-store carts,
            protected checkout, and delivery tracking already connected.
          </p>

          <form
            className="mx-auto mt-9 max-w-2xl text-left"
            onSubmit={(event) => {
              event.preventDefault();
              openAuth('merchant', 'register', storeIdea);
            }}
          >
            <div className="rounded-lg border border-border bg-card p-2 shadow-sm focus-within:ring-[3px] focus-within:ring-ring/50">
              <Textarea
                value={storeIdea}
                onChange={(event) => setStoreIdea(event.target.value.slice(0, STORE_IDEA_LIMIT))}
                maxLength={STORE_IDEA_LIMIT}
                rows={2}
                aria-label="Describe your business"
                placeholder="A bakery in Roma selling birthday cakes and party bakes"
                className="resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center justify-between gap-3 px-2 pb-1">
                <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
                  {storeIdea.length}/{STORE_IDEA_LIMIT}
                </span>
                <Button type="submit" size="lg">
                  Generate
                  <FiArrowRight aria-hidden />
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {heroPromptExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setStoreIdea(example.slice(0, STORE_IDEA_LIMIT))}
                className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {example}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Preview tiles standing in for the generated-store screenshots. */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroOrderPreview.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="gap-0 rounded-lg border-border/50 p-4 shadow-none"
                style={{animation: `fade-in 0.35s ease-out ${index * 90}ms both`}}
              >
                <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon aria-hidden size={17} />
                </span>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.merchant}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits: three restrained columns, no cards. */}
      <section id="why" className="bg-background px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          {landingBenefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 90}>
              <h2 className="font-display text-lg font-semibold">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{benefit.description}</p>
            </Reveal>
          ))}
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-border/50 pt-10 max-sm:grid-cols-1">
          {landingStats.map((stat) => (
            <div key={stat.label} className="text-center max-sm:text-left">
              <dd className="font-display text-2xl font-semibold">{stat.value}</dd>
              <dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Social proof: one quote, then the seeded stores as a logo row. */}
      <section className="px-5 py-20 sm:px-8">
        <Reveal as="figure" className="mx-auto max-w-3xl text-center">
          <blockquote className="font-display text-xl leading-9 sm:text-2xl">
            &ldquo;{landingTestimonial.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{landingTestimonial.author}</span> - {landingTestimonial.role}
          </figcaption>
        </Reveal>

        <ul className="mx-auto mt-14 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {landingMerchantLogos.map((logo) => (
            <li key={logo} className="font-display text-sm font-semibold text-muted-foreground">
              {logo}
            </li>
          ))}
        </ul>
      </section>

      {/* Features: card grid, each linking into the product. */}
      <section id="merchants" className="border-y border-border/50 bg-background px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="max-w-xl font-display text-2xl font-semibold leading-tight sm:text-3xl">
            All that you need to help you start selling
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {landingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={index * 80}>
                <Card className="gap-0 h-full rounded-lg border-border/50 bg-card p-5 shadow-none">
                  <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon aria-hidden size={18} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Numbered walkthrough. This is the one section beyond Shopify's structure. */}
      <section id="how" className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <h2 className="max-w-sm font-display text-2xl font-semibold leading-tight sm:text-3xl">
            From a single sentence to a completed order
          </h2>
          <ol className="grid gap-6">
            {landingSteps.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 90} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="grid size-10 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Access: login and onboarding, immediately before the footer. */}
      <section id="access" className="scroll-mt-16 border-t border-border/50 bg-background px-5 py-20 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
            Start selling, or sign in and keep shopping
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            One account covers both sides of the marketplace. Customers land in discovery, merchants land in the
            fulfilment dashboard.
          </p>
        </Reveal>

        <div className="mx-auto mt-10 max-w-5xl">
          <AuthFlow
            key={authInstance}
            initialRole={authRole}
            initialMode={authMode}
            initialStoreIdea={seededIdea}
            title="Enter the commerce workspace"
            description="Use one secure account to shop with local merchants, or switch to merchant mode to set up your store and start managing orders."
            presentation="embedded"
            onComplete={handleAuthComplete}
            alternateAction={
              <p className="rounded-lg bg-primary-foreground/10 p-3 text-xs leading-5 text-primary-foreground/70">
                Customers get discovery, chats, carts, checkout, and order tracking. Merchants get a guided setup and a
                fulfilment dashboard.
              </p>
            }
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

const SiteHeader = ({onStartFree}: {onStartFree: () => void}) => (
  <header className="sticky top-0 z-40 border-b border-border/50 bg-card/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
      <Link href="/" aria-label={`${BRAND_NAME} home`}>
        <Logo size="sm" />
      </Link>

      <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
        {landingNavLinks.map((link) => (
          <Button key={link.href} asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href={ACCESS_ANCHOR}>Login</Link>
        </Button>
        <Button type="button" size="sm" onClick={onStartFree}>
          Start for free
        </Button>
      </div>
    </div>
  </header>
);

const SiteFooter = () => (
  <footer className="mt-auto bg-foreground px-5 py-16 text-background sm:px-8">
    <div className="mx-auto max-w-6xl">
      <Logo tone="inverse" className="mb-10" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {landingFooterGroups.map((group) => (
          <div key={group.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-background/60">{group.heading}</h2>
            <ul className="mt-4 grid gap-2.5">
              {group.links.map((link) => (
                <li key={`${group.heading}-${link.label}`}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-background/80 transition hover:text-background',
                      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-background/15 pt-8">
        <p className="text-xs text-background/60">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. Prototype for Zambian conversational commerce.
        </p>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {landingFooterLegal.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="text-xs text-background/60 transition hover:text-background">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex items-center gap-3">
          {[
            {Icon: FiTwitter, label: `${BRAND_NAME} on X`},
            {Icon: FiInstagram, label: `${BRAND_NAME} on Instagram`},
            {Icon: FiFacebook, label: `${BRAND_NAME} on Facebook`},
            {Icon: FiLinkedin, label: `${BRAND_NAME} on LinkedIn`}
          ].map(({Icon, label}) => (
            <li key={label}>
              <span className="grid size-8 place-items-center rounded-full bg-background/10 text-background/70" title={label}>
                <Icon aria-hidden size={15} />
                <span className="sr-only">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);
