import {cn} from '@/src/lib/cn';

import {formatKwacha} from '../../lib/commerceLogic';

type MoneyProps = {
  amount: number;
  /** Small uppercase caption above the figure, e.g. "Subtotal". */
  label?: string;
  emphasis?: 'default' | 'strong';
  className?: string;
};

/**
 * Renders a Kwacha amount with the shared micro-typography treatment, so every
 * price in the app agrees on weight, size, and how its caption is set.
 */
export const Money = ({amount, label, emphasis = 'default', className}: MoneyProps) => (
  <span className={cn('inline-flex flex-col gap-0.5', className)}>
    {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    <span className={cn('tabular-nums', emphasis === 'strong' ? 'text-base font-semibold' : 'text-sm font-medium')}>
      {formatKwacha(amount)}
    </span>
  </span>
);
