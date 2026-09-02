import type {ReactNode} from 'react';

import {Button} from '@/src/components/ui/button';
import {Card} from '@/src/components/ui/card';
import {cn} from '@/src/lib/cn';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  className?: string;
};

/** Shared empty/error placeholder for lists, carts, search results, and orders. */
export const EmptyState = ({icon, title, body, action, onAction, className}: EmptyStateProps) => (
  <Card className={cn('items-center gap-2 rounded-lg border-border/50 p-5 text-center shadow-none', className)}>
    <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="text-xs text-muted-foreground">{body}</p>
    {action ? (
      <Button type="button" variant="outline" size="sm" className="mt-1" onClick={onAction}>
        {action}
      </Button>
    ) : null}
  </Card>
);
