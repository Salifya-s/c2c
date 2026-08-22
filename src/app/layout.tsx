import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Jost } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import '@/src/app/globals.css';
import messages from '@/messages/en.json';

// Swap these initializers when the final brand fonts are chosen.
// next/font self-hosts the generated files, preloads them, and uses font-display: swap.
const aicosHeading = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-aicos-heading',
  // fallback: ['Arial', 'Helvetica', 'sans-serif']
});

const aicosBody = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-aicos-body',
  // fallback: ['Arial', 'Helvetica', 'sans-serif']
});

export const metadata: Metadata = {
  title: 'AICOS Zambia Commerce Prototype',
  description:
    'Working customer proof of concept for conversational commerce, escrow checkout, and order fulfilment tracking.'
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = async ({ children }: RootLayoutProps) => {
  const locale = await getLocale();
  const intlMessages = await getMessages();

  return (
    <html lang={locale} className={`${aicosHeading.variable} ${aicosBody.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={intlMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
