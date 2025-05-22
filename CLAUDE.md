# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Ethereum Developer Toolkit - a web-based platform providing utility tools for Ethereum developers. The MVP focuses on developing a Calldata Encoder/Decoder to help Ethereum developers perform smart contract development and debugging tasks efficiently.

## Core Features

- **Calldata Decoder**: Decodes Ethereum transaction Calldata hex strings into human-readable format
- **Calldata Encoder**: Generates valid Calldata from smart contract function and parameters
- **Data Storage**: Saves frequently used Calldata or ABIs for reuse

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui
  - For React 19 features and migration from React 18, see @docs/react-19-vs-18.md
  - For Tailwind CSS v4 features and differences from v3, see @docs/tailwind-v4-vs-v3.md
  - For shadcn/ui components and best practices, see @docs/shadcn-guide.md
- **State Management**: jotai
- **Web3 Library**: viem
  - For viem usage and examples, see @docs/viem-guide.md
- **Local Storage**: IndexedDB (using idb library)
- **Deployment**: Vercel

## Common Commands

```bash
# Development server
pnpm dev         # Start development server

# Building
pnpm build       # Build for production
pnpm start       # Start production server

# Code quality
pnpm lint        # Run ESLint
pnpm type-check  # Run TypeScript type checking
pnpm format      # Format all files with Prettier
pnpm format:check # Check formatting without making changes
```

## Architecture Notes

### Data Flow

The application follows a layered architecture with atomic state management:

1. **User Input** → Jotai atoms (atomic state)
2. **Business Logic** → Custom hooks (orchestration layer)
3. **Processing** → Utility functions + viem (core logic)
4. **Storage** → IndexedDB API (persistence)
5. **UI Updates** → React components (presentation)

### Feature Architecture Pattern

Each feature follows a consistent structure:

- **`atoms/`**: Jotai atomic state (input, processing, result, UI state)
- **`hooks/`**: Business logic orchestration (useDecodeCalldata, useEncodeCalldata)
- **`components/`**: UI layer (forms, outputs, specialized displays)
- **`lib/`**: Feature-specific utilities

### State Management Strategy

Uses **atomic state design** with Jotai:

- **Input atoms**: `calldataAtom`, `abiStringAtom`, `selectedFunctionAtom`
- **Processing atoms**: `isDecodingAtom`, `decodeModeAtom`
- **Result atoms**: `decodedResultAtom`, `encodedCalldataAtom`
- **Data atoms**: `decodingHistoryAtom`, `savedAbisAtom`

Custom hooks coordinate multiple atoms and handle side effects, keeping components simple and focused on presentation.

### Error Handling Strategy

Consistent error handling across features:

- **Error normalization**: All errors converted to standard format
- **User-friendly messages**: Technical errors translated to helpful text
- **Graceful degradation**: Features work with partial data
- **Error boundaries**: Component-level error isolation

### Core Modules

- **Calldata Decoder**:

  - Function signature decoding (4bytes API integration)
  - Parameter decoding with/without ABI using viem
  - History tracking and ABI management

- **Calldata Encoder**:

  - Dynamic form generation based on ABI function types
  - Parameter encoding with type validation using viem
  - Real-time calldata generation

- **Storage Management**:
  - IndexedDB integration with proper indexing
  - CRUD operations for ABIs, signatures, and history
  - Automatic timestamp and favorites management

### Directory Structure

The project follows a feature-based organization:

- `/app`: Next.js app router pages and layouts
- `/components`: Shared UI components
  - `/layout`: Layout components (sidebar, header, etc.)
  - `/shared`: Reusable components across features
  - `/ui`: shadcn/ui components
- `/features`: Feature-specific code
  - `/calldata-decoder`: Calldata decoding functionality
  - `/calldata-encoder`: Calldata encoding functionality
- `/hooks`: Custom React hooks
- `/lib`: Utilities and shared logic
  - `/config`: Application configuration
  - `/storage`: IndexedDB storage implementation
  - `/types`: TypeScript types and interfaces
  - `/utils`: Utility functions
