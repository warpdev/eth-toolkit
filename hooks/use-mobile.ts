import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to detect if the current viewport is mobile-sized
 * - Optimized for React 19 and Server-Side Rendering
 * - Uses matchMedia for better performance
 * - Provides a default false value for SSR to avoid hydration issues
 *
 * @returns {boolean} Whether the current viewport is mobile-sized
 */
export function useIsMobile(): boolean {
  // Start with false for SSR to avoid hydration mismatches
  const [isMobile, setIsMobile] = useState(false);

  // Define memoized handler for media query changes
  const handleMediaQueryChange = useCallback((e: MediaQueryListEvent | MediaQueryList) => {
    setIsMobile(e.matches);
  }, []);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Create media query
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Set initial value
    handleMediaQueryChange(mediaQuery);

    // Add listener using standard event listener
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    // Clean up
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, [handleMediaQueryChange]);

  return isMobile;
}
