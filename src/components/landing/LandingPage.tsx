'use client';

import Link from 'next/link';
import {useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {FiArrowRight, FiLogIn, FiUserPlus} from 'react-icons/fi';

import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {
  heroOrderPreview,
  landingFeatures,
  landingStats,
  landingSteps
} from '@/src/data/landingPage';
import {AuthFlow, type CommerceSession, type CommerceUserRole} from '@/src/features/commerce/components/AuthFlow';

const authPanelHref = '#access';

type LandingPageProps = {
  /** Preselects the auth panel's role, so `/?role=merchant` deep links still work. */
  initialRole?: CommerceUserRole;
};

export const LandingPage = ({initialRole = 'customer'}: LandingPageProps) => {
  const router = useRouter();

  const handleAuthComplete = useCallback(
    (session: CommerceSession) => {
      router.push(session.role === 'merchant' ? '/merchant/orders' : '/discover');
    },
    [router]
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate flex min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10 grid grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] max-lg:grid-cols-1">
          <div className="bg-background" />
          <div className="bg-primary max-lg:hidden" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,0.86fr)_minmax(420px,1.14fr)] gap-10 px-5 py-6 sm:px-8 lg:min-h-screen lg:px-10 lg:py-8 max-lg:grid-cols-1">
          <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between py-3">
            <header className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3" aria-label="AICOS home">
                <span className="grid size-10 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  AI
                </span>
                <span className="font-display text-lg font-semibold">AICOS Commerce</span>
              </Link>
              <Button asChild variant="outline" size="lg">
                <Link href={authPanelHref}>
                  <FiLogIn aria-hidden />
                  Login
                </Link>
              </Button>
            </header>

            <div className="max-w-3xl py-16 sm:py-20 lg:py-12">
              <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
                Conversational commerce for Zambia
              </p>
              <h1 className="mt-6 max-w-[12ch] font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.95]">
                Buy, sell, chat, fulfil.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                AICOS brings discovery, merchant conversations, protected checkout, multi-store carts, and order
                fulfilment into one focused web app for customers and local businesses.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={authPanelHref}>
                    <FiUserPlus aria-hidden />
                    Login or sign up
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={authPanelHref}>
                    Merchant setup
                    <FiArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4 max-sm:grid-cols-1">
                {landingStats.map((stat) => (
                  <div key={stat.label} className="border-l-2 border-primary/40 pl-4">
                    <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                    <dd className="mt-1 font-display text-xl font-semibold">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div id="access" className="flex min-h-[720px] scroll-mt-6 items-center lg:min-h-[calc(100vh-4rem)]">
            <AuthFlow
              initialRole={initialRole}
              title="Enter the commerce workspace"
              description="Use one secure account to shop with local merchants, or switch to merchant mode to set up your store and start managing orders."
              presentation="embedded"
              onComplete={handleAuthComplete}
              alternateAction={
                <p className="rounded-lg bg-primary-foreground/10 p-3 text-xs leading-5 text-primary-foreground/70">
                  Customers get discovery, chats, carts, checkout, and order tracking. Merchants get a guided setup
                  and a fulfilment dashboard.
                </p>
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-16 text-primary-foreground sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground/60">
              What happens inside
            </p>
            <h2 className="mt-3 max-w-md font-display text-3xl font-semibold leading-tight">
              A full buying journey without scattered messages and manual follow-ups.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/70">
              The app connects discovery, merchant conversations, multi-store cart progress, protected payment, and
              fulfilment updates so customers and sellers can stay aligned from first question to completed order.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {heroOrderPreview.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-3 transition hover:bg-primary-foreground/15"
                  style={{animation: `fade-in 0.35s ease-out ${index * 90}ms both`}}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-foreground text-primary">
                    <Icon aria-hidden size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-primary-foreground/60">{item.merchant}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-card px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-4">
          {landingFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="gap-0 rounded-lg border-border/50 bg-background p-4 shadow-none transition hover:border-primary/40"
              >
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon aria-hidden size={18} />
                </span>
                <h2 className="mt-4 font-display text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-foreground">How it starts</p>
            <h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight">
              From landing page to live commerce in a few clicks.
            </h2>
          </div>
          <div className="grid gap-3">
            {landingSteps.map((step, index) => (
              <Card
                key={step.title}
                className="gap-4 rounded-lg border-border/50 p-4 shadow-none md:grid md:grid-cols-[2.5rem_1fr]"
              >
                <span className="grid size-10 place-items-center rounded-md bg-foreground text-sm font-semibold text-background">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-display text-base font-semibold">{step.title}</span>
                  <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">{step.description}</span>
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
