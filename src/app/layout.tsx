import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Jost } from 'next/font/google';

import '@/src/app/globals.css';

// Swap these initializers when the final brand fonts are chosen.
// next/font self-hosts the generated files, preloads them, and uses font-display: swap.
const aicosHeading = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-aicos-heading'
});

const aicosBody = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-aicos-body'
});

export const metadata: Metadata = {
  title: 'Tantika - Zambia Commerce Prototype',
  description:
    'Working customer proof of concept for conversational commerce, escrow checkout, and order fulfilment tracking.'
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    // Browser extensions (ad blockers, the Google Analytics opt-out add-on) add
    // attributes to <html> before React hydrates, which React reports as a
    // mismatch. suppressHydrationWarning applies to this element's own
    // attributes only, so genuine mismatches inside the app still surface.
    <html
      lang="en"
      className={`${aicosHeading.variable} ${aicosBody.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
