'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { uiIcons } from '@/lib/iconography';

const cardsByTab = {
  customer: ['storefront', 'ordering', 'checkout', 'tracking', 'profile', 'disputes'],
  seller: ['storefront', 'inventory', 'orders', 'support', 'wallet', 'analytics'],
  provider: ['booking', 'portfolio', 'milestone', 'categories'],
  admin: ['users', 'verification', 'disputes', 'analytics'],
};

export default function FeaturesTabs() {
  const t = useTranslations('hub.featuresTabs');
  const [activeTab, setActiveTab] = useState('customer');
  const tabNames = [
    { id: 'customer', label: t('tabs.customer'), icon: uiIcons.customer },
    { id: 'seller', label: t('tabs.seller'), icon: uiIcons.seller },
    { id: 'provider', label: t('tabs.provider'), icon: uiIcons.provider },
    { id: 'admin', label: t('tabs.admin'), icon: uiIcons.admin },
  ];

  return (
    <>
      <div className="my-8 flex w-fit flex-wrap gap-2 rounded-full border border-ink-5 bg-white p-1">
        {tabNames.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 rounded-full border-none px-5 py-2.5 text-[0.875rem] font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-zam-green-800 text-white'
                  : 'bg-transparent text-ink-3 hover:bg-zam-green-50 hover:text-zam-green-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cardsByTab[activeTab as keyof typeof cardsByTab].map((cardKey: string) => (
          <div
            key={`${activeTab}-${cardKey}`}
            className="rounded-xl border border-ink-5 bg-white p-5 shadow-[var(--shadow-zam-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-zam-md)]"
          >
            <span className={`mb-3 inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${t.raw(`cards.${activeTab}.${cardKey}.tagClass`)}`}>
              {t(`cards.${activeTab}.${cardKey}.tag`)}
            </span>
            <h3 className="mb-2 font-display text-lg font-bold text-ink">{t(`cards.${activeTab}.${cardKey}.title`)}</h3>
            <ul className="flex list-none flex-col gap-1">
              {['one', 'two', 'three', 'four'].map((bulletKey) => (
                <li key={bulletKey} className="flex items-start gap-2 text-[0.82rem] text-ink-3">
                  <span className="mt-px shrink-0 text-zam-green-400">→</span>
                  {t(`cards.${activeTab}.${cardKey}.bullets.${bulletKey}`)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
