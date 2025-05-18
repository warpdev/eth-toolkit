# React 19 vs React 18: Key Differences

This document outlines the major differences between React 18 and React 19 to help developers understand the changes and take advantage of new features in our project.

## Major New Features in React 19

### React Server Components
- Now fully stable in React 19 (previously in Canary channel)
- Renders components on server, reducing JavaScript sent to client
- Improves initial page load performance
- Enables data queries to start on server before page is sent to client
- Considered one of the biggest changes to React in 10 years

### Actions and Transitions
- New way to handle data mutations and state updates
- Async functions in transitions (called "Actions")
- Automatically handles pending states, errors, and optimistic updates
- Provides cleaner pattern for form submissions and data fetching

### Document Metadata Support
- Native rendering of `<title>`, `<link>`, and `<meta>` tags in components
- Automatically hoists them to the `<head>` of document
- Works with client-only apps, streaming SSR, and Server Components
- Simplifies SEO and document metadata management

### Resource Loading APIs
New APIs to optimize page loading:
- `prefetchDNS`: prefetches IP address of a DNS domain
- `preconnect`: connects to a server you expect to request from
- `preload`: fetches stylesheets, fonts, images, or scripts
- `preloadModule`: fetches ESM modules
- `preinit`: fetches/evaluates scripts or fetches/inserts stylesheets
- `preinitModule`: fetches/evaluates ESM modules

### Stylesheet Support
- Automatically hoists to `<head>` of document
- Controls loading order with precedence
- Loads stylesheets only when components using them are rendered
- Deduplicates stylesheets for multiple instances of same component

### Custom Elements Support
- Full compatibility with Web Components
- Passes all tests on Custom Elements Everywhere
- Properly handles props as properties rather than attributes

### New Hooks and APIs
- `use` hook: reads resources during render (accepts promises or Context)
- Refs can be used directly as props (no need for `forwardRef`)

### Suspense Improvements
- Faster display of fallbacks when components suspend
- "Pre-warms" lazy requests in suspended siblings after fallback commits

### Form Handling
- Form Actions for automatic form management
- Integration with `useFormStatus`
- Automatic form reset for uncontrolled components
- Manual reset with `requestFormReset` API

## Error Handling Improvements
- Removal of duplicate error messages
- Better options for handling caught and uncaught errors

## Breaking Changes and Migration

### UMD Builds Removed
- No more UMD builds to reduce complexity
- Use ESM-based CDNs like esm.sh for script tag loading

### JSX Transform Required
- New transform needed for ref as prop and JSX speed improvements
- Warning shown if outdated transform is used

### Deprecated APIs Removed
- `createFactory` API removed (use JSX instead)
- `react-test-render/shallow` removed (use testing libraries)

### StrictMode Changes
- `useMemo` and `useCallback` reuse results from first render during second render
- Double-invocation of ref callback functions on initial mount

## Performance Improvements
- Automatic concurrent rendering
- Fully integrated React Server Components
- No need for manual configurations 
- Faster loads and more seamless user interfaces

## Migration Approach
- React team published official React 19 Upgrade Guide
- Recommended to upgrade to React 18.3.1 first (has warnings for deprecated APIs)
- Then move to React 19

## Resources
- [Official React 19 Announcement](https://react.dev/blog/2024/12/05/react-19)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)