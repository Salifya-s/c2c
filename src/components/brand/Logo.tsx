import {useId} from 'react';

import {cn} from '@/src/lib/cn';

export const BRAND_NAME = 'Tantika';
export const BRAND_TAGLINE = 'Fast commerce. Happy clients.';

type LogoProps = {
  /** `full` renders the mark beside the wordmark; `mark` is the cart alone. */
  variant?: 'full' | 'mark';
  /** Inverts the wordmark for dark grounds such as the footer. */
  tone?: 'default' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  /** Shows "Fast commerce. Happy clients." beneath the wordmark. */
  withTagline?: boolean;
  className?: string;
};

const markSize = {sm: 'size-8', md: 'size-9', lg: 'size-12'} as const;
const wordSize = {sm: 'text-lg', md: 'text-xl', lg: 'text-3xl'} as const;

/**
 * The Tantika mark, drawn inline so it scales cleanly and can be recoloured
 * from tokens rather than shipped as a raster asset.
 *
 * This is the single place the logo is defined. Swapping in a supplied SVG or
 * an `next/image` means editing `TantikaMark` below; no call site changes.
 */
const TantikaMark = ({className}: {className?: string}) => {
  // useId keeps the gradient id unique when several logos share a page.
  const gradientId = useId();

  return (
    <svg viewBox="0 0 64 64" role="img" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-green)" />
          <stop offset="55%" stopColor="var(--brand-teal)" />
          <stop offset="100%" stopColor="var(--brand-blue)" />
        </linearGradient>
      </defs>

      {/* Open ring, broken on the left where the cart accelerates out of it. */}
      <path
        d="M15.6 16.6 A24 24 0 1 1 11.4 40.2"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Speed lines. */}
      <g stroke={`url(#${gradientId})`} strokeWidth="3.5" strokeLinecap="round">
        <line x1="6" y1="22.5" x2="17" y2="22.5" />
        <line x1="3.5" y1="30" x2="15" y2="30" />
        <line x1="6.5" y1="37.5" x2="16" y2="37.5" />
      </g>

      {/* Cart handle. */}
      <path
        d="M17.5 20.5h4.2l2.6 6.2"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Basket. */}
      <path
        d="M24.4 26.4h24.2a1.8 1.8 0 0 1 1.7 2.4l-3.6 10.6a2.6 2.6 0 0 1-2.5 1.8H29.6a2.6 2.6 0 0 1-2.5-1.8l-3.6-10.6a1.8 1.8 0 0 1 1.7-2.4Z"
        fill={`url(#${gradientId})`}
      />

      {/* Confirmation tick inside the basket. */}
      <path
        d="m31.5 32.8 3.7 3.8 7.4-7.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Wheels. */}
      <circle cx="32.5" cy="47.5" r="3.4" fill="var(--brand-blue)" />
      <circle cx="43.5" cy="47.5" r="3.4" fill="var(--brand-blue)" />
    </svg>
  );
};

export const Logo = ({
  variant = 'full',
  tone = 'default',
  size = 'md',
  withTagline = false,
  className
}: LogoProps) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <TantikaMark className={cn('shrink-0', markSize[size])} />

    {variant === 'full' ? (
      <span className="inline-flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-semibold lowercase tracking-tight',
            wordSize[size],
            tone === 'inverse' ? 'text-background' : 'text-brand-navy'
          )}
        >
          {/* Dotless i plus a green dot, matching the mark's accent. */}
          tant
          <span className="relative">
            &#305;
            <span
              aria-hidden
              className="absolute left-1/2 top-[-0.12em] size-[0.14em] -translate-x-1/2 rounded-full bg-brand-green"
            />
          </span>
          ka
        </span>
        {withTagline ? (
          <span className="mt-1 text-[0.62em] font-medium">
            <span className="text-brand-blue">Fast commerce.</span>{' '}
            <span className="text-brand-green">Happy clients.</span>
          </span>
        ) : null}
      </span>
    ) : null}

    <span className="sr-only">{BRAND_NAME}</span>
  </span>
);
