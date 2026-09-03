'use client';

import type {ReactNode} from 'react';
import type {IconType} from 'react-icons';

import {Button} from '@/src/components/ui/button';
import {cn} from '@/src/lib/cn';

/** Tailwind cannot build class names at runtime, so the column count is mapped. */
const navColumns: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5'
};

export type ShellNavItem<Id extends string> = {
  id: Id;
  label: string;
  Icon: IconType;
};

type AppShellProps<Id extends string> = {
  /** Sidebar identity: small eyebrow above the workspace name. */
  brand: {eyebrow: string; title: string};
  nav: ShellNavItem<Id>[];
  activeId: Id;
  onNavigate: (id: Id) => void;
  /** Sticky header content. `actions` sits on the right at every breakpoint. */
  header: {eyebrow: string; title: string; subtitle?: string; actions?: ReactNode};
  /** Rendered at the bottom of the desktop sidebar, e.g. a logout or cross-app link. */
  sidebarFooter?: ReactNode;
  /** Rendered outside the scroll area, e.g. a floating action button or drawer. */
  overlay?: ReactNode;
  children: ReactNode;
};

/**
 * The customer and merchant workspaces share one chrome: a desktop sidebar, a
 * sticky header, and a mobile bottom tab bar. Both previously hand-rolled it,
 * which is why their nav pills, headers, and spacing had drifted apart.
 *
 * Navigation switches a tab in local state rather than changing route, so these
 * are buttons in a `nav` landmark with `aria-current`, not links.
 */
export const AppShell = <Id extends string>({
  brand,
  nav,
  activeId,
  onNavigate,
  header,
  sidebarFooter,
  overlay,
  children
}: AppShellProps<Id>) => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
      <aside className="hidden border-r border-border/50 bg-card p-4 lg:flex lg:flex-col">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">{brand.eyebrow}</p>
          <p className="mt-0.5 truncate font-display text-lg font-semibold">{brand.title}</p>
        </div>

        <nav className="mt-6 grid gap-1" aria-label={`${brand.eyebrow} sections`}>
          {nav.map(({id, label, Icon}) => {
            const isActive = activeId === id;
            return (
              <Button
                key={id}
                type="button"
                variant={isActive ? 'secondary' : 'ghost'}
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn('h-10 justify-start gap-3', !isActive && 'text-muted-foreground')}
              >
                <Icon aria-hidden size={18} />
                {label}
              </Button>
            );
          })}
        </nav>

        {sidebarFooter ? <div className="mt-auto pt-6">{sidebarFooter}</div> : null}
      </aside>

      <section className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">{header.eyebrow}</p>
              <h1 className="truncate font-display text-xl font-semibold lg:text-2xl">{header.title}</h1>
              {header.subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{header.subtitle}</p>
              ) : null}
            </div>
            {header.actions ? <div className="flex shrink-0 items-center gap-2">{header.actions}</div> : null}
          </div>
        </header>

        {children}
      </section>

      {overlay}

      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 grid border-t border-border/50 bg-card/95 px-2 py-1.5 backdrop-blur lg:hidden',
          navColumns[nav.length] ?? 'grid-cols-4'
        )}
        aria-label={`${brand.eyebrow} tabs`}
      >
        {nav.map(({id, label, Icon}) => {
          const isActive = activeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'grid justify-items-center gap-0.5 rounded-md py-1.5 text-xs transition',
                'focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]',
                isActive ? 'font-medium text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon aria-hidden size={20} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  </main>
);
