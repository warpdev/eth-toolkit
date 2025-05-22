'use client';

import * as React from 'react';
import { Code, Settings } from 'lucide-react';
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
import { siEthereum } from 'simple-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
};

const MenuItem = ({ icon, label, isActive, href, onClick }: MenuItemProps) => {
  const content = (
    <>
      <span
        className={cn(
          'mr-3 scale-90 transition-colors duration-200 md:mr-2.5 md:scale-75',
          isActive ? 'text-foreground' : 'text-muted-foreground',
          'group-hover/menuitem:text-foreground'
        )}
      >
        {icon}
      </span>
      <span className="text-base font-medium md:text-sm">{label}</span>
    </>
  );

  return (
    <SidebarMenuItem className="group/menuitem">
      {href ? (
        <Link href={href} className="w-full">
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
      ) : (
        <SidebarMenuButton
          isActive={isActive}
          className={cn(
            'hover:bg-accent/50 rounded-md transition-all',
            'min-h-[44px] py-3 md:min-h-auto md:py-2', // Better touch targets on mobile
            'touch-manipulation active:scale-95', // Touch feedback
            isActive ? 'bg-accent/40 font-medium' : 'bg-transparent'
          )}
          onClick={onClick}
        >
          {content}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
};

// Ethereum Icon component
const EthereumIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={siEthereum.path} />
  </svg>
);

export function EnhancedSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className="border-border/50 bg-sidebar/90 border-r backdrop-blur-md"
      collapsible="offcanvas"
    >
      <SidebarHeader className="py-4 md:py-3">
        <div className="flex items-center gap-2 px-4 md:px-3">
          <EthereumIcon className="text-primary h-5 w-5 md:h-4 md:w-4" />
          <h2 className="text-lg font-medium tracking-tight md:text-base">ETH Toolkit</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="mb-3 px-3">
          <div className="bg-border/40 h-px w-full"></div>
        </div>

        {/* Calldata Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 px-3 text-xs font-medium tracking-wider uppercase">
            Calldata
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 space-y-0.5 px-2">
              <MenuItem
                icon={<Code size={18} />}
                label="Calldata Decoder"
                isActive={pathname === '/calldata/decoder'}
                href="/calldata/decoder"
              />
              <MenuItem
                icon={<EthereumIcon className="h-[18px] w-[18px]" />}
                label="Calldata Encoder"
                isActive={pathname === '/calldata/encoder'}
                href="/calldata/encoder"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Section */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-muted-foreground/70 px-3 text-xs font-medium tracking-wider uppercase">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 space-y-0.5 px-2">
              <MenuItem icon={<Settings size={18} />} label="Settings" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="border-border/30 border-t p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/70 text-[10px]">v0.1.0</span>
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
