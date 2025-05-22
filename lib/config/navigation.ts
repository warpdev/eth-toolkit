import { Code, Settings } from 'lucide-react';
import { EthereumIcon } from '@/components/shared/icons';

/**
 * Navigation configuration for the application
 * Centralized configuration for consistent navigation across components
 */

export type NavigationItem = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly isExternal?: boolean;
};

export type NavigationSection = {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavigationItem[];
};

/**
 * Main navigation sections
 */
export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    id: 'calldata',
    label: 'Calldata',
    items: [
      {
        id: 'decoder',
        label: 'Calldata Decoder',
        href: '/calldata/decoder',
        icon: Code,
      },
      {
        id: 'encoder',
        label: 'Calldata Encoder',
        href: '/calldata/encoder',
        icon: EthereumIcon,
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
] as const;

/**
 * Bottom navigation items (mobile)  
 * Flat structure for mobile bottom navigation
 */
export const BOTTOM_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'decoder',
    label: 'Decoder',
    href: '/calldata/decoder',
    icon: Code,
  },
  {
    id: 'encoder',
    label: 'Encoder',
    href: '/calldata/encoder',
    icon: EthereumIcon,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
] as const;

/**
 * Get navigation section by ID
 */
export const getNavigationSection = (id: string) => 
  NAVIGATION_SECTIONS.find(section => section.id === id);

/**
 * Get navigation item by ID
 */
export const getNavigationItem = (id: string): NavigationItem | undefined => {
  for (const section of NAVIGATION_SECTIONS) {
    const item = section.items.find(item => item.id === id);
    if (item) return item;
  }
  return undefined;
};

/**
 * Check if a path matches a navigation item
 */
export const isActiveNavItem = (pathname: string, item: NavigationItem): boolean => 
  pathname === item.href;