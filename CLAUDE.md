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
```

## Architecture Notes

### Data Flow

1. User input → React component state management
2. Encoding/decoding → Web3 library (viem)
3. Data storage → IndexedDB API
4. UI rendering → React component updates

### Core Modules

- **Calldata Decoder**:

  - Function signature decoding (4bytes API)
  - Parameter decoding with or without ABI

- **Calldata Encoder**:

  - Function signature and parameter encoding
  - Dynamic form generation based on types

- **Storage Management**:
  - IndexedDB integration
  - CRUD operations for saved items

### Code Organization Principles

1. Modular components with single responsibility
2. Clear separation of business logic and UI
3. TypeScript types and interfaces for all data
4. Reusable components and utility functions
5. State management via jotai atoms

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

## Library Usage Guidelines

When working with libraries from our Technology Stack:
1. Use the Context7 tools (`mcp__context7__resolve-library-id` and `mcp__context7__get-library-docs`) to retrieve up-to-date documentation
2. For example, to get viem documentation:
   ```
   mcp__context7__resolve-library-id with "viem"
   mcp__context7__get-library-docs with the returned library ID
   ```
3. Always check full documentation when implementing complex features
4. Add comments referencing official documentation for non-obvious usage patterns

## Package Management

1. When installing new packages, update the Technology Stack section in this file
2. Always document the purpose of newly added packages
3. Group related packages together in the Technology Stack section
4. Include links to official documentation when available
