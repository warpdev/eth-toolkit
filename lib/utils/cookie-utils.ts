import Cookies from 'js-cookie';

/**
 * Cookie utility functions using js-cookie library
 * Provides type-safe cookie operations with sensible defaults
 */

interface CookieOptions {
  /** Days until cookie expires (default: 365) */
  expires?: number;
  /** Cookie domain */
  domain?: string;
  /** Cookie path (default: '/') */
  path?: string;
  /** Secure flag for HTTPS only */
  secure?: boolean;
  /** SameSite attribute (default: 'Lax') */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

const DEFAULT_OPTIONS: CookieOptions = {
  expires: 365,
  path: '/',
  sameSite: 'Lax',
};

/**
 * Set a cookie with the given name and value
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  Cookies.set(name, value, {
    expires: mergedOptions.expires,
    path: mergedOptions.path,
    domain: mergedOptions.domain,
    secure: mergedOptions.secure,
    sameSite: mergedOptions.sameSite,
  });
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

/**
 * Remove a cookie by name
 */
export function removeCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): void {
  Cookies.remove(name, {
    path: options.path || DEFAULT_OPTIONS.path,
    domain: options.domain,
  });
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  return Cookies.get();
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== undefined;
}

/**
 * Specific utility for storing network selection
 */
export function setSelectedNetwork(network: string): void {
  setCookie('selected-network', network);
}

/**
 * Specific utility for getting network selection
 */
export function getSelectedNetwork(): string | undefined {
  return getCookie('selected-network');
}
