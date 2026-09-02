import type {ReactNode} from 'react';

import {Card} from '@/src/components/ui/card';
import {cn} from '@/src/lib/cn';

type MetricProps = {
  label: string;
  /** Accepts a node so status tiles can render a StatusBadge instead of raw text. */
  value: ReactNode;
  className?: string;
};

/**
 * Compact label/value tile. Replaces the three near-identical local components
 * previously named `Metric`, `Summary`, and `Info` across the commerce screens.
 */
export const Metric = ({label, value, className}: MetricProps) => (
  <Card className={cn('gap-1 rounded-lg border-border/50 p-3 shadow-none', className)}>
    <p className="text-xs text-muted-foreground">{label}</p>
    {typeof value === 'string' ? <p className="truncate text-sm font-semibold">{value}</p> : value}
  </Card>
);
