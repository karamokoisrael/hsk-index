import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSession } from '@/libs/Auth';
import { AppConfig } from '@/utils/AppConfig';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSession();

  if (session) {
    const isDefault = props.params.locale === AppConfig.defaultLocale;
    redirect(isDefault ? '/' : `/${props.params.locale}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to home
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {props.children}
      </div>
    </div>
  );
}