- `/providers`: React context providers

## Micro-Interactions

Micro-interactions are critical to our application's user experience. They provide instant feedback, guide users, and create a polished, responsive feel.

### Guidelines

1. **Immediate Feedback**: All user actions should have immediate visual response
2. **Subtle Animations**: Use subtle transitions when elements appear, change, or are removed
3. **Loading States**: Show appropriate loading indicators for any action taking >300ms
4. **Error States**: Provide clear visual and textual error indicators
5. **Success Confirmations**: Confirm successful actions with appropriate visual cues
6. **Focus States**: Ensure keyboard navigation has clear focus indicators

### Implementation

- Use shadcn/ui's built-in transition components
- Keep animations short (150-300ms) and purposeful
- Ensure all interactive elements have hover/active states
- Use toast notifications for operation results
- Implement skeleton loaders for content that requires loading

## Library Usage Guidelines (**IMPORTANT**)

When working with libraries from our Technology Stack:

1. Use the Context7 tools (`mcp__context7__resolve-library-id` and `mcp__context7__get-library-docs`) to retrieve up-to-date documentation
2. For example, to get viem documentation:
   ```
   mcp__context7__resolve-library-id with "viem"
   mcp__context7__get-library-docs with the returned library ID
   ```
3. Always check full documentation when implementing complex features
4. Add comments referencing official documentation for non-obvious usage patterns

## Local Storage Architecture

The application uses IndexedDB (via the `idb` library) for persistent local storage with the following stores:

- **`abis`**: Stores ABI JSON for saved contracts with metadata
- **`signature-history`**: Tracks user-selected function signatures for autocomplete
- **`decoding-history`**: Saves recent calldata decoding operations with results

### Storage Patterns

- **Automatic timestamping**: All records include created/updated timestamps
- **Indexing strategy**: Optimized for sorting by date and favorites
- **Type safety**: Full TypeScript integration with storage operations
- **Error resilience**: Graceful fallbacks when storage is unavailable
- **CRUD operations**: Standardized create, read, update, delete patterns

## Package Management

1. When installing new packages, update the Technology Stack section in this file immediately
2. Always document the purpose of newly added packages
3. Group related packages together in the Technology Stack section
4. Include links to official documentation when available

## Code Quality Guidelines

Next.js/React/TypeScript/TailwindCSS frontend code quality standards:

- Maximize TypeScript type safety (avoid 'any')
- Limit file/component size (files <300 lines, components <150 lines)
- Follow Single Responsibility Principle and modularization
- Optimize performance with memoization (useMemo, useCallback)
- State management: local(useState), global(Context/jotai), server(React Query/SWR)
- Maintain consistent naming and folder structure
- Minimize code duplication and handle errors properly

### Code Style (Prettier)

All code must follow these formatting rules:

```js
{
  "semi": true,        // Use semicolons at the end of statements
  "singleQuote": true, // Use single quotes for strings
  "tabWidth": 2,       // Use 2 spaces for indentation
  "trailingComma": "es5", // Add trailing commas where valid in ES5
  "printWidth": 100,   // Line length max 100 characters
  "bracketSameLine": false, // Closing brackets on new lines
  "jsxSingleQuote": false,  // Use double quotes in JSX
  "arrowParens": "always"   // Always include parentheses around arrow function parameters
}
```

Format code with:

```bash
pnpm format      # Format all files
pnpm format:check # Check formatting
```

**IMPORTANT**: Always run `pnpm format` before committing changes to ensure consistent code style across the codebase.

Detailed guide: @docs/code-quality-guidelines.md

## Code Commenting Guidelines

- Preserve JSDoc comments for documenting functions, components, parameters, return types, and usage examples
- For regular comments (non-JSDoc), use them primarily to explain 'why' code is needed, not 'what' it does
- Keep comments concise, up-to-date, and meaningful
