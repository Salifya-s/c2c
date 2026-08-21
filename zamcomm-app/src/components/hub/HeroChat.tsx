'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getHeroResponses } from '@/data/hubData';
import { uiIcons } from '@/lib/iconography';

export default function HeroChat() {
  const t = useTranslations('hub');
  const heroResponses = useMemo(() => getHeroResponses(t), [t]);
  const quickActions = [
    { label: t('heroChat.actions.menu'), icon: uiIcons.storefront },
    { label: t('heroChat.actions.order'), icon: uiIcons.cart },
    { label: t('heroChat.actions.delivery'), icon: uiIcons.motorcycle },
  ];
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: t('heroChat.welcome'),
    },
  ]);

  const handleQuickButton = useCallback((text: string) => {
    setMessages((previous) => [...previous, { type: 'user', text }]);
    setTimeout(() => {
      const response = (heroResponses as Record<string, any>)[text]?.[0] || t('heroChat.fallback');
      setMessages((previous) => [...previous, { type: 'bot', text: response }]);
    }, 600);
  }, [heroResponses, t]);

  return (
    <div className="relative flex justify-center">
      <div className="w-[280px] rounded-[36px] bg-ink p-3 shadow-[var(--shadow-zam-lg),0_0_0_2px_var(--color-ink-2)]">
        <div className="overflow-hidden rounded-[26px] bg-[#1c1c1e]">
          <div className="flex items-center gap-3 bg-zam-green-800 px-4 py-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-zam-green-400 text-[0.85rem] font-bold text-white">
              MK
            </div>
            <div>
              <div className="text-[0.9rem] font-semibold text-white">{t('heroChat.vendorName')}</div>
              <div className="text-[0.72rem] text-zam-green-200">{t('heroChat.status')}</div>
            </div>
          </div>

          <div className="min-h-[280px] max-h-[280px] overflow-y-auto bg-[#1a1a1a] px-3 py-3 scrollbar-hide">
            <div className="flex flex-col gap-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.type}-${index}`}
                  className={`max-w-[85%] whitespace-pre-line rounded-[18px] px-3.5 py-2 text-sm leading-normal animate-[msg-in_0.3s_ease-out] ${
                    message.type === 'bot'
                      ? 'self-start rounded-bl-[4px] bg-[#2a2a2a] text-[#e8e8e8]'
                      : 'self-end rounded-br-[4px] bg-zam-green-700 text-white'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-[#111] px-3 py-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-1 rounded-full border border-zam-green-400 bg-transparent px-2.5 py-1 text-[0.7rem] font-medium text-zam-green-400 transition-all duration-200 hover:border-zam-green-700 hover:bg-zam-green-700 hover:text-white"
                  onClick={() => handleQuickButton(action.label)}
                >
                  <Icon size={12} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
