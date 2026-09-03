import {cn} from '@/src/lib/cn';

type ProductThumbProps = {
  /** Tailwind gradient stops from the mock data, e.g. "from-amber-200 to-rose-300". */
  imageStyle: string;
  /** Sizing is the caller's concern - pass height and width utilities here. */
  className?: string;
  radius?: 'md' | 'lg' | 'full';
};

const radiusClass = {md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full'} as const;

/**
 * The single render path for placeholder product imagery.
 *
 * The gradient stops live in the mock data and are drawn from the brand ramps,
 * so tiles stay distinguishable from one another without competing with the
 * interface. Swap this for real product imagery when it exists.
 */
export const ProductThumb = ({imageStyle, className, radius = 'md'}: ProductThumbProps) => (
  <div className={cn('shrink-0 overflow-hidden border border-border/50 bg-muted', radiusClass[radius], className)}>
    <div className={cn('h-full w-full bg-gradient-to-br', imageStyle)} />
  </div>
);
