'use client';

import type {InputHTMLAttributes} from 'react';
import {useTranslations} from 'next-intl';

import {cn} from '@/src/lib/cn';

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  inputClassName?: string;
  labelKey: string;
  namespace: string;
  placeholderKey?: string;
};

export const InputField = ({
  className,
  inputClassName,
  labelKey,
  namespace,
  placeholderKey,
  ...props
}: InputFieldProps) => {
  const t = useTranslations(namespace);
  const label = t(labelKey);
  const placeholder = placeholderKey ? t(placeholderKey) : label;

  return (
    <label className={cn('grid gap-1.5', className)}>
      <span className="text-[0.76rem] font-bold uppercase tracking-[0.08em] text-ink-3">
        {label}
      </span>
      <input
        className={cn(
          'w-full rounded-2xl border border-ink-5 bg-white px-4 py-3 text-[0.92rem] text-ink outline-none transition focus:border-zam-green-400 focus:ring-2 focus:ring-zam-green-100',
          inputClassName
        )}
        placeholder={placeholder}
        {...props}
      />
    </label>
  );
};
