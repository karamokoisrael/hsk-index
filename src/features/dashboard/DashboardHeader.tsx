'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ActiveLink } from '@/components/ActiveLink';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from '@/features/auth/UserMenu';
import { Logo } from '@/components/templates/Logo';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

export const DashboardHeader = (props: {
  menu: {
    href: string;
    label: string;
  }[];
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const openHskModal = useFlashcardsStore(s => s.openHskModal);

  useEffect(() => { setIsMounted(true); }, []);

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/account" className="max-sm:hidden">
          <Logo />
        </Link>

        <svg
          className="size-8 stroke-muted-foreground max-sm:hidden"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path d="M17 5 7 19" />
        </svg>

        <nav className="max-lg:hidden">
          <ul className="flex flex-row items-center gap-x-3 text-lg font-medium [&_a:hover]:opacity-100 [&_a]:opacity-75">
            {props.menu.map(item => (
              <li key={item.href}>
                <ActiveLink href={item.href}>{item.label}</ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <ul className="flex items-center gap-x-1.5 [&_li[data-fade]:hover]:opacity-100 [&_li[data-fade]]:opacity-60">
          <li>
            {isMounted && (
              <Button variant="outline" size="sm" onClick={openHskModal}>
                HSK
                {' '}
                {hskLevel}
              </Button>
            )}
          </li>

          <li data-fade>
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToggleMenuButton />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {props.menu.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>

          <li data-fade>
            <LocaleSwitcher />
          </li>

          <li>
            <Separator orientation="vertical" className="h-4" />
          </li>

          <li>
            <UserMenu />
          </li>
        </ul>
      </div>
    </>
  );
};
