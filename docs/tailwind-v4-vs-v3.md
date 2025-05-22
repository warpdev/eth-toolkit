# Tailwind CSS v4 vs v3: Key Differences

This document outlines the major differences between Tailwind CSS v3 and v4 to help developers understand the changes and take advantage of new features in our project.

## Major Changes in Tailwind CSS v4

### New Oxide Engine

- Completely rebuilt engine written in TypeScript and Rust
- 3.5x faster for full builds, 8x faster for incremental builds
- Leverages parallel processing for significantly improved performance

### Modern Browser Requirements

- Requires Safari 16.4+, Chrome 111+, and Firefox 128+
- Uses modern CSS features like `@property` and `color-mix()`
- Not backward compatible with older browsers (use v3.4 for legacy support)

### CSS-First Configuration

- Configuration now uses standard CSS syntax instead of JavaScript
- Import with regular CSS `@import` statements (no more `@tailwind` directives)
- Simplifies learning curve by aligning with CSS standards

### Zero-Configuration Content Detection

- No longer requires manual `content` array configuration
- Automatically detects template files in your project
- Ignores files in `.gitignore` and binary file extensions
- Significantly simplifies project setup

### Native CSS Variables

- All design tokens available as CSS variables by default
- Easier integration with custom components or third-party libraries
- More flexible runtime value access using standard CSS

### Built-in Container Queries

- Container query support is now built into the core framework
- No need for the `@tailwindcss/container-queries` plugin
- Supports both standard (`@min-*`) and max-width (`@max-*`) container queries
- Can stack variants to define container query ranges

### 3D Transforms Support

- Native support for 3D transform properties:
  - Rotation: `rotate-x-*`, `rotate-y-*`, `rotate-z-*`
  - Scaling: `scale-z-*`
  - Translation: `translate-z-*`
  - Perspective: `perspective-*`, `perspective-origin-*`
  - Visibility: `backface-visible`, `backface-hidden`

### Color System Changes

- Uses OKLCH color space (perceptually uniform)
- Default border and divide colors no longer use gray-200
- Placeholder text now uses current text color at 50% opacity instead of gray-400

## Breaking Changes and Migration

### Removed and Renamed Utilities

- Utilities deprecated in v3 have been removed
- Default shadow, radius, and blur scales renamed for consistent naming
- Ensure every utility has a named value

### Gradient Behavior Changes

- Overriding part of a gradient with a variant no longer "resets" the entire gradient
- Color values are preserved in different states
- Use `via-none` explicitly to unset a three-stop gradient back to two-stop

### Container Utility Changes

- Container configuration options like `center` and `padding` removed
- Custom container styling now uses the `@utility` directive

### Preflight Modifications

- Placeholder text uses current color at 50% opacity (not gray-400)
- Buttons use `cursor: default` instead of `cursor: pointer`
- Added margin resets for `<dialog>` elements

## Migration Approach

- Use the official upgrade tool (requires Node.js 20+)
- Run in a new Git branch to easily compare changes
- Test thoroughly after migration
- For projects requiring legacy browser support, continue using v3.4 until support requirements change

## Resources

- [Official Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
