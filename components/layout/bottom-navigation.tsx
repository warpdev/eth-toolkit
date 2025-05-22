'use client';

import * as React from 'react';
import { Code, Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siEthereum } from 'simple-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

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

type BottomNavItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const BottomNavItem = ({ icon, label, isActive, href, onClick, className }: BottomNavItemProps) => {
  const content = (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2',
        'transition-all duration-200 ease-in-out',
        'touch-manipulation active:scale-95',
        isActive && 'text-primary',
        !isActive && 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center transition-transform duration-200',
          isActive && 'scale-110'
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'w-full truncate text-center text-[10px] leading-none font-medium',
          'transition-opacity duration-200',
          isActive ? 'opacity-100' : 'opacity-75'
        )}
      >
        {label}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="min-w-0 flex-1 touch-manipulation" aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="min-w-0 flex-1 touch-manipulation"
      aria-label={label}
      type="button"
    >
      {content}
    </button>
  );
};

export function BottomNavigation() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <nav
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50',
        'bg-background/80 border-border/50 border-t backdrop-blur-md',
        'supports-[backdrop-filter]:bg-background/60',
        // Safe area padding for devices with home indicator
        'pb-safe-area-inset-bottom'
      )}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-screen-xl items-stretch">
        <BottomNavItem
          icon={<Code size={20} />}
          label="Decoder"
          isActive={pathname === '/calldata/decoder'}
          href="/calldata/decoder"
        />

        <BottomNavItem
          icon={<EthereumIcon className="h-5 w-5" />}
          label="Encoder"
          isActive={pathname === '/calldata/encoder'}
          href="/calldata/encoder"
        />

        <BottomNavItem
          icon={<Settings size={20} />}
          label="Settings"
          isActive={pathname === '/settings'}
          href="/settings"
        />

        <BottomNavItem
          icon={<Menu size={20} />}
          label="Menu"
          onClick={toggleSidebar}
          className="relative"
        />
      </div>
    </nav>
  );
}

/**
 * Hook to provide bottom navigation spacing
 * Use this to add padding-bottom to main content when bottom nav is visible
 */
export function useBottomNavigation() {
  const isMobile = useIsMobile();

  return {
    isVisible: isMobile,
    spacingClass: isMobile ? 'pb-16 safe-area-pb' : '',
    spacing: isMobile ? 64 : 0, // 4rem = 64px
  };
}
