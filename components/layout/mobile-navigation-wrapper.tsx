'use client';

import * as React from 'react';
import { BottomNavigation, useBottomNavigation } from './bottom-navigation';
import { cn } from '@/lib/utils';

type NavigationWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wrapper component that provides proper spacing and layout for mobile navigation
 * Automatically adjusts content padding based on bottom navigation visibility
 */
export const MobileNavigationWrapper = React.memo(
  ({ children, className }: NavigationWrapperProps) => {
    const { spacingClass } = useBottomNavigation();

    return (
      <>
        <div
          className={cn(
            'min-h-screen w-full',
            // Add bottom padding when mobile navigation is visible
            spacingClass,
            className
          )}
        >
          {children}
        </div>
        <BottomNavigation />
      </>
    );
  }
);

MobileNavigationWrapper.displayName = 'MobileNavigationWrapper';

/**
 * Main content wrapper that handles safe areas and mobile spacing
 */
export const MainContentWrapper = React.memo(({ children, className }: NavigationWrapperProps) => {
  const { spacingClass } = useBottomNavigation();

  return (
    <main
      className={cn(
        'flex-1 overflow-auto',
        // Ensure content doesn't get hidden behind bottom navigation
        spacingClass,
        // Handle safe areas for modern devices
        'px-safe-area-inset-left pr-safe-area-inset-right',
        className
      )}
    >
      {children}
    </main>
  );
});

MainContentWrapper.displayName = 'MainContentWrapper';
