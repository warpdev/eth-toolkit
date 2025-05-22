'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { BOTTOM_NAVIGATION_ITEMS, isActiveNavItem } from '@/lib/config/navigation';
import type { NavigationItem } from '@/lib/config/navigation';

type BottomNavItemProps = {
  item?: NavigationItem;
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const BottomNavItem = React.memo(
  ({ item, icon, label, isActive, href, onClick, className }: BottomNavItemProps) => {
    const displayIcon = React.useMemo(() => {
      if (icon) return icon;
      if (item?.icon) {
        const IconComponent = item.icon;
        return <IconComponent size={20} />;
      }
      return null;
    }, [icon, item?.icon]);

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
          {displayIcon}
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

    const finalHref = href || item?.href;

    if (finalHref) {
      return (
        <Link href={finalHref} className="min-w-0 flex-1 touch-manipulation" aria-label={label}>
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
  }
);

BottomNavItem.displayName = 'BottomNavItem';

export const BottomNavigation = React.memo(() => {
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
        // Bottom padding for spacing
        'pb-4'
      )}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-screen-xl items-stretch">
        {BOTTOM_NAVIGATION_ITEMS.map((item) => (
          <BottomNavItem
            key={item.id}
            item={item}
            label={item.label}
            isActive={isActiveNavItem(pathname, item)}
          />
        ))}

        <BottomNavItem
          icon={<Menu size={20} />}
          label="Menu"
          onClick={toggleSidebar}
          className="relative"
        />
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

/**
 * Hook to provide bottom navigation spacing
 * Use this to add padding-bottom to main content when bottom nav is visible
 */
export const useBottomNavigation = () => {
  const isMobile = useIsMobile();

  return React.useMemo(
    () => ({
      isVisible: isMobile,
      spacingClass: isMobile ? 'pb-20' : '', // 5rem = 80px (16px nav height + 16px padding)
      spacing: isMobile ? 80 : 0, // 5rem = 80px
    }),
    [isMobile]
  );
};
