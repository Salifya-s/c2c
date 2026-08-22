'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import { cn } from '@/src/lib/cn';

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
  type,
  ...props
}: InputFieldProps) => {
  const t = useTranslations(namespace);
  const label = t(labelKey);
  const placeholder = placeholderKey ? t(placeholderKey) : label;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className={cn('grid gap-1.5', className)}>
      <span className="text-[0.76rem] font-bold uppercase tracking-[0.08em] text-ink-3">
        {label}
      </span>
      <div className="relative flex items-center">
        <input
          type={effectiveType}
          className={cn(
            'w-full rounded-2xl border border-ink-5 bg-white px-4 py-3 text-[0.92rem] text-ink outline-none transition focus:border-zam-green-400 focus:ring-2 focus:ring-zam-green-100',
            isPassword && 'pr-11',
            inputClassName
          )}
          placeholder={placeholder}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
            className="absolute right-3.5 flex items-center justify-center text-ink-3 transition hover:text-ink focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </label>
  );
};
