'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getEscrowData, getEscrowLabels } from '@/data/hubData';
import { uiIcons } from '@/lib/iconography';

const flowIcons = [
  uiIcons.cart,
  uiIcons.payment,
  uiIcons.lock,
  uiIcons.package,
  uiIcons.motorcycle,
  uiIcons.shield,
  uiIcons.check,
];

export default function EscrowFlow() {
  const t = useTranslations('hub');
  const escrowData = useMemo(() => getEscrowData(t), [t]);
  const labels = useMemo(() => getEscrowLabels(t), [t]);
  const [currentStep, setCurrentStep] = useState(0);

  const activateEscrow = useCallback((index: number) => {
    setCurrentStep(index);
  }, []);

  const nextEscrow = useCallback(() => {
    setCurrentStep((previous) => (previous < flowIcons.length - 1 ? previous + 1 : 0));
  }, []);

  const prevEscrow = useCallback(() => {
    setCurrentStep((previous) => (previous > 0 ? previous - 1 : previous));
  }, []);

  return (
    <>
      <div className="mt-10 flex items-center overflow-x-auto py-4 scrollbar-hide">
        {flowIcons.map((Icon, index) => (
          <div key={labels[index]} className="contents">
            <div
              className="flex min-w-[120px] flex-1 cursor-pointer flex-col items-center transition-all duration-[250ms]"
              onClick={() => activateEscrow(index)}
            >
              <div
                className={`relative mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 text-[1.4rem] transition-all duration-300 ${
                  index <= currentStep
                    ? 'scale-[1.15] border-zam-green-400 bg-zam-green-600 shadow-[0_0_20px_rgba(45,186,114,0.3)]'
                    : 'border-white/15 bg-white/[0.06]'
                }`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div
                className={`text-center text-sm font-semibold transition-colors duration-300 ${
                  index <= currentStep ? 'text-zam-green-200' : 'text-white/40'
                }`}
              >
                {labels[index]}
              </div>
            </div>
            {index < flowIcons.length - 1 && (
              <div
                className={`relative h-0.5 max-w-[60px] min-w-[20px] flex-1 overflow-hidden ${
                  index < currentStep ? 'bg-zam-green-600' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div
        key={currentStep}
        className="mt-8 min-h-[80px] rounded-[20px] border border-white/10 bg-white/[0.06] p-6 animate-[fade-in_0.3s_ease-out]"
      >
        <div className="mb-1.5 text-[0.9rem] font-semibold text-zam-green-100">
          {escrowData[currentStep].title}
        </div>
        <div className="text-[0.85rem] text-white/55">{escrowData[currentStep].desc}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          className="rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 text-[0.875rem] font-semibold text-zam-green-100 transition-all duration-200 hover:bg-white/[0.14]"
          onClick={prevEscrow}
        >
          {t('escrowFlow.previous')}
        </button>
        <button
          className="rounded-full px-5 py-2.5 text-[0.875rem] font-semibold transition-all duration-200 hover:bg-[rgba(212,131,10,0.25)]"
          style={{
            background: 'rgba(212,131,10,.15)',
            border: '1px solid rgba(212,131,10,.3)',
            color: 'var(--color-zam-amber-200)',
          }}
          onClick={nextEscrow}
        >
          {t('escrowFlow.next')}
        </button>
      </div>
    </>
  );
}
