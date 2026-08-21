'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getDemoFlow } from '@/data/hubData';

export default function ChatDemo() {
  const t = useTranslations('hub');
  const demoFlow = getDemoFlow(t);
  const chatRef = useRef(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [quickBtns, setQuickBtns] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const demoStepRef = useRef(0);

  useEffect(() => {
    const first = demoFlow[0];
    const timer = setTimeout(() => {
      setMessages([{ type: 'bot', text: first.bot }]);
      setQuickBtns(first.quickBtns);
      demoStepRef.current = 1;
    }, 300);

    return () => clearTimeout(timer);
  }, [demoFlow]);

  const advanceDemo = useCallback((choice: any) => {
    const step = demoStepRef.current;
    if (step >= demoFlow.length) return;
    const current = demoFlow[step];

    if (current.user) {
      setMessages((prev) => [...prev, { type: 'user', text: choice || current.user }]);
    }

    setTimeout(() => {
      setMessages((prev) => {
        const next = [...prev, { type: 'bot', text: current.bot }];
        if (current.systemMsg) {
          setTimeout(() => {
            setMessages((previous) => [...previous, { type: 'system', text: current.systemMsg }]);
          }, 400);
        }
        return next;
      });
      setActiveStep(current.step);
      setQuickBtns(current.quickBtns || []);
    }, 400);

    demoStepRef.current = step + 1;
  }, [demoFlow]);

  const resetDemo = useCallback(() => {
    demoStepRef.current = 0;
    setMessages([]);
    setQuickBtns([]);
    setActiveStep(0);
    const first = demoFlow[0];
    setTimeout(() => {
      setMessages([{ type: 'bot', text: first.bot }]);
      setQuickBtns(first.quickBtns);
      demoStepRef.current = 1;
    }, 300);
  }, [demoFlow]);

  const steps = [
    { text: t('chatDemo.steps.openStore.title'), sub: t('chatDemo.steps.openStore.description') },
    { text: t('chatDemo.steps.availability.title'), sub: t('chatDemo.steps.availability.description') },
    { text: t('chatDemo.steps.placeOrder.title'), sub: t('chatDemo.steps.placeOrder.description') },
    { text: t('chatDemo.steps.checkout.title'), sub: t('chatDemo.steps.checkout.description') },
    { text: t('chatDemo.steps.confirmed.title'), sub: t('chatDemo.steps.confirmed.description') },
  ];

  return (
    <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="mb-6 text-base leading-relaxed text-ink-3">{t('chatDemo.intro')}</p>
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <div
              key={step.text}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border-[1.5px] bg-white p-3 transition-all duration-200 ${
                activeStep === index
                  ? 'border-zam-green-600 bg-zam-green-50'
                  : 'border-ink-5 hover:border-zam-green-200 hover:bg-zam-green-50'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  activeStep === index ? 'bg-zam-green-700 text-white' : 'bg-ink-5 text-ink-3'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="text-[0.875rem] font-medium text-ink-2">{step.text}</div>
                <div className="mt-0.5 text-[0.78rem] text-ink-4">{step.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-[#1a1a1a] shadow-[var(--shadow-zam-lg)]">
        <div className="flex items-center gap-3 bg-zam-green-800 px-5 py-3.5">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-zam-green-400 text-[0.9rem] font-bold text-white">
            MK
          </div>
          <div>
            <div className="text-[0.9rem] font-semibold text-white">{t('heroChat.vendorName')}</div>
            <div className="text-[0.72rem] text-zam-green-200">{t('chatDemo.status')}</div>
          </div>
        </div>

        <div
          ref={chatRef}
          className="flex min-h-[340px] max-h-[340px] flex-col gap-2.5 overflow-y-auto px-4 py-4 scrollbar-hide"
        >
          {messages.map((message, index) => {
            if (message.type === 'system') {
              return (
                <div
                  key={`${message.type}-${index}`}
                  className="animate-[fade-in_0.3s_ease-out] self-center rounded-full border px-3 py-1 text-xs"
                  style={{
                    background: 'rgba(212, 131, 10, 0.15)',
                    color: 'var(--color-zam-amber-400)',
                    borderColor: 'rgba(212,131,10,.3)',
                  }}
                >
                  {message.text}
                </div>
              );
            }

            return (
              <div
                key={`${message.type}-${index}`}
                className={`max-w-[85%] whitespace-pre-line rounded-[18px] px-3.5 py-2.5 text-[0.875rem] leading-normal animate-[msg-in_0.35s_ease-out] ${
                  message.type === 'bot'
                    ? 'self-start rounded-bl-[4px] bg-[#2c2c2c] text-[#e0e0e0]'
                    : 'self-end rounded-br-[4px] bg-zam-green-700 text-white'
                }`}
              >
                {message.text}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 bg-[#141414] px-4 py-2">
          {quickBtns.map((buttonLabel) => (
            <button
              key={buttonLabel}
              className="rounded-full border border-[#3a3a3a] bg-transparent px-3 py-1 text-[0.78rem] font-medium text-[#aaa] transition-all duration-200 hover:border-zam-green-400 hover:bg-[rgba(30,100,60,0.15)] hover:text-zam-green-400"
              onClick={() => advanceDemo(buttonLabel)}
            >
              {buttonLabel}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-[#111] px-4 py-3">
          <span className="flex-1 text-sm text-[#555]">{t('chatDemo.footerHint')}</span>
          <button
            className="ml-auto rounded-full border border-[#333] bg-transparent px-3 py-1 text-xs text-[#666] transition-all duration-200 hover:border-zam-amber-500 hover:text-zam-amber-400"
            onClick={resetDemo}
          >
            {t('chatDemo.restart')}
          </button>
        </div>
      </div>
    </div>
  );
}
