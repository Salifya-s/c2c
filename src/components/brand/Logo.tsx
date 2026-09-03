import {cn} from '@/src/lib/cn';

export const BRAND_NAME = 'Tantika';
export const BRAND_TAGLINE = 'Fast commerce. Happy clients.';

/** The mark, exported so favicons, emails, and share images can reuse one path. */
export const BRAND_MARK_SRC = '/tantika-mark.svg';

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
 * The single place the brand lockup is assembled.
 *
 * The mark is the supplied artwork, served from `public/tantika-mark.svg` with
 * its background plate removed and the viewBox cropped to the cart, so it sits
 * on any ground. The wordmark is set in the display font rather than using the
 * artwork's traced letterforms, because a flat SVG cannot be recoloured and the
 * footer needs a light wordmark on navy.
 *
 * A plain `img` is used rather than `next/image`: the file is first-party, is
 * already vector, and `next/image` refuses SVG unless `dangerouslyAllowSVG` is
 * turned on, which is not worth enabling for one static asset.
 */
export const Logo = ({
  variant = 'full',
  tone = 'default',
  size = 'md',
  withTagline = false,
  className
}: LogoProps) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={BRAND_MARK_SRC} alt="" aria-hidden className={cn('shrink-0', markSize[size])} />

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
