'use client';

import type {ReactNode, Ref} from 'react';
import {useEffect, useRef, useState} from 'react';

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
 * Reveals a section as it scrolls into view.
 *
 * Deliberately additive: content is rendered visible and the animation is only
 * layered on once the observer fires. Nothing is hidden behind `opacity-0`, so
 * the page stays readable with JavaScript disabled, and every animation class
 * sits behind `motion-safe:` so `prefers-reduced-motion` gets the page with no
 * movement at all.
 */
export const Reveal = ({children, delay = 0, as: Tag = 'div', className}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return;

    // Without IntersectionObserver the animation is simply skipped. Content is
    // never hidden, so the page stays complete rather than blank.
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      {rootMargin: '0px 0px -10% 0px', threshold: 0.05}
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <Tag
      ref={ref as Ref<never>}
      style={revealed && delay ? {animationDelay: `${delay}ms`} : undefined}
      className={cn(
        revealed &&
          'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 motion-safe:fill-mode-both',
        className
      )}
    >
      {children}
    </Tag>
  );
};
