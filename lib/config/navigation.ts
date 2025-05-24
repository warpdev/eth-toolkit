import { TOOLS, getToolById, Tool } from './tools';

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
 * Convert Tool to NavigationItem
 */
const toolToNavItem = (tool: Tool): NavigationItem => ({
  id: tool.id,
  label: tool.title,
  href: tool.href,
  icon: tool.icon as React.ComponentType<{ size?: number; className?: string }>,
});

/**
 * Main navigation sections
 * Generated from tools configuration
 */
export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    id: 'calldata',
    label: 'Calldata',
    items: TOOLS.filter((tool) => tool.category === 'calldata' && tool.status === 'active').map(
      toolToNavItem
    ),
  },
  {
    id: 'transaction',
    label: 'Transaction',
    items: TOOLS.filter((tool) => tool.category === 'transaction' && tool.status === 'active').map(
      toolToNavItem
    ),
  },
] as const;

/**
 * Bottom navigation items (mobile)
 * Flat structure for mobile bottom navigation
 */
export const BOTTOM_NAVIGATION_ITEMS: readonly NavigationItem[] = ['decoder', 'encoder', 'analyzer']
  .map((id) => getToolById(id))
  .filter((tool): tool is Tool => tool !== undefined && tool.status === 'active')
  .map((tool) => ({
    id: tool.id,
    label: tool.title.split(' ')[1] || tool.title, // Use single word for mobile
    href: tool.href,
    icon: tool.icon as React.ComponentType<{ size?: number; className?: string }>,
  }));

/**
 * Get navigation section by ID
 */
export const getNavigationSection = (id: string) =>
  NAVIGATION_SECTIONS.find((section) => section.id === id);

/**
 * Get navigation item by ID
 */
export const getNavigationItem = (id: string): NavigationItem | undefined => {
  const tool = getToolById(id);
  return tool ? toolToNavItem(tool) : undefined;
};

/**
 * Check if a path matches a navigation item
 */
export const isActiveNavItem = (pathname: string, item: NavigationItem): boolean =>
  pathname === item.href;
