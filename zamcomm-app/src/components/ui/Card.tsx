import type {HTMLAttributes, ReactNode} from 'react';

import {cn} from '@/src/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const Card = ({children, className, ...props}: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-5 bg-white shadow-zam-sm transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
