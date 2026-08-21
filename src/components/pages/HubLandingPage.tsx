import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import ChatDemo from '@/components/hub/ChatDemo';
import EscrowFlow from '@/components/hub/EscrowFlow';
import FeaturesTabs from '@/components/hub/FeaturesTabs';
import HeroChat from '@/components/hub/HeroChat';
import {Card} from '@/src/components/ui/Card';
import {SectionHeading} from '@/src/components/ui/SectionHeading';
import {uiIcons} from '@/lib/iconography';

const problemCardConfig = [
  {icon: uiIcons.chat, bgClass: 'bg-zam-amber-50', key: 'scatteredChannels'},
  {icon: uiIcons.bolt, bgClass: 'bg-[#fde8e8]', key: 'slowResponseTimes'},
  {icon: uiIcons.lock, bgClass: 'bg-[#e8f3fd]', key: 'transactionTrust'},
  {icon: uiIcons.package, bgClass: 'bg-[#f0fce8]', key: 'fulfilmentStructure'}
] as const;

const stackItemKeys = ['frontend', 'styling', 'state', 'routing', 'backend', 'hosting', 'payments', 'data'] as const;

const timelineConfig = [
  {
    accentClass: 'text-zam-green-700',
    bgClass: 'bg-zam-green-50',
    borderClass: 'border-zam-green-200',
    key: 'weekOne'
  },
  {
    accentClass: 'text-zam-amber-600',
    bgClass: 'bg-zam-amber-50',
    borderClass: 'border-zam-amber-200',
    key: 'weekTwo'
  },
  {
    accentClass: 'text-[#7c3dbf]',
    bgClass: 'bg-[#f5f0fa]',
    borderClass: 'border-[#d4b8f0]',
    key: 'weekThree'
  }
] as const;

const OpenAppIcon = uiIcons.customer;
const AuthIcon = uiIcons.profile;

