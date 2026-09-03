'use client';

import Image from 'next/image';
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
import {CategoryCarousel} from '@/src/components/landing/CategoryCarousel';
import {Reveal} from '@/src/components/landing/Reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/src/components/ui/accordion';
import {Button} from '@/src/components/ui/button';
import {Textarea} from '@/src/components/ui/textarea';
import {cn} from '@/src/lib/cn';
import {
  heroPromptExamples,
  landingBenefits,
  landingCategories,
  landingCoverageImage,
  landingFaqs,
  landingFeatures,
  landingFooterGroups,
  landingFooterLegal,
  landingHeroImage,
  landingImpactStats,
  landingMerchantImage,
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
  // AuthFlow seeds role, mode, and wizard answers from props on first render,
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
      {/* shrink-0 is load-bearing: this is a flex child, and `overflow-hidden`
          drops a flex item's automatic minimum size to zero, which let the whole
          hero collapse to a sliver. */}
      <section className="relative shrink-0 overflow-hidden px-5 py-20 sm:px-8 lg:py-24">
        {/* Layered brand wash: a vertical base plus two soft radial blooms, all
            behind the content and non-interactive. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-green-soft via-brand-teal-soft/50 to-card" />
          <div className="absolute -left-32 -top-40 size-[34rem] rounded-full bg-brand-green/20 blur-3xl" />
          <div className="absolute -right-40 -top-24 size-[38rem] rounded-full bg-brand-blue/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 size-[30rem] rounded-full bg-brand-teal/10 blur-3xl" />
        </div>

        <Reveal className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-card px-3 py-1 text-xs font-medium text-brand-teal">
            Fast commerce. Happy clients.
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
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
            <div className="rounded-lg border border-border bg-card p-2 shadow-sm focus-within:ring-[3px] focus-within:ring-brand-teal/30">
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
                className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground transition hover:border-brand-teal/40 hover:bg-brand-teal-soft hover:text-brand-teal focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {example}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto mt-14 max-w-5xl">
          <div className="relative aspect-[16/7] overflow-hidden rounded-lg border border-border/50">
            <Image
              src={landingHeroImage.src}
              alt={landingHeroImage.alt}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-brand-navy/75 via-brand-navy/15 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 text-background">
              <p className="max-w-md font-display text-lg font-semibold leading-snug">
                Sellers already take orders by phone. {BRAND_NAME} gives that a checkout.
              </p>
              <Button asChild size="sm" variant="secondary">
                <Link href={ACCESS_ANCHOR}>See how it works</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Categories: the colour and photography band. */}
      <section className="border-y border-border/50 bg-background px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl">
              Whatever you sell, it already fits
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Storefronts, carts, and delivery options adapt to the trade rather than the other way round.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-10">
            <CategoryCarousel categories={landingCategories} />
          </Reveal>
        </div>
      </section>

      {/* Benefits: three restrained columns. */}
      <section id="why" className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          {landingBenefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 90}>
              <span className="mb-4 block h-1 w-10 rounded-full bg-gradient-to-r from-brand-green to-brand-blue" />
              <h2 className="font-display text-lg font-semibold">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{benefit.description}</p>
            </Reveal>
          ))}
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-border/50 pt-10 max-sm:grid-cols-1">
          {landingStats.map((stat) => (
            <div key={stat.label} className="text-center max-sm:text-left">
              <dd className="font-display text-2xl font-semibold text-brand-teal">{stat.value}</dd>
              <dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Impact band: the page's strongest block of colour. */}
      <section className="bg-gradient-to-br from-brand-green via-brand-teal to-brand-blue px-5 py-16 text-background sm:px-8">
        <dl className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {landingImpactStats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80}>
              <dd className="font-display text-4xl font-semibold">{stat.value}</dd>
              <dt className="mt-2 text-sm leading-6 text-background/80">{stat.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Social proof. */}
      <section className="px-5 py-20 sm:px-8">
        <Reveal as="figure" className="mx-auto max-w-3xl text-center">
          <blockquote className="font-display text-xl leading-9 text-brand-navy sm:text-2xl">
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

      {/* Merchant spotlight: image beside copy. */}
      <section id="merchants" className="border-y border-border/50 bg-background px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/50">
              <Image
                src={landingMerchantImage.src}
                alt={landingMerchantImage.alt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl">
              Built for sellers, not for software teams
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Setup asks plain questions about the trade: what you sell, where you are, how customers collect, and how
              you want to be paid. There is nothing to configure and nothing to install.
            </p>
            <ul className="mt-6 grid gap-3">
              {landingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-brand-teal-soft text-brand-teal">
                      <Icon aria-hidden size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs leading-6 text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Numbered walkthrough beside the marketplace photograph. */}
      <section id="how" className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="max-w-md font-display text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl">
              From a single sentence to a completed order
            </h2>
            <ol className="mt-8 grid gap-6">
              {landingSteps.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 90} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue text-sm font-semibold text-background">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border/50">
              <Image
                src={landingCoverageImage.src}
                alt={landingCoverageImage.alt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ. */}
      <section className="border-t border-border/50 bg-background px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl">
              Questions sellers ask first
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-8">
            <Accordion type="single" collapsible className="w-full">
              {landingFaqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Access: login and onboarding, immediately before the footer. */}
      <section id="access" className="scroll-mt-16 border-t border-border/50 px-5 py-20 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold leading-tight text-brand-navy sm:text-3xl">
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
  <footer className="mt-auto bg-brand-navy px-5 py-16 text-background sm:px-8">
    <div className="mx-auto max-w-6xl">
      <Logo tone="inverse" withTagline className="mb-10" />

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
              <span
                className="grid size-8 place-items-center rounded-full bg-background/10 text-background/70"
                title={label}
              >
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
