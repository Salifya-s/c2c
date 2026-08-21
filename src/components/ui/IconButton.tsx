'use client';

import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {useTranslations} from 'next-intl';

import {cn} from '@/src/lib/cn';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  labelKey: string;
  namespace?: string;
};

export const IconButton = ({
  className,
  icon,
  labelKey,
  namespace = 'common.actions',
  type = 'button',
  ...props
}: IconButtonProps) => {
  const t = useTranslations(namespace);
  const ariaLabel = t(labelKey);

  return (
    <button
      aria-label={ariaLabel}
      title={ariaLabel}
      type={type}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-6 text-ink-2 transition-colors hover:bg-zam-green-50 hover:text-zam-green-800',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
};
