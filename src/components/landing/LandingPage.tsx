'use client';

import Link from 'next/link';
import {useCallback} from 'react';
import {useRouter} from 'next/navigation';
import { FiArrowRight, FiLogIn, FiUserPlus } from 'react-icons/fi';

import {
  heroOrderPreview,
  landingFeatures,
  landingStats,
  landingSteps
} from '@/src/data/landingPage';
import {AuthFlow, type CommerceSession} from '@/src/features/commerce/components/AuthFlow';

const authPanelHref = '#access';
const merchantHref = '#access';

export const LandingPage = () => {
  const router = useRouter();

  const handleAuthComplete = useCallback(
    (session: CommerceSession) => {
      router.push(session.role === 'merchant' ? '/merchant/orders' : '/discover');
    },
    [router]
  );

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-ink">
      <section className="relative isolate flex min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10 grid grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] max-lg:grid-cols-1">
          <div className="bg-[#f7f8f4]" />
          <div className="bg-zam-green-900 max-lg:hidden" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,0.86fr)_minmax(420px,1.14fr)] gap-10 px-5 py-6 sm:px-8 lg:min-h-screen lg:px-10 lg:py-8 max-lg:grid-cols-1">
          <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between py-3">
            <header className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3" aria-label="AICOS home">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zam-green-900 text-base font-black text-white">
                  AI
                </span>
                <span className="font-display text-lg font-black text-ink">AICOS Commerce</span>
              </Link>
              <Link
                href={authPanelHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink-5 bg-white px-4 text-sm font-bold text-ink transition hover:border-zam-green-400 hover:text-zam-green-800"
              >
                <FiLogIn aria-hidden size={16} />
                Login
              </Link>
            </header>

            <div className="max-w-3xl py-16 sm:py-20 lg:py-12">
              <p className="inline-flex rounded-full border border-zam-green-200 bg-white px-4 py-2 text-sm font-bold text-zam-green-800 shadow-zam-sm">
                Conversational commerce for Zambia
              </p>
              <h1 className="mt-6 max-w-[12ch] font-display text-[clamp(3.2rem,9vw,7.5rem)] font-black leading-[0.92] tracking-normal text-ink">
                Buy, sell, chat, fulfil.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-3">
                AICOS brings discovery, merchant conversations, protected checkout, multi-store carts, and order fulfilment into one focused web app for customers and local businesses.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={authPanelHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-zam-green-800 px-6 text-sm font-black text-white shadow-zam-md transition hover:-translate-y-0.5 hover:bg-zam-green-700"
                >
                  <FiUserPlus aria-hidden size={17} />
                  Login or sign up
                </Link>
                <Link
                  href={merchantHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink-5 bg-white px-6 text-sm font-black text-ink transition hover:-translate-y-0.5 hover:border-zam-amber-400 hover:text-zam-amber-700"
                >
                  Merchant setup
                  <FiArrowRight aria-hidden size={17} />
                </Link>
              </div>

              <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-3 max-sm:grid-cols-1">
                {landingStats.map((stat) => (
                  <div key={stat.label} className="border-l-2 border-zam-green-400 pl-4">
                    <dt className="text-sm font-semibold text-ink-3">{stat.label}</dt>
                    <dd className="mt-1 font-display text-2xl font-black text-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div id="access" className="flex min-h-[720px] scroll-mt-6 items-center lg:min-h-[calc(100vh-4rem)]">
            <AuthFlow
              initialRole="customer"
              title="Enter the commerce workspace"
              description="Use one secure account to shop with local merchants, or switch to merchant mode to set up your store and start managing orders."
              presentation="embedded"
              onComplete={handleAuthComplete}
              alternateAction={
                <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/70">
                  Customers get discovery, chats, carts, checkout, and order tracking. Merchants get a guided setup and a fulfilment dashboard.
                </div>
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-zam-green-900 px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-zam-green-100">What happens inside</p>
            <h2 className="mt-3 max-w-md font-display text-4xl font-black leading-tight">
              A full buying journey without scattered messages and manual follow-ups.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
              The app connects discovery, merchant conversations, multi-store cart progress, protected payment, and fulfilment updates so customers and sellers can stay aligned from first question to completed order.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {heroOrderPreview.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.12]"
                  style={{animation: `fade-in 0.35s ease-out ${index * 90}ms both`}}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-zam-green-800">
                    <Icon aria-hidden size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black">{item.label}</span>
                    <span className="mt-1 block truncate text-xs text-white/55">{item.merchant}</span>
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-zam-green-400" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-ink-5 bg-white px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
          {landingFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-ink-5 bg-[#fbfcf8] p-5 transition hover:-translate-y-1 hover:border-zam-green-200 hover:shadow-zam-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zam-green-50 text-zam-green-800">
                  <Icon aria-hidden size={20} />
                </span>
                <h2 className="mt-5 font-display text-xl font-black text-ink">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink-3">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f7f8f4] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-zam-amber-700">How it starts</p>
            <h2 className="mt-3 max-w-sm font-display text-4xl font-black leading-tight text-ink">
              From landing page to live commerce in a few clicks.
            </h2>
          </div>
          <div className="grid gap-4">
            {landingSteps.map((step, index) => (
              <div key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 rounded-2xl bg-white p-5 shadow-zam-sm">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-sm font-black text-white">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-display text-lg font-black text-ink">{step.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-ink-3">{step.description}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
