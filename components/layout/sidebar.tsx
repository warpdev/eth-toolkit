'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EthereumIcon, GitHubIcon } from '@/components/shared/icons';
import { NAVIGATION_SECTIONS, isActiveNavItem } from '@/lib/config/navigation';
import type { NavigationItem } from '@/lib/config/navigation';

type MenuItemProps = {
  item: NavigationItem;
  isActive?: boolean;
};

const MenuItem = React.memo(({ item, isActive }: MenuItemProps) => {
  const IconComponent = item.icon;

  const content = (
    <>
      <span
        className={cn(
          'mr-3 scale-90 transition-colors duration-200 md:mr-2.5 md:scale-75',
          isActive ? 'text-foreground' : 'text-muted-foreground',
          'group-hover/menuitem:text-foreground'
        )}
      >
        <IconComponent size={18} />
      </span>
      <span className="text-base font-medium md:text-sm">{item.label}</span>
    </>
  );

  return (
    <SidebarMenuItem className="group/menuitem">
      <Link href={item.href} className="w-full">
        <SidebarMenuButton
          isActive={isActive}
          className={cn(
            'hover:bg-accent/50 w-full rounded-md transition-all',
            'min-h-[44px] py-3 md:min-h-auto md:py-2', // Better touch targets on mobile
            'touch-manipulation active:scale-95', // Touch feedback
            isActive ? 'bg-accent/40 font-medium' : 'bg-transparent'
          )}
        >
          {content}
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
});

MenuItem.displayName = 'MenuItem';

export const EnhancedSidebar = React.memo(() => {
  const pathname = usePathname();

  return (
    <Sidebar
      className="border-border/50 bg-sidebar/90 border-r backdrop-blur-md"
      collapsible="offcanvas"
    >
      <SidebarHeader className="py-4 md:py-3">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 px-4 transition-opacity hover:opacity-80 md:px-3"
          aria-label="Go to homepage"
        >
          <EthereumIcon className="text-primary h-5 w-5 md:h-4 md:w-4" />
          <h2 className="text-lg font-medium tracking-tight md:text-base">ETH Toolkit</h2>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="mb-3 px-3">
          <div className="bg-border/40 h-px w-full"></div>
        </div>

        {NAVIGATION_SECTIONS.map((section) => (
          <SidebarGroup key={section.id} className={section.id !== 'calldata' ? 'mt-2' : undefined}>
            <SidebarGroupLabel className="text-muted-foreground/70 px-3 text-xs font-medium tracking-wider uppercase">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="mt-1 space-y-0.5 px-2">
                {section.items.map((item) => (
                  <MenuItem key={item.id} item={item} isActive={isActiveNavItem(pathname, item)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="border-border/30 border-t p-2.5">
          <a
            href="https://github.com/warpdev/eth-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
          >
            <GitHubIcon className="h-4 w-4" />
            <span className="text-sm">GitHub</span>
          </a>
          <div className="flex items-center justify-between px-2">
            <span className="text-muted-foreground/70 text-[10px]">v0.1.0</span>
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

EnhancedSidebar.displayName = 'EnhancedSidebar';
