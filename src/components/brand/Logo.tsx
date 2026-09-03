import {cn} from '@/src/lib/cn';

export const BRAND_NAME = 'Tantika';

type LogoProps = {
  /** `full` renders the mark beside the wordmark; `mark` is the monogram alone. */
  variant?: 'full' | 'mark';
  /** Use on dark grounds such as the footer and the auth marketing rail. */
  tone?: 'default' | 'inverse';
  size?: 'sm' | 'md';
  className?: string;
};

const markSize = {sm: 'size-8 text-xs', md: 'size-9 text-sm'} as const;
const wordSize = {sm: 'text-base', md: 'text-lg'} as const;

/**
 * The single place the brand mark is defined.
 *
 * This is a typographic placeholder built from the display font and the brand
 * tokens. To switch to real artwork, replace the monogram span below with an
 * `next/image` (or inline SVG) and leave every call site untouched - nothing
 * else in the app renders the logo directly.
 */
export const Logo = ({variant = 'full', tone = 'default', size = 'md', className}: LogoProps) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-md font-display font-semibold',
        markSize[size],
        tone === 'inverse' ? 'bg-background text-foreground' : 'bg-primary text-primary-foreground'
      )}
    >
      T
    </span>
    {variant === 'full' ? (
      <span className={cn('font-display font-semibold tracking-tight', wordSize[size])}>{BRAND_NAME}</span>
    ) : null}
    <span className="sr-only">{BRAND_NAME}</span>
  </span>
);