export const HubLandingPage = async () => {
  const t = await getTranslations('hub');

  return (
    <div className="bg-cream font-sans leading-relaxed text-ink">
      <nav className="fixed inset-x-0 top-0 z-[100] flex h-16 items-center gap-6 border-b border-ink-5 bg-cream/95 px-8 backdrop-blur-[12px]">
        <Link href="/hub" className="mr-auto font-display text-xl font-extrabold tracking-tight text-zam-green-800 no-underline">
          Zam<span className="text-zam-amber-500">Comm</span>
        </Link>
        <a href="#features" className="hidden text-sm font-medium text-ink-3 transition hover:text-zam-green-700 md:inline">
          {t('features.label')}
        </a>
        <a href="#chat-demo" className="hidden text-sm font-medium text-ink-3 transition hover:text-zam-green-700 md:inline">
          {t('chatDemo.label')}
        </a>
        <a href="#escrow" className="hidden text-sm font-medium text-ink-3 transition hover:text-zam-green-700 md:inline">
          {t('escrow.label')}
        </a>
        <a href="#timeline" className="hidden text-sm font-medium text-ink-3 transition hover:text-zam-green-700 md:inline">
          {t('timeline.label')}
        </a>
        <Link href="/auth" className="hidden items-center gap-2 text-sm font-medium text-ink-3 transition hover:text-zam-green-700 sm:inline-flex">
          <AuthIcon size={14} />
          <span>{t('footer.previewAuth')}</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-pill bg-[linear-gradient(135deg,#d4830a,#e89c1f)] px-5 py-2 text-[0.85rem] font-bold text-white shadow-[0_2px_8px_rgba(212,131,10,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(212,131,10,0.4)] sm:inline-flex"
        >
          <OpenAppIcon size={15} />
          <span>{t('footer.launchCustomerApp')}</span>
        </Link>
        <a href="#chat-demo" className="rounded-pill bg-zam-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zam-green-700">
          {t('chatDemo.label')}
        </a>
      </nav>

      <section className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 px-8 pb-16 pt-[calc(4rem+4rem)] md:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zam-green-200 bg-zam-green-50 px-3.5 py-1.5 text-sm font-semibold text-zam-green-700">
            <span className="h-[7px] w-[7px] rounded-full bg-zam-green-400 animate-[pulse-dot_1.8s_ease-in-out_infinite]" />
            {t('hero.badge')}
          </div>
          <h1 className="mb-5 font-display text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
            {t('hero.titleLineOne')}
            <br />
            <em className="relative not-italic text-zam-green-700">
              {t('hero.titleHighlight')}
              <span className="absolute inset-x-0 -bottom-[3px] h-1 rounded-sm bg-zam-amber-400" />
            </em>
          </h1>
          <p className="max-w-[52ch] text-lg leading-relaxed text-ink-3">{t('hero.description')}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill bg-zam-green-800 px-6 py-3 text-[0.9rem] font-semibold text-white transition hover:bg-zam-green-700"
            >
              <OpenAppIcon size={15} />
              <span>{t('hero.openCustomerApp')}</span>
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-pill border border-zam-green-800 px-6 py-3 text-[0.9rem] font-semibold text-zam-green-800 transition hover:bg-zam-green-50"
            >
              <AuthIcon size={14} />
              <span>{t('hero.previewAuthFlow')}</span>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-pill border border-zam-green-800 px-6 py-3 text-[0.9rem] font-semibold text-zam-green-800 transition hover:bg-zam-green-50"
            >
              {t('hero.exploreFeatures')}
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              {value: '3', label: t('stats.userTypes')},
              {value: '3 wk', label: t('stats.timeline')},
              {value: '0', label: t('stats.sellerTouchpoints')}
            ].map((stat) => (
              <Card key={stat.label} className="rounded-xl px-5 py-4">
                <div className="font-display text-[1.75rem] font-extrabold leading-none text-zam-green-700">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-sm text-ink-3">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
        <div className="hidden md:block">
          <HeroChat />
        </div>
      </section>

      <div className="border-y border-ink-5 bg-white">
        <section className="mx-auto max-w-[1120px] px-8 py-20">
          <SectionHeading labelKey="label" namespace="hub.problem" titleKey="title" />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {problemCardConfig.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.key} className="rounded-[20px] p-6">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg text-[1.3rem] ${card.bgClass}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-ink">
                    {t(`problem.cards.${card.key}.title`)}
                  </h3>
                  <p className="text-[0.875rem] text-ink-3">
                    {t(`problem.cards.${card.key}.description`)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto max-w-[1120px] px-8 py-20">
        <SectionHeading labelKey="label" namespace="hub.features" titleKey="title" />
        <FeaturesTabs />
      </section>

      <div className="border-y border-ink-5 bg-white">
        <section id="chat-demo" className="mx-auto max-w-[1120px] px-8 py-20">
          <SectionHeading labelKey="label" namespace="hub.chatDemo" titleKey="title" />
          <ChatDemo />
        </section>
      </div>

      <div className="bg-zam-green-900">
        <section id="escrow" className="mx-auto max-w-[1120px] px-8 py-20">
          <SectionHeading
            descriptionKey="description"
            labelKey="label"
            namespace="hub.escrow"
            titleKey="title"
          />
          <EscrowFlow />
        </section>
      </div>

      <section className="mx-auto max-w-[1120px] px-8 py-20">
        <SectionHeading labelKey="label" namespace="hub.stack" titleKey="title" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stackItemKeys.map((itemKey) => (
            <Card key={itemKey} className="rounded-xl p-5">
              <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-zam-amber-600">
                {t(`stack.items.${itemKey}.category`)}
              </div>
              <div className="font-display text-base font-bold text-ink">
                {t(`stack.items.${itemKey}.name`)}
              </div>
              <div className="mt-1.5 text-[0.82rem] text-ink-3">
                {t(`stack.items.${itemKey}.note`)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="border-t border-ink-5 bg-white">
        <section id="timeline" className="mx-auto max-w-[1120px] px-8 py-20">
          <SectionHeading labelKey="label" namespace="hub.timeline" titleKey="title" />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {timelineConfig.map((week) => (
              <div
                key={week.key}
                className={`rounded-[20px] border-2 p-7 transition hover:-translate-y-[3px] hover:shadow-zam-md ${week.bgClass} ${week.borderClass}`}
              >
                <div className={`mb-2 font-display text-5xl font-extrabold leading-none ${week.accentClass}`}>
                  {t(`timeline.weeks.${week.key}.number`)}
                </div>
                <div className={`mb-4 text-xs font-bold uppercase tracking-[0.08em] ${week.accentClass}`}>
                  {t(`timeline.weeks.${week.key}.focus`)}
                </div>
                <p className={`mb-4 text-[0.82rem] ${week.accentClass}`}>
                  {t(`timeline.weeks.${week.key}.description`)}
                </p>
                <ul className="flex list-none flex-col gap-[0.45rem]">
                  {['one', 'two', 'three', 'four', 'five'].map((itemKey) => (
                    <li key={itemKey} className="flex items-start gap-2 text-[0.85rem] text-ink-3">
                      <span className={`mt-[0.05rem] shrink-0 font-bold ${week.accentClass}`}>✓</span>
                      <span>{t(`timeline.weeks.${week.key}.items.${itemKey}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="bg-ink px-8 py-10 text-center">
        <div className="mb-2 font-display text-2xl font-extrabold tracking-tight text-white">
          Zam<span className="text-zam-amber-400">Comm</span>
        </div>
        <p className="text-[0.85rem] text-ink-4">{t('footer.tagline')}</p>
        <p className="mt-1.5 text-[0.78rem] text-[#555]">{t('footer.question')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-[linear-gradient(135deg,#d4830a,#e89c1f)] px-5 py-2 text-[0.85rem] font-bold text-white shadow-[0_2px_8px_rgba(212,131,10,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(212,131,10,0.4)]"
          >
            <OpenAppIcon size={15} />
            <span>{t('footer.launchCustomerApp')}</span>
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-pill border border-zam-green-400 px-5 py-2 text-[0.85rem] font-semibold text-zam-green-100 transition hover:bg-white/10"
          >
            <AuthIcon size={14} />
            <span>{t('footer.previewAuth')}</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};
