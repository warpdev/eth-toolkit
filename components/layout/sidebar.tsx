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
          'mr-2.5 scale-75 transition-colors duration-200',
          isActive ? 'text-foreground' : 'text-muted-foreground',
          'group-hover/menuitem:text-foreground'
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </>
  );

  return (
    <SidebarMenuItem className="group/menuitem">
      {href ? (
        <Link href={href} className="w-full">
          <SidebarMenuButton
            isActive={isActive}
            className={cn(
              'hover:bg-accent/50 transition-all rounded-md w-full',
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
            'hover:bg-accent/50 transition-all rounded-md',
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
    <Sidebar className="border-r border-border/50 bg-sidebar/90 backdrop-blur-md">
      <SidebarHeader className="py-3">
        <div className="flex items-center gap-2 px-3">
          <EthereumIcon className="h-4 w-4 text-primary" />
          <h2 className="font-medium text-base tracking-tight">ETH Toolkit</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="mb-3 px-3">
          <div className="h-px w-full bg-border/40"></div>
        </div>
        
        {/* Calldata Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            Calldata
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2 mt-1">
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
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider font-medium text-muted-foreground/70">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2 mt-1">
              <MenuItem 
                icon={<Settings size={18} />} 
                label="Settings" 
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="border-t border-border/30 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/70">v0.1.0</span>
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}