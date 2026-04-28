import '@/styles/global.css';

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';

import { SyncProvider } from '@/components/SyncProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { getSession } from '@/libs/services/auth';
import { AllLocales } from '@/utils/appConfig';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return AllLocales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);

  const [messages, session] = await Promise.all([getMessages(), getSession()]);

  return (
    <html lang={props.params.locale} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <NextIntlClientProvider
          locale={props.params.locale}
          messages={messages}
        >
          <AuthProvider initialUser={session}>
            <SyncProvider />
            {props.children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
