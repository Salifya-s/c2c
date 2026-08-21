'use client';

import type {ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {FaArrowLeft} from 'react-icons/fa6';

import {cn} from '@/src/lib/cn';

type OverlaySheetProps = {
  children: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  namespace?: string;
  onClose: () => void;
  titleKey: string;
};

export const OverlaySheet = ({
  children,
  footer,
  isOpen,
  namespace,
  onClose,
  titleKey
}: OverlaySheetProps) => {
  const t = useTranslations(namespace);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/35">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col bg-ink-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-ink-5 bg-white px-4 py-3">
          <button
            aria-label={t('back')}
            type="button"
            className="text-zam-green-800"
            onClick={onClose}
          >
            <FaArrowLeft size={16} />
          </button>
          <div className="font-display text-lg font-bold text-ink">{t(titleKey)}</div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? <div className={cn('border-t border-ink-5 bg-white px-4 py-4')}>{footer}</div> : null}
      </div>
    </div>
  );
};
