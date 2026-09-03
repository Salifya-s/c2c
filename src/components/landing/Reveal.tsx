'use client';

import type {ReactNode, Ref} from 'react';
import {useEffect, useRef} from 'react';

import {cn} from '@/src/lib/cn';

type RevealProps = {
  children: ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  /** Element to render, so the wrapper stays valid inside `ol`, `ul`, and figures. */
  as?: 'div' | 'li' | 'figure' | 'section';
  className?: string;
};

/**
 * Classes that hide the element while it waits to enter the viewport. Written as
 * literals so Tailwind's scanner still generates them.
 */
const ARMED_CLASSES = ['opacity-0', 'translate-y-4'];

/**
 * Reveals a section as it scrolls into view.
 *
 * Two deliberate choices, both fixing earlier problems:
 *
 * It transitions between two class states rather than firing a one-shot
 * `animate-in`. A one-shot animation only plays if its class lands at the right
 * moment in the element's life, which left reveals working reliably only after
 * a full page reload. A transition re-runs whenever the classes change.
 *
 * It arms the element by touching the DOM node instead of holding React state,
 * so scrolling never triggers a re-render, and the server output is never
 * hidden. Without JavaScript, or with `prefers-reduced-motion`, the page simply
 * renders complete and still.
 */
export const Reveal = ({children, delay = 0, as: Tag = 'div', className}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    node.classList.add(...ARMED_CLASSES);
    if (delay) node.style.transitionDelay = `${delay}ms`;

    const show = () => node.classList.remove(...ARMED_CLASSES);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          show();
          observer.disconnect();
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.05}
    );

    observer.observe(node);

    // Safety net: never leave a section invisible if the observer never fires.
    const failsafe = window.setTimeout(show, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
      show();
    };
  }, [delay]);

  return (
    <Tag
      ref={ref as Ref<never>}
      className={cn('transition-[opacity,transform] duration-700 ease-out', className)}
    >
      {children}
    </Tag>
  );
};
