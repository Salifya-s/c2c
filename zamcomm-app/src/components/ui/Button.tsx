'use client';

import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {useTranslations} from 'next-intl';

import {cn} from '@/src/lib/cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  labelKey?: string;
  namespace?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-zam-green-800 text-white hover:bg-zam-green-700',
  outline: 'border border-zam-green-800 bg-transparent text-zam-green-800 hover:bg-zam-green-50',
  ghost: 'border border-white/15 bg-white/10 text-zam-green-100 hover:bg-white/15'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'rounded-pill px-3.5 py-2 text-sm',
  md: 'rounded-pill px-5 py-2.5 text-sm',
  lg: 'rounded-pill px-6 py-3 text-base'
};

export const Button = ({
  children,
  className,
  icon,
  labelKey,
  namespace = 'common.actions',
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const t = useTranslations(namespace);
  const label = labelKey ? t(labelKey) : children;

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-sans font-semibold transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {label}
    </button>
  );
};
